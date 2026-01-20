-- =============================================
-- 019: 완료 기능 Foreign Key 수정
-- =============================================

-- 기존 foreign key가 있으면 제거하고 명시적인 이름으로 재생성

-- 1. completed_by foreign key 확인 및 재생성
DO $$
BEGIN
  -- 기존 foreign key 제거 (이름이 다를 수 있음)
  BEGIN
    ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_completed_by_fkey;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- 명시적인 이름으로 foreign key 생성
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cards_completed_by_fkey'
  ) THEN
    ALTER TABLE cards 
      ADD CONSTRAINT cards_completed_by_fkey 
      FOREIGN KEY (completed_by) 
      REFERENCES profiles(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2. creator (created_by) foreign key도 확인
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cards_created_by_fkey'
  ) THEN
    ALTER TABLE cards 
      ADD CONSTRAINT cards_created_by_fkey 
      FOREIGN KEY (created_by) 
      REFERENCES profiles(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3. completed_by 컬럼이 없으면 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'completed_by'
  ) THEN
    ALTER TABLE cards ADD COLUMN completed_by UUID;
    ALTER TABLE cards 
      ADD CONSTRAINT cards_completed_by_fkey 
      FOREIGN KEY (completed_by) 
      REFERENCES profiles(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- 4. is_completed, completed_at 컬럼 확인
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE cards ADD COLUMN is_completed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE cards ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- 5. lists.is_done_list 컬럼 확인
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lists' AND column_name = 'is_done_list'
  ) THEN
    ALTER TABLE lists ADD COLUMN is_done_list BOOLEAN DEFAULT false;
  END IF;
END $$;
