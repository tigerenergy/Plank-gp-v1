-- ============================================
-- 🎯 단순화: 로그인 = 팀원
-- 
-- 모든 정책 삭제 후 새로 생성
-- ============================================

-- ========== boards 정책 전부 삭제 ==========
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
DROP POLICY IF EXISTS "auth_all_boards" ON boards;

-- ========== lists 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Users can manage lists in own boards" ON lists;
DROP POLICY IF EXISTS "Users can manage lists in accessible boards" ON lists;
DROP POLICY IF EXISTS "Team can manage all lists" ON lists;
DROP POLICY IF EXISTS "Allow all for lists" ON lists;
DROP POLICY IF EXISTS "auth_all_lists" ON lists;

-- ========== cards 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Users can manage cards in own boards" ON cards;
DROP POLICY IF EXISTS "Users can manage cards in accessible boards" ON cards;
DROP POLICY IF EXISTS "Team can manage all cards" ON cards;
DROP POLICY IF EXISTS "Allow all for cards" ON cards;
DROP POLICY IF EXISTS "auth_all_cards" ON cards;

-- ========== comments 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Team can view all comments" ON comments;
DROP POLICY IF EXISTS "Team can create comments" ON comments;
DROP POLICY IF EXISTS "Allow all for comments" ON comments;
DROP POLICY IF EXISTS "auth_all_comments" ON comments;

-- ========== checklists 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Users can view checklists" ON checklists;
DROP POLICY IF EXISTS "Users can manage checklists" ON checklists;
DROP POLICY IF EXISTS "Team can manage all checklists" ON checklists;
DROP POLICY IF EXISTS "Allow all for checklists" ON checklists;
DROP POLICY IF EXISTS "auth_all_checklists" ON checklists;

-- ========== checklist_items 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Users can view checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can manage checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Team can manage all checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Allow all for checklist_items" ON checklist_items;
DROP POLICY IF EXISTS "auth_all_checklist_items" ON checklist_items;

-- ========== board_members 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Anyone can view members" ON board_members;
DROP POLICY IF EXISTS "Can insert members" ON board_members;
DROP POLICY IF EXISTS "Board owners can update members" ON board_members;
DROP POLICY IF EXISTS "Can delete members" ON board_members;
DROP POLICY IF EXISTS "Authenticated users can view members" ON board_members;
DROP POLICY IF EXISTS "Board owners can manage members" ON board_members;
DROP POLICY IF EXISTS "Team can view all members" ON board_members;
DROP POLICY IF EXISTS "Team can manage members" ON board_members;
DROP POLICY IF EXISTS "Allow all for board_members" ON board_members;
DROP POLICY IF EXISTS "auth_all_board_members" ON board_members;

-- ========== profiles 정책 전부 삭제 ==========
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all for profiles" ON profiles;
DROP POLICY IF EXISTS "auth_all_profiles" ON profiles;

-- ========================================
-- 새 정책: 로그인만 하면 전체 접근
-- ========================================

CREATE POLICY "auth_all_boards" ON boards
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_lists" ON lists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_cards" ON cards
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_comments" ON comments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_checklists" ON checklists
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_checklist_items" ON checklist_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_profiles" ON profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_board_members" ON board_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- ✅ 완료: 로그인 = 팀원 = 모든 권한
-- ========================================
