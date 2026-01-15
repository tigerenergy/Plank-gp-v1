-- ============================================
-- 🔧 RLS 정책 완전 단순화 (재귀 100% 제거)
-- ============================================

-- ========== board_members 정책 전부 삭제 후 재생성 ==========
DROP POLICY IF EXISTS "Users can view board members" ON board_members;
DROP POLICY IF EXISTS "Admins can add members" ON board_members;
DROP POLICY IF EXISTS "Admins can update members" ON board_members;
DROP POLICY IF EXISTS "Admins can remove members" ON board_members;
DROP POLICY IF EXISTS "Users can view members of accessible boards" ON board_members;
DROP POLICY IF EXISTS "Board admins can add members" ON board_members;
DROP POLICY IF EXISTS "Board admins can update member roles" ON board_members;
DROP POLICY IF EXISTS "Board admins can remove members" ON board_members;

-- 단순화: 로그인한 사용자는 모든 멤버 정보 조회 가능
-- (멤버 목록은 민감 정보 아니므로 괜찮음)
CREATE POLICY "Authenticated users can view members" ON board_members
  FOR SELECT TO authenticated USING (true);

-- INSERT/UPDATE/DELETE는 본인이 소유한 보드만
CREATE POLICY "Board owners can manage members" ON board_members
  FOR ALL USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

-- ========== boards 정책 단순화 ==========
DROP POLICY IF EXISTS "Users can view accessible boards" ON boards;

-- 단순화: 본인 보드 + created_by가 NULL인 기존 보드
CREATE POLICY "Users can view own boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() 
    OR created_by IS NULL
  );

-- ========== lists 정책 단순화 ==========
DROP POLICY IF EXISTS "Users can view lists in accessible boards" ON lists;
DROP POLICY IF EXISTS "Members can create lists" ON lists;
DROP POLICY IF EXISTS "Members can update lists" ON lists;
DROP POLICY IF EXISTS "Members can delete lists" ON lists;

CREATE POLICY "Users can manage lists in own boards" ON lists
  FOR ALL USING (
    board_id IN (
      SELECT id FROM boards 
      WHERE created_by = auth.uid() OR created_by IS NULL
    )
  );

-- ========== cards 정책 단순화 ==========
DROP POLICY IF EXISTS "Users can view cards in accessible boards" ON cards;
DROP POLICY IF EXISTS "Members can create cards" ON cards;
DROP POLICY IF EXISTS "Members can update cards" ON cards;
DROP POLICY IF EXISTS "Members can delete cards" ON cards;

CREATE POLICY "Users can manage cards in own boards" ON cards
  FOR ALL USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT id FROM boards 
        WHERE created_by = auth.uid() OR created_by IS NULL
      )
    )
  );

-- ============================================
-- ✅ 완료! 이제 재귀 없음
-- ============================================
