-- ============================================
-- 🚀 Plank V2: Phase 3 - 댓글 & 체크리스트
-- ============================================

-- ========== 1. 댓글 테이블 ==========
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 댓글 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments" ON comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ========== 2. 체크리스트 테이블 ==========
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '체크리스트',
  position DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 체크리스트 RLS
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists" ON checklists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage checklists" ON checklists
  FOR ALL TO authenticated USING (true);

-- ========== 3. 체크리스트 항목 테이블 ==========
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  position DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 체크리스트 항목 RLS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist items" ON checklist_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage checklist items" ON checklist_items
  FOR ALL TO authenticated USING (true);

-- ============================================
-- ✅ 완료!
-- 
-- 추가된 테이블:
-- - comments: 카드 댓글
-- - checklists: 체크리스트
-- - checklist_items: 체크리스트 항목
-- ============================================
