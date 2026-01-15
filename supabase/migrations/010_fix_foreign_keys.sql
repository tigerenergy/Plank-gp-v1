-- ============================================
-- 🔗 Foreign Key 추가 (댓글 user 조인용)
-- ============================================

-- comments 테이블에 user_id FK 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments
    ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- cards 테이블에 assignee_id FK 추가 (없는 경우)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cards_assignee_id_fkey' 
    AND table_name = 'cards'
  ) THEN
    ALTER TABLE cards
    ADD CONSTRAINT cards_assignee_id_fkey
    FOREIGN KEY (assignee_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- ✅ 완료
-- ============================================
