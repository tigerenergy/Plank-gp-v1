# 📝 Plank 개발 히스토리

> **최종 업데이트**: 2026-01-25  
> **프로젝트**: Plank (협업 칸반 보드 + 주간보고 시스템)

---

## 🎯 프로젝트 개요

Plank는 팀 협업을 위한 실시간 칸반 보드 애플리케이션으로, Trello 스타일의 핵심 기능을 구현하고 주간보고 작성 및 공유 기능을 통해 실제 업무 워크플로우를 지원합니다.

---

## 📅 개발 타임라인

### Phase 1: 기초 인프라 구축 (초기)

#### 인증 시스템
- ✅ Google OAuth 로그인 (Supabase Auth)
- ✅ 세션 관리 (Next.js Middleware)
- ✅ 프로필 자동 생성 (Database Trigger)
- ✅ 로그아웃 기능

#### 기본 UI/UX
- ✅ 다크/라이트 모드 지원 (next-themes)
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 스켈레톤 로딩 애니메이션
- ✅ 토스트 알림 피드백 (Sonner)
- ✅ 커스텀 로고 적용
- ✅ Pretendard 한글 폰트

---

### Phase 2: 칸반 보드 핵심 기능 (초기~중기)

#### 보드 관리
- ✅ 보드 생성/수정/삭제
- ✅ 보드 이모지 선택 (기본 이모지 + 커스텀 이모지 피커)
- ✅ 보드 시작일/마감일 설정
- ✅ 보드 멤버 초대 시스템 (이메일 초대 - Resend API)
- ✅ 초대 수락/거절
- ✅ 보드 멤버 관리 (멤버 목록, 역할 관리)
- ✅ 보드 권한 관리 (소유자/멤버/뷰어)

**데이터베이스 마이그레이션:**
- `001_add_auth.sql` - 인증 시스템
- `002_add_collaboration.sql` - 협업 기능
- `003_fix_rls_recursion.sql` - RLS 재귀 문제 수정
- `004_fix_rls_simple.sql` - RLS 단순화
- `006_fix_member_rls.sql` - 멤버 RLS 수정
- `007_real_collaboration.sql` - 실제 협업 기능
- `008_simple_team.sql` - 팀 기능
- `009_fix_avatar.sql` - 아바타 수정
- `010_fix_foreign_keys.sql` - 외래키 수정
- `011_add_labels.sql` - 라벨 시스템
- `012_add_card_creator.sql` - 카드 생성자
- `013_fix_created_by_fkey.sql` - 생성자 외래키 수정
- `014_add_invitations.sql` - 초대 시스템
- `016_fix_board_owners_membership.sql` - 보드 소유자 멤버십 수정
- `017_add_board_emoji.sql` - 보드 이모지

#### 리스트 관리
- ✅ 리스트 생성/수정/삭제
- ✅ 리스트별 카드 그룹화
- ✅ 리스트 드래그앤드롭 (위치 변경 - @dnd-kit)
- ✅ 완료 리스트 표시 (is_done_list)
- ✅ 리스트 제목 변경 ("할일" → "준비중")

**데이터베이스 마이그레이션:**
- `024_update_list_title_할일_to_준비중.sql` - 리스트 제목 업데이트

#### 카드 관리
- ✅ 카드 생성/수정/삭제
- ✅ 카드 드래그앤드롭 (리스트 간 이동 - @dnd-kit)
- ✅ 카드 시작일/마감일 설정 (D-Day 형식 표시)
- ✅ 카드 라벨 시스템 (10가지 색상)
- ✅ 카드 설명 작성
- ✅ 카드 담당자 할당 (자동: 카드 생성자)
- ✅ 카드 완료 처리 (완료 리스트로 이동)
- ✅ 카드 모달 (상세/댓글/체크리스트/시간 로그 탭)
- ✅ 완료된 카드 디자인 통일 (프로젝트 카드와 동일한 레이아웃)

**데이터베이스 마이그레이션:**
- `005_add_comments_checklists.sql` - 댓글 및 체크리스트
- `018_add_completion_feature.sql` - 완료 기능
- `019_fix_completion_foreign_keys.sql` - 완료 외래키 수정
- `020_add_date_fields.sql` - 날짜 필드 추가

---

### Phase 3: 상세 기능 구현 (중기)

#### 댓글 시스템
- ✅ 댓글 작성/수정/삭제
- ✅ 실시간 댓글 표시 (Supabase Realtime)
- ✅ 댓글 알림

#### 체크리스트
- ✅ 체크리스트 생성/삭제
- ✅ 체크리스트 항목 추가/삭제/토글
- ✅ 체크리스트 진행률 표시 (퍼센트)
- ✅ 체크리스트 제목 수정
- ✅ **카드 생성 시 체크리스트 자동 생성** (카드 제목과 동일한 항목)

#### 시간 로그 (Jira 스타일)
- ✅ 카드별 작업 시간 기록
- ✅ 시간 로그 추가/수정/삭제
- ✅ 주간 시간 자동 집계
- ✅ 주간보고에 시간 로그 반영

**데이터베이스 마이그레이션:**
- `022_add_card_time_logs.sql` - 시간 로그 기능

#### 알림 시스템
- ✅ 실시간 알림 (Supabase Realtime)
- ✅ 댓글 알림
- ✅ 보드 초대 알림
- ✅ 알림 읽음 처리
- ✅ 알림 클릭 시 해당 카드로 이동
- ✅ 알림 드롭다운 UI

**데이터베이스 마이그레이션:**
- `015_add_notifications.sql` - 알림 시스템

#### 완료된 작업 관리
- ✅ 완료된 카드 조회 (주간/월간/전체)
- ✅ 완료된 작업 통계
- ✅ 완료된 작업 페이지 (별도 라우트)

---

### Phase 4: 주간보고 기능 구현 (최신) ⭐

#### 주간보고 핵심 기능
- ✅ **주간보고 자동 생성** (완료된 카드, 진행 중인 카드, 카드 활동 이력 자동 수집)
- ✅ **주간보고 작성/수정** (진행 중인 카드 상태, 진척도, 설명, 이슈 입력)
- ✅ **주간보고 제출** (draft/submitted 상태 관리)
- ✅ **주간보고 자동 갱신** (카드 변경사항 반영)
- ✅ **주간보고 공유 페이지** (전체 보드 접근 가능한 주간보고 조회)
- ✅ **주간보고 내보내기** (PDF, CSV - jsPDF 사용)
- ✅ **주간보고 통계** (시간 집계, 완료/진행 중 카드 수)
- ✅ **체크리스트 완료 항목 표시** (주간보고에 통합)
- ✅ **차주 작업 탭** (미완료 작업 표시)

**데이터베이스 마이그레이션:**
- `021_add_weekly_reports.sql` - 주간보고 기본 기능
- `023_add_weekly_report_history.sql` - 주간보고 히스토리
- `026_enable_realtime_weekly_reports.sql` - 실시간 주간보고

#### 실시간 협업 기능
- ✅ **실시간 데이터 업데이트** (Supabase Realtime)
- ✅ **Presence 기능** (현재 보고 있는 사용자 표시)
- ✅ **마우스 커서 추적** (Figma 스타일)
- ✅ **클릭 시각화**

**주요 컴포넌트:**
- `app/board/[id]/weekly-report/new/WeeklyReportForm.tsx` - 주간보고 작성 폼
- `app/board/[id]/weekly-report/share/WeeklyReportShareClient.tsx` - 주간보고 공유 페이지
- `app/board/[id]/weekly-report/stats/WeeklyReportStatsClient.tsx` - 주간보고 통계
- `app/components/weekly-report/` - 주간보고 관련 컴포넌트

**주요 Server Actions:**
- `app/actions/weekly-report.ts` - 주간보고 CRUD
- `app/actions/weekly-report-stats.ts` - 주간보고 통계
- `app/actions/weekly-report-history.ts` - 주간보고 히스토리

**유틸리티:**
- `lib/weekly-report-export.ts` - PDF/CSV 내보내기

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### 사용자 및 인증
- `profiles` - 사용자 프로필 (id, email, username, avatar_url)

#### 보드 및 협업
- `boards` - 보드 (title, emoji, created_by, start_date, due_date)
- `board_members` - 보드 멤버 (board_id, user_id, role)
- `board_invitations` - 초대 (board_id, inviter_id, invitee_id, status)

#### 칸반 보드
- `lists` - 리스트 (board_id, title, position, is_done_list)
- `cards` - 카드 (list_id, title, description, due_date, labels, assignee_id, is_completed, completed_at, completed_by, start_date)

#### 카드 상세 기능
- `comments` - 댓글 (card_id, user_id, content)
- `checklists` - 체크리스트 (card_id, title, position)
- `checklist_items` - 체크리스트 항목 (checklist_id, content, is_checked, position)
- `card_time_logs` - 시간 로그 (card_id, user_id, hours, description, logged_date)

#### 주간보고
- `weekly_reports` - 주간보고 (board_id, user_id, week_start_date, week_end_date, status, completed_cards, in_progress_cards, card_activities, total_hours, notes)

#### 알림
- `notifications` - 알림 (user_id, type, title, message, is_read, link)

---

## 🛠️ 기술 스택 상세

### Frontend
- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - React Compiler 활성화 (자동 memoization)
- **TypeScript 5.7** - 타입 안전성
- **Tailwind CSS 3.4** - 유틸리티 퍼스트 스타일링
- **Zustand 5.x** - 클라이언트 상태 관리
- **Framer Motion 12.x** - UI 애니메이션
- **@dnd-kit 6.x** - 드래그 앤 드롭
- **React Hook Form 7.x + Zod 3.x** - 폼 관리 및 유효성 검사
- **next-themes 0.4.x** - 다크/라이트 모드
- **jsPDF 4.x** - PDF 생성
- **Sonner 1.x** - 토스트 알림

### Backend
- **Supabase** - PostgreSQL, Authentication, Realtime
- **Row Level Security (RLS)** - 데이터 보안
- **Supabase Realtime** - 실시간 업데이트, Presence
- **Resend** - 이메일 발송
- **Google Gemini AI** - AI 기능 (향후 확장)

### 성능 최적화
- ✅ `async-parallel` - Promise.all() 병렬 데이터 페칭
- ✅ `bundle-dynamic-imports` - next/dynamic 코드 스플리팅
- ✅ `server-cache-react` - React.cache() 요청 중복 방지
- ✅ `reactCompiler: true` - 자동 memoization

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
│   │   ├── time-log.ts       #   - 시간 로그 관리
│   │   ├── weekly-report.ts  #   - 주간보고 CRUD
│   │   ├── weekly-report-stats.ts # - 주간보고 통계
│   │   └── weekly-report-history.ts # - 주간보고 히스토리
│   │
│   ├── auth/callback/        # OAuth 콜백
│   ├── board/[id]/           # 보드 상세 페이지
│   │   ├── page.tsx
│   │   ├── BoardClient.tsx
│   │   ├── completed/        # 완료된 카드 페이지
│   │   └── weekly-report/    # 주간보고
│   │       ├── new/          #   - 주간보고 작성
│   │       ├── share/        #   - 주간보고 공유 (보드별)
│   │       └── stats/        #   - 주간보고 통계
│   │
│   ├── weekly-report/        # 주간보고 전역 페이지
│   │   └── share/            #   - 주간보고 전체 공유
│   │
│   ├── components/           # UI 컴포넌트
│   │   ├── auth/             #   - 인증 관련 (UserMenu, 알림, 초대)
│   │   ├── board/            #   - 보드 관련
│   │   ├── card/             #   - 카드 관련 (담당자, 체크리스트, 댓글, 라벨)
│   │   ├── column/           #   - 컬럼 관련
│   │   ├── home/             #   - 홈 관련 (보드 카드, 생성 폼)
│   │   ├── layout/           #   - 레이아웃 (헤더)
│   │   ├── weekly-report/    #   - 주간보고 컴포넌트
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
│   ├── weekly-report-export.ts # - 주간보고 내보내기 (PDF, CSV)
│   └── utils.ts              #   - 유틸 함수
│
├── schema/                   # Zod 스키마
│   └── validation.ts
│
├── store/                    # Zustand 스토어
│   ├── useBoardStore.ts      #   - 보드 페이지 상태
│   ├── useDraftStore.ts      #   - 드래프트 상태
│   ├── useHomeStore.ts       #   - 홈 페이지 상태
│   ├── useNavigationStore.ts #   - 네비게이션 상태
│   └── useNotificationStore.ts # - 알림 상태
│
├── supabase/migrations/      # DB 마이그레이션 (26개 파일)
│
├── types/                    # TypeScript 타입
│   └── index.ts
│
└── middleware.ts             # Next.js 미들웨어 (인증)
```

---

## 🎨 디자인 시스템

### 카드 디자인 통일
모든 카드 타입이 동일한 레이아웃 구조를 사용합니다:

1. **크기**: `p-5 h-44` (고정 높이)
2. **상단 아이콘**: `w-11 h-11 rounded-xl shadow-md`
3. **제목**: `text-base font-bold mb-1`
4. **메타데이터**: `text-sm mb-auto`
5. **하단 정보**: `absolute bottom-4 left-5 right-5`
6. **아바타**: `w-10 h-10 rounded-full ring-2 shadow-md`

### 카드 타입
- 프로젝트 카드 (`BoardCard`)
- 주간보고 카드 (`HomeClient`, `WeeklyReportShareClient`)
- 완료된 카드 (`Card` - 완료 상태)

### 8-point Grid System
모든 spacing은 8px 단위를 사용합니다.

---

## 🔄 주요 데이터 흐름

### 주간보고 데이터 흐름
1. 카드 작업 → 시간 로그 기록
2. 주간보고 생성 → 완료된 카드, 진행 중인 카드 자동 수집
3. 사용자 입력 → 진행 중인 카드 상태, 진척도, 설명, 이슈 입력
4. 주간보고 제출 → submitted 상태로 변경
5. 주간보고 공유 → 전체 보드 접근 가능한 사용자들이 조회 가능

### 실시간 협업
- Supabase Realtime을 사용하여 주간보고 공유 페이지에서 실시간 업데이트
- Presence 기능으로 현재 보고 있는 사용자 표시
- 마우스 커서 추적 및 클릭 시각화 (Figma 스타일)

---

## 📊 마이그레이션 파일 목록

### 인증 및 기본 구조
1. `001_add_auth.sql` - 인증 시스템
2. `002_add_collaboration.sql` - 협업 기능

### RLS 및 보안 수정
3. `003_fix_rls_recursion.sql` - RLS 재귀 문제 수정
4. `004_fix_rls_simple.sql` - RLS 단순화
5. `006_fix_member_rls.sql` - 멤버 RLS 수정

### 협업 기능
7. `007_real_collaboration.sql` - 실제 협업 기능
8. `008_simple_team.sql` - 팀 기능
9. `009_fix_avatar.sql` - 아바타 수정
10. `010_fix_foreign_keys.sql` - 외래키 수정
11. `011_add_labels.sql` - 라벨 시스템
12. `012_add_card_creator.sql` - 카드 생성자
13. `013_fix_created_by_fkey.sql` - 생성자 외래키 수정
14. `014_add_invitations.sql` - 초대 시스템
15. `015_add_notifications.sql` - 알림 시스템
16. `016_fix_board_owners_membership.sql` - 보드 소유자 멤버십 수정
17. `017_add_board_emoji.sql` - 보드 이모지

### 완료 기능
18. `018_add_completion_feature.sql` - 완료 기능
19. `019_fix_completion_foreign_keys.sql` - 완료 외래키 수정

### 날짜 및 시간
20. `020_add_date_fields.sql` - 날짜 필드 추가
22. `022_add_card_time_logs.sql` - 시간 로그 기능

### 주간보고 기능
21. `021_add_weekly_reports.sql` - 주간보고 기본 기능
23. `023_add_weekly_report_history.sql` - 주간보고 히스토리
26. `026_enable_realtime_weekly_reports.sql` - 실시간 주간보고

### 기타
24. `024_update_list_title_할일_to_준비중.sql` - 리스트 제목 업데이트

---

## 🚀 향후 개발 계획

### 주간보고 개선
- [ ] 주간보고 템플릿 기능
- [ ] 주간보고 히스토리 조회 (과거 주간보고)
- [ ] 주간보고 비교 기능 (주간별 비교)
- [ ] 주간보고 검색 기능

### 통계 및 분석
- [ ] 팀 전체 통계 대시보드
- [ ] 프로젝트별 시간 집계
- [ ] 개인 생산성 분석
- [ ] 트렌드 분석 (시간대별, 주간별)

### 알림 개선
- [ ] 주간보고 제출 알림
- [ ] 주간보고 미제출 알림
- [ ] 이메일 알림 설정

### 권한 및 보안
- [ ] 주간보고 공개/비공개 설정
- [ ] 주간보고 수정 권한 관리
- [ ] 주간보고 삭제 권한 관리

---

## 📚 관련 문서

- **프로젝트 현황**: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) ⭐ **최신**
- **아키텍처**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **개발 규칙**: [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md)
- **설정 가이드**: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)

---

## 📝 참고 사항

### 개발 철학
> "단단한 기초(Plank)" 위에서 팀이 "동기화(Sync)" 되는 경험

### 주요 특징
- 관리자 없는 평등한 협업
- 실시간 협업 (Presence, 마우스 커서 추적)
- 자동화된 주간보고 생성
- 통합된 시간 추적 (Jira 스타일)

---

**최종 업데이트**: 2026-01-25
