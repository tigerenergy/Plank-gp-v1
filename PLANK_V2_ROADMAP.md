# 🏗️ Project Plank V2 - 개발 로드맵

> **프로젝트명**: Plank (구 Jjap-rello)  
> **목표**: 사내 Google Workspace 계정 기반의 보안성 높은 팀 협업 도구  
> **핵심 철학**: "단단한 기초(Plank)" 위에서 팀이 "동기화(Sync)" 되는 경험

---

## 📊 전체 진행 현황

| Phase | 이름             | 상태    | 진행률 |
| ----- | ---------------- | ------- | ------ |
| 1     | 인증 & 테마 기반 | ⬜ 대기 | 0%     |
| 2     | 협업 기능        | ⬜ 대기 | 0%     |
| 3     | 상세 기능        | ⬜ 대기 | 0%     |
| 4     | 외부 연동        | ⬜ 대기 | 0%     |

---

## 🛠️ 기술 스택

| 분류       | 기술            | 버전  | 용도                    |
| ---------- | --------------- | ----- | ----------------------- |
| Framework  | Next.js         | 16.x  | React 풀스택 프레임워크 |
| Language   | TypeScript      | 5.x   | 타입 안정성             |
| Database   | Supabase        | 2.x   | PostgreSQL + Auth + RLS |
| Styling    | Tailwind CSS    | 3.4.x | 유틸리티 CSS            |
| Theme      | next-themes     | 0.4.x | 다크/라이트 모드        |
| State      | Zustand         | 5.x   | 클라이언트 상태 관리    |
| Form       | react-hook-form | 7.x   | 폼 상태 관리            |
| Validation | Zod             | 3.x   | 스키마 유효성 검사      |
| Animation  | Framer Motion   | 11.x  | 애니메이션              |
| Toast      | Sonner          | 1.x   | 알림 메시지             |

---

## 📦 Phase 1: 인증 & 테마 기반

### 1.1 패키지 설치

- [ ] `@supabase/ssr` 설치
- [ ] `next-themes` 설치

### 1.2 Supabase 설정

- [ ] Google OAuth Provider 활성화 (Supabase Dashboard)
- [ ] Redirect URL 설정

### 1.3 DB 스키마 - Profiles

```sql
-- Profiles 테이블 (Google SSO 전용)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Trigger: Google 로그인 시 프로필 자동 동기화
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 1.4 인증 구현

- [ ] Supabase Client 설정 (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [ ] 미들웨어 구현 (`middleware.ts`) - 세션 체크 & 리다이렉트
- [ ] 로그인 페이지 (`/login`) - "Google 계정으로 계속하기" 버튼
- [ ] 로그아웃 기능
- [ ] 유저 정보 표시 (헤더에 아바타)

### 1.5 테마 시스템

- [ ] `next-themes` Provider 설정 (`app/providers.tsx`)
- [ ] CSS Variables 정의 (`globals.css`)
  ```css
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --primary: 221.2 83.2% 53.3%;
      --border: 214.3 31.8% 91.4%;
    }
    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      --card: 222.2 84% 4.9%;
      --primary: 217.2 91.2% 59.8%;
      --border: 217.2 32.6% 17.5%;
    }
  }
  ```
- [ ] Tailwind Config에서 CSS 변수 참조 설정
- [ ] 다크/라이트 토글 버튼 컴포넌트
- [ ] 기존 하드코딩된 색상 → CSS 변수로 마이그레이션

### 1.6 테스트

- [ ] Google 로그인 플로우 테스트
- [ ] 테마 전환 테스트
- [ ] 비로그인 상태 리다이렉트 테스트

---

## 📦 Phase 2: 협업 기능

### 2.1 DB 스키마 - 협업

```sql
-- Boards 테이블 확장
alter table boards add column if not exists created_by uuid references profiles(id);
alter table boards add column if not exists is_private boolean default true;
alter table boards add column if not exists description text;

-- Board Members (N:M 관계)
create table if not exists board_members (
  board_id uuid references boards(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member', -- 'admin', 'member', 'viewer'
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (board_id, user_id)
);

-- Cards 담당자
alter table cards add column if not exists assignee_id uuid references profiles(id);
```

### 2.2 RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 보드 조회 정책
CREATE POLICY "Access Board" ON boards
FOR SELECT USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid()) OR
  is_private = false
);

-- 보드 수정 정책 (admin만)
CREATE POLICY "Update Board" ON boards
FOR UPDATE USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role = 'admin')
);
```

### 2.3 구현 항목

- [ ] 보드 생성 시 `created_by` 자동 설정
- [ ] 보드 생성 시 `board_members`에 본인을 admin으로 추가
- [ ] 보드 멤버 목록 표시 (아바타)
- [ ] 멤버 초대 모달 (이메일 검색)
- [ ] 멤버 역할 변경 (admin/member/viewer)
- [ ] 멤버 제거 기능
- [ ] 카드 담당자 할당 UI (드롭다운)
- [ ] 담당자 아바타 카드에 표시

### 2.4 Server Actions 수정

- [ ] `createBoard` - created_by 추가, board_members 자동 추가
- [ ] `inviteMember` - 새 Server Action
- [ ] `removeMember` - 새 Server Action
- [ ] `updateMemberRole` - 새 Server Action
- [ ] `assignCard` - 담당자 할당

---

## 📦 Phase 3: 상세 기능

### 3.1 DB 스키마 - 댓글 & 체크리스트

```sql
-- 댓글
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references cards(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 체크리스트
create table if not exists checklists (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references cards(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 체크리스트 항목
create table if not exists checklist_items (
  id uuid default gen_random_uuid() primary key,
  checklist_id uuid references checklists(id) on delete cascade,
  content text not null,
  is_checked boolean default false,
  position double precision default 0
);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
```

### 3.2 댓글 기능

- [ ] 댓글 목록 조회
- [ ] 댓글 작성 (Enter 키 지원)
- [ ] 댓글 수정
- [ ] 댓글 삭제
- [ ] 댓글 작성자 아바타 표시
- [ ] 댓글 수 카드에 표시

### 3.3 체크리스트 기능

- [ ] 체크리스트 생성
- [ ] 체크리스트 제목 수정
- [ ] 체크리스트 삭제
- [ ] 체크리스트 항목 추가
- [ ] 체크리스트 항목 체크/해제
- [ ] 체크리스트 항목 삭제
- [ ] 체크리스트 진행률 표시 (N/M)

### 3.4 카드 상세 모달 개선

- [ ] 탭 UI (상세정보 / 댓글 / 체크리스트)
- [ ] 담당자 섹션 추가
- [ ] 활동 로그 (선택사항)

---

## 📦 Phase 4: 외부 연동

### 4.1 DB 스키마 - Integrations

```sql
create table if not exists board_integrations (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade,
  type text not null, -- 'slack', 'discord', 'custom'
  webhook_url text not null,
  events text[] default '{}', -- ['card_created', 'comment_added']
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 4.2 Webhook 서비스

- [ ] `services/notification.ts` 생성
- [ ] `sendWebhook(url, payload)` 함수
- [ ] `sendToSlack(url, message)` 헬퍼
- [ ] `sendToDiscord(url, message)` 헬퍼

### 4.3 이벤트 트리거

- [ ] 카드 생성 시 알림
- [ ] 카드 이동 시 알림
- [ ] 댓글 작성 시 알림
- [ ] 담당자 할당 시 알림
- [ ] 마감일 임박 알림 (선택사항)

### 4.4 설정 UI

- [ ] 보드 설정 모달
- [ ] 연동 추가/수정/삭제
- [ ] 이벤트 선택 체크박스
- [ ] 연동 테스트 버튼

---

## 📁 프로젝트 구조 (예정)

```
app/
├── (auth)/
│   ├── login/page.tsx        # 로그인 페이지
│   └── callback/route.ts     # OAuth 콜백
├── (protected)/
│   ├── layout.tsx            # 인증 필요 레이아웃
│   ├── page.tsx              # 홈 (보드 목록)
│   └── board/[id]/page.tsx   # 보드 상세
├── api/
│   └── webhook/route.ts      # Webhook 수신 (선택)
├── providers.tsx             # Theme + Auth Providers
├── layout.tsx
└── globals.css

lib/
├── supabase/
│   ├── client.ts             # 클라이언트 Supabase
│   ├── server.ts             # 서버 Supabase
│   └── middleware.ts         # 미들웨어 헬퍼
├── services/
│   └── notification.ts       # Webhook 서비스
└── ...

components/
├── auth/
│   ├── LoginButton.tsx
│   ├── LogoutButton.tsx
│   └── UserAvatar.tsx
├── board/
│   ├── MemberList.tsx
│   ├── InviteMemberModal.tsx
│   └── BoardSettings.tsx
├── card/
│   ├── AssigneeSelect.tsx
│   ├── CommentList.tsx
│   └── Checklist.tsx
└── ui/
    └── ThemeToggle.tsx

middleware.ts                  # 인증 미들웨어
```

---

## 📝 코딩 컨벤션

### Form + Zod + Server Action 패턴

```typescript
// [1] Schema 정의 (schema/card.ts)
export const createCardSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  listId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
})

// [2] Server Action (app/actions/card.ts)
export async function createCard(data: CreateCardInput) {
  const validated = createCardSchema.parse(data)
  // DB 저장 로직
}

// [3] Component (components/CreateCardForm.tsx)
export function CreateCardForm({ listId }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(createCardSchema),
    defaultValues: { listId },
  })

  const onSubmit = async (data) => {
    const result = await createCard(data)
    if (result.success) toast.success('카드 생성 완료')
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

---

## 🚀 시작하기

현재 Phase: **Phase 1 - 인증 & 테마 기반**

다음 태스크:

1. [ ] 패키지 설치 (`@supabase/ssr`, `next-themes`)
2. [ ] Supabase Dashboard에서 Google OAuth 설정
3. [ ] Profiles 테이블 및 트리거 생성

---

_마지막 업데이트: 2026-01-15_
