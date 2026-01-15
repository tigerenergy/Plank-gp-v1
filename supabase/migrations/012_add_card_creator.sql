-- ============================================
-- 카드 생성자 필드 추가
-- ============================================

-- cards 테이블에 created_by 컬럼 추가
ALTER TABLE cards ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 기존 카드에 created_by 설정 (assignee_id로)
UPDATE cards SET created_by = assignee_id WHERE created_by IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards (created_by);
