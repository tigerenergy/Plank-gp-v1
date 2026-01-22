-- 024: 기존 보드의 "할 일" 리스트 제목을 "준비중"으로 변경
-- 실행 방법: Supabase SQL Editor에서 실행

-- =====================================================
-- 기존 "할 일" 리스트를 "준비중"으로 변경
-- =====================================================

UPDATE lists
SET title = '준비중'
WHERE title = '할 일' OR title = '할일';

-- 변경된 리스트 수 확인 (선택사항)
-- SELECT COUNT(*) as updated_count 
-- FROM lists 
-- WHERE title = '준비중';
