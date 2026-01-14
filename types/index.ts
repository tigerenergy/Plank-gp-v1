// 짭렐로 타입 정의

export interface Board {
  id: string
  title: string
  background_image: string | null
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  title: string
  position: number
  board_id: string
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  title: string
  description: string | null
  position: number
  list_id: string
  due_date: string | null
  created_at: string
  updated_at: string
}

// 컬럼 색상 타입 (UI용 하드코딩)
export type ListColor = 'rose' | 'amber' | 'sky' | 'emerald' | 'violet'

// 확장된 리스트 타입 (카드 포함)
export interface ListWithCards extends List {
  cards: Card[]
  color: ListColor // UI용 색상 (DB에는 없음)
}

// 서버 액션 응답 타입
export interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

// 카드 생성 입력 타입
export interface CreateCardInput {
  list_id: string
  title: string
  description?: string
  due_date?: string
}

// 카드 수정 입력 타입
export interface UpdateCardInput {
  id: string
  title?: string
  description?: string | null
  due_date?: string | null
}

// 카드 이동 입력 타입
export interface MoveCardInput {
  cardId: string
  targetListId: string
  newPosition: number
}

// 리스트 생성 입력 타입
export interface CreateListInput {
  board_id: string
  title: string
}
