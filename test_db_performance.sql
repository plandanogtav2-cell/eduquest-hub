-- Simple test to check database performance
SELECT COUNT(*) as quiz_count FROM public.quizzes WHERE is_active = true;
SELECT COUNT(*) as profile_count FROM public.profiles;
SELECT COUNT(*) as attempt_count FROM public.quiz_attempts;