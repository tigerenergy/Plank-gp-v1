import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { searchWeeklyReports } from '@/app/actions/weekly-report-search'
import { WeeklyReportSearchClient } from './WeeklyReportSearchClient'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    q?: string
    userId?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: string
  }>
}

export default async function WeeklyReportSearchPage({ params, searchParams }: PageProps) {
  const { id: boardId } = await params
  const { q, userId, status, startDate, endDate, page } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 보드 조회
  const boardResult = await getBoard(boardId)
  if (!boardResult.success || !boardResult.data) {
    redirect('/')
  }

  const board = boardResult.data

  // 페이지네이션
  const currentPage = parseInt(page || '1', 10)
  const limit = 20
  const offset = (currentPage - 1) * limit

  // 검색 실행
  const searchResult = await searchWeeklyReports({
    boardId,
    userId,
    searchText: q,
    status: status as 'draft' | 'submitted' | undefined,
    startDate,
    endDate,
    limit,
    offset,
  })

  if (!searchResult.success) {
    redirect(`/board/${boardId}/weekly-report/history`)
  }

  return (
    <WeeklyReportSearchClient
      board={board}
      initialResults={searchResult.data}
      initialQuery={q || ''}
      initialFilters={{
        userId,
        status: status as 'draft' | 'submitted' | undefined,
        startDate,
        endDate,
      }}
      currentPage={currentPage}
    />
  )
}
