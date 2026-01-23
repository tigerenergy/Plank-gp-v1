import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { getWeeklyReportHistoryList } from '@/app/actions/weekly-report-history-list'
import { WeeklyReportHistoryListClient } from './WeeklyReportHistoryListClient'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    userId?: string
    startDate?: string
    endDate?: string
    page?: string
  }>
}

export default async function WeeklyReportHistoryPage({ params, searchParams }: PageProps) {
  const { id: boardId } = await params
  const { userId, startDate, endDate, page } = await searchParams

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

  // 주간보고 히스토리 조회
  const reportsResult = await getWeeklyReportHistoryList({
    boardId,
    userId,
    startDate,
    endDate,
    limit,
    offset,
  })

  if (!reportsResult.success) {
    redirect(`/board/${boardId}`)
  }

  return (
    <WeeklyReportHistoryListClient
      board={board}
      initialReports={reportsResult.data || []}
      currentPage={currentPage}
      limit={limit}
      filters={{
        userId,
        startDate,
        endDate,
      }}
    />
  )
}
