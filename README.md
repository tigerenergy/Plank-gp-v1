# 짭렐로 (Jjap-rello)

트렐로 스타일의 칸반 보드 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Font:** Pretendard
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Drag & Drop:** @dnd-kit
- **UI Feedback:** sonner
- **Validation:** React Hook Form + Zod

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 참고하여 `.env.local` 파일을 생성합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 데이터베이스 설정

Supabase 대시보드에서 `supabase/schema.sql` 파일의 SQL을 실행하여 테이블과 초기 데이터를 생성합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📂 프로젝트 구조

```
├── app/
│   ├── layout.tsx          # 레이아웃 (Pretendard 폰트, Toaster)
│   ├── page.tsx            # 메인 페이지
│   ├── globals.css         # 글로벌 스타일
│   ├── actions/            # 서버 액션
│   │   ├── board.ts
│   │   ├── column.ts
│   │   └── card.ts
│   └── components/         # UI 컴포넌트
│       ├── Board.tsx
│       ├── Column.tsx
│       ├── Card.tsx
│       ├── CardModal.tsx
│       ├── AddCardForm.tsx
│       ├── LabelBadge.tsx
│       ├── Checklist.tsx
│       └── Header.tsx
├── lib/                    # 유틸리티
│   ├── supabase.ts
│   └── utils.ts
├── store/                  # 상태 관리
│   └── useBoardStore.ts
├── types/                  # 타입 정의
│   └── index.ts
├── schema/                 # Zod 스키마
│   └── validation.ts
└── supabase/              # DB 스키마
    └── schema.sql
```

## ✨ 주요 기능

- **칸반 보드**: 컬럼과 카드로 구성된 칸반 보드
- **드래그 앤 드롭**: 카드를 드래그하여 컬럼 간 이동
- **낙관적 업데이트**: 즉시 UI 반영 후 서버 동기화
- **카드 상세**: 제목, 설명, 마감일, 라벨, 체크리스트
- **라벨 시스템**: 8가지 색상의 라벨
- **체크리스트**: 할 일 목록 관리
- **한국어 UI**: 모든 메시지 한국어 지원

## 🎨 디자인

- **다크 모드** 기반 UI
- **파스텔톤 컬럼** 헤더 (Rose, Amber, Sky, Emerald, Violet)
- **반응형** 레이아웃
- **접근성** 고려 (키보드, 터치 지원)

## 📝 라이선스

MIT License
