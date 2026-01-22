'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// 주간보고 이전 데이터 타입
export interface WeeklyReportPreviousData {
  status?: 'draft' | 'submitted'
  total_hours?: number | null
  notes?: string | null
  completed_cards?: unknown[]
  in_progress_cards?: unknown[]
}

// 주간보고 변경 사항 타입
export interface WeeklyReportChanges {
  status?: {
    old: 'draft' | 'submitted' | undefined
    new: 'draft' | 'submitted' | undefined
  }
  total_hours?: {
    old: number | null | undefined
    new: number | null | undefined
  }
  notes_changed?: boolean
  in_progress_cards_updated?: boolean
  completed_cards_count?: number
  in_progress_cards_count?: number
}

// 주간보고 수정 이력 타입
export interface WeeklyReportHistory {
  id: string
  weekly_report_id: string
  user_id: string
  action: 'created' | 'updated' | 'submitted'
  changes: WeeklyReportChanges
  previous_data: WeeklyReportPreviousData
  created_at: string
  user?: {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
  }
}

// 주간보고의 수정 이력 조회
export async function getWeeklyReportHistory(
  reportId: string
): Promise<ActionResult<WeeklyReportHistory[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('weekly_report_history')
      .select(
        `
        *,
        user:profiles!weekly_report_history_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('weekly_report_id', reportId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('수정 이력 조회 에러:', error)
      return { success: false, error: '수정 이력을 조회할 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('수정 이력 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
