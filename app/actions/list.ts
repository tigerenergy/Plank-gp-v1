'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, List } from '@/types'
import { createListSchema, updateListSchema } from '@/schema/validation'

// 리스트 생성
export async function createList(input: {
  board_id: string
  title: string
}): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()
    
    // 유효성 검사
    const validation = createListSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // 기존 리스트의 최대 position 값 조회
    const { data: maxPositionData } = await supabase
      .from('lists')
      .select('position')
      .eq('board_id', input.board_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxPositionData?.position ?? 0) + 1

    const { data, error } = await supabase
      .from('lists')
      .insert({
        board_id: input.board_id,
        title: input.title,
        position: newPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('리스트 생성 에러:', error)
      return { success: false, error: '리스트 생성에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('리스트 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 리스트 수정
export async function updateList(input: {
  id: string
  title?: string
}): Promise<ActionResult<List>> {
  try {
    const supabase = await createClient()
    
    // 유효성 검사
    const validation = updateListSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    const updates: Partial<List> = {}
    if (input.title !== undefined) updates.title = input.title

    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      console.error('리스트 수정 에러:', error)
      return { success: false, error: '리스트 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('리스트 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 리스트 삭제
export async function deleteList(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('lists').delete().eq('id', id)

    if (error) {
      console.error('리스트 삭제 에러:', error)
      return { success: false, error: '리스트 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('리스트 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
