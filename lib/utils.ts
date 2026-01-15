import type { ListColor } from '@/types'

// 리스트 색상에 따른 다크/라이트 모드 스타일
export const listColorClasses: Record<ListColor, { 
  gradient: string
  text: string
  headerBg: string
  badge: string
  accent: string
  dotPrimary: string
  dotSecondary: string
}> = {
  rose: {
    gradient: 'column-glass-rose',
    text: 'text-pink-600 dark:text-[#f9a8d4]',
    headerBg: 'bg-pink-50 dark:bg-[#f9a8d4]/5',
    badge: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300',
    accent: '#ec4899',
    dotPrimary: 'bg-pink-400 dark:bg-[#f9a8d4]',
    dotSecondary: 'bg-pink-600 dark:bg-[#ec4899]',
  },
  amber: {
    gradient: 'column-glass-amber',
    text: 'text-amber-600 dark:text-[#fcd34d]',
    headerBg: 'bg-amber-50 dark:bg-[#fcd34d]/5',
    badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300',
    accent: '#f59e0b',
    dotPrimary: 'bg-amber-400 dark:bg-[#fcd34d]',
    dotSecondary: 'bg-amber-600 dark:bg-[#f59e0b]',
  },
  sky: {
    gradient: 'column-glass-sky',
    text: 'text-sky-600 dark:text-[#7dd3fc]',
    headerBg: 'bg-sky-50 dark:bg-[#7dd3fc]/5',
    badge: 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300',
    accent: '#0ea5e9',
    dotPrimary: 'bg-sky-400 dark:bg-[#7dd3fc]',
    dotSecondary: 'bg-sky-600 dark:bg-[#3b82f6]',
  },
  emerald: {
    gradient: 'column-glass-emerald',
    text: 'text-emerald-600 dark:text-[#6ee7b7]',
    headerBg: 'bg-emerald-50 dark:bg-[#6ee7b7]/5',
    badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
    accent: '#10b981',
    dotPrimary: 'bg-emerald-400 dark:bg-[#6ee7b7]',
    dotSecondary: 'bg-emerald-600 dark:bg-[#22c55e]',
  },
  violet: {
    gradient: 'column-glass-violet',
    text: 'text-violet-600 dark:text-[#c4b5fd]',
    headerBg: 'bg-violet-50 dark:bg-[#c4b5fd]/5',
    badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300',
    accent: '#8b5cf6',
    dotPrimary: 'bg-violet-400 dark:bg-[#c4b5fd]',
    dotSecondary: 'bg-violet-600 dark:bg-[#8b5cf6]',
  },
}

// 리스트 인덱스에 따른 색상 반환
const LIST_COLORS: ListColor[] = ['rose', 'amber', 'sky', 'emerald', 'violet']

export function getListColor(index: number): ListColor {
  return LIST_COLORS[index % LIST_COLORS.length]
}

// 날짜 포맷팅 (한국어)
export function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 지난 날짜
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}일 지남`
  }
  // 오늘
  if (diffDays === 0) {
    return '오늘'
  }
  // 내일
  if (diffDays === 1) {
    return '내일'
  }
  // 일주일 이내
  if (diffDays <= 7) {
    return `${diffDays}일 남음`
  }
  
  // 그 외 날짜 표시
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

// D-day 형식 날짜 표시
export function formatShortDate(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  
  // 시간 제외하고 날짜만 비교
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diffTime = dateOnly.getTime() - nowOnly.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  // D-day 형식
  if (diffDays < -7) {
    return `${Math.abs(diffDays)}일 지남`
  }
  if (diffDays < 0) {
    return `D+${Math.abs(diffDays)}`
  }
  if (diffDays === 0) {
    return 'D-Day'
  }
  if (diffDays === 1) {
    return 'D-1'
  }
  if (diffDays <= 7) {
    return `D-${diffDays}`
  }
  
  // 일주일 이상은 날짜 표시
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

// 마감일 상태 반환
export function getDueDateStatus(dateString: string | null): 'overdue' | 'today' | 'soon' | 'normal' {
  if (!dateString) return 'normal'
  
  const date = new Date(dateString)
  const now = new Date()
  
  // 시간 제외하고 날짜만 비교
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diffTime = dateOnly.getTime() - nowOnly.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 2) return 'soon'
  return 'normal'
}

// 마감일 색상 클래스 (하위호환)
export function getDueDateColorClass(dateString: string | null): string {
  const status = getDueDateStatus(dateString)
  
  switch (status) {
    case 'overdue':
      return 'date-badge-overdue'
    case 'today':
      return 'date-badge-today'
    case 'soon':
      return 'date-badge-soon'
    default:
      return 'date-badge-normal'
  }
}

// 순서 계산 유틸리티 (사이에 삽입 시)
export function calculateNewPosition(beforePosition: number | null, afterPosition: number | null): number {
  if (beforePosition === null && afterPosition === null) {
    return 1
  }
  if (beforePosition === null) {
    return afterPosition! / 2
  }
  if (afterPosition === null) {
    return beforePosition + 1
  }
  return (beforePosition + afterPosition) / 2
}

// UUID 유효성 검사
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// 태그 색상 생성 (텍스트 기반)
export function getTagColor(tag: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-red-400', text: 'text-white' },
    { bg: 'bg-orange-400', text: 'text-orange-900' },
    { bg: 'bg-amber-400', text: 'text-amber-900' },
    { bg: 'bg-emerald-400', text: 'text-emerald-900' },
    { bg: 'bg-cyan-400', text: 'text-cyan-900' },
    { bg: 'bg-blue-400', text: 'text-white' },
    { bg: 'bg-purple-400', text: 'text-white' },
    { bg: 'bg-pink-400', text: 'text-white' },
  ]
  
  // 간단한 해시 함수
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}
