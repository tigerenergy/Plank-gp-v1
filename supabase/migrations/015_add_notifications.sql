-- 통합 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'invitation', 'comment', 'mention' 등
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500), -- 이동할 링크 (예: /board/xxx)
  is_read BOOLEAN DEFAULT FALSE,
  -- 관련 엔티티 참조 (optional)
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  -- 발신자 정보
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 알림만 조회
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- RLS 정책: 알림 생성 (서버에서만, 또는 인증된 사용자)
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS 정책: 본인 알림만 읽음 처리
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- RLS 정책: 본인 알림만 삭제
CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (user_id = auth.uid());
