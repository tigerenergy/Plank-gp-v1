-- 보드 초대 테이블
CREATE TABLE IF NOT EXISTS board_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 같은 보드에 같은 이메일로 중복 초대 방지
  UNIQUE(board_id, invitee_email)
);

-- RLS 활성화
ALTER TABLE board_invitations ENABLE ROW LEVEL SECURITY;

-- 초대 조회 정책 (초대한 사람, 초대받은 사람, 보드 소유자)
CREATE POLICY "View invitations" ON board_invitations
FOR SELECT USING (
  inviter_id = auth.uid() OR
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_invitations.board_id 
    AND boards.created_by = auth.uid()
  )
);

-- 초대 생성 정책 (보드 멤버만)
CREATE POLICY "Create invitations" ON board_invitations
FOR INSERT WITH CHECK (
  inviter_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM board_members 
    WHERE board_members.board_id = board_invitations.board_id 
    AND board_members.user_id = auth.uid()
  )
);

-- 초대 수정 정책 (초대받은 사람만 - 수락/거절)
CREATE POLICY "Update invitations" ON board_invitations
FOR UPDATE USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 초대 삭제 정책 (초대한 사람 또는 보드 소유자)
CREATE POLICY "Delete invitations" ON board_invitations
FOR DELETE USING (
  inviter_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_invitations.board_id 
    AND boards.created_by = auth.uid()
  )
);

-- board_members 테이블에 초대된 멤버도 CRUD 가능하도록 RLS 업데이트
-- (기존 정책이 있다면 삭제 후 재생성)
DROP POLICY IF EXISTS "Access lists" ON lists;
DROP POLICY IF EXISTS "Access cards" ON cards;
DROP POLICY IF EXISTS "Access comments" ON comments;

-- 리스트 접근 정책 (보드 멤버 포함)
CREATE POLICY "Access lists" ON lists
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = lists.board_id 
    AND (
      boards.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_members.board_id = boards.id 
        AND board_members.user_id = auth.uid()
      )
    )
  )
);

-- 카드 접근 정책 (보드 멤버 포함)
CREATE POLICY "Access cards" ON cards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lists 
    JOIN boards ON boards.id = lists.board_id
    WHERE lists.id = cards.list_id
    AND (
      boards.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_members.board_id = boards.id 
        AND board_members.user_id = auth.uid()
      )
    )
  )
);

-- 댓글 접근 정책 (보드 멤버 포함)
CREATE POLICY "Access comments" ON comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM cards
    JOIN lists ON lists.id = cards.list_id
    JOIN boards ON boards.id = lists.board_id
    WHERE cards.id = comments.card_id
    AND (
      boards.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_members.board_id = boards.id 
        AND board_members.user_id = auth.uid()
      )
    )
  )
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_invitations_board_id ON board_invitations(board_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON board_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON board_invitations(status);
