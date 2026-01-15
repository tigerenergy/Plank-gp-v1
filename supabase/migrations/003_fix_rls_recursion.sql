-- ============================================
-- 🔧 RLS 무한 재귀 수정
-- ============================================
-- 
-- 문제: boards와 board_members가 서로 참조하면서 무한 재귀 발생
-- 해결: board_members 정책 단순화
--
-- ============================================

-- 1. 기존 board_members 정책 삭제
DROP POLICY IF EXISTS "Users can view members of accessible boards" ON board_members;
DROP POLICY IF EXISTS "Board admins can add members" ON board_members;
DROP POLICY IF EXISTS "Board admins can update member roles" ON board_members;
DROP POLICY IF EXISTS "Board admins can remove members" ON board_members;

-- 2. 단순화된 board_members 정책 (재귀 없음)
-- 자신이 속한 보드의 멤버만 볼 수 있음
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR board_id IN (
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );

-- 보드 생성자 또는 admin만 멤버 추가 가능
CREATE POLICY "Admins can add members" ON board_members
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE created_by = auth.uid()
    )
    OR board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 보드 생성자 또는 admin만 역할 변경 가능
CREATE POLICY "Admins can update members" ON board_members
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM boards WHERE created_by = auth.uid()
    )
    OR board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 보드 생성자, admin, 또는 자기 자신만 제거 가능
CREATE POLICY "Admins can remove members" ON board_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR board_id IN (
      SELECT id FROM boards WHERE created_by = auth.uid()
    )
    OR board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. boards 정책도 단순화 (재귀 방지)
DROP POLICY IF EXISTS "Users can view accessible boards" ON boards;

CREATE POLICY "Users can view accessible boards" ON boards
  FOR SELECT USING (
    created_by = auth.uid() 
    OR created_by IS NULL
    OR is_private = false
    OR id IN (
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- ✅ 완료!
-- ============================================
