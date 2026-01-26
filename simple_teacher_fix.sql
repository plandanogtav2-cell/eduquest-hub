-- Simplified fix for teacher signup

-- Update the trigger function to handle teachers without avatars
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
    default_avatar_id := NULL;  -- Teachers don't need avatars
  ELSE
    user_grade := COALESCE((NEW.raw_user_meta_data ->> 'grade')::grade_level, '4');
    user_role := 'student';  -- Students get student role
    
    -- Get first default avatar for students
    SELECT id INTO default_avatar_id 
    FROM public.avatar_options 
    WHERE is_default = true 
    LIMIT 1;
  END IF;
  
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
  IF NOT is_teacher AND default_avatar_id IS NOT NULL THEN
    INSERT INTO public.unlocked_avatars (user_id, avatar_id)
    SELECT NEW.id, id
    FROM public.avatar_options
    WHERE is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;