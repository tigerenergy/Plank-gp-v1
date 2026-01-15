'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Checklist, ChecklistItem } from '@/types'

// 카드의 체크리스트 목록 조회 (항목 포함)
export async function getChecklists(cardId: string): Promise<ActionResult<Checklist[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(*)
      `)
      .eq('card_id', cardId)
      .order('position', { ascending: true })

    if (error) {
      console.error('체크리스트 조회 에러:', error)
      return { success: false, error: '체크리스트를 불러오는데 실패했습니다.' }
    }

    // 각 체크리스트의 항목 정렬
    const checklists = (data || []).map((checklist: any) => ({
      ...checklist,
      items: (checklist.items || []).sort((a: ChecklistItem, b: ChecklistItem) => a.position - b.position),
    }))

    return { success: true, data: checklists }
  } catch (error) {
    console.error('체크리스트 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 생성
export async function createChecklist(input: {
  cardId: string
  title?: string
}): Promise<ActionResult<Checklist>> {
  try {
    const supabase = await createClient()

    // 최대 position 조회
    const { data: maxData } = await supabase
      .from('checklists')
      .select('position')
      .eq('card_id', input.cardId)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxData?.position ?? 0) + 1

    const { data, error } = await supabase
      .from('checklists')
      .insert({
        card_id: input.cardId,
        title: input.title || '체크리스트',
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('체크리스트 생성 에러:', error)
      return { success: false, error: '체크리스트 생성에 실패했습니다.' }
    }

    return { success: true, data: { ...data, items: [] } }
  } catch (error) {
    console.error('체크리스트 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 제목 수정
export async function updateChecklist(input: {
  id: string
  title: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('checklists')
      .update({ title: input.title })
      .eq('id', input.id)

    if (error) {
      console.error('체크리스트 수정 에러:', error)
      return { success: false, error: '체크리스트 수정에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('체크리스트 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 삭제
export async function deleteChecklist(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('체크리스트 삭제 에러:', error)
      return { success: false, error: '체크리스트 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('체크리스트 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 항목 추가
export async function addChecklistItem(input: {
  checklistId: string
  content: string
}): Promise<ActionResult<ChecklistItem>> {
  try {
    const supabase = await createClient()

    // 최대 position 조회
    const { data: maxData } = await supabase
      .from('checklist_items')
      .select('position')
      .eq('checklist_id', input.checklistId)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxData?.position ?? 0) + 1

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        checklist_id: input.checklistId,
        content: input.content,
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('항목 추가 에러:', error)
      return { success: false, error: '항목 추가에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('항목 추가 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 항목 체크/해제
export async function toggleChecklistItem(input: {
  id: string
  isChecked: boolean
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('checklist_items')
      .update({ is_checked: input.isChecked })
      .eq('id', input.id)

    if (error) {
      console.error('항목 토글 에러:', error)
      return { success: false, error: '항목 업데이트에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('항목 토글 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 체크리스트 항목 삭제
export async function deleteChecklistItem(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('항목 삭제 에러:', error)
      return { success: false, error: '항목 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('항목 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
