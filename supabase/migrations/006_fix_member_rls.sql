-- ============================================
-- 🔧 board_members RLS 정책 수정
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Board owners can manage members" ON board_members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON board_members;

-- ========================================
-- SELECT: 로그인한 모든 사용자가 조회 가능
-- ========================================
CREATE POLICY "Anyone can view members" ON board_members
  FOR SELECT TO authenticated USING (true);

-- ========================================
-- INSERT: 
-- 1. 본인이 소유한 보드에 멤버 추가
-- 2. 본인을 멤버로 추가 (자기 자신 추가 허용)
-- ========================================
CREATE POLICY "Can insert members" ON board_members
  FOR INSERT TO authenticated WITH CHECK (
    -- 본인이 보드 소유자이거나
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
    OR
    -- 자기 자신을 추가하는 경우
    user_id = auth.uid()
  );

-- ========================================
-- UPDATE: 본인이 소유한 보드의 멤버만 수정
-- ========================================
CREATE POLICY "Board owners can update members" ON board_members
  FOR UPDATE USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
  );

-- ========================================
-- DELETE: 
-- 1. 본인이 소유한 보드의 멤버 삭제
-- 2. 본인이 직접 탈퇴 (자기 자신 삭제)
-- ========================================
CREATE POLICY "Can delete members" ON board_members
  FOR DELETE USING (
    board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
    OR
    user_id = auth.uid()
  );

-- ============================================
-- ✅ 완료!
-- ============================================
