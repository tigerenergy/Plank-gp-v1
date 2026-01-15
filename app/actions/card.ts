'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Card, Label } from '@/types'
import { createCardSchema, updateCardSchema, moveCardSchema } from '@/schema/validation'

// 보드 소유자인지 확인하는 헬퍼 함수
async function checkBoardOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
): Promise<{ isOwner: boolean; error?: string }> {
  // 리스트 → 보드 조회
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('board_id')
    .eq('id', listId)
    .single()

  if (listError || !list) {
    return { isOwner: false, error: '리스트를 찾을 수 없습니다.' }
  }

  // 보드 소유자 확인
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('created_by')
    .eq('id', list.board_id)
    .single()

  if (boardError || !board) {
    return { isOwner: false, error: '보드를 찾을 수 없습니다.' }
  }

  return { isOwner: board.created_by === userId }
}

// 카드 ID로 보드 소유자 확인
async function checkCardOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
  userId: string
): Promise<{ isOwner: boolean; error?: string }> {
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('list_id')
    .eq('id', cardId)
    .single()

  if (cardError || !card) {
    return { isOwner: false, error: '카드를 찾을 수 없습니다.' }
  }

  return checkBoardOwnership(supabase, card.list_id, userId)
}

// 카드 생성 (보드 소유자만)
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

    // 현재 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 소유자 확인
    const ownership = await checkBoardOwnership(supabase, input.list_id, user.id)
    if (!ownership.isOwner) {
      return { success: false, error: '보드 소유자만 카드를 생성할 수 있습니다.' }
    }

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
        assignee_id: user.id,
        created_by: user.id,
      })
      .select(
        `
        *,
        assignee:profiles!cards_assignee_id_fkey(id, email, username, avatar_url)
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

// 카드 수정 (보드 소유자만)
export async function updateCard(input: {
  id: string
  title?: string
  description?: string | null
  due_date?: string | null
  labels?: Label[]
}): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    // 유효성 검사
    const validation = updateCardSchema.safeParse({
      id: input.id,
      title: input.title,
      description: input.description,
      due_date: input.due_date,
    })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // 현재 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 소유자 확인
    const ownership = await checkCardOwnership(supabase, input.id, user.id)
    if (!ownership.isOwner) {
      return { success: false, error: '보드 소유자만 카드를 수정할 수 있습니다.' }
    }

    const updates: Record<string, unknown> = {}
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description || null
    if (input.due_date !== undefined) updates.due_date = input.due_date || null
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

// 카드 삭제 (보드 소유자만)
export async function deleteCard(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // 현재 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 소유자 확인
    const ownership = await checkCardOwnership(supabase, id, user.id)
    if (!ownership.isOwner) {
      return { success: false, error: '보드 소유자만 카드를 삭제할 수 있습니다.' }
    }

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

// 카드 이동 (보드 소유자만)
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

    // 현재 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 소유자 확인 (대상 리스트 기준)
    const ownership = await checkBoardOwnership(supabase, input.targetListId, user.id)
    if (!ownership.isOwner) {
      return { success: false, error: '보드 소유자만 카드를 이동할 수 있습니다.' }
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

// 담당자 변경 (보드 소유자만)
export async function assignCard(
  cardId: string,
  assigneeId: string | null
): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    // 현재 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 소유자 확인
    const ownership = await checkCardOwnership(supabase, cardId, user.id)
    if (!ownership.isOwner) {
      return { success: false, error: '보드 소유자만 담당자를 변경할 수 있습니다.' }
    }

    const { data, error } = await supabase
      .from('cards')
      .update({ assignee_id: assigneeId })
      .eq('id', cardId)
      .select(
        `
        *,
        assignee:profiles!cards_assignee_id_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('담당자 변경 에러:', error)
      return { success: false, error: '담당자 변경에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('담당자 변경 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
