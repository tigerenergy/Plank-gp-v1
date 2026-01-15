'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface CardDraft {
  listId: string
  title: string
  updatedAt: number
}

interface CommentDraft {
  cardId: string
  content: string
  updatedAt: number
}

interface DraftState {
  // 보드 생성 드래프트
  newBoardTitle: string

  // 카드 생성 드래프트 (리스트별)
  cardDrafts: Record<string, CardDraft>

  // 댓글 드래프트 (카드별)
  commentDrafts: Record<string, CommentDraft>

  // 보드 액션
  setNewBoardTitle: (title: string) => void
  clearNewBoardTitle: () => void

  // 카드 액션
  setCardDraft: (listId: string, title: string) => void
  getCardDraft: (listId: string) => string
  clearCardDraft: (listId: string) => void

  // 댓글 액션
  setCommentDraft: (cardId: string, content: string) => void
  getCommentDraft: (cardId: string) => string
  clearCommentDraft: (cardId: string) => void

  // 전체 초기화
  clearAll: () => void
}

export const useDraftStore = create<DraftState>()(
  persist(
    immer((set, get) => ({
      newBoardTitle: '',
      cardDrafts: {},
      commentDrafts: {},

      // 보드 제목
      setNewBoardTitle: (title) =>
        set((state) => {
          state.newBoardTitle = title
        }),

      clearNewBoardTitle: () =>
        set((state) => {
          state.newBoardTitle = ''
        }),

      // 카드 드래프트
      setCardDraft: (listId, title) =>
        set((state) => {
          if (title.trim()) {
            state.cardDrafts[listId] = {
              listId,
              title,
              updatedAt: Date.now(),
            }
          } else {
            delete state.cardDrafts[listId]
          }
        }),

      getCardDraft: (listId) => {
        const draft = get().cardDrafts[listId]
        return draft?.title || ''
      },

      clearCardDraft: (listId) =>
        set((state) => {
          delete state.cardDrafts[listId]
        }),

      // 댓글 드래프트
      setCommentDraft: (cardId, content) =>
        set((state) => {
          if (content.trim()) {
            state.commentDrafts[cardId] = {
              cardId,
              content,
              updatedAt: Date.now(),
            }
          } else {
            delete state.commentDrafts[cardId]
          }
        }),

      getCommentDraft: (cardId) => {
        const draft = get().commentDrafts[cardId]
        return draft?.content || ''
      },

      clearCommentDraft: (cardId) =>
        set((state) => {
          delete state.commentDrafts[cardId]
        }),

      // 전체 초기화
      clearAll: () =>
        set((state) => {
          state.newBoardTitle = ''
          state.cardDrafts = {}
          state.commentDrafts = {}
        }),
    })),
    {
      name: 'plank-drafts',
      // 24시간 이상 된 드래프트는 자동 삭제
      onRehydrateStorage: () => (state) => {
        if (state) {
          const now = Date.now()
          const maxAge = 24 * 60 * 60 * 1000 // 24시간

          // 오래된 카드 드래프트 삭제
          Object.entries(state.cardDrafts).forEach(([key, draft]) => {
            if (now - draft.updatedAt > maxAge) {
              delete state.cardDrafts[key]
            }
          })

          // 오래된 댓글 드래프트 삭제
          Object.entries(state.commentDrafts).forEach(([key, draft]) => {
            if (now - draft.updatedAt > maxAge) {
              delete state.commentDrafts[key]
            }
          })
        }
      },
    }
  )
)
