-- Manual fix for teacher account and create working trigger

-- 1. First, find and upgrade the teacher account you just created
-- Replace 'teacher@example.com' with the actual teacher email
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'REPLACE_WITH_TEACHER_EMAIL'
);

-- Also set grade to NULL for teacher
UPDATE public.profiles 
SET grade = NULL 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'REPLACE_WITH_TEACHER_EMAIL'
);

-- 2. Create a working trigger for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_grade grade_level;
  is_teacher boolean;
  user_role text;
BEGIN
  -- Check if user is signing up as teacher
  is_teacher := COALESCE((NEW.raw_user_meta_data ->> 'is_teacher')::boolean, false);
  
  -- Set grade and role based on account type
  IF is_teacher THEN
    user_grade := NULL;
    user_role := 'admin';
  ELSE
    user_grade := COALESCE((NEW.raw_user_meta_data ->> 'grade')::grade_level, '4');
    user_role := 'student';
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    user_grade
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- 3. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();