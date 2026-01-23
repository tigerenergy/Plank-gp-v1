import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllWeeklyReports } from '@/app/actions/weekly-report'
import { WeeklyReportShareClient } from './WeeklyReportShareClient'

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function WeeklyReportSharePage({ searchParams }: PageProps) {
  const { week } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 모든 보드의 주간보고 목록 조회
  const reportsResult = await getAllWeeklyReports(week)
  if (!reportsResult.success) {
    redirect('/')
  }

  return <WeeklyReportShareClient reports={reportsResult.data || []} selectedWeek={week} />
}
