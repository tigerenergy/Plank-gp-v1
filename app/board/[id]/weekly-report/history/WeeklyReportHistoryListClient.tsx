'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, CheckCircle2, FileText, Filter, X, GitCompare, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Board } from '@/types'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import { getWeeklyReportHistoryList, getWeeklyReportHistoryStats } from '@/app/actions/weekly-report-history-list'
import type { WeeklyReportHistoryStats } from '@/app/actions/weekly-report-history-list'

interface WeeklyReportHistoryListClientProps {
  board: Board
  initialReports: WeeklyReport[]
  currentPage: number
  limit: number
  filters: {
    userId?: string
    startDate?: string
    endDate?: string
  }
}

export function WeeklyReportHistoryListClient({
  board,
  initialReports,
  currentPage,
  limit,
  filters: initialFilters,
}: WeeklyReportHistoryListClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<WeeklyReportHistoryStats | null>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())

  // 통계 로드
  useEffect(() => {
    loadStats()
  }, [filters])

  const loadStats = async () => {
    try {
      const result = await getWeeklyReportHistoryStats({
        boardId: board.id,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('통계 로드 에러:', error)
    }
  }

  // 필터 적용
  const applyFilters = async () => {
    setIsLoading(true)
    try {
      const result = await getWeeklyReportHistoryList({
        boardId: board.id,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit,
        offset: 0,
      })
      if (result.success) {
        setReports(result.data || [])
        // URL 업데이트
        const params = new URLSearchParams()
        if (filters.userId) params.set('userId', filters.userId)
        if (filters.startDate) params.set('startDate', filters.startDate)
        if (filters.endDate) params.set('endDate', filters.endDate)
        window.history.pushState({}, '', `?${params.toString()}`)
      }
    } catch (error) {
      console.error('필터 적용 에러:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({})
    setShowFilters(false)
  }

  // 보고서 선택 토글
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) => {
      const next = new Set(prev)
      if (next.has(reportId)) {
        next.delete(reportId)
      } else {
        if (next.size < 4) {
          // 최대 4개까지만 선택 가능
          next.add(reportId)
        }
      }
      return next
    })
  }

  // 비교 페이지로 이동
  const handleCompare = () => {
    if (selectedReports.size < 2) return
    const reportIds = Array.from(selectedReports).join(',')
    window.location.href = `/board/${board.id}/weekly-report/compare?reports=${reportIds}`
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set())
    } else {
      const allIds = new Set(reports.slice(0, 4).map((r) => r.id))
      setSelectedReports(allIds)
    }
  }

  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href={`/board/${board.id}`}
                className='p-2 rounded-xl btn-ghost'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  {board.emoji || '📋'} {board.title} - 주간보고 히스토리
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  과거 주간보고를 확인하고 비교하세요
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Link
                href={`/board/${board.id}/weekly-report/search`}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                <Search className='w-4 h-4' />
                검색
              </Link>
              {selectedReports.size > 0 && (
                <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20'>
                  <span className='text-sm font-medium text-violet-600 dark:text-violet-400'>
                    {selectedReports.size}개 선택됨
                  </span>
                </div>
              )}
              {selectedReports.size >= 2 && (
                <button
                  onClick={handleCompare}
                  className='flex items-center gap-2 px-4 py-2 rounded-xl btn-primary'
                >
                  <GitCompare className='w-4 h-4' />
                  비교하기
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                <Filter className='w-4 h-4' />
                필터
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 통계 카드 */}
        {stats && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div className='card p-4'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>총 보고서</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{stats.total_reports}</div>
            </div>
            <div className='card p-4'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>총 작업 시간</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{stats.total_hours.toFixed(1)}시간</div>
            </div>
            <div className='card p-4'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>주간 평균</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{stats.avg_hours_per_week.toFixed(1)}시간</div>
            </div>
            <div className='card p-4'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>제출 완료</div>
              <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>{stats.submitted_count}</div>
            </div>
          </div>
        )}

        {/* 필터 패널 */}
        {showFilters && (
          <div className='card p-6 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-semibold text-[rgb(var(--foreground))]'>필터</h3>
              <button
                onClick={clearFilters}
                className='text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
              >
                초기화
              </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--foreground))] mb-2'>
                  시작일
                </label>
                <input
                  type='date'
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className='w-full px-4 py-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))]'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--foreground))] mb-2'>
                  종료일
                </label>
                <input
                  type='date'
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className='w-full px-4 py-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))]'
                />
              </div>
              <div className='flex items-end'>
                <button
                  onClick={applyFilters}
                  disabled={isLoading}
                  className='w-full px-4 py-2 rounded-xl btn-primary disabled:opacity-50'
                >
                  {isLoading ? '적용 중...' : '적용'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 주간보고 목록 */}
        {reports.length === 0 ? (
          <div className='card p-12 text-center'>
            <FileText className='w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
            <h3 className='text-lg font-medium text-[rgb(var(--foreground))] mb-2'>
              주간보고가 없습니다
            </h3>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mb-4'>
              아직 작성된 주간보고가 없습니다.
            </p>
            <Link
              href={`/board/${board.id}/weekly-report/new`}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary'
            >
              주간보고 작성하기
            </Link>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* 전체 선택 체크박스 */}
            {reports.length > 0 && (
              <div className='card p-4 flex items-center justify-between'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={selectedReports.size === reports.length && reports.length > 0}
                    onChange={toggleSelectAll}
                    className='w-4 h-4 rounded border-[rgb(var(--border))]'
                  />
                  <span className='text-sm font-medium text-[rgb(var(--foreground))]'>
                    전체 선택 ({selectedReports.size}/{reports.length})
                  </span>
                </label>
                {selectedReports.size >= 2 && (
                  <button
                    onClick={handleCompare}
                    className='flex items-center gap-2 px-4 py-2 rounded-xl btn-primary'
                  >
                    <GitCompare className='w-4 h-4' />
                    비교하기 ({selectedReports.size}개)
                  </button>
                )}
              </div>
            )}
            {reports.map((report) => {
              const reportUser = (report as any).user
              const reportBoard = (report as any).board
              const completedCount = Array.isArray(report.completed_cards) ? report.completed_cards.length : 0
              const inProgressCount = Array.isArray(report.in_progress_cards) ? report.in_progress_cards.length : 0

              const isSelected = selectedReports.has(report.id)

              return (
                <div
                  key={report.id}
                  className={`card p-5 h-44 hover:shadow-lg transition-all border-2 ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-transparent hover:border-violet-500/30'
                  } hover:scale-[1.02] flex flex-col relative`}
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  {/* 체크박스 */}
                  <div className='absolute top-4 right-4 z-10'>
                    <input
                      type='checkbox'
                      checked={isSelected}
                      onChange={() => toggleReportSelection(report.id)}
                      onClick={(e) => e.stopPropagation()}
                      className='w-5 h-5 rounded border-[rgb(var(--border))] cursor-pointer'
                    />
                  </div>

                  <Link
                    href={`/board/${board.id}/weekly-report/new?week=${report.week_start_date}`}
                    className='flex flex-col flex-1'
                  >
                  {/* 상단: 아바타 아이콘 */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md'>
                      <span className='text-xl font-bold text-white'>
                        {(reportUser?.username || reportUser?.email?.split('@')[0] || '익명')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      {report.status === 'submitted' ? (
                        <>
                          <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
                          <span className='text-xs text-[rgb(var(--muted-foreground))]'>제출 완료</span>
                        </>
                      ) : (
                        <>
                          <span className='w-1.5 h-1.5 bg-yellow-500 rounded-full' />
                          <span className='text-xs text-[rgb(var(--muted-foreground))]'>작성 중</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 제목 (이름 + 주간) */}
                  <h3 className='text-base font-bold text-[rgb(var(--foreground))] truncate mb-1'>
                    {reportUser?.username || reportUser?.email?.split('@')[0] || '익명'}
                  </h3>

                  {/* 주간 정보 */}
                  <div className='flex items-center gap-1.5 mb-auto'>
                    <Calendar className='w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]' />
                    <span className='text-sm text-[rgb(var(--muted-foreground))]'>
                      {format(new Date(report.week_start_date), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
                      {format(new Date(report.week_end_date), 'M월 d일', { locale: ko })}
                    </span>
                  </div>

                  {/* 하단: 통계 정보 */}
                  <div className='absolute bottom-4 left-5 right-5 flex items-center gap-3'>
                    <div className='flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 rounded-lg'>
                      <Clock className='w-3.5 h-3.5 text-violet-600 dark:text-violet-400' />
                      <span className='text-xs font-semibold text-violet-600 dark:text-violet-400'>
                        {report.total_hours || 0}시간
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]'>
                      <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
                      <span>{completedCount}</span>
                      <FileText className='w-3.5 h-3.5 text-blue-500 ml-1' />
                      <span>{inProgressCount}</span>
                    </div>
                  </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
