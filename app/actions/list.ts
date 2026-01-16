'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, List } from '@/types'
import { createListSchema, updateListSchema } from '@/schema/validation'

// 보드 멤버인지 확인 (소유자 OR board_members)
async function checkBoardMembershipByBoardId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  boardId: string,
  userId: string
): Promise<boolean> {
  const { data: board } = await supabase
    .from('boards')
    .select('created_by')
    .eq('id', boardId)
    .single()

  // 소유자인 경우
  if (board?.created_by === userId) return true

  // board_members에서 확인
  const { data: membership } = await supabase
    .from('board_members')
    .select('user_id')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .maybeSingle()

  return !!membership
}

// 리스트 ID로 보드 멤버 확인
async function checkBoardMembershipByListId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
): Promise<boolean> {
  const { data: list } = await supabase.from('lists').select('board_id').eq('id', listId).single()

  if (!list) return false

  return checkBoardMembershipByBoardId(supabase, list.board_id, userId)
}

// 리스트 생성 (보드 멤버)
export async function createList(input: {
  board_id: string
  title: string
}): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()

    // 유효성 검사
    const validation = createListSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 확인 (소유자 또는 멤버)
    const isMember = await checkBoardMembershipByBoardId(supabase, input.board_id, user.id)
    if (!isMember) {
      return { success: false, error: '보드 멤버만 리스트를 생성할 수 있습니다.' }
    }

    // 기존 리스트의 최대 position 값 조회
    const { data: maxPositionData } = await supabase
      .from('lists')
      .select('position')
      .eq('board_id', input.board_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxPositionData?.position ?? 0) + 1

    const { data, error } = await supabase
      .from('lists')
      .insert({
        board_id: input.board_id,
        title: input.title,
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('리스트 생성 에러:', error)
      return { success: false, error: '리스트 생성에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('리스트 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 리스트 수정 (보드 멤버)
export async function updateList(input: {
  id: string
  title?: string
}): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()

    // 유효성 검사
    const validation = updateListSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 확인 (소유자 또는 멤버)
    const isMember = await checkBoardMembershipByListId(supabase, input.id, user.id)
    if (!isMember) {
      return { success: false, error: '보드 멤버만 리스트를 수정할 수 있습니다.' }
    }

    const updates: Partial<List> = {}
    if (input.title !== undefined) updates.title = input.title

    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      console.error('리스트 수정 에러:', error)
      return { success: false, error: '리스트 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('리스트 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 리스트 삭제 (보드 멤버)
export async function deleteList(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 확인 (소유자 또는 멤버)
    const isMember = await checkBoardMembershipByListId(supabase, id, user.id)
    if (!isMember) {
      return { success: false, error: '보드 멤버만 리스트를 삭제할 수 있습니다.' }
    }

    const { error } = await supabase.from('lists').delete().eq('id', id)

    if (error) {
      console.error('리스트 삭제 에러:', error)
      return { success: false, error: '리스트 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('리스트 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
