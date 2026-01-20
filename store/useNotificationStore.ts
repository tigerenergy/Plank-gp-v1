'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Notification, BoardInvitation } from '@/types'

interface NotificationState {
  // 상태
  isOpen: boolean
  notifications: Notification[]
  invitations: BoardInvitation[]
  isLoading: boolean
  processingId: string | null

  // 액션
  setIsOpen: (isOpen: boolean) => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setInvitations: (invitations: BoardInvitation[]) => void
  removeInvitation: (id: string) => void
  setIsLoading: (loading: boolean) => void
  setProcessingId: (id: string | null) => void
  
  // 계산된 값
  getUnreadCount: () => number
  getPendingInviteCount: () => number
  getTotalCount: () => number
}

export const useNotificationStore = create<NotificationState>()(
  immer((set, get) => ({
    // 초기 상태
    isOpen: false,
    notifications: [],
    invitations: [],
    isLoading: false,
    processingId: null,

    // 액션
    setIsOpen: (isOpen) => set((state) => { 
      state.isOpen = isOpen 
    }),
    
    setNotifications: (notifications) => set((state) => { 
      // 읽지 않은 알림만 저장
      state.notifications = notifications.filter((n) => !n.is_read) 
    }),
    
    addNotification: (notification) => set((state) => {
      state.notifications.unshift(notification)
    }),
    
    removeNotification: (id) => set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id)
    }),
    
    clearNotifications: () => set((state) => {
      state.notifications = []
    }),
    
    setInvitations: (invitations) => set((state) => { 
      state.invitations = invitations 
    }),
    
    removeInvitation: (id) => set((state) => {
      state.invitations = state.invitations.filter((inv) => inv.id !== id)
    }),
    
    setIsLoading: (loading) => set((state) => { 
      state.isLoading = loading 
    }),
    
    setProcessingId: (id) => set((state) => { 
      state.processingId = id 
    }),

    // 계산된 값
    getUnreadCount: () => {
      const { notifications } = get()
      return notifications.filter((n) => !n.is_read).length
    },
    
    getPendingInviteCount: () => {
      const { invitations } = get()
      return invitations.length
    },
    
    getTotalCount: () => {
      const { notifications, invitations } = get()
      return notifications.filter((n) => !n.is_read).length + invitations.length
    },
  }))
)
