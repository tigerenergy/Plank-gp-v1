-- =============================================
-- 018: 완료 처리 기능 추가
-- =============================================

-- 1. 리스트에 "완료 리스트" 속성 추가
ALTER TABLE lists ADD COLUMN IF NOT EXISTS is_done_list BOOLEAN DEFAULT false;

-- 2. 카드에 완료 상태 추가
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES profiles(id);

-- 3. 인덱스 추가 (통계 쿼리 성능)
CREATE INDEX IF NOT EXISTS idx_cards_completed ON cards(is_completed);
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_cards_completed_by ON cards(completed_by);
CREATE INDEX IF NOT EXISTS idx_lists_is_done_list ON lists(is_done_list);

-- 4. 보고서 테이블 (나중에 사용)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  report_type VARCHAR(50) DEFAULT 'weekly',
  period_start DATE,
  period_end DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 보고서 RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_select') THEN
    CREATE POLICY "reports_select" ON reports FOR SELECT
      USING (
        board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
        OR board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_insert') THEN
    CREATE POLICY "reports_insert" ON reports FOR INSERT
      WITH CHECK (
        board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
        OR board_id IN (SELECT id FROM boards WHERE created_by = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_delete') THEN
    CREATE POLICY "reports_delete" ON reports FOR DELETE
      USING (created_by = auth.uid());
  END IF;
END $$;

-- 5. 이메일 발송 기록 테이블 (나중에 사용)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  recipients TEXT[] NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES profiles(id)
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_logs_select') THEN
    CREATE POLICY "email_logs_select" ON email_logs FOR SELECT
      USING (sent_by = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'email_logs_insert') THEN
    CREATE POLICY "email_logs_insert" ON email_logs FOR INSERT
      WITH CHECK (sent_by = auth.uid());
  END IF;
END $$;
