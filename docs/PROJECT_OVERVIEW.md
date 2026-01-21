# 🎯 Plank - 협업 칸반 보드 프로젝트

> **Plank**는 팀 협업을 위한 실시간 칸반 보드 애플리케이션입니다.  
> Trello의 핵심 기능을 구현하면서 현대적인 기술 스택과 최적화 기법을 적용했습니다.

---

## 📋 프로젝트 개요

| 항목 | 내용 |
|-----|------|
| **프로젝트명** | Plank (플랭크) |
| **유형** | 협업 칸반 보드 웹 애플리케이션 |
| **기술 스택** | Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS |
| **주요 특징** | 실시간 협업, 드래그앤드롭, 알림 시스템 |

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - React Compiler 활성화 (자동 memoization)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 스타일링
- **Framer Motion** - 애니메이션
- **dnd-kit** - 드래그앤드롭
- **Zustand** - 클라이언트 상태 관리
- **React Hook Form + Zod** - 폼 관리 및 유효성 검사

### Backend
- **Supabase** - PostgreSQL, Authentication, Realtime, Storage
- **Row Level Security (RLS)** - 데이터 접근 제어

### 성능 최적화 (Vercel Best Practices 적용)
- ✅ `async-parallel` - Promise.all() 병렬 데이터 페칭
- ✅ `bundle-dynamic-imports` - next/dynamic 코드 스플리팅
- ✅ `server-cache-react` - React.cache() 요청 중복 방지
- ✅ `reactCompiler: true` - 자동 memoization

---

## ✨ 구현된 기능

### 1. 인증 시스템
- [x] Google OAuth 로그인
- [x] 세션 관리
- [x] 프로필 자동 생성

### 2. 보드 관리
- [x] 보드 생성/수정/삭제
- [x] 이모지 선택 기능
- [x] 보드 멤버 초대 시스템
- [x] 초대 수락/거절

### 3. 리스트 관리
- [x] 리스트 생성/수정/삭제
- [x] 리스트별 카드 그룹화

### 4. 카드 관리
- [x] 카드 생성/수정/삭제
- [x] 드래그앤드롭으로 카드 이동
- [x] 마감일 설정 (D-Day 형식 표시)
- [x] 라벨 시스템 (6가지 색상)
- [x] 설명 작성
- [x] 담당자 자동 할당 (카드 생성자)

### 5. 댓글 시스템
- [x] 댓글 작성/삭제
- [x] 실시간 댓글 표시

### 6. 체크리스트
- [x] 체크리스트 생성/삭제
- [x] 항목 추가/삭제/토글
- [x] 진행률 표시

### 7. 알림 시스템
- [x] 실시간 알림 (Supabase Realtime)
- [x] 댓글 알림
- [x] 초대 알림
- [x] 알림 읽음 처리
- [x] 알림 클릭 시 해당 카드로 이동

### 8. 권한 관리
- [x] 보드 소유자: 보드 삭제, 멤버 초대
- [x] 보드 멤버: 리스트/카드 생성 및 수정
- [x] 카드 생성자: 본인 카드만 삭제 가능
- [x] 댓글: 모든 멤버 작성 가능

---

## 🎨 UI/UX 특징

- **다크/라이트 모드** 지원
- **반응형 디자인** (모바일/데스크톱)
- **스켈레톤 로딩** 애니메이션
- **토스트 알림** 피드백
- **커스텀 로고** 적용
- **D-Day 형식** 마감일 표시

---

## 🚀 프로젝트 방향성

### 단기 목표 (1-2주)
1. **성능 모니터링** - Vercel Analytics 연동
2. **에러 트래킹** - Sentry 연동
3. **테스트 코드** - Jest + React Testing Library

### 중기 목표 (1-2개월)
1. **검색 기능** - 카드/보드 전체 검색
2. **필터링** - 라벨, 담당자, 마감일별 필터
3. **카드 복사/이동** - 다른 보드로 이동
4. **활동 로그** - 모든 변경 이력 추적
5. **파일 첨부** - Supabase Storage 활용

### 장기 목표 (3개월+)
1. **팀 워크스페이스** - 여러 보드를 그룹화
2. **대시보드** - 통계 및 차트
3. **캘린더 뷰** - 마감일 기반 캘린더
4. **API 공개** - 외부 연동용 REST API

---

## 🔌 MCP (Model Context Protocol) 연동 아이디어

### 1. Slack MCP
```
- 카드 생성/완료 시 Slack 채널에 알림
- Slack에서 카드 생성 명령어
- 멘션 시 Slack DM 전송
```

### 2. GitHub MCP
```
- PR/Issue와 카드 연동
- 커밋 메시지로 카드 상태 변경
- GitHub Actions 결과를 카드에 표시
```

### 3. Google Calendar MCP
```
- 마감일을 Google Calendar에 자동 추가
- 캘린더 이벤트 변경 시 카드 마감일 동기화
```

### 4. Notion MCP
```
- Notion 페이지와 카드 연동
- Notion 데이터베이스 동기화
```

### 5. AI Assistant MCP
```
- 카드 설명 자동 생성
- 체크리스트 항목 추천
- 마감일 예측 (작업량 기반)
- 유사 카드 찾기
```

### 6. Email MCP
```
- 이메일로 카드 생성
- 마감일 리마인더 이메일 발송
```

---

## 💡 추가 기능 아이디어

### 우선순위 높음 ⭐⭐⭐
| 기능 | 설명 |
|-----|------|
| **카드 템플릿** | 자주 사용하는 카드 형식 저장 |
| **보드 템플릿** | 프로젝트 유형별 기본 리스트 구성 |
| **마감일 리마인더** | 마감 전 알림 (1일, 3일, 7일 전) |
| **카드 아카이브** | 삭제 대신 보관함으로 이동 |
| **멀티 선택** | 여러 카드 동시 이동/삭제 |

### 우선순위 중간 ⭐⭐
| 기능 | 설명 |
|-----|------|
| **카드 의존성** | 선행 카드 완료 후 진행 가능 |
| **시간 추적** | 카드별 작업 시간 기록 |
| **반복 카드** | 주기적으로 자동 생성되는 카드 |
| **카드 투표** | 우선순위 결정을 위한 투표 |
| **커스텀 필드** | 사용자 정의 입력 필드 |

### 우선순위 낮음 ⭐
| 기능 | 설명 |
|-----|------|
| **보드 배경** | 커스텀 배경 이미지/색상 |
| **카드 커버** | 카드 상단 이미지 |
| **스티커** | 카드에 이모지 스티커 |
| **보드 공유 링크** | 읽기 전용 공개 링크 |
| **키보드 단축키** | 빠른 작업을 위한 핫키 |

---

## 🔧 기술적 개선 사항

### 성능
- [ ] ISR (Incremental Static Regeneration) 적용
- [ ] Edge Runtime 활용
- [ ] Image CDN 최적화
- [ ] Service Worker 캐싱

### 인프라
- [ ] CI/CD 파이프라인 구축
- [ ] 스테이징 환경 분리
- [ ] 데이터베이스 백업 자동화
- [ ] 로그 수집 및 모니터링

### 보안
- [ ] Rate Limiting
- [ ] CSRF 보호
- [ ] Content Security Policy
- [ ] 입력 값 sanitization 강화

---

## 📊 데이터베이스 스키마

```
boards
├── id (uuid)
├── title
├── emoji
├── created_by (FK → profiles)
└── created_at

board_members
├── board_id (FK → boards)
├── user_id (FK → profiles)
└── role (admin/member)

lists
├── id (uuid)
├── title
├── position
└── board_id (FK → boards)

cards
├── id (uuid)
├── title
├── description
├── position
├── list_id (FK → lists)
├── due_date
├── labels (jsonb)
├── created_by (FK → profiles)
└── assignee_id (FK → profiles)

comments
├── id (uuid)
├── content
├── card_id (FK → cards)
└── user_id (FK → profiles)

checklists
├── id (uuid)
├── title
├── card_id (FK → cards)
└── items (FK → checklist_items)

notifications
├── id (uuid)
├── user_id (FK → profiles)
├── type (comment/invitation)
├── title
├── message
├── is_read
└── link
```

---

## 🎯 결론

**Plank**는 현대적인 웹 기술을 활용한 협업 도구의 기반을 갖추고 있습니다.  
핵심 기능이 완성되었으며, 향후 MCP 연동과 AI 기능 추가를 통해  
더욱 스마트한 프로젝트 관리 도구로 발전할 수 있습니다.

### 다음 단계 추천
1. **Slack MCP 연동** - 팀 커뮤니케이션 강화
2. **마감일 리마인더** - 생산성 향상
3. **검색 기능** - 사용성 개선
4. **활동 로그** - 투명성 확보

---

*Last Updated: 2026-01-19*
