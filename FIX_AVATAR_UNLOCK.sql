-- ============================================
-- FIX AVATAR UNLOCKING SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop and recreate unlocked_avatars table
DROP TABLE IF EXISTS unlocked_avatars CASCADE;

CREATE TABLE unlocked_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatar_options(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, avatar_id)
);

-- Step 2: Create indexes
CREATE INDEX idx_unlocked_avatars_user_id ON unlocked_avatars(user_id);
CREATE INDEX idx_unlocked_avatars_avatar_id ON unlocked_avatars(avatar_id);

-- Step 3: Enable RLS
ALTER TABLE unlocked_avatars ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view own unlocked avatars" 
ON unlocked_avatars FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock avatars" 
ON unlocked_avatars FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Step 5: Grant permissions
GRANT ALL ON unlocked_avatars TO authenticated;

-- Step 6: Verify the setup
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'unlocked_avatars';
