# Supabase CLI 설정 가이드

## 1. Supabase CLI 설치

### 방법 A: npm으로 전역 설치
```bash
npm install -g supabase
```

### 방법 B: npx로 실행 (설치 없이)
```bash
npx supabase --version
```

## 2. Supabase 로그인

```bash
supabase login
```

브라우저가 열리고 Supabase 계정으로 로그인합니다.

## 3. 프로젝트 연결

### 프로젝트 REF 찾기
1. Supabase Dashboard 접속
2. 프로젝트 선택
3. Settings → General
4. Reference ID 복사 (예: `abcdefghijklmnop`)

### 프로젝트 연결
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## 4. 마이그레이션 실행

### 모든 마이그레이션 실행
```bash
supabase db push
```

### 특정 마이그레이션만 실행
```bash
supabase migration up --version 027
```

### 마이그레이션 상태 확인
```bash
supabase migration list
```

## 5. package.json 스크립트 추가

`package.json`에 다음을 추가:

```json
{
  "scripts": {
    "migrate": "supabase db push",
    "migrate:status": "supabase migration list",
    "migrate:new": "supabase migration new"
  }
}
```

사용:
```bash
npm run migrate
```

## 6. 문제 해결

### "command not found: supabase"
→ CLI가 설치되지 않았습니다. `npm install -g supabase` 실행

### "not logged in"
→ `supabase login` 실행

### "project not linked"
→ `supabase link --project-ref YOUR_PROJECT_REF` 실행

### "migration failed"
→ Supabase Dashboard의 SQL Editor에서 직접 실행해보세요.

## 7. 자동화

### GitHub Actions
`.github/workflows/migrate.yml` 파일을 사용하세요.

### 로컬 스크립트
`scripts/run-migration-supabase-cli.js` 파일을 사용하세요.

```bash
node scripts/run-migration-supabase-cli.js
```
