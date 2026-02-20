# Avatar Rarity System Implementation Guide

## Overview
Added a premium avatar system with 3 rarity tiers and high point requirements to make avatars challenging to unlock.

## Rarity Tiers

### 🆓 Free (0 points)
- Basic starter avatars
- Available to all players immediately

### ⭐ Normal (1-300 points)
- Low-cost avatars
- Easy to unlock with basic gameplay
- Examples: Happy Student, Smart Cookie, Brain Power

### 💜 Epic (500-1,500 points)
- Medium-high cost avatars
- Requires significant gameplay
- Examples: Rainbow Genius, Game Master, Rock Star

### 👑 Legendary (2,000+ points)
- Very high cost avatars (up to 10,000 points!)
- Extremely challenging to unlock
- Examples: Super Hero, Wizard Master, Cosmic Brain (10,000 pts)

## Database Changes

### Step 1: Run SQL Migration
Go to Supabase Dashboard → SQL Editor and run:

```sql
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
```

## Features Added

### 1. Rarity Badges
- Each avatar displays its rarity tier with color-coded badges
- Free: Gray
- Normal: Blue
- Epic: Purple
- Legendary: Gold gradient

### 2. Rarity Filter
- Filter avatars by rarity tier
- Quick access to see what's available in each tier

### 3. Visual Enhancements
- Border colors match rarity
- Hover effects scale up unlocked avatars
- Gradient buttons for unlock actions based on rarity

### 4. Point Requirements
- Normal: 50-300 points (achievable in a few games)
- Epic: 500-1,500 points (requires consistent play)
- Legendary: 2,000-10,000 points (very challenging!)

## How Points Are Earned

Students earn points by:
- Completing game levels (10 points × level number)
- Maintaining streaks (bonus points)
- Completing all 10 levels of a difficulty
- Playing daily challenges

Example: Completing all 10 levels of Easy mode = ~550 points
To unlock "Cosmic Brain" (10,000 pts) = Complete ~18 full game difficulties!

## Testing

1. Log in as a student
2. Navigate to Profile → Avatar Selection
3. See the new avatars with rarity badges
4. Use the rarity filter buttons
5. Try unlocking avatars (if you have enough points)

## Notes

- The system uses `points_required` field (not `points_cost`)
- Points are calculated from `game_sessions` table
- Unlocked avatars are stored in `unlocked_avatars` table
- Selected avatar is stored in `profiles.selected_avatar_id`
