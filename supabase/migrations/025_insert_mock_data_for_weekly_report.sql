-- 025: 주간보고 테스트용 목업 데이터 생성
-- 실행 방법: Supabase SQL Editor에서 실행
-- 주의: 기존 데이터가 있으면 중복될 수 있으니 테스트 환경에서만 실행하세요

-- =====================================================
-- 1. 현재 주간 날짜 계산 (2026년 1월 19일 ~ 1월 25일)
-- =====================================================
DO $$
DECLARE
  -- 현재 사용자 ID (실제 사용자 ID로 변경 필요)
  current_user_id UUID;
  -- 테스트 보드 ID
  test_board_id UUID;
  -- 리스트 ID들
  list_prepare_id UUID;
  list_progress_id UUID;
  list_review_id UUID;
  list_done_id UUID;
  -- 카드 ID들
  completed_card1_id UUID;
  completed_card2_id UUID;
  in_progress_card1_id UUID;
  in_progress_card2_id UUID;
  in_progress_card3_id UUID;
  -- 체크리스트 ID들
  checklist1_id UUID;
  checklist2_id UUID;
  -- 주간 시작일/종료일
  week_start DATE := '2026-01-19'; -- 월요일
  week_end DATE := '2026-01-25';   -- 일요일
BEGIN
  -- 현재 인증된 사용자 ID 가져오기 (없으면 첫 번째 사용자 사용)
  SELECT id INTO current_user_id FROM profiles LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '사용자가 없습니다. 먼저 회원가입을 해주세요.';
  END IF;

  -- =====================================================
  -- 2. 테스트 보드 생성
  -- =====================================================
  INSERT INTO boards (title, emoji, created_by, is_private)
  VALUES ('주간보고 테스트 프로젝트', '📊', current_user_id, false)
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_board_id;
  
  -- 보드가 이미 있으면 ID 가져오기
  IF test_board_id IS NULL THEN
    SELECT id INTO test_board_id FROM boards WHERE title = '주간보고 테스트 프로젝트' LIMIT 1;
  END IF;

  -- 보드 멤버 추가
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (test_board_id, current_user_id, 'admin')
  ON CONFLICT (board_id, user_id) DO NOTHING;

  -- =====================================================
  -- 3. 리스트 생성 (준비중, 진행중, 검토요청, 완료)
  -- =====================================================
  -- 준비중
  INSERT INTO lists (board_id, title, position, is_done_list)
  VALUES (test_board_id, '준비중', 1, false)
  ON CONFLICT DO NOTHING
  RETURNING id INTO list_prepare_id;
  
  IF list_prepare_id IS NULL THEN
    SELECT id INTO list_prepare_id FROM lists WHERE board_id = test_board_id AND title = '준비중' LIMIT 1;
  END IF;

  -- 진행중
  INSERT INTO lists (board_id, title, position, is_done_list)
  VALUES (test_board_id, '진행 중', 2, false)
  ON CONFLICT DO NOTHING
  RETURNING id INTO list_progress_id;
  
  IF list_progress_id IS NULL THEN
    SELECT id INTO list_progress_id FROM lists WHERE board_id = test_board_id AND title = '진행 중' LIMIT 1;
  END IF;

  -- 검토요청
  INSERT INTO lists (board_id, title, position, is_done_list)
  VALUES (test_board_id, '검토 요청', 3, false)
  ON CONFLICT DO NOTHING
  RETURNING id INTO list_review_id;
  
  IF list_review_id IS NULL THEN
    SELECT id INTO list_review_id FROM lists WHERE board_id = test_board_id AND title = '검토 요청' LIMIT 1;
  END IF;

  -- 완료
  INSERT INTO lists (board_id, title, position, is_done_list)
  VALUES (test_board_id, '완료', 4, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO list_done_id;
  
  IF list_done_id IS NULL THEN
    SELECT id INTO list_done_id FROM lists WHERE board_id = test_board_id AND title = '완료' LIMIT 1;
  END IF;

  -- =====================================================
  -- 4. 완료된 카드 생성 (이번 주에 완료된 카드)
  -- =====================================================
  
  -- 완료된 카드 1: "사용자 인증 기능 구현"
  INSERT INTO cards (list_id, title, description, position, created_by, assignee_id, is_completed, completed_at, completed_by, due_date, start_date, created_at, updated_at)
  VALUES (
    list_done_id,
    '사용자 인증 기능 구현',
    'JWT 기반 인증 시스템 구축 및 로그인/회원가입 페이지 개발',
    1,
    current_user_id,
    current_user_id,
    true,
    (week_start + INTERVAL '2 days')::TIMESTAMPTZ, -- 1월 21일 완료
    current_user_id,
    week_start + INTERVAL '3 days',
    (week_start + INTERVAL '0 days')::TIMESTAMPTZ, -- 1월 19일 시작
    (week_start + INTERVAL '0 days')::TIMESTAMPTZ, -- 1월 19일 생성
    (week_start + INTERVAL '2 days')::TIMESTAMPTZ  -- 1월 21일 수정
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO completed_card1_id;
  
  IF completed_card1_id IS NULL THEN
    SELECT id INTO completed_card1_id FROM cards WHERE title = '사용자 인증 기능 구현' AND list_id = list_done_id LIMIT 1;
  END IF;

  -- 완료된 카드 2: "API 엔드포인트 설계"
  INSERT INTO cards (list_id, title, description, position, created_by, assignee_id, is_completed, completed_at, completed_by, due_date, start_date, created_at, updated_at)
  VALUES (
    list_done_id,
    'API 엔드포인트 설계',
    'RESTful API 설계 및 Swagger 문서 작성',
    2,
    current_user_id,
    current_user_id,
    true,
    (week_start + INTERVAL '4 days')::TIMESTAMPTZ, -- 1월 23일 완료
    current_user_id,
    week_start + INTERVAL '5 days',
    (week_start + INTERVAL '1 day')::TIMESTAMPTZ, -- 1월 20일 시작
    (week_start + INTERVAL '1 day')::TIMESTAMPTZ, -- 1월 20일 생성
    (week_start + INTERVAL '4 days')::TIMESTAMPTZ  -- 1월 23일 수정
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO completed_card2_id;
  
  IF completed_card2_id IS NULL THEN
    SELECT id INTO completed_card2_id FROM cards WHERE title = 'API 엔드포인트 설계' AND list_id = list_done_id LIMIT 1;
  END IF;

  -- =====================================================
  -- 5. 진행 중인 카드 생성
  -- =====================================================
  
  -- 진행 중인 카드 1: "데이터베이스 스키마 설계"
  INSERT INTO cards (list_id, title, description, position, created_by, assignee_id, is_completed, due_date, start_date, created_at, updated_at)
  VALUES (
    list_progress_id,
    '데이터베이스 스키마 설계',
    '주간보고 기능을 위한 데이터베이스 스키마 설계 및 마이그레이션 작성',
    1,
    current_user_id,
    current_user_id,
    false,
    week_start + INTERVAL '7 days',
    (week_start + INTERVAL '1 day')::TIMESTAMPTZ, -- 1월 20일 시작
    (week_start + INTERVAL '1 day')::TIMESTAMPTZ, -- 1월 20일 생성
    NOW()::TIMESTAMPTZ                            -- 최근 수정
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO in_progress_card1_id;
  
  IF in_progress_card1_id IS NULL THEN
    SELECT id INTO in_progress_card1_id FROM cards WHERE title = '데이터베이스 스키마 설계' AND list_id = list_progress_id LIMIT 1;
  END IF;

  -- 진행 중인 카드 2: "프론트엔드 컴포넌트 개발"
  INSERT INTO cards (list_id, title, description, position, created_by, assignee_id, is_completed, due_date, start_date, created_at, updated_at)
  VALUES (
    list_progress_id,
    '프론트엔드 컴포넌트 개발',
    '주간보고 작성 폼 및 공유 페이지 컴포넌트 개발',
    2,
    current_user_id,
    current_user_id,
    false,
    week_start + INTERVAL '10 days',
    (week_start + INTERVAL '2 days')::TIMESTAMPTZ, -- 1월 21일 시작
    (week_start + INTERVAL '2 days')::TIMESTAMPTZ, -- 1월 21일 생성
    NOW()::TIMESTAMPTZ                             -- 최근 수정
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO in_progress_card2_id;
  
  IF in_progress_card2_id IS NULL THEN
    SELECT id INTO in_progress_card2_id FROM cards WHERE title = '프론트엔드 컴포넌트 개발' AND list_id = list_progress_id LIMIT 1;
  END IF;

  -- 진행 중인 카드 3: "백엔드 API 개발"
  INSERT INTO cards (list_id, title, description, position, created_by, assignee_id, is_completed, due_date, start_date, created_at, updated_at)
  VALUES (
    list_review_id,
    '백엔드 API 개발',
    '주간보고 CRUD API 및 자동 데이터 수집 로직 구현',
    1,
    current_user_id,
    current_user_id,
    false,
    week_start + INTERVAL '12 days',
    (week_start + INTERVAL '3 days')::TIMESTAMPTZ, -- 1월 22일 시작
    (week_start + INTERVAL '3 days')::TIMESTAMPTZ, -- 1월 22일 생성
    NOW()::TIMESTAMPTZ                             -- 최근 수정
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO in_progress_card3_id;
  
  IF in_progress_card3_id IS NULL THEN
    SELECT id INTO in_progress_card3_id FROM cards WHERE title = '백엔드 API 개발' AND list_id = list_review_id LIMIT 1;
  END IF;

  -- =====================================================
  -- 6. 체크리스트 생성
  -- =====================================================
  
  -- 완료된 카드 1의 체크리스트
  INSERT INTO checklists (card_id, title, position)
  VALUES (completed_card1_id, '인증 기능', 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO checklist1_id;
  
  IF checklist1_id IS NULL THEN
    SELECT id INTO checklist1_id FROM checklists WHERE card_id = completed_card1_id LIMIT 1;
  END IF;

  INSERT INTO checklist_items (checklist_id, content, is_checked, position)
  VALUES
    (checklist1_id, '로그인 기능 구현', true, 1),
    (checklist1_id, '회원가입 기능 구현', true, 2),
    (checklist1_id, 'JWT 토큰 발급', true, 3),
    (checklist1_id, '토큰 갱신 기능', true, 4)
  ON CONFLICT DO NOTHING;

  -- 진행 중인 카드 1의 체크리스트
  INSERT INTO checklists (card_id, title, position)
  VALUES (in_progress_card1_id, '스키마 설계', 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO checklist2_id;
  
  IF checklist2_id IS NULL THEN
    SELECT id INTO checklist2_id FROM checklists WHERE card_id = in_progress_card1_id LIMIT 1;
  END IF;

  INSERT INTO checklist_items (checklist_id, content, is_checked, position)
  VALUES
    (checklist2_id, '테이블 구조 설계', true, 1),
    (checklist2_id, '인덱스 설계', true, 2),
    (checklist2_id, 'RLS 정책 작성', false, 3),
    (checklist2_id, '마이그레이션 파일 작성', false, 4)
  ON CONFLICT DO NOTHING;

  -- =====================================================
  -- 7. 시간 로그 생성 (선택사항)
  -- =====================================================
  
  -- 완료된 카드 1의 시간 로그
  INSERT INTO card_time_logs (card_id, user_id, hours, description, logged_date)
  VALUES
    (completed_card1_id, current_user_id, 4.0, '로그인/회원가입 UI 개발', week_start + INTERVAL '1 day'),
    (completed_card1_id, current_user_id, 3.5, 'JWT 인증 로직 구현', week_start + INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- 완료된 카드 2의 시간 로그
  INSERT INTO card_time_logs (card_id, user_id, hours, description, logged_date)
  VALUES
    (completed_card2_id, current_user_id, 2.0, 'API 설계 문서 작성', week_start + INTERVAL '3 days'),
    (completed_card2_id, current_user_id, 3.0, 'Swagger 문서 작성', week_start + INTERVAL '4 days')
  ON CONFLICT DO NOTHING;

  -- 진행 중인 카드 1의 시간 로그
  INSERT INTO card_time_logs (card_id, user_id, hours, description, logged_date)
  VALUES
    (in_progress_card1_id, current_user_id, 5.0, '데이터베이스 스키마 설계', week_start + INTERVAL '5 days'),
    (in_progress_card1_id, current_user_id, 3.0, '인덱스 및 RLS 정책 설계', week_start + INTERVAL '6 days')
  ON CONFLICT DO NOTHING;

  -- 진행 중인 카드 2의 시간 로그
  INSERT INTO card_time_logs (card_id, user_id, hours, description, logged_date)
  VALUES
    (in_progress_card2_id, current_user_id, 6.0, '주간보고 작성 폼 컴포넌트 개발', week_start + INTERVAL '4 days'),
    (in_progress_card2_id, current_user_id, 4.0, '공유 페이지 컴포넌트 개발', week_start + INTERVAL '5 days')
  ON CONFLICT DO NOTHING;

  -- =====================================================
  -- 8. 주간보고 생성 (자동 수집된 데이터 포함)
  -- =====================================================
  
  INSERT INTO weekly_reports (
    board_id,
    user_id,
    week_start_date,
    week_end_date,
    status,
    completed_cards,
    in_progress_cards,
    card_activities,
    total_hours,
    notes
  )
  VALUES (
    test_board_id,
    current_user_id,
    week_start,
    week_end,
    'draft',
    -- 완료된 카드 데이터 (JSON 형식)
    jsonb_build_array(
      jsonb_build_object(
        'id', completed_card1_id,
        'title', '사용자 인증 기능 구현',
        'description', 'JWT 기반 인증 시스템 구축 및 로그인/회원가입 페이지 개발',
        'list_title', '완료',
        'completed_at', (week_start + INTERVAL '2 days')::TEXT,
        'weekly_hours', 7.5,
        'checklist_progress', 100
      ),
      jsonb_build_object(
        'id', completed_card2_id,
        'title', 'API 엔드포인트 설계',
        'description', 'RESTful API 설계 및 Swagger 문서 작성',
        'list_title', '완료',
        'completed_at', (week_start + INTERVAL '4 days')::TEXT,
        'weekly_hours', 5.0,
        'checklist_progress', 100
      )
    ),
    -- 진행 중인 카드 데이터 (JSON 형식)
    jsonb_build_array(
      jsonb_build_object(
        'card_id', in_progress_card1_id,
        'title', '데이터베이스 스키마 설계',
        'description', '주간보고 기능을 위한 데이터베이스 스키마 설계 및 마이그레이션 작성',
        'list_title', '진행 중',
        'auto_collected', jsonb_build_object(
          'created_at', (week_start + INTERVAL '1 day')::TEXT,
          'updated_at', NOW()::TEXT,
          'checklist_progress', 50,
          'weekly_hours', 8.0
        ),
        'user_input', jsonb_build_object(
          'status', '진행중',
          'progress', 50,
          'hours_spent', 8.0,
          'description', '테이블 구조와 인덱스 설계 완료, RLS 정책 작성 중',
          'issues', '',
          'expected_completion_date', (week_start + INTERVAL '7 days')::TEXT
        )
      ),
      jsonb_build_object(
        'card_id', in_progress_card2_id,
        'title', '프론트엔드 컴포넌트 개발',
        'description', '주간보고 작성 폼 및 공유 페이지 컴포넌트 개발',
        'list_title', '진행 중',
        'auto_collected', jsonb_build_object(
          'created_at', (week_start + INTERVAL '2 days')::TEXT,
          'updated_at', NOW()::TEXT,
          'checklist_progress', 0,
          'weekly_hours', 10.0
        ),
        'user_input', jsonb_build_object(
          'status', '진행중',
          'progress', 60,
          'hours_spent', 10.0,
          'description', '주간보고 작성 폼 UI 완성, 공유 페이지 개발 중',
          'issues', '',
          'expected_completion_date', (week_start + INTERVAL '10 days')::TEXT
        )
      ),
      jsonb_build_object(
        'card_id', in_progress_card3_id,
        'title', '백엔드 API 개발',
        'description', '주간보고 CRUD API 및 자동 데이터 수집 로직 구현',
        'list_title', '검토 요청',
        'auto_collected', jsonb_build_object(
          'created_at', (week_start + INTERVAL '3 days')::TEXT,
          'updated_at', NOW()::TEXT,
          'checklist_progress', 0,
          'weekly_hours', 0
        ),
        'user_input', jsonb_build_object(
          'status', '진행중',
          'progress', 30,
          'hours_spent', 0,
          'description', 'API 설계 완료, 구현 시작',
          'issues', '',
          'expected_completion_date', (week_start + INTERVAL '12 days')::TEXT
        )
      )
    ),
    -- 카드 활동 이력
    jsonb_build_array(
      jsonb_build_object(
        'type', 'created',
        'card_id', completed_card1_id,
        'card_title', '사용자 인증 기능 구현',
        'list_title', '준비중',
        'date', (week_start + INTERVAL '0 days')::TEXT
      ),
      jsonb_build_object(
        'type', 'completed',
        'card_id', completed_card1_id,
        'card_title', '사용자 인증 기능 구현',
        'list_title', '완료',
        'date', (week_start + INTERVAL '2 days')::TEXT
      ),
      jsonb_build_object(
        'type', 'created',
        'card_id', completed_card2_id,
        'card_title', 'API 엔드포인트 설계',
        'list_title', '준비중',
        'date', (week_start + INTERVAL '1 day')::TEXT
      ),
      jsonb_build_object(
        'type', 'completed',
        'card_id', completed_card2_id,
        'card_title', 'API 엔드포인트 설계',
        'list_title', '완료',
        'date', (week_start + INTERVAL '4 days')::TEXT
      )
    ),
    -- 총 작업 시간 (완료된 카드: 12.5시간 + 진행 중인 카드: 18.0시간 = 30.5시간)
    30.5,
    '이번 주는 사용자 인증 기능과 API 설계를 완료했습니다. 다음 주에는 데이터베이스 스키마 설계와 프론트엔드 컴포넌트 개발을 마무리할 예정입니다.'
  )
  ON CONFLICT (board_id, user_id, week_start_date) DO UPDATE
  SET
    completed_cards = EXCLUDED.completed_cards,
    in_progress_cards = EXCLUDED.in_progress_cards,
    card_activities = EXCLUDED.card_activities,
    total_hours = EXCLUDED.total_hours,
    notes = EXCLUDED.notes,
    updated_at = NOW();

  RAISE NOTICE '목업 데이터 생성 완료!';
  RAISE NOTICE '보드 ID: %', test_board_id;
  RAISE NOTICE '사용자 ID: %', current_user_id;
  RAISE NOTICE '주간보고 기간: % ~ %', week_start, week_end;
END $$;
