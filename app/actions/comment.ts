'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Comment } from '@/types'
import { createNotification } from './notification'

// 카드의 댓글 목록 조회
export async function getComments(cardId: string): Promise<ActionResult<Comment[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        user:profiles!comments_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('댓글 조회 에러:', error)
      return { success: false, error: '댓글을 불러오는데 실패했습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('댓글 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 댓글 작성
export async function createComment(input: {
  cardId: string
  content: string
}): Promise<ActionResult<Comment>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        card_id: input.cardId,
        user_id: user.id,
        content: input.content,
      })
      .select(
        `
        *,
        user:profiles!comments_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('댓글 작성 에러:', error)
      return { success: false, error: '댓글 작성에 실패했습니다.' }
    }

    // 알림 보내기: 카드 담당자, 생성자, 보드 소유자에게
    try {
      // 카드 정보 가져오기
      const { data: card } = await supabase
        .from('cards')
        .select('id, title, assignee_id, created_by, list_id')
        .eq('id', input.cardId)
        .single()

      console.log('[댓글 알림] 카드 정보:', card)

      if (card) {
        // 리스트 정보 가져오기
        const { data: list } = await supabase
          .from('lists')
          .select('board_id')
          .eq('id', card.list_id)
          .single()

        console.log('[댓글 알림] 리스트 정보:', list)

        let boardOwnerId: string | null = null
        if (list?.board_id) {
          // 보드 소유자 가져오기
          const { data: board } = await supabase
            .from('boards')
            .select('created_by')
            .eq('id', list.board_id)
            .single()

          console.log('[댓글 알림] 보드 정보:', board)
          boardOwnerId = board?.created_by || null
        }

        const notifyUserIds = new Set<string>()

        // 담당자에게 알림 (본인 제외)
        if (card.assignee_id && card.assignee_id !== user.id) {
          notifyUserIds.add(card.assignee_id)
        }

        // 카드 생성자에게 알림 (본인 제외)
        if (card.created_by && card.created_by !== user.id) {
          notifyUserIds.add(card.created_by)
        }

        // 보드 소유자에게 알림 (본인 제외)
        if (boardOwnerId && boardOwnerId !== user.id) {
          notifyUserIds.add(boardOwnerId)
        }

        console.log('[댓글 알림] 알림 대상 목록:', Array.from(notifyUserIds))

        // 알림 생성
        for (const targetUserId of notifyUserIds) {
          console.log('[댓글 알림] 알림 생성 시도:', targetUserId)
          const result = await createNotification({
            userId: targetUserId,
            type: 'comment',
            title: '새 댓글이 달렸습니다',
            message: `"${card.title}" 카드에 댓글: ${input.content.slice(0, 50)}${
              input.content.length > 50 ? '...' : ''
            }`,
            link: list?.board_id ? `/board/${list.board_id}` : undefined,
            boardId: list?.board_id || undefined,
            cardId: input.cardId,
            senderId: user.id,
          })
          console.log('[댓글 알림] 생성 결과:', result)
        }
      }
    } catch (notifyError) {
      // 알림 실패해도 댓글은 성공으로 처리
      console.error('댓글 알림 발송 에러:', notifyError)
    }

    return { success: true, data }
  } catch (error) {
    console.error('댓글 작성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 댓글 수정
export async function updateComment(input: {
  id: string
  content: string
}): Promise<ActionResult<Comment>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .update({
        content: input.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select(
        `
        *,
        user:profiles!comments_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .single()

    if (error) {
      console.error('댓글 수정 에러:', error)
      return { success: false, error: '댓글 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('댓글 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 댓글 삭제
export async function deleteComment(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      console.error('댓글 삭제 에러:', error)
      return { success: false, error: '댓글 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('댓글 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
