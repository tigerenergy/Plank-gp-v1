'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, CheckCircle2, TrendingUp, FileText, BarChart3, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import { generateWeeklyReportPDF, generateWeeklyReportCSV } from '@/app/lib/weekly-report-export'
import { WeeklyReportDetailModal } from '@/app/components/weekly-report/WeeklyReportDetailModal'
import { getAllWeeklyReports } from '@/app/actions/weekly-report'

interface WeeklyReportShareClientProps {
  reports: WeeklyReport[]
  selectedWeek?: string
}

interface PresenceUser {
  userId: string
  username: string
  email: string
  avatarUrl: string | null
  cursor?: {
    x: number
    y: number
  }
  click?: {
    x: number
    y: number
    timestamp: number
  }
}

export function WeeklyReportShareClient({
  reports: initialReports,
  selectedWeek,
}: WeeklyReportShareClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string; avatarUrl: string | null } | null>(null)
  const [remoteCursors, setRemoteCursors] = useState<Map<string, { x: number; y: number; username: string; avatarUrl: string | null }>>(new Map())
  const [remoteClicks, setRemoteClicks] = useState<Map<string, { x: number; y: number; username: string; timestamp: number }>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const loadCurrentUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentUser({
          id: profile.id,
          username: profile.username || profile.email?.split('@')[0] || '익명',
          email: profile.email || '',
          avatarUrl: profile.avatar_url,
        })
      }
    }

    loadCurrentUser()
  }, [])

  // 실시간 업데이트 및 Presence (모든 보드)
  useEffect(() => {
    const supabase = createClient()
    if (!currentUser) return

    const channelName = `weekly_reports:all:${selectedWeek || 'current'}`
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: currentUser.id,
          },
        },
      })
      // Postgres 변경사항 구독 (모든 보드)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_reports',
        },
        async (payload) => {
          console.log('📡 실시간 업데이트 이벤트:', payload.eventType, payload.new || payload.old)
          
          // 실시간 업데이트
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            try {
              // 업데이트된 보고서의 사용자 정보도 함께 가져오기
              const { data: updatedReport, error } = await supabase
                .from('weekly_reports')
                .select(`
                  *,
                  user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url),
                  board:boards!weekly_reports_board_id_fkey(id, title, emoji)
                `)
                .eq('id', payload.new.id)
                .single()

              if (error) {
                console.error('❌ 보고서 조회 에러:', error)
                return
              }

              if (updatedReport) {
                const weekStart = selectedWeek || getWeekOptions()[0]
                console.log('✅ 보고서 업데이트:', updatedReport.id, '주간:', updatedReport.week_start_date, '현재 주간:', weekStart)
                
                setReports((prev) => {
                  const existing = prev.find((r) => r.id === updatedReport.id)
                  if (existing) {
                    console.log('🔄 기존 보고서 업데이트')
                    return prev.map((r) => (r.id === updatedReport.id ? { ...updatedReport, user: updatedReport.user, board: updatedReport.board } as WeeklyReport : r))
                  } else {
                    // 현재 주간의 보고서만 추가
                    if (updatedReport.week_start_date === weekStart) {
                      console.log('➕ 새 보고서 추가')
                      return [...prev, { ...updatedReport, user: updatedReport.user, board: updatedReport.board } as WeeklyReport]
                    } else {
                      console.log('⏭️ 다른 주간 보고서이므로 추가하지 않음')
                      return prev
                    }
                  }
                })
              }
            } catch (error) {
              console.error('❌ 실시간 업데이트 처리 에러:', error)
            }
          } else if (payload.eventType === 'DELETE') {
            // 삭제된 보고서 제거
            console.log('🗑️ 보고서 삭제:', payload.old.id)
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      // Presence 구독
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser & { cursor?: { x: number; y: number }; click?: { x: number; y: number; timestamp: number } }>()
        const users: PresenceUser[] = []
        const cursors = new Map<string, { x: number; y: number; username: string; avatarUrl: string | null }>()
        const clicks = new Map<string, { x: number; y: number; username: string; timestamp: number }>()
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.userId && presence.userId !== currentUser.id) {
              users.push({
                userId: presence.userId,
                username: presence.username,
                email: presence.email,
                avatarUrl: presence.avatarUrl,
                cursor: presence.cursor,
                click: presence.click,
              })
              
              // 커서 위치 업데이트
              if (presence.cursor) {
                cursors.set(presence.userId, {
                  x: presence.cursor.x,
                  y: presence.cursor.y,
                  username: presence.username,
                  avatarUrl: presence.avatarUrl,
                })
              }
              
              // 클릭 위치 업데이트
              if (presence.click && Date.now() - presence.click.timestamp < 2000) {
                clicks.set(presence.userId, {
                  x: presence.click.x,
                  y: presence.click.y,
                  username: presence.username,
                  timestamp: presence.click.timestamp,
                })
              }
            }
          })
        })
        
        setPresenceUsers(users)
        setRemoteCursors(cursors)
        setRemoteClicks(clicks)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const newUsers = newPresences
          .map((p: any) => ({
            userId: p.userId,
            username: p.username,
            email: p.email,
            avatarUrl: p.avatarUrl,
            cursor: p.cursor,
            click: p.click,
          }))
          .filter((u: PresenceUser) => u.userId !== currentUser.id)
        setPresenceUsers((prev) => {
          const existing = prev.find((u) => u.userId === newUsers[0]?.userId)
          if (existing) return prev
          return [...prev, ...newUsers]
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.userId)
        setPresenceUsers((prev) => prev.filter((u) => !leftUserIds.includes(u.userId)))
        setRemoteCursors((prev) => {
          const next = new Map(prev)
          leftUserIds.forEach((id) => next.delete(id))
          return next
        })
        setRemoteClicks((prev) => {
          const next = new Map(prev)
          leftUserIds.forEach((id) => next.delete(id))
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ 실시간 업데이트 구독 성공')
          // Presence에 자신 등록
          await channel.track({
            userId: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
          })
          console.log('✅ Presence 등록 완료')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 실시간 업데이트 구독 실패:', status)
        } else {
          console.log('⏳ 구독 상태:', status)
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [selectedWeek, currentUser])

  // 마우스 이벤트 추적
  useEffect(() => {
    if (!currentUser || !containerRef.current) return

    const container = containerRef.current
    const supabase = createClient()
    const channelName = `weekly_reports:all:${selectedWeek || 'current'}`
    const channel = supabase.channel(channelName)
    
    let mouseMoveThrottle: NodeJS.Timeout | null = null

    // 마우스 이동 추적 (throttle 적용)
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveThrottle) return
      
      mouseMoveThrottle = setTimeout(() => {
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        channel.track({
          userId: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          cursor: { x, y },
        })
        mouseMoveThrottle = null
      }, 50) // 50ms마다 업데이트
    }

    // 클릭 이벤트 추적
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      channel.track({
        userId: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        cursor: { x, y },
        click: { x, y, timestamp: Date.now() },
      })
      
      // 클릭 애니메이션 표시
      setRemoteClicks((prev) => {
        const next = new Map(prev)
        next.set(currentUser.id, {
          x,
          y,
          username: currentUser.username,
          timestamp: Date.now(),
        })
        return next
      })
      
      // 2초 후 클릭 표시 제거
      setTimeout(() => {
        setRemoteClicks((prev) => {
          const next = new Map(prev)
          next.delete(currentUser.id)
          return next
        })
      }, 2000)
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    container.addEventListener('click', handleClick, { passive: true })

    return () => {
      if (mouseMoveThrottle) {
        clearTimeout(mouseMoveThrottle)
      }
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('click', handleClick)
    }
  }, [currentUser, selectedWeek])

  // 주간 계산
  const getWeekOptions = () => {
    const weeks: string[] = []
    const now = new Date()
    for (let i = 0; i < 8; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i * 7)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      date.setDate(diff)
      weeks.push(date.toISOString().split('T')[0])
    }
    return weeks
  }

  const weekOptions = getWeekOptions()
  const currentWeek = selectedWeek || weekOptions[0]

  // 현재 주간의 보고서만 필터링
  const currentWeekReports = reports.filter((r) => r.week_start_date === currentWeek)

  // 사용자별 그룹화
  const reportsByUser = new Map<string, WeeklyReport>()
  for (const report of currentWeekReports) {
    reportsByUser.set(report.user_id, report)
  }

  return (
    <div ref={containerRef} className='min-h-screen bg-[rgb(var(--background))] relative'>
      {/* 원격 커서 표시 */}
      {Array.from(remoteCursors.entries()).map(([userId, cursor]) => {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return null
        
        return (
          <div
            key={userId}
            className='fixed pointer-events-none z-50 transition-all duration-75 ease-linear'
            style={{
              left: `${containerRect.left + cursor.x}px`,
              top: `${containerRect.top + cursor.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 border-2 border-violet-500 rounded-full bg-violet-500/20' />
              <div className='px-2 py-1 bg-violet-500/90 text-white text-xs rounded-md font-medium whitespace-nowrap shadow-lg'>
                {cursor.username}
              </div>
            </div>
          </div>
        )
      })}
      
      {/* 원격 클릭 표시 */}
      {Array.from(remoteClicks.entries()).map(([userId, click]) => {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return null
        
        return (
          <div
            key={`click-${userId}-${click.timestamp}`}
            className='fixed pointer-events-none z-50'
            style={{
              left: `${containerRect.left + click.x}px`,
              top: `${containerRect.top + click.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className='relative'>
              <div className='absolute inset-0 w-8 h-8 border-2 border-violet-500 rounded-full animate-ping opacity-75' />
              <div className='relative w-8 h-8 border-2 border-violet-500 rounded-full bg-violet-500/30' />
            </div>
          </div>
        )
      })}

      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href='/'
                className='p-2 rounded-xl btn-ghost'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  주간보고 공유
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  팀원들의 주간보고를 한눈에 확인하세요
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {/* 현재 보고 있는 사용자 목록 */}
              {presenceUsers.length > 0 && (
                <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))]'>
                  <Users className='w-4 h-4 text-[rgb(var(--muted-foreground))]' />
                  <div className='flex items-center gap-1.5'>
                    {presenceUsers.slice(0, 3).map((user) => (
                      <div
                        key={user.userId}
                        className='w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold'
                        title={user.username}
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className='w-full h-full rounded-full object-cover' />
                        ) : (
                          user.username[0].toUpperCase()
                        )}
                      </div>
                    ))}
                    {presenceUsers.length > 3 && (
                      <span className='text-xs text-[rgb(var(--muted-foreground))] ml-1'>
                        +{presenceUsers.length - 3}
                      </span>
                    )}
                  </div>
                  <span className='text-xs text-[rgb(var(--muted-foreground))] ml-1'>
                    {presenceUsers.length}명이 보고 있음
                  </span>
                </div>
              )}
              <div className='relative group'>
                <button className='px-3 py-2 rounded-xl bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80 border border-[rgb(var(--border))] text-sm font-medium transition-colors flex items-center gap-2'>
                  <Download className='w-4 h-4' />
                  내보내기
                </button>
                <div className='absolute right-0 top-full mt-2 w-40 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50'>
                  <button
                    onClick={() => {
                      const weekStart = currentWeekReports[0]?.week_start_date || currentWeek
                      const weekEnd = currentWeekReports[0]?.week_end_date || new Date(new Date(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      generateWeeklyReportPDF(null, currentWeekReports, weekStart, weekEnd)
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-t-xl flex items-center gap-2'
                  >
                    <FileText className='w-4 h-4' />
                    PDF 다운로드
                  </button>
                  <button
                    onClick={() => {
                      const weekStart = currentWeekReports[0]?.week_start_date || currentWeek
                      const weekEnd = currentWeekReports[0]?.week_end_date || new Date(new Date(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      generateWeeklyReportCSV(null, currentWeekReports, weekStart, weekEnd)
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-b-xl flex items-center gap-2'
                  >
                    <Download className='w-4 h-4' />
                    CSV 다운로드
                  </button>
                </div>
              </div>
              <select
                value={currentWeek}
                onChange={(e) => {
                  window.location.href = `/weekly-report/share?week=${e.target.value}`
                }}
                className='px-3 py-2 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-sm'
              >
                {weekOptions.map((week) => {
                  const date = new Date(week)
                  const endDate = new Date(date)
                  endDate.setDate(date.getDate() + 6)
                  return (
                    <option key={week} value={week}>
                      {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~{' '}
                      {endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {currentWeekReports.length === 0 ? (
          <div className='card p-12 text-center'>
            <FileText className='w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
            <h3 className='text-lg font-medium text-[rgb(var(--foreground))] mb-2'>
              아직 제출된 주간보고가 없습니다
            </h3>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mb-4'>
              해당 주간에 제출된 주간보고가 없습니다.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {Array.from(reportsByUser.entries()).map(([userId, report]) => {
              const completedCount = report.completed_cards?.length || 0
              const inProgressCount = report.in_progress_cards?.length || 0
              const board = (report as any).board
              return (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report)
                    setIsDetailModalOpen(true)
                  }}
                  className='card p-5 h-44 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-violet-500/30 hover:scale-[1.02] flex flex-col relative'
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  {/* 상단: 아바타 아이콘 */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md'>
                      <span className='text-xl font-bold text-white'>
                        {((report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명')[0].toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* 제목 (이름) */}
                  <h3 className='text-base font-bold text-[rgb(var(--foreground))] truncate mb-1'>
                    {(report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명'}
                  </h3>

                  {/* 상태 */}
                  <div className='flex items-center gap-1.5 mb-4'>
                    {report.status === 'submitted' ? (
                      <>
                        <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
                        <span className='text-sm text-[rgb(var(--muted-foreground))]'>제출 완료</span>
                      </>
                    ) : (
                      <>
                        <span className='w-1.5 h-1.5 bg-yellow-500 rounded-full' />
                        <span className='text-sm text-[rgb(var(--muted-foreground))]'>작성 중</span>
                      </>
                    )}
                  </div>

                  {/* 하단: 통계 정보 */}
                  <div className='absolute bottom-4 left-5 right-5 flex items-center gap-3'>
                    <div className='flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 rounded-lg'>
                      <Clock className='w-3.5 h-3.5 text-violet-600 dark:text-violet-400' />
                      <span className='text-xs font-semibold text-violet-600 dark:text-violet-400'>{report.total_hours || 0}시간</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]'>
                      <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
                      <span>{completedCount}</span>
                      <TrendingUp className='w-3.5 h-3.5 text-blue-500 ml-1' />
                      <span>{inProgressCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 상세 보기 모달 */}
      <WeeklyReportDetailModal
        report={selectedReport}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedReport(null)
        }}
      />
    </div>
  )
}
