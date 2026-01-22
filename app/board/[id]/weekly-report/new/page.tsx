import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { createWeeklyReport, refreshWeeklyReportData } from '@/app/actions/weekly-report'
import { WeeklyReportForm } from './WeeklyReportForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WeeklyReportNewPage({ params }: PageProps) {
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

  // 주간보고 생성 또는 조회
  const weekStart = new Date()
  const day = weekStart.getDay()
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
  weekStart.setDate(diff)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // 기존 주간보고 확인
  const { data: existingReport } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartStr)
    .maybeSingle()

  let report = existingReport

  // 없으면 생성, 있으면 최신 데이터로 자동 갱신
  if (!report) {
    const createResult = await createWeeklyReport(boardId, weekStartStr)
    if (!createResult.success || !createResult.data) {
      redirect(`/board/${boardId}`)
    }
    report = createResult.data
  } else {
    // 기존 보고서가 있어도 최신 데이터로 자동 갱신 (draft 상태일 때만)
    // 완료 취소 후 이동 등으로 인한 데이터 변경을 반영하기 위해 항상 갱신
    if (report.status === 'draft') {
      const refreshResult = await refreshWeeklyReportData(report.id, boardId, weekStartStr)
      if (refreshResult.success && refreshResult.data) {
        report = refreshResult.data
      }
    }
  }

  return <WeeklyReportForm board={board} report={report} />
}
