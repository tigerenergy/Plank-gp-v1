# 🚀 마이그레이션 빠른 시작 가이드

## 가장 간단한 방법 (Supabase CLI)

### 1단계: CLI 설치
```bash
npm install -g supabase
```

### 2단계: 로그인
```bash
supabase login
```

### 3단계: 프로젝트 연결
```bash
# Supabase Dashboard에서 프로젝트 REF 찾기
# Settings → General → Reference ID
supabase link --project-ref YOUR_PROJECT_REF
```

### 4단계: 마이그레이션 실행
```bash
npm run migrate
```

또는

```bash
supabase db push
```

---

## 대안: 수동 실행 (현재 방법)

Supabase Dashboard → SQL Editor에서 직접 실행:

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. SQL Editor 클릭
4. `supabase/migrations/027_add_weekly_report_templates.sql` 파일 내용 복사
5. 붙여넣기 후 Run 클릭
6. `supabase/migrations/028_optimize_weekly_reports_for_search_and_stats.sql` 반복

---

## 자동화 옵션

### 옵션 1: GitHub Actions (CI/CD)
- `.github/workflows/migrate.yml` 파일 사용
- main 브랜치에 푸시 시 자동 실행

### 옵션 2: Vercel Post-Deploy Hook
- `app/api/migrate/route.ts` 엔드포인트 사용
- 배포 후 자동 실행

### 옵션 3: 로컬 스크립트
- `scripts/run-migration-supabase-cli.js` 실행
- 수동으로 언제든지 실행 가능

---

## 추천 워크플로우

1. **개발 중**: `npm run migrate` (로컬에서 CLI 사용)
2. **배포 시**: GitHub Actions 자동 실행
3. **긴급 상황**: Supabase Dashboard에서 수동 실행

---

## 도움말

자세한 내용은 `scripts/setup-supabase-cli.md`를 참고하세요.
