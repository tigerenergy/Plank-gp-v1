'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Card, Label } from '@/types'
import { createCardSchema, updateCardSchema, moveCardSchema } from '@/schema/validation'

// 카드 생성
export async function createCard(input: {
  list_id: string
  title: string
  description?: string
  due_date?: string
}): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    // 유효성 검사
    const validation = createCardSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // 현재 사용자 가져오기 (자동 담당자 할당)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 기존 카드의 최대 position 값 조회
    const { data: maxPositionData } = await supabase
      .from('cards')
      .select('position')
      .eq('list_id', input.list_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxPositionData?.position ?? 0) + 1

    const { data, error } = await supabase
      .from('cards')
      .insert({
        list_id: input.list_id,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        position: newPosition,
        assignee_id: user?.id || null, // 만든 사람 = 자동 담당자
        created_by: user?.id || null, // 생성자 기록
      })
      .select(
        `
        *,
        assignee:profiles!cards_assignee_id_fkey(id, email, username, avatar_url),
        creator:profiles!cards_created_by_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('카드 생성 에러:', error)
      return { success: false, error: '카드 생성에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('카드 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 수정
export async function updateCard(input: {
  id: string
  title?: string
  description?: string | null
  due_date?: string | null
  labels?: Label[]
}): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    // 유효성 검사 (labels 제외)
    const validation = updateCardSchema.safeParse({
      id: input.id,
      title: input.title,
      description: input.description,
      due_date: input.due_date,
    })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    const updates: Record<string, unknown> = {}
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description || null
    // 빈 문자열은 null로 변환 (DB에서 빈 문자열을 timestamp로 변환 못함)
    if (input.due_date !== undefined) updates.due_date = input.due_date || null
    // 라벨 업데이트
    if (input.labels !== undefined) updates.labels = input.labels

    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      console.error('카드 수정 에러:', error)
      return { success: false, error: '카드 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('카드 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 삭제
export async function deleteCard(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('cards').delete().eq('id', id)

    if (error) {
      console.error('카드 삭제 에러:', error)
      return { success: false, error: '카드 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('카드 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 이동
export async function moveCard(input: {
  cardId: string
  targetListId: string
  newPosition: number
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // 유효성 검사
    const validation = moveCardSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    const { error } = await supabase
      .from('cards')
      .update({
        list_id: input.targetListId,
        position: input.newPosition,
      })
      .eq('id', input.cardId)

    if (error) {
      console.error('카드 이동 에러:', error)
      return { success: false, error: '카드 이동에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('카드 이동 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
