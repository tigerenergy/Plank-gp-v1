'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/types'

// 현재 사용자가 특정 보드의 멤버인지 확인
export async function checkBoardMembership(boardId: string): Promise<ActionResult<{ isMember: boolean; isOwner: boolean }>> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: true, data: { isMember: false, isOwner: false } }
    }

    // 보드 정보 가져오기 (소유자 확인)
    const { data: board } = await supabase
      .from('boards')
      .select('created_by')
      .eq('id', boardId)
      .single()

    const isOwner = board?.created_by === user.id

    // 멤버 확인
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .single()

    const isMember = !!membership || isOwner

    return { success: true, data: { isMember, isOwner } }
  } catch (error) {
    console.error('멤버십 확인 에러:', error)
    return { success: false, error: '멤버십 확인에 실패했습니다.' }
  }
}

// 특정 보드의 실제 멤버 목록 (board_members 테이블 기준)
export async function getBoardMembers(boardId: string): Promise<ActionResult<Profile[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('board_members')
      .select(`
        user_id,
        profile:profiles!user_id(*)
      `)
      .eq('board_id', boardId)

    if (error) {
      console.error('보드 멤버 목록 조회 에러:', error)
      return { success: false, error: '보드 멤버 목록을 불러오는데 실패했습니다.' }
    }

    // profile 데이터 추출 (Supabase 조인 결과 타입 처리)
    const members: Profile[] = []
    if (data) {
      for (const item of data) {
        const profile = item.profile as unknown as Profile | null
        if (profile) {
          members.push(profile)
        }
      }
    }

    return { success: true, data: members }
  } catch (error) {
    console.error('보드 멤버 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 팀원 목록 = 모든 로그인한 사용자
export async function getTeamMembers(): Promise<ActionResult<Profile[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) {
      console.error('팀원 목록 조회 에러:', error)
      return { success: false, error: '팀원 목록을 불러오는데 실패했습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('팀원 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 이메일로 사용자 검색 (담당자 할당용)
export async function searchUserByEmail(email: string): Promise<ActionResult<Profile[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', `%${email}%`)
      .limit(10)

    if (error) {
      console.error('사용자 검색 에러:', error)
      return { success: false, error: '사용자 검색에 실패했습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('사용자 검색 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 카드 담당자 할당
export async function assignCard(input: {
  cardId: string
  assigneeId: string | null
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('cards')
      .update({ assignee_id: input.assigneeId })
      .eq('id', input.cardId)

    if (error) {
      console.error('담당자 할당 에러:', error)
      return { success: false, error: '담당자 할당에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('담당자 할당 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
