import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, RotateCcw, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface SequenceItem {
  id: string;
  content: string;
  emoji: string;
  correctOrder: number;
  category: string;
  description?: string;
}

interface EnhancedSequence {
  id: string;
  items: SequenceItem[];
  instruction: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
}

const EnhancedSequencing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playSound } = useSoundEffects();
  const dragRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const difficulty = searchParams.get('difficulty') || 'easy';
  const grade = parseInt(searchParams.get('grade') || '4');
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(3);
  const [showCompletion, setShowCompletion] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userSequence, setUserSequence] = useState<SequenceItem[]>([]);
  const [availableItems, setAvailableItems] = useState<SequenceItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<EnhancedSequence | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [draggedItem, setDraggedItem] = useState<SequenceItem | null>(null);
  const [dropZoneHighlight, setDropZoneHighlight] = useState(-1);

  // Grade-appropriate sequence generation
  const generateGradeSequence = (grade: number, level: number, difficulty: string): EnhancedSequence => {
    const sequences = {
      grade4: {
        easy: [
          {
            category: 'Daily Routine',
            instruction: 'Arrange the daily activities in order',
            items: [
              { content: 'Wake up', emoji: '🌅', description: 'Start of the day' },
              { content: 'Brush teeth', emoji: '🦷', description: 'Morning hygiene' },
              { content: 'Eat breakfast', emoji: '🥞', description: 'First meal' },
              { content: 'Go to school', emoji: '🏫', description: 'Learning time' }
            ]
          },
          {
            category: 'Making Sandwich',
            instruction: 'Order the steps to make a sandwich',
            items: [
              { content: 'Get bread', emoji: '🍞', description: 'Start with bread' },
              { content: 'Add meat', emoji: '🥩', description: 'Put on protein' },
              { content: 'Add cheese', emoji: '🧀', description: 'Layer the cheese' },
              { content: 'Close sandwich', emoji: '🥪', description: 'Put top bread' }
            ]
          }
        ],
        medium: [
          {
            category: 'Plant Growth',
            instruction: 'Show how a plant grows from seed to flower',
            items: [
              { content: 'Plant seed', emoji: '🌱', description: 'Beginning stage' },
              { content: 'Sprout appears', emoji: '🌿', description: 'First growth' },
              { content: 'Leaves grow', emoji: '🍃', description: 'More leaves' },
              { content: 'Stem grows', emoji: '🌾', description: 'Gets taller' },
              { content: 'Flower blooms', emoji: '🌺', description: 'Full bloom' }
            ]
          },
          {
            category: 'Getting Ready for Bed',
            instruction: 'Order the bedtime routine',
            items: [
              { content: 'Take a bath', emoji: '🛁', description: 'Get clean' },
              { content: 'Put on pajamas', emoji: '👕', description: 'Night clothes' },
              { content: 'Brush teeth', emoji: '🦷', description: 'Clean teeth' },
              { content: 'Read a story', emoji: '📖', description: 'Bedtime story' },
              { content: 'Go to sleep', emoji: '😴', description: 'Rest time' }
            ]
          }
        ],
        hard: [
          {
            category: 'Getting Dressed',
            instruction: 'Put on clothes in the right order',
            items: [
              { content: 'Put on underwear', emoji: '🩲', description: 'First layer' },
              { content: 'Put on shirt', emoji: '👕', description: 'Upper body' },
              { content: 'Put on pants', emoji: '👖', description: 'Lower body' },
              { content: 'Put on socks', emoji: '🧦', description: 'Foot covering' },
              { content: 'Put on shoes', emoji: '👟', description: 'Final step' },
              { content: 'Tie shoelaces', emoji: '👞', description: 'Secure shoes' }
            ]
          },
          {
            category: 'Baking Cookies',
            instruction: 'Order the steps to bake cookies',
            items: [
              { content: 'Mix ingredients', emoji: '🥄', description: 'Combine everything' },
              { content: 'Roll dough', emoji: '🍪', description: 'Shape the dough' },
              { content: 'Cut shapes', emoji: '⭐', description: 'Make cookie shapes' },
              { content: 'Put in oven', emoji: '🔥', description: 'Bake them' },
              { content: 'Cool down', emoji: '❄️', description: 'Let them cool' },
              { content: 'Eat cookies', emoji: '😋', description: 'Enjoy!' }
            ]
          }
        ]
      },
      grade5: {
        easy: [
          {
            category: 'Seasons',
            instruction: 'Arrange the seasons in order starting with Spring',
            items: [
              { content: 'Spring', emoji: '🌸', description: 'Flowers bloom' },
              { content: 'Summer', emoji: '☀️', description: 'Hot and sunny' },
              { content: 'Fall', emoji: '🍂', description: 'Leaves change' },
              { content: 'Winter', emoji: '❄️', description: 'Cold and snowy' }
            ]
          },
          {
            category: 'Making Pizza',
            instruction: 'Order the steps to make pizza',
            items: [
              { content: 'Make dough', emoji: '🫓', description: 'Prepare the base' },
              { content: 'Add sauce', emoji: '🍅', description: 'Spread tomato sauce' },
              { content: 'Add cheese', emoji: '🧀', description: 'Sprinkle cheese' },
              { content: 'Bake pizza', emoji: '🔥', description: 'Cook in oven' }
            ]
          }
        ],
        medium: [
          {
            category: 'Water Cycle',
            instruction: 'Arrange the water cycle process',
            items: [
              { content: 'Evaporation', emoji: '💨', description: 'Water becomes vapor' },
              { content: 'Condensation', emoji: '☁️', description: 'Vapor becomes clouds' },
              { content: 'Precipitation', emoji: '🌧️', description: 'Rain falls down' },
              { content: 'Collection', emoji: '🌊', description: 'Water gathers' },
              { content: 'Runoff', emoji: '🏞️', description: 'Water flows to rivers' }
            ]
          },
          {
            category: 'Butterfly Life Cycle',
            instruction: 'Order the stages of butterfly development',
            items: [
              { content: 'Egg', emoji: '🥚', description: 'Tiny egg on leaf' },
              { content: 'Caterpillar', emoji: '🐛', description: 'Larva stage' },
              { content: 'Chrysalis', emoji: '🛡️', description: 'Pupa in cocoon' },
              { content: 'Butterfly', emoji: '🦋', description: 'Adult butterfly' },
              { content: 'Mate & lay eggs', emoji: '💕', description: 'Reproduction cycle' }
            ]
          }
        ],
        hard: [
          {
            category: 'Photosynthesis',
            instruction: 'Order the steps of how plants make food',
            items: [
              { content: 'Absorb sunlight', emoji: '☀️', description: 'Energy from sun' },
              { content: 'Take in CO2', emoji: '💨', description: 'Carbon dioxide from air' },
              { content: 'Absorb water', emoji: '💧', description: 'Water from roots' },
              { content: 'Make glucose', emoji: '🍯', description: 'Sugar for energy' },
              { content: 'Release oxygen', emoji: '🌿', description: 'O2 as waste product' },
              { content: 'Store energy', emoji: '🔋', description: 'Save for later use' }
            ]
          },
          {
            category: 'Digestive System',
            instruction: 'Follow food through the digestive system',
            items: [
              { content: 'Mouth chews', emoji: '👄', description: 'Break down food' },
              { content: 'Swallow', emoji: '🫗', description: 'Food goes down throat' },
              { content: 'Stomach acid', emoji: '🧪', description: 'Dissolves food' },
              { content: 'Small intestine', emoji: '🌀', description: 'Absorbs nutrients' },
              { content: 'Large intestine', emoji: '🔄', description: 'Removes water' },
              { content: 'Waste removal', emoji: '🚽', description: 'Eliminates leftovers' }
            ]
          }
        ]
      },
      grade6: {
        easy: [
          {
            category: 'Food Chain',
            instruction: 'Order the food chain from producer to top predator',
            items: [
              { content: 'Grass', emoji: '🌱', description: 'Producer' },
              { content: 'Rabbit', emoji: '🐰', description: 'Primary consumer' },
              { content: 'Fox', emoji: '🦊', description: 'Secondary consumer' },
              { content: 'Eagle', emoji: '🦅', description: 'Top predator' }
            ]
          },
          {
            category: 'Writing Process',
            instruction: 'Order the steps of writing an essay',
            items: [
              { content: 'Brainstorm', emoji: '💡', description: 'Think of ideas' },
              { content: 'Outline', emoji: '📋', description: 'Organize thoughts' },
              { content: 'Write draft', emoji: '✏️', description: 'First version' },
              { content: 'Edit', emoji: '✂️', description: 'Fix errors' }
            ]
          }
        ],
        medium: [
          {
            category: 'Scientific Method',
            instruction: 'Order the steps of the scientific method',
            items: [
              { content: 'Observation', emoji: '👀', description: 'Notice something' },
              { content: 'Question', emoji: '❓', description: 'Ask why/how' },
              { content: 'Hypothesis', emoji: '💭', description: 'Make a guess' },
              { content: 'Experiment', emoji: '🧪', description: 'Test the guess' },
              { content: 'Conclusion', emoji: '✅', description: 'Final answer' }
            ]
          },
          {
            category: 'Rock Cycle',
            instruction: 'Order how rocks change over time',
            items: [
              { content: 'Magma', emoji: '🌋', description: 'Molten rock underground' },
              { content: 'Igneous Rock', emoji: '🪨', description: 'Cooled magma' },
              { content: 'Weathering', emoji: '🌊', description: 'Breaks into pieces' },
              { content: 'Sedimentary Rock', emoji: '🏔️', description: 'Layers pressed together' },
              { content: 'Metamorphic Rock', emoji: '💎', description: 'Changed by heat/pressure' }
            ]
          }
        ],
        hard: [
          {
            category: 'Cell Division',
            instruction: 'Order the phases of mitosis',
            items: [
              { content: 'Prophase', emoji: '🧬', description: 'Chromosomes condense' },
              { content: 'Metaphase', emoji: '⚖️', description: 'Chromosomes align' },
              { content: 'Anaphase', emoji: '↔️', description: 'Chromosomes separate' },
              { content: 'Telophase', emoji: '🔄', description: 'Nuclear membranes form' },
              { content: 'Cytokinesis', emoji: '✂️', description: 'Cell splits in two' },
              { content: 'Two new cells', emoji: '👥', description: 'Division complete' }
            ]
          },
          {
            category: 'Research Process',
            instruction: 'Order the steps of conducting research',
            items: [
              { content: 'Choose topic', emoji: '🎯', description: 'Select research focus' },
              { content: 'Find sources', emoji: '📚', description: 'Gather information' },
              { content: 'Take notes', emoji: '📝', description: 'Record key points' },
              { content: 'Organize data', emoji: '📊', description: 'Sort information' },
              { content: 'Write report', emoji: '📄', description: 'Create final document' },
              { content: 'Cite sources', emoji: '📖', description: 'Give credit to authors' }
            ]
          }
        ]
      }
    };

    let categorySequences, itemCount;

    if (grade === 4) {
      categorySequences = sequences.grade4[difficulty];
      itemCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
    } else if (grade === 5) {
      categorySequences = sequences.grade5[difficulty];
      itemCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
    } else if (grade === 6) {
      categorySequences = sequences.grade6[difficulty];
      itemCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
    }

    const selectedSequence = categorySequences[(currentRound - 1) % categorySequences.length];
    const items: SequenceItem[] = selectedSequence.items
      .slice(0, itemCount)
      .map((item, index) => ({
        id: `item-${index}`,
        content: item.content,
        emoji: item.emoji,
        correctOrder: index,
        category: selectedSequence.category,
        description: item.description
      }));

    // Shuffle items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    // Adjust time limits based on difficulty
    let timeLimit;
    if (difficulty === 'easy') {
      timeLimit = 120; // More time for easy
    } else if (difficulty === 'medium') {
      timeLimit = 90;  // Standard time
    } else {
      timeLimit = 60;  // Time pressure for hard
    }

    return {
      id: `enhanced-sequence-${level}`,
      items: shuffledItems,
      instruction: selectedSequence.instruction,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      category: selectedSequence.category,
      timeLimit
    };
  };

  // Drag and Drop handlers
  const handleDragStart = (item: SequenceItem) => {
    setDraggedItem(item);
    playSound('pickup');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropZoneHighlight(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDropZoneHighlight(-1);
    
    if (!draggedItem) return;

    if (availableItems.includes(draggedItem)) {
      // Moving from available to sequence
      const newAvailable = availableItems.filter(item => item.id !== draggedItem.id);
      const newSequence = [...userSequence];
      newSequence.splice(targetIndex, 0, draggedItem);
      
      setAvailableItems(newAvailable);
      setUserSequence(newSequence);
    } else {
      // Reordering within sequence
      const currentIndex = userSequence.findIndex(item => item.id === draggedItem.id);
      const newSequence = [...userSequence];
      newSequence.splice(currentIndex, 1);
      newSequence.splice(targetIndex, 0, draggedItem);
      setUserSequence(newSequence);
    }
    
    setDraggedItem(null);
    playSound('drop');
  };

  const handleItemClick = (item: SequenceItem) => {
    if (showResult) return;

    if (availableItems.includes(item)) {
      // Move to end of sequence
      setAvailableItems(availableItems.filter(i => i.id !== item.id));
      setUserSequence([...userSequence, item]);
    } else {
      // Move back to available
      setUserSequence(userSequence.filter(i => i.id !== item.id));
      setAvailableItems([...availableItems, item]);
    }
    playSound('click');
  };

  const createGameSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'enhanced-sequencing',
          difficulty,
          grade,
          level_reached: currentLevel,
          score: 0,
          streak: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating game session:', error);
    }
  };

  const updateGameSession = async (isCompleted = false) => {
    if (!sessionId) return;
    
    try {
      const updateData: any = {
        level_reached: currentLevel,
        score,
        streak
      };
      
      if (isCompleted) {
        updateData.completed_at = new Date().toISOString();
      }
      
      await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating game session:', error);
    }
  };

  useEffect(() => {
    const challenge = generateGradeSequence(grade, currentRound, difficulty);
    setCurrentChallenge(challenge);
    setAvailableItems([...challenge.items]);
    setUserSequence([]);
    setTimeLeft(challenge.timeLimit);
    if (user && !sessionId) {
      createGameSession();
    }
  }, [currentRound, grade, difficulty, user]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && currentChallenge) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
    setStreak(0);
    playSound('timeup');
  };

  const checkAnswer = () => {
    if (userSequence.length !== currentChallenge?.items.length) return;

    const correct = userSequence.every((item, index) => item.correctOrder === index);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSound('success');
      const timeBonus = Math.floor(timeLeft * 3);
      const streakBonus = streak * 10;
      setScore(score + (currentLevel * 25) + timeBonus + streakBonus);
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
    playSound('reset');
  };

  const handleNextLevel = () => {
    if (isCorrect) {
      const nextRound = currentRound + 1;
      if (nextRound > maxRounds) {
        setShowCompletion(true);
        updateGameSession(true); // Mark as completed
        return;
      }
      setCurrentRound(nextRound);
    }
    setShowResult(false);
    updateGameSession(); // Update progress but don't mark as completed
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
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
              Grade {grade} • {currentChallenge.category}
            </div>
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{currentRound}/{maxRounds}</div>
              <div className="text-sm text-muted-foreground">Round</div>
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
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-purple-600">{userSequence.length}/{currentChallenge.items.length}</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Game Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {currentChallenge.instruction}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Sequence Building Area */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Your Sequence:
              </h3>
              <div className="min-h-32 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-4">
                <div className="flex flex-wrap gap-4">
                  <AnimatePresence>
                    {userSequence.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => handleItemClick(item)}
                        className="relative cursor-move bg-white rounded-xl border-2 border-blue-300 p-4 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{item.emoji}</div>
                          <div className="text-sm font-medium text-gray-700">{item.content}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                          )}
                        </div>
                        <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Drop zones */}
                  {Array.from({ length: Math.max(1, currentChallenge.items.length - userSequence.length) }).map((_, index) => (
                    <motion.div
                      key={`drop-${index}`}
                      onDragOver={(e) => handleDragOver(e, userSequence.length + index)}
                      onDrop={(e) => handleDrop(e, userSequence.length + index)}
                      className={`w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                        dropZoneHighlight === userSequence.length + index
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="text-gray-400 text-center">
                        <div className="text-2xl mb-1">📥</div>
                        <div className="text-xs">Drop here</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {userSequence.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Drag items here or click them to build your sequence
                  </div>
                )}
              </div>
            </div>

            {/* Available Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Available Items:</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <AnimatePresence>
                  {availableItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onClick={() => handleItemClick(item)}
                      className="cursor-move bg-white rounded-xl border-2 border-gray-300 p-4 shadow-md hover:shadow-lg hover:border-primary transition-all"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium text-gray-700">{item.content}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetSequence} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={checkAnswer}
                disabled={userSequence.length !== currentChallenge.items.length || showResult}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Check Sequence
              </Button>
            </div>

            {/* Enhanced Result */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
              >
                <div className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Perfect Sequence!' : timeLeft === 0 ? '⏰ Time\'s Up!' : '❌ Check the Order!'}
                </div>
                {isCorrect && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Time Bonus: +{Math.floor(timeLeft * 3)} • Streak Bonus: +{streak * 10}
                  </div>
                )}
                <Button onClick={handleNextLevel} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {isCorrect ? (currentRound < maxRounds ? 'Next Round' : 'Complete!') : 'Try Again'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-2">Enhanced Sequencing Rules:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Drag and drop items to arrange them in logical order</li>
              <li>• Click items to quickly move them to/from your sequence</li>
              <li>• Pay attention to descriptions for additional context</li>
              <li>• Work quickly for time bonuses</li>
              <li>• Build streaks for maximum points</li>
              <li>• Difficulty adapts to your grade level</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                Congratulations!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-600 mb-6"
              >
                You completed <span className="font-bold text-primary">{difficulty}</span> difficulty!
                <br />✅ <span className="text-green-600 font-semibold">COMPLETED</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/80 rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-500">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{streak}</div>
                    <div className="text-sm text-gray-500">Best Streak</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-3"
              >
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 text-lg"
                >
                  🏠 Back to Games
                </Button>
                
                {difficulty !== 'hard' && (
                  <Button 
                    onClick={() => {
                      navigate(`/game/sequencing/select`);
                    }}
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3"
                  >
                    🚀 Try {difficulty === 'easy' ? 'Medium' : 'Hard'} Level
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnhancedSequencing;