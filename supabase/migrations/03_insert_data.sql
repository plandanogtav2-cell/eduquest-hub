-- Insert avatar options
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('🎓', 'Scholar', 'from-blue-400 to-blue-600', 0),
('🌟', 'Star Student', 'from-yellow-400 to-yellow-600', 0),
('🚀', 'Rocket Learner', 'from-purple-400 to-purple-600', 0),
('🦁', 'Brave Lion', 'from-orange-400 to-orange-600', 0),
('🐉', 'Wise Dragon', 'from-red-400 to-red-600', 100),
('🦄', 'Magic Unicorn', 'from-pink-400 to-pink-600', 100),
('🐼', 'Panda Master', 'from-green-400 to-green-600', 200),
('🦊', 'Clever Fox', 'from-amber-400 to-amber-600', 200),
('🦉', 'Night Owl', 'from-indigo-400 to-indigo-600', 300),
('🐯', 'Tiger Champion', 'from-yellow-600 to-orange-600', 500),
('👑', 'Royal Scholar', 'from-yellow-500 to-yellow-700', 1000),
('💎', 'Diamond Mind', 'from-cyan-400 to-blue-600', 1500),
('🏆', 'Trophy Master', 'from-yellow-400 to-amber-600', 2000),
('⚡', 'Lightning Brain', 'from-yellow-300 to-yellow-500', 2500),
('🔥', 'Fire Genius', 'from-red-500 to-orange-600', 3000);

-- Insert achievements
INSERT INTO achievements (name, description, icon, badge_color, points_required) VALUES
('Shape Detective', 'Complete 3 Pattern Recognition levels', 'search', 'green', 150),
('Order Wizard', 'Complete 3 Sequencing levels', 'shuffle', 'green', 150),
('Mystery Solver', 'Complete 3 Deductive Reasoning levels', 'lightbulb', 'green', 150),
('Pattern Ninja', 'Complete Pattern Recognition Easy difficulty twice', 'eye', 'blue', 500),
('Flow Master', 'Complete Sequencing Easy difficulty twice', 'arrow-right', 'blue', 500),
('Clue Hunter', 'Complete Deductive Reasoning Easy difficulty twice', 'compass', 'blue', 500),
('Visual Genius', 'Complete Pattern Recognition Medium difficulty twice', 'glasses', 'purple', 1000),
('Chain Breaker', 'Complete Sequencing Medium difficulty twice', 'link', 'purple', 1000),
('Mind Reader', 'Complete Deductive Reasoning Medium difficulty twice', 'crystal-ball', 'purple', 1000),
('Pattern Overlord', 'Complete Pattern Recognition Hard difficulty twice', 'diamond', 'gold', 2000),
('Sequence God', 'Complete Sequencing Hard difficulty twice', 'infinity', 'gold', 2000),
('Logic Emperor', 'Complete Deductive Reasoning Hard difficulty twice', 'crown', 'gold', 2000),
('Triple Threat', 'Complete Easy difficulty in all 3 games', 'triangle', 'silver', 1500),
('Mastermind', 'Complete Hard difficulty in all 3 games', 'brain-circuit', 'gold', 6000),
('Point Collector', 'Earn 10000 total brain points', 'coins', 'gold', 10000);
