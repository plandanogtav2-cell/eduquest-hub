-- Clear ALL existing achievements and insert ONLY brain training ones
DELETE FROM user_achievements;
DELETE FROM achievements;

-- Brain Training Game Achievements (Clean slate)
INSERT INTO achievements (name, description, icon, badge_color, points_required) VALUES
-- First time playing each game (requires completing 3 levels)
('Pattern Pioneer', 'Complete 3 Pattern Recognition levels', 'target', 'bronze', 150),
('Sequence Starter', 'Complete 3 Sequencing levels', 'zap', 'bronze', 150),
('Logic Learner', 'Complete 3 Deductive Reasoning levels', 'brain', 'bronze', 150),

-- Complete easy difficulty twice (requires 2 full completions)
('Pattern Easy Master', 'Complete Pattern Recognition Easy difficulty twice', 'target', 'green', 500),
('Sequence Easy Master', 'Complete Sequencing Easy difficulty twice', 'zap', 'green', 500),
('Logic Easy Master', 'Complete Deductive Reasoning Easy difficulty twice', 'brain', 'green', 500),

-- Complete medium difficulty twice
('Pattern Medium Master', 'Complete Pattern Recognition Medium difficulty twice', 'target', 'blue', 1000),
('Sequence Medium Master', 'Complete Sequencing Medium difficulty twice', 'zap', 'blue', 1000),
('Logic Medium Master', 'Complete Deductive Reasoning Medium difficulty twice', 'brain', 'blue', 1000),

-- Complete hard difficulty twice
('Pattern Hard Master', 'Complete Pattern Recognition Hard difficulty twice', 'target', 'purple', 2000),
('Sequence Hard Master', 'Complete Sequencing Hard difficulty twice', 'zap', 'purple', 2000),
('Logic Hard Master', 'Complete Deductive Reasoning Hard difficulty twice', 'brain', 'purple', 2000),

-- Ultimate achievements (much harder requirements)
('Triple Game Master', 'Complete Easy difficulty in all 3 games', 'crown', 'gold', 1500),
('Perfect Mind', 'Complete Hard difficulty in all 3 games', 'star', 'gold', 6000),
('Brain Champion', 'Earn 10000 total brain points', 'trophy', 'gold', 10000);