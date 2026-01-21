'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  CompletedCard, 
  CompletionStats,
  PeriodFilter 
} from '@/app/actions/completed'

interface CompletedState {
  // 데이터 상태
  period: PeriodFilter
  cards: CompletedCard[]
  stats: CompletionStats | null
  isLoading: boolean
  selectedCards: Set<string>


  // 액션
  setPeriod: (period: PeriodFilter) => void
  setCards: (cards: CompletedCard[]) => void
  setStats: (stats: CompletionStats | null) => void
  setIsLoading: (loading: boolean) => void
  setSelectedCards: (cards: Set<string>) => void
  toggleSelectAll: (allCardIds: string[]) => void
  toggleSelect: (cardId: string) => void

  resetAll: () => void
}

export const useCompletedStore = create<CompletedState>()(
  immer((set, get) => ({
    // 초기 상태
    period: 'all',
    cards: [],
    stats: null,
    isLoading: true,
    selectedCards: new Set(),


    // 기본 액션
    setPeriod: (period) => set((state) => { state.period = period }),
    setCards: (cards) => set((state) => { state.cards = cards }),
    setStats: (stats) => set((state) => { state.stats = stats }),
    setIsLoading: (loading) => set((state) => { state.isLoading = loading }),
    setSelectedCards: (cards) => set((state) => { state.selectedCards = cards }),
    
    toggleSelectAll: (allCardIds) => set((state) => {
      if (state.selectedCards.size === allCardIds.length) {
        state.selectedCards = new Set()
      } else {
        state.selectedCards = new Set(allCardIds)
      }
    }),
    
    toggleSelect: (cardId) => set((state) => {
      const newSet = new Set(state.selectedCards)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      state.selectedCards = newSet
    }),

    resetAll: () => set((state) => {
      state.period = 'all'
      state.cards = []
      state.stats = null
      state.isLoading = true
      state.selectedCards = new Set()
    }),
  }))
)
