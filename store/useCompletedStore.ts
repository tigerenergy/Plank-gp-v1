'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  CompletedCard, 
  CompletionStats,
  PeriodFilter 
} from '@/app/actions/completed'
import type { Report } from '@/app/actions/report'
import type { EmailLog } from '@/app/actions/email'
import type { Profile } from '@/types'

interface CompletedState {
  // 데이터 상태
  period: PeriodFilter
  cards: CompletedCard[]
  stats: CompletionStats | null
  isLoading: boolean
  selectedCards: Set<string>

  // 보고서 관련 상태
  showReportModal: boolean
  isGenerating: boolean
  reports: Report[]
  selectedReport: Report | null
  reportType: 'weekly' | 'monthly' | 'custom'
  copied: boolean

  // 이메일 관련 상태
  showEmailModal: boolean
  emailRecipients: string[]
  isSendingEmail: boolean
  emailLogs: EmailLog[]
  allUsers: Profile[]
  filteredUsers: Profile[]
  searchQuery: string
  showManualInput: boolean
  isSearching: boolean

  // 액션
  setPeriod: (period: PeriodFilter) => void
  setCards: (cards: CompletedCard[]) => void
  setStats: (stats: CompletionStats | null) => void
  setIsLoading: (loading: boolean) => void
  setSelectedCards: (cards: Set<string>) => void
  toggleSelectAll: (allCardIds: string[]) => void
  toggleSelect: (cardId: string) => void

  // 보고서 액션
  setShowReportModal: (show: boolean) => void
  setIsGenerating: (generating: boolean) => void
  setReports: (reports: Report[]) => void
  setSelectedReport: (report: Report | null) => void
  setReportType: (type: 'weekly' | 'monthly' | 'custom') => void
  setCopied: (copied: boolean) => void

  // 이메일 액션
  setShowEmailModal: (show: boolean) => void
  setEmailRecipients: (recipients: string[]) => void
  setIsSendingEmail: (sending: boolean) => void
  setEmailLogs: (logs: EmailLog[]) => void
  setAllUsers: (users: Profile[]) => void
  setFilteredUsers: (users: Profile[]) => void
  setSearchQuery: (query: string) => void
  setShowManualInput: (show: boolean) => void
  setIsSearching: (searching: boolean) => void
  
  // 편의 액션
  addRecipient: () => void
  removeRecipient: (index: number) => void
  updateRecipient: (index: number, value: string) => void
  addMemberAsRecipient: (email: string) => boolean
  removeMemberFromRecipient: (email: string) => void
  
  // 초기화
  resetEmailModal: () => void
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

    // 보고서 초기 상태
    showReportModal: false,
    isGenerating: false,
    reports: [],
    selectedReport: null,
    reportType: 'weekly',
    copied: false,

    // 이메일 초기 상태
    showEmailModal: false,
    emailRecipients: [''],
    isSendingEmail: false,
    emailLogs: [],
    allUsers: [],
    filteredUsers: [],
    searchQuery: '',
    showManualInput: false,
    isSearching: false,

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

    // 보고서 액션
    setShowReportModal: (show) => set((state) => { state.showReportModal = show }),
    setIsGenerating: (generating) => set((state) => { state.isGenerating = generating }),
    setReports: (reports) => set((state) => { state.reports = reports }),
    setSelectedReport: (report) => set((state) => { state.selectedReport = report }),
    setReportType: (type) => set((state) => { state.reportType = type }),
    setCopied: (copied) => set((state) => { state.copied = copied }),

    // 이메일 액션
    setShowEmailModal: (show) => set((state) => { state.showEmailModal = show }),
    setEmailRecipients: (recipients) => set((state) => { state.emailRecipients = recipients }),
    setIsSendingEmail: (sending) => set((state) => { state.isSendingEmail = sending }),
    setEmailLogs: (logs) => set((state) => { state.emailLogs = logs }),
    setAllUsers: (users) => set((state) => { state.allUsers = users }),
    setFilteredUsers: (users) => set((state) => { state.filteredUsers = users }),
    setSearchQuery: (query) => set((state) => { state.searchQuery = query }),
    setShowManualInput: (show) => set((state) => { state.showManualInput = show }),
    setIsSearching: (searching) => set((state) => { state.isSearching = searching }),

    // 편의 액션
    addRecipient: () => set((state) => {
      state.emailRecipients.push('')
    }),
    
    removeRecipient: (index) => set((state) => {
      if (state.emailRecipients.length > 1) {
        state.emailRecipients.splice(index, 1)
      }
    }),
    
    updateRecipient: (index, value) => set((state) => {
      state.emailRecipients[index] = value
    }),
    
    addMemberAsRecipient: (email) => {
      const { emailRecipients } = get()
      // 이미 추가된 이메일인지 확인
      if (emailRecipients.includes(email)) {
        return false
      }
      
      set((state) => {
        // 빈 항목이 있으면 그곳에 추가
        const emptyIndex = state.emailRecipients.findIndex((e) => !e.trim())
        if (emptyIndex >= 0) {
          state.emailRecipients[emptyIndex] = email
        } else {
          state.emailRecipients.push(email)
        }
      })
      return true
    },
    
    removeMemberFromRecipient: (email) => set((state) => {
      state.emailRecipients = state.emailRecipients.filter((e) => e !== email)
      if (state.emailRecipients.length === 0) {
        state.emailRecipients = ['']
      }
    }),

    // 초기화
    resetEmailModal: () => set((state) => {
      state.showEmailModal = false
      state.emailRecipients = ['']
      state.searchQuery = ''
      state.showManualInput = false
      state.filteredUsers = state.allUsers
    }),
    
    resetAll: () => set((state) => {
      state.period = 'all'
      state.cards = []
      state.stats = null
      state.isLoading = true
      state.selectedCards = new Set()
      state.showReportModal = false
      state.isGenerating = false
      state.reports = []
      state.selectedReport = null
      state.reportType = 'weekly'
      state.copied = false
      state.showEmailModal = false
      state.emailRecipients = ['']
      state.isSendingEmail = false
      state.emailLogs = []
      state.allUsers = []
      state.filteredUsers = []
      state.searchQuery = ''
      state.showManualInput = false
      state.isSearching = false
    }),
  }))
)
