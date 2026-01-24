# 로컬 Supabase CLI 설정 가이드

프로젝트에 Supabase CLI를 설치하여 사용하는 방법입니다.

## 1. 의존성 설치

```bash
npm install
```

이제 `supabase`가 `node_modules`에 설치됩니다.

## 2. Supabase 로그인

```bash
npm run migrate:login
```

또는

```bash
npx supabase login
```

브라우저가 열리고 Supabase 계정으로 로그인합니다.

## 3. 프로젝트 연결

### 프로젝트 REF 찾기
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. Settings → General
4. Reference ID 복사 (예: `abcdefghijklmnop`)

### 프로젝트 연결
```bash
npm run migrate:link
```

또는 직접 REF 지정:
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

## 4. 마이그레이션 실행

### 모든 마이그레이션 실행
```bash
npm run migrate
```

### 마이그레이션 상태 확인
```bash
npm run migrate:status
```

### 새 마이그레이션 파일 생성
```bash
npm run migrate:new migration_name
```

## 5. 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run migrate` | 모든 마이그레이션 실행 |
| `npm run migrate:status` | 마이그레이션 상태 확인 |
| `npm run migrate:new` | 새 마이그레이션 파일 생성 |
| `npm run migrate:link` | 프로젝트 연결 |
| `npm run migrate:login` | Supabase 로그인 |

## 6. 빠른 시작

```bash
# 1. 의존성 설치 (Supabase CLI 포함)
npm install

# 2. 로그인
npm run migrate:login

# 3. 프로젝트 연결
npm run migrate:link
# 또는
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. 마이그레이션 실행
npm run migrate
```

## 7. 문제 해결

### "command not found: supabase"
→ `npm install`을 실행하여 의존성을 설치하세요.

### "not logged in"
→ `npm run migrate:login` 실행

### "project not linked"
→ `npm run migrate:link` 실행 또는 `npx supabase link --project-ref YOUR_PROJECT_REF`

### "migration failed"
→ Supabase Dashboard의 SQL Editor에서 직접 실행해보세요.

## 8. 장점

- ✅ 전역 설치 불필요
- ✅ 프로젝트별 버전 관리
- ✅ 팀원 모두 동일한 CLI 버전 사용
- ✅ CI/CD에서도 동일한 방식 사용 가능
