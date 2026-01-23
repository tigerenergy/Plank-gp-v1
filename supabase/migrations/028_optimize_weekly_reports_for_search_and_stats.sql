-- 028: 주간보고 검색 및 통계 기능 최적화
-- 실행 방법: Supabase SQL Editor에서 실행
-- 
-- 다음 기능들을 위한 인덱스 및 최적화:
-- - 주간보고 검색 기능
-- - 주간보고 비교 기능
-- - 팀 전체 통계 대시보드
-- - 프로젝트별 시간 집계
-- - 개인 생산성 분석
-- - 트렌드 분석

-- =====================================================
-- 1. 검색 기능을 위한 인덱스
-- =====================================================

-- notes 필드 검색을 위한 GIN 인덱스 (full-text search)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_notes_gin 
  ON weekly_reports USING gin(to_tsvector('english', COALESCE(notes, '')));

-- user_id와 week_start_date 조합 인덱스 (개인별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_week 
  ON weekly_reports(user_id, week_start_date DESC);

-- status와 week_start_date 조합 인덱스 (제출 상태별 조회)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_status_week 
  ON weekly_reports(status, week_start_date DESC);

-- =====================================================
-- 2. 통계 및 분석을 위한 인덱스
-- =====================================================

-- total_hours 인덱스 (시간 집계 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_total_hours 
  ON weekly_reports(total_hours) WHERE total_hours > 0;

-- week_start_date 인덱스 (주간별 통계)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start 
  ON weekly_reports(week_start_date DESC);

-- board_id와 week_start_date 조합 (프로젝트별 통계)
CREATE INDEX IF NOT EXISTS idx_weekly_reports_board_week_start 
  ON weekly_reports(board_id, week_start_date DESC);

-- =====================================================
-- 3. 시간 로그 통계 최적화
-- =====================================================

-- card_time_logs의 logged_date 인덱스 (이미 있을 수 있음)
CREATE INDEX IF NOT EXISTS idx_card_time_logs_logged_date 
  ON card_time_logs(logged_date DESC);

-- card_time_logs의 user_id와 logged_date 조합
CREATE INDEX IF NOT EXISTS idx_card_time_logs_user_date 
  ON card_time_logs(user_id, logged_date DESC);

-- card_time_logs의 card_id와 logged_date 조합
CREATE INDEX IF NOT EXISTS idx_card_time_logs_card_date 
  ON card_time_logs(card_id, logged_date DESC);

-- =====================================================
-- 4. 통계 조회를 위한 뷰 (선택사항)
-- =====================================================

-- 주간보고 요약 뷰 (통계 대시보드용)
CREATE OR REPLACE VIEW weekly_reports_summary AS
SELECT 
  wr.id,
  wr.board_id,
  wr.user_id,
  wr.week_start_date,
  wr.week_end_date,
  wr.status,
  wr.total_hours,
  jsonb_array_length(wr.completed_cards) as completed_cards_count,
  jsonb_array_length(wr.in_progress_cards) as in_progress_cards_count,
  jsonb_array_length(wr.card_activities) as activities_count,
  wr.created_at,
  wr.updated_at,
  b.title as board_title,
  p.username,
  p.email
FROM weekly_reports wr
LEFT JOIN boards b ON wr.board_id = b.id
LEFT JOIN profiles p ON wr.user_id = p.id;

-- 주간별 시간 집계 뷰
CREATE OR REPLACE VIEW weekly_hours_summary AS
SELECT 
  wr.week_start_date,
  wr.board_id,
  wr.user_id,
  COUNT(*) as report_count,
  SUM(wr.total_hours) as total_hours,
  AVG(wr.total_hours) as avg_hours,
  MIN(wr.total_hours) as min_hours,
  MAX(wr.total_hours) as max_hours
FROM weekly_reports wr
WHERE wr.status = 'submitted'
GROUP BY wr.week_start_date, wr.board_id, wr.user_id;

-- =====================================================
-- 5. 검색 함수 (full-text search)
-- =====================================================

-- 주간보고 검색 함수
CREATE OR REPLACE FUNCTION search_weekly_reports(
  search_text TEXT DEFAULT NULL,
  user_id_filter UUID DEFAULT NULL,
  board_id_filter UUID DEFAULT NULL,
  status_filter VARCHAR(20) DEFAULT NULL,
  week_start_from DATE DEFAULT NULL,
  week_start_to DATE DEFAULT NULL,
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  board_id UUID,
  user_id UUID,
  week_start_date DATE,
  week_end_date DATE,
  status VARCHAR(20),
  total_hours DECIMAL(8,2),
  completed_cards_count INT,
  in_progress_cards_count INT,
  created_at TIMESTAMPTZ,
  board_title TEXT,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wr.id,
    wr.board_id,
    wr.user_id,
    wr.week_start_date,
    wr.week_end_date,
    wr.status,
    wr.total_hours,
    jsonb_array_length(wr.completed_cards)::INT as completed_cards_count,
    jsonb_array_length(wr.in_progress_cards)::INT as in_progress_cards_count,
    wr.created_at,
    b.title as board_title,
    p.username
  FROM weekly_reports wr
  LEFT JOIN boards b ON wr.board_id = b.id
  LEFT JOIN profiles p ON wr.user_id = p.id
  WHERE 
    (search_text IS NULL OR 
     to_tsvector('english', COALESCE(wr.notes, '')) @@ plainto_tsquery('english', search_text) OR
     b.title ILIKE '%' || search_text || '%' OR
     p.username ILIKE '%' || search_text || '%')
    AND (user_id_filter IS NULL OR wr.user_id = user_id_filter)
    AND (board_id_filter IS NULL OR wr.board_id = board_id_filter)
    AND (status_filter IS NULL OR wr.status = status_filter)
    AND (week_start_from IS NULL OR wr.week_start_date >= week_start_from)
    AND (week_start_to IS NULL OR wr.week_start_date <= week_start_to)
  ORDER BY wr.week_start_date DESC, wr.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 완료!
-- =====================================================
