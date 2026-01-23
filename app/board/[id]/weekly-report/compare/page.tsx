import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { getWeeklyReport } from '@/app/actions/weekly-report'
import { WeeklyReportCompareClient } from './WeeklyReportCompareClient'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    reports?: string // 쉼표로 구분된 보고서 ID 목록
  }>
}

export default async function WeeklyReportComparePage({ params, searchParams }: PageProps) {
  const { id: boardId } = await params
  const { reports: reportsParam } = await searchParams

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

  // 보고서 ID 파싱
  if (!reportsParam) {
    redirect(`/board/${boardId}/weekly-report/history`)
  }

  const reportIds = reportsParam.split(',').filter(Boolean)
  if (reportIds.length < 2) {
    redirect(`/board/${boardId}/weekly-report/history`)
  }

  // 최대 4개까지만 비교
  const limitedReportIds = reportIds.slice(0, 4)

  // 모든 보고서 조회
  const reports = await Promise.all(
    limitedReportIds.map(async (reportId) => {
      const result = await getWeeklyReport(reportId)
      return result.success && result.data ? result.data : null
    })
  )

  // 유효한 보고서만 필터링
  const validReports = reports.filter((r) => r !== null)

  if (validReports.length < 2) {
    redirect(`/board/${boardId}/weekly-report/history`)
  }

  return (
    <WeeklyReportCompareClient
      board={board}
      reports={validReports}
    />
  )
}
