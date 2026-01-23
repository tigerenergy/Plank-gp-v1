'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Clock, CheckCircle2, Users, BarChart3, Download, FileText, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import type { Board } from '@/types'
import {
  getWeeklyHoursTrend,
  getCompletionTrend,
  getTeamHoursComparison,
  type WeeklyHoursTrend,
  type CompletionTrend,
  type TeamHoursComparison,
} from '@/app/actions/weekly-report-stats'
import { getTeamDashboardStats, type TeamDashboardStats } from '@/app/actions/team-dashboard'
import { generateStatsPDF, generateStatsCSV } from '@/app/lib/weekly-report-stats-export'

interface WeeklyReportStatsClientProps {
  board: Board
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316']

export function WeeklyReportStatsClient({ board }: WeeklyReportStatsClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hoursTrend, setHoursTrend] = useState<WeeklyHoursTrend[]>([])
  const [completionTrend, setCompletionTrend] = useState<CompletionTrend[]>([])
  const [teamComparison, setTeamComparison] = useState<TeamHoursComparison[]>([])
  const [teamDashboard, setTeamDashboard] = useState<TeamDashboardStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [board.id])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const [hoursResult, completionResult, teamResult, dashboardResult] = await Promise.all([
        getWeeklyHoursTrend(board.id, 8),
        getCompletionTrend(board.id, 8),
        getTeamHoursComparison(board.id, 8),
        getTeamDashboardStats(board.id, 8),
      ])

      if (hoursResult.success && hoursResult.data) {
        setHoursTrend(hoursResult.data)
      }
      if (completionResult.success && completionResult.data) {
        setCompletionTrend(completionResult.data)
      }
      if (teamResult.success && teamResult.data) {
        setTeamComparison(teamResult.data)
      }
      if (dashboardResult.success && dashboardResult.data) {
        setTeamDashboard(dashboardResult.data)
      }
    } catch (error) {
      console.error('통계 로드 에러:', error)
      toast.error('통계를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 차트 데이터 포맷팅
  const hoursChartData = hoursTrend.map((item) => ({
    name: `${new Date(item.week_start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`,
    시간: Number(item.total_hours.toFixed(2)),
    인원: item.user_count,
  }))

  const completionChartData = completionTrend.map((item) => ({
    name: `${new Date(item.week_start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`,
    완료: item.completed_count,
    진행중: item.in_progress_count,
  }))

  const teamChartData = teamComparison.map((item) => ({
    name: item.username || item.email.split('@')[0] || '익명',
    시간: Number(item.total_hours.toFixed(2)),
  }))

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[rgb(var(--background))] flex items-center justify-center'>
        <div className='animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link href={`/board/${board.id}/weekly-report/share`} className='p-2 rounded-xl btn-ghost'>
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  {board.emoji || '📋'} {board.title} - 주간보고 통계
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>팀의 주간보고 데이터를 시각화합니다</p>
              </div>
            </div>
            <div className='relative group'>
              <button className='px-3 py-2 rounded-xl bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80 border border-[rgb(var(--border))] text-sm font-medium transition-colors flex items-center gap-2'>
                <Download className='w-4 h-4' />
                내보내기
              </button>
              <div className='absolute right-0 top-full mt-2 w-40 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50'>
                <button
                  onClick={() => {
                    generateStatsPDF(board, hoursTrend, completionTrend, teamComparison)
                  }}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-t-xl flex items-center gap-2'
                >
                  <FileText className='w-4 h-4' />
                  PDF 다운로드
                </button>
                <button
                  onClick={() => {
                    generateStatsCSV(board, hoursTrend, completionTrend, teamComparison)
                  }}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-b-xl flex items-center gap-2'
                >
                  <Download className='w-4 h-4' />
                  CSV 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-6'>
          {/* 팀 전체 요약 카드 */}
          {teamDashboard && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <Users className='w-5 h-5 text-blue-500' />
                  <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>팀원 수</span>
                </div>
                <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{teamDashboard.totalMembers}명</div>
              </div>
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <FileText className='w-5 h-5 text-violet-500' />
                  <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>총 보고서</span>
                </div>
                <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{teamDashboard.totalReports}개</div>
              </div>
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <Clock className='w-5 h-5 text-violet-500' />
                  <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>총 작업 시간</span>
                </div>
                <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                  {teamDashboard.totalHours.toFixed(1)}시간
                </div>
              </div>
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <BarChart3 className='w-5 h-5 text-emerald-500' />
                  <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>인원당 평균</span>
                </div>
                <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                  {teamDashboard.avgHoursPerMember.toFixed(1)}시간
                </div>
              </div>
              <div className='card p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <TrendingUp className='w-5 h-5 text-blue-500' />
                  <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>주간 평균</span>
                </div>
                <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                  {teamDashboard.avgHoursPerWeek.toFixed(1)}시간
                </div>
              </div>
            </div>
          )}

          {/* 프로젝트 진행률 */}
          {teamDashboard && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <BarChart3 className='w-5 h-5 text-violet-500' />
                프로젝트 진행률
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
                  <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>전체 카드</div>
                  <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                    {teamDashboard.projectProgress.total_cards}개
                  </div>
                </div>
                <div className='p-4 bg-emerald-500/10 rounded-xl'>
                  <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>완료된 카드</div>
                  <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                    {teamDashboard.projectProgress.completed_cards}개
                  </div>
                </div>
                <div className='p-4 bg-blue-500/10 rounded-xl'>
                  <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>진행 중인 카드</div>
                  <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    {teamDashboard.projectProgress.in_progress_cards}개
                  </div>
                </div>
                <div className='p-4 bg-violet-500/10 rounded-xl'>
                  <div className='text-sm text-[rgb(var(--muted-foreground))] mb-1'>완료율</div>
                  <div className='text-2xl font-bold text-violet-600 dark:text-violet-400'>
                    {teamDashboard.projectProgress.completion_rate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 요약 카드 (기존) */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-2'>
                <Clock className='w-5 h-5 text-violet-500' />
                <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>총 작업 시간</span>
              </div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                {teamComparison.reduce((sum, item) => sum + item.total_hours, 0).toFixed(1)}시간
              </div>
            </div>
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-2'>
                <CheckCircle2 className='w-5 h-5 text-emerald-500' />
                <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>총 완료 작업</span>
              </div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>
                {completionTrend.reduce((sum, item) => sum + item.completed_count, 0)}개
              </div>
            </div>
            <div className='card p-6'>
              <div className='flex items-center gap-3 mb-2'>
                <Users className='w-5 h-5 text-blue-500' />
                <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>활성 팀원</span>
              </div>
              <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{teamComparison.length}명</div>
            </div>
          </div>

          {/* 주간별 작업 시간 추이 */}
          {hoursChartData.length > 0 && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-violet-500' />
                주간별 작업 시간 추이
              </h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={hoursChartData}>
                    <defs>
                      <linearGradient id='lineGradient' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#8b5cf6' stopOpacity={0.8} />
                        <stop offset='100%' stopColor='#8b5cf6' stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='rgb(var(--border))' opacity={0.5} />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'rgb(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='시간'
                      stroke='#8b5cf6'
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 완료된 작업 수 추이 */}
          {completionChartData.length > 0 && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-emerald-500' />
                완료된 작업 수 추이
              </h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={completionChartData}>
                    <defs>
                      <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#10b981' stopOpacity={1} />
                        <stop offset='100%' stopColor='#10b981' stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id='barGradient2' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#3b82f6' stopOpacity={1} />
                        <stop offset='100%' stopColor='#3b82f6' stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='rgb(var(--border))' opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'rgb(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey='완료' fill='url(#barGradient)' radius={[8, 8, 0, 0]} />
                    <Bar dataKey='진행중' fill='url(#barGradient2)' radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 팀원별 작업 시간 비교 */}
          {teamChartData.length > 0 && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5 text-blue-500' />
                팀원별 작업 시간 비교
              </h2>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={teamChartData} layout='vertical'>
                    <defs>
                      <linearGradient id='teamBarGradient' x1='0' y1='0' x2='1' y2='0'>
                        <stop offset='0%' stopColor='#8b5cf6' stopOpacity={1} />
                        <stop offset='100%' stopColor='#6366f1' stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='rgb(var(--border))' opacity={0.5} />
                    <XAxis
                      type='number'
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'rgb(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis
                      type='category'
                      dataKey='name'
                      tick={{ fontSize: 12, fill: 'rgb(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey='시간' fill='url(#teamBarGradient)' radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 멤버별 상세 통계 */}
          {teamDashboard && teamDashboard.memberStats.length > 0 && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5 text-blue-500' />
                멤버별 상세 통계
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-[rgb(var(--border))]'>
                      <th className='text-left py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>멤버</th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>총 작업 시간</th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>보고서 수</th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>주간 평균</th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>완료 작업</th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-[rgb(var(--foreground))]'>진행 중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamDashboard.memberStats.map((member) => (
                      <tr key={member.user_id} className='border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-colors'>
                        <td className='py-4 px-4'>
                          <div className='flex items-center gap-3'>
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt=''
                                className='w-8 h-8 rounded-full'
                                referrerPolicy='no-referrer'
                              />
                            ) : (
                              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center'>
                                <span className='text-xs font-bold text-white'>
                                  {(member.username || member.email.split('@')[0] || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className='text-sm font-medium text-[rgb(var(--foreground))]'>
                                {member.username || member.email.split('@')[0] || '익명'}
                              </div>
                              {member.last_report_date && (
                                <div className='text-xs text-[rgb(var(--muted-foreground))]'>
                                  마지막 보고: {new Date(member.last_report_date).toLocaleDateString('ko-KR')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='py-4 px-4 text-right'>
                          <span className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                            {member.total_hours.toFixed(1)}시간
                          </span>
                        </td>
                        <td className='py-4 px-4 text-right'>
                          <span className='text-sm text-[rgb(var(--foreground))]'>{member.report_count}개</span>
                        </td>
                        <td className='py-4 px-4 text-right'>
                          <span className='text-sm text-[rgb(var(--foreground))]'>
                            {member.avg_hours_per_week.toFixed(1)}시간
                          </span>
                        </td>
                        <td className='py-4 px-4 text-right'>
                          <span className='text-sm text-emerald-600 dark:text-emerald-400'>{member.completed_cards}개</span>
                        </td>
                        <td className='py-4 px-4 text-right'>
                          <span className='text-sm text-blue-600 dark:text-blue-400'>{member.in_progress_cards}개</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 최근 활동 */}
          {teamDashboard && teamDashboard.recentActivity.length > 0 && (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <Activity className='w-5 h-5 text-violet-500' />
                최근 활동
              </h2>
              <div className='space-y-3'>
                {teamDashboard.recentActivity.slice(0, 10).map((activity, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))] transition-colors'
                  >
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0'>
                      <span className='text-xs font-bold text-white'>
                        {(activity.username || activity.email.split('@')[0] || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-medium text-[rgb(var(--foreground))]'>
                        {activity.username || activity.email.split('@')[0] || '익명'}
                      </div>
                      <div className='text-xs text-[rgb(var(--muted-foreground))]'>{activity.description}</div>
                    </div>
                    <div className='text-xs text-[rgb(var(--muted-foreground))] whitespace-nowrap'>
                      {new Date(activity.date).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 데이터가 없을 때 */}
          {hoursChartData.length === 0 && completionChartData.length === 0 && teamChartData.length === 0 && (
            <div className='card p-12 text-center'>
              <BarChart3 className='w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
              <h3 className='text-lg font-medium text-[rgb(var(--foreground))] mb-2'>
                아직 통계 데이터가 없습니다
              </h3>
              <p className='text-sm text-[rgb(var(--muted-foreground))] mb-4'>
                주간보고를 제출하면 통계가 표시됩니다.
              </p>
              <Link
                href={`/board/${board.id}/weekly-report/share`}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm transition-colors'
              >
                주간보고 공유 페이지로 이동
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
