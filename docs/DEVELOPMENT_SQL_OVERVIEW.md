# 🧩 Plank 개발 현황 & SQL 마이그레이션 정리

> **기준일**: 2026-01-25  
> **프로젝트**: Plank (협업 칸반 보드 + 주간보고 시스템)

---

## 1. 지금까지 개발된 주요 기능 요약

### 보드 & 카드
- 보드 생성/수정/삭제, 이모지, 시작일/마감일, 설명, 공개/비공개
- 리스트(준비중/진행중/검토요청/완료) 생성 및 드래그앤드롭
- 카드 생성/수정/삭제, 리스트 간 드래그, 담당자/라벨/시작일/마감일
- 완료 카드 관리 (완료 리스트 + 별도 완료 페이지)

### 협업 기능
- Supabase Auth 기반 로그인/프로필
- 보드 멤버 초대/수락/거절, 권한(소유자/멤버/뷰어)
- 댓글, 체크리스트, 시간 로그(Jira 스타일)
- 실시간 알림(댓글, 초대 등)

### 주간보고 기능
- `weekly_reports` 기반 주간보고 자동 생성
  - 완료된 카드 / 진행 중 카드 / 카드 활동 이력 자동 수집
  - 카드 시간 로그 기반 총 작업시간 자동 집계
- 주간보고 작성/수정/제출(draft/submitted)
- 주간보고 공유 페이지
  - 동일 주차에 제출된 팀원 주간보고 목록
  - **실시간 Presence** (현재 보고 있는 사람 표시)
  - 마우스 커서 추적 & 클릭 시각화(Figma 스타일)
- 주간보고 내보내기 (PDF / CSV)
- 주간보고 통계 페이지
  - 주차별 총 작업시간/완료 개수 추이
  - 팀원별 작업시간 비교
  - 팀 전체 대시보드 카드 구성

### UX / 디자인
- 프로젝트 카드 / 완료 카드 / 주간보고 카드 **레이아웃 통일**
- PC / 모바일 반응형 대응
- 버튼/뱃지/아바타 스타일 공통화 진행

자세한 기능 목록은 `docs/PROJECT_STATUS.md` 참고.

---

## 2. 주간보고 관련 SQL 마이그레이션 정리

주간보고 기능과 통계·검색·템플릿 기능을 위한 SQL 마이그레이션들입니다.

### 2-1. 기본 스키마

| 번호 | 파일명 | 역할 |
|------|--------|------|
| 021 | `021_add_weekly_reports.sql` | `weekly_reports` 테이블 생성, RLS, Realtime 설정 |
| 022 | `022_add_card_time_logs.sql` | `card_time_logs` 테이블 (카드별 시간 로그) |
| 023 | `023_add_weekly_report_history.sql` | `weekly_report_history` (수정 이력 + 트리거) |
| 026 | `026_enable_realtime_weekly_reports.sql` | `weekly_reports` Realtime 게시(publication) |

> 대부분 기존에 한 번 실행된 상태일 가능성이 높지만,  
> 모두 `IF NOT EXISTS` 를 사용하므로 **여러 번 실행해도 안전**합니다.  
> (단, 026번은 이미 publication에 추가된 경우 경고가 날 수 있지만 치명적이지 않습니다.)

### 2-2. 템플릿 & 검색/통계 확장 (새로 추가한 SQL)

이 부분이 **이번 스프린트에서 추가된 SQL** 입니다.

#### 027. 주간보고 템플릿 기능

- 파일: `supabase/migrations/027_add_weekly_report_templates.sql`
- 주요 내용:
  - `weekly_report_templates` 테이블
    - `user_id` / `board_id`(선택) / `name` / `description`
    - `template_data` JSONB (기본 상태, 기본 진척도, 메모 템플릿 등)
    - `is_default` 기본 템플릿 여부
  - `updated_at` 자동 갱신 트리거
  - RLS 정책: 각 사용자별 본인 템플릿만 접근 가능

이 SQL을 실행하면:
- `app/actions/weekly-report-template.ts`
- `WeeklyReportTemplateModal.tsx`
- `WeeklyReportForm.tsx` 의 템플릿 관련 기능이 정상 동작합니다.

#### 028. 검색 & 통계 최적화

- 파일: `supabase/migrations/028_optimize_weekly_reports_for_search_and_stats.sql`
- 주요 내용:
  - **검색 인덱스**
    - `weekly_reports.notes`용 GIN 인덱스
    - `user_id + week_start_date`, `status + week_start_date`
    - `total_hours`, `board_id + week_start_date` 등
  - **시간 로그 인덱스 보강**
    - `card_time_logs.logged_date`, `user_id + logged_date`, `card_id + logged_date`
  - **뷰(View)**
    - `weekly_reports_summary`  
      → 보드/사용자별 주간보고 요약 조회
    - `weekly_hours_summary`  
      → 주차/보드/사용자 단위 시간 집계
  - **검색 함수**
    - `search_weekly_reports(...)`  
      → 텍스트 + 필터(보드/사용자/상태/기간) 기반 검색용 함수

이 SQL을 실행하면:
- `weekly-report-search.ts` / `WeeklyReportSearchClient.tsx`
- 팀 대시보드(`WeeklyReportStatsClient.tsx` + `team-dashboard.ts`)  
의 쿼리 성능과 기능이 전부 정상 동작합니다.

---

## 3. 실행 순서 요약 (Supabase Dashboard 기준)

Supabase Dashboard → **SQL Editor** → `New query` 에서 아래 파일 내용을 순서대로 실행합니다.

1. (이미 있을 확률 높음)  
   - `021_add_weekly_reports.sql`  
   - `022_add_card_time_logs.sql`  
   - `023_add_weekly_report_history.sql`  
   - `026_enable_realtime_weekly_reports.sql`
2. **이번에 추가한 것**  
   - `027_add_weekly_report_templates.sql`  
   - `028_optimize_weekly_reports_for_search_and_stats.sql`

> • `IF NOT EXISTS` 를 써서 여러 번 실행해도 안전하게 설계했습니다.  
> • 026번에서 `relation "weekly_reports" is already member of publication` 경고가 나와도 무시해도 됩니다. (이미 추가된 상태)

---

## 4. 로컬에서 한 번에 적용하고 싶을 때

이미 만들어 둔 스크립트:

- `scripts/run-migration-auto.js`

`.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL` 이 설정되어 있다면:

```bash
# 1) Supabase 로그인 (최초 1회)
npm run migrate:login

# 2) 자동으로 project ref 추출 + link + db push
npm run migrate
```

이 스크립트는:
- `.env.local`에서 Supabase URL 읽기
- URL에서 project ref 추출
- `npx supabase link` / `npx supabase db push` 순서로 실행합니다.

---

## 5. 앞으로 SQL이 더 필요해지는 경우

새 기능(예: 추가 통계, 새로운 리포트 타입 등)을 구현할 때는:

1. `supabase/migrations/0xx_...sql` 파일을 새로 작성
2. 가능한 한 `IF NOT EXISTS` / `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN END; $$;` 패턴 사용
3. 이 문서의 **2-2. 확장 마이그레이션** 섹션 아래에 항목 추가

이 문서 하나만 보면:
- **무슨 기능이 구현돼 있고**
- **어떤 SQL을 추가로 실행해야 하는지**
- **어떤 순서로 돌려야 하는지**
를 한 번에 파악할 수 있게 구성했습니다.

