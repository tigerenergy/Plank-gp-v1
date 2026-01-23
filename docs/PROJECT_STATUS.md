# 📊 Plank 프로젝트 현황

> **최종 업데이트**: 2026-01-25  
> **프로젝트**: Plank (협업 칸반 보드 + 주간보고 시스템)

---

## 🎯 프로젝트 개요

Plank는 팀 협업을 위한 실시간 칸반 보드 애플리케이션입니다. Trello 스타일의 핵심 기능을 구현하고 있으며, 주간보고 작성 및 공유 기능을 통해 실제 업무 워크플로우를 지원합니다.

### 핵심 철학
> "단단한 기초(Plank)" 위에서 팀이 "동기화(Sync)" 되는 경험

---

## ✅ 구현 완료된 기능

### 1. 인증 시스템
- ✅ Google OAuth 로그인 (Supabase Auth)
- ✅ 세션 관리 (Middleware)
- ✅ 프로필 자동 생성
- ✅ 로그아웃

### 2. 보드 관리
- ✅ 보드 생성/수정/삭제
- ✅ 보드 이모지 선택 (기본 이모지 + 커스텀 이모지 피커)
- ✅ 보드 시작일/마감일 설정
- ✅ 보드 멤버 초대 시스템 (이메일 초대)
- ✅ 초대 수락/거절
- ✅ 보드 멤버 관리 (멤버 목록, 역할 관리)
- ✅ 보드 권한 관리 (소유자/멤버/뷰어)

### 3. 리스트 관리
- ✅ 리스트 생성/수정/삭제
- ✅ 리스트별 카드 그룹화
- ✅ 리스트 드래그앤드롭 (위치 변경)
- ✅ 완료 리스트 표시 (is_done_list)

### 4. 카드 관리
- ✅ 카드 생성/수정/삭제
- ✅ 카드 드래그앤드롭 (리스트 간 이동)
- ✅ 카드 시작일/마감일 설정 (D-Day 형식 표시)
- ✅ 카드 라벨 시스템 (10가지 색상)
- ✅ 카드 설명 작성
- ✅ 카드 담당자 할당 (자동: 카드 생성자)
- ✅ 카드 완료 처리 (완료 리스트로 이동)
- ✅ 카드 모달 (상세/댓글/체크리스트/시간 로그 탭)
- ✅ 완료된 카드 디자인 통일 (프로젝트 카드와 동일한 레이아웃)

### 5. 댓글 시스템
- ✅ 댓글 작성/수정/삭제
- ✅ 실시간 댓글 표시
- ✅ 댓글 알림

### 6. 체크리스트
- ✅ 체크리스트 생성/삭제
- ✅ 체크리스트 항목 추가/삭제/토글
- ✅ 체크리스트 진행률 표시 (퍼센트)
- ✅ 체크리스트 제목 수정
- ✅ **카드 생성 시 체크리스트 자동 생성** (카드 제목과 동일한 항목)

### 7. 시간 로그 (Jira 스타일)
- ✅ 카드별 작업 시간 기록
- ✅ 시간 로그 추가/수정/삭제
- ✅ 주간 시간 자동 집계
- ✅ 주간보고에 시간 로그 반영

### 8. 알림 시스템
- ✅ 실시간 알림 (Supabase Realtime)
- ✅ 댓글 알림
- ✅ 보드 초대 알림
- ✅ 알림 읽음 처리
- ✅ 알림 클릭 시 해당 카드로 이동
- ✅ 알림 드롭다운 UI

### 9. 완료된 작업 관리
- ✅ 완료된 카드 조회 (주간/월간/전체)
- ✅ 완료된 작업 통계
- ✅ 완료된 작업 페이지 (별도 라우트)

### 10. 주간보고 기능 ⭐ **최신 구현**
- ✅ **주간보고 자동 생성** (완료된 카드, 진행 중인 카드, 카드 활동 이력 자동 수집)
- ✅ **주간보고 작성/수정** (진행 중인 카드 상태, 진척도, 설명, 이슈 입력)
- ✅ **주간보고 제출** (draft/submitted 상태 관리)
- ✅ **주간보고 자동 갱신** (카드 변경사항 반영)
- ✅ **주간보고 공유 페이지** (전체 보드 접근 가능한 주간보고 조회)
- ✅ **실시간 협업** (Supabase Realtime)
  - ✅ 실시간 데이터 업데이트
  - ✅ Presence 기능 (현재 보고 있는 사용자 표시)
  - ✅ 마우스 커서 추적 (Figma 스타일)
  - ✅ 클릭 시각화
- ✅ **주간보고 내보내기** (PDF, CSV)
- ✅ **주간보고 통계** (시간 집계, 완료/진행 중 카드 수)
- ✅ **체크리스트 완료 항목 표시** (주간보고에 통합)
- ✅ **차주 작업 탭** (미완료 작업 표시)

### 11. 권한 관리
- ✅ 보드 소유자: 보드 삭제, 멤버 초대
- ✅ 보드 멤버: 리스트/카드 생성 및 수정
- ✅ 카드 생성자: 본인 카드만 삭제 가능
- ✅ 댓글: 모든 멤버 작성 가능

### 12. UI/UX
- ✅ 다크/라이트 모드 지원
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 스켈레톤 로딩 애니메이션
- ✅ 토스트 알림 피드백 (Sonner)
- ✅ 커스텀 로고 적용
- ✅ D-Day 형식 마감일 표시
- ✅ 8-point grid spacing 시스템
- ✅ 버튼 disabled-first UX (폼 유효성 검사)
- ✅ 드래그앤드롭 애니메이션
- ✅ **카드 디자인 통일** (프로젝트 카드, 주간보고 카드, 완료된 카드 동일한 레이아웃)
- ✅ **모바일 반응형 최적화**

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `profiles` - 사용자 프로필
- `boards` - 보드
- `board_members` - 보드 멤버 관계
- `board_invitations` - 보드 초대
- `lists` - 리스트 (칸반 컬럼)
- `cards` - 카드
- `comments` - 댓글
- `checklists` - 체크리스트
- `checklist_items` - 체크리스트 항목
- `card_time_logs` - 시간 로그
- `notifications` - 알림
- `weekly_reports` - 주간보고 ⭐ **최신 추가**

### 주요 필드
- `cards`: title, description, start_date, due_date, labels, assignee_id, is_completed, completed_at, completed_by
- `boards`: title, emoji, start_date, due_date, created_by
- `lists`: title, position, is_done_list
- `weekly_reports`: board_id, user_id, week_start_date, week_end_date, status, completed_cards, in_progress_cards, card_activities, total_hours, notes

---

## 🛠️ 기술 스택

### Frontend
- Next.js 16 (App Router, Server Components, Server Actions)
- React 19 (React Compiler 활성화)
- TypeScript 5.7
- Tailwind CSS 3.4
- Zustand (상태 관리)
- Framer Motion (애니메이션)
- @dnd-kit (드래그앤드롭)
- React Hook Form + Zod (폼 관리)
- jsPDF (PDF 생성)

### Backend
- Supabase (PostgreSQL, Auth, Realtime)
- Row Level Security (RLS)
- Supabase Realtime (실시간 업데이트, Presence)

### 성능 최적화
- ✅ `async-parallel` - Promise.all() 병렬 데이터 페칭
- ✅ `bundle-dynamic-imports` - next/dynamic 코드 스플리팅
- ✅ `server-cache-react` - React.cache() 요청 중복 방지
- ✅ `reactCompiler: true` - 자동 memoization

---

## 📂 주요 파일 구조

```
app/
├── actions/
│   ├── weekly-report.ts      # 주간보고 CRUD
│   ├── time-log.ts            # 시간 로그 관리
│   ├── checklist.ts           # 체크리스트 관리
│   └── ...
├── board/[id]/weekly-report/
│   ├── new/                   # 주간보고 작성
│   ├── share/                 # 주간보고 공유 (보드별)
│   └── stats/                 # 주간보고 통계
├── weekly-report/
│   └── share/                 # 주간보고 전체 공유 (전역)
├── components/
│   ├── weekly-report/         # 주간보고 컴포넌트
│   └── ...
└── lib/
    └── weekly-report-export.ts # PDF/CSV 내보내기
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

---

## 🚀 구현해야 할 기능

### 1. 주간보고 개선
- [ ] 주간보고 템플릿 기능
- [ ] 주간보고 히스토리 조회 (과거 주간보고)
- [ ] 주간보고 비교 기능 (주간별 비교)
- [ ] 주간보고 검색 기능

### 2. 통계 및 분석
- [ ] 팀 전체 통계 대시보드
- [ ] 프로젝트별 시간 집계
- [ ] 개인 생산성 분석
- [ ] 트렌드 분석 (시간대별, 주간별)

### 3. 알림 개선
- [ ] 주간보고 제출 알림
- [ ] 주간보고 미제출 알림
- [ ] 이메일 알림 설정

### 4. 권한 및 보안
- [ ] 주간보고 공개/비공개 설정
- [ ] 주간보고 수정 권한 관리
- [ ] 주간보고 삭제 권한 관리

### 5. 사용자 경험 개선
- [ ] 주간보고 작성 가이드
- [ ] 주간보고 자동 완성
- [ ] 주간보고 검색 및 필터링
- [ ] 모바일 앱 (선택사항)

### 6. 통합 기능
- [ ] 엑셀 연동 (선택사항)
- [ ] Slack/Teams 연동 (선택사항)
- [ ] API 제공 (선택사항)

---

## 📝 참고 사항

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

### 디자인 통일
- 모든 카드 타입이 동일한 레이아웃 구조 사용
- 모바일 반응형 최적화 완료

---

## 🔄 최근 업데이트 (2026-01-25)

1. ✅ 주간보고 공유 페이지 전역화 (보드별 → 전체 보드)
2. ✅ 실시간 협업 기능 추가 (Presence, 마우스 커서 추적)
3. ✅ 카드 디자인 통일 (프로젝트/주간보고/완료된 카드)
4. ✅ 모바일 반응형 최적화
5. ✅ 체크리스트 자동 생성 (카드 생성 시)
6. ✅ 주간보고 자동 갱신 로직 개선

---

## 📚 관련 문서

- **아키텍처**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **개발 규칙**: [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md)
- **설정 가이드**: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
