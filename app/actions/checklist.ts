'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Checklist, ChecklistItem } from '@/types'
import { notifyBoardMembers } from './notification'

// 카드 ID로 보드 정보 가져오기 (알림용)
async function getCardBoardInfo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardId: string
): Promise<{ boardId: string; cardTitle: string } | null> {
  const { data: card } = await supabase
    .from('cards')
    .select('title, list_id')
    .eq('id', cardId)
    .single()

  if (!card) return null

  const { data: list } = await supabase
    .from('lists')
    .select('board_id')
    .eq('id', card.list_id)
    .single()

  if (!list) return null

  return { boardId: list.board_id, cardTitle: card.title }
}

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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

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

    // 보드의 모든 멤버에게 알림
    const boardInfo = await getCardBoardInfo(supabase, input.cardId)
    if (boardInfo) {
      await notifyBoardMembers({
        boardId: boardInfo.boardId,
        excludeUserId: user.id,
        type: 'checklist_created',
        title: '체크리스트가 추가되었습니다',
        message: `"${boardInfo.cardTitle}" 카드에 "${data.title}" 체크리스트가 추가되었습니다`,
        link: `/board/${boardInfo.boardId}`,
        cardId: input.cardId,
      })
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

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

    // 체크리스트에서 카드 ID 가져오기
    const { data: checklist } = await supabase
      .from('checklists')
      .select('card_id, title')
      .eq('id', input.checklistId)
      .single()

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    if (checklist?.card_id) {
      await supabase
        .from('cards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', checklist.card_id)
      
      // 보드의 모든 멤버에게 알림
      const boardInfo = await getCardBoardInfo(supabase, checklist.card_id)
      if (boardInfo) {
        await notifyBoardMembers({
          boardId: boardInfo.boardId,
          excludeUserId: user.id,
          type: 'checklist_item_added',
          title: '할 일이 추가되었습니다',
          message: `"${boardInfo.cardTitle}" 카드의 "${checklist.title}"에 "${input.content}" 항목이 추가되었습니다`,
          link: `/board/${boardInfo.boardId}`,
          cardId: checklist.card_id,
        })
      }
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 항목 정보 먼저 조회
    const { data: item } = await supabase
      .from('checklist_items')
      .select('content, checklist_id')
      .eq('id', input.id)
      .single()

    const { error } = await supabase
      .from('checklist_items')
      .update({ is_checked: input.isChecked })
      .eq('id', input.id)

    if (error) {
      console.error('항목 토글 에러:', error)
      return { success: false, error: '항목 업데이트에 실패했습니다.' }
    }

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    if (item?.checklist_id) {
      const { data: checklist } = await supabase
        .from('checklists')
        .select('card_id, title')
        .eq('id', item.checklist_id)
        .single()

      if (checklist?.card_id) {
        await supabase
          .from('cards')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', checklist.card_id)

        // 체크 완료 시에만 알림 (해제 시에는 알림 안 함)
        if (input.isChecked) {
          const boardInfo = await getCardBoardInfo(supabase, checklist.card_id)
          if (boardInfo) {
            await notifyBoardMembers({
              boardId: boardInfo.boardId,
              excludeUserId: user.id,
              type: 'checklist_item_checked',
              title: '할 일이 완료되었습니다 ✅',
              message: `"${boardInfo.cardTitle}" 카드에서 "${item.content}" 항목이 완료되었습니다`,
              link: `/board/${boardInfo.boardId}`,
              cardId: checklist.card_id,
            })
          }
        }
      }
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

    // 삭제 전에 체크리스트 ID 가져오기
    const { data: item } = await supabase
      .from('checklist_items')
      .select('checklist_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('항목 삭제 에러:', error)
      return { success: false, error: '항목 삭제에 실패했습니다.' }
    }

    // 카드의 updated_at 업데이트 (주간보고 자동 수집을 위해)
    if (item?.checklist_id) {
      const { data: checklist } = await supabase
        .from('checklists')
        .select('card_id')
        .eq('id', item.checklist_id)
        .single()

      if (checklist?.card_id) {
        await supabase
          .from('cards')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', checklist.card_id)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('항목 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
