# 📋 Plank 프로젝트 구현 현황 문서

> **프로젝트명**: Plank (구 Jjap-rello)  
> **목표**: 사내 Google Workspace 계정 기반의 보안성 높은 팀 협업 칸반 보드 도구  
> **최종 업데이트**: 2026-01-16

---

## 📊 프로젝트 개요

Plank는 트렐로 스타일의 칸반 보드 웹 애플리케이션으로, Google SSO 인증과 실시간 협업 기능을 제공합니다.

### 핵심 철학

> "단단한 기초(Plank)" 위에서 팀이 "동기화(Sync)" 되는 경험

---

## 🛠️ 기술 스택

| 분류        | 기술             | 버전    | 용도                    |
| ----------- | ---------------- | ------- | ----------------------- |
| Framework   | Next.js          | 16.x    | React 풀스택 프레임워크 |
| Language    | TypeScript       | 5.7.x   | 타입 안정성             |
| Database    | Supabase         | 2.x     | PostgreSQL + Auth + RLS |
| Styling     | Tailwind CSS     | 3.4.x   | 유틸리티 CSS            |
| Theme       | next-themes      | 0.4.x   | 다크/라이트 모드        |
| State       | Zustand          | 5.x     | 클라이언트 상태 관리    |
| Form        | react-hook-form  | 7.x     | 폼 상태 관리            |
| Validation  | Zod              | 3.x     | 스키마 유효성 검사      |
| Animation   | Framer Motion    | 12.x    | 애니메이션              |
| Drag & Drop | @dnd-kit         | 6.x/9.x | 드래그 앤 드롭          |
| Date        | react-day-picker | 9.x     | 날짜 선택기             |
| Date Utils  | date-fns         | 4.x     | 날짜 유틸리티           |
| Toast       | Sonner           | 1.x     | 알림 메시지             |

---

## ✅ 구현 완료 기능

### 🔐 Phase 1: 인증 & 테마

| 기능                  | 상태 | 설명                                       |
| --------------------- | ---- | ------------------------------------------ |
| Google SSO 로그인     | ✅   | Supabase Auth 기반 Google OAuth            |
| 다크/라이트 모드 토글 | ✅   | next-themes 적용, 시스템 설정 연동         |
| 프로필 이미지 표시    | ✅   | Google 프로필 이미지 자동 동기화           |
| 세션 관리             | ✅   | middleware.ts 기반 세션 체크 및 리다이렉트 |
| 로그아웃 기능         | ✅   | 세션 종료 및 리다이렉트                    |

### 👥 Phase 2: 협업 기능

| 기능               | 상태 | 설명                                  |
| ------------------ | ---- | ------------------------------------- |
| 보드 CRUD          | ✅   | 보드 생성/수정/삭제                   |
| 리스트 CRUD        | ✅   | 리스트 생성/수정/삭제/순서 변경       |
| 카드 CRUD          | ✅   | 카드 생성/수정/삭제/이동              |
| 팀원 목록 표시     | ✅   | 보드 멤버 아바타 목록                 |
| 카드 담당자 할당   | ✅   | 드롭다운으로 담당자 선택              |
| 카드 생성자 표시   | ✅   | 👑 왕관 배지로 생성자 구분            |
| 댓글 CRUD          | ✅   | 댓글 작성/수정/삭제 (낙관적 업데이트) |
| 체크리스트 CRUD    | ✅   | 체크리스트 및 항목 관리               |
| **팀원 초대 기능** | ✅   | 이메일로 보드 초대 발송/수락/거절     |
| **초대 알림**      | ✅   | 헤더에 초대 알림 드롭다운             |

### 📅 Phase 3: 상세 기능

| 기능              | 상태 | 설명                             |
| ----------------- | ---- | -------------------------------- |
| 카드 마감일 설정  | ✅   | DatePicker (react-day-picker)    |
| 시간 선택 기능    | ✅   | 마감 시간 설정 가능              |
| D-day 배지        | ✅   | 마감일 기준 D-day 표시           |
| 카드 라벨/태그    | ✅   | 9가지 색상 라벨 지원             |
| 드래그앤드롭      | ✅   | @dnd-kit 기반, 애니메이션 적용   |
| 체크리스트 진행률 | ✅   | 퍼센트 표시 (0%=회색, 100%=초록) |

### 🎨 UI/UX 개선

| 기능                      | 상태 | 설명                                     |
| ------------------------- | ---- | ---------------------------------------- |
| CSS 변수 시스템           | ✅   | 테마별 색상 변수 정의                    |
| Pixel Perfection          | ✅   | Tailwind 일관된 spacing                  |
| Visual Hierarchy          | ✅   | 폰트 굵기/색상 위계 적용                 |
| Hover/Active 애니메이션   | ✅   | framer-motion 전역 적용                  |
| Empty States              | ✅   | 세련된 빈 상태 UI + 애니메이션           |
| Skeleton UI               | ✅   | BoardSkeleton, HomeSkeleton              |
| 라이트 모드 가독성        | ✅   | dark:/light 분기 완료                    |
| **Typography (tracking)** | ✅   | 헤드라인 letter-spacing: -0.025em 적용   |
| **8-point Grid Spacing**  | ✅   | 모든 간격 4px/8px 단위로 통일            |
| **Rounded Corners Math**  | ✅   | 내부 Radius = 외부 Radius - Padding 적용 |
| **Clean Card Design**     | ✅   | 불필요한 테두리 제거, 그림자로 구분      |
| **Micro-copy 개선**       | ✅   | "생성" → "보드 만들기" 등 행동+목적 표현 |

### 💾 상태 관리 & 저장

| 기능              | 상태 | 설명                        |
| ----------------- | ---- | --------------------------- |
| Zustand Store     | ✅   | 보드/리스트/카드/모달 상태  |
| Draft Persistence | ✅   | 작성 중 데이터 자동 저장    |
| 낙관적 업데이트   | ✅   | 즉시 UI 반영 후 서버 동기화 |

---

## 📁 프로젝트 구조

```
app/
├── actions/                    # Server Actions
│   ├── auth.ts                 # 인증 관련 액션
│   ├── board.ts                # 보드 CRUD
│   ├── card.ts                 # 카드 CRUD
│   ├── list.ts                 # 리스트 CRUD
│   ├── comment.ts              # 댓글 CRUD
│   ├── checklist.ts            # 체크리스트 CRUD
│   ├── member.ts               # 멤버 관리
│   └── invitation.ts           # 초대 발송/수락/거절
├── auth/
│   └── callback/route.ts       # OAuth 콜백
├── board/[id]/
│   ├── page.tsx                # 보드 상세 페이지
│   ├── BoardClient.tsx         # 클라이언트 컴포넌트
│   └── loading.tsx             # 로딩 스켈레톤
├── components/
│   ├── auth/
│   │   ├── UserMenu.tsx        # 사용자 메뉴
│   │   └── InvitationDropdown.tsx # 초대 알림 드롭다운
│   ├── board/                  # 보드 관련 컴포넌트
│   │   └── InviteModal.tsx     # 팀원 초대 모달
│   ├── card/
│   │   ├── AssigneeSelect.tsx  # 담당자 선택
│   │   ├── ChecklistSection.tsx # 체크리스트
│   │   ├── CommentList.tsx     # 댓글 목록
│   │   └── LabelEditor.tsx     # 라벨 편집기
│   ├── column/                 # 컬럼 관련
│   ├── home/                   # 홈 페이지 컴포넌트
│   ├── ui/                     # 공통 UI 컴포넌트
│   ├── Card.tsx                # 카드 컴포넌트
│   ├── CardModal.tsx           # 카드 상세 모달
│   ├── Column.tsx              # 컬럼 컴포넌트
│   ├── ConfirmModal.tsx        # 확인 모달
│   └── Header.tsx              # 헤더
├── login/page.tsx              # 로그인 페이지
├── globals.css                 # 글로벌 스타일 (CSS 변수)
├── providers.tsx               # Theme + Provider 설정
├── layout.tsx                  # 루트 레이아웃
└── page.tsx                    # 홈 페이지

hooks/
├── useBoardDragDrop.ts         # 드래그앤드롭 로직
├── useOutsideClick.ts          # 외부 클릭 감지
├── useAutoFocus.ts             # 자동 포커스
├── useKeyboard.ts              # 키보드 이벤트
└── index.ts                    # 훅 내보내기

store/
├── useBoardStore.ts            # 보드/리스트/카드/모달 상태
├── useHomeStore.ts             # 홈 페이지 상태
├── useDraftStore.ts            # 드래프트 persist
└── useNavigationStore.ts       # 네비게이션 상태

lib/
├── animations.ts               # framer-motion 프리셋
├── utils.ts                    # 유틸리티 함수
└── supabase/
    ├── client.ts               # 클라이언트 Supabase
    ├── server.ts               # 서버 Supabase
    └── middleware.ts           # 미들웨어 헬퍼

schema/
└── validation.ts               # Zod 스키마

types/
└── index.ts                    # 타입 정의

supabase/migrations/            # DB 마이그레이션 파일들
```

---

## 🗃️ 데이터 모델

### 주요 엔티티

```typescript
// 프로필 (Google 로그인 사용자)
interface Profile {
  id: string
  email: string | null
  username: string | null
  avatar_url: string | null
  updated_at: string | null
}

// 보드
interface Board {
  id: string
  title: string
  description: string | null
  background_image: string | null
  is_private: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  creator?: Profile | null
}

// 리스트
interface List {
  id: string
  title: string
  position: number
  board_id: string
  created_at: string
  updated_at: string
}

// 카드
interface Card {
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
  assignee?: Profile | null
  creator?: Profile | null
}

// 댓글
interface Comment {
  id: string
  card_id: string
  user_id: string | null
  content: string
  created_at: string
  updated_at: string
  user?: Profile | null
}

// 체크리스트
interface Checklist {
  id: string
  card_id: string
  title: string
  position: number
  items?: ChecklistItem[]
}

// 체크리스트 항목
interface ChecklistItem {
  id: string
  checklist_id: string
  content: string
  is_checked: boolean
  position: number
}

// 라벨
interface Label {
  name: string
  color: LabelColor // red|orange|amber|green|teal|blue|indigo|purple|pink
}

// 보드 초대
interface BoardInvitation {
  id: string
  board_id: string
  inviter_id: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  board?: Board | null
  inviter?: Profile | null
}
```

---

## 🗄️ DB 마이그레이션 현황

| 파일                            | 상태 | 설명                        |
| ------------------------------- | ---- | --------------------------- |
| 001_add_auth.sql                | ✅   | profiles 테이블, trigger    |
| 002_add_collaboration.sql       | ✅   | board_members, assignee_id  |
| 003_fix_rls_recursion.sql       | ✅   | RLS 순환 참조 해결          |
| 004_fix_rls_simple.sql          | ✅   | RLS 단순화                  |
| 005_add_comments_checklists.sql | ✅   | 댓글, 체크리스트 테이블     |
| 006_fix_member_rls.sql          | ✅   | 멤버 RLS 수정               |
| 007_real_collaboration.sql      | ✅   | 실제 협업 모델              |
| 008_simple_team.sql             | ✅   | 단순화된 팀 모델            |
| 009_fix_avatar.sql              | ✅   | 아바타 URL 수정             |
| 010_fix_foreign_keys.sql        | ✅   | FK 명시적 지정              |
| 011_add_labels.sql              | ✅   | 라벨 JSONB 컬럼             |
| 012_add_card_creator.sql        | ✅   | created_by 컬럼             |
| 013_fix_created_by_fkey.sql     | ✅   | created_by FK 수정          |
| **014_add_invitations.sql**     | ✅   | 보드 초대 테이블 + RLS 정책 |

---

## 🔧 환경 설정

### 필수 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

---

## 🐛 해결된 주요 버그

| 문제                      | 해결 방법                                 |
| ------------------------- | ----------------------------------------- |
| 라이트 모드 가독성        | dark:/light 분기 CSS 변수 적용            |
| 체크리스트 항목 추가 버그 | 상태 업데이트 로직 수정                   |
| 댓글 표시 안됨            | FK 명시적 지정 (user:profiles!user_id)    |
| 담당자 정보 사라짐        | assignee join 추가                        |
| 중첩 form 에러            | form → div 태그 변경                      |
| 댓글 수정 버그            | 낙관적 업데이트 추가                      |
| **리스트 생성 중복**      | isSubmittingRef + useCallback로 중복 방지 |
| **댓글 삭제 버튼 UX**     | 클릭 영역 확대 + hover 시 색상 강조       |
| **카드 생성 UX**          | 생성 직후 상세 편집 모달 자동 열기        |

---

## 📋 미구현/예정 기능

| 기능             | 우선순위 | 설명                      |
| ---------------- | -------- | ------------------------- |
| 실시간 협업 반영 | 높음     | Supabase Realtime 적용    |
| 카드 첨부파일    | 중간     | 이미지/파일 업로드        |
| 카드 커버 이미지 | 낮음     | 카드 상단 이미지          |
| 키보드 단축키    | 중간     | N: 새 카드, E: 편집 등    |
| 카드 검색 기능   | 중간     | 전체 카드 검색            |
| 필터링 기능      | 중간     | 담당자, 마감일, 라벨 필터 |
| 보드 배경 이미지 | 낮음     | 배경 이미지/색상 선택     |
| Webhook 연동     | 낮음     | Slack/Discord 알림        |

---

## 📝 기술 부채

- [ ] `useState` 과다 사용 → Zustand로 이관 (일부 완료)
- [ ] 중복 컴포넌트 정리
- [ ] 타입 정의 개선

---

_빌드 상태: ✅ 성공 (npm run build)_
