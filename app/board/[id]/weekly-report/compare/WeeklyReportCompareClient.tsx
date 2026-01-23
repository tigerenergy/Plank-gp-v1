'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, CheckCircle2, FileText, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Board } from '@/types'
import type { WeeklyReport } from '@/app/actions/weekly-report'

interface WeeklyReportCompareClientProps {
  board: Board
  reports: WeeklyReport[]
}

export function WeeklyReportCompareClient({ board, reports }: WeeklyReportCompareClientProps) {
  const [selectedMetric, setSelectedMetric] = useState<'hours' | 'completed' | 'in_progress'>('hours')

  // 보고서 정렬 (최신순)
  const sortedReports = [...reports].sort((a, b) => {
    return new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
  })

  // 통계 계산
  const getReportStats = (report: WeeklyReport) => {
    const completedCount = Array.isArray(report.completed_cards) ? report.completed_cards.length : 0
    const inProgressCount = Array.isArray(report.in_progress_cards) ? report.in_progress_cards.length : 0
    const totalHours = Number(report.total_hours || 0)

    return {
      completedCount,
      inProgressCount,
      totalHours,
    }
  }

  // 변화율 계산
  const calculateChange = (current: number, previous: number): { value: number; percentage: number; trend: 'up' | 'down' | 'same' } => {
    if (previous === 0) {
      return { value: current, percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'same' }
    }
    const change = current - previous
    const percentage = (change / previous) * 100
    return {
      value: change,
      percentage: Math.abs(percentage),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
    }
  }

  // 비교 데이터 생성
  const comparisonData = sortedReports.map((report, index) => {
    const stats = getReportStats(report)
    const reportUser = (report as any).user

    let change: { value: number; percentage: number; trend: 'up' | 'down' | 'same' } | null = null
    if (index < sortedReports.length - 1) {
      const prevStats = getReportStats(sortedReports[index + 1])
      if (selectedMetric === 'hours') {
        change = calculateChange(stats.totalHours, prevStats.totalHours)
      } else if (selectedMetric === 'completed') {
        change = calculateChange(stats.completedCount, prevStats.completedCount)
      } else {
        change = calculateChange(stats.inProgressCount, prevStats.inProgressCount)
      }
    }

    return {
      report,
      stats,
      reportUser,
      change,
    }
  })

  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href={`/board/${board.id}/weekly-report/history`}
                className='p-2 rounded-xl btn-ghost'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  {board.emoji || '📋'} {board.title} - 주간보고 비교
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  {reports.length}개의 주간보고를 비교합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 비교 지표 선택 */}
        <div className='card p-4 mb-6'>
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-[rgb(var(--foreground))]'>비교 지표:</span>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setSelectedMetric('hours')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedMetric === 'hours'
                    ? 'bg-violet-500 text-white'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                }`}
              >
                <Clock className='w-4 h-4 inline mr-1.5' />
                작업 시간
              </button>
              <button
                onClick={() => setSelectedMetric('completed')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedMetric === 'completed'
                    ? 'bg-violet-500 text-white'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                }`}
              >
                <CheckCircle2 className='w-4 h-4 inline mr-1.5' />
                완료된 작업
              </button>
              <button
                onClick={() => setSelectedMetric('in_progress')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedMetric === 'in_progress'
                    ? 'bg-violet-500 text-white'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                }`}
              >
                <FileText className='w-4 h-4 inline mr-1.5' />
                진행 중인 작업
              </button>
            </div>
          </div>
        </div>

        {/* 비교 테이블 */}
        <div className='card p-6 overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-[rgb(var(--border))]'>
                <th className='text-left py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>주간</th>
                <th className='text-left py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>작성자</th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>작업 시간</th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>완료된 작업</th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>진행 중인 작업</th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>상태</th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>변화</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => {
                const { report, stats, reportUser, change } = item
                const userName = reportUser?.username || reportUser?.email?.split('@')[0] || '익명'

                // 선택된 지표에 따른 값
                const metricValue =
                  selectedMetric === 'hours'
                    ? stats.totalHours
                    : selectedMetric === 'completed'
                    ? stats.completedCount
                    : stats.inProgressCount

                return (
                  <tr
                    key={report.id}
                    className='border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-colors'
                  >
                    <td className='py-4 px-4'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-[rgb(var(--muted-foreground))]' />
                        <div className='text-sm'>
                          <div className='font-medium text-[rgb(var(--foreground))]'>
                            {format(new Date(report.week_start_date), 'yyyy년 M월 d일', { locale: ko })}
                          </div>
                          <div className='text-xs text-[rgb(var(--muted-foreground))]'>
                            ~ {format(new Date(report.week_end_date), 'M월 d일', { locale: ko })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center'>
                          <span className='text-xs font-bold text-white'>
                            {userName[0].toUpperCase()}
                          </span>
                        </div>
                        <span className='text-sm font-medium text-[rgb(var(--foreground))]'>{userName}</span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Clock className='w-4 h-4 text-violet-500' />
                        <span className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                          {stats.totalHours.toFixed(1)}시간
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                        <span className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                          {stats.completedCount}개
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <FileText className='w-4 h-4 text-blue-500' />
                        <span className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                          {stats.inProgressCount}개
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-center'>
                      {report.status === 'submitted' ? (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium'>
                          <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
                          제출 완료
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium'>
                          <span className='w-1.5 h-1.5 bg-yellow-500 rounded-full' />
                          작성 중
                        </span>
                      )}
                    </td>
                    <td className='py-4 px-4 text-center'>
                      {change && index < sortedReports.length - 1 ? (
                        <div className='flex items-center justify-center gap-1'>
                          {change.trend === 'up' ? (
                            <>
                              <TrendingUp className='w-4 h-4 text-emerald-500' />
                              <span className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                                +{change.percentage.toFixed(1)}%
                              </span>
                            </>
                          ) : change.trend === 'down' ? (
                            <>
                              <TrendingDown className='w-4 h-4 text-red-500' />
                              <span className='text-sm font-semibold text-red-600 dark:text-red-400'>
                                -{change.percentage.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className='w-4 h-4 text-[rgb(var(--muted-foreground))]' />
                              <span className='text-sm text-[rgb(var(--muted-foreground))]'>변화 없음</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className='text-sm text-[rgb(var(--muted-foreground))]'>-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 차트 영역 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          {/* 작업 시간 추이 */}
          <div className='card p-6'>
            <h3 className='text-base font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
              <Clock className='w-5 h-5 text-violet-500' />
              작업 시간 추이
            </h3>
            <div className='space-y-3'>
              {comparisonData.map((item, index) => {
                const maxHours = Math.max(...comparisonData.map((d) => d.stats.totalHours))
                const percentage = maxHours > 0 ? (item.stats.totalHours / maxHours) * 100 : 0

                return (
                  <div key={item.report.id} className='space-y-1'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-[rgb(var(--muted-foreground))]'>
                        {format(new Date(item.report.week_start_date), 'M월 d일', { locale: ko })}
                      </span>
                      <span className='font-semibold text-[rgb(var(--foreground))]'>
                        {item.stats.totalHours.toFixed(1)}시간
                      </span>
                    </div>
                    <div className='h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 완료된 작업 추이 */}
          <div className='card p-6'>
            <h3 className='text-base font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-emerald-500' />
              완료된 작업 추이
            </h3>
            <div className='space-y-3'>
              {comparisonData.map((item) => {
                const maxCompleted = Math.max(...comparisonData.map((d) => d.stats.completedCount))
                const percentage = maxCompleted > 0 ? (item.stats.completedCount / maxCompleted) * 100 : 0

                return (
                  <div key={item.report.id} className='space-y-1'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-[rgb(var(--muted-foreground))]'>
                        {format(new Date(item.report.week_start_date), 'M월 d일', { locale: ko })}
                      </span>
                      <span className='font-semibold text-[rgb(var(--foreground))]'>
                        {item.stats.completedCount}개
                      </span>
                    </div>
                    <div className='h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className='card p-6 mt-6'>
          <h3 className='text-base font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
            <BarChart3 className='w-5 h-5 text-violet-500' />
            요약 통계
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>평균 작업 시간</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                {(comparisonData.reduce((sum, d) => sum + d.stats.totalHours, 0) / comparisonData.length).toFixed(1)}시간
              </div>
            </div>
            <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>평균 완료 작업</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                {Math.round(comparisonData.reduce((sum, d) => sum + d.stats.completedCount, 0) / comparisonData.length)}개
              </div>
            </div>
            <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
              <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>총 작업 시간</div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                {comparisonData.reduce((sum, d) => sum + d.stats.totalHours, 0).toFixed(1)}시간
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
