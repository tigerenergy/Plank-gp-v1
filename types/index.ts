// Plank 타입 정의

// 프로필 (Google 로그인 사용자)
export interface Profile {
  id: string
  email: string | null
  username: string | null
  avatar_url: string | null
  updated_at: string | null
}

// 보드 멤버 역할
export type MemberRole = 'admin' | 'member' | 'viewer'

// 보드 멤버
export interface BoardMember {
  board_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  // 조인된 프로필 정보
  profile?: Profile
}

export interface Board {
  id: string
  title: string
  description: string | null
  background_image: string | null
  is_private: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // 조인된 생성자 정보 (getAllBoards에서 포함)
  creator?: Profile | null
}

export interface List {
  id: string
  title: string
  position: number
  board_id: string
  created_at: string
  updated_at: string
}

// 라벨 색상 (핵심 6가지)
export type LabelColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'

// 라벨 타입
export interface Label {
  name: string
  color: LabelColor
}

// 기본 라벨 옵션 (핵심 6가지 색상)
export const LABEL_COLORS: { color: LabelColor; name: string; bg: string; text: string }[] = [
  { color: 'red', name: '빨강', bg: 'bg-red-500', text: 'text-white' },
  { color: 'orange', name: '주황', bg: 'bg-orange-500', text: 'text-white' },
  { color: 'yellow', name: '노랑', bg: 'bg-yellow-400', text: 'text-yellow-900' },
  { color: 'green', name: '초록', bg: 'bg-green-500', text: 'text-white' },
  { color: 'blue', name: '파랑', bg: 'bg-blue-500', text: 'text-white' },
  { color: 'purple', name: '보라', bg: 'bg-purple-500', text: 'text-white' },
]

export interface Card {
  id: string
  title: string
  description: string | null
  position: number
  list_id: string
  due_date: string | null
  assignee_id: string | null
  created_by: string | null
  labels: Label[]
  created_at: string
  updated_at: string
  // 조인된 담당자 정보
  assignee?: Profile | null
  // 조인된 생성자 정보
  creator?: Profile | null
}

// 컬럼 색상 타입 (UI용 하드코딩)
export type ListColor = 'rose' | 'amber' | 'sky' | 'emerald' | 'violet'

// 확장된 리스트 타입 (카드 포함)
export interface ListWithCards extends List {
  cards: Card[]
  color: ListColor // UI용 색상 (DB에는 없음)
}

// 서버 액션 응답 타입
export interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

// 카드 생성 입력 타입
export interface CreateCardInput {
  list_id: string
  title: string
  description?: string
  due_date?: string
}

// 카드 수정 입력 타입
export interface UpdateCardInput {
  id: string
  title?: string
  description?: string | null
  due_date?: string | null
}

// 카드 이동 입력 타입
export interface MoveCardInput {
  cardId: string
  targetListId: string
  newPosition: number
}

// 리스트 생성 입력 타입
export interface CreateListInput {
  board_id: string
  title: string
}

// 댓글
export interface Comment {
  id: string
  card_id: string
  user_id: string | null
  content: string
  created_at: string
  updated_at: string
  // 조인된 유저 정보
  user?: Profile | null
}

// 체크리스트
export interface Checklist {
  id: string
  card_id: string
  title: string
  position: number
  created_at: string
  // 조인된 항목들
  items?: ChecklistItem[]
}

// 체크리스트 항목
export interface ChecklistItem {
  id: string
  checklist_id: string
  content: string
  is_checked: boolean
  position: number
  created_at: string
}

// 초대 상태
export type InvitationStatus = 'pending' | 'accepted' | 'rejected'

// 보드 초대
export interface BoardInvitation {
  id: string
  board_id: string
  inviter_id: string
  invitee_id: string
  status: InvitationStatus
  created_at: string
  updated_at: string
  // 조인된 정보
  board?: Board | null
  inviter?: Profile | null
  invitee?: Profile | null
}

// 알림 타입
export type NotificationType = 'invitation' | 'comment' | 'mention' | 'due_date'

// 알림
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  board_id: string | null
  card_id: string | null
  sender_id: string | null
  created_at: string
  // 조인된 정보
  sender?: Profile | null
  board?: Board | null
}
