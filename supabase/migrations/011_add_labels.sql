-- ============================================
-- 카드 라벨 기능 추가
-- ============================================

-- cards 테이블에 labels 컬럼 추가 (JSON 배열)
-- 라벨 형식: [{"name": "긴급", "color": "red"}, {"name": "버그", "color": "orange"}]
ALTER TABLE cards ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '[]'::jsonb;

-- 인덱스 추가 (라벨 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_cards_labels ON cards USING GIN (labels);
