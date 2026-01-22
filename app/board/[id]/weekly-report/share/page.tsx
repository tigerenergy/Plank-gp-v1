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

  // 주간보고 목록 조회 (사용자가 접근 가능한 모든 보드)
  // boardId가 있으면 해당 보드만, 없으면 모든 보드
  const reportsResult = await getWeeklyReportsByBoard(boardId || null, week)
  if (!reportsResult.success) {
    redirect('/')
  }

  // 보드는 선택사항 (특정 보드로 필터링할 때만 사용)
  const board = boardId ? (await getBoard(boardId)).data : null

  return <WeeklyReportShareClient board={board} reports={reportsResult.data || []} selectedWeek={week} />
}
