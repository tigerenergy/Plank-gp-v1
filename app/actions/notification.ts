'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Notification, NotificationType } from '@/types'

// 내 알림 목록 조회
export async function getMyNotifications(): Promise<ActionResult<Notification[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 알림 목록 조회 (조인 없이)
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('알림 조회 에러:', error)
      return { success: false, error: '알림을 불러오는데 실패했습니다.' }
    }

    if (!notifications || notifications.length === 0) {
      return { success: true, data: [] }
    }

    // 발신자 ID 목록 추출
    const senderIds = [...new Set(notifications.map((n) => n.sender_id).filter(Boolean))]

    // 발신자 프로필 조회
    let senderMap: Record<
      string,
      { id: string; email: string; username: string | null; avatar_url: string | null }
    > = {}
    if (senderIds.length > 0) {
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .in('id', senderIds)

      if (senders) {
        senderMap = Object.fromEntries(senders.map((s) => [s.id, s]))
      }
    }

    // 보드 ID 목록 추출
    const boardIds = [...new Set(notifications.map((n) => n.board_id).filter(Boolean))]

    // 보드 정보 조회
    let boardMap: Record<string, { id: string; title: string }> = {}
    if (boardIds.length > 0) {
      const { data: boards } = await supabase.from('boards').select('id, title').in('id', boardIds)

      if (boards) {
        boardMap = Object.fromEntries(boards.map((b) => [b.id, b]))
      }
    }

    // 알림에 발신자, 보드 정보 추가
    const notificationsWithDetails = notifications.map((n) => ({
      ...n,
      sender: n.sender_id ? senderMap[n.sender_id] || null : null,
      board: n.board_id ? boardMap[n.board_id] || null : null,
    }))

    return { success: true, data: notificationsWithDetails }
  } catch (error) {
    console.error('알림 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 알림 생성 (내부용)
export async function createNotification(input: {
  userId: string
  type: NotificationType
  title: string
  message?: string
  link?: string
  boardId?: string
  cardId?: string
  senderId?: string
}): Promise<ActionResult<Notification>> {
  try {
    const supabase = await createClient()

    console.log('[createNotification] 입력값:', input)

    const insertData = {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message || null,
      link: input.link || null,
      board_id: input.boardId || null,
      card_id: input.cardId || null,
      sender_id: input.senderId || null,
    }

    console.log('[createNotification] INSERT 데이터:', insertData)

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[createNotification] 에러:', error)
      return { success: false, error: '알림 생성에 실패했습니다.' }
    }

    console.log('[createNotification] 성공:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[createNotification] 예외:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 알림 읽음 처리
export async function markAsRead(notificationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('알림 읽음 처리 에러:', error)
      return { success: false, error: '알림 읽음 처리에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('알림 읽음 처리 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 모든 알림 읽음 처리
export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('알림 읽음 처리 에러:', error)
      return { success: false, error: '알림 읽음 처리에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('알림 읽음 처리 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 알림 삭제
export async function deleteNotification(notificationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').delete().eq('id', notificationId)

    if (error) {
      console.error('알림 삭제 에러:', error)
      return { success: false, error: '알림 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('알림 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 읽지 않은 알림 개수
export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: true, data: 0 }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('알림 개수 조회 에러:', error)
      return { success: false, error: '알림 개수 조회에 실패했습니다.' }
    }

    return { success: true, data: count || 0 }
  } catch (error) {
    console.error('알림 개수 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
