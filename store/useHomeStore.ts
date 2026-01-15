'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Board } from '@/types'

interface HomeState {
  // 데이터
  boards: Board[]
  isLoading: boolean

  // UI 상태
  isCreating: boolean
  newBoardTitle: string
  editingBoardId: string | null
  editingTitle: string
  deleteTarget: Board | null

  // 액션
  setBoards: (boards: Board[]) => void
  setLoading: (loading: boolean) => void
  addBoard: (board: Board) => void
  updateBoard: (boardId: string, updates: Partial<Board>) => void
  removeBoard: (boardId: string) => void

  // UI 액션
  startCreating: () => void
  cancelCreating: () => void
  setNewBoardTitle: (title: string) => void

  startEditing: (board: Board) => void
  cancelEditing: () => void
  setEditingTitle: (title: string) => void

  setDeleteTarget: (board: Board | null) => void
  reset: () => void
}

const initialState = {
  boards: [],
  isLoading: true,
  isCreating: false,
  newBoardTitle: '',
  editingBoardId: null,
  editingTitle: '',
  deleteTarget: null,
}

export const useHomeStore = create<HomeState>()(
  immer((set) => ({
    ...initialState,

    setBoards: (boards) =>
      set((state) => {
        state.boards = boards
        state.isLoading = false
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    addBoard: (board) =>
      set((state) => {
        state.boards.unshift(board)
      }),

    updateBoard: (boardId, updates) =>
      set((state) => {
        const index = state.boards.findIndex((b) => b.id === boardId)
        if (index !== -1) {
          Object.assign(state.boards[index], updates)
        }
      }),

    removeBoard: (boardId) =>
      set((state) => {
        state.boards = state.boards.filter((b) => b.id !== boardId)
      }),

    // UI 액션
    startCreating: () =>
      set((state) => {
        state.isCreating = true
      }),

    cancelCreating: () =>
      set((state) => {
        state.isCreating = false
        state.newBoardTitle = ''
      }),

    setNewBoardTitle: (title) =>
      set((state) => {
        state.newBoardTitle = title
      }),

    startEditing: (board) =>
      set((state) => {
        state.editingBoardId = board.id
        state.editingTitle = board.title
      }),

    cancelEditing: () =>
      set((state) => {
        state.editingBoardId = null
        state.editingTitle = ''
      }),

    setEditingTitle: (title) =>
      set((state) => {
        state.editingTitle = title
      }),

    setDeleteTarget: (board) =>
      set((state) => {
        state.deleteTarget = board
      }),

    reset: () => set(() => initialState),
  }))
)
