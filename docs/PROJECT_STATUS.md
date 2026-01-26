# 📊 Plank 프로젝트 현황

> **최종 업데이트**: 2026-01-26  
> **프로젝트**: Plank (협업 칸반 보드 + 주간보고 시스템)

---

## 🎯 프로젝트 개요

Plank는 팀 협업을 위한 실시간 칸반 보드 애플리케이션입니다. Trello 스타일의 핵심 기능을 구현하고 있으며, **주간보고 작성 및 공유 기능**을 통해 실제 업무 워크플로우를 지원합니다.

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
- ✅ 카드 라벨 시스템 (6가지 색상)
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
- ✅ 카드 생성 시 체크리스트 자동 생성 (카드 제목과 동일한 항목)

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

### 10. 주간보고 기능 ⭐ (핵심 기능)

#### 기본 기능
- ✅ 주간보고 자동 생성 (완료된 카드, 진행 중인 카드, 카드 활동 이력 자동 수집)
- ✅ 주간보고 작성/수정 (진행 중인 카드 상태, 진척도, 설명, 이슈 입력)
- ✅ 주간보고 제출 (draft/submitted 상태 관리)
- ✅ 주간보고 자동 갱신 (카드 변경사항 반영)
- ✅ 차주 작업 탭 (미완료 작업 표시)

#### 공유 & 협업
- ✅ 주간보고 공유 페이지 (전체 보드 접근 가능한 주간보고 조회)
- ✅ 실시간 협업 (Supabase Realtime)
  - ✅ 실시간 데이터 업데이트
  - ✅ Presence 기능 (현재 보고 있는 사용자 표시)
  - ✅ 마우스 커서 추적 (Figma 스타일)
  - ✅ 클릭 시각화


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
- ✅ 카드 디자인 통일 (프로젝트 카드, 주간보고 카드, 완료된 카드)
- ✅ 모바일 반응형 최적화

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 |
| `boards` | 보드 |
| `board_members` | 보드 멤버 관계 |
| `board_invitations` | 보드 초대 |
| `lists` | 리스트 (칸반 컬럼) |
| `cards` | 카드 |
| `comments` | 댓글 |
| `checklists` | 체크리스트 |
| `checklist_items` | 체크리스트 항목 |
| `card_time_logs` | 시간 로그 |
| `notifications` | 알림 |
| `weekly_reports` | 주간보고 |

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.x | App Router, Server Components, Server Actions |
| React | 19.x | React Compiler 활성화 (자동 memoization) |
| TypeScript | 5.7.x | 타입 안전성 |
| Tailwind CSS | 3.4.x | 유틸리티 퍼스트 스타일링 |
| Zustand | 5.x | 클라이언트 상태 관리 |
| Framer Motion | 12.x | UI 애니메이션 |
| @dnd-kit | 6.x | 드래그 앤 드롭 |
| React Hook Form + Zod | 7.x / 3.x | 폼 관리 및 유효성 검사 |
| Recharts | 3.x | 차트/그래프 |
| jsPDF | - | PDF 생성 |

### Backend
| 기술 | 용도 |
|------|------|
| Supabase | PostgreSQL, Authentication, Realtime |
| Resend | 이메일 발송 |
| Google Gemini AI | AI 기능 |

### 성능 최적화
- ✅ `async-parallel` - Promise.all() 병렬 데이터 페칭
- ✅ `bundle-dynamic-imports` - next/dynamic 코드 스플리팅
- ✅ `server-cache-react` - React.cache() 요청 중복 방지
- ✅ `reactCompiler: true` - 자동 memoization

---

## 🚀 향후 개발 로드맵

### Phase 1: 안정화 및 품질 개선 (우선순위: 높음)

#### 버그 수정 및 안정화
- [ ] TypeScript 빌드 에러 수정
- [ ] 에러 핸들링 강화 (에러 바운더리 추가)
- [ ] 로딩 상태 일관성 개선
- [ ] 테스트 커버리지 확대

#### 성능 최적화
- [ ] 대용량 데이터 페이지네이션 최적화
- [ ] 이미지 최적화 (next/image 활용)
- [ ] 번들 사이즈 분석 및 최적화
- [ ] Lighthouse 점수 개선

---

### Phase 2: 사용자 경험 개선 (우선순위: 중간)

#### 알림 시스템 강화
- [ ] 주간보고 제출 알림
- [ ] 주간보고 미제출 리마인더 알림
- [ ] 이메일 알림 설정 (on/off)
- [ ] 푸시 알림 (PWA)

#### 주간보고 개선
- [ ] 주간보고 작성 가이드/튜토리얼
- [ ] AI 기반 주간보고 자동 요약
- [ ] 주간보고 코멘트/피드백 기능
- [ ] 주간보고 승인 워크플로우

#### UI/UX 개선
- [ ] 키보드 단축키 (vim-style navigation)
- [ ] 필터/정렬 기능 강화
- [ ] 보드 템플릿 (스크럼, 스프린트 등)
- [ ] 카드 복사/붙여넣기

---

### Phase 3: 확장 기능 (우선순위: 낮음)

#### 통계 및 분석 고도화
- [ ] 개인 생산성 분석 대시보드
- [ ] 트렌드 분석 (시간대별, 주간별)
- [ ] 번다운 차트 (Burndown Chart)
- [ ] 리드 타임/사이클 타임 분석

#### 협업 기능 강화
- [ ] 실시간 카드 편집 (동시 편집)
- [ ] 멘션 기능 (@username)
- [ ] 카드 링크 공유 (외부 공유)
- [ ] 게스트 접근 (읽기 전용)

#### 외부 연동
- [ ] Slack 연동 (알림)
- [ ] Microsoft Teams 연동
- [ ] Google Calendar 연동
- [ ] Jira 데이터 import

#### 관리자 기능
- [ ] 워크스페이스 관리
- [ ] 팀원 활동 로그
- [ ] 권한 그룹 커스터마이징
- [ ] 감사 로그 (Audit Log)

---

### Phase 4: 엔터프라이즈 (미래)

- [ ] SSO (Single Sign-On) 지원
- [ ] API 제공 (REST / GraphQL)
- [ ] 웹훅 (Webhook) 지원
- [ ] 데이터 백업/복원
- [ ] 화이트라벨링
- [ ] 모바일 앱 (React Native)

---

## 📂 주요 파일 구조

```
app/
├── actions/                    # Server Actions
│   ├── auth.ts                 # 인증
│   ├── board.ts                # 보드 CRUD
│   ├── card.ts                 # 카드 CRUD
│   ├── checklist.ts            # 체크리스트 CRUD
│   ├── comment.ts              # 댓글 CRUD
│   ├── completed.ts            # 완료 카드 조회
│   ├── invitation.ts           # 초대 관리
│   ├── list.ts                 # 리스트 CRUD
│   ├── member.ts               # 멤버 관리
│   ├── notification.ts         # 알림 관리
│   ├── time-log.ts             # 시간 로그
│   └── weekly-report.ts        # 주간보고 CRUD
│
├── board/[id]/
│   ├── page.tsx                # 보드 상세 페이지
│   ├── BoardClient.tsx         # 보드 클라이언트 컴포넌트
│   └── weekly-report/          # 주간보고 기능
│       ├── new/                # 작성
│       └── share/              # 공유
│
├── weekly-report/              # 전역 주간보고
│   └── share/                  # 전체 공유
│
├── components/                 # UI 컴포넌트
│   ├── auth/                   # 인증 (UserMenu, 알림, 초대)
│   ├── board/                  # 보드
│   ├── card/                   # 카드
│   ├── column/                 # 컬럼
│   ├── home/                   # 홈
│   ├── layout/                 # 레이아웃
│   ├── weekly-report/          # 주간보고
│   └── ui/                     # 공통 UI
│
└── lib/
    └── utils.ts                    # 유틸리티 함수
```

---

## 🔄 최근 업데이트 (2026-01-26)

1. ✅ 주간보고 핵심 기능 정리 (불필요한 기능 제거)
2. ✅ TypeScript 빌드 에러 수정
3. ✅ 프로젝트 문서화 업데이트

---

## 📚 관련 문서

- **아키텍처**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **개발 규칙**: [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md)
- **설정 가이드**: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
- **비즈니스 전략**: [`BUSINESS_STRATEGY.md`](./BUSINESS_STRATEGY.md)
- **경쟁 우위**: [`COMPETITIVE_ADVANTAGES.md`](./COMPETITIVE_ADVANTAGES.md)
