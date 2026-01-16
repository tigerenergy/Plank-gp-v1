# 🤖 Agent Task: Plank 프로젝트 고도화 (버그 수정, 초대 기능, 디자인 리뉴얼)

> **문서 목적**: 현재 개발된 'Plank' 프로젝트의 버그를 수정하고, 사용자 초대 기능을 구현하며, 제공된 디자인 가이드라인(10 UI Tricks)을 적용하여 UI/UX를 시니어 레벨로 격상시킨다.

---

## 🚨 우선순위 1: 버그 수정 (Critical Bug Fixes)

다음 버그들은 사용자 경험을 심각하게 저해하므로 가장 먼저 해결해야 한다.

### 1. 리스트 생성 중복 이슈

- **증상**: 리스트 생성(Form Submit) 시, 엔터를 치거나 버튼을 누르면 리스트가 여러 개 생성되는 현상 발생.
- **원인 추정**: `onSubmit` 이벤트 핸들러에서 중복 호출 방지(Debounce/Throttle)가 없거나, 낙관적 업데이트(Optimistic Update)와 서버 응답 처리 간의 상태 동기화 문제.
- **작업 지시**:
  - 리스트 생성 컴포넌트(`actions/list.ts` 또는 UI 컴포넌트) 점검.
  - `isSubmitting` 상태를 활용하여 중복 제출 방지 로직 추가.
  - Form Reset 시점이 정확한지 확인.

### 2. 댓글 삭제 UX 개선

- **증상**: 댓글 삭제 버튼(아이콘)이 잘 보이지 않고, 클릭 영역이 작아 누르기 힘듦.
- **작업 지시**:
  - 댓글 컴포넌트(`CommentList.tsx`) 수정.
  - 삭제 버튼의 `opacity`를 조정하여 평소에는 흐리게, `hover` 시 뚜렷하게(opacity-100) 및 강조 색상(text-red-500) 적용.
  - 버튼을 감싸는 `div`나 `button` 태그에 `p-2` 정도의 패딩을 주어 클릭 히트박스(Click Hitbox) 확장.

### 3. 카드 생성 UX 흐름 변경

- **증상**: 현재는 카드 제목만 입력하여 생성 후, 다시 클릭해야 상세(날짜, 담당자 등) 수정이 가능함.
- **요구 사항**: 카드 생성 즉시 상세 편집 모달이 열려야 함.
- **작업 지시**:
  - 카드 생성 로직 변경: DB `insert` 성공 직후, 반환된 `card_id`를 이용해 `useCardModal` 스토어의 `onOpen(card_id)`을 즉시 트리거.
  - 또는, "카드 추가" 버튼 클릭 시 바로 모달을 띄우고 저장 시점에 생성되도록 흐름 변경 (기존 낙관적 업데이트 로직 고려하여 결정).

---

## 🚀 우선순위 2: 협업 기능 구현 (Invitation System)

다른 사용자를 보드에 초대하고, 협업할 수 있는 기능을 구현한다.

### 1. DB 스키마 및 RLS 정책

- **테이블 추가/수정**:
  - `board_invitations` 테이블 생성 (필드: id, board_id, inviter_id, invitee_email, status(pending/accepted), created_at).
- **RLS 정책 업데이트**:
  - 초대받은 사용자(board_members에 추가된 자)가 해당 보드의 리스트/카드/댓글에 대해 **Full Access(CRUD)** 권한을 갖도록 정책 수정.

### 2. 초대 발송 (Sender)

- **UI**: 보드 상단 헤더에 '초대(Invite)' 버튼 추가. 모달에서 이메일 입력.
- **로직**:
  - 입력한 이메일이 `profiles` 테이블에 존재하는지 확인.
  - 이미 멤버이거나 초대 중인지 중복 체크.
  - `board_invitations`에 데이터 삽입.

### 3. 초대 수신 및 수락 (Receiver)

- **UI (Notification)**:
  - 메인 페이지(Dashboard) 또는 헤더에 '알림/초대 목록' 메뉴 추가.
  - "🔴" 뱃지 등을 활용하여 읽지 않은 초대 표시.
- **로직**:
  - 초대 목록에서 [수락] / [거절] 버튼 구현.
  - [수락] 시: `board_invitations` 상태 업데이트 -> `board_members` 테이블에 해당 유저 추가 -> 해당 보드로 이동.
  - [거절] 시: 초대 데이터 삭제 또는 상태 변경.

### 4. 실시간 협업 반영

- Supabase Realtime을 활용하여, 댓글이나 카드 이동 시 초대된 멤버의 화면에서도 즉시 반영되도록 확인.

---

## 🎨 우선순위 3: 디자인 리뉴얼 (Senior-Level Polish)

제공된 아티클 "10 UI Design Tricks"를 바탕으로 전체 UI를 리팩토링한다.

### 1. Typography & Hierarchy (Trick #1, #2)

- **계층 구조(5-Second Test)**: 페이지당 가장 중요한 액션(예: '새 보드 만들기', '카드 추가')을 다른 버튼보다 시각적으로 3배 더 명확하게(크기, 색상, 대비) 수정.
- **Letter Spacing**:
  - 헤드라인(큰 텍스트)에는 `tracking-tight` (-0.025em ~ -0.03em) 적용.
  - 본문 텍스트는 기본값 유지.

### 2. Spacing System (Trick #4)

- **8-point Grid**:
  - 모든 마진(margin), 패딩(padding), 간격(gap)을 4px(0.25rem) 또는 8px(0.5rem) 단위로 통일.
  - 예: `p-3`(12px) 같은 애매한 수치 제거 -> `p-4`(16px) 또는 `p-2`(8px)로 변경.

### 3. Rounded Corners Math (Trick #3)

- **중첩 보더 래디우스 수정**:
  - 리스트(컨테이너)와 카드(내부 아이템) 간의 곡률 계산 적용.
  - 공식: `내부 Radius = 외부 Radius - Padding`
  - 예: 리스트 패딩이 `p-4`이고 외부 `rounded-xl`이면 내부는 `rounded-lg` 등으로 조정하여 시각적 이질감 제거.

### 4. Color & Depth (Trick #5, #6)

- **색상 팔레트**: HSB 기반으로 색상 조정 (단순 투명도 조절이 아닌, 채도/명도를 함께 조절).
- **카드 디자인 개선**:
  - 불필요한 테두리(`border`) 제거.
  - 배경색과 미세한 명도 차이 또는 아주 부드러운 그림자(`shadow-sm`)로 구분감 형성.
  - "카드" 느낌을 내기 위해 배경색 대비 명도를 살짝 높임 (Dark mode 고려).

### 5. Clean Up (Trick #7, #8)

- **선(Line) 제거**: 불필요한 구분선(`border-b`, `divide-y`)을 제거하고 여백(Spacing)으로 구분.
- **Micro-copy**:
  - "생성", "확인" 같은 기계적인 버튼 텍스트를 "보드 만들기", "초대 보내기" 등 **행동+목적**이 드러나는 텍스트로 변경.

---

## 📝 작업 참고 사항

- **기술 스택**: Next.js 16 (App Router), Tailwind CSS, Supabase, Zustand, Framer Motion.
- **파일 경로**: `components/ui` 폴더 내의 공통 컴포넌트부터 디자인 시스템을 적용하고, 개별 페이지로 확장할 것.
- **상태 관리**: 초대 관련 상태는 `useBoardStore` 혹은 별도 `useInviteStore`로 관리.

usuState , useEffect 사용 최소화 zustand로 대체!
