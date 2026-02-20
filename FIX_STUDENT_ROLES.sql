-- Ensure all students have a role entry in user_roles table
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'student'::user_role_type
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.grade IS NOT NULL 
  AND ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verify the fix
SELECT COUNT(*) as students_with_role
FROM profiles p
INNER JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.grade IS NOT NULL AND ur.role = 'student';

-- Test leaderboard again
SELECT * FROM get_leaderboard('4', NULL);
