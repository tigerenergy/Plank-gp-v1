-- 022: 카드 시간 추적 기능 추가
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 1. card_time_logs 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS card_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hours DECIMAL(6,2) NOT NULL CHECK (hours > 0),  -- 작업 시간 (시간 단위, 최대 9999.99)
  description TEXT,                              -- 작업 내용 설명 (선택사항)
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 작업 날짜
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_card_time_logs_card_id 
  ON card_time_logs(card_id);

CREATE INDEX IF NOT EXISTS idx_card_time_logs_user_id 
  ON card_time_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_card_time_logs_logged_date 
  ON card_time_logs(logged_date);

CREATE INDEX IF NOT EXISTS idx_card_time_logs_card_user_date 
  ON card_time_logs(card_id, user_id, logged_date);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_card_time_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_time_logs_updated_at
  BEFORE UPDATE ON card_time_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_card_time_logs_updated_at();

-- =====================================================
-- 2. RLS 정책 설정
-- =====================================================
ALTER TABLE card_time_logs ENABLE ROW LEVEL SECURITY;

-- 조회: 보드 멤버는 모두 조회 가능
CREATE POLICY "Board members can view time logs" ON card_time_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN board_members bm ON l.board_id = bm.board_id
      WHERE c.id = card_time_logs.card_id
        AND bm.user_id = auth.uid()
    )
  );

-- 생성: 보드 멤버는 자신의 시간 로그 생성 가능
CREATE POLICY "Board members can create own time logs" ON card_time_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN board_members bm ON l.board_id = bm.board_id
      WHERE c.id = card_time_logs.card_id
        AND bm.user_id = auth.uid()
    )
  );

-- 수정: 자신이 만든 시간 로그만 수정 가능
CREATE POLICY "Users can update own time logs" ON card_time_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 삭제: 자신이 만든 시간 로그만 삭제 가능
CREATE POLICY "Users can delete own time logs" ON card_time_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
