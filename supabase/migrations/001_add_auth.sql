-- ============================================
-- 🚀 Plank V2 마이그레이션: 인증 시스템 추가
-- ============================================
-- 
-- ⚠️ 주의사항:
-- - 기존 데이터는 모두 보존됩니다!
-- - Supabase Dashboard → SQL Editor에서 실행하세요
-- - 순서대로 실행해야 합니다 (1단계 → 2단계 → 3단계)
--
-- ============================================

-- ============================================
-- 1단계: Profiles 테이블 생성 (Google 로그인 정보 저장)
-- ============================================

-- Profiles 테이블 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Google 로그인 시 프로필 자동 생성/업데이트 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2단계: Boards 테이블에 created_by 컬럼 추가
-- ============================================

-- created_by 컬럼 추가 (기존 데이터는 NULL로 유지)
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- ============================================
-- 3단계: RLS 정책 업데이트 (기존 정책 → 인증 기반)
-- ============================================

-- 기존 anon 정책 삭제 (boards)
DROP POLICY IF EXISTS "Boards are viewable by everyone." ON boards;
DROP POLICY IF EXISTS "Everyone can create boards." ON boards;
DROP POLICY IF EXISTS "Everyone can update boards." ON boards;
DROP POLICY IF EXISTS "Everyone can delete boards." ON boards;

-- 새 정책: 로그인 사용자 기반 (기존 데이터도 접근 가능하도록 created_by IS NULL 허용)
CREATE POLICY "Users can view own boards" ON boards
  FOR SELECT USING (
    auth.uid() = created_by OR created_by IS NULL
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Users can update own boards" ON boards
  FOR UPDATE USING (
    auth.uid() = created_by OR created_by IS NULL
  );

CREATE POLICY "Users can delete own boards" ON boards
  FOR DELETE USING (
    auth.uid() = created_by OR created_by IS NULL
  );

-- 기존 anon 정책 삭제 (lists)
DROP POLICY IF EXISTS "Lists are viewable by everyone." ON lists;
DROP POLICY IF EXISTS "Everyone can create lists." ON lists;
DROP POLICY IF EXISTS "Everyone can update lists." ON lists;
DROP POLICY IF EXISTS "Everyone can delete lists." ON lists;

-- 새 정책: 보드 소유자만 리스트 접근 가능
CREATE POLICY "Users can view lists in own boards" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can create lists in own boards" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can update lists in own boards" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can delete lists in own boards" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

-- 기존 anon 정책 삭제 (cards)
DROP POLICY IF EXISTS "Cards are viewable by everyone." ON cards;
DROP POLICY IF EXISTS "Everyone can create cards." ON cards;
DROP POLICY IF EXISTS "Everyone can update cards." ON cards;
DROP POLICY IF EXISTS "Everyone can delete cards." ON cards;

-- 새 정책: 보드 소유자만 카드 접근 가능
CREATE POLICY "Users can view cards in own boards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can create cards in own boards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can update cards in own boards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

CREATE POLICY "Users can delete cards in own boards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL)
    )
  );

-- ============================================
-- ✅ 완료! 
-- ============================================
-- 
-- 다음 단계:
-- 1. Supabase Dashboard → Authentication → Providers → Google 활성화
-- 2. Google Cloud Console에서 OAuth 클라이언트 ID 생성
-- 3. 앱에서 로그인 테스트
--
-- 기존 보드들은 created_by가 NULL이라서 로그인한 모든 사용자가 볼 수 있습니다.
-- 새로 만드는 보드부터는 본인만 볼 수 있게 됩니다.
-- ============================================
