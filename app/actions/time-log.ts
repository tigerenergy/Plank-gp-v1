'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// 시간 로그 타입
export interface TimeLog {
  id: string
  card_id: string
  user_id: string
  hours: number
  description: string | null
  logged_date: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
  }
}

// 카드의 시간 로그 목록 조회
export async function getTimeLogs(cardId: string): Promise<ActionResult<TimeLog[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('card_time_logs')
      .select(
        `
        *,
        user:profiles!card_time_logs_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('card_id', cardId)
      .order('logged_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('시간 로그 조회 에러:', error)
      return { success: false, error: '시간 로그를 불러오는데 실패했습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('시간 로그 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 시간 로그 생성
export async function createTimeLog(input: {
  cardId: string
  hours: number
  description?: string
  loggedDate?: string
}): Promise<ActionResult<TimeLog>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    if (input.hours <= 0) {
      return { success: false, error: '작업 시간은 0보다 커야 합니다.' }
    }

    const { data, error } = await supabase
      .from('card_time_logs')
      .insert({
        card_id: input.cardId,
        user_id: user.id,
        hours: input.hours,
        description: input.description?.trim() || null,
        logged_date: input.loggedDate || new Date().toISOString().split('T')[0],
      })
      .select(
        `
        *,
        user:profiles!card_time_logs_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('시간 로그 생성 에러:', error)
      return { success: false, error: '시간 로그 생성에 실패했습니다.' }
    }

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    await supabase
      .from('cards')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.cardId)

    return { success: true, data }
  } catch (error) {
    console.error('시간 로그 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 시간 로그 수정
export async function updateTimeLog(
  timeLogId: string,
  updates: {
    hours?: number
    description?: string | null
    loggedDate?: string
  }
): Promise<ActionResult<TimeLog>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 확인
    const { data: existing } = await supabase
      .from('card_time_logs')
      .select('user_id')
      .eq('id', timeLogId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return { success: false, error: '시간 로그를 수정할 권한이 없습니다.' }
    }

    if (updates.hours !== undefined && updates.hours <= 0) {
      return { success: false, error: '작업 시간은 0보다 커야 합니다.' }
    }

    const updateData: any = {}
    if (updates.hours !== undefined) updateData.hours = updates.hours
    if (updates.description !== undefined) updateData.description = updates.description?.trim() || null
    if (updates.loggedDate) updateData.logged_date = updates.loggedDate

    const { data, error } = await supabase
      .from('card_time_logs')
      .update(updateData)
      .eq('id', timeLogId)
      .select(
        `
        *,
        user:profiles!card_time_logs_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('시간 로그 수정 에러:', error)
      return { success: false, error: '시간 로그 수정에 실패했습니다.' }
    }

    // 카드 ID 가져오기
    const { data: timeLog } = await supabase
      .from('card_time_logs')
      .select('card_id')
      .eq('id', timeLogId)
      .single()

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    if (timeLog?.card_id) {
      await supabase
        .from('cards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', timeLog.card_id)
    }

    return { success: true, data }
  } catch (error) {
    console.error('시간 로그 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 시간 로그 삭제
export async function deleteTimeLog(timeLogId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 확인
    const { data: existing } = await supabase
      .from('card_time_logs')
      .select('user_id')
      .eq('id', timeLogId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return { success: false, error: '시간 로그를 삭제할 권한이 없습니다.' }
    }

    // 삭제 전에 카드 ID 가져오기
    const { data: timeLog } = await supabase
      .from('card_time_logs')
      .select('card_id')
      .eq('id', timeLogId)
      .single()

    const { error } = await supabase.from('card_time_logs').delete().eq('id', timeLogId)

    if (error) {
      console.error('시간 로그 삭제 에러:', error)
      return { success: false, error: '시간 로그 삭제에 실패했습니다.' }
    }

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    if (timeLog?.card_id) {
      await supabase
        .from('cards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', timeLog.card_id)
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('시간 로그 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드의 주간 시간 집계 (주간보고용)
export async function getCardWeeklyHours(
  cardId: string,
  weekStart: Date,
  weekEnd: Date,
  userId?: string
): Promise<number> {
  try {
    const supabase = await createClient()

    // userId가 없으면 현재 사용자 ID 가져오기
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return 0
      }
      userId = user.id
    }

    // 날짜를 로컬 시간 기준으로 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const weekStartStr = formatDate(weekStart)
    const weekEndStr = formatDate(weekEnd)

    const { data, error } = await supabase
      .from('card_time_logs')
      .select('hours, logged_date')
      .eq('card_id', cardId)
      .eq('user_id', userId) // 현재 사용자의 시간만 집계
      .gte('logged_date', weekStartStr)
      .lte('logged_date', weekEndStr)

    if (error) {
      console.error('시간 집계 에러:', {
        cardId,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        error,
      })
      return 0
    }

    if (!data || data.length === 0) {
      return 0
    }

    const totalHours = data.reduce((sum, log) => {
      const hours = Number(log.hours || 0)
      return sum + hours
    }, 0)

    return totalHours
  } catch (error) {
    console.error('시간 집계 에러:', {
      cardId,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      error,
    })
    return 0
  }
}
