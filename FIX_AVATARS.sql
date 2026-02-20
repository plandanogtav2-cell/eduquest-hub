-- ============================================
-- COMPLETE AVATAR SYSTEM FIX
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Create unlocked_avatars table if it doesn't exist
CREATE TABLE IF NOT EXISTS unlocked_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatar_options(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_unlocked_avatars_user_id ON unlocked_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_avatars_avatar_id ON unlocked_avatars(avatar_id);

ALTER TABLE unlocked_avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own unlocked avatars" ON unlocked_avatars;
CREATE POLICY "Users can view own unlocked avatars" 
ON unlocked_avatars FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlock avatars" ON unlocked_avatars;
CREATE POLICY "Users can unlock avatars" 
ON unlocked_avatars FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Step 2: Clear existing avatars (optional - comment out if you want to keep old ones)
-- DELETE FROM avatar_options;

-- Step 3: Insert all avatars with correct column name (points_required)
-- FREE TIER
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('😊', 'Happy Student', 'from-yellow-300 to-yellow-500', 0),
('🤓', 'Smart Cookie', 'from-blue-300 to-blue-500', 0),
('🎓', 'Scholar', 'from-blue-400 to-blue-600', 0),
('🌟', 'Star Student', 'from-yellow-400 to-yellow-600', 0)
ON CONFLICT DO NOTHING;

-- NORMAL TIER (50-300 points)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('😎', 'Cool Scholar', 'from-gray-400 to-gray-600', 50),
('🥳', 'Party Brain', 'from-pink-300 to-purple-400', 100),
('🤩', 'Star Eyes', 'from-yellow-400 to-orange-400', 150),
('🧠', 'Brain Power', 'from-pink-400 to-purple-500', 200),
('💪', 'Strong Mind', 'from-red-400 to-orange-500', 250),
('🎯', 'Target Master', 'from-red-500 to-pink-500', 300)
ON CONFLICT DO NOTHING;

-- EPIC TIER (500-1500 points)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('🌈', 'Rainbow Genius', 'from-purple-400 via-pink-400 to-yellow-400', 500),
('✨', 'Sparkle Mind', 'from-yellow-300 via-pink-300 to-purple-400', 600),
('🎨', 'Creative Thinker', 'from-blue-400 via-purple-400 to-pink-400', 700),
('🎭', 'Drama Master', 'from-purple-500 to-pink-600', 800),
('🎪', 'Circus Brain', 'from-red-400 via-yellow-400 to-blue-400', 900),
('🎬', 'Movie Star', 'from-gray-700 to-yellow-500', 1000),
('🎮', 'Game Master', 'from-blue-500 to-purple-600', 1200),
('🎸', 'Rock Star', 'from-red-500 to-purple-600', 1500)
ON CONFLICT DO NOTHING;

-- LEGENDARY TIER (2000+ points)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('👾', 'Alien Genius', 'from-green-400 via-blue-500 to-purple-600', 2000),
('🤖', 'Robot Brain', 'from-gray-500 via-blue-500 to-cyan-500', 2500),
('🦸', 'Super Hero', 'from-red-500 via-yellow-500 to-blue-600', 3000),
('🧙', 'Wizard Master', 'from-purple-600 via-blue-600 to-indigo-700', 3500),
('🧛', 'Night Scholar', 'from-red-700 via-purple-700 to-black', 4000),
('🧚', 'Fairy Brain', 'from-pink-400 via-purple-400 to-blue-500', 4500),
('🦹', 'Ultimate Hero', 'from-yellow-500 via-orange-600 to-red-700', 5000),
('👽', 'Space Mind', 'from-green-500 via-cyan-500 to-blue-600', 6000),
('💎', 'Diamond Mind', 'from-cyan-400 to-blue-600', 7000),
('🏆', 'Trophy Master', 'from-yellow-400 to-amber-600', 8000),
('⚡', 'Lightning Brain', 'from-yellow-300 to-yellow-500', 9000),
('💫', 'Cosmic Brain', 'from-purple-600 via-pink-600 to-yellow-500', 10000)
ON CONFLICT DO NOTHING;

-- Step 4: Verify the data
SELECT COUNT(*) as total_avatars FROM avatar_options;
SELECT 
  CASE 
    WHEN points_required = 0 THEN 'Free'
    WHEN points_required <= 300 THEN 'Normal'
    WHEN points_required <= 1500 THEN 'Epic'
    ELSE 'Legendary'
  END as rarity,
  COUNT(*) as count
FROM avatar_options
GROUP BY rarity
ORDER BY MIN(points_required);
