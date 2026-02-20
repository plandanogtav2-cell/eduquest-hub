-- Create custom types
CREATE TYPE grade_level AS ENUM ('4', '5', '6');
CREATE TYPE user_role_type AS ENUM ('student', 'admin', 'super_admin');

-- Avatar options table
CREATE TABLE avatar_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT NOT NULL,
  name TEXT NOT NULL,
  color_scheme TEXT NOT NULL,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  grade grade_level NOT NULL DEFAULT '4',
  selected_avatar_id UUID REFERENCES avatar_options(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  grade TEXT NOT NULL,
  level_reached INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_color TEXT NOT NULL DEFAULT 'blue',
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own game sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game sessions" ON game_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (true);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view avatars" ON avatar_options FOR SELECT USING (true);
