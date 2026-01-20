-- 020: 보드/카드 시작일 + 마감일 추가
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 1. 보드에 시작일/마감일 추가
-- =====================================================
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- =====================================================
-- 2. 카드에 시작일 추가
-- =====================================================
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

-- =====================================================
-- 완료!
-- =====================================================
