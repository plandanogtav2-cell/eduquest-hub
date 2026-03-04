-- Create deductive_reasoning_rounds table to store unique deductive reasoning game rounds
CREATE TABLE IF NOT EXISTS deductive_reasoning_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  level INTEGER NOT NULL,
  clues JSONB NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(difficulty, level)
);

-- Insert 5 unique easy deductive reasoning rounds
INSERT INTO deductive_reasoning_rounds (difficulty, level, clues, question, options, correct_answer) VALUES
('easy', 1, '["🐱 The cat is smaller than the dog", "🐕 The dog is smaller than the horse"]', 'Which is the largest?', '["Cat", "Dog", "Horse", "All same"]', 'Horse'),
('easy', 2, '["🔴 Red comes before Blue", "🔵 Blue comes before Green"]', 'What is the first color?', '["Red", "Blue", "Green", "Yellow"]', 'Red'),
('easy', 3, '["☀️ It is sunny outside", "🌡️ When sunny, it is warm"]', 'What is the temperature?', '["Cold", "Warm", "Hot", "Freezing"]', 'Warm'),
('easy', 4, '["🍎 All apples are fruits", "🍇 This is an apple"]', 'What is this?', '["Vegetable", "Fruit", "Meat", "Grain"]', 'Fruit'),
('easy', 5, '["🐦 Birds can fly", "🦅 Eagle is a bird"]', 'Can eagle fly?', '["Yes", "No", "Maybe", "Unknown"]', 'Yes');

-- Insert 5 unique medium deductive reasoning rounds
INSERT INTO deductive_reasoning_rounds (difficulty, level, clues, question, options, correct_answer) VALUES
('medium', 1, '["🏃 Tom runs faster than Jerry", "🚶 Jerry walks faster than Mike", "🏃 Running is faster than walking"]', 'Who is the fastest?', '["Tom", "Jerry", "Mike", "All same"]', 'Tom'),
('medium', 2, '["📚 Math class is before Science", "🔬 Science is before Lunch", "🍽️ Lunch is at 12pm"]', 'When is Math class?', '["After 12pm", "Before 12pm", "At 12pm", "No class"]', 'Before 12pm'),
('medium', 3, '["🌳 Trees need water", "💧 It rained yesterday", "🌱 The tree got water"]', 'What happened?', '["Tree died", "Tree grew", "No change", "Tree moved"]', 'Tree grew'),
('medium', 4, '["🎨 Artists paint pictures", "🖼️ Sarah painted a picture", "👩 Sarah is creative"]', 'What is Sarah?', '["Scientist", "Artist", "Teacher", "Doctor"]', 'Artist'),
('medium', 5, '["🌙 Night comes after day", "☀️ It is daytime now", "⏰ 6 hours will pass"]', 'What time will it be?', '["Morning", "Afternoon", "Evening", "Night"]', 'Night');

-- Insert 5 unique hard deductive reasoning rounds
INSERT INTO deductive_reasoning_rounds (difficulty, level, clues, question, options, correct_answer) VALUES
('hard', 1, '["🏠 House A is taller than House B", "🏢 House B is taller than House C", "🏛️ House C is taller than House D", "🏗️ House D is the shortest"]', 'Which house is tallest?', '["House A", "House B", "House C", "House D"]', 'House A'),
('hard', 2, '["🎵 Music class is not first", "🎨 Art is before Music", "📚 Reading is after Music", "⚽ PE is last"]', 'What is the first class?', '["Music", "Art", "Reading", "PE"]', 'Art'),
('hard', 3, '["🔴 Red box has toys", "🔵 Blue box is heavier than Red", "🟢 Green box is lighter than Blue", "⚫ Black box is empty"]', 'Which box is heaviest?', '["Red", "Blue", "Green", "Black"]', 'Blue'),
('hard', 4, '["👨 John is older than Mary", "👩 Mary is older than Tom", "👦 Tom is older than Lisa", "👧 Lisa is 10 years old"]', 'Who is the oldest?', '["John", "Mary", "Tom", "Lisa"]', 'John'),
('hard', 5, '["🌍 Earth is larger than Moon", "☀️ Sun is larger than Earth", "🪐 Jupiter is larger than Earth", "🌟 Sun is larger than Jupiter"]', 'What is the largest?', '["Earth", "Moon", "Jupiter", "Sun"]', 'Sun');