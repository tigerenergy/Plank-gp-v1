# SQL 마이그레이션 자동 실행 방법

Supabase 마이그레이션을 자동으로 실행하는 여러 방법을 제공합니다.

## 방법 1: Supabase CLI 사용 (권장) ⭐

가장 안정적이고 공식적인 방법입니다.

### 설치

```bash
npm install -g supabase
```

또는

```bash
npx supabase --version
```

### 설정

1. Supabase 프로젝트에 로그인:
```bash
supabase login
```

2. 프로젝트 연결:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. 마이그레이션 실행:
```bash
supabase db push
```

### package.json 스크립트 추가

```json
{
  "scripts": {
    "migrate": "supabase db push",
    "migrate:status": "supabase migration list"
  }
}
```

**장점:**
- ✅ 공식 도구
- ✅ 안전한 실행 (트랜잭션 지원)
- ✅ 마이그레이션 상태 추적
- ✅ 롤백 가능

**단점:**
- ❌ Supabase CLI 설치 필요
- ❌ 프로젝트 연결 필요

---

## 방법 2: PostgreSQL 직접 연결 (pg 라이브러리)

Node.js에서 직접 PostgreSQL에 연결하여 실행합니다.

### 설치

```bash
npm install --save-dev pg
```

### 스크립트

`scripts/run-migration-pg-direct.js` 파일을 사용하세요.

**장점:**
- ✅ 추가 도구 불필요
- ✅ 완전한 제어 가능

**단점:**
- ❌ 직접 연결 정보 필요
- ❌ 에러 처리 복잡

---

## 방법 3: GitHub Actions 자동화

PR이나 main 브랜치에 푸시 시 자동으로 마이그레이션을 실행합니다.

### 설정 파일

`.github/workflows/migrate.yml` 파일을 생성하세요.

**장점:**
- ✅ CI/CD 통합
- ✅ 자동화
- ✅ 팀 협업 용이

**단점:**
- ❌ GitHub Actions 설정 필요
- ❌ 시크릿 관리 필요

---

## 방법 4: Vercel 배포 후 자동 실행

Vercel의 Post-Deploy Hook을 사용합니다.

### 설정

1. Vercel Dashboard → Project Settings → Git
2. Post-Deploy Hook 추가
3. API 엔드포인트 생성 (`app/api/migrate/route.ts`)

**장점:**
- ✅ 배포와 함께 자동 실행
- ✅ Vercel 통합

**단점:**
- ❌ Vercel 전용
- ❌ API 엔드포인트 필요

---

## 추천 방법

**개발 환경**: 방법 1 (Supabase CLI)
**프로덕션**: 방법 3 (GitHub Actions) 또는 방법 4 (Vercel Hook)

---

## 빠른 시작

가장 간단한 방법은 Supabase CLI를 사용하는 것입니다:

```bash
# 1. CLI 설치
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 4. 마이그레이션 실행
npm run migrate
```
