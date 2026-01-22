'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Board, ListWithCards, Card, Profile, Comment, Checklist } from '@/types'

// 탭 타입
export type CardModalTab = 'details' | 'comments' | 'checklist'

// 스토어 상태 타입
interface BoardState {
  // 데이터
  board: Board | null
  lists: ListWithCards[]
  members: Profile[]
  isLoading: boolean
  error: string | null

  // 카드 모달 상태
  selectedCard: Card | null
  isCardModalOpen: boolean
  isNewCardMode: boolean  // 새 카드 생성 모드
  newCardListId: string | null  // 새 카드를 추가할 리스트 ID
  cardModalTab: CardModalTab
  cardComments: Comment[]
  cardChecklists: Checklist[]
  cardModalLoading: { comments: boolean; checklists: boolean }

  // 현재 사용자 (전역)
  currentUserId: string | null

  // 이전 상태 (롤백용)
  _previousLists: ListWithCards[] | null

  // 액션
  setBoard: (board: Board) => void
  setLists: (lists: ListWithCards[]) => void
  setMembers: (members: Profile[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentUserId: (userId: string | null) => void

  // 카드 모달 액션
  openCardModal: (card: Card) => void
  openNewCardModal: (listId: string) => void  // 새 카드 생성 모달 열기
  closeCardModal: () => void
  updateSelectedCard: (updates: Partial<Card>) => void
  setCardModalTab: (tab: CardModalTab) => void
  setCardComments: (comments: Comment[]) => void
  setCardChecklists: (checklists: Checklist[]) => void
  setCardModalLoading: (loading: Partial<{ comments: boolean; checklists: boolean }>) => void

  // 낙관적 업데이트 액션
  addCard: (listId: string, card: Card) => void
  updateCard: (cardId: string, updates: Partial<Card>) => void
  deleteCard: (cardId: string) => void
  moveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    newPosition: number
  ) => void

  // 리스트 액션
  addList: (list: ListWithCards) => void
  updateList: (listId: string, updates: Partial<ListWithCards>) => void
  deleteList: (listId: string) => void

  // 롤백 액션
  saveState: () => void
  rollback: () => void
  
  // 보드 전환 시 초기화
  resetBoard: () => void
}

export const useBoardStore = create<BoardState>()(
  immer((set) => ({
    // 초기 상태
    board: null,
    lists: [],
    members: [],
    isLoading: true,
    error: null,
    selectedCard: null,
    isCardModalOpen: false,
    isNewCardMode: false,
    newCardListId: null,
    cardModalTab: 'details' as CardModalTab,
    cardComments: [],
    cardChecklists: [],
    cardModalLoading: { comments: false, checklists: false },
    currentUserId: null,
    _previousLists: null,

    // 기본 세터
    setBoard: (board) =>
      set((state) => {
        state.board = board
      }),

    setLists: (lists) =>
      set((state) => {
        state.lists = lists
        state.isLoading = false
      }),

    setMembers: (members) =>
      set((state) => {
        state.members = members
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
        state.isLoading = false
      }),

    setCurrentUserId: (userId) =>
      set((state) => {
        state.currentUserId = userId
      }),

    // 카드 모달
    openCardModal: (card) =>
      set((state) => {
        state.selectedCard = card
        state.isCardModalOpen = true
        state.isNewCardMode = false
        state.newCardListId = null
        state.cardModalTab = 'details' // 탭 초기화
        state.cardComments = [] // 데이터 초기화
        state.cardChecklists = []
      }),

    // 새 카드 생성 모달 열기
    openNewCardModal: (listId) =>
      set((state) => {
        state.selectedCard = null
        state.isCardModalOpen = true
        state.isNewCardMode = true
        state.newCardListId = listId
        state.cardModalTab = 'details'
        state.cardComments = []
        state.cardChecklists = []
      }),

    closeCardModal: () =>
      set((state) => {
        state.selectedCard = null
        state.isCardModalOpen = false
        state.isNewCardMode = false
        state.newCardListId = null
        state.cardModalTab = 'details'
        state.cardComments = []
        state.cardChecklists = []
      }),

    updateSelectedCard: (updates) =>
      set((state) => {
        if (state.selectedCard) {
          Object.assign(state.selectedCard, updates)
        }
      }),

    setCardModalTab: (tab) =>
      set((state) => {
        state.cardModalTab = tab
      }),

    setCardComments: (comments) =>
      set((state) => {
        state.cardComments = comments
      }),

    setCardChecklists: (checklists) =>
      set((state) => {
        state.cardChecklists = checklists
      }),

    setCardModalLoading: (loading) =>
      set((state) => {
        Object.assign(state.cardModalLoading, loading)
      }),

    // 카드 추가
    addCard: (listId, card) =>
      set((state) => {
        const list = state.lists.find((l) => l.id === listId)
        if (list) {
          list.cards.push(card)
        }
      }),

    // 카드 수정
    updateCard: (cardId, updates) =>
      set((state) => {
        for (const list of state.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId)
          if (cardIndex !== -1) {
            Object.assign(list.cards[cardIndex], updates)
            // 모달에 열린 카드도 업데이트
            if (state.selectedCard?.id === cardId) {
              Object.assign(state.selectedCard, updates)
            }
            break
          }
        }
      }),

    // 카드 삭제
    deleteCard: (cardId) =>
      set((state) => {
        for (const list of state.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId)
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1)
            break
          }
        }
        // 모달 닫기
        if (state.selectedCard?.id === cardId) {
          state.selectedCard = null
          state.isCardModalOpen = false
        }
      }),

    // 카드 이동
    moveCard: (cardId, sourceListId, targetListId, newPosition) =>
      set((state) => {
        const sourceList = state.lists.find((l) => l.id === sourceListId)
        const targetList = state.lists.find((l) => l.id === targetListId)

        if (!sourceList || !targetList) return

        // 소스에서 카드 찾기 및 제거
        const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId)
        if (cardIndex === -1) return

        const [card] = sourceList.cards.splice(cardIndex, 1)
        card.list_id = targetListId
        card.position = newPosition

        // 타겟에 카드 추가 및 정렬
        targetList.cards.push(card)
        targetList.cards.sort((a, b) => a.position - b.position)
      }),

    // 리스트 추가
    addList: (list) =>
      set((state) => {
        state.lists.push(list)
      }),

    // 리스트 수정
    updateList: (listId, updates) =>
      set((state) => {
        const list = state.lists.find((l) => l.id === listId)
        if (list) {
          Object.assign(list, updates)
        }
      }),

    // 리스트 삭제
    deleteList: (listId) =>
      set((state) => {
        const index = state.lists.findIndex((l) => l.id === listId)
        if (index !== -1) {
          state.lists.splice(index, 1)
        }
      }),

    // 상태 저장 (롤백용)
    saveState: () =>
      set((state) => {
        state._previousLists = JSON.parse(JSON.stringify(state.lists))
      }),

    // 롤백
    rollback: () =>
      set((state) => {
        if (state._previousLists) {
          state.lists = state._previousLists
          state._previousLists = null
        }
      }),
    
    // 보드 전환 시 초기화 (새 보드 진입 전 호출)
    resetBoard: () =>
      set((state) => {
        state.board = null
        state.lists = []
        state.members = []
        state.isLoading = true
        state.error = null
        state.selectedCard = null
        state.isCardModalOpen = false
        state.isNewCardMode = false
        state.newCardListId = null
        state.cardModalTab = 'details'
        state.cardComments = []
        state.cardChecklists = []
        state._previousLists = null
      }),
  }))
)
