-- 021: 주간보고 기능 추가
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 1. weekly_reports 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,  -- 주간 시작일 (월요일)
  week_end_date DATE NOT NULL,     -- 주간 종료일 (일요일)
  status VARCHAR(20) DEFAULT 'draft',  -- draft, submitted
  -- 보고서 내용 (JSON)
  completed_cards JSONB DEFAULT '[]'::jsonb,      -- 완료된 카드 목록 (자동 수집)
  in_progress_cards JSONB DEFAULT '[]'::jsonb,     -- 진행 중인 카드 목록 (자동 수집 + 보완 입력)
  card_activities JSONB DEFAULT '[]'::jsonb,       -- 카드 활동 이력 (자동 수집)
  total_hours DECIMAL(8,2) DEFAULT 0,   -- 주간 총 작업 시간 (자동 집계)
  notes TEXT,                  -- 추가 메모
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, user_id, week_start_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_reports_board_user_week 
  ON weekly_reports(board_id, user_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_board_week 
  ON weekly_reports(board_id, week_start_date);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_weekly_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_reports_updated_at
  BEFORE UPDATE ON weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_reports_updated_at();

-- =====================================================
-- 2. RLS 정책 설정
-- =====================================================
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- 조회: 보드 멤버 모두 조회 가능
CREATE POLICY "weekly_reports_select" ON weekly_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = weekly_reports.board_id
      AND board_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = weekly_reports.board_id
      AND boards.created_by = auth.uid()
    )
  );

-- 생성: 보드 멤버만 생성 가능
CREATE POLICY "weekly_reports_insert" ON weekly_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM board_members
        WHERE board_members.board_id = weekly_reports.board_id
        AND board_members.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = weekly_reports.board_id
        AND boards.created_by = auth.uid()
      )
    )
  );

-- 수정: 작성자만 수정 가능
CREATE POLICY "weekly_reports_update" ON weekly_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 삭제: 주간보고는 삭제 불가 (데이터 영구 보존)
-- 삭제 정책 없음 = 삭제 불가

-- =====================================================
-- 3. Realtime 활성화 (실시간 업데이트 및 Presence)
-- =====================================================
-- Supabase Realtime을 활성화하여 실시간 협업 기능 사용
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_reports;

-- Replica Identity 설정 (UPDATE/DELETE 이벤트를 위해 필요)
ALTER TABLE weekly_reports REPLICA IDENTITY FULL;

-- =====================================================
-- 완료!
-- =====================================================
