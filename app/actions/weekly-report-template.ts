'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// 주간보고 템플릿 타입
export interface WeeklyReportTemplate {
  id: string
  user_id: string
  board_id: string | null
  name: string
  description: string | null
  template_data: {
    // 진행 중인 카드 기본 구조
    default_status?: string // 기본 상태 (진행중, 완료, 대기, 예정)
    default_progress?: number // 기본 진척도 (0-100)
    default_description_template?: string // 설명 템플릿
    default_issues_template?: string // 이슈 템플릿
    // notes 템플릿
    notes_template?: string // notes 템플릿
  }
  is_default: boolean
  created_at: string
  updated_at: string
}

// 템플릿 생성
export async function createWeeklyReportTemplate(
  data: {
    name: string
    description?: string
    board_id?: string | null
    template_data?: WeeklyReportTemplate['template_data']
    is_default?: boolean
  }
): Promise<ActionResult<WeeklyReportTemplate>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 기본 템플릿으로 설정하는 경우, 기존 기본 템플릿 해제
    if (data.is_default) {
      await supabase
        .from('weekly_report_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    const { data: template, error } = await supabase
      .from('weekly_report_templates')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        board_id: data.board_id || null,
        template_data: data.template_data || {},
        is_default: data.is_default || false,
      })
      .select()
      .single()

    if (error) {
      console.error('템플릿 생성 에러:', error)
      // 중복 이름 에러 처리
      if (error.code === '23505') {
        return { success: false, error: '같은 이름의 템플릿이 이미 존재합니다.' }
      }
      return { success: false, error: '템플릿 생성에 실패했습니다.' }
    }

    return { success: true, data: template }
  } catch (error) {
    console.error('템플릿 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 템플릿 목록 조회
export async function getWeeklyReportTemplates(
  boardId?: string | null
): Promise<ActionResult<WeeklyReportTemplate[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    let query = supabase
      .from('weekly_report_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    // boardId가 제공된 경우, 해당 보드용 템플릿 또는 보드 무관 템플릿만 조회
    if (boardId) {
      query = query.or(`board_id.eq.${boardId},board_id.is.null`)
    } else {
      // boardId가 없는 경우, 보드 무관 템플릿만 조회
      query = query.is('board_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('템플릿 조회 에러:', error)
      return { success: false, error: '템플릿을 불러오는데 실패했습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('템플릿 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 템플릿 조회
export async function getWeeklyReportTemplate(
  templateId: string
): Promise<ActionResult<WeeklyReportTemplate>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('weekly_report_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('템플릿 조회 에러:', error)
      return { success: false, error: '템플릿을 찾을 수 없습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('템플릿 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 템플릿 수정
export async function updateWeeklyReportTemplate(
  templateId: string,
  updates: {
    name?: string
    description?: string | null
    board_id?: string | null
    template_data?: WeeklyReportTemplate['template_data']
    is_default?: boolean
  }
): Promise<ActionResult<WeeklyReportTemplate>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 확인
    const { data: template } = await supabase
      .from('weekly_report_templates')
      .select('user_id')
      .eq('id', templateId)
      .single()

    if (!template || template.user_id !== user.id) {
      return { success: false, error: '템플릿을 수정할 권한이 없습니다.' }
    }

    // 기본 템플릿으로 설정하는 경우, 기존 기본 템플릿 해제
    if (updates.is_default) {
      await supabase
        .from('weekly_report_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', templateId)
    }

    const { data, error } = await supabase
      .from('weekly_report_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single()

    if (error) {
      console.error('템플릿 수정 에러:', error)
      if (error.code === '23505') {
        return { success: false, error: '같은 이름의 템플릿이 이미 존재합니다.' }
      }
      return { success: false, error: '템플릿 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('템플릿 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 템플릿 삭제
export async function deleteWeeklyReportTemplate(
  templateId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 확인
    const { data: template } = await supabase
      .from('weekly_report_templates')
      .select('user_id')
      .eq('id', templateId)
      .single()

    if (!template || template.user_id !== user.id) {
      return { success: false, error: '템플릿을 삭제할 권한이 없습니다.' }
    }

    const { error } = await supabase
      .from('weekly_report_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('템플릿 삭제 에러:', error)
      return { success: false, error: '템플릿 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('템플릿 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
