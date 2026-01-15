-- ============================================
-- cards.created_by FK를 profiles로 변경
-- ============================================

-- 기존 FK 제약조건 삭제 (있으면)
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_created_by_fkey;

-- profiles 테이블을 참조하는 FK 추가
ALTER TABLE cards 
ADD CONSTRAINT cards_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
