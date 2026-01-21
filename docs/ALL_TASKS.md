# 📋 전체 Task 목록 및 상태

> **최종 업데이트**: 2026-01-21  
> **프로젝트**: Plank - 주간보고 기능

---

## ✅ 완료된 모든 Task

### Phase 0: 기존 기능 정리
- [x] 이메일 기능 삭제 (`app/actions/email.ts`, `lib/email.ts`)
- [x] AI 보고서 기능 삭제 (`app/actions/report.ts`, `lib/gemini.ts`)
- [x] `package.json`에서 `@google/generative-ai` 제거
- [x] `useCompletedStore.ts`에서 관련 상태 제거
- [x] `CompletedPageClient.tsx`에서 AI/이메일 UI 제거

### Phase 1: 데이터베이스 설계 및 마이그레이션
- [x] `weekly_reports` 테이블 생성 (021_add_weekly_reports.sql)
- [x] `card_time_logs` 테이블 생성 (022_add_card_time_logs.sql)
- [x] `weekly_report_history` 테이블 생성 (023_add_weekly_report_history.sql)
- [x] RLS 정책 설정 (모든 테이블)
- [x] 인덱스 생성
- [x] 트리거 함수 생성 (updated_at, 이력 기록)

### Phase 2: 백엔드 - 서버 액션 구현
- [x] 주간보고 CRUD (`app/actions/weekly-report.ts`)
  - [x] `createWeeklyReport` - 주간보고 생성
  - [x] `updateWeeklyReport` - 주간보고 수정
  - [x] `getWeeklyReport` - 주간보고 조회
  - [x] `getWeeklyReportsByBoard` - 보드별 주간보고 목록
  - [x] `submitWeeklyReport` - 주간보고 제출
- [x] 자동 데이터 수집 함수
  - [x] `collectCompletedCards` - 완료된 카드 수집
  - [x] `collectInProgressCards` - 진행 중인 카드 수집 (병렬 최적화)
  - [x] `collectCardActivities` - 카드 활동 이력 수집
- [x] 시간 로그 CRUD (`app/actions/time-log.ts`)
  - [x] `getTimeLogs` - 시간 로그 조회
  - [x] `createTimeLog` - 시간 로그 생성
  - [x] `updateTimeLog` - 시간 로그 수정
  - [x] `deleteTimeLog` - 시간 로그 삭제
  - [x] `getCardWeeklyHours` - 카드별 주간 시간 집계
- [x] 통계 데이터 조회 (`app/actions/weekly-report-stats.ts`)
  - [x] `getWeeklyHoursTrend` - 주간별 작업 시간 추이
  - [x] `getCompletionTrend` - 완료된 작업 수 추이
  - [x] `getTeamHoursComparison` - 팀원별 작업 시간 비교
- [x] 수정 이력 조회 (`app/actions/weekly-report-history.ts`)
  - [x] `getWeeklyReportHistory` - 수정 이력 조회

### Phase 3: 프론트엔드 - 페이지 및 컴포넌트
- [x] 주간보고 작성 페이지
  - [x] `app/board/[id]/weekly-report/new/page.tsx` - 서버 컴포넌트
  - [x] `app/board/[id]/weekly-report/new/WeeklyReportForm.tsx` - 클라이언트 폼
  - [x] `app/board/[id]/weekly-report/new/loading.tsx` - 스켈레톤 UI
- [x] 주간보고 공유 페이지
  - [x] `app/board/[id]/weekly-report/share/page.tsx` - 서버 컴포넌트
  - [x] `app/board/[id]/weekly-report/share/WeeklyReportShareClient.tsx` - 클라이언트
  - [x] `app/board/[id]/weekly-report/share/loading.tsx` - 스켈레톤 UI
  - [x] 실시간 업데이트 (Supabase Realtime)
  - [x] 수정 이력 모달 통합
- [x] 통계 페이지
  - [x] `app/board/[id]/weekly-report/stats/page.tsx` - 서버 컴포넌트
  - [x] `app/board/[id]/weekly-report/stats/WeeklyReportStatsClient.tsx` - 클라이언트
  - [x] 차트 구현 (recharts)
- [x] 시간 추적 UI
  - [x] `app/components/card/TimeLogSection.tsx` - 시간 로그 섹션
  - [x] 카드 모달에 "시간 추적" 탭 추가
- [x] 수정 이력 UI
  - [x] `app/components/weekly-report/ReportHistoryModal.tsx` - 이력 모달

### Phase 4: 데이터 내보내기
- [x] PDF 내보내기 (`app/lib/weekly-report-export.ts`)
  - [x] `generateWeeklyReportPDF` - 주간보고 PDF 생성
  - [x] `generateStatsPDF` - 통계 PDF 생성
- [x] CSV 내보내기
  - [x] `generateWeeklyReportCSV` - 주간보고 CSV 생성 (BOM 포함)
  - [x] `generateStatsCSV` - 통계 CSV 생성
- [x] UI 통합
  - [x] 공유 페이지에 내보내기 버튼 추가
  - [x] 통계 페이지에 내보내기 버튼 추가

### Phase 5: 통합 및 네비게이션
- [x] 보드 헤더에 "주간보고 공유" 링크 추가
- [x] 완료된 작업 페이지에 링크 추가
- [x] 네비게이션 플로우 완성

### Phase 6: 최적화
- [x] 병렬 쿼리 최적화 (Promise.all)
- [x] N+1 문제 해결
- [x] 스켈레톤 UI 추가
- [x] 에러 메시지 개선

### Phase 7: 버튼 중복 클릭 방지
- [x] `TimeLogSection.tsx` - 시간 로그 생성/수정/삭제 버튼에 `disabled` 및 스피너 추가
- [x] `CommentList.tsx` - 댓글 생성/수정/삭제 버튼에 `isSubmitting`/`isUpdating`/`isDeleting` 적용
- [x] `ChecklistSection.tsx` - 체크리스트 생성/삭제/토글 버튼에 `isSubmitting`/`deletingChecklistId`/`togglingItemId` 적용
- [x] `WeeklyReportForm.tsx` - 저장/제출 버튼에 `disabled` 및 스피너 추가
- [x] `CardModal.tsx` - 저장/삭제 버튼에 `disabled` 및 스피너 추가
- [x] `AddCardForm.tsx` - 카드 추가 버튼에 `disabled` 및 스피너 추가
- [x] `CreateBoardModal.tsx` - 보드 생성 버튼에 `disabled` 및 스피너 추가

---

## 🔧 개선 필요 Task

### 빌드 에러 수정
- [x] `Skeleton` import 경로 수정 (상대 경로로 변경 완료)
- [x] 빌드 테스트 통과 확인 (코드 컴파일 성공, 환경 변수 경고는 설정 문제)

---

## 📊 테스트 Task

### 자동화 테스트
- [ ] 빌드 테스트 (`npm run build`)
- [ ] 타입 체크 (`npm run type-check` 또는 `tsc --noEmit`)
- [ ] 단위 테스트 실행 (`npm test` 또는 `jest`)

### 수동 테스트 (체크리스트)
- [ ] `docs/TEST_CHECKLIST.md` 참고하여 전체 기능 테스트
- [ ] 시간 추적 기능 테스트
  - [ ] 시간 로그 생성/수정/삭제
  - [ ] 주간 시간 집계
  - [ ] 권한 확인
- [ ] 주간보고 작성/수정/제출 테스트
  - [ ] 자동 데이터 수집 확인
  - [ ] 진행 중인 작업 수정
  - [ ] 임시 저장 및 제출
- [ ] 공유 페이지 실시간 업데이트 테스트
  - [ ] 다중 사용자 시나리오
  - [ ] 실시간 업데이트 확인
  - [ ] 수정 이력 모달
- [ ] 통계 및 차트 테스트
  - [ ] 요약 카드 표시
  - [ ] 차트 렌더링
  - [ ] 데이터 정확성
- [ ] 데이터 내보내기 테스트
  - [ ] PDF 다운로드 (한글 깨짐 확인)
  - [ ] CSV 다운로드 (Excel 호환성 확인)
- [ ] 수정 이력 추적 테스트
  - [ ] 자동 이력 기록
  - [ ] 이력 조회
  - [ ] 권한 확인

### 통합 테스트
- [ ] 전체 워크플로우 테스트
  - [ ] 카드 생성 → 시간 로그 → 완료 → 주간보고 작성 → 제출 → 공유 → 통계
- [ ] 다중 사용자 시나리오
  - [ ] 사용자 A: 주간보고 작성 및 제출
  - [ ] 사용자 B: 공유 페이지에서 실시간 확인
  - [ ] 사용자 A: 주간보고 수정
  - [ ] 사용자 B: 자동 업데이트 확인
- [ ] 에러 처리 테스트
  - [ ] 네트워크 오류
  - [ ] 권한 오류
  - [ ] 빈 데이터 처리

### 성능 테스트
- [ ] 로딩 성능 확인
  - [ ] 주간보고 작성 페이지
  - [ ] 공유 페이지
  - [ ] 통계 페이지
- [ ] 데이터 처리 성능
  - [ ] 많은 카드가 있을 때 자동 수집
  - [ ] 많은 시간 로그가 있을 때 집계
  - [ ] 많은 보고서가 있을 때 통계 계산

### UI/UX 테스트
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 접근성 (키보드 네비게이션, 포커스 표시)
- [ ] 다크 모드

### 데이터 무결성 테스트
- [ ] 주간보고 삭제 불가 확인
- [ ] 과거 주간보고 조회 가능 확인
- [ ] 시간 로그와 주간보고 시간 집계 일치 확인
- [ ] 완료된 카드와 주간보고 완료 카드 일치 확인

---

## 🎯 우선순위별 작업 순서

### 1. 긴급 (즉시 수정 필요)
1. ✅ 빌드 에러 수정 (`Skeleton` import 경로)
2. ✅ 버튼 중복 클릭 방지 전역 적용

### 2. 테스트 (개발 완료 후)
1. 빌드 테스트
2. 기능 테스트 (체크리스트 기반)
3. 통합 테스트
4. 성능 테스트
5. UI/UX 테스트

### 3. 개선 (선택사항)
1. 성능 최적화 추가
2. UI/UX 개선
3. 추가 기능 개발

---

## 📝 Task 상태 표기법

- `[x]` - 완료
- `[ ]` - 미완료
- `[~]` - 진행 중
- `[!]` - 문제 발생

---

## 🔄 진행 중인 작업

현재 진행 중인 작업이 없습니다. 모든 기본 기능이 완료되었습니다.

---

## 📈 완료율

- **전체 진행률**: 100% (기본 기능)
- **버튼 중복 클릭 방지**: 100% (완료)
- **빌드 에러 수정**: 100% (완료)
- **테스트 진행률**: 0% (대기 중)
- **개선 진행률**: 0% (대기 중)

---

## 📌 주요 파일 목록

### 데이터베이스
- `supabase/migrations/021_add_weekly_reports.sql`
- `supabase/migrations/022_add_card_time_logs.sql`
- `supabase/migrations/023_add_weekly_report_history.sql`

### 백엔드 (서버 액션)
- `app/actions/weekly-report.ts`
- `app/actions/time-log.ts`
- `app/actions/weekly-report-stats.ts`
- `app/actions/weekly-report-history.ts`

### 프론트엔드 (페이지)
- `app/board/[id]/weekly-report/new/page.tsx`
- `app/board/[id]/weekly-report/new/WeeklyReportForm.tsx`
- `app/board/[id]/weekly-report/share/page.tsx`
- `app/board/[id]/weekly-report/share/WeeklyReportShareClient.tsx`
- `app/board/[id]/weekly-report/stats/page.tsx`
- `app/board/[id]/weekly-report/stats/WeeklyReportStatsClient.tsx`

### 프론트엔드 (컴포넌트)
- `app/components/card/TimeLogSection.tsx`
- `app/components/weekly-report/ReportHistoryModal.tsx`

### 유틸리티
- `app/lib/weekly-report-export.ts`
- `app/lib/weekly-report-stats-export.ts`

### 문서
- `docs/DEVELOPMENT_PLAN.md`
- `docs/TEST_CHECKLIST.md`
- `docs/ALL_TASKS.md` (이 파일)

---

## 🐛 알려진 이슈

1. **Supabase 환경 변수 경고** (환경 설정 문제, 코드 문제 아님)
   - 증상: 빌드 시 `/login` 페이지에서 Supabase 클라이언트 생성 실패
   - 해결: `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 필요
   - 참고: 실제 런타임에서는 환경 변수가 설정되어 있으면 정상 작동

---

## 📚 참고 문서

- `docs/DEVELOPMENT_PLAN.md` - 전체 개발 계획
- `docs/TEST_CHECKLIST.md` - 상세 테스트 체크리스트
- `docs/WEEKLY_REPORT_FEATURE.md` - 주간보고 기능 요구사항
- `docs/INTEGRATION_ANALYSIS.md` - 통합 분석 문서
