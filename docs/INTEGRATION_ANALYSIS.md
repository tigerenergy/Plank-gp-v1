# 🔄 주간보고 기능 통합 분석 및 기획

> **작성일**: 2026-01-21  
> **목적**: 현재 구현된 기능과 새로운 주간보고 기능의 통합 방안 수립

---

## 📊 현재 구현된 기능 vs 새로운 주간보고 기능

### 1. 보고서 시스템 비교

| 구분 | 현재 구현 (`reports` 테이블) | 새로운 기능 (`weekly_reports` 테이블) |
|------|------------------------------|--------------------------------------|
| **목적** | AI 기반 종합 보고서 생성 | 개인별 주간보고 작성 및 공유 |
| **데이터 소스** | 완료된 카드만 포함 | 완료된 카드 + 진행 중인 카드 |
| **생성 방식** | AI 자동 생성 (Gemini) | 사용자 직접 작성 |
| **저장 방식** | 보드별, 기간별 | 보드별, 사용자별, 주간별 |
| **작성자** | 생성한 사람 | 각 팀원 개인 |
| **상태 관리** | 없음 | draft, submitted |
| **시간 추적** | 없음 | Jira 스타일 시간 추적 |
| **실시간 업데이트** | 없음 | Supabase Realtime |

### 2. 데이터베이스 스키마 비교

#### 기존 `reports` 테이블
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  title VARCHAR(255),
  content TEXT,              -- AI 생성 텍스트
  report_type VARCHAR(50),    -- weekly, monthly 등
  period_start DATE,
  period_end DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ
);
```

#### 새로운 `weekly_reports` 테이블
```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  user_id UUID REFERENCES profiles(id),  -- 개인별
  week_start_date DATE,
  week_end_date DATE,
  status VARCHAR(50) DEFAULT 'draft',    -- draft, submitted
  completed_cards JSONB,                  -- 완료된 카드
  in_progress_cards JSONB,                -- 진행 중인 카드
  total_hours DECIMAL(8,2),              -- 작업 시간
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(board_id, user_id, week_start_date)
);
```

### 3. 기능 충돌 지점 분석

#### ✅ 충돌 없음 (독립적 기능)
- `reports`: AI 기반 종합 보고서 (보드 전체, 기간별)
- `weekly_reports`: 개인별 주간보고 (사용자별, 주간별)
- 두 기능은 서로 다른 목적과 사용 시나리오

#### ⚠️ 통합 필요 영역
1. **완료된 카드 데이터 활용**
   - 현재: `getCompletedCards()` 함수로 완료된 카드 조회
   - 새로운 기능: 동일한 함수를 활용하여 완료된 카드 자동 수집
   - **통합 방안**: 기존 함수 재사용 ✅

2. **보고서 생성 워크플로우**
   - 현재: AI 보고서는 수동 생성 (버튼 클릭)
   - 새로운 기능: 주간보고는 주간별 자동 생성 가능
   - **통합 방안**: 두 기능을 별도로 유지하되, 통합 보고서에서 연계 가능

3. **완료된 작업 페이지**
   - 현재: `/board/[id]/completed` 페이지 존재
   - 새로운 기능: 주간보고 작성 시 완료된 카드 자동 수집
   - **통합 방안**: 기존 완료된 작업 페이지와 주간보고 페이지를 연계

---

## 🔗 통합 방안

### 방안 1: 독립적 운영 (권장) ⭐

**장점**:
- 기존 기능에 영향 없음
- 각 기능의 목적이 명확함
- 개발 및 유지보수 용이

**구조**:
```
reports (AI 보고서)
  └─ 보드 전체, 기간별, AI 생성
  └─ 완료된 카드 기반

weekly_reports (개인 주간보고)
  └─ 사용자별, 주간별, 직접 작성
  └─ 완료된 카드 + 진행 중인 카드
  └─ 작업 시간 추적
```

**통합 보고서 생성 시**:
- `weekly_reports` 데이터를 수집
- AI 보고서(`reports`) 생성 시 `weekly_reports` 데이터 참조 가능
- 두 시스템이 독립적이지만 상호 보완적

### 방안 2: 통합 테이블 (비권장)

**단점**:
- 기존 `reports` 테이블 수정 필요
- 복잡한 스키마 설계
- 기존 데이터 마이그레이션 필요
- 두 가지 다른 목적이 섞임

---

## 🎯 기존 기능 활용 방안

### 1. 완료된 카드 조회 기능 재사용 ✅

**현재 구현**:
```typescript
// app/actions/completed.ts
export async function getCompletedCards(
  boardId: string,
  period: PeriodFilter
): Promise<ActionResult<CompletedCard[]>>
```

**주간보고에서 활용**:
- 주간보고 작성 시 `getCompletedCards(boardId, 'week')` 호출
- 해당 주간 완료된 카드 자동 수집
- 기존 로직 재사용으로 개발 시간 단축

**진행 중인 카드 자동 포함**:
- `getBoardData(boardId)` 또는 보드의 모든 카드 조회
- `is_completed = false`인 모든 카드를 자동으로 포함
- 사용자는 각 카드의 진행상황만 입력하면 됨
- 언젠가는 완료될 것이므로 모든 작업 중인 카드를 포함하는 것이 합리적

**보드의 모든 활동 자동 수집** ⭐ **핵심 가치 제안**:
- **핵심 개념**: 주간보고 작성 버튼을 누르면 그 주에 보드에서 실제로 작업한 모든 내용이 자동으로 수집됨
- 그 주에 실제로 작업한 내용을 자동으로 수집하여 주간보고 생성
- 수동 입력 최소화: 실제 작업한 내용이 그대로 주간보고에 반영
- **자동 수집되는 데이터** (보드의 모든 활동):
  - **모든 리스트의 모든 카드**: 할일, 진행중, 검토요청, 완료 리스트의 모든 카드
    - 그 주에 생성/수정/삭제/이동된 모든 카드 활동
    - 카드가 무한히 생성/삭제/처리될 수 있으므로 모든 변화를 자동으로 추적
  - 완료된 카드 (해당 주간 completed_at 기준, 완료 리스트에서)
  - 진행 중인 카드 (할일, 진행중, 검토요청 리스트의 모든 카드)
  - 카드 생성/수정/삭제/이동 이력 (해당 주간 모든 변화)
  - 체크리스트 진행 상황 (해당 주간 추가/완료된 항목)
  - 댓글 작성 내역 (해당 주간 created_at 기준)
  - 작업 시간 로그 (시간 추적 기능 사용 시)
- 사용자는 자동 수집된 내용을 확인하고 보완 입력만 하면 됨

### 2. 완료된 작업 페이지 연계 ✅

**현재 구현**:
- `/board/[id]/completed` 페이지
- 주간/월간/전체 필터링
- 완료된 작업 통계

**주간보고와 연계**:
- 완료된 작업 페이지에서 "주간보고 작성" 버튼 추가
- 주간보고 작성 시 해당 페이지의 완료된 카드 데이터 활용
- 두 페이지 간 자연스러운 워크플로우

### 3. AI 보고서 기능 확장 (선택사항)

**현재 구현**:
- `reports` 테이블에 AI 생성 보고서 저장
- 완료된 카드 기반 보고서

**확장 가능성**:
- 통합 보고서 생성 시 `weekly_reports` 데이터도 참조
- AI 보고서에 진행 중인 작업 정보도 포함 가능
- 두 시스템의 데이터를 결합한 고급 보고서 생성

---

## 🚀 추가 기능 제안

### 1. 작업 시간 추적 시스템 (카드 레벨) ⭐ **핵심 기능**

**목적**: Jira 스타일의 시간 추적

**구현 방안**:
```sql
-- cards 테이블에 시간 추적 필드 추가 (선택사항)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tracked_hours DECIMAL(5,2);

-- 또는 별도 테이블 생성 (더 유연함)
CREATE TABLE card_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hours_spent DECIMAL(5,2) NOT NULL,
  logged_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(card_id, user_id, logged_date)
);
```

**기능**:
- 카드별 작업 시간 기록 (타이머 또는 수동 입력)
- 주간보고 시 자동 집계
- 시간 추적 히스토리 관리
- 작업 효율성 분석

### 2. 주간보고 템플릿 시스템

**목적**: 반복적인 보고서 작성 시간 단축

**기능**:
- 주간보고 템플릿 생성/저장
- 템플릿 기반 빠른 작성
- 개인별/팀별 템플릿 관리

### 3. 주간보고 알림 시스템

**목적**: 주간보고 작성 촉진

**기능**:
- 매주 월요일 주간보고 작성 알림
- 제출 마감일 알림
- 미제출자 리마인더
- 실시간 알림 (Supabase Realtime)

### 4. 주간보고 통계 대시보드

**목적**: 장기적인 성과 추적

**기능**:
- 주간별 작업 시간 추이
- 완료율 추이
- 이슈 발생 빈도 분석
- 팀원별 성과 비교 (선택사항)

### 5. 주간보고 비교 기능

**목적**: 주간별 진행상황 비교 분석

**기능**:
- 이전 주간보고와 비교
- 진행 중인 작업의 진척도 추이
- 이슈 해결 현황 추적

### 6. 주간보고 내보내기 기능

**목적**: 외부 공유 및 보관

**기능**:
- PDF 다운로드
- CSV/엑셀 형식 다운로드
- 이메일 전송 (선택사항)
- 링크 공유

### 7. 주간보고 댓글/피드백 시스템

**목적**: 팀원 간 피드백 교환

**기능**:
- 주간보고에 댓글 작성
- 피드백 및 조언
- 실시간 댓글 표시

### 8. 주간보고 검색 기능

**목적**: 과거 보고서 빠른 조회

**기능**:
- 키워드 검색
- 기간별 필터링
- 카드별 검색
- 이슈 키워드 검색

---

## 📋 개발 우선순위 (통합 고려)

### Phase 1: 핵심 기능 (MVP)
1. ✅ `weekly_reports` 테이블 생성
2. ✅ `weekly_report_cards` 테이블 생성
3. ✅ 주간보고 작성 기능 (기존 `getCompletedCards` 활용)
4. ✅ 주간보고 공유 페이지 (실시간 업데이트)
5. ✅ 작업 시간 추적 (주간보고 레벨)

### Phase 2: 시간 추적 강화
1. 카드 레벨 시간 추적 (`card_time_logs` 테이블)
2. 타이머 UI 구현
3. 시간 자동 집계

### Phase 3: 통합 및 확장
1. 완료된 작업 페이지와 주간보고 연계
2. AI 보고서에 주간보고 데이터 참조
3. 주간보고 통계 대시보드

### Phase 4: 편의 기능
1. 주간보고 템플릿
2. 주간보고 알림
3. 주간보고 내보내기
4. 주간보고 검색

---

## ⚠️ 주의사항

### 1. 기존 기능 보존
- `reports` 테이블과 관련 기능은 그대로 유지
- 기존 AI 보고서 생성 기능에 영향 없음
- 완료된 작업 페이지 기능 유지

### 2. 데이터 일관성
- `weekly_reports`의 `completed_cards`는 `getCompletedCards()` 결과와 일치해야 함
- 주간보고 작성 시점의 완료된 카드 스냅샷 저장

### 3. 권한 관리
- 기존 RLS 정책 유지
- `weekly_reports`에 대한 새로운 RLS 정책 추가
- 보드 멤버만 조회 가능, 작성자만 수정 가능

### 4. 성능 고려
- 주간보고 데이터가 누적되므로 인덱스 설계 중요
- 통계 쿼리 최적화
- 실시간 업데이트 구독 최적화

---

## ✅ 결론

1. **독립적 운영 권장**: `reports`와 `weekly_reports`는 별도로 운영하되 상호 보완
2. **기존 기능 재사용**: `getCompletedCards()` 등 기존 함수 활용
3. **점진적 확장**: MVP부터 시작하여 단계적으로 기능 추가
4. **데이터 영구 보존**: 모든 주간보고 데이터 영구 보관
5. **실시간 협업**: Supabase Realtime으로 실시간 업데이트

이 통합 방안을 통해 기존 기능에 영향을 주지 않으면서 새로운 주간보고 기능을 안전하게 추가할 수 있습니다.
