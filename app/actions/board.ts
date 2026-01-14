'use server'

import { supabase } from '@/lib/supabase'
import type { ActionResult, Board, ListWithCards, Card } from '@/types'
import { getListColor } from '@/lib/utils'

// 모든 보드 목록 조회
export async function getAllBoards(): Promise<ActionResult<Board[]>> {
  try {
    const { data: boards, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('보드 목록 조회 에러:', error)
      return { success: false, error: '보드 목록을 불러오는데 실패했습니다.' }
    }

    return { success: true, data: boards || [] }
  } catch (error) {
    console.error('보드 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 생성
export async function createBoard(title: string): Promise<ActionResult<Board>> {
  try {
    const { data: newBoard, error: createError } = await supabase
      .from('boards')
      .insert({ title })
      .select()
      .single()

    if (createError) {
      console.error('보드 생성 에러:', createError)
      return { success: false, error: '보드 생성에 실패했습니다.' }
    }

    // 기본 리스트 생성
    await supabase.from('lists').insert([
      { board_id: newBoard.id, title: '할 일', position: 1 },
      { board_id: newBoard.id, title: '진행 중', position: 2 },
      { board_id: newBoard.id, title: '검토 요청', position: 3 },
      { board_id: newBoard.id, title: '완료', position: 4 },
    ])

    return { success: true, data: newBoard }
  } catch (error) {
    console.error('보드 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드 삭제
export async function deleteBoard(boardId: string): Promise<ActionResult> {
  try {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)

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
    const { data: board, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single()

    if (error) {
      // PGRST116: 결과가 0개인 경우 (보드가 존재하지 않음)
      if (error.code === 'PGRST116') {
        return { success: false, error: '보드를 찾을 수 없습니다. 삭제되었거나 존재하지 않는 보드입니다.' }
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

    // 각 리스트의 카드 조회
    const listsWithCards: ListWithCards[] = await Promise.all(
      lists.map(async (list, index) => {
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('list_id', list.id)
          .order('position', { ascending: true })

        if (cardsError) {
          console.error('카드 조회 에러:', cardsError)
          return { 
            ...list, 
            cards: [] as Card[], 
            color: getListColor(index) 
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
