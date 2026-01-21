import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { WeeklyReportStatsClient } from './WeeklyReportStatsClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WeeklyReportStatsPage({ params }: PageProps) {
  const { id: boardId } = await params
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

  return <WeeklyReportStatsClient board={board} />
}
