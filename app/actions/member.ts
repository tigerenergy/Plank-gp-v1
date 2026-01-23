'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/types'

// 현재 사용자가 특정 보드의 멤버인지 확인
// 🚀 병렬 조회로 최적화 (2 sequential → 2 parallel)
export async function checkBoardMembership(
  boardId: string
): Promise<ActionResult<{ isMember: boolean; isOwner: boolean }>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: true, data: { isMember: false, isOwner: false } }
    }

    // 🚀 보드 정보와 멤버십을 병렬로 조회
    const [boardResult, membershipResult] = await Promise.all([
      supabase
        .from('boards')
        .select('created_by')
        .eq('id', boardId)
        .maybeSingle(),
      supabase
        .from('board_members')
        .select('user_id')
        .eq('board_id', boardId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    const isOwner = boardResult.data?.created_by === user.id
    const isMember = isOwner || !!membershipResult.data

    return { success: true, data: { isMember, isOwner } }
  } catch (error) {
    console.error('멤버십 확인 에러:', error)
    return { success: true, data: { isMember: false, isOwner: false } }
  }
}

// 특정 보드의 실제 멤버 목록 (board_members 테이블 + 보드 소유자)
// 🚀 병렬 조회로 최적화 (2 sequential → 2 parallel)
export async function getBoardMembers(boardId: string): Promise<ActionResult<Profile[]>> {
  try {
    const supabase = await createClient()

    // 🚀 멤버와 보드 소유자를 병렬로 조회
    const [memberResult, boardResult] = await Promise.all([
      supabase
        .from('board_members')
        .select(
          `
          user_id,
          profile:profiles!user_id(*)
        `
        )
        .eq('board_id', boardId),
      supabase
        .from('boards')
        .select(
          `
          created_by,
          creator:profiles!boards_created_by_fkey(*)
        `
        )
        .eq('id', boardId)
        .single(),
    ])

    if (memberResult.error) {
      console.error('보드 멤버 목록 조회 에러:', memberResult.error)
      return { success: false, error: '보드 멤버 목록을 불러오는데 실패했습니다.' }
    }

    // 🚀 Set으로 O(1) 중복 체크 (js-set-map-lookups)
    const memberIds = new Set<string>()
    const members: Profile[] = []

    // 보드 소유자 먼저 추가
    if (boardResult.data?.creator) {
      const creator = boardResult.data.creator as unknown as Profile
      if (creator) {
        members.push(creator)
        memberIds.add(creator.id)
      }
    }

    // board_members 추가 (중복 제외)
    if (memberResult.data) {
      for (const item of memberResult.data) {
        const profile = item.profile as unknown as Profile | null
        if (profile && !memberIds.has(profile.id)) {
          members.push(profile)
          memberIds.add(profile.id)
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

    const { data, error } = await supabase.from('profiles').select('*')

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

// 사용자가 접근 가능한 보드의 모든 멤버 조회 (주간보고 공유용)
export async function getSharedBoardMembers(): Promise<ActionResult<Profile[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 사용자가 멤버인 모든 보드 ID 조회
    const { data: userBoards, error: boardsError } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', user.id)

    if (boardsError) {
      console.error('보드 멤버 조회 에러:', boardsError)
      return { success: false, error: '보드 정보를 조회할 수 없습니다.' }
    }

    // 사용자가 소유한 보드도 포함
    const { data: ownedBoards, error: ownedError } = await supabase
      .from('boards')
      .select('id')
      .eq('created_by', user.id)

    if (ownedError) {
      console.error('소유 보드 조회 에러:', ownedError)
    }

    // 모든 접근 가능한 보드 ID 수집
    const boardIds = new Set<string>()
    userBoards?.forEach((mb) => boardIds.add(mb.board_id))
    ownedBoards?.forEach((b) => boardIds.add(b.id))

    if (boardIds.size === 0) {
      return { success: true, data: [] }
    }

    // 모든 보드의 멤버 조회
    const { data: allMembers, error: membersError } = await supabase
      .from('board_members')
      .select(`
        user_id,
        profile:profiles!user_id(*)
      `)
      .in('board_id', Array.from(boardIds))

    if (membersError) {
      console.error('멤버 조회 에러:', membersError)
      return { success: false, error: '멤버 정보를 조회할 수 없습니다.' }
    }

    // 보드 소유자도 포함
    const { data: boardOwners, error: ownersError } = await supabase
      .from('boards')
      .select(`
        created_by,
        creator:profiles!boards_created_by_fkey(*)
      `)
      .in('id', Array.from(boardIds))

    // 중복 제거하여 프로필 목록 생성
    const memberMap = new Map<string, Profile>()
    
    // board_members에서 멤버 추가
    allMembers?.forEach((item) => {
      const profile = item.profile as unknown as Profile | null
      if (profile) {
        memberMap.set(profile.id, profile)
      }
    })

    // 보드 소유자 추가
    boardOwners?.forEach((board) => {
      const creator = board.creator as unknown as Profile | null
      if (creator) {
        memberMap.set(creator.id, creator)
      }
    })

    return { success: true, data: Array.from(memberMap.values()) }
  } catch (error) {
    console.error('공유 보드 멤버 조회 에러:', error)
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
