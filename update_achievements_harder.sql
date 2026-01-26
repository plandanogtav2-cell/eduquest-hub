-- Update existing achievements to be harder to earn
-- Run this ONLY if you already ran brain_training_achievements.sql

-- Update starter achievements
UPDATE achievements SET 
  description = 'Complete 3 Pattern Recognition levels',
  points_required = 150
WHERE name = 'Pattern Pioneer';

UPDATE achievements SET 
  description = 'Complete 3 Sequencing levels',
  points_required = 150
WHERE name = 'Sequence Starter';

UPDATE achievements SET 
  description = 'Complete 3 Deductive Reasoning levels',
  points_required = 150
WHERE name = 'Logic Learner';

-- Update easy masters
UPDATE achievements SET 
  description = 'Complete Pattern Recognition Easy difficulty twice',
  points_required = 500
WHERE name = 'Pattern Easy Master';

UPDATE achievements SET 
  description = 'Complete Sequencing Easy difficulty twice',
  points_required = 500
WHERE name = 'Sequence Easy Master';

UPDATE achievements SET 
  description = 'Complete Deductive Reasoning Easy difficulty twice',
  points_required = 500
WHERE name = 'Logic Easy Master';

-- Update medium masters
UPDATE achievements SET 
  description = 'Complete Pattern Recognition Medium difficulty twice',
  points_required = 1000
WHERE name = 'Pattern Medium Master';

UPDATE achievements SET 
  description = 'Complete Sequencing Medium difficulty twice',
  points_required = 1000
WHERE name = 'Sequence Medium Master';

UPDATE achievements SET 
  description = 'Complete Deductive Reasoning Medium difficulty twice',
  points_required = 1000
WHERE name = 'Logic Medium Master';

-- Update hard masters
UPDATE achievements SET 
  description = 'Complete Pattern Recognition Hard difficulty twice',
  points_required = 2000
WHERE name = 'Pattern Hard Master';

UPDATE achievements SET 
  description = 'Complete Sequencing Hard difficulty twice',
  points_required = 2000
WHERE name = 'Sequence Hard Master';

UPDATE achievements SET 
  description = 'Complete Deductive Reasoning Hard difficulty twice',
  points_required = 2000
WHERE name = 'Logic Hard Master';

-- Update ultimate achievements
UPDATE achievements SET 
  description = 'Complete Easy difficulty in all 3 games',
  points_required = 1500
WHERE name = 'Triple Game Master';

UPDATE achievements SET 
  description = 'Complete Hard difficulty in all 3 games',
  points_required = 6000
WHERE name = 'Perfect Mind';

UPDATE achievements SET 
  points_required = 10000
WHERE name = 'Brain Champion';