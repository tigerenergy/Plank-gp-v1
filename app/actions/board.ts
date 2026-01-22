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
export async function createBoard(title: string, emoji: string = '📋', startDate?: string, dueDate?: string): Promise<ActionResult<Board>> {
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
        start_date: startDate || null,
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
      { board_id: newBoard.id, title: '준비중', position: 1 },
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
// 🚀 N+1 쿼리 문제 해결: 리스트별 개별 쿼리 → 전체 카드 한 번에 조회
export async function getBoardData(boardId: string): Promise<ActionResult<ListWithCards[]>> {
  try {
    const supabase = await createClient()

    // 🚀 Promise.all로 리스트와 카드를 병렬 조회 (2 쿼리로 최적화)
    const [listsResult, cardsResult] = await Promise.all([
      // 리스트 조회
      supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true }),
      // 모든 카드를 한 번에 조회 (보드의 모든 리스트에 속한 카드)
      supabase
        .from('cards')
        .select(
          `
          *,
          assignee:profiles!cards_assignee_id_fkey(id, email, username, avatar_url),
          creator:profiles!cards_created_by_fkey(id, email, username, avatar_url),
          completed_by_profile:profiles!cards_completed_by_fkey(id, email, username, avatar_url),
          list:lists!cards_list_id_fkey(board_id)
        `
        )
        .order('position', { ascending: true }),
    ])

    if (listsResult.error) {
      console.error('리스트 조회 에러:', listsResult.error)
      return { success: false, error: '리스트를 불러오는데 실패했습니다.' }
    }

    const lists = listsResult.data || []

    // 카드 조회 실패 시 빈 배열로 처리
    const allCards = cardsResult.data || []

    // 🚀 Map으로 O(1) 조회를 위한 인덱스 생성 (js-index-maps)
    const cardsByListId = new Map<string, Card[]>()

    // 현재 보드에 속한 카드만 필터링 & 리스트별 그룹핑
    for (const card of allCards) {
      // list 관계에서 board_id 확인
      const cardBoardId = (card.list as { board_id: string } | null)?.board_id
      if (cardBoardId !== boardId) continue

      const listId = card.list_id
      if (!cardsByListId.has(listId)) {
        cardsByListId.set(listId, [])
      }
      // list 필드 제거 후 저장 (클라이언트에 불필요)
      const { list: _, ...cardWithoutList } = card
      cardsByListId.get(listId)!.push(cardWithoutList as Card)
    }

    // 리스트에 카드 매핑
    const listsWithCards: ListWithCards[] = lists.map((list, index) => ({
      ...list,
      cards: cardsByListId.get(list.id) || [],
      color: getListColor(index),
    }))

    return { success: true, data: listsWithCards }
  } catch (error) {
    console.error('보드 데이터 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
