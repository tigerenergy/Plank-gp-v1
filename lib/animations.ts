import type { Variants, Transition } from 'framer-motion'

// 기본 트랜지션
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
}

export const easeTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
}

// 페이드 인
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// 슬라이드 다운 (드롭다운 메뉴)
export const slideDown: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// 슬라이드 업 (모바일 바텀 시트)
export const slideUp: Variants = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
}

// 줌 인 (모달)
export const zoomIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// 카드 호버
export const cardHover: Variants = {
  initial: { y: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
  hover: { y: -2, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)' },
  tap: { scale: 0.98 },
}

// 리스트 아이템 스태거
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// 펄스 글로우 (마감일 뱃지)
export const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(251, 191, 36, 0)',
      '0 0 8px 2px rgba(251, 191, 36, 0.3)',
      '0 0 0 0 rgba(251, 191, 36, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const pulseGlowRed = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0)',
      '0 0 8px 2px rgba(239, 68, 68, 0.4)',
      '0 0 0 0 rgba(239, 68, 68, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// 드래그 오버레이
export const dragOverlay: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: { 
    scale: 1.05, 
    rotate: 2,
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(139, 92, 246, 0.5)',
  },
}

// 버튼 탭
export const buttonTap = {
  whileTap: { scale: 0.95 },
}

// 컬럼 드롭 타겟
export const dropTarget: Variants = {
  initial: { scale: 1 },
  active: { 
    scale: 1.01,
    boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.5)',
  },
}
