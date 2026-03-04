-- Create pattern_rounds table to store unique pattern game rounds
CREATE TABLE IF NOT EXISTS pattern_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  level INTEGER NOT NULL,
  sequence JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(difficulty, level)
);

-- Insert 5 unique easy patterns
INSERT INTO pattern_rounds (difficulty, level, sequence, correct_answer, options) VALUES
('easy', 1, '["🔴", "🔵", "🔴"]', '🔵', '["🔵", "🔴", "🟡", "🟢"]'),
('easy', 2, '["⭐", "❤️", "⭐"]', '❤️', '["❤️", "⭐", "💎", "🔥"]'),
('easy', 3, '["🐶", "🐱", "🐶"]', '🐱', '["🐱", "🐶", "🐭", "🐹"]'),
('easy', 4, '["🌙", "☀️", "🌙"]', '☀️', '["☀️", "🌙", "⭐", "🌟"]'),
('easy', 5, '["🍎", "🍊", "🍎"]', '🍊', '["🍊", "🍎", "🍋", "🍇"]');

-- Insert 10 unique medium patterns
INSERT INTO pattern_rounds (difficulty, level, sequence, correct_answer, options) VALUES
('medium', 1, '["🔴", "🔵", "🟡", "🔴", "🔵"]', '🟡', '["🟡", "🔴", "🔵", "🟢"]'),
('medium', 2, '["⭐", "❤️", "💎", "⭐", "❤️"]', '💎', '["💎", "⭐", "❤️", "🔥"]'),
('medium', 3, '["🐶", "🐱", "🐭", "🐶", "🐱"]', '🐭', '["🐭", "🐶", "🐱", "🐹"]'),
('medium', 4, '["🔵", "🔵", "🟡", "🔵", "🔵"]', '🟡', '["🟡", "🔵", "🔴", "🟢"]'),
('medium', 5, '["🌟", "⚡", "🔥", "🌟", "⚡"]', '🔥', '["🔥", "🌟", "⚡", "💎"]'),
('medium', 6, '["🍎", "🍊", "🍋", "🍎", "🍊"]', '🍋', '["🍋", "🍎", "🍊", "🍇"]'),
('medium', 7, '["🌙", "☀️", "⭐", "🌙", "☀️"]', '⭐', '["⭐", "🌙", "☀️", "🌟"]'),
('medium', 8, '["💎", "💎", "⭐", "💎", "💎"]', '⭐', '["⭐", "💎", "❤️", "🔥"]'),
('medium', 9, '["🐭", "🐹", "🐰", "🐭", "🐹"]', '🐰', '["🐰", "🐭", "🐹", "🐶"]'),
('medium', 10, '["🔥", "⚡", "💎", "🔥", "⚡"]', '💎', '["💎", "🔥", "⚡", "🌟"]');

-- Insert 10 unique hard patterns
INSERT INTO pattern_rounds (difficulty, level, sequence, correct_answer, options) VALUES
('hard', 1, '["🔴", "🔵", "🟡", "🟢", "🔴", "🔵"]', '🟡', '["🟡", "🔴", "🔵", "🟢"]'),
('hard', 2, '["⭐", "❤️", "💎", "🔥", "⭐", "❤️"]', '💎', '["💎", "⭐", "❤️", "🔥"]'),
('hard', 3, '["🐶", "🐱", "🐭", "🐹", "🐶", "🐱"]', '🐭', '["🐭", "🐶", "🐱", "🐹"]'),
('hard', 4, '["🔵", "🔵", "🟡", "🔴", "🔵", "🔵"]', '🟡', '["🟡", "🔵", "🔴", "🟢"]'),
('hard', 5, '["🌟", "⚡", "💎", "🔥", "🌟", "⚡"]', '💎', '["💎", "🌟", "⚡", "🔥"]'),
('hard', 6, '["🍎", "🍊", "🍋", "🍇", "🍎", "🍊"]', '🍋', '["🍋", "🍎", "🍊", "🍇"]'),
('hard', 7, '["🌙", "☀️", "⭐", "🌟", "🌙", "☀️"]', '⭐', '["⭐", "🌙", "☀️", "🌟"]'),
('hard', 8, '["💎", "🔥", "⭐", "❤️", "💎", "🔥"]', '⭐', '["⭐", "💎", "🔥", "❤️"]'),
('hard', 9, '["🐭", "🐹", "🐰", "🐻", "🐭", "🐹"]', '🐰', '["🐰", "🐭", "🐹", "🐻"]'),
('hard', 10, '["🔥", "⚡", "💎", "🌟", "🔥", "⚡"]', '💎', '["💎", "🔥", "⚡", "🌟"]');