-- Fix leaderboard function with proper type casting
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_grade TEXT DEFAULT NULL,
  p_game_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  grade TEXT,
  avatar_emoji TEXT,
  avatar_color TEXT,
  total_points BIGINT,
  total_games BIGINT,
  average_score NUMERIC,
  rank_position BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.grade::TEXT,
    ao.emoji as avatar_emoji,
    ao.color_scheme as avatar_color,
    COALESCE(SUM(gs.score), 0)::BIGINT as total_points,
    COUNT(gs.id)::BIGINT as total_games,
    COALESCE(AVG(gs.score), 0)::NUMERIC as average_score,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(gs.score), 0) DESC, COUNT(gs.id) DESC)::BIGINT as rank_position
  FROM profiles p
  LEFT JOIN game_sessions gs ON p.user_id = gs.user_id 
    AND (p_game_type IS NULL OR gs.game_type = p_game_type OR gs.game_type = 'enhanced-' || p_game_type)
  LEFT JOIN avatar_options ao ON p.selected_avatar_id = ao.id
  LEFT JOIN user_roles ur ON p.user_id = ur.user_id
  WHERE (p_grade IS NULL OR p.grade::TEXT = p_grade)
    AND (ur.role IS NULL OR ur.role NOT IN ('admin', 'super_admin'))
  GROUP BY p.user_id, p.full_name, p.grade, ao.emoji, ao.color_scheme
  ORDER BY total_points DESC, total_games DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard TO anon;
