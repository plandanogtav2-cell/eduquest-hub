-- Disable trigger and use manual approach

-- 1. Disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a function to manually set teacher role after signup
CREATE OR REPLACE FUNCTION set_user_as_teacher(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update or insert profile with NULL grade
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (target_user_id, 'Teacher', NULL)
  ON CONFLICT (user_id) 
  DO UPDATE SET grade = NULL;
  
  -- Update or insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'Successfully set % as teacher/admin', user_email;
END;
$$;

-- 3. Create function for students (if needed)
CREATE OR REPLACE FUNCTION set_user_as_student(user_email text, user_grade text DEFAULT '4')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (target_user_id, 'Student', user_grade::grade_level)
  ON CONFLICT (user_id) 
  DO UPDATE SET grade = user_grade::grade_level;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'student')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'student';
END;
$$;