-- Add more premium avatars with higher point requirements
-- Organized by rarity: Normal (0-300), Epic (500-1500), Legendary (2000+)

-- NORMAL TIER (Free & Low Cost)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('😊', 'Happy Student', 'from-yellow-300 to-yellow-500', 0),
('🤓', 'Smart Cookie', 'from-blue-300 to-blue-500', 0),
('😎', 'Cool Scholar', 'from-gray-400 to-gray-600', 50),
('🥳', 'Party Brain', 'from-pink-300 to-purple-400', 100),
('🤩', 'Star Eyes', 'from-yellow-400 to-orange-400', 150),
('🧠', 'Brain Power', 'from-pink-400 to-purple-500', 200),
('💪', 'Strong Mind', 'from-red-400 to-orange-500', 250),
('🎯', 'Target Master', 'from-red-500 to-pink-500', 300);

-- EPIC TIER (Medium-High Cost)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('🌈', 'Rainbow Genius', 'from-purple-400 via-pink-400 to-yellow-400', 500),
('✨', 'Sparkle Mind', 'from-yellow-300 via-pink-300 to-purple-400', 600),
('🎨', 'Creative Thinker', 'from-blue-400 via-purple-400 to-pink-400', 700),
('🎭', 'Drama Master', 'from-purple-500 to-pink-600', 800),
('🎪', 'Circus Brain', 'from-red-400 via-yellow-400 to-blue-400', 900),
('🎬', 'Movie Star', 'from-gray-700 to-yellow-500', 1000),
('🎮', 'Game Master', 'from-blue-500 to-purple-600', 1200),
('🎸', 'Rock Star', 'from-red-500 to-purple-600', 1500);

-- LEGENDARY TIER (Very High Cost)
INSERT INTO avatar_options (emoji, name, color_scheme, points_required) VALUES
('👾', 'Alien Genius', 'from-green-400 via-blue-500 to-purple-600', 2000),
('🤖', 'Robot Brain', 'from-gray-500 via-blue-500 to-cyan-500', 2500),
('🦸', 'Super Hero', 'from-red-500 via-yellow-500 to-blue-600', 3000),
('🧙', 'Wizard Master', 'from-purple-600 via-blue-600 to-indigo-700', 3500),
('🧛', 'Night Scholar', 'from-red-700 via-purple-700 to-black', 4000),
('🧚', 'Fairy Brain', 'from-pink-400 via-purple-400 to-blue-500', 4500),
('🦹', 'Ultimate Hero', 'from-yellow-500 via-orange-600 to-red-700', 5000),
('👽', 'Space Mind', 'from-green-500 via-cyan-500 to-blue-600', 6000),
('🌟', 'Legendary Star', 'from-yellow-400 via-orange-500 to-red-600', 8000),
('💫', 'Cosmic Brain', 'from-purple-600 via-pink-600 to-yellow-500', 10000);
