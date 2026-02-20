-- Debug queries to check data

-- 1. Check all profiles with grades
SELECT p.user_id, p.full_name, p.grade, ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.grade IS NOT NULL
ORDER BY p.full_name;

-- 2. Check game sessions
SELECT user_id, COUNT(*) as session_count, SUM(score) as total_points
FROM game_sessions
GROUP BY user_id;

-- 3. Test the function directly
SELECT * FROM get_leaderboard('4', NULL);

-- 4. Check if students have role entries
SELECT COUNT(*) as students_without_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.grade IS NOT NULL AND ur.role IS NULL;

-- 5. Check all user roles
SELECT role, COUNT(*) as count
FROM user_roles
GROUP BY role;
