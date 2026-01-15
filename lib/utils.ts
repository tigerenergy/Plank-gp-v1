import type { ListColor } from '@/types'

// 리스트 색상에 따른 다크 모드 + 파스텔 스타일
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
    text: 'text-[#f9a8d4]',
    headerBg: 'bg-[#f9a8d4]/5',
    badge: 'badge-rose',
    accent: '#f9a8d4',
    dotPrimary: 'bg-[#f9a8d4]',
    dotSecondary: 'bg-[#ec4899]',
  },
  amber: {
    gradient: 'column-glass-amber',
    text: 'text-[#fcd34d]',
    headerBg: 'bg-[#fcd34d]/5',
    badge: 'badge-amber',
    accent: '#fcd34d',
    dotPrimary: 'bg-[#fcd34d]',
    dotSecondary: 'bg-[#f59e0b]',
  },
  sky: {
    gradient: 'column-glass-sky',
    text: 'text-[#7dd3fc]',
    headerBg: 'bg-[#7dd3fc]/5',
    badge: 'badge-sky',
    accent: '#7dd3fc',
    dotPrimary: 'bg-[#7dd3fc]',
    dotSecondary: 'bg-[#3b82f6]',
  },
  emerald: {
    gradient: 'column-glass-emerald',
    text: 'text-[#6ee7b7]',
    headerBg: 'bg-[#6ee7b7]/5',
    badge: 'badge-emerald',
    accent: '#6ee7b7',
    dotPrimary: 'bg-[#6ee7b7]',
    dotSecondary: 'bg-[#22c55e]',
  },
  violet: {
    gradient: 'column-glass-violet',
    text: 'text-[#c4b5fd]',
    headerBg: 'bg-[#c4b5fd]/5',
    badge: 'badge-violet',
    accent: '#c4b5fd',
    dotPrimary: 'bg-[#c4b5fd]',
    dotSecondary: 'bg-[#8b5cf6]',
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

// 간단한 날짜 표시 (월 일)
export function formatShortDate(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  
  return `${month} ${day}`
}

// 마감일 색상 클래스
export function getDueDateColorClass(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'date-badge-overdue'
  }
  if (diffDays <= 1) {
    return 'date-badge-soon'
  }
  return 'date-badge-normal'
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
