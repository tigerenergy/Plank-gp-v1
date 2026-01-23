import { getUser } from './actions/auth'
import { getAllWeeklyReports } from './actions/weekly-report'
import { getSharedBoardMembers } from './actions/member'
import HomeClient from './HomeClient'

export default async function Home() {
  const user = await getUser()
  
  // 주간보고 데이터 로드 (현재 주간)
  const weekStart = (() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const date = new Date(now)
    date.setDate(diff)
    return date.toISOString().split('T')[0]
  })()
  
  const [reportsResult, teamMembersResult] = await Promise.all([
    getAllWeeklyReports(weekStart),
    getSharedBoardMembers(),
  ])
  
  const reports = reportsResult.success ? reportsResult.data || [] : []
  const teamMembers = teamMembersResult.success ? teamMembersResult.data || [] : []

  return (
    <HomeClient 
      user={user} 
      weeklyReports={reports}
      teamMembers={teamMembers}
      currentWeek={weekStart}
    />
  )
}
