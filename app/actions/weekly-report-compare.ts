'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import type { WeeklyReport } from './weekly-report'

// 비교용 주간보고 데이터 타입
export interface WeeklyReportCompareData {
  id: string
  week_start_date: string
  week_end_date: string
  status: 'draft' | 'submitted'
  total_hours: number
  completed_cards_count: number
  in_progress_cards_count: number
  activities_count: number
  notes: string | null
  completed_cards: any[]
  in_progress_cards: any[]
  card_activities: any[]
  user?: {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
  }
}

// 여러 주간보고 비교 데이터 조회
export async function getWeeklyReportsForCompare(
  reportIds: string[]
): Promise<ActionResult<WeeklyReportCompareData[]>> {
  try {
    if (!reportIds || reportIds.length === 0) {
      return { success: false, error: '비교할 주간보고를 선택해주세요.' }
    }

    if (reportIds.length > 4) {
      return { success: false, error: '최대 4개의 주간보고만 비교할 수 있습니다.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('weekly_reports')
      .select(`
        id,
        week_start_date,
        week_end_date,
        status,
        total_hours,
        completed_cards,
        in_progress_cards,
        card_activities,
        notes,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url)
      `)
      .in('id', reportIds)
      .order('week_start_date', { ascending: false })

    if (error) {
      console.error('주간보고 비교 데이터 조회 에러:', error)
      return { success: false, error: '주간보고를 조회할 수 없습니다.' }
    }

    if (!data || data.length === 0) {
      return { success: false, error: '주간보고를 찾을 수 없습니다.' }
    }

    // 데이터 변환
    const compareData: WeeklyReportCompareData[] = data.map((report) => ({
      id: report.id,
      week_start_date: report.week_start_date,
      week_end_date: report.week_end_date,
      status: report.status,
      total_hours: Number(report.total_hours || 0),
      completed_cards_count: Array.isArray(report.completed_cards) ? report.completed_cards.length : 0,
      in_progress_cards_count: Array.isArray(report.in_progress_cards) ? report.in_progress_cards.length : 0,
      activities_count: Array.isArray(report.card_activities) ? report.card_activities.length : 0,
      notes: report.notes,
      completed_cards: report.completed_cards || [],
      in_progress_cards: report.in_progress_cards || [],
      card_activities: report.card_activities || [],
      user: (report as any).user,
    }))

    return { success: true, data: compareData }
  } catch (error) {
    console.error('주간보고 비교 데이터 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 비교 통계 계산
export interface WeeklyReportCompareStats {
  total_hours: {
    min: number
    max: number
    avg: number
    diff: number
  }
  completed_cards: {
    min: number
    max: number
    avg: number
    diff: number
  }
  in_progress_cards: {
    min: number
    max: number
    avg: number
    diff: number
  }
}

export function calculateCompareStats(
  reports: WeeklyReportCompareData[]
): WeeklyReportCompareStats {
  if (reports.length === 0) {
    return {
      total_hours: { min: 0, max: 0, avg: 0, diff: 0 },
      completed_cards: { min: 0, max: 0, avg: 0, diff: 0 },
      in_progress_cards: { min: 0, max: 0, avg: 0, diff: 0 },
    }
  }

  const totalHours = reports.map((r) => r.total_hours)
  const completedCards = reports.map((r) => r.completed_cards_count)
  const inProgressCards = reports.map((r) => r.in_progress_cards_count)

  const getStats = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b)
    const min = sorted[0] || 0
    const max = sorted[sorted.length - 1] || 0
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    const diff = max - min
    return { min, max, avg, diff }
  }

  return {
    total_hours: getStats(totalHours),
    completed_cards: getStats(completedCards),
    in_progress_cards: getStats(inProgressCards),
  }
}
