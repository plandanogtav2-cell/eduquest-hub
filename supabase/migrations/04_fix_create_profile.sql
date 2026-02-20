-- Drop and recreate the function with proper NULL handling
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, BOOLEAN);

CREATE FUNCTION create_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_grade TEXT,
  p_is_teacher BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  final_grade grade_level;
BEGIN
  -- Set default grade if NULL
  final_grade := COALESCE(p_grade, '4')::grade_level;
  
  -- Insert or update profile
  INSERT INTO profiles (user_id, full_name, grade, created_at)
  VALUES (p_user_id, p_full_name, final_grade, NOW())
  ON CONFLICT (user_id) DO UPDATE 
  SET full_name = p_full_name, grade = final_grade, updated_at = NOW();
  
  -- Insert role
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (p_user_id, CASE WHEN p_is_teacher THEN 'admin' ELSE 'student' END, NOW())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, BOOLEAN) TO authenticated, anon;
