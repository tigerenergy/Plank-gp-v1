'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, BoardInvitation } from '@/types'

// 팀원에게 초대 발송 (userId로 직접 초대)
export async function sendInvitation(input: {
  boardId: string
  inviteeId: string
}): Promise<ActionResult<BoardInvitation>> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 자기 자신 초대 방지
    if (user.id === input.inviteeId) {
      return { success: false, error: '자기 자신은 초대할 수 없습니다.' }
    }

    // 보드 멤버인지 확인
    const { data: membership } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', input.boardId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { success: false, error: '보드 멤버만 초대할 수 있습니다.' }
    }

    // 이미 보드 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', input.boardId)
      .eq('user_id', input.inviteeId)
      .single()

    if (existingMember) {
      return { success: false, error: '이미 보드에 참여 중인 멤버입니다.' }
    }

    // 이미 초대된 상태인지 확인
    const { data: existingInvitation } = await supabase
      .from('board_invitations')
      .select('id, status')
      .eq('board_id', input.boardId)
      .eq('invitee_id', input.inviteeId)
      .single()

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        return { success: false, error: '이미 초대가 발송된 멤버입니다.' }
      }
    }

    // 초대 생성
    const { data, error } = await supabase
      .from('board_invitations')
      .insert({
        board_id: input.boardId,
        inviter_id: user.id,
        invitee_id: input.inviteeId,
        status: 'pending',
      })
      .select(`
        *,
        board:boards(id, title),
        inviter:profiles!inviter_id(id, username, email, avatar_url),
        invitee:profiles!invitee_id(id, username, email, avatar_url)
      `)
      .single()

    if (error) {
      console.error('초대 발송 에러:', error)
      return { success: false, error: '초대 발송에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('초대 발송 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 내 초대 목록 조회
export async function getMyInvitations(): Promise<ActionResult<BoardInvitation[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('board_invitations')
      .select(`
        *,
        board:boards(id, title, description),
        inviter:profiles!inviter_id(id, username, email, avatar_url)
      `)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('초대 목록 조회 에러:', error)
      return { success: false, error: '초대 목록을 불러올 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('초대 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 초대 수락
export async function acceptInvitation(invitationId: string): Promise<ActionResult<{ boardId: string }>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 초대 정보 가져오기
    const { data: invitation, error: fetchError } = await supabase
      .from('board_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !invitation) {
      return { success: false, error: '초대를 찾을 수 없습니다.' }
    }

    // 초대 상태 업데이트
    const { error: updateError } = await supabase
      .from('board_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invitationId)

    if (updateError) {
      console.error('초대 수락 에러:', updateError)
      return { success: false, error: '초대 수락에 실패했습니다.' }
    }

    // board_members에 추가
    const { error: memberError } = await supabase.from('board_members').insert({
      board_id: invitation.board_id,
      user_id: user.id,
      role: 'member',
    })

    if (memberError) {
      console.error('멤버 추가 에러:', memberError)
      // 롤백: 초대 상태 되돌리기
      await supabase
        .from('board_invitations')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', invitationId)
      return { success: false, error: '멤버 추가에 실패했습니다.' }
    }

    return { success: true, data: { boardId: invitation.board_id } }
  } catch (error) {
    console.error('초대 수락 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 초대 거절
export async function rejectInvitation(invitationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
      .from('board_invitations')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', invitationId)
      .eq('invitee_id', user.id)

    if (error) {
      console.error('초대 거절 에러:', error)
      return { success: false, error: '초대 거절에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('초대 거절 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드의 초대 목록 조회 (보드 관리자용)
export async function getBoardInvitations(boardId: string): Promise<ActionResult<BoardInvitation[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('board_invitations')
      .select(`
        *,
        inviter:profiles!inviter_id(id, username, email, avatar_url),
        invitee:profiles!invitee_id(id, username, email, avatar_url)
      `)
      .eq('board_id', boardId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('보드 초대 목록 조회 에러:', error)
      return { success: false, error: '초대 목록을 불러올 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('보드 초대 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 초대 취소 (초대한 사람만)
export async function cancelInvitation(invitationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
      .from('board_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('inviter_id', user.id)

    if (error) {
      console.error('초대 취소 에러:', error)
      return { success: false, error: '초대 취소에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('초대 취소 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
