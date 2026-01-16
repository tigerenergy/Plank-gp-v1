-- 기존 보드 생성자들을 board_members에 추가
-- (이전에 만든 보드의 생성자가 board_members에 없는 경우 대비)

INSERT INTO board_members (board_id, user_id, role)
SELECT b.id, b.created_by, 'admin'
FROM boards b
WHERE b.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM board_members bm 
    WHERE bm.board_id = b.id AND bm.user_id = b.created_by
  );

-- 확인용 코멘트:
-- 이 마이그레이션은 기존 보드의 생성자가 board_members에 없는 경우
-- admin 역할로 자동 추가합니다.
