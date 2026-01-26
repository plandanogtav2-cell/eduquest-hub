-- Minimal fix for teacher signup - remove avatar dependency

-- Update the trigger function to be minimal and avoid errors
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
    user_grade := NULL;  -- Teachers don't have grades
    user_role := 'admin';  -- Teachers get admin role
  ELSE
    user_grade := COALESCE((NEW.raw_user_meta_data ->> 'grade')::grade_level, '4');
    user_role := 'student';  -- Students get student role
  END IF;
  
  -- Insert profile (without avatar for now)
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    user_grade
  );
  
  -- Insert correct role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;