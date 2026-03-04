-- Create sequencing_rounds table to store unique sequencing game rounds
CREATE TABLE IF NOT EXISTS sequencing_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  level INTEGER NOT NULL,
  items JSONB NOT NULL,
  correct_order JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(difficulty, level)
);

-- Insert 5 unique easy sequencing rounds
INSERT INTO sequencing_rounds (difficulty, level, items, correct_order) VALUES
('easy', 1, '["🌱 Seed", "🌿 Sprout", "🌳 Tree"]', '[0, 1, 2]'),
('easy', 2, '["🥚 Egg", "🐣 Chick", "🐔 Chicken"]', '[0, 1, 2]'),
('easy', 3, '["☀️ Morning", "🌤️ Afternoon", "🌙 Night"]', '[0, 1, 2]'),
('easy', 4, '["👶 Baby", "🧒 Child", "👨 Adult"]', '[0, 1, 2]'),
('easy', 5, '["🍎 Pick Apple", "🥧 Bake Pie", "🍽️ Eat Pie"]', '[0, 1, 2]');

-- Insert 5 unique medium sequencing rounds
INSERT INTO sequencing_rounds (difficulty, level, items, correct_order) VALUES
('medium', 1, '["📖 Read Recipe", "🛒 Buy Ingredients", "👨‍🍳 Cook", "🍽️ Serve"]', '[0, 1, 2, 3]'),
('medium', 2, '["🌧️ Rain Falls", "💧 Water Collects", "☁️ Evaporates", "🌧️ Rain Again"]', '[0, 1, 2, 3]'),
('medium', 3, '["🌱 Plant Seed", "💧 Water Daily", "☀️ Gets Sunlight", "🌻 Flower Blooms"]', '[0, 1, 2, 3]'),
('medium', 4, '["📝 Write Story", "✏️ Edit Draft", "📄 Print", "📚 Publish"]', '[0, 1, 2, 3]'),
('medium', 5, '["🏗️ Build Foundation", "🧱 Build Walls", "🏠 Add Roof", "🎨 Paint House"]', '[0, 1, 2, 3]');

-- Insert 5 unique hard sequencing rounds
INSERT INTO sequencing_rounds (difficulty, level, items, correct_order) VALUES
('hard', 1, '["🔬 Research", "💡 Design", "🛠️ Build Prototype", "🧪 Test", "🚀 Launch"]', '[0, 1, 2, 3, 4]'),
('hard', 2, '["📚 Study", "📝 Take Notes", "🤔 Review", "✍️ Practice", "📊 Take Exam"]', '[0, 1, 2, 3, 4]'),
('hard', 3, '["🌾 Harvest Wheat", "🏭 Mill Flour", "🥖 Bake Bread", "🚚 Deliver", "🛒 Sell"]', '[0, 1, 2, 3, 4]'),
('hard', 4, '["☁️ Water Evaporates", "☁️ Forms Clouds", "🌧️ Rain Falls", "🌊 Flows to Ocean", "☁️ Cycle Repeats"]', '[0, 1, 2, 3, 4]'),
('hard', 5, '["🎬 Write Script", "🎥 Film Scenes", "✂️ Edit Video", "🎵 Add Music", "🎞️ Release Movie"]', '[0, 1, 2, 3, 4]');