'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Calendar, Clock, CheckCircle2, FileText, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Board } from '@/types'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import { searchWeeklyReports, type WeeklyReportSearchResult } from '@/app/actions/weekly-report-search'

interface WeeklyReportSearchClientProps {
  board: Board
  initialResults: WeeklyReportSearchResult
  initialQuery: string
  initialFilters: {
    userId?: string
    status?: 'draft' | 'submitted'
    startDate?: string
    endDate?: string
  }
  currentPage: number
}

export function WeeklyReportSearchClient({
  board,
  initialResults,
  initialQuery,
  initialFilters,
  currentPage,
}: WeeklyReportSearchClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState(initialResults)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  // 검색 실행
  const handleSearch = async (newQuery?: string, newFilters?: typeof filters, page: number = 1) => {
    setIsLoading(true)
    try {
      const searchQuery = newQuery !== undefined ? newQuery : query
      const searchFilters = newFilters !== undefined ? newFilters : filters
      const limit = 20
      const offset = (page - 1) * limit

      const result = await searchWeeklyReports({
        boardId: board.id,
        searchText: searchQuery,
        userId: searchFilters.userId,
        status: searchFilters.status,
        startDate: searchFilters.startDate,
        endDate: searchFilters.endDate,
        limit,
        offset,
      })

      if (result.success && result.data) {
        setResults(result.data)
        // URL 업데이트
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (searchFilters.userId) params.set('userId', searchFilters.userId)
        if (searchFilters.status) params.set('status', searchFilters.status)
        if (searchFilters.startDate) params.set('startDate', searchFilters.startDate)
        if (searchFilters.endDate) params.set('endDate', searchFilters.endDate)
        if (page > 1) params.set('page', page.toString())
        router.push(`/board/${board.id}/weekly-report/search?${params.toString()}`)
      }
    } catch (error) {
      console.error('검색 에러:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 검색어 입력 핸들러
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // 검색 실행 (Enter 키 또는 버튼 클릭)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query, filters, 1)
  }

  // 필터 적용
  const applyFilters = () => {
    handleSearch(query, filters, 1)
  }

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    handleSearch(query, emptyFilters, 1)
  }

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    handleSearch(query, filters, newPage)
  }

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
                  {board.emoji || '📋'} {board.title} - 주간보고 검색
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  주간보고를 검색하고 필터링하세요
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
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
        {/* 검색 바 */}
        <div className='card p-6 mb-6'>
          <form onSubmit={handleSubmit} className='flex items-center gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]' />
              <input
                type='text'
                value={query}
                onChange={handleQueryChange}
                placeholder='주간보고 검색 (메모, 작성자, 보드명...)'
                className='w-full pl-12 pr-4 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none focus:ring-2 focus:ring-violet-500'
              />
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-3 rounded-xl btn-primary disabled:opacity-50'
            >
              {isLoading ? '검색 중...' : '검색'}
            </button>
          </form>
        </div>

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
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--foreground))] mb-2'>
                  상태
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as 'draft' | 'submitted' | undefined })}
                  className='w-full px-4 py-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))]'
                >
                  <option value=''>전체</option>
                  <option value='draft'>작성 중</option>
                  <option value='submitted'>제출 완료</option>
                </select>
              </div>
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

        {/* 검색 결과 */}
        {isLoading ? (
          <div className='card p-12 text-center'>
            <div className='animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto' />
            <p className='mt-4 text-sm text-[rgb(var(--muted-foreground))]'>검색 중...</p>
          </div>
        ) : results.reports.length === 0 ? (
          <div className='card p-12 text-center'>
            <Search className='w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
            <h3 className='text-lg font-medium text-[rgb(var(--foreground))] mb-2'>
              검색 결과가 없습니다
            </h3>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mb-4'>
              {query ? `"${query}"에 대한 검색 결과가 없습니다.` : '검색어를 입력하거나 필터를 조정해보세요.'}
            </p>
          </div>
        ) : (
          <>
            {/* 결과 통계 */}
            <div className='mb-4 text-sm text-[rgb(var(--muted-foreground))]'>
              총 {results.total}개의 주간보고를 찾았습니다
            </div>

            {/* 주간보고 목록 */}
            <div className='space-y-4 mb-6'>
              {results.reports.map((report) => {
                const reportUser = (report as any).user
                const reportBoard = (report as any).board
                const completedCount = Array.isArray(report.completed_cards) ? report.completed_cards.length : 0
                const inProgressCount = Array.isArray(report.in_progress_cards) ? report.in_progress_cards.length : 0

                return (
                  <Link
                    key={report.id}
                    href={`/board/${board.id}/weekly-report/new?week=${report.week_start_date}`}
                    className='card p-5 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-violet-500/30 hover:scale-[1.02] flex flex-col relative block'
                    style={{ boxShadow: 'var(--shadow)' }}
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
                    <div className='flex items-center gap-1.5 mb-2'>
                      <Calendar className='w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]' />
                      <span className='text-sm text-[rgb(var(--muted-foreground))]'>
                        {format(new Date(report.week_start_date), 'yyyy년 M월 d일', { locale: ko })} ~{' '}
                        {format(new Date(report.week_end_date), 'M월 d일', { locale: ko })}
                      </span>
                    </div>

                    {/* 메모 미리보기 */}
                    {report.notes && (
                      <div className='mb-2 text-sm text-[rgb(var(--muted-foreground))] line-clamp-2'>
                        {report.notes}
                      </div>
                    )}

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
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {results.total > 20 && (
              <div className='flex items-center justify-center gap-2'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='px-4 py-2 rounded-xl btn-ghost disabled:opacity-50'
                >
                  이전
                </button>
                <span className='text-sm text-[rgb(var(--muted-foreground))]'>
                  {currentPage} / {Math.ceil(results.total / 20)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!results.hasMore}
                  className='px-4 py-2 rounded-xl btn-ghost disabled:opacity-50'
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
