-- 027: 주간보고 템플릿 기능 추가
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 1. weekly_report_templates 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE, -- NULL이면 모든 보드에서 사용 가능
  name VARCHAR(255) NOT NULL, -- 템플릿 이름
  description TEXT, -- 템플릿 설명
  -- 템플릿 데이터 (JSONB)
  template_data JSONB DEFAULT '{}'::jsonb, -- 진행 중인 카드 기본 구조, notes 템플릿 등
  is_default BOOLEAN DEFAULT false, -- 기본 템플릿 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name) -- 사용자별 템플릿 이름 중복 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_weekly_report_templates_user 
  ON weekly_report_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_report_templates_board 
  ON weekly_report_templates(board_id) WHERE board_id IS NOT NULL;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_weekly_report_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_report_templates_updated_at
  BEFORE UPDATE ON weekly_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_report_templates_updated_at();

-- =====================================================
-- 2. RLS 정책 설정
-- =====================================================
ALTER TABLE weekly_report_templates ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 템플릿만 조회 가능
CREATE POLICY "weekly_report_templates_select" ON weekly_report_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- 생성: 본인만 생성 가능
CREATE POLICY "weekly_report_templates_insert" ON weekly_report_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 수정: 본인만 수정 가능
CREATE POLICY "weekly_report_templates_update" ON weekly_report_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 삭제: 본인만 삭제 가능
CREATE POLICY "weekly_report_templates_delete" ON weekly_report_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 완료!
-- =====================================================
