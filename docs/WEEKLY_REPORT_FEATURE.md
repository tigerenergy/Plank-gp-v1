# 📊 주간보고 기능 개발 계획서

> **프로젝트**: Plank  
> **작성일**: 2026-01-21  
> **목표**: 주간보고 작성 및 통합 워크플로우 구현

---

## 🎯 배경 및 목표

### 현재 상황
- 회사에서 주간보고를 엑셀 시트(공유 시트)로 작성
- 각 팀원이 개별적으로 주간보고 작성
- 부장이 통합하여 상급자에게 보고
- **문제점**: 엑셀 시트 관리가 번거롭고, 실시간 협업이 어려움

### 목표
1. **개인별 주간보고 작성 기능**
   - 완료되지 않은 작업도 포함
   - 현재 상태, 진행상황, 예상 완료일, 이슈사항 기록

2. **부장 통합 보고서 생성**
   - 팀원들의 주간보고를 자동으로 통합
   - AI 기반 요약 및 분석

3. **상급자 보고 기능**
   - 통합 보고서를 상급자에게 전달
   - 이메일/PDF 내보내기

---

## 📋 기능 요구사항

### 1. 주간보고 작성 (개인)

#### 1.1 카드 기반 보고서
- **완료된 카드**: 자동으로 완료 내역 포함
- **진행 중인 카드**: 수동으로 진행상황 작성
  - 현재 상태 (진행률 %)
  - 어디까지 진행됐는지 (상세 설명)
  - 예상 완료일
  - 이슈사항 (블로커, 리스크 등)

#### 1.2 보고서 작성 UI
- 주간보고 작성 페이지/모달
- 카드별 진행상황 입력 폼
- 템플릿 기반 작성 (선택사항)

#### 1.3 보고서 저장
- 주간보고 테이블에 저장
- 보드별, 사용자별, 주간별 구분
- 수정 가능 (제출 전까지)

### 2. 부장 통합 보고서

#### 2.1 보고서 수집
- 팀원들의 주간보고 자동 수집
- 미제출자 확인
- 제출 현황 대시보드

#### 2.2 통합 보고서 생성
- AI 기반 요약 및 분석
- 카테고리별 그룹화 (완료/진행중/이슈)
- 통계 및 차트 생성

#### 2.3 보고서 검토 및 수정
- 부장이 통합 보고서 검토
- 추가 코멘트 작성
- 수정 후 최종 확정

### 3. 상급자 보고

#### 3.1 보고서 전송
- 이메일로 보고서 전송
- PDF 다운로드
- 링크 공유

#### 3.2 보고서 아카이브
- 과거 보고서 조회
- 검색 및 필터링

---

## 🗄️ 데이터베이스 설계

### 1. weekly_reports 테이블 (개인 주간보고)

```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- 주간보고 시작일 (월요일)
  week_end_date DATE NOT NULL,   -- 주간보고 종료일 (일요일)
  
  -- 보고서 메타데이터
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, reviewed
  
  -- 보고서 내용 (JSON)
  completed_cards JSONB,      -- 완료된 카드 목록
  in_progress_cards JSONB,     -- 진행 중인 카드 목록 (진행상황 포함)
  issues JSONB,                -- 이슈사항 목록
  notes TEXT,                  -- 추가 메모
  
  -- 제출 정보
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(board_id, user_id, week_start_date) -- 한 주에 한 번만 작성 가능
);
```

### 2. weekly_report_cards 테이블 (카드별 진행상황)

```sql
CREATE TABLE weekly_report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  
  -- 진행상황 정보
  status VARCHAR(50) NOT NULL, -- completed, in_progress, blocked, not_started
  progress_percent INTEGER DEFAULT 0, -- 0-100
  current_status TEXT,         -- 어디까지 진행됐는지
  expected_completion_date DATE, -- 예상 완료일
  issues TEXT,                 -- 이슈사항
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(weekly_report_id, card_id)
);
```

### 3. integrated_reports 테이블 (통합 보고서)

```sql
CREATE TABLE integrated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- 통합 보고서 메타데이터
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- draft, finalized, sent
  
  -- 통합 보고서 내용 (JSON)
  summary TEXT,                -- AI 생성 요약
  completed_summary JSONB,     -- 완료 작업 요약
  in_progress_summary JSONB,   -- 진행 중 작업 요약
  issues_summary JSONB,        -- 이슈 요약
  statistics JSONB,            -- 통계 데이터
  
  -- 생성 정보
  created_by UUID REFERENCES profiles(id), -- 부장
  finalized_at TIMESTAMPTZ,
  sent_to JSONB,               -- 수신자 목록
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(board_id, week_start_date)
);
```

### 4. integrated_report_contributions 테이블 (통합 보고서 기여)

```sql
CREATE TABLE integrated_report_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrated_report_id UUID REFERENCES integrated_reports(id) ON DELETE CASCADE,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(integrated_report_id, weekly_report_id)
);
```

---

## 🎨 UI/UX 설계

### 1. 주간보고 작성 페이지

#### 1.1 레이아웃
```
┌─────────────────────────────────────────┐
│  주간보고 작성 (2026-01-15 ~ 2026-01-21) │
├─────────────────────────────────────────┤
│                                         │
│  📋 완료된 작업                          │
│  ┌─────────────────────────────────┐   │
│  │ [자동] 카드1, 카드2, 카드3...    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🔄 진행 중인 작업                       │
│  ┌─────────────────────────────────┐   │
│  │ 카드 A                           │   │
│  │ 진행률: [50%]                    │   │
│  │ 현재 상태: [입력란]              │   │
│  │ 예상 완료일: [날짜 선택]         │   │
│  │ 이슈사항: [입력란]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ 이슈사항                            │
│  ┌─────────────────────────────────┐   │
│  │ [이슈 추가 버튼]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📝 추가 메모                           │
│  ┌─────────────────────────────────┐   │
│  │ [텍스트 영역]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [임시 저장] [제출하기]                 │
└─────────────────────────────────────────┘
```

#### 1.2 기능
- 완료된 카드 자동 수집 (완료 리스트에서)
- 진행 중인 카드 선택 및 진행상황 입력
- 이슈사항 추가/수정/삭제
- 임시 저장 (draft 상태)
- 제출하기 (submitted 상태)

### 2. 통합 보고서 페이지 (부장용)

#### 2.1 레이아웃
```
┌─────────────────────────────────────────┐
│  통합 보고서 생성 (2026-01-15 ~ 2026-01-21)│
├─────────────────────────────────────────┤
│                                         │
│  📊 제출 현황                            │
│  ✅ 김철수 | ✅ 이영희 | ⏳ 박민수      │
│                                         │
│  [통합 보고서 생성] [AI 요약 생성]      │
│                                         │
│  📋 통합 보고서 미리보기                 │
│  ┌─────────────────────────────────┐   │
│  │ [AI 생성 요약 내용]              │   │
│  │                                  │   │
│  │ 완료된 작업: ...                 │   │
│  │ 진행 중인 작업: ...               │   │
│  │ 이슈사항: ...                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [수정] [최종 확정] [이메일 전송]      │
└─────────────────────────────────────────┘
```

#### 2.2 기능
- 팀원별 제출 현황 확인
- 미제출자 알림
- AI 기반 통합 보고서 자동 생성
- 보고서 수정 및 코멘트 추가
- 최종 확정 및 전송

### 3. 보고서 아카이브 페이지

#### 3.1 레이아웃
```
┌─────────────────────────────────────────┐
│  보고서 아카이브                         │
├─────────────────────────────────────────┤
│  [필터: 주간/월간] [검색]               │
│                                         │
│  📄 2026-01-15 ~ 2026-01-21            │
│     [개인 보고서] [통합 보고서]         │
│                                         │
│  📄 2026-01-08 ~ 2026-01-14            │
│     [개인 보고서] [통합 보고서]         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 워크플로우

### 1. 개인 주간보고 작성 워크플로우

```
1. 주간보고 작성 페이지 접근
   ↓
2. 완료된 카드 자동 수집 (완료 리스트에서)
   ↓
3. 진행 중인 카드 선택 및 진행상황 입력
   - 진행률 입력
   - 현재 상태 설명
   - 예상 완료일 설정
   - 이슈사항 기록
   ↓
4. 이슈사항 추가 (필요시)
   ↓
5. 추가 메모 작성 (선택사항)
   ↓
6. 임시 저장 또는 제출
   - 임시 저장: draft 상태로 저장
   - 제출: submitted 상태로 변경, 부장에게 알림
```

### 2. 통합 보고서 생성 워크플로우

```
1. 부장이 통합 보고서 페이지 접근
   ↓
2. 제출 현황 확인
   - 제출 완료된 보고서 목록
   - 미제출자 확인 및 알림
   ↓
3. 통합 보고서 생성
   - 팀원들의 보고서 수집
   - AI 기반 요약 및 분석
   ↓
4. 보고서 검토 및 수정
   - AI 생성 내용 검토
   - 추가 코멘트 작성
   - 수정 (필요시)
   ↓
5. 최종 확정
   - finalized 상태로 변경
   ↓
6. 상급자에게 전송
   - 이메일 전송
   - PDF 다운로드
   - 링크 공유
```

---

## 📝 개발 태스크

### Phase 1: 데이터베이스 및 백엔드 (우선순위: 높음)

- [ ] **Task 1.1**: `weekly_reports` 테이블 생성
  - 마이그레이션 파일 작성
  - RLS 정책 설정
  - 인덱스 추가

- [ ] **Task 1.2**: `weekly_report_cards` 테이블 생성
  - 마이그레이션 파일 작성
  - RLS 정책 설정
  - 인덱스 추가

- [ ] **Task 1.3**: `integrated_reports` 테이블 생성
  - 마이그레이션 파일 작성
  - RLS 정책 설정
  - 인덱스 추가

- [ ] **Task 1.4**: `integrated_report_contributions` 테이블 생성
  - 마이그레이션 파일 작성
  - RLS 정책 설정

- [ ] **Task 1.5**: Server Actions 작성
  - `createWeeklyReport()` - 주간보고 생성
  - `updateWeeklyReport()` - 주간보고 수정
  - `submitWeeklyReport()` - 주간보고 제출
  - `getWeeklyReport()` - 주간보고 조회
  - `getWeeklyReportsByBoard()` - 보드별 주간보고 목록
  - `createIntegratedReport()` - 통합 보고서 생성
  - `updateIntegratedReport()` - 통합 보고서 수정
  - `finalizeIntegratedReport()` - 통합 보고서 확정
  - `sendIntegratedReport()` - 통합 보고서 전송

### Phase 2: 주간보고 작성 UI (우선순위: 높음)

- [ ] **Task 2.1**: 주간보고 작성 페이지 컴포넌트
  - `WeeklyReportForm.tsx` 생성
  - 완료된 카드 자동 수집 로직
  - 진행 중인 카드 선택 UI

- [ ] **Task 2.2**: 카드 진행상황 입력 폼
  - `CardProgressForm.tsx` 생성
  - 진행률 슬라이더/입력
  - 현재 상태 텍스트 영역
  - 예상 완료일 날짜 선택기
  - 이슈사항 입력

- [ ] **Task 2.3**: 이슈사항 관리 UI
  - 이슈사항 추가/수정/삭제
  - 이슈사항 목록 표시

- [ ] **Task 2.4**: 주간보고 저장 및 제출
  - 임시 저장 기능
  - 제출 기능
  - 유효성 검사

### Phase 3: 통합 보고서 UI (우선순위: 중간)

- [ ] **Task 3.1**: 통합 보고서 페이지 컴포넌트
  - `IntegratedReportPage.tsx` 생성
  - 제출 현황 대시보드
  - 미제출자 알림

- [ ] **Task 3.2**: AI 통합 보고서 생성
  - Gemini API 연동
  - 보고서 요약 생성
  - 통계 데이터 생성

- [ ] **Task 3.3**: 통합 보고서 편집 UI
  - 보고서 내용 수정
  - 코멘트 추가
  - 최종 확정 기능

- [ ] **Task 3.4**: 보고서 전송 기능
  - 이메일 전송 (Resend)
  - PDF 생성 및 다운로드
  - 링크 공유

### Phase 4: 보고서 아카이브 (우선순위: 낮음)

- [ ] **Task 4.1**: 보고서 아카이브 페이지
  - 과거 보고서 목록
  - 필터링 (주간/월간)
  - 검색 기능

- [ ] **Task 4.2**: 보고서 상세 조회
  - 개인 보고서 상세
  - 통합 보고서 상세

### Phase 5: 알림 및 통합 (우선순위: 중간)

- [ ] **Task 5.1**: 주간보고 알림
  - 주간보고 작성 알림 (매주 월요일)
  - 제출 마감일 알림
  - 미제출자 알림 (부장에게)

- [ ] **Task 5.2**: 통합 보고서 알림
  - 통합 보고서 생성 알림 (팀원에게)
  - 보고서 확정 알림 (상급자에게)

- [ ] **Task 5.3**: 보드 페이지 통합
  - 보드 헤더에 "주간보고" 메뉴 추가
  - 주간보고 작성 바로가기

---

## 🚀 구현 우선순위

### MVP (Minimum Viable Product)
1. ✅ 데이터베이스 스키마 생성
2. ✅ 주간보고 작성 기능 (개인)
3. ✅ 통합 보고서 생성 기능 (부장)
4. ✅ 기본 알림 시스템

### Phase 2
1. AI 기반 요약 기능
2. 보고서 아카이브
3. 이메일/PDF 전송

### Phase 3
1. 엑셀 연동 (선택사항)
2. 고급 통계 및 차트
3. 보고서 템플릿

---

## 💡 추가 고려사항

### 1. 엑셀 연동
- **옵션 1**: 엑셀 내보내기 기능
  - 주간보고를 엑셀 형식으로 다운로드
  - 기존 엑셀 시트와 호환되는 형식

- **옵션 2**: 엑셀 임포트 기능
  - 기존 엑셀 시트 데이터 임포트
  - 마이그레이션 지원

- **옵션 3**: Google Sheets 연동
  - Google Sheets API 사용
  - 실시간 동기화

### 2. 권한 관리
- 주간보고 작성 권한: 보드 멤버
- 통합 보고서 생성 권한: 보드 소유자 또는 관리자
- 보고서 조회 권한: 보드 멤버

### 3. 데이터 보안
- RLS 정책으로 데이터 접근 제어
- 개인 보고서는 작성자와 부장만 조회 가능
- 통합 보고서는 보드 멤버 모두 조회 가능

---

## 📅 예상 일정

- **Phase 1 (DB & Backend)**: 2-3일
- **Phase 2 (주간보고 작성 UI)**: 3-4일
- **Phase 3 (통합 보고서 UI)**: 3-4일
- **Phase 4 (아카이브)**: 1-2일
- **Phase 5 (알림 및 통합)**: 1-2일

**총 예상 기간**: 10-15일

---

## ✅ 체크리스트

### 개발 전
- [ ] 요구사항 검토 및 승인
- [ ] 데이터베이스 스키마 최종 검토
- [ ] UI/UX 디자인 확정

### 개발 중
- [ ] 각 Phase별 코드 리뷰
- [ ] 테스트 케이스 작성
- [ ] 문서화

### 개발 후
- [ ] 통합 테스트
- [ ] 사용자 테스트
- [ ] 배포 및 모니터링
