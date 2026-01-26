-- Check what was created for the teacher account
-- Replace with the actual teacher email you used

-- 1. Check if user exists in auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'REPLACE_WITH_TEACHER_EMAIL';

-- 2. Check profile
SELECT * FROM public.profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_TEACHER_EMAIL');

-- 3. Check role
SELECT * FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_TEACHER_EMAIL');

-- 4. If role is wrong, fix it manually
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_TEACHER_EMAIL');

-- 5. If grade is wrong, fix it manually
UPDATE public.profiles 
SET grade = NULL 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_TEACHER_EMAIL');