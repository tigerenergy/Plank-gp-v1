# 🎯 Plank (플랭크)

> **Plank**는 팀 협업을 위한 실시간 칸반 보드 애플리케이션입니다.  
> Trello의 핵심 기능을 구현하면서 현대적인 기술 스택과 최적화 기법을 적용했습니다.

---

## 🚀 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.x | App Router, Server Components, Server Actions |
| **React** | 19.x | React Compiler 활성화 (자동 memoization) |
| **TypeScript** | 5.7.x | 타입 안전성 |
| **Tailwind CSS** | 3.4.x | 유틸리티 퍼스트 스타일링 |
| **Zustand** | 5.x | 클라이언트 상태 관리 |
| **Framer Motion** | 12.x | UI 애니메이션 |
| **@dnd-kit** | 6.x | 드래그 앤 드롭 |
| **React Hook Form + Zod** | 7.x / 3.x | 폼 관리 및 유효성 검사 |
| **next-themes** | 0.4.x | 다크/라이트 모드 |

### Backend
| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL, Authentication, Realtime |
| **Resend** | 이메일 발송 |
| **Google Gemini AI** | AI 기능 |

### 성능 최적화 (Vercel Best Practices 적용)
- ✅ `async-parallel` - Promise.all() 병렬 데이터 페칭
- ✅ `bundle-dynamic-imports` - next/dynamic 코드 스플리팅
- ✅ `server-cache-react` - React.cache() 요청 중복 방지
- ✅ `reactCompiler: true` - 자동 memoization

---

## ✨ 주요 기능

### 인증 시스템
- Google OAuth 로그인
- 세션 관리 (미들웨어)
- 프로필 자동 생성

### 보드 관리
- 보드 생성/수정/삭제
- 이모지 선택 기능
- 보드 멤버 초대 시스템 (이메일 초대)
- 초대 수락/거절

### 리스트 & 카드 관리
- 리스트 생성/수정/삭제
- 카드 생성/수정/삭제
- **드래그앤드롭**으로 카드/리스트 이동
- 마감일 설정 (D-Day 형식 표시)
- **라벨 시스템** (6가지 색상)
- 담당자 할당

### 체크리스트
- 체크리스트 생성/삭제
- 항목 추가/삭제/토글
- 진행률 표시

### 댓글 시스템
- 댓글 작성/삭제
- 실시간 댓글 표시

### 알림 시스템
- 실시간 알림 (Supabase Realtime)
- 댓글/초대/카드 완료 알림
- 알림 읽음 처리
- 알림 클릭 시 해당 카드로 이동

### 완료 카드 관리
- 카드 완료 처리
- 완료된 카드 별도 페이지에서 관리
- 통계 및 차트 (Recharts)

### 권한 관리
- 보드 소유자: 보드 삭제, 멤버 초대
- 보드 멤버: 리스트/카드 생성 및 수정
- 카드 생성자: 본인 카드만 삭제 가능

---

## 🎨 UI/UX

- **다크/라이트 모드** 지원
- **반응형 디자인** (모바일/데스크톱)
- **스켈레톤 로딩** 애니메이션
- **토스트 알림** 피드백 (Sonner)
- **커스텀 로고** 적용
- **D-Day 형식** 마감일 표시
- **Pretendard** 한글 폰트

---

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (이메일)
RESEND_API_KEY=your-resend-api-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### 3. 데이터베이스 설정

Supabase 대시보드에서 `supabase/migrations/` 폴더의 SQL 파일들을 순서대로 실행합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

---

## 📂 프로젝트 구조

```
plank/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── auth.ts           #   - 인증 (세션 조회)
│   │   ├── board.ts          #   - 보드 CRUD
│   │   ├── card.ts           #   - 카드 CRUD + 라벨
│   │   ├── checklist.ts      #   - 체크리스트 CRUD
│   │   ├── comment.ts        #   - 댓글 CRUD
│   │   ├── completed.ts      #   - 완료 카드 조회
│   │   ├── invitation.ts     #   - 초대 관리
│   │   ├── list.ts           #   - 리스트 CRUD
│   │   ├── member.ts         #   - 팀원 조회, 담당자 할당
│   │   ├── notification.ts   #   - 알림 관리
│   │   └── report.ts         #   - 리포트/통계
│   │
│   ├── auth/callback/        # OAuth 콜백
│   ├── board/[id]/           # 보드 상세 페이지
│   │   ├── page.tsx
│   │   ├── BoardClient.tsx
│   │   └── completed/        # 완료된 카드 페이지
│   │
│   ├── components/           # UI 컴포넌트
│   │   ├── auth/             #   - 인증 관련 (UserMenu, 알림, 초대)
│   │   ├── board/            #   - 보드 관련
│   │   ├── card/             #   - 카드 관련 (담당자, 체크리스트, 댓글, 라벨)
│   │   ├── column/           #   - 컬럼 관련
│   │   ├── home/             #   - 홈 관련 (보드 카드, 생성 폼)
│   │   ├── layout/           #   - 레이아웃 (헤더)
│   │   └── ui/               #   - 공통 UI (로딩, 테마 토글)
│   │
│   ├── login/                # 로그인 페이지
│   ├── globals.css           # 글로벌 스타일
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 홈 페이지
│   └── providers.tsx         # 프로바이더 (테마)
│
├── hooks/                    # 커스텀 훅
│   ├── useAutoFocus.ts
│   ├── useBoardDragDrop.ts
│   ├── useKeyboard.ts
│   └── useOutsideClick.ts
│
├── lib/                      # 유틸리티
│   ├── supabase/             #   - Supabase 클라이언트
│   ├── animations.ts         #   - Framer Motion 프리셋
│   ├── email.ts              #   - 이메일 발송
│   ├── gemini.ts             #   - Gemini AI
│   └── utils.ts              #   - 유틸 함수
│
├── schema/                   # Zod 스키마
│   └── validation.ts
│
├── store/                    # Zustand 스토어
│   ├── useBoardStore.ts      #   - 보드 페이지 상태
│   ├── useCompletedStore.ts  #   - 완료 카드 상태
│   ├── useDraftStore.ts      #   - 드래프트 상태
│   ├── useHomeStore.ts       #   - 홈 페이지 상태
│   ├── useNavigationStore.ts #   - 네비게이션 상태
│   └── useNotificationStore.ts # - 알림 상태
│
├── supabase/migrations/      # DB 마이그레이션 (20개 파일)
│
├── types/                    # TypeScript 타입
│   └── index.ts
│
└── middleware.ts             # Next.js 미들웨어 (인증)
```

---

## 🗃️ 데이터베이스 스키마

```
profiles          - 유저 프로필 (id, email, username, avatar_url)
boards            - 보드 (title, emoji, created_by, start_date, due_date)
board_members     - 보드 멤버 (board_id, user_id, role)
board_invitations - 초대 (board_id, inviter_id, invitee_id, status)
lists             - 리스트 (board_id, title, position, is_done_list)
cards             - 카드 (list_id, title, description, due_date, labels, assignee_id, is_completed)
comments          - 댓글 (card_id, user_id, content)
checklists        - 체크리스트 (card_id, title, position)
checklist_items   - 체크리스트 항목 (checklist_id, content, is_checked, position)
notifications     - 알림 (user_id, type, title, message, is_read, link)
```

---

## 📝 라이선스

MIT License
