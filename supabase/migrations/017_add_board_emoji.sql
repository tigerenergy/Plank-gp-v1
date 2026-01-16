-- boards 테이블에 emoji 컬럼 추가
ALTER TABLE boards ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📋';

-- 기존 보드에 기본 이모지 설정
UPDATE boards SET emoji = '📋' WHERE emoji IS NULL;
