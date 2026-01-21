'use client'

// 🚀 React Compiler + Zustand: useState/useCallback 최소화
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Users, 
  TrendingUp,
  Download,
  FileText
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'sonner'
import type { Board } from '@/types'
import { useCompletedStore } from '@/store/useCompletedStore'
import { 
  getCompletedCards, 
  getCompletionStats, 
  type PeriodFilter 
} from '@/app/actions/completed'

interface CompletedPageClientProps {
  board: Board
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

export function CompletedPageClient({ board }: CompletedPageClientProps) {
  // Zustand 스토어에서 상태 가져오기
  const {
    period,
    cards,
    stats,
    isLoading,
    selectedCards,
    // 액션
    setPeriod,
    setCards,
    setStats,
    setIsLoading,
    toggleSelectAll,
    toggleSelect,
    resetAll,
  } = useCompletedStore()

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cardsResult, statsResult] = await Promise.all([
        getCompletedCards(board.id, period),
        getCompletionStats(board.id),
      ])

      if (cardsResult.success && cardsResult.data) {
        setCards(cardsResult.data)
      } else {
        console.error('완료된 카드 조회 실패:', cardsResult.error)
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      } else {
        console.error('통계 조회 실패:', statsResult.error)
      }
    } catch (error) {
      console.error('데이터 로드 에러:', error)
      toast.error('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 & period 변경 시 데이터 로드
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.id, period])

  // 컴포넌트 언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      resetAll()
    }
  }, [resetAll])


  // CSV 다운로드
  const downloadCSV = () => {
    const targetCards = selectedCards.size > 0 
      ? cards.filter((c) => selectedCards.has(c.id))
      : cards

    const header = '제목,설명,리스트,완료일,완료자\n'
    const rows = targetCards.map((c) => {
      const completedAt = c.completed_at 
        ? new Date(c.completed_at).toLocaleDateString('ko-KR')
        : ''
      const completerName = c.completer?.username || c.completer?.email || ''
      return `"${c.title}","${c.description || ''}","${c.list_title || ''}","${completedAt}","${completerName}"`
    }).join('\n')

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${board.title}_완료된작업_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 주간 차트 데이터 포맷
  const weeklyChartData = stats?.byWeek.map((w) => ({
    name: new Date(w.week).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    완료: w.count,
  })) || []

  // 멤버별 차트 데이터
  const memberChartData = stats?.byMember.slice(0, 5).map((m) => ({
    name: m.profile.username || m.profile.email?.split('@')[0] || '익명',
    value: m.count,
  })) || []

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
                  {board.emoji || '📋'} {board.title}
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>완료된 작업들</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className='flex items-center gap-2'>
              <button
                onClick={downloadCSV}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                <Download className='w-4 h-4' />
                <span className='hidden sm:inline'>CSV</span>
              </button>
              <Link
                href={`/board/${board.id}/weekly-report/share`}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                <FileText className='w-4 h-4' />
                <span className='hidden sm:inline'>주간보고 공유</span>
              </Link>
              <Link
                href={`/board/${board.id}/weekly-report/new`}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-colors'
              >
                <FileText className='w-4 h-4' />
                <span className='hidden sm:inline'>주간보고 작성</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='space-y-8 animate-pulse'>
            {/* 통계 카드 스켈레톤 */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='card p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-8 h-8 rounded-lg bg-[rgb(var(--secondary))]' />
                    <div className='h-4 w-16 rounded bg-[rgb(var(--secondary))]' />
                  </div>
                  <div className='h-8 w-12 rounded bg-[rgb(var(--secondary))] mb-2' />
                  <div className='h-3 w-20 rounded bg-[rgb(var(--secondary))]' />
                </div>
              ))}
            </div>

            {/* 차트 스켈레톤 */}
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='card p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-lg bg-[rgb(var(--secondary))]' />
                  <div className='h-4 w-24 rounded bg-[rgb(var(--secondary))]' />
                </div>
                <div className='h-72 bg-[rgb(var(--secondary))] rounded-xl' />
              </div>
              <div className='card p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <div className='w-8 h-8 rounded-lg bg-[rgb(var(--secondary))]' />
                  <div className='h-4 w-28 rounded bg-[rgb(var(--secondary))]' />
                </div>
                <div className='h-72 flex items-center justify-center'>
                  <div className='w-48 h-48 rounded-full bg-[rgb(var(--secondary))]' />
                </div>
              </div>
            </div>

            {/* 카드 목록 스켈레톤 */}
            <div className='card'>
              <div className='p-4 border-b border-[rgb(var(--border))] flex items-center gap-4'>
                <div className='h-4 w-12 rounded bg-[rgb(var(--secondary))]' />
                <div className='flex gap-2'>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className='h-8 w-16 rounded-lg bg-[rgb(var(--secondary))]' />
                  ))}
                </div>
              </div>
              <div className='divide-y divide-[rgb(var(--border))]'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='p-4 flex items-start gap-4'>
                    <div className='w-4 h-4 rounded bg-[rgb(var(--secondary))]' />
                    <div className='flex-1'>
                      <div className='h-5 w-48 rounded bg-[rgb(var(--secondary))] mb-2' />
                      <div className='h-4 w-64 rounded bg-[rgb(var(--secondary))] mb-3' />
                      <div className='flex gap-3'>
                        <div className='h-5 w-16 rounded bg-[rgb(var(--secondary))]' />
                        <div className='h-5 w-24 rounded bg-[rgb(var(--secondary))]' />
                        <div className='h-5 w-20 rounded bg-[rgb(var(--secondary))]' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* 통계 카드 */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <StatCard
                icon={<CheckCircle2 className='w-5 h-5 text-emerald-500' />}
                label='총 완료'
                value={stats?.completedCards || 0}
                subtext={`전체 ${stats?.totalCards || 0}개 중`}
              />
              <StatCard
                icon={<Calendar className='w-5 h-5 text-blue-500' />}
                label='이번 주'
                value={stats?.completedThisWeek || 0}
                subtext='완료'
              />
              <StatCard
                icon={<TrendingUp className='w-5 h-5 text-violet-500' />}
                label='완료율'
                value={`${stats?.completionRate || 0}%`}
                subtext='달성'
              />
              <StatCard
                icon={<Users className='w-5 h-5 text-amber-500' />}
                label='이번 달'
                value={stats?.completedThisMonth || 0}
                subtext='완료'
              />
            </div>

            {/* 차트 섹션 */}
            {(weeklyChartData.length > 0 || memberChartData.length > 0) && (
              <div className='grid lg:grid-cols-2 gap-6'>
                {/* 주간 완료 추이 */}
                {weeklyChartData.length > 0 && (
                  <div className='card p-6 bg-white dark:bg-[rgb(var(--card))]'>
                    <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                      <span className='w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center'>📈</span>
                      주간 완료 추이
                    </h3>
                    <div className='h-72'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={weeklyChartData} barSize={40}>
                          <defs>
                            <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                              <stop offset='0%' stopColor='#8b5cf6' stopOpacity={1} />
                              <stop offset='100%' stopColor='#6366f1' stopOpacity={0.8} />
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
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}
                            cursor={{ fill: 'rgb(var(--secondary))', opacity: 0.5 }}
                          />
                          <Bar 
                            dataKey='완료' 
                            fill='url(#barGradient)' 
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 팀원별 완료 */}
                {memberChartData.length > 0 && (
                  <div className='card p-6 bg-white dark:bg-[rgb(var(--card))]'>
                    <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                      <span className='w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center'>👥</span>
                      팀원별 완료 현황
                    </h3>
                    <div className='h-72 flex items-center justify-center'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <defs>
                            {COLORS.map((color, index) => (
                              <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1='0' y1='0' x2='1' y2='1'>
                                <stop offset='0%' stopColor={color} stopOpacity={1} />
                                <stop offset='100%' stopColor={color} stopOpacity={0.7} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={memberChartData}
                            cx='50%'
                            cy='50%'
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey='value'
                            label={({ name, value, percent }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                            labelLine={{ stroke: 'rgb(var(--muted-foreground))', strokeWidth: 1 }}
                            animationDuration={1000}
                          >
                            {memberChartData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#pieGradient-${index % COLORS.length})`}
                                stroke='rgb(var(--card))'
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgb(var(--card))',
                              border: '1px solid rgb(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 기간 필터 + 카드 목록 */}
            <div className='card'>
              <div className='p-4 border-b border-[rgb(var(--border))] flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-[rgb(var(--foreground))]'>기간:</span>
                  <div className='flex gap-1'>
                    {(['week', 'month', 'all'] as PeriodFilter[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          period === p
                            ? 'bg-violet-500 text-white'
                            : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]/80'
                        }`}
                      >
                        {p === 'week' ? '이번 주' : p === 'month' ? '이번 달' : '전체'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  <label className='flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]'>
                    <input
                      type='checkbox'
                      checked={selectedCards.size === cards.length && cards.length > 0}
                      onChange={() => toggleSelectAll(cards.map((c) => c.id))}
                      className='w-4 h-4 rounded border-gray-300'
                    />
                    전체 선택
                  </label>
                  <span className='text-sm text-[rgb(var(--muted-foreground))]'>
                    {selectedCards.size > 0 ? `${selectedCards.size}개 선택됨` : `${cards.length}개`}
                  </span>
                </div>
              </div>

              {/* 카드 목록 */}
              <div className='divide-y divide-[rgb(var(--border))]'>
                {cards.length === 0 ? (
                  <div className='py-12 text-center'>
                    <CheckCircle2 className='w-12 h-12 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
                    <p className='text-[rgb(var(--muted-foreground))]'>
                      {period === 'all' ? '완료된 카드가 없습니다' : '해당 기간에 완료된 카드가 없습니다'}
                    </p>
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className='p-4 flex items-start gap-4 hover:bg-[rgb(var(--secondary))]/50 transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={selectedCards.has(card.id)}
                        onChange={() => toggleSelect(card.id)}
                        className='w-4 h-4 mt-1 rounded border-gray-300'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <CheckCircle2 className='w-4 h-4 text-emerald-500 flex-shrink-0' />
                          <span className='font-medium text-[rgb(var(--foreground))] truncate'>
                            {card.title}
                          </span>
                        </div>
                        {card.description && (
                          <p className='text-sm text-[rgb(var(--muted-foreground))] line-clamp-1 mb-2'>
                            {card.description}
                          </p>
                        )}
                        <div className='flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]'>
                          <span className='px-2 py-0.5 bg-[rgb(var(--secondary))] rounded'>
                            {card.list_title}
                          </span>
                          {card.completed_at && (
                            <span>
                              완료: {new Date(card.completed_at).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          {card.completer && (
                            <span className='flex items-center gap-1'>
                              by{' '}
                              {card.completer.avatar_url ? (
                                <img
                                  src={card.completer.avatar_url}
                                  alt=''
                                  className='w-4 h-4 rounded-full'
                                  referrerPolicy='no-referrer'
                                />
                              ) : null}
                              {card.completer.username || card.completer.email?.split('@')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
}) {
  return (
    <div className='card p-4'>
      <div className='flex items-center gap-3 mb-2'>
        {icon}
        <span className='text-sm text-[rgb(var(--muted-foreground))]'>{label}</span>
      </div>
      <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{value}</div>
      <div className='text-xs text-[rgb(var(--muted-foreground))]'>{subtext}</div>
    </div>
  )
}
