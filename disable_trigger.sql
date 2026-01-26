-- Disable all triggers and let frontend handle it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_complete();

-- Create simple functions that frontend can call
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_full_name text,
  p_grade text DEFAULT NULL,
  p_is_teacher boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (p_user_id, p_full_name, p_grade);
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, CASE WHEN p_is_teacher THEN 'admin' ELSE 'student' END);
END;
$$;