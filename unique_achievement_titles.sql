-- Update achievements with unique fun titles and different icons
-- Run this after update_achievements_harder.sql

-- Update starter achievements with fun titles and unique icons
UPDATE achievements SET 
  name = 'Shape Detective',
  description = 'Complete 3 Pattern Recognition levels',
  icon = 'search',
  points_required = 150
WHERE name = 'Pattern Pioneer';

UPDATE achievements SET 
  name = 'Order Wizard',
  description = 'Complete 3 Sequencing levels', 
  icon = 'shuffle',
  points_required = 150
WHERE name = 'Sequence Starter';

UPDATE achievements SET 
  name = 'Mystery Solver',
  description = 'Complete 3 Deductive Reasoning levels',
  icon = 'lightbulb',
  points_required = 150
WHERE name = 'Logic Learner';

-- Update easy masters with creative titles
UPDATE achievements SET 
  name = 'Pattern Ninja',
  description = 'Complete Pattern Recognition Easy difficulty twice',
  icon = 'eye',
  points_required = 500
WHERE name = 'Pattern Easy Master';

UPDATE achievements SET 
  name = 'Flow Master',
  description = 'Complete Sequencing Easy difficulty twice',
  icon = 'arrow-right',
  points_required = 500
WHERE name = 'Sequence Easy Master';

UPDATE achievements SET 
  name = 'Clue Hunter',
  description = 'Complete Deductive Reasoning Easy difficulty twice',
  icon = 'compass',
  points_required = 500
WHERE name = 'Logic Easy Master';

-- Update medium masters
UPDATE achievements SET 
  name = 'Visual Genius',
  description = 'Complete Pattern Recognition Medium difficulty twice',
  icon = 'glasses',
  points_required = 1000
WHERE name = 'Pattern Medium Master';

UPDATE achievements SET 
  name = 'Chain Breaker',
  description = 'Complete Sequencing Medium difficulty twice',
  icon = 'link',
  points_required = 1000
WHERE name = 'Sequence Medium Master';

UPDATE achievements SET 
  name = 'Mind Reader',
  description = 'Complete Deductive Reasoning Medium difficulty twice',
  icon = 'crystal-ball',
  points_required = 1000
WHERE name = 'Logic Medium Master';

-- Update hard masters
UPDATE achievements SET 
  name = 'Pattern Overlord',
  description = 'Complete Pattern Recognition Hard difficulty twice',
  icon = 'diamond',
  points_required = 2000
WHERE name = 'Pattern Hard Master';

UPDATE achievements SET 
  name = 'Sequence God',
  description = 'Complete Sequencing Hard difficulty twice',
  icon = 'infinity',
  points_required = 2000
WHERE name = 'Sequence Hard Master';

UPDATE achievements SET 
  name = 'Logic Emperor',
  description = 'Complete Deductive Reasoning Hard difficulty twice',
  icon = 'crown',
  points_required = 2000
WHERE name = 'Logic Hard Master';

-- Update ultimate achievements
UPDATE achievements SET 
  name = 'Triple Threat',
  description = 'Complete Easy difficulty in all 3 games',
  icon = 'triangle',
  points_required = 1500
WHERE name = 'Triple Game Master';

UPDATE achievements SET 
  name = 'Mastermind',
  description = 'Complete Hard difficulty in all 3 games',
  icon = 'brain-circuit',
  points_required = 6000
WHERE name = 'Perfect Mind';

UPDATE achievements SET 
  name = 'Point Collector',
  description = 'Earn 10000 total brain points',
  icon = 'coins',
  points_required = 10000
WHERE name = 'Brain Champion';