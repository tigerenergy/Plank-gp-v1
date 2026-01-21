# 📋 Plank 현재 기능 목록

> **최종 업데이트**: 2026-01-21  
> **프로젝트**: Plank (협업 칸반 보드)

---

## 🎯 프로젝트 개요

Plank는 팀 협업을 위한 실시간 칸반 보드 애플리케이션입니다. Trello 스타일의 핵심 기능을 구현하고 있으며, Google OAuth 인증과 Supabase 기반의 실시간 협업을 지원합니다.

---

## ✅ 구현 완료된 기능

### 1. 인증 시스템
- ✅ Google OAuth 로그인 (Supabase Auth)
- ✅ 세션 관리 (Middleware)
- ✅ 프로필 자동 생성
- ✅ 로그아웃

### 2. 보드 관리
- ✅ 보드 생성/수정/삭제
- ✅ 보드 이모지 선택 (기본 이모지 + 커스텀 이모지 피커)
- ✅ 보드 시작일/마감일 설정
- ✅ 보드 멤버 초대 시스템 (이메일 초대)
- ✅ 초대 수락/거절
- ✅ 보드 멤버 관리 (멤버 목록, 역할 관리)
- ✅ 보드 권한 관리 (소유자/멤버/뷰어)

### 3. 리스트 관리
- ✅ 리스트 생성/수정/삭제
- ✅ 리스트별 카드 그룹화
- ✅ 리스트 드래그앤드롭 (위치 변경)
- ✅ 완료 리스트 표시 (is_done_list)

### 4. 카드 관리
- ✅ 카드 생성/수정/삭제
- ✅ 카드 드래그앤드롭 (리스트 간 이동)
- ✅ 카드 시작일/마감일 설정 (D-Day 형식 표시)
- ✅ 카드 라벨 시스템 (6가지 색상: red, blue, green, yellow, purple, orange)
- ✅ 카드 설명 작성 (Markdown 지원 가능)
- ✅ 카드 담당자 할당 (자동: 카드 생성자)
- ✅ 카드 완료 처리 (완료 리스트로 이동)
- ✅ 카드 모달 (상세/댓글/체크리스트 탭)

### 5. 댓글 시스템
- ✅ 댓글 작성/수정/삭제
- ✅ 실시간 댓글 표시
- ✅ 댓글 알림

### 6. 체크리스트
- ✅ 체크리스트 생성/삭제
- ✅ 체크리스트 항목 추가/삭제/토글
- ✅ 체크리스트 진행률 표시 (퍼센트)
- ✅ 체크리스트 제목 수정

### 7. 알림 시스템
- ✅ 실시간 알림 (Supabase Realtime)
- ✅ 댓글 알림
- ✅ 보드 초대 알림
- ✅ 알림 읽음 처리
- ✅ 알림 클릭 시 해당 카드로 이동
- ✅ 알림 드롭다운 UI

### 8. 완료된 작업 관리
- ✅ 완료된 카드 조회 (주간/월간/전체)
- ✅ 완료된 작업 통계
- ✅ 완료된 작업 페이지 (별도 라우트)

### 9. AI 보고서 (기본 구현)
- ✅ AI 기반 보고서 생성 (Google Gemini)
- ✅ 완료된 카드 기반 보고서
- ✅ 보고서 저장/조회/삭제
- ⚠️ **현재는 완료된 카드만 포함** (미완료 카드 미포함)

### 10. 권한 관리
- ✅ 보드 소유자: 보드 삭제, 멤버 초대
- ✅ 보드 멤버: 리스트/카드 생성 및 수정
- ✅ 카드 생성자: 본인 카드만 삭제 가능
- ✅ 댓글: 모든 멤버 작성 가능

### 11. UI/UX
- ✅ 다크/라이트 모드 지원
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 스켈레톤 로딩 애니메이션
- ✅ 토스트 알림 피드백 (Sonner)
- ✅ 커스텀 로고 적용
- ✅ D-Day 형식 마감일 표시
- ✅ 8-point grid spacing 시스템
- ✅ 버튼 disabled-first UX (폼 유효성 검사)
- ✅ 드래그앤드롭 애니메이션

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `profiles` - 사용자 프로필
- `boards` - 보드
- `board_members` - 보드 멤버 관계
- `board_invitations` - 보드 초대
- `lists` - 리스트 (칸반 컬럼)
- `cards` - 카드
- `comments` - 댓글
- `checklists` - 체크리스트
- `checklist_items` - 체크리스트 항목
- `notifications` - 알림
- `reports` - AI 보고서

### 주요 필드
- `cards`: title, description, start_date, due_date, labels, assignee_id, is_completed, completed_at, completed_by
- `boards`: title, emoji, start_date, due_date, created_by
- `lists`: title, position, is_done_list

---

## 🛠️ 기술 스택

### Frontend
- Next.js 16 (App Router, Server Components, Server Actions)
- React 19 (React Compiler 활성화)
- TypeScript 5.7
- Tailwind CSS 3.4
- Zustand (상태 관리)
- Framer Motion (애니메이션)
- @dnd-kit (드래그앤드롭)
- React Hook Form + Zod (폼 관리)

### Backend
- Supabase (PostgreSQL, Auth, Realtime)
- Row Level Security (RLS)
- Google Gemini AI (보고서 생성)

---

## 📝 현재 제한사항

1. **주간보고 기능 부족**
   - 완료된 카드만 포함
   - 미완료 카드의 진행상황 미포함
   - 이슈사항 추적 불가
   - 예상 완료일 관리 부족

2. **보고서 워크플로우 부재**
   - 개인별 주간보고 작성 기능 없음
   - 부장의 통합 보고서 생성 기능 없음
   - 상급자 보고 기능 없음

3. **엑셀 연동 없음**
   - 현재는 웹 기반만 지원
   - 엑셀 시트와의 동기화 불가

---

## 🎯 다음 단계

주간보고 기능을 추가하여 실제 업무 워크플로우를 지원하는 것이 목표입니다.
