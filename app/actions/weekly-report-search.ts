'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import type { WeeklyReport } from './weekly-report'

// 주간보고 검색 옵션
export interface WeeklyReportSearchOptions {
  boardId?: string
  userId?: string
  searchText?: string
  status?: 'draft' | 'submitted'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// 주간보고 검색 결과
export interface WeeklyReportSearchResult {
  reports: WeeklyReport[]
  total: number
  hasMore: boolean
}

// 주간보고 검색
export async function searchWeeklyReports(
  options: WeeklyReportSearchOptions = {}
): Promise<ActionResult<WeeklyReportSearchResult>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const {
      boardId,
      userId,
      searchText,
      status,
      startDate,
      endDate,
      limit = 20,
      offset = 0,
    } = options

    let query = supabase
      .from('weekly_reports')
      .select(
        `
        *,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url),
        board:boards!weekly_reports_board_id_fkey(id, title, emoji)
      `,
        { count: 'exact' }
      )

    // 보드 필터
    if (boardId) {
      query = query.eq('board_id', boardId)
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
            reports: [],
            total: 0,
            hasMore: false,
          },
        }
      }
    }

    // 사용자 필터
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // 상태 필터
    if (status) {
      query = query.eq('status', status)
    }

    // 날짜 범위 필터
    if (startDate) {
      query = query.gte('week_start_date', startDate)
    }
    if (endDate) {
      query = query.lte('week_start_date', endDate)
    }

    // 검색 텍스트 필터 (notes, board title, username)
    if (searchText && searchText.trim()) {
      // Supabase의 full-text search는 복잡하므로, 간단한 ILIKE 검색 사용
      // notes 필드 검색
      query = query.or(`notes.ilike.%${searchText}%,board.title.ilike.%${searchText}%,user.username.ilike.%${searchText}%`)
    }

    // 정렬
    query = query.order('week_start_date', { ascending: false })
    query = query.order('created_at', { ascending: false })

    // 페이지네이션
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('주간보고 검색 에러:', error)
      return { success: false, error: '주간보고 검색에 실패했습니다.' }
    }

    return {
      success: true,
      data: {
        reports: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    }
  } catch (error) {
    console.error('주간보고 검색 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
