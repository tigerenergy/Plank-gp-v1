import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { getWeeklyReportsByBoard } from '@/app/actions/weekly-report'
import { WeeklyReportShareClient } from './WeeklyReportShareClient'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ week?: string }>
}

export default async function WeeklyReportSharePage({ params, searchParams }: PageProps) {
  const { id: boardId } = await params
  const { week } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 보드 조회
  const boardResult = await getBoard(boardId)
  if (!boardResult.success || !boardResult.data) {
    redirect('/')
  }

  const board = boardResult.data

  // 주간보고 목록 조회
  const reportsResult = await getWeeklyReportsByBoard(boardId, week)
  if (!reportsResult.success) {
    redirect(`/board/${boardId}`)
  }

  return <WeeklyReportShareClient board={board} reports={reportsResult.data || []} selectedWeek={week} />
}
