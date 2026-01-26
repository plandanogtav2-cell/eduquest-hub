-- Ultra simple trigger that should work

-- Create the simplest possible trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert basic profile first
  INSERT INTO public.profiles (user_id, full_name, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    CASE 
      WHEN (NEW.raw_user_meta_data ->> 'is_teacher')::boolean = true THEN NULL
      ELSE COALESCE(NEW.raw_user_meta_data ->> 'grade', '4')
    END
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (NEW.raw_user_meta_data ->> 'is_teacher')::boolean = true THEN 'admin'
      ELSE 'student'
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete();