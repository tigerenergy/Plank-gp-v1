# 🔄 주간보고 기능 개발 전 마이그레이션 계획

> **작성일**: 2026-01-21  
> **목적**: 기존 기능과의 충돌/중복 제거 및 변경 사항 정리  
> **상태**: 개발 전 필수 검토 문서

---

## 📋 개요

새로운 주간보고 기능을 개발하기 전에, 기존에 구현된 기능들과의 충돌을 분석하고 불필요한 기능을 제거/수정하여 개발 시간을 절약하고 코드 복잡도를 낮추는 것이 목표입니다.

---

## 🗑️ 삭제할 기능

### 1. 이메일로 주간보고 보내는 기능 ⚠️ **완전 삭제**

**이유**: 새로운 주간보고는 웹페이지로 공유하므로 이메일 전송 기능이 불필요합니다.

#### 삭제할 파일/코드:

**1.1 서버 액션**
- `app/actions/email.ts` - **전체 파일 삭제**
  - `sendReportToEmail()` 함수
  - `getEmailLogs()` 함수
  - `deleteEmailLog()` 함수
  - `EmailLog` 타입

**1.2 이메일 라이브러리**
- `lib/email.ts` - **부분 삭제**
  - `sendReportEmail()` 함수만 삭제 (보고서 이메일 전송 관련)
  - `createEmailTemplate()` 함수 (보고서용 템플릿) 삭제
  - ⚠️ **보드 초대 이메일 기능은 유지** (다른 용도로 사용 중)

**1.3 UI 컴포넌트**
- `app/board/[id]/completed/CompletedPageClient.tsx` - **부분 삭제**
  - 이메일 발송 모달 관련 코드 (라인 918-1172)
  - `openEmailModal()` 함수
  - `handleSendEmail()` 함수
  - `loadEmailLogs()` 함수
  - 이메일 관련 상태 및 UI

**1.4 상태 관리**
- `store/useCompletedStore.ts` - **부분 삭제**
  - 이메일 관련 상태 제거:
    - `showEmailModal: boolean`
    - `emailRecipients: string[]`
    - `isSendingEmail: boolean`
    - `emailLogs: EmailLog[]`
  - 이메일 관련 액션 제거:
    - `setShowEmailModal()`
    - `setEmailRecipients()`
    - `setIsSendingEmail()`
    - `setEmailLogs()`
    - `addMemberAsRecipient()`
    - `removeMemberFromRecipient()`
    - `resetEmailModal()`

**1.5 데이터베이스**
- `supabase/migrations/018_add_completion_feature.sql` - **마이그레이션 파일 확인 필요**
  - `email_logs` 테이블 삭제 (또는 유지 - 다른 용도로 사용 중일 수 있음)
  - ⚠️ **확인 필요**: 보드 초대 이메일 로그도 이 테이블을 사용하는지 확인

**1.6 환경 변수**
- `.env` 파일에서 `RESEND_API_KEY` - **선택적 삭제**
  - ⚠️ **확인 필요**: 보드 초대 이메일도 Resend를 사용하는지 확인
  - 보드 초대 이메일도 Resend를 사용한다면 유지

**1.7 의존성**
- `package.json` - **확인 필요**
  - `resend` 패키지가 보드 초대 이메일에도 사용되는지 확인
  - 보드 초대 이메일에도 사용된다면 유지

---

### 2. AI로 주간보고 자동 생성 기능 ⚠️ **부분 삭제 또는 선택사항으로 변경**

**이유**: 새로운 주간보고는 사용자가 직접 작성하는 방식이므로, AI 자동 생성 기능은 필요 없습니다.  
하지만 통합 보고서 생성 시 AI 요약 기능은 유용할 수 있으므로, 완전 삭제보다는 "선택사항"으로 남겨둘 수 있습니다.

#### 옵션 A: 완전 삭제 (권장)

**2.1 서버 액션**
- `app/actions/report.ts` - **전체 파일 삭제**
  - `createAIReport()` 함수
  - `getReports()` 함수 (AI 보고서 조회)
  - `deleteReport()` 함수 (AI 보고서 삭제)
  - `Report`, `ReportCard`, `ReportType`, `PeriodFilter` 타입

**2.2 AI 라이브러리**
- `lib/gemini.ts` - **전체 파일 삭제**
  - `generateReport()` 함수
  - `generateReportTitle()` 함수

**2.3 UI 컴포넌트**
- `app/board/[id]/completed/CompletedPageClient.tsx` - **부분 삭제**
  - AI 보고서 생성 관련 코드
  - 보고서 목록 표시 UI
  - 보고서 상세 모달

**2.4 데이터베이스**
- `reports` 테이블 - **삭제 또는 유지**
  - 옵션 1: 완전 삭제 (마이그레이션 파일 생성)
  - 옵션 2: 유지 (나중에 통합 보고서 생성 시 사용 가능)

**2.5 환경 변수**
- `.env` 파일에서 `GEMINI_API_KEY` - **삭제**

**2.6 의존성**
- `package.json` - **삭제**
  - `@google/generative-ai` 패키지

#### 옵션 B: 선택사항으로 유지 (나중에 통합 보고서용)

- AI 보고서 기능을 그대로 유지하되, 주간보고와는 별도로 운영
- 통합 보고서 생성 시 AI 요약 기능으로 활용 가능
- **권장**: 옵션 A (완전 삭제) - 나중에 필요하면 다시 추가

---

## 🔧 수정할 기능

### 1. 완료된 작업 페이지 (`app/board/[id]/completed`)

**현재 상태**:
- AI 보고서 생성 기능 포함
- 이메일 발송 기능 포함
- 완료된 카드 조회 기능 포함 ✅ **유지**

**수정 사항**:
- AI 보고서 생성 기능 제거
- 이메일 발송 기능 제거
- 완료된 카드 조회 기능은 유지 (주간보고에서 활용)
- 주간보고 작성 버튼 추가 (새 기능)

---

### 2. 완료된 카드 조회 함수 (`app/actions/completed.ts`)

**현재 상태**:
- `getCompletedCards()` 함수 ✅ **유지 및 활용**

**수정 사항**:
- 수정 불필요, 그대로 활용
- 주간보고 작성 시 이 함수를 호출하여 완료된 카드 자동 수집

---

### 3. 보드 데이터 조회 함수

**현재 상태**:
- 보드의 모든 카드를 조회하는 함수 필요

**수정 사항**:
- 기존 함수 확인 필요 (`app/actions/board.ts` 또는 `app/actions/card.ts`)
- 진행 중인 카드 조회 함수 추가 또는 기존 함수 활용
- 주간보고 작성 시 모든 리스트의 모든 카드 자동 수집

---

## ➕ 추가할 기능

### 1. 시간 추적 기능

**새로 추가**:
- 카드별 작업 시간 기록
- 주간보고 작성 시 시간 자동 집계
- Jira 스타일 시간 입력 UI

**데이터베이스**:
- `card_time_logs` 테이블 생성 (새 마이그레이션)
- 또는 `weekly_report_cards` 테이블에 `hours_spent` 필드 추가

---

### 2. 주간보고 작성 UI

**새로 추가**:
- 주간보고 작성 페이지 (`app/board/[id]/weekly-report/new`)
- 주간보고 공유 페이지 (`app/board/[id]/weekly-report/share`)
- 자동 수집된 데이터 표시
- 보완 입력 폼 (진행 상태, 진척도, 이슈사항 등)

---

### 3. 실시간 업데이트

**새로 추가**:
- Supabase Realtime 구독 (`weekly_reports` 테이블)
- 주간보고 공유 페이지 실시간 동기화
- Presence 표시 (선택사항)

---

## 📊 데이터베이스 변경 사항

### 삭제할 테이블 (옵션)

1. **`email_logs`** (확인 필요)
   - 보드 초대 이메일 로그도 사용하는지 확인
   - 보고서 이메일 로그만 사용한다면 삭제

2. **`reports`** (옵션)
   - AI 보고서 테이블
   - 완전 삭제 또는 유지 (나중에 통합 보고서용)

### 추가할 테이블

1. **`weekly_reports`** (새로 생성)
   - 개인별 주간보고 저장

2. **`weekly_report_cards`** (새로 생성)
   - 주간보고에 포함된 카드별 상세 정보

3. **`card_time_logs`** (새로 생성, 선택사항)
   - 카드별 작업 시간 기록

---

## 🎨 UI/UX 변경 사항

### 1. 완료된 작업 페이지

**변경 전**:
- AI 보고서 생성 버튼
- 이메일 발송 버튼
- 보고서 목록

**변경 후**:
- 주간보고 작성 버튼 (새로 추가)
- 완료된 카드 목록 (유지)
- 통계 (유지)

---

### 2. 카드 모달

**추가할 기능**:
- 시간 추적 UI (Jira 스타일)
- 체크리스트 진행률 표시 (이미 있음)
- 댓글 수 표시 (이미 있음)

---

### 3. 보드 헤더

**추가할 기능**:
- 주간보고 메뉴 (드롭다운)
  - 주간보고 작성
  - 주간보고 공유 페이지

---

## 🔍 확인 필요 사항

### 1. 이메일 관련

- [ ] 보드 초대 이메일도 Resend를 사용하는가?
- [ ] `email_logs` 테이블이 보드 초대 이메일 로그도 저장하는가?
- [ ] `lib/email.ts`의 다른 함수들도 사용 중인가?

### 2. AI 보고서 관련

- [ ] `reports` 테이블에 기존 데이터가 있는가?
- [ ] 기존 데이터를 보존해야 하는가?
- [ ] 통합 보고서 생성 시 AI 요약 기능이 필요한가?

### 3. 완료된 카드 조회

- [ ] `getCompletedCards()` 함수가 주간보고 요구사항을 충족하는가?
- [ ] 기간 필터링이 정확한가?
- [ ] 추가 필드가 필요한가?

### 4. 보드 데이터 조회

- [ ] 보드의 모든 카드를 조회하는 함수가 있는가?
- [ ] 리스트별로 필터링 가능한가?
- [ ] 카드 활동 이력(생성/수정/이동)을 추적할 수 있는가?

---

## 📝 개발 순서 (권장)

### Phase 0: 정리 작업 (1일)

1. **이메일 기능 삭제**
   - [ ] `app/actions/email.ts` 삭제
   - [ ] `lib/email.ts`에서 보고서 이메일 관련 코드 삭제
   - [ ] `CompletedPageClient.tsx`에서 이메일 모달 제거
   - [ ] `useCompletedStore.ts`에서 이메일 관련 상태 제거
   - [ ] `email_logs` 테이블 삭제 (확인 후)

2. **AI 보고서 기능 삭제** (또는 유지)
   - [ ] `app/actions/report.ts` 삭제 (또는 유지)
   - [ ] `lib/gemini.ts` 삭제 (또는 유지)
   - [ ] `CompletedPageClient.tsx`에서 AI 보고서 UI 제거
   - [ ] `reports` 테이블 삭제 또는 유지 결정

3. **완료된 작업 페이지 정리**
   - [ ] 불필요한 버튼 제거
   - [ ] 주간보고 작성 버튼 추가 (임시, 링크만)

### Phase 1: 데이터베이스 (1일)

1. **새 테이블 생성**
   - [ ] `weekly_reports` 테이블 생성
   - [ ] `weekly_report_cards` 테이블 생성
   - [ ] `card_time_logs` 테이블 생성 (선택사항)

2. **RLS 정책 설정**
   - [ ] `weekly_reports` RLS 정책
   - [ ] `weekly_report_cards` RLS 정책

### Phase 2: 백엔드 (2-3일)

1. **서버 액션 생성**
   - [ ] 주간보고 작성/수정/삭제
   - [ ] 자동 수집 로직 (완료된 카드, 진행 중인 카드)
   - [ ] 시간 추적 로직

2. **기존 함수 활용**
   - [ ] `getCompletedCards()` 활용
   - [ ] 보드 데이터 조회 함수 활용

### Phase 3: 프론트엔드 (3-4일)

1. **주간보고 작성 UI**
   - [ ] 자동 수집된 데이터 표시
   - [ ] 보완 입력 폼
   - [ ] 시간 추적 UI

2. **주간보고 공유 페이지**
   - [ ] 실시간 업데이트
   - [ ] 개인별 주간보고 표시

---

## ⚠️ 주의사항

1. **기존 데이터 보존**
   - `reports` 테이블에 기존 데이터가 있다면 백업
   - 삭제 전 확인

2. **의존성 확인**
   - `resend` 패키지가 다른 곳에서도 사용되는지 확인
   - `@google/generative-ai` 패키지가 다른 곳에서도 사용되는지 확인

3. **환경 변수**
   - `.env.example` 파일도 업데이트
   - 삭제할 환경 변수 명시

4. **마이그레이션**
   - 테이블 삭제 시 마이그레이션 파일 생성
   - 롤백 가능하도록

---

## ✅ 체크리스트

### 삭제 작업
- [ ] `app/actions/email.ts` 삭제
- [ ] `lib/email.ts`에서 보고서 이메일 관련 코드 삭제
- [ ] `CompletedPageClient.tsx`에서 이메일 모달 제거
- [ ] `useCompletedStore.ts`에서 이메일 관련 상태 제거
- [ ] `app/actions/report.ts` 삭제 (또는 유지 결정)
- [ ] `lib/gemini.ts` 삭제 (또는 유지 결정)
- [ ] `CompletedPageClient.tsx`에서 AI 보고서 UI 제거
- [ ] `email_logs` 테이블 삭제 (확인 후)
- [ ] `reports` 테이블 삭제 또는 유지 결정

### 수정 작업
- [ ] 완료된 작업 페이지 정리
- [ ] 주간보고 작성 버튼 추가

### 추가 작업
- [ ] `weekly_reports` 테이블 생성
- [ ] `weekly_report_cards` 테이블 생성
- [ ] 주간보고 작성 UI
- [ ] 주간보고 공유 페이지
- [ ] 실시간 업데이트

---

## 📚 참고 문서

- [`CURRENT_FEATURES.md`](./CURRENT_FEATURES.md) - 현재 구현된 기능 목록
- [`WEEKLY_REPORT_FEATURE.md`](./WEEKLY_REPORT_FEATURE.md) - 새로운 주간보고 기능 계획
- [`INTEGRATION_ANALYSIS.md`](./INTEGRATION_ANALYSIS.md) - 통합 분석
