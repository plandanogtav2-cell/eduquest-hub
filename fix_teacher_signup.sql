-- Fix teacher signup to properly assign admin role

-- Update the trigger function to properly handle teacher accounts
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_grade grade_level;
  is_teacher boolean;
  user_role text;
  default_avatar_id uuid;
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
  
  -- Get first default avatar
  SELECT id INTO default_avatar_id 
  FROM public.avatar_options 
  WHERE is_default = true 
  LIMIT 1;
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, grade, selected_avatar_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    user_grade,
    default_avatar_id
  );
  
  -- Insert correct role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Unlock default avatars (only for students)
  IF NOT is_teacher THEN
    INSERT INTO public.unlocked_avatars (user_id, avatar_id)
    SELECT NEW.id, id
    FROM public.avatar_options
    WHERE is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also create a function to manually upgrade existing accounts to admin
CREATE OR REPLACE FUNCTION upgrade_account_to_admin(user_email text)
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
  
  -- Update profile to remove grade
  UPDATE public.profiles
  SET grade = NULL
  WHERE user_id = target_user_id;
  
  -- Update role to admin
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Successfully upgraded user % to admin', user_email;
END;
$$;

-- Example usage (replace with actual teacher email):
-- SELECT upgrade_account_to_admin('teacher@example.com');