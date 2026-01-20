# 🚀 Plank 신규 기능 로드맵

> **목표**: 완료 처리 → 보고서 생성 → 이메일 발송 자동화 파이프라인 구축

---

## 📋 전체 진행 상황

| Week | 기능 | 상태 | 진행률 |
|------|-----|------|-------|
| 1 | 완료 리스트 + 완료 처리 | ✅ 완료 | 100% |
| 2 | 완료 페이지 + 통계 | ✅ 완료 | 100% |
| 3 | AI 보고서 생성 | 🔄 진행 중 | 0% |
| 4 | 이메일 발송 | ⏳ 대기 | 0% |

---

## ✅ Week 1: 완료 리스트 + 완료 처리 (완료!)

- [x] DB 마이그레이션 파일 생성 (`018_add_completion_feature.sql`)
- [x] 타입 정의 업데이트 (List: `is_done_list`, Card: `is_completed`, `completed_at`, `completed_by`)
- [x] Server Action 구현 (`toggleDoneList`, `completeCard`, `uncompleteCard`)
- [x] 리스트 메뉴에 "완료 리스트 지정" 토글 추가
- [x] 카드에 "🎉 완료 처리" 버튼 추가 (완료 리스트에서만)
- [x] 완료된 카드 시각적 표시 (✅ + 취소선 + 반투명 + 완료시간)
- [x] 완료 취소 기능
- [x] 완료 알림 (모든 멤버에게)
- [x] ✅ Supabase 마이그레이션 실행 완료!

---

## ✅ Week 2: 완료 페이지 + 통계 (완료!)

### 태스크 목록

- [x] `/board/[id]/completed` 페이지 생성
- [x] 완료된 카드 조회 Server Action (`getCompletedCards`, `getCompletionStats`)
- [x] 보드 헤더에 "완료된 작업" 버튼 추가
- [x] 기간 필터 (이번 주 / 이번 달 / 전체)
- [x] 통계 컴포넌트
  - [x] 총 완료 카드 수
  - [x] 이번 주/이번 달 완료
  - [x] 완료율 %
- [x] recharts 설치 및 차트 컴포넌트
  - [x] 주간 완료 추이 Bar 차트
  - [x] 팀원별 완료 현황 Pie 차트
- [x] 완료된 카드 목록 (체크박스 선택 가능)
- [x] CSV 다운로드 기능

---

## ⏳ Week 3: AI 보고서 생성

### 태스크 목록

- [ ] Google Gemini API 연동
  - [ ] `@google/generative-ai` 패키지 설치
  - [ ] 환경 변수 설정 (`GEMINI_API_KEY`)
  - [ ] `lib/gemini.ts` 구현
- [ ] 보고서 생성 Server Action
- [ ] 보고서 저장/조회 기능
- [ ] 보고서 UI
  - [ ] 마크다운 미리보기
  - [ ] 마크다운 다운로드
  - [ ] PDF 다운로드 (옵션)
- [ ] 보고서 템플릿 선택 (주간/월간)

---

## ⏳ Week 4: 이메일 발송

### 태스크 목록

- [ ] Resend API 연동
  - [ ] `resend` 패키지 설치
  - [ ] 환경 변수 설정 (`RESEND_API_KEY`)
  - [ ] `lib/email.ts` 구현
- [ ] 이메일 발송 Server Action
- [ ] 이메일 발송 UI
  - [ ] 수신자 입력 (멀티)
  - [ ] 제목 입력
  - [ ] 보고서 미리보기
- [ ] 발송 기록 저장/조회
- [ ] 이메일 템플릿 (HTML)

---

## 1️⃣ 완료 리스트 수동 완료 처리

### 개요
- 카드가 "완료" 리스트로 이동해도 **자동 완료 아님**
- 사용자가 직접 **"완료 처리" 버튼**을 눌러야 완료 확정
- 실수로 옮겨도 안전! (되돌리기 가능)
- 완료된 카드는 시각적으로 구분 (체크 아이콘, 반투명)

### 플로우

```
1. 카드를 "완료" 리스트로 드래그
2. 카드에 "🎉 완료 처리" 버튼 표시 (완료 리스트에서만 보임)
3. 사용자가 버튼 클릭 → 완료 확정
4. 완료된 카드: ✅ 체크 표시 + 완료 시간 기록 + 반투명
5. 다른 리스트로 다시 이동하면 완료 해제 (선택적)
```

### 구현 방안

#### A. 리스트에 "완료 리스트" 속성 추가
```sql
-- lists 테이블에 컬럼 추가
ALTER TABLE lists ADD COLUMN is_done_list BOOLEAN DEFAULT false;
```

#### B. 카드에 완료 상태 추가
```sql
-- cards 테이블에 컬럼 추가
ALTER TABLE cards ADD COLUMN is_completed BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE cards ADD COLUMN completed_by UUID REFERENCES profiles(id);
```

#### C. 로직 (수동 확인 방식)
1. 카드가 `is_done_list = true`인 리스트로 이동
2. **자동 완료 안 함** - 카드에 "완료 처리" 버튼만 표시
3. 사용자가 버튼 클릭 → `is_completed = true`, `completed_at = now()`, `completed_by = user.id`
4. 완료된 카드를 다른 리스트로 이동하면 → 완료 상태 유지 or 해제 (설정 가능)

### UI 변경

#### 리스트 설정
- 리스트 헤더 메뉴에 "완료 리스트로 지정" 토글 추가
- 완료 리스트는 헤더에 ✅ 아이콘 표시

#### 카드 UI
```
┌─────────────────────────────┐
│ [완료 전] 완료 리스트의 카드 │
│                             │
│  카드 제목                   │
│  설명...                    │
│  D-1  👤                    │
│                             │
│  [🎉 완료 처리] ← 버튼      │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [완료 후] 반투명 + 체크      │
│                             │
│  ✅ 카드 제목                │
│  설명...                    │
│  완료: 2026-01-20 15:30     │
│  by 김기운                   │
└─────────────────────────────┘
```

### 추가 기능 (옵션)
- 완료 취소 기능 (실수로 완료 처리한 경우)
- 완료된 카드 숨기기 토글
- 완료 알림 (모든 멤버에게)

---

## 2️⃣ 통계 대시보드

### 개요
- 보드별/기간별 완료 현황 시각화
- 팀원별 기여도 (보고자 없는 철학이지만, 본인 확인용)
- 마감일 준수율

### 필요한 데이터

```sql
-- 완료된 카드 통계 뷰
CREATE VIEW card_statistics AS
SELECT 
  b.id as board_id,
  b.title as board_title,
  COUNT(c.id) as total_cards,
  COUNT(CASE WHEN c.is_completed THEN 1 END) as completed_cards,
  COUNT(CASE WHEN c.due_date < NOW() AND NOT c.is_completed THEN 1 END) as overdue_cards,
  DATE_TRUNC('week', c.completed_at) as week
FROM boards b
LEFT JOIN lists l ON l.board_id = b.id
LEFT JOIN cards c ON c.list_id = l.id
GROUP BY b.id, b.title, DATE_TRUNC('week', c.completed_at);
```

### UI 컴포넌트
- 📊 완료율 Progress Bar
- 📈 주간/월간 완료 추이 차트 (recharts 라이브러리)
- 👥 팀원별 완료 카드 수 (익명 옵션)

### 필요한 라이브러리
```bash
npm install recharts
```

---

## 2.5️⃣ 완료 페이지 (NEW!)

### 개요
- 완료된 카드들만 모아서 볼 수 있는 별도 페이지
- 통계 대시보드 + 보고서 생성 + 이메일 발송을 한 곳에서
- 경로: `/board/[id]/completed`

### 페이지 구성

```
┌─────────────────────────────────────────────────────────┐
│  < 보드명              완료된 작업들                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 통계 섹션                                           │
│  - 총 완료 카드 수                                      │
│  - 이번 주 완료                                         │
│  - 팀원별 완료 현황                                     │
│  - 완료 추이 차트                                       │
│                                                         │
│  📅 기간 필터: [이번 주] [이번 달] [전체] [커스텀]      │
│                                                         │
│  📋 완료된 카드 목록                                    │
│  - 카드 제목, 완료 시간, 완료자                         │
│  - 체크박스로 보고서에 포함할 항목 선택                 │
│                                                         │
│  🔧 액션 버튼                                           │
│  [📄 보고서 생성]  [📧 이메일 발송]  [📥 CSV 다운로드] │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 라우팅

```
/board/[id]              → 칸반 보드
/board/[id]/completed    → 완료 페이지 (NEW!)
```

### 네비게이션
- 보드 헤더에 "완료된 작업" 버튼 추가
- 또는 사용자 메뉴 드롭다운에 추가

---

## 3️⃣ AI 보고서 생성

### 개요
- 완료된 카드들을 AI가 자동으로 보고서 형태로 정리
- 주간/월간 보고서 템플릿
- PDF/마크다운 다운로드

### AI 엔진 선택

| 옵션 | 장점 | 단점 |
|-----|------|------|
| **Google Gemini** ⭐ | NotebookLM과 같은 엔진, 무료 티어 넉넉 | 한국어 품질 보통 |
| OpenAI GPT-4 | 품질 최고 | 비용 발생 |
| Claude | 긴 문서 처리 우수 | API 비용 |

### 추천: Google Gemini API (NotebookLM 엔진)

> 💡 **NotebookLM은 공식 API가 없음!**  
> 대신 같은 AI 엔진인 **Gemini API** 사용

#### 설치
```bash
npm install @google/generative-ai
```

#### 환경 변수
```env
GEMINI_API_KEY=AIzaSy...
```

#### 구현
```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateReport(cards: CompletedCard[], period: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    당신은 프로젝트 매니저입니다. 다음은 ${period} 완료된 작업 목록입니다:
    
    ${cards.map(c => `
    - 제목: ${c.title}
      설명: ${c.description || '없음'}
      완료일: ${c.completed_at}
      담당자: ${c.completed_by_name}
    `).join('\n')}
    
    위 내용을 바탕으로 전문적인 주간 보고서를 작성해주세요.
    
    형식:
    1. 요약 (3줄 이내)
    2. 주요 완료 항목
    3. 특이사항/이슈
    4. 다음 주 계획 (선택적)
    
    마크다운 형식으로 작성해주세요.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### 대안: OpenAI API

```bash
npm install openai
```

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateReport(cards: CompletedCard[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ 
      role: 'user', 
      content: `주간 보고서를 작성해주세요: ${JSON.stringify(cards)}` 
    }],
  });

  return response.choices[0].message.content;
}
```

### Supabase 스키마

```sql
-- 보고서 저장 테이블
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  report_type VARCHAR(50) DEFAULT 'weekly', -- weekly, monthly, custom
  period_start DATE,
  period_end DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "보드 멤버만 보고서 조회"
  ON reports FOR SELECT
  USING (
    board_id IN (
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
    OR
    board_id IN (
      SELECT id FROM boards WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "보드 멤버만 보고서 생성"
  ON reports FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
    OR
    board_id IN (
      SELECT id FROM boards WHERE created_by = auth.uid()
    )
  );
```

---

## 4️⃣ 이메일 발송

### 개요
- 생성된 보고서를 이메일로 전송
- 팀원/외부인에게 공유 가능
- 정기 발송 예약 (선택)

### MCP 연동: Resend (추천)

#### 설치
```bash
npm install resend
```

#### 환경 변수
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### 구현
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail(input: {
  to: string[];
  subject: string;
  reportHtml: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'Plank <noreply@plank.app>',
    to: input.to,
    subject: input.subject,
    html: input.reportHtml,
  });

  return { data, error };
}
```

### Supabase 스키마

```sql
-- 이메일 발송 기록
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  recipients TEXT[] NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent', -- sent, failed, pending
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id)
);

-- RLS 정책
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 발송 기록만 조회"
  ON email_logs FOR SELECT
  USING (sent_by = auth.uid());
```

---

## 🗂️ Supabase 마이그레이션 요약

### 새로운 마이그레이션 파일: `018_add_completion_reports.sql`

```sql
-- =============================================
-- 1. 리스트에 완료 리스트 속성 추가
-- =============================================
ALTER TABLE lists ADD COLUMN IF NOT EXISTS is_done_list BOOLEAN DEFAULT false;

-- =============================================
-- 2. 카드에 완료 상태 추가
-- =============================================
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES profiles(id);

-- 인덱스 추가 (통계 쿼리 성능)
CREATE INDEX IF NOT EXISTS idx_cards_completed ON cards(is_completed);
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_cards_completed_by ON cards(completed_by);

-- =============================================
-- 3. 보고서 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  report_type VARCHAR(50) DEFAULT 'weekly',
  period_start DATE,
  period_end DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (
    board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
    OR board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (
    board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
    OR board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

CREATE POLICY "reports_delete" ON reports FOR DELETE
  USING (created_by = auth.uid());

-- =============================================
-- 4. 이메일 발송 기록
-- =============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  recipients TEXT[] NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id)
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_select" ON email_logs FOR SELECT
  USING (sent_by = auth.uid());

CREATE POLICY "email_logs_insert" ON email_logs FOR INSERT
  WITH CHECK (sent_by = auth.uid());
```

---

## 📦 필요한 패키지

```bash
# 차트 라이브러리 (통계 대시보드)
npm install recharts

# AI 보고서 - Google Gemini (추천, NotebookLM 엔진)
npm install @google/generative-ai

# AI 보고서 - OpenAI (대안)
npm install openai

# 이메일 발송
npm install resend

# PDF 생성 (옵션)
npm install @react-pdf/renderer

# CSV 다운로드 (옵션)
npm install papaparse
```

## 🔑 환경 변수

```env
# Google Gemini API (NotebookLM과 같은 엔진)
GEMINI_API_KEY=AIzaSy...

# 또는 OpenAI
OPENAI_API_KEY=sk-...

# 이메일 발송
RESEND_API_KEY=re_...
```

---

## 🎯 구현 순서 (권장)

```
Week 1: 완료 리스트 기능 + DB ✅ 완료
├── ✅ DB 마이그레이션 (lists, cards 테이블)
├── ✅ 리스트 설정 UI ("완료 리스트 지정" 토글)
├── ✅ 카드에 "완료 처리" 버튼 (수동 확인)
└── ✅ 완료 카드 시각적 표시 (✅ + 반투명)

Week 2: 완료 페이지 + 통계 ✅ 완료
├── ✅ /board/[id]/completed 페이지 생성
├── ✅ 완료된 카드 목록 조회
├── ✅ recharts 설치 및 차트 컴포넌트
├── ✅ 기간 필터 (이번 주/이번 달/전체)
└── ✅ 팀원별 완료 현황

Week 3: AI 보고서 (Google Gemini) ✅ 완료
├── ✅ @google/generative-ai 패키지 설치
├── ✅ lib/gemini.ts (Gemini API 클라이언트)
├── ✅ app/actions/report.ts (보고서 CRUD)
├── ✅ 보고서 생성 UI (모달)
└── ✅ 마크다운 미리보기 (react-markdown) + 다운로드

Week 4: 이메일 발송 ✅ 완료
├── ✅ Resend 패키지 설치 + lib/email.ts
├── ✅ 이메일 템플릿 (마크다운→HTML 변환)
├── ✅ app/actions/email.ts (발송 + 로그 조회)
├── ✅ 이메일 발송 모달 UI
└── ✅ 발송 기록 조회 표시
```

---

## 💰 수익화 포인트

| 기능 | 무료 | Pro |
|-----|-----|-----|
| 완료 리스트 | ✅ | ✅ |
| 기본 통계 | ✅ | ✅ |
| 상세 통계/차트 | ❌ | ✅ |
| AI 보고서 (월 5회) | ❌ | ✅ |
| AI 보고서 (무제한) | ❌ | ✅✅ |
| 이메일 발송 | ❌ | ✅ |

---

*Last Updated: 2026-01-20*
