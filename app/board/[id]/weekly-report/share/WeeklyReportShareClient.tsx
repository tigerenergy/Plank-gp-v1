'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, CheckCircle2, TrendingUp, FileText, BarChart3, Download, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Board } from '@/types'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import { generateWeeklyReportPDF, generateWeeklyReportCSV } from '@/app/lib/weekly-report-export'
import { ReportHistoryModal } from '@/app/components/weekly-report/ReportHistoryModal'

interface WeeklyReportShareClientProps {
  board: Board
  reports: WeeklyReport[]
  selectedWeek?: string
}

export function WeeklyReportShareClient({
  board,
  reports: initialReports,
  selectedWeek,
}: WeeklyReportShareClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // 실시간 업데이트
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('weekly_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_reports',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          // 실시간 업데이트
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setReports((prev) => {
              const existing = prev.find((r) => r.id === payload.new.id)
              if (existing) {
                return prev.map((r) => (r.id === payload.new.id ? (payload.new as WeeklyReport) : r))
              } else {
                return [...prev, payload.new as WeeklyReport]
              }
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('실시간 업데이트 구독 성공')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('실시간 업데이트 구독 실패')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [board.id])

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
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link href={`/board/${board.id}`} className='p-2 rounded-xl btn-ghost'>
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  {board.emoji || '📋'} {board.title} - 주간보고 공유
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  팀원들의 주간보고를 한눈에 확인하세요
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
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
                      generateWeeklyReportPDF(board, currentWeekReports, weekStart, weekEnd)
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
                      generateWeeklyReportCSV(board, currentWeekReports, weekStart, weekEnd)
                    }}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-b-xl flex items-center gap-2'
                  >
                    <Download className='w-4 h-4' />
                    CSV 다운로드
                  </button>
                </div>
              </div>
              <Link
                href={`/board/${board.id}/weekly-report/stats`}
                className='px-3 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-medium transition-colors flex items-center gap-2'
              >
                <BarChart3 className='w-4 h-4' />
                통계
              </Link>
              <select
                value={currentWeek}
                onChange={(e) => {
                  window.location.href = `/board/${board.id}/weekly-report/share?week=${e.target.value}`
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
            <Link
              href={`/board/${board.id}/weekly-report/new`}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm transition-colors'
            >
              주간보고 작성하기
            </Link>
          </div>
        ) : (
          <div className='grid gap-6'>
            {Array.from(reportsByUser.entries()).map(([userId, report]) => (
              <div
                key={report.id}
                className='card p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-violet-500/20'
              >
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                      {((report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className='font-semibold text-[rgb(var(--foreground))]'>
                        {(report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명'}
                      </div>
                      <div className='text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1 mt-0.5'>
                        {report.status === 'submitted' ? (
                          <>
                            <span className='w-2 h-2 bg-emerald-500 rounded-full' />
                            <span>제출 완료</span>
                          </>
                        ) : (
                          <>
                            <span className='w-2 h-2 bg-yellow-500 rounded-full' />
                            <span>작성 중</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => {
                        setSelectedReportId(report.id)
                        setIsHistoryModalOpen(true)
                      }}
                      className='p-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors'
                      title='수정 이력 보기'
                    >
                      <History className='w-4 h-4 text-[rgb(var(--muted-foreground))]' />
                    </button>
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-lg'>
                      <Clock className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                      <span className='font-semibold text-violet-600 dark:text-violet-400'>{report.total_hours}시간</span>
                    </div>
                  </div>
                </div>

                {/* 완료된 작업 */}
                {report.completed_cards && report.completed_cards.length > 0 && (
                  <div className='mb-4'>
                    <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-2'>
                      <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                      완료된 작업 ({report.completed_cards.length}개)
                    </div>
                    <div className='space-y-2'>
                      {report.completed_cards.slice(0, 5).map((card: any, idx: number) => (
                        <div
                          key={idx}
                          className='p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20'
                        >
                          <div className='text-sm font-medium text-[rgb(var(--foreground))]'>{card.title}</div>
                          {card.list_title && (
                            <div className='text-xs text-[rgb(var(--muted-foreground))] mt-1'>{card.list_title}</div>
                          )}
                        </div>
                      ))}
                      {report.completed_cards.length > 5 && (
                        <div className='text-xs text-[rgb(var(--muted-foreground))] text-center'>
                          +{report.completed_cards.length - 5}개 더
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 진행 중인 작업 */}
                {report.in_progress_cards && report.in_progress_cards.length > 0 && (
                  <div>
                    <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-2'>
                      <TrendingUp className='w-4 h-4 text-blue-500' />
                      진행 중인 작업 ({report.in_progress_cards.length}개)
                    </div>
                    <div className='space-y-2'>
                      {report.in_progress_cards.slice(0, 5).map((card: any, idx: number) => {
                        const progress = card.user_input?.progress || card.auto_collected?.checklist_progress || 0
                        return (
                          <div
                            key={card.card_id || idx}
                            className='p-3 bg-blue-500/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <div className='text-sm font-medium text-[rgb(var(--foreground))] flex-1'>
                                {card.title}
                              </div>
                              <div className='flex items-center gap-2 text-xs ml-2'>
                                <span className='px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded'>
                                  {card.user_input?.status || '진행중'}
                                </span>
                              </div>
                            </div>
                            {/* 진척도 프로그레스 바 */}
                            <div className='mb-2'>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-[rgb(var(--muted-foreground))]'>진척도</span>
                                <span className='text-xs font-medium text-[rgb(var(--foreground))]'>{progress}%</span>
                              </div>
                              <div className='w-full h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300'
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                            {card.user_input?.description && (
                              <div className='text-xs text-[rgb(var(--muted-foreground))] mt-2 line-clamp-2'>
                                {card.user_input.description}
                              </div>
                            )}
                            {card.user_input?.issues && (
                              <div className='text-xs text-red-500 dark:text-red-400 mt-2 flex items-start gap-1'>
                                <span>⚠️</span>
                                <span>{card.user_input.issues}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {report.in_progress_cards.length > 5 && (
                        <div className='text-xs text-[rgb(var(--muted-foreground))] text-center py-2'>
                          +{report.in_progress_cards.length - 5}개 더
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 추가 메모 */}
                {report.notes && (
                  <div className='mt-4 p-3 bg-[rgb(var(--secondary))] rounded-lg'>
                    <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1'>추가 메모</div>
                    <div className='text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap'>{report.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 수정 이력 모달 */}
      {selectedReportId && (
        <ReportHistoryModal
          reportId={selectedReportId}
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false)
            setSelectedReportId(null)
          }}
        />
      )}
    </div>
  )
}
