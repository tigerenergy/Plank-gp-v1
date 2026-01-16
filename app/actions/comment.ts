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

    // 알림 보내기: 보드 소유자에게 (본인 제외)
    // 카드 정보 조회
    const { data: cardForNotif } = await supabase
      .from('cards')
      .select('id, title, list_id')
      .eq('id', input.cardId)
      .single()

    if (cardForNotif?.list_id) {
      // 리스트 정보 조회
      const { data: listForNotif } = await supabase
        .from('lists')
        .select('board_id')
        .eq('id', cardForNotif.list_id)
        .single()

      if (listForNotif?.board_id) {
        // 보드 소유자 조회
        const { data: boardForNotif } = await supabase
          .from('boards')
          .select('created_by')
          .eq('id', listForNotif.board_id)
          .single()

        const ownerId = boardForNotif?.created_by

        // 보드 소유자에게 알림 (본인이 아닌 경우에만)
        if (ownerId && ownerId !== user.id) {
          await supabase.from('notifications').insert({
            user_id: ownerId,
            type: 'comment',
            title: '새 댓글이 달렸습니다',
            message: `"${cardForNotif.title}" 카드에 댓글: ${input.content.slice(0, 50)}${input.content.length > 50 ? '...' : ''}`,
            link: `/board/${listForNotif.board_id}`,
            board_id: listForNotif.board_id,
            card_id: input.cardId,
            sender_id: user.id,
          })
        }
      }
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
