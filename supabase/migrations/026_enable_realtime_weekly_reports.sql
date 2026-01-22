-- 026: weekly_reports 테이블 Realtime 활성화
-- 실행 방법: Supabase SQL Editor에서 실행
-- 
-- ⚠️ 주의: 이미 021_add_weekly_reports.sql을 실행했다면 이 파일은 실행하지 않아도 됩니다.
--          이미 Realtime이 활성화되어 있으면 에러가 발생할 수 있습니다 (무시해도 됩니다).

-- =====================================================
-- Realtime 활성화 (실시간 업데이트 및 Presence)
-- =====================================================
-- Supabase Realtime을 활성화하여 실시간 협업 기능 사용
-- 이미 활성화되어 있으면 에러가 발생하지만 무시해도 됩니다.
DO $$
BEGIN
  -- 이미 publication에 추가되어 있는지 확인
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'weekly_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE weekly_reports;
  END IF;
END $$;

-- Replica Identity 설정 (UPDATE/DELETE 이벤트를 위해 필요)
-- 이미 설정되어 있어도 에러가 발생하지 않습니다.
ALTER TABLE weekly_reports REPLICA IDENTITY FULL;

-- =====================================================
-- 완료!
-- =====================================================
-- 이제 주간보고 공유 화면에서 실시간 업데이트와 Presence 기능이 작동합니다.
