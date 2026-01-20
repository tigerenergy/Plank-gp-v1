// 🚀 Zustand 스토어 통합 관리
// React Compiler + Zustand로 상태 관리 최적화

// 보드 상태 관리 (카드 모달, 리스트, 멤버 등)
export { useBoardStore } from './useBoardStore'
export type { CardModalTab } from './useBoardStore'

// 홈 화면 상태 관리 (보드 목록, 생성/수정/삭제)
export { useHomeStore } from './useHomeStore'

// 네비게이션 상태 관리 (로딩 상태)
export { useNavigationStore } from './useNavigationStore'

// 임시 저장 상태 관리 (드래프트)
export { useDraftStore } from './useDraftStore'

// 완료 페이지 상태 관리 (통계, 보고서, 이메일)
export { useCompletedStore } from './useCompletedStore'

// 알림 상태 관리 (알림, 초대)
export { useNotificationStore } from './useNotificationStore'
