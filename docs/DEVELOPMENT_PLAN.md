# 🚀 주간보고 기능 종합 개발 계획서

> **작성일**: 2026-01-21  
> **목적**: 주간보고 기능 개발을 위한 종합 계획 및 마이그레이션 가이드  
> **상태**: 개발 시작 전 필수 문서

---

## 📋 목차

1. [개요](#개요)
2. [기존 기능 정리 (마이그레이션)](#기존-기능-정리-마이그레이션)
3. [새로운 기능 요구사항](#새로운-기능-요구사항)
4. [데이터베이스 설계](#데이터베이스-설계)
5. [개발 태스크](#개발-태스크)
6. [체크리스트](#체크리스트)

---

## 🎯 개요

### 목표
- 개인별 주간보고 작성 기능 (완료/진행중 모두 포함)
- 웹페이지로 주간보고 공유 (실시간 업데이트)
- 작업 시간 추적 (Jira 스타일)
- **상급자와 직원이 서로 볼 수 밖에 없는 완전히 투명한 구조**

### 핵심 가치 제안
- **"상급자들도 놀 수 없음"** - 상급자의 작업도 직원에게, 직원의 작업도 상급자에게 완전히 공개
- 실제 작업 활동 자동 수집 (보드의 모든 활동)
- 수동 입력 최소화

---

## 🗑️ 기존 기능 정리 (마이그레이션)

### Phase 0: 정리 작업 (1일) ⚠️ **최우선**

#### 1. 이메일로 주간보고 보내는 기능 삭제

**삭제할 파일/코드**:
- [ ] `app/actions/email.ts` - **전체 파일 삭제**
- [ ] `lib/email.ts` - 보고서 이메일 관련 코드만 삭제 (보드 초대 이메일은 유지)
- [ ] `app/board/[id]/completed/CompletedPageClient.tsx` - 이메일 모달 제거 (라인 918-1172)
- [ ] `store/useCompletedStore.ts` - 이메일 관련 상태 제거
- [ ] `email_logs` 테이블 삭제 (확인 후)

**확인 필요**:
- [ ] 보드 초대 이메일도 Resend를 사용하는가?
- [ ] `email_logs` 테이블이 보드 초대 이메일 로그도 저장하는가?

#### 2. AI로 주간보고 자동 생성 기능 삭제

**삭제할 파일/코드**:
- [ ] `app/actions/report.ts` - **전체 파일 삭제**
- [ ] `lib/gemini.ts` - **전체 파일 삭제**
- [ ] `app/board/[id]/completed/CompletedPageClient.tsx` - AI 보고서 UI 제거
- [ ] `reports` 테이블 삭제 또는 유지 결정
- [ ] `.env`에서 `GEMINI_API_KEY` 삭제
- [ ] `package.json`에서 `@google/generative-ai` 패키지 삭제

**확인 필요**:
- [ ] `reports` 테이블에 기존 데이터가 있는가?
- [ ] 기존 데이터를 보존해야 하는가?

#### 3. 완료된 작업 페이지 정리

**수정 사항**:
- [ ] AI 보고서 생성 버튼 제거
- [ ] 이메일 발송 버튼 제거
- [ ] 보고서 목록 UI 제거
- [ ] 주간보고 작성 버튼 추가 (임시, 링크만)

---

## 📊 새로운 기능 요구사항

### 1. 주간보고 작성 (개인)

#### 1.1 활동 기반 자동 수집 ⭐ **핵심**

**자동 수집되는 데이터**:
- 모든 리스트의 모든 카드 (할일, 진행중, 검토요청, 완료)
- 완료된 카드 (해당 주간 completed_at 기준)
- 진행 중인 카드 (할일, 진행중, 검토요청 리스트의 모든 카드)
- 카드 생성/수정/삭제/이동 이력
- 체크리스트 진행 상황
- 댓글 작성 내역
- 작업 시간 (카드별 시간 로그)

**보완 입력**:
- 진행 상태 (드롭다운: 진행중, 완료, 대기, 예정)
- 진척도 (퍼센트)
- 추가 설명 (선택사항)
- 예상 완료일 (선택사항)
- 이슈사항 (선택사항)

#### 1.2 주간보고 저장

- 개인별로 저장 (각 사용자별로 개별 저장)
- 임시 저장 (draft 상태)
- 제출 (submitted 상태, 웹페이지에 표시됨)
- 작성자만 수정 가능

### 2. 주간보고 공유 페이지 ⭐ **핵심**

- 개개인이 뭐뭐 했는지 다같이 볼 수 있는 웹페이지
- 개인별로 무엇을 했고 진척도, 작업 시간까지 표시
- **실시간 업데이트** (피그마/엑셀 공유 시트처럼)
  - Supabase Realtime 구독
  - 다른 사람이 주간보고를 수정/제출하면 자동으로 업데이트
  - 페이지를 오픈해두면 자동으로 최신 데이터 표시
- 실시간 협업 표시 (presence, 선택사항)

---

## 🗄️ 데이터베이스 설계

### 새로 생성할 테이블

#### 1. `weekly_reports` 테이블

```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,  -- 주간 시작일 (월요일)
  week_end_date DATE NOT NULL,     -- 주간 종료일 (일요일)
  status VARCHAR(20) DEFAULT 'draft',  -- draft, submitted
  -- 보고서 내용 (JSON)
  completed_cards JSONB,      -- 완료된 카드 목록 (자동 수집)
  in_progress_cards JSONB,     -- 진행 중인 카드 목록 (자동 수집 + 보완 입력)
  card_activities JSONB,       -- 카드 활동 이력 (자동 수집)
  total_hours DECIMAL(8,2),   -- 주간 총 작업 시간 (자동 집계)
  notes TEXT,                  -- 추가 메모
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, user_id, week_start_date)
);
```

#### 2. `weekly_report_cards` 테이블 (선택사항)

```sql
CREATE TABLE weekly_report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  status VARCHAR(20),  -- 진행중, 완료, 대기, 예정
  progress INTEGER,    -- 진척도 (0-100)
  description TEXT,    -- 추가 설명
  expected_completion_date DATE,
  issues TEXT,         -- 이슈사항
  hours_spent DECIMAL(8,2),  -- 작업 시간
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `card_time_logs` 테이블 (선택사항)

```sql
CREATE TABLE card_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hours DECIMAL(8,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS 정책

- **조회**: 보드 멤버 모두 조회 가능
- **생성/수정/삭제**: 작성자만 가능
- **삭제**: 주간보고는 삭제 불가 (데이터 영구 보존)

---

## 📝 개발 태스크

### Phase 0: 정리 작업 (1일) ⚠️ **최우선**

#### Task 0.1: 이메일 기능 삭제
- [ ] `app/actions/email.ts` 삭제
- [ ] `lib/email.ts`에서 보고서 이메일 관련 코드 삭제
- [ ] `CompletedPageClient.tsx`에서 이메일 모달 제거
- [ ] `useCompletedStore.ts`에서 이메일 관련 상태 제거
- [ ] `email_logs` 테이블 삭제 마이그레이션 생성 (확인 후)

#### Task 0.2: AI 보고서 기능 삭제
- [ ] `app/actions/report.ts` 삭제
- [ ] `lib/gemini.ts` 삭제
- [ ] `CompletedPageClient.tsx`에서 AI 보고서 UI 제거
- [ ] `reports` 테이블 삭제 마이그레이션 생성 (또는 유지 결정)
- [ ] `package.json`에서 `@google/generative-ai` 삭제
- [ ] `.env`에서 `GEMINI_API_KEY` 제거

#### Task 0.3: 완료된 작업 페이지 정리
- [ ] AI 보고서 생성 버튼 제거
- [ ] 이메일 발송 버튼 제거
- [ ] 보고서 목록 UI 제거
- [ ] 주간보고 작성 버튼 추가 (임시 링크)

---

### Phase 1: 데이터베이스 (1시간)

#### Task 1.1: 새 테이블 생성
- [ ] `weekly_reports` 테이블 생성 마이그레이션
- [ ] `weekly_report_cards` 테이블 생성 마이그레이션 (선택사항)
- [ ] `card_time_logs` 테이블 생성 마이그레이션 (선택사항)

#### Task 1.2: RLS 정책 설정
- [ ] `weekly_reports` RLS 정책 (보드 멤버 조회, 작성자만 수정)
- [ ] `weekly_report_cards` RLS 정책 (선택사항)
- [ ] `card_time_logs` RLS 정책 (선택사항)

#### Task 1.3: 인덱스 생성
- [ ] `weekly_reports(board_id, user_id, week_start_date)` 인덱스
- [ ] `weekly_reports(board_id, week_start_date)` 인덱스 (공유 페이지용)

---

### Phase 2: 백엔드 - 자동 수집 로직 (2-3시간)

#### Task 2.1: 완료된 카드 자동 수집
- [ ] `getCompletedCards()` 함수 활용
- [ ] 주간 필터링 로직 추가
- [ ] 완료된 카드 데이터 구조화

#### Task 2.2: 진행 중인 카드 자동 수집
- [ ] 보드의 모든 카드 조회 함수 확인/생성
- [ ] 미완료 카드 필터링 (할일, 진행중, 검토요청 리스트)
- [ ] 카드별 메타데이터 수집 (체크리스트 진행률, 댓글 수 등)

#### Task 2.3: 카드 활동 이력 수집
- [ ] 카드 생성 이력 (created_at 기준)
- [ ] 카드 수정 이력 (updated_at 기준)
- [ ] 카드 이동 이력 (리스트 간 이동 추적)
- [ ] 체크리스트 변경 이력
- [ ] 댓글 작성 이력

#### Task 2.4: 시간 추적 로직
- [ ] 카드별 작업 시간 집계 함수
- [ ] 주간 총 시간 계산
- [ ] 시간 로그 저장/조회

---

### Phase 3: 백엔드 - 서버 액션 (2-3시간)

#### Task 3.1: 주간보고 CRUD
- [ ] `createWeeklyReport()` - 주간보고 생성
- [ ] `updateWeeklyReport()` - 주간보고 수정
- [ ] `getWeeklyReport()` - 주간보고 조회
- [ ] `getWeeklyReportsByBoard()` - 보드별 주간보고 목록 조회
- [ ] `submitWeeklyReport()` - 주간보고 제출

#### Task 3.2: 자동 수집 통합
- [ ] 주간보고 생성 시 자동 수집 로직 통합
- [ ] 완료된 카드 + 진행 중인 카드 + 활동 이력 수집
- [ ] 시간 자동 집계

#### Task 3.3: 유효성 검사
- [ ] 주간보고 중복 생성 방지 (같은 주, 같은 사용자)
- [ ] 필수 필드 검증
- [ ] 권한 검증 (작성자만 수정 가능)

---

### Phase 4: 프론트엔드 - 주간보고 작성 UI (3-4시간)

#### Task 4.1: 주간보고 작성 페이지
- [ ] `app/board/[id]/weekly-report/new` 페이지 생성
- [ ] 자동 수집된 데이터 표시 컴포넌트
- [ ] 완료된 카드 목록 표시
- [ ] 진행 중인 카드 목록 표시
- [ ] 카드 활동 이력 표시

#### Task 4.2: 보완 입력 폼
- [ ] 진행 상태 드롭다운 (진행중, 완료, 대기, 예정)
- [ ] 진척도 입력 (0-100%)
- [ ] 추가 설명 입력 (텍스트 에어리어)
- [ ] 예상 완료일 선택 (DatePicker)
- [ ] 이슈사항 입력 (텍스트 에어리어)
- [ ] 작업 시간 입력 (Jira 스타일)

#### Task 4.3: 저장 및 제출
- [ ] 임시 저장 기능 (draft 상태)
- [ ] 제출 기능 (submitted 상태)
- [ ] 폼 유효성 검사
- [ ] 로딩 상태 처리
- [ ] 에러 처리

---

### Phase 5: 프론트엔드 - 주간보고 공유 페이지 (2-3시간)

#### Task 5.1: 공유 페이지 레이아웃
- [ ] `app/board/[id]/weekly-report/share` 페이지 생성
- [ ] 주간별 필터링 (이번 주, 지난 주 등)
- [ ] 개인별 주간보고 카드 컴포넌트

#### Task 5.2: 개인별 주간보고 표시
- [ ] 팀원 목록 표시
- [ ] 개인별 완료된 작업 표시
- [ ] 개인별 진행 중인 작업 표시
- [ ] 진척도 시각화 (프로그레스 바)
- [ ] 작업 시간 표시
- [ ] 제출 현황 표시 (제출 완료/미제출)

#### Task 5.3: 실시간 업데이트
- [ ] Supabase Realtime 구독 설정 (`weekly_reports` 테이블)
- [ ] 다른 사람이 주간보고를 수정/제출하면 자동 업데이트
- [ ] 페이지를 오픈해두면 자동으로 최신 데이터 표시
- [ ] Presence 표시 (선택사항)

---

### Phase 6: 통합 및 개선 (1시간)

#### Task 6.1: 보드 헤더 통합
- [ ] 보드 헤더에 "주간보고" 메뉴 추가
- [ ] 주간보고 작성 바로가기
- [ ] 주간보고 공유 페이지 바로가기

#### Task 6.2: 완료된 작업 페이지 통합
- [ ] 주간보고 작성 버튼 추가 (실제 링크)
- [ ] 주간보고 공유 페이지 링크 추가

#### Task 6.3: 카드 모달 개선
- [ ] 시간 추적 UI 추가 (Jira 스타일, 선택사항)
- [ ] 체크리스트 진행률 표시 (이미 있음)
- [ ] 댓글 수 표시 (이미 있음)

---

## ✅ 체크리스트

### Phase 0: 정리 작업
- [ ] 이메일 기능 삭제 완료
- [ ] AI 보고서 기능 삭제 완료
- [ ] 완료된 작업 페이지 정리 완료

### Phase 1: 데이터베이스
- [ ] 새 테이블 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] 인덱스 생성 완료

### Phase 2: 백엔드 - 자동 수집
- [ ] 완료된 카드 자동 수집 완료
- [ ] 진행 중인 카드 자동 수집 완료
- [ ] 카드 활동 이력 수집 완료
- [ ] 시간 추적 로직 완료

### Phase 3: 백엔드 - 서버 액션
- [ ] 주간보고 CRUD 완료
- [ ] 자동 수집 통합 완료
- [ ] 유효성 검사 완료

### Phase 4: 프론트엔드 - 작성 UI
- [ ] 주간보고 작성 페이지 완료
- [ ] 보완 입력 폼 완료
- [ ] 저장 및 제출 완료

### Phase 5: 프론트엔드 - 공유 페이지
- [ ] 공유 페이지 레이아웃 완료
- [ ] 개인별 주간보고 표시 완료
- [ ] 실시간 업데이트 완료

### Phase 6: 통합 및 개선
- [ ] 보드 헤더 통합 완료
- [ ] 완료된 작업 페이지 통합 완료
- [ ] 카드 모달 개선 완료

---

## 📚 참고 문서

- [`CURRENT_FEATURES.md`](./CURRENT_FEATURES.md) - 현재 구현된 기능 목록
- [`WEEKLY_REPORT_FEATURE.md`](./WEEKLY_REPORT_FEATURE.md) - 상세 기능 계획
- [`INTEGRATION_ANALYSIS.md`](./INTEGRATION_ANALYSIS.md) - 통합 분석
- [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) - 마이그레이션 상세 계획

---

## 🎯 개발 우선순위

1. **Phase 0** (정리 작업) - 최우선, 개발 시작 전 필수
2. **Phase 1** (데이터베이스) - 기반 구조
3. **Phase 2-3** (백엔드) - 핵심 로직
4. **Phase 4-5** (프론트엔드) - 사용자 인터페이스
5. **Phase 6** (통합) - 마무리

**총 예상 기간**: 1-2일 (집중 개발)
