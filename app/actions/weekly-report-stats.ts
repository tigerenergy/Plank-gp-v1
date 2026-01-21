'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import type { WeeklyReport } from './weekly-report'

// 주간별 작업 시간 추이 데이터
export interface WeeklyHoursTrend {
  week_start_date: string
  week_end_date: string
  total_hours: number
  user_count: number
}

// 완료된 작업 수 추이 데이터
export interface CompletionTrend {
  week_start_date: string
  week_end_date: string
  completed_count: number
  in_progress_count: number
}

// 팀원별 작업 시간 비교 데이터
export interface TeamHoursComparison {
  user_id: string
  username: string | null
  email: string
  avatar_url: string | null
  total_hours: number
  report_count: number
}

// 주간별 작업 시간 추이 조회
export async function getWeeklyHoursTrend(
  boardId: string,
  weeks: number = 8
): Promise<ActionResult<WeeklyHoursTrend[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 최근 N주간의 주간보고 조회
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('week_start_date, week_end_date, total_hours, user_id')
      .eq('board_id', boardId)
      .eq('status', 'submitted')
      .order('week_start_date', { ascending: false })
      .limit(weeks * 10) // 충분한 데이터 (사용자 수 고려)

    if (error) {
      console.error('주간 시간 추이 조회 에러:', error)
      return { success: false, error: '데이터를 불러오는데 실패했습니다.' }
    }

    // 주간별로 그룹화 및 집계
    const weeklyMap = new Map<string, { hours: number; users: Set<string> }>()

    for (const report of data || []) {
      const weekKey = report.week_start_date
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          hours: 0,
          users: new Set(),
        })
      }
      const weekData = weeklyMap.get(weekKey)!
      weekData.hours += Number(report.total_hours || 0)
      weekData.users.add(report.user_id)
    }

    // 결과 배열로 변환
    const result: WeeklyHoursTrend[] = Array.from(weeklyMap.entries())
      .map(([weekStart, data]) => ({
        week_start_date: weekStart,
        week_end_date: '', // 나중에 계산
        total_hours: data.hours,
        user_count: data.users.size,
      }))
      .sort((a, b) => a.week_start_date.localeCompare(b.week_start_date))

    // week_end_date 계산
    for (const item of result) {
      const startDate = new Date(item.week_start_date)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      item.week_end_date = endDate.toISOString().split('T')[0]
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('주간 시간 추이 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 완료된 작업 수 추이 조회
export async function getCompletionTrend(
  boardId: string,
  weeks: number = 8
): Promise<ActionResult<CompletionTrend[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 최근 N주간의 주간보고 조회
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('week_start_date, completed_cards, in_progress_cards')
      .eq('board_id', boardId)
      .eq('status', 'submitted')
      .order('week_start_date', { ascending: false })
      .limit(weeks * 10)

    if (error) {
      console.error('완료 추이 조회 에러:', error)
      return { success: false, error: '데이터를 불러오는데 실패했습니다.' }
    }

    // 주간별로 그룹화 및 집계
    const weeklyMap = new Map<string, { completed: number; inProgress: number }>()

    for (const report of data || []) {
      const weekKey = report.week_start_date
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { completed: 0, inProgress: 0 })
      }
      const weekData = weeklyMap.get(weekKey)!
      weekData.completed += Array.isArray(report.completed_cards)
        ? report.completed_cards.length
        : 0
      weekData.inProgress += Array.isArray(report.in_progress_cards)
        ? report.in_progress_cards.length
        : 0
    }

    // 결과 배열로 변환
    const result: CompletionTrend[] = Array.from(weeklyMap.entries())
      .map(([weekStart, data]) => {
        const startDate = new Date(weekStart)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        return {
          week_start_date: weekStart,
          week_end_date: endDate.toISOString().split('T')[0],
          completed_count: data.completed,
          in_progress_count: data.inProgress,
        }
      })
      .sort((a, b) => a.week_start_date.localeCompare(b.week_start_date))

    return { success: true, data: result }
  } catch (error) {
    console.error('완료 추이 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 팀원별 작업 시간 비교 조회
export async function getTeamHoursComparison(
  boardId: string,
  weeks: number = 8
): Promise<ActionResult<TeamHoursComparison[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 최근 N주간의 주간보고 조회
    const { data, error } = await supabase
      .from('weekly_reports')
      .select(
        `
        user_id,
        total_hours,
        week_start_date,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('board_id', boardId)
      .eq('status', 'submitted')
      .order('week_start_date', { ascending: false })
      .limit(weeks * 20)

    if (error) {
      console.error('팀원 시간 비교 조회 에러:', error)
      return { success: false, error: '데이터를 불러오는데 실패했습니다.' }
    }

    // 사용자별로 그룹화 및 집계
    const userMap = new Map<
      string,
      { hours: number; count: number; user: any }
    >()

    for (const report of data || []) {
      const userId = report.user_id
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          hours: 0,
          count: 0,
          user: (report as any).user,
        })
      }
      const userData = userMap.get(userId)!
      userData.hours += Number(report.total_hours || 0)
      userData.count += 1
    }

    // 결과 배열로 변환
    const result: TeamHoursComparison[] = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        user_id: userId,
        username: data.user?.username || null,
        email: data.user?.email || '',
        avatar_url: data.user?.avatar_url || null,
        total_hours: data.hours,
        report_count: data.count,
      }))
      .sort((a, b) => b.total_hours - a.total_hours)

    return { success: true, data: result }
  } catch (error) {
    console.error('팀원 시간 비교 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
