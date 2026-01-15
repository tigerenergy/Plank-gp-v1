-- ============================================
-- 🚀 진짜 협업 서비스를 위한 RLS 정책
-- 
-- 기존 정책 전부 삭제 후 새로 생성
-- ============================================

-- ========== 모든 기존 정책 삭제 ==========

-- boards
DROP POLICY IF EXISTS "Users can view own boards" ON boards;
DROP POLICY IF EXISTS "Users can view accessible boards" ON boards;
DROP POLICY IF EXISTS "Users can create boards" ON boards;
DROP POLICY IF EXISTS "Users can update own boards" ON boards;
DROP POLICY IF EXISTS "Users can delete own boards" ON boards;
DROP POLICY IF EXISTS "Team can view all boards" ON boards;
DROP POLICY IF EXISTS "Team can create boards" ON boards;
DROP POLICY IF EXISTS "Owners can update boards" ON boards;
DROP POLICY IF EXISTS "Owners can delete boards" ON boards;
DROP POLICY IF EXISTS "Allow all for boards" ON boards;

-- lists
DROP POLICY IF EXISTS "Users can manage lists in own boards" ON lists;
DROP POLICY IF EXISTS "Users can manage lists in accessible boards" ON lists;
DROP POLICY IF EXISTS "Team can manage all lists" ON lists;
DROP POLICY IF EXISTS "Allow all for lists" ON lists;

-- cards
DROP POLICY IF EXISTS "Users can manage cards in own boards" ON cards;
DROP POLICY IF EXISTS "Users can manage cards in accessible boards" ON cards;
DROP POLICY IF EXISTS "Team can manage all cards" ON cards;
DROP POLICY IF EXISTS "Allow all for cards" ON cards;

-- comments
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Team can view all comments" ON comments;
DROP POLICY IF EXISTS "Team can create comments" ON comments;
DROP POLICY IF EXISTS "Allow all for comments" ON comments;

-- checklists
DROP POLICY IF EXISTS "Users can view checklists" ON checklists;
DROP POLICY IF EXISTS "Users can manage checklists" ON checklists;
DROP POLICY IF EXISTS "Team can manage all checklists" ON checklists;
DROP POLICY IF EXISTS "Allow all for checklists" ON checklists;

-- checklist_items
DROP POLICY IF EXISTS "Users can view checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can manage checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Team can manage all checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Allow all for checklist_items" ON checklist_items;

-- board_members
DROP POLICY IF EXISTS "Anyone can view members" ON board_members;
DROP POLICY IF EXISTS "Can insert members" ON board_members;
DROP POLICY IF EXISTS "Board owners can update members" ON board_members;
DROP POLICY IF EXISTS "Can delete members" ON board_members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON board_members;
DROP POLICY IF EXISTS "Board owners can manage members" ON board_members;
DROP POLICY IF EXISTS "Team can view all members" ON board_members;
DROP POLICY IF EXISTS "Team can manage members" ON board_members;
DROP POLICY IF EXISTS "Allow all for board_members" ON board_members;

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all for profiles" ON profiles;

-- ========== 새 정책 생성 (간단하게!) ==========

-- boards: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for boards" ON boards
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- lists: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for lists" ON lists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- cards: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for cards" ON cards
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- comments: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for comments" ON comments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- checklists: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for checklists" ON checklists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- checklist_items: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for checklist_items" ON checklist_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- board_members: 로그인한 사용자 = 모두 접근 가능
CREATE POLICY "Allow all for board_members" ON board_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- profiles: 로그인한 사용자 = 모두 볼 수 있음
CREATE POLICY "Allow all for profiles" ON profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- ✅ 완료!
-- 
-- 모든 로그인한 사용자가 모든 데이터에 접근 가능
-- Trello처럼 팀 전체가 협업하는 방식
-- ============================================
