'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import type { WeeklyReport } from './weekly-report'

// 과거 주간보고 목록 조회 (사용자별 또는 보드별)
export async function getWeeklyReportHistoryList(
  options: {
    boardId?: string
    userId?: string
    limit?: number
    offset?: number
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
  } = {}
): Promise<ActionResult<WeeklyReport[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    let query = supabase
      .from('weekly_reports')
      .select(`
        *,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url),
        board:boards!weekly_reports_board_id_fkey(id, title, emoji)
      `)
      .order('week_start_date', { ascending: false })
      .order('created_at', { ascending: false })

    // 보드 필터
    if (options.boardId) {
      query = query.eq('board_id', options.boardId)
    } else {
      // 보드 필터가 없으면 접근 가능한 모든 보드의 보고서만 조회
      const { data: userBoards } = await supabase
        .from('board_members')
        .select('board_id')
        .eq('user_id', user.id)

      const { data: ownedBoards } = await supabase
        .from('boards')
        .select('id')
        .eq('created_by', user.id)

      const boardIds = new Set<string>()
      userBoards?.forEach((mb) => boardIds.add(mb.board_id))
      ownedBoards?.forEach((b) => boardIds.add(b.id))

      if (boardIds.size > 0) {
        query = query.in('board_id', Array.from(boardIds))
      } else {
        return { success: true, data: [] }
      }
    }

    // 사용자 필터
    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }

    // 날짜 범위 필터
    if (options.startDate) {
      query = query.gte('week_start_date', options.startDate)
    }
    if (options.endDate) {
      query = query.lte('week_start_date', options.endDate)
    }

    // 페이지네이션
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('주간보고 히스토리 조회 에러:', error)
      return { success: false, error: '주간보고 히스토리를 조회할 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('주간보고 히스토리 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 주간보고 통계 (히스토리 페이지용)
export interface WeeklyReportHistoryStats {
  total_reports: number
  total_hours: number
  avg_hours_per_week: number
  submitted_count: number
  draft_count: number
  weeks_covered: number
}

export async function getWeeklyReportHistoryStats(
  options: {
    boardId?: string
    userId?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<ActionResult<WeeklyReportHistoryStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    let query = supabase
      .from('weekly_reports')
      .select('status, total_hours, week_start_date', { count: 'exact' })

    // 보드 필터
    if (options.boardId) {
      query = query.eq('board_id', options.boardId)
    } else {
      // 접근 가능한 모든 보드
      const { data: userBoards } = await supabase
        .from('board_members')
        .select('board_id')
        .eq('user_id', user.id)

      const { data: ownedBoards } = await supabase
        .from('boards')
        .select('id')
        .eq('created_by', user.id)

      const boardIds = new Set<string>()
      userBoards?.forEach((mb) => boardIds.add(mb.board_id))
      ownedBoards?.forEach((b) => boardIds.add(b.id))

      if (boardIds.size > 0) {
        query = query.in('board_id', Array.from(boardIds))
      } else {
        return {
          success: true,
          data: {
            total_reports: 0,
            total_hours: 0,
            avg_hours_per_week: 0,
            submitted_count: 0,
            draft_count: 0,
            weeks_covered: 0,
          },
        }
      }
    }

    // 사용자 필터
    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }

    // 날짜 범위 필터
    if (options.startDate) {
      query = query.gte('week_start_date', options.startDate)
    }
    if (options.endDate) {
      query = query.lte('week_start_date', options.endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('주간보고 통계 조회 에러:', error)
      return { success: false, error: '주간보고 통계를 조회할 수 없습니다.' }
    }

    const reports = data || []
    const totalHours = reports.reduce((sum, r) => sum + Number(r.total_hours || 0), 0)
    const submittedCount = reports.filter((r) => r.status === 'submitted').length
    const draftCount = reports.filter((r) => r.status === 'draft').length
    const uniqueWeeks = new Set(reports.map((r) => r.week_start_date)).size

    return {
      success: true,
      data: {
        total_reports: count || 0,
        total_hours: totalHours,
        avg_hours_per_week: uniqueWeeks > 0 ? totalHours / uniqueWeeks : 0,
        submitted_count: submittedCount,
        draft_count: draftCount,
        weeks_covered: uniqueWeeks,
      },
    }
  } catch (error) {
    console.error('주간보고 통계 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
