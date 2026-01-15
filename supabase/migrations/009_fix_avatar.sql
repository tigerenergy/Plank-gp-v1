-- ============================================
-- 🖼️ 프로필 이미지 수정
-- 
-- Google SSO에서 avatar_url 가져오기
-- ============================================

-- 1. 기존 사용자 프로필 이미지 업데이트
UPDATE profiles
SET avatar_url = (
  SELECT raw_user_meta_data->>'avatar_url' 
  FROM auth.users 
  WHERE auth.users.id = profiles.id
)
WHERE avatar_url IS NULL;

-- 2. 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 새 트리거 함수 (avatar_url 포함)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    username = COALESCE(profiles.username, EXCLUDED.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ✅ 완료
-- 
-- - 기존 사용자: avatar_url 업데이트됨
-- - 새 사용자: 자동으로 avatar_url 저장됨
-- ============================================
