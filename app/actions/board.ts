'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Board, ListWithCards, Card } from '@/types'
import { getListColor } from '@/lib/utils'

// 모든 보드 목록 조회 (팀 전체 보드)
// = 로그인한 사용자가 접근 가능한 모든 보드
export async function getAllBoards(): Promise<ActionResult<(Board & { isMember?: boolean })[]>> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 모든 보드 가져오기 (RLS가 접근 제어) - 멤버 프로필 정보 포함
    const { data: boards, error } = await supabase
      .from('boards')
      .select(`
        *,
        creator:profiles!boards_created_by_fkey(id, email, username, avatar_url),
        board_members(
          user_id,
          profile:profiles(id, email, username, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('보드 목록 조회 에러:', error)
      return { success: false, error: '보드 목록을 불러오는데 실패했습니다.' }
    }

    // 현재 사용자가 멤버인지 확인하는 플래그 추가 + 멤버 프로필 목록 추가
    const boardsWithMembership = (boards || []).map((board) => {
      const boardMembers = board.board_members as { user_id: string; profile: { id: string; email: string | null; username: string | null; avatar_url: string | null } | null }[] | null
      const isMember = boardMembers?.some((m) => m.user_id === user.id) || false
      // 멤버 프로필 정보 추출 (생성자 제외, 중복 제거)
      const members = boardMembers
        ?.filter((m) => m.profile && m.user_id !== board.created_by)
        .map((m) => m.profile!)
        .filter((profile, index, self) => 
          index === self.findIndex((p) => p.id === profile.id)
        ) || []
      // board_members 필드는 제거하고 isMember와 members만 포함
      const { board_members, ...rest } = board
      return { ...rest, isMember, members }
    })

    return { success: true, data: boardsWithMembership }
  } catch (error) {
    console.error('보드 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 생성
export async function createBoard(title: string, emoji: string = '📋', dueDate?: string): Promise<ActionResult<Board>> {
  try {
    const supabase = await createClient()

    // 현재 로그인한 사용자 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data: newBoard, error: createError } = await supabase
      .from('boards')
      .insert({
        title,
        emoji,
        created_by: user.id,
        due_date: dueDate || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('보드 생성 에러:', createError)
      return { success: false, error: '보드 생성에 실패했습니다.' }
    }

    // 기본 리스트 생성 (완료 리스트는 is_done_list: true)
    await supabase.from('lists').insert([
      { board_id: newBoard.id, title: '할 일', position: 1 },
      { board_id: newBoard.id, title: '진행 중', position: 2 },
      { board_id: newBoard.id, title: '검토 요청', position: 3 },
      { board_id: newBoard.id, title: '완료', position: 4, is_done_list: true },
    ])

    // 생성자를 admin 멤버로 추가
    await supabase.from('board_members').insert({
      board_id: newBoard.id,
      user_id: user.id,
      role: 'admin',
    })

    return { success: true, data: newBoard }
  } catch (error) {
    console.error('보드 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 삭제 (생성자만 가능)
export async function deleteBoard(boardId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 생성자 확인
    const { data: board } = await supabase
      .from('boards')
      .select('created_by')
      .eq('id', boardId)
      .single()

    if (!board) {
      return { success: false, error: '보드를 찾을 수 없습니다.' }
    }

    if (board.created_by !== user.id) {
      return { success: false, error: '보드 생성자만 삭제할 수 있습니다.' }
    }

    const { error } = await supabase.from('boards').delete().eq('id', boardId)

    if (error) {
      console.error('보드 삭제 에러:', error)
      return { success: false, error: '보드 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('보드 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 수정
export async function updateBoard(
  boardId: string,
  updates: { title?: string; background_image?: string | null }
): Promise<ActionResult<Board>> {
  try {
    const supabase = await createClient()
    const { data: updatedBoard, error } = await supabase
      .from('boards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', boardId)
      .select()
      .single()

    if (error) {
      console.error('보드 수정 에러:', error)
      return { success: false, error: '보드 수정에 실패했습니다.' }
    }

    return { success: true, data: updatedBoard }
  } catch (error) {
    console.error('보드 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 특정 보드 조회
export async function getBoard(boardId: string): Promise<ActionResult<Board>> {
  try {
    const supabase = await createClient()
    const { data: board, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single()

    if (error) {
      // PGRST116: 결과가 0개인 경우 (보드가 존재하지 않음)
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '보드를 찾을 수 없습니다. 삭제되었거나 존재하지 않는 보드입니다.',
        }
      }
      console.error('보드 조회 에러:', error)
      return { success: false, error: '보드를 불러오는데 실패했습니다.' }
    }

    return { success: true, data: board }
  } catch (error) {
    console.error('보드 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 데이터 전체 조회 (리스트 + 카드)
export async function getBoardData(boardId: string): Promise<ActionResult<ListWithCards[]>> {
  try {
    const supabase = await createClient()

    // 리스트 조회
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (listsError) {
      console.error('리스트 조회 에러:', listsError)
      return { success: false, error: '리스트를 불러오는데 실패했습니다.' }
    }

    // 각 리스트의 카드 조회 (담당자 정보 포함)
    const listsWithCards: ListWithCards[] = await Promise.all(
      lists.map(async (list, index) => {
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select(
            `
            *,
            assignee:profiles!cards_assignee_id_fkey(id, email, username, avatar_url),
            creator:profiles!cards_created_by_fkey(id, email, username, avatar_url),
            completed_by_profile:profiles!cards_completed_by_fkey(id, email, username, avatar_url)
          `
          )
          .eq('list_id', list.id)
          .order('position', { ascending: true })

        if (cardsError) {
          console.error('카드 조회 에러:', cardsError)
          return {
            ...list,
            cards: [] as Card[],
            color: getListColor(index),
          }
        }

        return {
          ...list,
          cards: cards as Card[],
          color: getListColor(index),
        }
      })
    )

    return { success: true, data: listsWithCards }
  } catch (error) {
    console.error('보드 데이터 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
