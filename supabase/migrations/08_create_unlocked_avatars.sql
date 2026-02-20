-- Create unlocked_avatars table to track which avatars users have unlocked
CREATE TABLE IF NOT EXISTS unlocked_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatar_options(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, avatar_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_unlocked_avatars_user_id ON unlocked_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_avatars_avatar_id ON unlocked_avatars(avatar_id);

-- Enable RLS
ALTER TABLE unlocked_avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own unlocked avatars" 
ON unlocked_avatars FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock avatars" 
ON unlocked_avatars FOR INSERT 
WITH CHECK (auth.uid() = user_id);
