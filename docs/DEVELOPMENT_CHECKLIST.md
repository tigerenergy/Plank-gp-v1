# 📋 주간보고 기능 개발 체크리스트

> **최종 업데이트**: 2026-01-26  
> **프로젝트**: Plank - 주간보고 기능  
> **상태**: 개발 완료 ✅

---

## 📊 데이터베이스 및 백엔드

### 데이터베이스 스키마
- [x] `weekly_reports` 테이블 생성 (`021_add_weekly_reports.sql`)
  - [x] 기본 필드 (id, board_id, user_id, week_start_date, week_end_date, status)
  - [x] JSONB 필드 (completed_cards, in_progress_cards, card_activities)
  - [x] 시간 집계 필드 (total_hours)
  - [x] 메모 필드 (notes)
  - [x] 인덱스 생성 (board_id, user_id, week_start_date)
  - [x] updated_at 자동 업데이트 트리거
- [x] `card_time_logs` 테이블 생성 (`022_add_card_time_logs.sql`)
  - [x] 시간 로그 기본 필드
  - [x] 체크리스트 항목과 연동
- [x] `weekly_report_history` 테이블 생성 (`023_add_weekly_report_history.sql`)
  - [x] 수정 이력 추적
- [x] RLS 정책 설정
  - [x] 조회 권한 (보드 멤버 모두)
  - [x] 생성 권한 (보드 멤버만)
  - [x] 수정 권한 (작성자만)
  - [x] 삭제 불가 (데이터 영구 보존)
- [x] Realtime 활성화 (`026_enable_realtime_weekly_reports.sql`)
  - [x] `weekly_reports` 테이블 Realtime 활성화
  - [x] Replica Identity 설정

### 서버 액션 (Backend)
- [x] 주간보고 CRUD (`app/actions/weekly-report.ts`)
  - [x] `createWeeklyReport` - 주간보고 생성
  - [x] `updateWeeklyReport` - 주간보고 수정
  - [x] `getWeeklyReport` - 주간보고 조회
  - [x] `getWeeklyReportsByBoard` - 보드별/전체 주간보고 목록 조회
  - [x] `submitWeeklyReport` - 주간보고 제출
  - [x] `refreshWeeklyReportData` - 주간보고 데이터 자동 갱신
- [x] 자동 데이터 수집 함수
  - [x] `collectCompletedCards` - 완료된 카드 수집 (해당 주간 completed_at 기준)
  - [x] `collectInProgressCards` - 진행 중인 카드 수집 (병렬 최적화)
  - [x] `collectCardActivities` - 카드 활동 이력 수집 (생성/수정/완료/체크리스트 완료)
- [x] 시간 로그 CRUD (`app/actions/time-log.ts`)
  - [x] `getTimeLogs` - 시간 로그 조회
  - [x] `createTimeLog` - 시간 로그 생성
  - [x] `updateTimeLog` - 시간 로그 수정
  - [x] `deleteTimeLog` - 시간 로그 삭제
  - [x] `getCardWeeklyHours` - 카드별 주간 시간 집계
  - [x] 카드 `updated_at` 자동 업데이트 (시간 로그 변경 시)
- [x] 체크리스트 액션 개선 (`app/actions/checklist.ts`)
  - [x] 카드 `updated_at` 자동 업데이트 (체크리스트 변경 시)
- [x] 카드 액션 개선 (`app/actions/card.ts`)
  - [x] 체크리스트 자동 생성 기능 (`autoCreateChecklistFromTitle`)
    - [x] 카드 제목 기반 체크리스트 자동 생성
    - [x] 카드 생성 시 자동 실행
    - [x] 에러 처리 (체크리스트 생성 실패해도 카드 생성은 성공)

---

## 🎨 프론트엔드 UI

### 주간보고 작성 페이지 (`app/board/[id]/weekly-report/new`)
- [x] `WeeklyReportForm.tsx` 컴포넌트
  - [x] 헤더 (보드 정보, 기간 표시)
  - [x] 새로고침 버튼
  - [x] 임시 저장 버튼
  - [x] 제출 버튼
  - [x] 제출 확인 모달
- [x] 탭 네비게이션
  - [x] "현재 주간 보고서" 탭
  - [x] "차주에 있을 일" 탭
  - [x] 탭 전환 기능
- [x] 현재 주간 보고서 탭
  - [x] 총 작업 시간 표시 (자동 집계)
  - [x] 완료된 작업 섹션
    - [x] 완료된 카드 목록 표시
    - [x] 카드별 작업 시간 표시
    - [x] 완료일 표시
    - [x] 빈 상태 메시지
  - [x] 진행 중인 작업 섹션
    - [x] 진행 중인 카드 목록 표시
    - [x] 카드별 입력 폼
      - [x] 진행 상태 선택 (드롭다운: 진행중, 완료, 대기, 예정)
      - [x] 진척도 입력 (0-100%)
      - [x] 작업 시간 입력 (자동 집계 시간 표시)
      - [x] 추가 설명 입력 (텍스트 영역)
      - [x] 이슈사항 입력 (텍스트 영역)
    - [x] 빈 상태 메시지
  - [x] 체크리스트 완료 항목 섹션
    - [x] 체크리스트 완료 항목 목록 표시
    - [x] 항목별 카드 제목, 리스트 제목 표시
    - [x] 항목별 소요 시간 표시
    - [x] 빈 상태 처리
  - [x] 추가 메모 섹션
- [x] 차주에 있을 일 탭
  - [x] 완료되지 않은 진행 중인 카드 필터링
  - [x] 카드별 정보 표시 (제목, 상태, 리스트, 진척도, 시간, 설명)
  - [x] 진척도 프로그레스 바
  - [x] 빈 상태 메시지
- [x] 실시간 데이터 새로고침
  - [x] 새로고침 버튼
  - [x] 최신 데이터로 업데이트
  - [x] 사용자 입력 데이터 보존

### 주간보고 공유 페이지 (`app/board/[id]/weekly-report/share`)
- [x] `WeeklyReportShareClient.tsx` 컴포넌트
  - [x] 헤더 (제목, 기간 선택)
  - [x] 내보내기 기능 (PDF, CSV)
  - [x] 통계 페이지 링크
- [x] 통합 주간보고 공유 공간
  - [x] 사용자가 접근 가능한 모든 보드의 주간보고 표시
  - [x] 보드별 필터링 옵션 (선택사항)
  - [x] 각 보고서에 보드 정보 표시
- [x] 주간보고 카드 표시
  - [x] 사용자별 그룹화
  - [x] 사용자 아바타 및 이름
  - [x] 제출 상태 표시 (제출 완료/작성 중)
  - [x] 보드 정보 표시 (보드 제목, 이모지)
  - [x] 통계 정보 (총 시간, 완료 개수, 진행 중 개수)
  - [x] 미리보기 (완료된 작업, 진행 중인 작업)
  - [x] 상세 보기 모달 연동
- [x] 실시간 업데이트
  - [x] Supabase Realtime 구독
  - [x] 주간보고 INSERT/UPDATE/DELETE 이벤트 처리
  - [x] 사용자 프로필 정보 포함 업데이트
  - [x] 현재 주간 필터링
- [x] 실시간 Presence 기능
  - [x] 현재 보고 있는 사용자 목록 표시
  - [x] 사용자 아바타 표시 (최대 3명)
  - [x] "N명이 보고 있음" 텍스트 표시
  - [x] 사용자 입장/퇴장 실시간 반영
- [x] 실시간 마우스 커서 추적
  - [x] 마우스 이동 이벤트 추적 (50ms throttle)
  - [x] 다른 사용자의 커서 위치 표시
  - [x] 커서 아이콘 및 사용자 이름 표시
  - [x] 클릭 이벤트 추적
  - [x] 클릭 위치 애니메이션 표시 (ping 효과)
  - [x] 클릭 표시 자동 제거 (2초 후)
- [x] 빈 상태 처리
  - [x] 주간보고 없을 때 메시지
  - [x] 주간보고 작성하기 링크

### 주간보고 상세 모달 (`app/components/weekly-report/WeeklyReportDetailModal.tsx`)
- [x] 모달 컴포넌트
  - [x] 사용자 정보 표시
  - [x] 기간 표시
  - [x] 총 작업 시간 표시
- [x] 완료된 작업 섹션
  - [x] 완료된 카드 목록
  - [x] 체크리스트 표시
  - [x] 완료일 표시
- [x] 진행 중인 작업 섹션
  - [x] 진행 중인 카드 목록
  - [x] 진척도 프로그레스 바
  - [x] 예상 완료일 표시
  - [x] 이슈사항 표시
- [x] 체크리스트 완료 항목 섹션
  - [x] 완료된 체크리스트 항목 목록
  - [x] 카드 제목, 리스트 제목 표시
  - [x] 소요 시간 표시
- [x] 추가 메모 섹션

---

## 🔄 실시간 기능

### Supabase Realtime
- [x] Realtime 활성화
  - [x] `weekly_reports` 테이블 Realtime 활성화
  - [x] Replica Identity 설정
- [x] 실시간 데이터 동기화
  - [x] Postgres 변경사항 구독
  - [x] INSERT 이벤트 처리
  - [x] UPDATE 이벤트 처리
  - [x] DELETE 이벤트 처리
  - [x] 사용자 프로필 정보 포함 업데이트

### Presence 기능
- [x] 사용자 Presence 등록
  - [x] 페이지 진입 시 Presence 등록
  - [x] 사용자 정보 포함 (userId, username, email, avatarUrl)
- [x] Presence 구독
  - [x] sync 이벤트 처리
  - [x] join 이벤트 처리
  - [x] leave 이벤트 처리
- [x] Presence UI 표시
  - [x] 현재 보고 있는 사용자 목록
  - [x] 사용자 아바타 표시
  - [x] 사용자 수 표시

### 실시간 마우스 추적
- [x] 마우스 이벤트 리스너
  - [x] 마우스 이동 이벤트 (throttle 50ms)
  - [x] 클릭 이벤트
- [x] 커서 위치 전송
  - [x] Presence를 통한 커서 위치 전송
  - [x] 상대 좌표 계산
- [x] 원격 커서 표시
  - [x] 다른 사용자의 커서 위치 표시
  - [x] 커서 아이콘 및 이름 표시
  - [x] 부드러운 애니메이션
- [x] 클릭 위치 표시
  - [x] 클릭 위치 전송
  - [x] 클릭 애니메이션 (ping 효과)
  - [x] 자동 제거 (2초 후)

---

## 🎯 핵심 기능

### 자동 데이터 수집
- [x] 완료된 카드 자동 수집
  - [x] 해당 주간 completed_at 기준 필터링
  - [x] 주간 시간 로그 집계
  - [x] 체크리스트 정보 포함
- [x] 진행 중인 카드 자동 수집
  - [x] 모든 미완료 카드 수집
  - [x] 체크리스트 진행률 계산
  - [x] 주간 시간 로그 집계
  - [x] 병렬 최적화 (체크리스트, 댓글 동시 조회)
- [x] 카드 활동 이력 수집
  - [x] 카드 생성 이력
  - [x] 카드 수정 이력
  - [x] 카드 완료 이력
  - [x] 체크리스트 항목 완료 이력 (시간 로그에서 수집)

### 시간 집계
- [x] 자동 시간 집계
  - [x] 완료된 카드 시간 합계
  - [x] 진행 중인 카드 시간 합계
  - [x] 총 작업 시간 계산
- [x] 시간 로그 연동
  - [x] 카드별 주간 시간 로그 조회
  - [x] 체크리스트 항목별 시간 로그
  - [x] 자동 집계 시간 우선 사용
  - [x] 사용자 수동 입력 시간 보존

### 데이터 보존 및 관리
- [x] 완료 취소 처리
  - [x] 완료된 카드 취소 시 주간보고에서 제거
  - [x] 완료 취소된 카드는 완전히 삭제 (보고서에 남지 않음)
- [x] 데이터 새로고침
  - [x] 최신 카드 데이터로 업데이트
  - [x] 사용자 입력 데이터 보존
  - [x] 자동 집계 시간 우선 사용

---

## 🎨 UI/UX 개선

### 카드 UI 개선
- [x] 완료된 카드 컴팩트 디자인
  - [x] 패딩 축소
  - [x] 폰트 크기 축소
  - [x] 아바타 크기 축소
  - [x] 버튼 크기 축소
  - [x] 아이콘 크기 축소
- [x] 버튼 텍스트 개선
  - [x] "취소" → "되돌리기"
  - [x] "삭제" 버튼 유지 (빨간색 스타일)
- [x] 아이콘 통일
  - [x] 완료 이모지 (✅) → CheckCircle2 SVG 아이콘

### 주간보고 공유 화면 개선
- [x] 헤더 제목 수정
  - [x] 보드 이름 제거 ("주간보고 공유"만 표시)
- [x] 통합 공간 구현
  - [x] 모든 보드의 주간보고 통합 표시
  - [x] 각 보고서에 보드 정보 표시

---

## 🧪 테스트 데이터

- [x] 목업 데이터 생성 (`025_insert_mock_data_for_weekly_report.sql`)
  - [x] 테스트 보드 생성
  - [x] 테스트 리스트 생성
  - [x] 완료된 카드 생성 (start_date 포함)
  - [x] 진행 중인 카드 생성 (start_date 포함)
  - [x] 체크리스트 및 체크리스트 항목 생성
  - [x] 시간 로그 생성
  - [x] 초기 주간보고 생성

---

## 📝 체크리스트 자동 생성 기능

- [x] 카드 제목 기반 체크리스트 자동 생성
  - [x] `autoCreateChecklistFromTitle` 함수 구현
  - [x] 카드 제목과 동일한 체크리스트 항목 생성
  - [x] 카드 생성 시 자동 실행
  - [x] 에러 처리 (체크리스트 생성 실패해도 카드 생성은 성공)

---

## 🔧 기술적 개선사항

### 성능 최적화
- [x] 병렬 데이터 조회
  - [x] 체크리스트와 댓글 동시 조회
  - [x] 완료된 카드, 진행 중인 카드, 활동 이력 병렬 수집
- [x] 이벤트 리스너 최적화
  - [x] 마우스 이동 이벤트 throttle (50ms)
  - [x] passive 이벤트 리스너 사용

### 데이터 일관성
- [x] 카드 updated_at 자동 업데이트
  - [x] 체크리스트 변경 시
  - [x] 시간 로그 변경 시
- [x] 시간 집계 로직 개선
  - [x] 자동 집계 시간 우선 사용
  - [x] 사용자 수동 입력 시간 보존

---

## ✅ 완료된 주요 기능 요약

1. **주간보고 작성 기능**
   - 완료된 작업, 진행 중인 작업 자동 수집
   - 체크리스트 완료 항목 표시
   - 차주에 있을 일 탭
   - 사용자 입력 폼 (상태, 진척도, 시간, 설명, 이슈)

2. **주간보고 공유 기능**
   - 통합 공간 (모든 보드의 주간보고)
   - 실시간 업데이트
   - Presence 기능 (누가 보고 있는지)
   - 실시간 마우스 커서 추적 및 표시
   - 클릭 위치 표시

3. **자동화 기능**
   - 체크리스트 자동 생성 (카드 제목 기반)
   - 데이터 자동 수집
   - 시간 자동 집계
   - 실시간 동기화

4. **데이터 관리**
   - 데이터 영구 보존
   - 완료 취소 처리
   - 데이터 새로고침

---

## 📊 개발 통계

- **총 작업 항목**: 100+ 개
- **완료율**: 100% ✅
- **주요 파일**:
  - `app/actions/weekly-report.ts` - 주간보고 서버 액션
  - `app/board/[id]/weekly-report/new/WeeklyReportForm.tsx` - 작성 폼
  - `app/board/[id]/weekly-report/share/WeeklyReportShareClient.tsx` - 공유 화면
  - `supabase/migrations/021_add_weekly_reports.sql` - 데이터베이스 스키마
  - `supabase/migrations/026_enable_realtime_weekly_reports.sql` - Realtime 활성화

---

## 🎉 완료!

모든 주요 기능이 개발 완료되었습니다. 주간보고 기능은 이제 프로덕션 환경에서 사용할 수 있습니다.
