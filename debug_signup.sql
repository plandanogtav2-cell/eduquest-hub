-- Debug version to identify the error

-- First, let's disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simple debug trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_debug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Just log the user creation without doing anything
  RAISE NOTICE 'New user created: %', NEW.id;
  RAISE NOTICE 'User metadata: %', NEW.raw_user_meta_data;
  
  -- Try to insert just the basic profile
  BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'));
    RAISE NOTICE 'Profile inserted successfully';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile insert failed: %', SQLERRM;
  END;
  
  -- Try to insert the role
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
    RAISE NOTICE 'Role inserted successfully';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Role insert failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create the debug trigger
CREATE TRIGGER on_auth_user_created_debug
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_debug();

-- Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;