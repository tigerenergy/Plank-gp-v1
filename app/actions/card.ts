'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Card, Label } from '@/types'
import { createCardSchema, updateCardSchema, moveCardSchema } from '@/schema/validation'
import { notifyBoardMembers } from './notification'

// 보드 멤버인지 확인하는 헬퍼 함수 (소유자 OR board_members)
async function checkBoardMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
): Promise<{ isMember: boolean; isOwner: boolean; error?: string }> {
  // 리스트 → 보드 조회
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('board_id')
    .eq('id', listId)
    .single()

  if (listError || !list) {
    return { isMember: false, isOwner: false, error: '리스트를 찾을 수 없습니다.' }
  }

  // 보드 소유자 확인
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('created_by')
    .eq('id', list.board_id)
    .single()

  if (boardError || !board) {
    return { isMember: false, isOwner: false, error: '보드를 찾을 수 없습니다.' }
  }

  const isOwner = board.created_by === userId

  // 소유자면 바로 멤버
  if (isOwner) {
    return { isMember: true, isOwner: true }
  }

  // board_members에서 확인
  const { data: membership } = await supabase
    .from('board_members')
    .select('user_id')
    .eq('board_id', list.board_id)
    .eq('user_id', userId)
    .maybeSingle()

  return { isMember: !!membership, isOwner: false }
}

// 카드 ID로 보드 멤버 확인
async function checkCardMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string,
  userId: string
): Promise<{ isMember: boolean; isOwner: boolean; error?: string }> {
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('list_id')
    .eq('id', cardId)
    .single()

  if (cardError || !card) {
    return { isMember: false, isOwner: false, error: '카드를 찾을 수 없습니다.' }
  }

  return checkBoardMembership(supabase, card.list_id, userId)
}

// 카드 생성 (보드 멤버)
export async function createCard(input: {
  list_id: string
  title: string
  description?: string
  start_date?: string
  due_date?: string
  labels?: Label[]
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

    // 보드 멤버 확인 (소유자 또는 멤버)
    const membership = await checkBoardMembership(supabase, input.list_id, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 카드를 생성할 수 있습니다.' }
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
        start_date: input.start_date || null,
        due_date: input.due_date || null,
        labels: input.labels || [],
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

    // 보드의 모든 멤버에게 알림 (본인 제외)
    const { data: listForNotif } = await supabase
      .from('lists')
      .select('board_id, title')
      .eq('id', input.list_id)
      .single()

    if (listForNotif?.board_id) {
      await notifyBoardMembers({
        boardId: listForNotif.board_id,
        excludeUserId: user.id,
        type: 'card_created',
        title: '새 카드가 생성되었습니다',
        message: `"${listForNotif.title}" 리스트에 "${input.title}" 카드가 추가되었습니다`,
        link: `/board/${listForNotif.board_id}`,
        cardId: data.id,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('카드 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 수정 (카드 생성자 또는 보드 소유자만)
export async function updateCard(input: {
  id: string
  title?: string
  description?: string | null
  start_date?: string | null
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
      start_date: input.start_date,
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

    // 카드 정보 조회 (생성자 확인)
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('created_by, list_id')
      .eq('id', input.id)
      .single()

    if (cardError || !card) {
      return { success: false, error: '카드를 찾을 수 없습니다.' }
    }

    // 보드 멤버/소유자 확인
    const membership = await checkBoardMembership(supabase, card.list_id, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 카드를 수정할 수 있습니다.' }
    }

    // 카드 생성자이거나 보드 소유자만 수정 가능
    const isCardCreator = card.created_by === user.id
    if (!isCardCreator && !membership.isOwner) {
      return { success: false, error: '본인이 만든 카드만 수정할 수 있습니다.' }
    }

    const updates: Record<string, unknown> = {}
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description || null
    if (input.start_date !== undefined) updates.start_date = input.start_date || null
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

    // 카드 수정은 알림 안 함 (알림 피로도 감소)
    // 카드 생성/이동/댓글만 알림

    return { success: true, data }
  } catch (error) {
    console.error('카드 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 삭제 (카드 생성자 또는 보드 소유자만)
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

    // 카드 정보 조회 (생성자 확인)
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('created_by, list_id')
      .eq('id', id)
      .single()

    if (cardError || !card) {
      return { success: false, error: '카드를 찾을 수 없습니다.' }
    }

    // 보드 멤버/소유자 확인
    const membership = await checkBoardMembership(supabase, card.list_id, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 카드를 삭제할 수 있습니다.' }
    }

    // 카드 생성자만 삭제 가능 (보드 소유자도 남의 카드 삭제 불가)
    const isCardCreator = card.created_by === user.id
    if (!isCardCreator) {
      return { success: false, error: '본인이 만든 카드만 삭제할 수 있습니다.' }
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

// 카드 이동 (보드 멤버)
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

    // 보드 멤버 확인 (대상 리스트 기준)
    const membership = await checkBoardMembership(supabase, input.targetListId, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 카드를 이동할 수 있습니다.' }
    }

    // 이동 전 카드 제목 조회
    const { data: cardForNotif } = await supabase
      .from('cards')
      .select('title')
      .eq('id', input.cardId)
      .single()

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

    // 보드의 모든 멤버에게 알림 (본인 제외)
    const { data: listForNotif } = await supabase
      .from('lists')
      .select('board_id, title')
      .eq('id', input.targetListId)
      .single()

    if (listForNotif?.board_id) {
      await notifyBoardMembers({
        boardId: listForNotif.board_id,
        excludeUserId: user.id,
        type: 'card_moved',
        title: '카드가 이동되었습니다',
        message: `"${cardForNotif?.title || '카드'}"가 "${listForNotif.title}" 리스트로 이동되었습니다`,
        link: `/board/${listForNotif.board_id}`,
        cardId: input.cardId,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('카드 이동 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 담당자 변경 (보드 멤버)
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

    // 보드 멤버 확인 (소유자 또는 멤버)
    const membership = await checkCardMembership(supabase, cardId, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 담당자를 변경할 수 있습니다.' }
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

// 카드 완료 처리 (보드 멤버)
export async function completeCard(cardId: string): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 확인
    const membership = await checkCardMembership(supabase, cardId, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 완료 처리할 수 있습니다.' }
    }

    // 카드 정보 조회
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('title, list_id, is_completed')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return { success: false, error: '카드를 찾을 수 없습니다.' }
    }

    // 이미 완료된 경우
    if (card.is_completed) {
      return { success: false, error: '이미 완료된 카드입니다.' }
    }

    // 완료 처리
    const { data, error } = await supabase
      .from('cards')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        completed_by: user.id,
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('완료 처리 에러:', error)
      return { success: false, error: '완료 처리에 실패했습니다.' }
    }

    // 보드의 모든 멤버에게 알림
    const { data: listForNotif } = await supabase
      .from('lists')
      .select('board_id')
      .eq('id', card.list_id)
      .single()

    if (listForNotif?.board_id) {
      await notifyBoardMembers({
        boardId: listForNotif.board_id,
        excludeUserId: user.id,
        type: 'card_completed',
        title: '🎉 카드가 완료되었습니다!',
        message: `"${card.title}" 카드가 완료 처리되었습니다`,
        link: `/board/${listForNotif.board_id}`,
        cardId: cardId,
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('완료 처리 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 완료 취소 (보드 멤버)
export async function uncompleteCard(cardId: string): Promise<ActionResult<Card>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 확인
    const membership = await checkCardMembership(supabase, cardId, user.id)
    if (!membership.isMember) {
      return { success: false, error: '보드 멤버만 완료 취소할 수 있습니다.' }
    }

    // 카드 정보 조회 (보드 ID 확인용)
    const { data: cardInfo } = await supabase
      .from('cards')
      .select('list_id, lists!inner(board_id)')
      .eq('id', cardId)
      .single()

    // 완료 취소
    const { data, error } = await supabase
      .from('cards')
      .update({
        is_completed: false,
        completed_at: null,
        completed_by: null,
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('완료 취소 에러:', error)
      return { success: false, error: '완료 취소에 실패했습니다.' }
    }

    // 주간보고 자동 업데이트 (해당 주간의 주간보고가 있으면 업데이트)
    if (cardInfo && (cardInfo.lists as any)?.board_id) {
      const boardId = (cardInfo.lists as any).board_id
      try {
        // 현재 주간의 주간보고 찾기
        const weekStart = new Date()
        const day = weekStart.getDay()
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
        const weekStartDate = new Date(weekStart.setDate(diff))
        weekStartDate.setHours(0, 0, 0, 0)

        const { data: weeklyReport } = await supabase
          .from('weekly_reports')
          .select('id, week_start_date')
          .eq('board_id', boardId)
          .eq('user_id', user.id)
          .eq('week_start_date', weekStartDate.toISOString().split('T')[0])
          .maybeSingle()

        if (weeklyReport) {
          // 주간보고 데이터 새로고침 (비동기로 처리, 에러는 무시)
          const { refreshWeeklyReportData } = await import('./weekly-report')
          refreshWeeklyReportData(weeklyReport.id, boardId, weekStartDate.toISOString().split('T')[0]).catch(
            (err) => console.error('주간보고 자동 업데이트 실패:', err)
          )
        }
      } catch (err) {
        // 주간보고 업데이트 실패는 무시 (완료 취소는 성공으로 처리)
        console.error('주간보고 자동 업데이트 에러:', err)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('완료 취소 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
