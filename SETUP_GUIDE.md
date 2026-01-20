# Plank 설정 가이드

## 🔑 환경 변수 (.env.local)

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요.

```env
# ============================================
# 1. Supabase (필수)
# ============================================
# Supabase 프로젝트 설정에서 확인
# https://app.supabase.com/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# 2. Google Gemini API (AI 보고서 - 선택)
# ============================================
# 발급: https://makersuite.google.com/app/apikey
# 무료 사용 가능!
GEMINI_API_KEY=AIzaSy...

# ============================================
# 3. Resend (이메일 발송 - 선택)
# ============================================
# 가입: https://resend.com
# 무료: 월 100건
RESEND_API_KEY=re_...

# (선택) 발신자 이메일 - 기본값: onboarding@resend.dev
EMAIL_FROM=Plank <noreply@yourdomain.com>
```

---

## 📦 Supabase 마이그레이션

### 실행해야 할 SQL 파일들

`supabase/migrations/` 폴더의 SQL 파일들을 **순서대로** 실행하세요.

| 순서 | 파일명 | 설명 |
|-----|--------|------|
| 1 | 001_create_profiles.sql | 사용자 프로필 테이블 |
| 2 | 002_create_boards.sql | 보드 테이블 |
| 3 | 003_create_lists.sql | 리스트 테이블 |
| 4 | 004_create_cards.sql | 카드 테이블 |
| 5 | 005_create_comments.sql | 댓글 테이블 |
| 6 | 006_create_checklists.sql | 체크리스트 테이블 |
| ... | ... | ... |
| 15 | 015_add_notifications.sql | 알림 테이블 |
| 16 | 016_fix_board_owners_membership.sql | 보드 소유자 멤버십 |
| **18** | **018_add_completion_feature.sql** | **완료 기능** |
| **19** | **019_fix_completion_foreign_keys.sql** | **FK 수정 (중요!)** |

### ⚠️ 018번 마이그레이션 (완료 기능)

완료 기능이 작동하려면 반드시 실행해야 합니다:

```sql
-- 리스트에 완료 리스트 속성 추가
ALTER TABLE lists ADD COLUMN IF NOT EXISTS is_done_list BOOLEAN DEFAULT false;

-- 카드에 완료 상태 추가
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES profiles(id);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cards_completed ON cards(is_completed);
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at);

-- 보고서 테이블
CREATE TABLE IF NOT EXISTS reports (...);

-- 이메일 로그 테이블
CREATE TABLE IF NOT EXISTS email_logs (...);
```

---

## 🔗 API 키 발급 방법

### 1. Google Gemini API (무료)

1. https://makersuite.google.com/app/apikey 접속
2. Google 계정 로그인
3. **"Create API Key"** 클릭
4. 키 복사 → `.env.local`의 `GEMINI_API_KEY`에 붙여넣기

### 2. Resend (무료 월 100건)

1. https://resend.com 접속
2. 회원가입 (GitHub/Google 가능)
3. Dashboard → **API Keys** → **"Create API Key"**
4. 키 복사 → `.env.local`의 `RESEND_API_KEY`에 붙여넣기

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

---

## ❓ 문제 해결

### 완료된 작업 페이지가 안 보여요
→ `018_add_completion_feature.sql` 마이그레이션을 실행했는지 확인

### AI 보고서 생성이 안 돼요
→ `GEMINI_API_KEY` 환경 변수 확인

### 이메일 발송이 안 돼요
→ `RESEND_API_KEY` 환경 변수 확인

### 로그인이 안 돼요
→ Supabase Authentication 설정 확인
→ Redirect URL에 `http://localhost:3000/auth/callback` 추가

---

*Last Updated: 2026-01-20*
