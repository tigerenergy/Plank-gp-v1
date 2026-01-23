# Vercel 환경 변수를 .env.local로 복사하는 방법

## 1. Vercel에서 환경 변수 확인

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 (Plank-gp-v1)
3. **Settings** 탭 클릭
4. 좌측 메뉴에서 **Environment Variables** 클릭
5. 모든 환경 변수 확인

## 2. .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 만들고 Vercel의 환경 변수를 복사:

```env
# Vercel에서 복사한 값들
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 마이그레이션 실행을 위해 추가 필요
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 기타 환경 변수들 (Vercel에 있다면)
GEMINI_API_KEY=...
RESEND_API_KEY=...
```

## 3. SUPABASE_SERVICE_ROLE_KEY 추가

Vercel에 `SUPABASE_SERVICE_ROLE_KEY`가 없다면:

1. **Supabase Dashboard** 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. **Settings** > **API** 메뉴
4. **service_role** 키 복사 (⚠️ 매우 민감한 정보!)
5. Vercel에 추가:
   - Vercel > 프로젝트 > Settings > Environment Variables
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (복사한 service_role key)
   - Environment: Production, Preview, Development 모두 선택
   - **Save** 클릭
6. `.env.local`에도 동일하게 추가

## 4. 마이그레이션 실행

`.env.local` 파일이 준비되면:

```bash
node scripts/run-migration-027.js
```

또는 Supabase Dashboard에서 직접 실행:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/027_add_weekly_report_templates.sql` 파일 내용 복사
6. 붙여넣기 후 **Run** 클릭
