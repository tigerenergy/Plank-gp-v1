-- 023: 주간보고 수정 이력 추적 기능 추가
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 1. weekly_report_history 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_report_id UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'submitted'
  changes JSONB, -- 변경된 필드와 값 (선택사항)
  previous_data JSONB, -- 이전 데이터 스냅샷 (선택사항)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_report_history_report_id 
  ON weekly_report_history(weekly_report_id);

CREATE INDEX IF NOT EXISTS idx_weekly_report_history_user_id 
  ON weekly_report_history(user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_report_history_created_at 
  ON weekly_report_history(created_at);

CREATE INDEX IF NOT EXISTS idx_weekly_report_history_action 
  ON weekly_report_history(action);

-- =====================================================
-- 2. RLS 정책 설정
-- =====================================================
ALTER TABLE weekly_report_history ENABLE ROW LEVEL SECURITY;

-- 조회: 보드 멤버는 모두 조회 가능
CREATE POLICY "Board members can view report history" ON weekly_report_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      JOIN board_members bm ON wr.board_id = bm.board_id
      WHERE wr.id = weekly_report_history.weekly_report_id
        AND bm.user_id = auth.uid()
    )
  );

-- 생성: 시스템에서만 생성 (트리거를 통해)
-- 사용자가 직접 생성할 수 없도록 정책 설정하지 않음
-- 또는 서버 액션에서만 생성하도록 제한

-- =====================================================
-- 3. 이력 자동 기록 트리거 함수
-- =====================================================
CREATE OR REPLACE FUNCTION log_weekly_report_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type VARCHAR(50);
  changes_data JSONB := '{}'::JSONB;
BEGIN
  -- 액션 타입 결정
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes_data := jsonb_build_object(
      'status', NEW.status,
      'total_hours', NEW.total_hours,
      'completed_cards_count', jsonb_array_length(NEW.completed_cards),
      'in_progress_cards_count', jsonb_array_length(NEW.in_progress_cards)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    
    -- 변경된 필드만 기록
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      changes_data := changes_data || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status));
    END IF;
    
    IF OLD.total_hours IS DISTINCT FROM NEW.total_hours THEN
      changes_data := changes_data || jsonb_build_object('total_hours', jsonb_build_object('old', OLD.total_hours, 'new', NEW.total_hours));
    END IF;
    
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
      changes_data := changes_data || jsonb_build_object('notes_changed', true);
    END IF;
    
    IF OLD.in_progress_cards IS DISTINCT FROM NEW.in_progress_cards THEN
      changes_data := changes_data || jsonb_build_object('in_progress_cards_updated', true);
    END IF;
    
    -- 제출 상태 변경 감지
    IF OLD.status = 'draft' AND NEW.status = 'submitted' THEN
      action_type := 'submitted';
    END IF;
  END IF;

  -- 이력 기록
  INSERT INTO weekly_report_history (
    weekly_report_id,
    user_id,
    action,
    changes,
    previous_data
  ) VALUES (
    NEW.id,
    NEW.user_id,
    action_type,
    changes_data,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        jsonb_build_object(
          'status', OLD.status,
          'total_hours', OLD.total_hours,
          'notes', OLD.notes
        )
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER weekly_report_history_trigger
  AFTER INSERT OR UPDATE ON weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION log_weekly_report_changes();
