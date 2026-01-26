import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';

interface SequenceItem {
  id: string;
  content: string;
  correctOrder: number;
}

interface SequenceChallenge {
  id: string;
  items: SequenceItem[];
  instruction: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const Sequencing = () => {
  const navigate = useNavigate();
  const { playSound } = useSoundEffects();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userSequence, setUserSequence] = useState<SequenceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<SequenceItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<SequenceChallenge | null>(null);

  const generateChallenge = (level: number): SequenceChallenge => {
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    let itemCount = 3;
    
    if (level <= 10) {
      difficulty = 'easy';
      itemCount = 3;
    } else if (level <= 25) {
      difficulty = 'medium';
      itemCount = 4;
    } else {
      difficulty = 'hard';
      itemCount = 5;
    }

    const challenges = [
      // Size sequences
      {
        instruction: "Arrange from smallest to largest",
        items: ['🐭', '🐱', '🐕', '🐘', '🦣'].slice(0, itemCount)
      },
      // Time sequences
      {
        instruction: "Arrange in chronological order",
        items: ['🌅', '☀️', '🌇', '🌙', '⭐'].slice(0, itemCount)
      },
      // Growth sequences
      {
        instruction: "Arrange from seed to full grown",
        items: ['🌱', '🌿', '🌳', '🍎', '🍂'].slice(0, itemCount)
      },
      // Number sequences
      {
        instruction: "Arrange in ascending order",
        items: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].slice(0, itemCount)
      },
      // Life cycle
      {
        instruction: "Arrange in life cycle order",
        items: ['🥚', '🐣', '🐤', '🐓', '🍳'].slice(0, itemCount)
      }
    ];

    const selectedChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    const items: SequenceItem[] = selectedChallenge.items.map((content, index) => ({
      id: `item-${index}`,
      content,
      correctOrder: index
    }));

    // Shuffle items for user to arrange
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    return {
      id: `sequence-${level}`,
      items: shuffledItems,
      instruction: selectedChallenge.instruction,
      difficulty
    };
  };

  useEffect(() => {
    const challenge = generateChallenge(currentLevel);
    setCurrentChallenge(challenge);
    setAvailableItems([...challenge.items]);
    setUserSequence([]);
  }, [currentLevel]);

  const handleItemClick = (item: SequenceItem) => {
    if (showResult) return;

    if (availableItems.includes(item)) {
      // Move from available to user sequence
      setAvailableItems(availableItems.filter(i => i.id !== item.id));
      setUserSequence([...userSequence, item]);
    } else {
      // Move back to available items
      setUserSequence(userSequence.filter(i => i.id !== item.id));
      setAvailableItems([...availableItems, item]);
    }
  };

  const checkAnswer = () => {
    if (userSequence.length !== currentChallenge?.items.length) return;

    const correct = userSequence.every((item, index) => item.correctOrder === index);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSound('correct');
      setScore(score + (currentLevel * 15));
      setStreak(streak + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };

  const resetSequence = () => {
    if (!currentChallenge) return;
    setAvailableItems([...currentChallenge.items]);
    setUserSequence([]);
  };

  const handleNextLevel = () => {
    if (isCorrect) {
      setCurrentLevel(currentLevel + 1);
    }
    setShowResult(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentChallenge) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentChallenge.difficulty)}`}>
              {currentChallenge.difficulty.charAt(0).toUpperCase() + currentChallenge.difficulty.slice(1)}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{currentLevel}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">{currentChallenge.instruction}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* User Sequence Area */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Sequence:</h3>
              <div className="min-h-20 bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl p-4 flex items-center gap-4">
                {userSequence.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleItemClick(item)}
                    className="w-16 h-16 bg-white rounded-xl border-2 border-blue-300 text-3xl hover:scale-105 transition-transform"
                  >
                    {item.content}
                  </motion.button>
                ))}
                {userSequence.length === 0 && (
                  <div className="text-muted-foreground text-center w-full">
                    Click items below to arrange them in order
                  </div>
                )}
              </div>
            </div>

            {/* Available Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Available Items:</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {availableItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemClick(item)}
                    className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-gray-300 text-3xl hover:border-primary transition-colors"
                  >
                    {item.content}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetSequence}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={checkAnswer}
                disabled={userSequence.length !== currentChallenge.items.length || showResult}
              >
                Check Answer
              </Button>
            </div>

            {/* Result Message */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8"
              >
                <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Perfect Order!' : '❌ Try Again!'}
                </div>
                <Button onClick={handleNextLevel} size="lg">
                  {isCorrect ? 'Next Level' : 'Try Again'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Read the instruction carefully</li>
              <li>• Click on items to move them to your sequence</li>
              <li>• Arrange items in the correct logical order</li>
              <li>• Click "Check Answer" when you're ready</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sequencing;