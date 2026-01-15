-- ============================================
-- 🚀 Plank V2 마이그레이션: 협업 기능 추가
-- ============================================
-- 
-- ⚠️ 주의사항:
-- - 001_add_auth.sql 먼저 실행되어 있어야 합니다!
-- - Supabase Dashboard → SQL Editor에서 실행하세요
--
-- ============================================

-- ============================================
-- 1단계: Boards 테이블 확장
-- ============================================

-- 보드 설명, 공개 여부 추가
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- ============================================
-- 2단계: Board Members 테이블 (협업)
-- ============================================

CREATE TABLE IF NOT EXISTS board_members (
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (board_id, user_id)
);

-- RLS 활성화
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Board Members 정책
CREATE POLICY "Users can view members of accessible boards" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND (boards.created_by = auth.uid() OR boards.created_by IS NULL OR boards.is_private = false)
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Board admins can add members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM board_members bm 
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid() 
      AND bm.role = 'admin'
    )
  );

CREATE POLICY "Board admins can update member roles" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM board_members bm 
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid() 
      AND bm.role = 'admin'
    )
  );

CREATE POLICY "Board admins can remove members" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = board_members.board_id 
      AND boards.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM board_members bm 
      WHERE bm.board_id = board_members.board_id 
      AND bm.user_id = auth.uid() 
      AND bm.role = 'admin'
    )
    OR user_id = auth.uid() -- 자기 자신은 나갈 수 있음
  );

-- ============================================
-- 3단계: Cards 테이블 - 담당자 추가
-- ============================================

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id);

-- ============================================
-- 4단계: Boards RLS 업데이트 (멤버 포함)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own boards" ON boards;
DROP POLICY IF EXISTS "Users can create boards" ON boards;
DROP POLICY IF EXISTS "Users can update own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete own boards" ON boards;

-- 새 정책: 멤버도 접근 가능
CREATE POLICY "Users can view accessible boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() 
    OR created_by IS NULL
    OR is_private = false
    OR EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_members.board_id = boards.id 
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Board owners and admins can update" ON boards
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM board_members 
      WHERE board_members.board_id = boards.id 
      AND board_members.user_id = auth.uid() 
      AND board_members.role = 'admin'
    )
  );

CREATE POLICY "Only owners can delete boards" ON boards
  FOR DELETE USING (
    created_by = auth.uid() OR created_by IS NULL
  );

-- ============================================
-- 5단계: Lists RLS 업데이트 (멤버 포함)
-- ============================================

DROP POLICY IF EXISTS "Users can view lists in own boards" ON lists;
DROP POLICY IF EXISTS "Users can create lists in own boards" ON lists;
DROP POLICY IF EXISTS "Users can update lists in own boards" ON lists;
DROP POLICY IF EXISTS "Users can delete lists in own boards" ON lists;

CREATE POLICY "Users can view lists in accessible boards" ON lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR boards.is_private = false
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Members can create lists" ON lists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Members can update lists" ON lists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Members can delete lists" ON lists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = lists.board_id 
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

-- ============================================
-- 6단계: Cards RLS 업데이트 (멤버 포함)
-- ============================================

DROP POLICY IF EXISTS "Users can view cards in own boards" ON cards;
DROP POLICY IF EXISTS "Users can create cards in own boards" ON cards;
DROP POLICY IF EXISTS "Users can update cards in own boards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in own boards" ON cards;

CREATE POLICY "Users can view cards in accessible boards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR boards.is_private = false
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Members can create cards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Members can update cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Members can delete cards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lists
      JOIN boards ON boards.id = lists.board_id
      WHERE lists.id = cards.list_id
      AND (
        boards.created_by = auth.uid() 
        OR boards.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM board_members 
          WHERE board_members.board_id = boards.id 
          AND board_members.user_id = auth.uid()
          AND board_members.role IN ('admin', 'member')
        )
      )
    )
  );

-- ============================================
-- ✅ 완료! 
-- ============================================
-- 
-- 추가된 기능:
-- 1. board_members 테이블 (역할: admin, member, viewer)
-- 2. cards.assignee_id (담당자)
-- 3. boards.description, boards.is_private
-- 4. 멤버 기반 RLS 정책
--
-- ============================================
