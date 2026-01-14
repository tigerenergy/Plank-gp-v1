# 짭렐로 (Jjap-rello) 아키텍처 문서

## 📐 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              클라이언트 (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│    │   page.tsx  │    │  layout.tsx │    │ globals.css │                   │
│    │  (홈 화면)   │    │   (루트)     │    │  (스타일)    │                   │
│    └──────┬──────┘    └─────────────┘    └─────────────┘                   │
│           │                                                                 │
│           ▼                                                                 │
│    ┌─────────────────────────────────────────────────────┐                 │
│    │              board/[id]/page.tsx                    │                 │
│    │                 (보드 상세 페이지)                     │                 │
│    └──────────────────────┬──────────────────────────────┘                 │
│                           │                                                 │
│           ┌───────────────┼───────────────┬──────────────┐                 │
│           ▼               ▼               ▼              ▼                 │
│    ┌───────────┐   ┌───────────┐   ┌───────────┐  ┌────────────┐          │
│    │  Column   │   │   Card    │   │ CardModal │  │ConfirmModal│          │
│    │ (컬럼/리스트)│   │  (카드)    │   │ (카드 모달) │  │ (확인 모달)  │          │
│    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘  └─────┬──────┘          │
│          │               │               │              │                  │
│          └───────────────┼───────────────┴──────────────┘                  │
│                          ▼                                                  │
│    ┌─────────────────────────────────────────────────────┐                 │
│    │                 Zustand Store                        │                 │
│    │              (useBoardStore.ts)                      │                 │
│    │  ┌─────────────────────────────────────────────┐    │                 │
│    │  │ • board: Board                              │    │                 │
│    │  │ • lists: ListWithCards[]                    │    │                 │
│    │  │ • selectedCard: Card                        │    │                 │
│    │  │ • isLoading, error                          │    │                 │
│    │  └─────────────────────────────────────────────┘    │                 │
│    └──────────────────────┬──────────────────────────────┘                 │
│                           │                                                 │
└───────────────────────────┼─────────────────────────────────────────────────┘
                            │
                            ▼ Server Actions
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Next.js Server                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│    │  board.ts   │    │   list.ts   │    │   card.ts   │                   │
│    │ (보드 CRUD)  │    │ (리스트 CRUD)│    │ (카드 CRUD)  │                   │
│    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                   │
│           │                  │                  │                           │
│           └──────────────────┼──────────────────┘                           │
│                              ▼                                              │
│    ┌─────────────────────────────────────────────────────┐                 │
│    │               Supabase Client                        │                 │
│    │               (lib/supabase.ts)                      │                 │
│    └──────────────────────┬──────────────────────────────┘                 │
│                           │                                                 │
└───────────────────────────┼─────────────────────────────────────────────────┘
                            │
                            ▼ PostgreSQL
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Supabase (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐             │
│    │    boards     │───▶│     lists     │───▶│     cards     │             │
│    │               │    │               │    │               │             │
│    │ • id (PK)     │    │ • id (PK)     │    │ • id (PK)     │             │
│    │ • title       │    │ • board_id(FK)│    │ • list_id(FK) │             │
│    │ • created_at  │    │ • title       │    │ • title       │             │
│    │ • updated_at  │    │ • position    │    │ • description │             │
│    │               │    │ • color       │    │ • position    │             │
│    │               │    │ • created_at  │    │ • due_date    │             │
│    │               │    │ • updated_at  │    │ • created_at  │             │
│    │               │    │               │    │ • updated_at  │             │
│    └───────────────┘    └───────────────┘    └───────────────┘             │
│                                                                             │
│    관계: boards (1) ──▶ (N) lists (1) ──▶ (N) cards                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 프로젝트 구조

```
jjap-rello/
│
├── 📂 app/                          # Next.js App Router
│   ├── 📂 actions/                  # Server Actions (서버 사이드 로직)
│   │   ├── board.ts                 #   - 보드 CRUD
│   │   ├── list.ts                  #   - 리스트 CRUD
│   │   └── card.ts                  #   - 카드 CRUD
│   │
│   ├── 📂 board/[id]/               # 동적 라우팅
│   │   └── page.tsx                 #   - 보드 상세 페이지
│   │
│   ├── 📂 components/               # UI 컴포넌트
│   │   ├── AddCardForm.tsx          #   - 카드 추가 인라인 폼
│   │   ├── Board.tsx                #   - 보드 컴포넌트 (미사용)
│   │   ├── Card.tsx                 #   - 카드 컴포넌트
│   │   ├── CardModal.tsx            #   - 카드 상세 모달
│   │   ├── Column.tsx               #   - 컬럼(리스트) 컴포넌트
│   │   ├── ConfirmModal.tsx         #   - 확인 모달 (삭제 확인 등)
│   │   └── Header.tsx               #   - 헤더 컴포넌트 (미사용)
│   │
│   ├── globals.css                  # 글로벌 스타일 (Tailwind + 커스텀)
│   ├── layout.tsx                   # 루트 레이아웃 (viewport, 폰트)
│   └── page.tsx                     # 홈 페이지 (보드 목록)
│
├── 📂 lib/                          # 유틸리티 & 설정
│   ├── supabase.ts                  #   - Supabase 클라이언트
│   └── utils.ts                     #   - 헬퍼 함수 (색상, 날짜 등)
│
├── 📂 store/                        # 상태 관리
│   └── useBoardStore.ts             #   - Zustand 스토어
│
├── 📂 types/                        # TypeScript 타입 정의
│   └── index.ts                     #   - Board, List, Card 등
│
├── 📂 schema/                       # 유효성 검사
│   └── validation.ts                #   - Zod 스키마
│
├── 📂 supabase/                     # 데이터베이스
│   └── schema.sql                   #   - 테이블 생성 SQL
│
├── next.config.ts                   # Next.js 설정
├── tailwind.config.ts               # Tailwind CSS 설정
├── tsconfig.json                    # TypeScript 설정
└── package.json                     # 의존성 관리
```

---

## 🔄 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 인터랙션                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. UI 컴포넌트 (Card, Column, CardModal)                        │
│     - 사용자 입력 받음 (클릭, 드래그, 폼 입력)                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 확인 필요시 ConfirmModal 표시                                 │
│     - 삭제 등 위험한 작업 전 사용자 확인 요청                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Zustand Store (useBoardStore)                               │
│     - 낙관적 업데이트 (즉시 UI 반영)                               │
│     - 이전 상태 저장 (롤백용)                                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Server Actions (board.ts, list.ts, card.ts)                 │
│     - Zod로 입력 유효성 검사                                      │
│     - Supabase API 호출                                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Supabase (PostgreSQL)                                       │
│     - 데이터 저장/조회/수정/삭제                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. 응답 처리                                                    │
│     - 성공: Toast 알림 표시                                       │
│     - 실패: 롤백 + 에러 Toast 표시                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 컴포넌트 계층 구조

```
RootLayout (layout.tsx)
│   └── Toaster (sonner)
│
├── HomePage (page.tsx)
│   ├── BoardCard (인라인)
│   │   └── EditForm (인라인)
│   │
│   └── ConfirmModal ◀── 보드 삭제 확인
│
└── BoardPage (board/[id]/page.tsx)
    │
    ├── Header (인라인)
    │   └── BackButton
    │
    ├── DndContext (@dnd-kit/core)
    │   │
    │   ├── Column[] (Column.tsx)
    │   │   ├── ColumnHeader
    │   │   │   ├── Title (편집 가능)
    │   │   │   └── OptionsMenu (드롭다운)
    │   │   │       ├── 제목 수정
    │   │   │       └── 삭제 → ConfirmModal
    │   │   │
    │   │   ├── SortableContext
    │   │   │   └── Card[] (Card.tsx)
    │   │   │       ├── Title
    │   │   │       ├── DueDateBadge (상태별 색상)
    │   │   │       │   ├── 기본 (회색)
    │   │   │       │   ├── 마감 임박 (주황/펄스)
    │   │   │       │   └── 마감 지남 (빨강/펄스)
    │   │   │       └── DescriptionIcon
    │   │   │
    │   │   ├── AddCardForm (AddCardForm.tsx)
    │   │   │
    │   │   └── ConfirmModal ◀── 리스트 삭제 확인
    │   │
    │   ├── AddListButton
    │   │
    │   └── DragOverlay
    │       └── Card (드래그 중 미리보기)
    │
    └── CardModal (CardModal.tsx)
        ├── TitleInput
        ├── DueDateInput
        ├── DescriptionTextarea
        ├── ActionButtons (저장, 삭제)
        │
        └── ConfirmModal ◀── 카드 삭제 확인
```

---

## 🎨 스타일 구조

```
globals.css
│
├── Tailwind Imports
│   ├── @tailwind base
│   ├── @tailwind components
│   └── @tailwind utilities
│
├── CSS Variables (다크 모드 팔레트)
│   ├── --color-bg-*      (배경색)
│   ├── --color-text-*    (텍스트색)
│   └── --pastel-*        (파스텔 포인트)
│
├── Base Styles
│   ├── html, body        (폰트, 배경)
│   └── 스크롤바 스타일
│
├── Component Classes
│   ├── .glass-*          (글래스모피즘)
│   ├── .card-*           (카드 스타일)
│   ├── .column-glass-*   (컬럼 색상)
│   ├── .date-badge-*     (마감일 뱃지)
│   ├── .add-card-btn     (카드 추가 버튼)
│   ├── .ios-*            (버튼, 인풋)
│   └── .drag-*           (드래그 효과)
│
└── Animations
    ├── pulse-glow-amber  (마감 임박 펄스)
    ├── pulse-glow-red    (마감 지남 펄스)
    ├── fade-in-up        (드롭다운)
    └── animate-in        (모달 등장)
```

---

## 🗃️ 상태 관리 (Zustand Store)

```typescript
useBoardStore
│
├── 📊 State
│   ├── board: Board | null           // 현재 보드 정보
│   ├── lists: ListWithCards[]        // 리스트 + 카드 목록
│   ├── isLoading: boolean            // 로딩 상태
│   ├── error: string | null          // 에러 메시지
│   ├── selectedCard: Card | null     // 모달에서 선택된 카드
│   ├── isCardModalOpen: boolean      // 모달 열림 상태
│   └── _previousLists: ListWithCards[] | null  // 롤백용 이전 상태
│
├── 🔧 Actions - 기본
│   ├── setBoard()                    // 보드 설정
│   ├── setLists()                    // 리스트 설정
│   ├── setLoading()                  // 로딩 상태 변경
│   └── setError()                    // 에러 상태 변경
│
├── 🔧 Actions - 카드
│   ├── addCard()                     // 카드 추가
│   ├── updateCard()                  // 카드 수정
│   ├── deleteCard()                  // 카드 삭제
│   └── moveCard()                    // 카드 이동
│
├── 🔧 Actions - 리스트
│   ├── addList()                     // 리스트 추가
│   ├── updateList()                  // 리스트 수정
│   └── deleteList()                  // 리스트 삭제
│
├── 🔧 Actions - 모달
│   ├── openCardModal()               // 카드 모달 열기
│   ├── closeCardModal()              // 카드 모달 닫기
│   └── updateSelectedCard()          // 선택된 카드 업데이트
│
└── 🔧 Actions - 롤백
    ├── saveState()                   // 현재 상태 저장
    └── rollback()                    // 이전 상태로 복원
```

---

## 🧱 컴포넌트 상세

### ConfirmModal (확인 모달)

브라우저 기본 `confirm()` 대신 사용하는 커스텀 확인 모달입니다.

```typescript
interface ConfirmModalProps {
  isOpen: boolean // 모달 열림 상태
  title: string // 모달 제목
  message: string // 확인 메시지
  confirmText?: string // 확인 버튼 텍스트 (기본: '확인')
  cancelText?: string // 취소 버튼 텍스트 (기본: '취소')
  onConfirm: () => void // 확인 클릭 콜백
  onCancel: () => void // 취소 클릭 콜백
  variant?: 'danger' | 'warning' | 'default' // 스타일 변형
}
```

**사용처:**

- `page.tsx` - 보드 삭제 확인
- `Column.tsx` - 리스트 삭제 확인
- `CardModal.tsx` - 카드 삭제 확인

**특징:**

- ESC 키로 닫기 지원
- 배경 클릭 시 닫기
- 다크 모드 테마
- 부드러운 등장 애니메이션
- variant별 아이콘 및 버튼 색상

---

## 🛠️ 기술 스택 상세

| 분류           | 기술            | 버전  | 용도                    |
| -------------- | --------------- | ----- | ----------------------- |
| **Framework**  | Next.js         | 16.x  | React 풀스택 프레임워크 |
| **Language**   | TypeScript      | 5.x   | 타입 안정성             |
| **Styling**    | Tailwind CSS    | 3.4.x | 유틸리티 기반 CSS       |
| **State**      | Zustand         | 5.x   | 클라이언트 상태 관리    |
| **Database**   | Supabase        | 2.x   | PostgreSQL + API        |
| **DnD**        | @dnd-kit        | 6.x   | 드래그 앤 드롭          |
| **Form**       | React Hook Form | 7.x   | 폼 상태 관리            |
| **Validation** | Zod             | 3.x   | 스키마 유효성 검사      |
| **Toast**      | Sonner          | 1.x   | 알림 메시지             |
| **Font**       | Pretendard      | 1.3.9 | 한글 웹폰트             |

---

## 🚀 주요 기능

### ✅ 구현 완료

- [x] 보드 CRUD (생성, 조회, 수정, 삭제)
- [x] 리스트 CRUD (생성, 조회, 수정, 삭제)
- [x] 카드 CRUD (생성, 조회, 수정, 삭제)
- [x] 드래그 앤 드롭 (카드 이동)
- [x] 마감일 설정 및 시각적 표시 (상태별 색상/애니메이션)
- [x] 반응형 레이아웃 (모바일 세로 스택 / 데스크톱 가로 스크롤)
- [x] 다크 모드 UI (파스텔 포인트 컬러)
- [x] 낙관적 업데이트
- [x] 커스텀 확인 모달 (ConfirmModal)
- [x] 한국어 지원

### 📋 추가 가능 기능

- [ ] 리스트 드래그 앤 드롭
- [ ] 라벨 시스템
- [ ] 체크리스트
- [ ] 검색 기능
- [ ] 사용자 인증
- [ ] 멀티 사용자 협업

---

## 📱 반응형 브레이크포인트

| 브레이크포인트 | 너비     | 레이아웃                    |
| -------------- | -------- | --------------------------- |
| 모바일 (기본)  | < 640px  | 컬럼 세로 스택, 세로 스크롤 |
| sm             | ≥ 640px  | 컬럼 가로 배치, 가로 스크롤 |
| md             | ≥ 768px  | -                           |
| lg             | ≥ 1024px | -                           |
| xl             | ≥ 1280px | -                           |

---

## 📝 라이선스

MIT License
