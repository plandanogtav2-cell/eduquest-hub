-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_grade TEXT,
  p_is_teacher BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, grade, created_at)
  VALUES (p_user_id, p_full_name, COALESCE(p_grade, '4')::grade_level, NOW())
  ON CONFLICT (user_id) DO UPDATE SET full_name = p_full_name, grade = COALESCE(p_grade, '4')::grade_level;
  
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (p_user_id, CASE WHEN p_is_teacher THEN 'admin' ELSE 'student' END, NOW())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated, anon;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(p_grade TEXT, p_game_type TEXT)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  grade TEXT,
  avatar_emoji TEXT,
  avatar_color TEXT,
  total_points BIGINT,
  total_games BIGINT,
  average_score NUMERIC,
  rank_position BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.grade::TEXT,
    ao.emoji,
    ao.color_scheme,
    COALESCE(SUM(gs.score), 0)::BIGINT,
    COUNT(gs.id)::BIGINT,
    COALESCE(AVG(gs.score), 0)::NUMERIC,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(gs.score), 0) DESC)::BIGINT
  FROM profiles p
  LEFT JOIN game_sessions gs ON p.user_id = gs.user_id 
    AND (p_game_type IS NULL OR gs.game_type = p_game_type OR gs.game_type = 'enhanced-' || p_game_type)
  LEFT JOIN avatar_options ao ON p.selected_avatar_id = ao.id
  WHERE (p_grade IS NULL OR p.grade::TEXT = p_grade)
  GROUP BY p.user_id, p.full_name, p.grade, ao.emoji, ao.color_scheme
  ORDER BY 6 DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated, anon;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_grade TEXT;
  user_name TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student');
  user_grade := COALESCE(NEW.raw_user_meta_data->>'grade', '4');
  
  INSERT INTO public.profiles (user_id, full_name, grade, created_at)
  VALUES (NEW.id, user_name, user_grade::grade_level, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, CASE WHEN (NEW.raw_user_meta_data->>'is_teacher')::BOOLEAN THEN 'admin' ELSE 'student' END, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
