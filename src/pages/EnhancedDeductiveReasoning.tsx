import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Lightbulb, Eye, Brain, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface LogicClue {
  text: string;
  revealed: boolean;
  type: 'direct' | 'indirect' | 'elimination';
  difficulty: number;
}

interface LogicGrid {
  categories: string[];
  items: string[][];
  constraints: string[];
}

interface EnhancedDeductiveChallenge {
  id: string;
  scenario: string;
  clues: LogicClue[];
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  logicGrid?: LogicGrid;
  timeLimit: number;
  hintAvailable: boolean;
}

const EnhancedDeductiveReasoning = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playSound } = useSoundEffects();
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const difficulty = searchParams.get('difficulty') || 'easy';
  const grade = parseInt(searchParams.get('grade') || '4');
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(2); // 2 rounds for deductive reasoning
  const [showCompletion, setShowCompletion] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<EnhancedDeductiveChallenge | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [logicNotes, setLogicNotes] = useState<string>('');

  // Grade-appropriate challenge generation
  const generateGradeChallenge = (grade: number, level: number, difficulty: string): EnhancedDeductiveChallenge => {
    const challenges = {
      grade4: {
        easy: [
          {
            category: 'Simple Logic',
            scenario: 'Three friends have different colored backpacks.',
            clues: [
              { text: 'Emma has a red backpack', type: 'direct', difficulty: 1 },
              { text: 'Sam does not have a blue backpack', type: 'elimination', difficulty: 2 },
              { text: 'There are red, blue, and green backpacks', type: 'direct', difficulty: 1 }
            ],
            question: 'What color backpack does Sam have?',
            options: ['Red', 'Blue', 'Green', 'Yellow'],
            correctAnswer: 'Green'
          },
          {
            category: 'Pet Matching',
            scenario: 'Four kids each have a different pet.',
            clues: [
              { text: 'Lisa has a cat', type: 'direct', difficulty: 1 },
              { text: 'The dog owner is not Mike', type: 'elimination', difficulty: 2 },
              { text: 'There are cat, dog, fish, and bird pets', type: 'direct', difficulty: 1 }
            ],
            question: 'Who has the dog?',
            options: ['Lisa', 'Mike', 'Sara', 'Tom'],
            correctAnswer: 'Sara'
          }
        ],
        medium: [
          {
            category: 'Animal Homes',
            scenario: 'Four animals live in different places.',
            clues: [
              { text: 'The fish lives in water', type: 'direct', difficulty: 1 },
              { text: 'The bird does not live underground', type: 'elimination', difficulty: 2 },
              { text: 'The rabbit lives in a burrow underground', type: 'direct', difficulty: 1 },
              { text: 'The bear lives in a cave, not in trees', type: 'elimination', difficulty: 2 }
            ],
            question: 'Where does the bird live?',
            options: ['Water', 'Underground', 'Tree', 'Cave'],
            correctAnswer: 'Tree'
          },
          {
            category: 'Favorite Foods',
            scenario: 'Five friends like different foods for lunch.',
            clues: [
              { text: 'Amy likes pizza', type: 'direct', difficulty: 1 },
              { text: 'The person who likes salad sits next to Amy', type: 'indirect', difficulty: 2 },
              { text: 'Ben does not like burgers or tacos', type: 'elimination', difficulty: 2 },
              { text: 'The taco lover is not sitting at the end', type: 'indirect', difficulty: 3 }
            ],
            question: 'What does Ben like to eat?',
            options: ['Pizza', 'Salad', 'Burgers', 'Tacos'],
            correctAnswer: 'Salad'
          }
        ],
        hard: [
          {
            category: 'Sports & Numbers',
            scenario: 'Six kids play different sports and wear different jersey numbers.',
            clues: [
              { text: 'The soccer player wears number 10', type: 'direct', difficulty: 1 },
              { text: 'Emma plays basketball but does not wear number 5', type: 'elimination', difficulty: 2 },
              { text: 'The swimmer wears an even number', type: 'indirect', difficulty: 3 },
              { text: 'Number 7 belongs to the tennis player', type: 'direct', difficulty: 1 },
              { text: 'The baseball player wears a number higher than 8', type: 'indirect', difficulty: 3 }
            ],
            question: 'What number does the swimmer wear?',
            options: ['2', '4', '6', '8'],
            correctAnswer: '6'
          }
        ]
      },
      grade5: {
        easy: [
          {
            category: 'Class Schedule',
            scenario: 'Four students have different classes at different times.',
            clues: [
              { text: 'Math class is at 9 AM', type: 'direct', difficulty: 1 },
              { text: 'Sarah has science class', type: 'direct', difficulty: 1 },
              { text: 'Art class is not at 10 AM', type: 'elimination', difficulty: 2 },
              { text: 'There are math, science, art, and music classes', type: 'direct', difficulty: 1 }
            ],
            question: 'What time is art class?',
            options: ['9 AM', '10 AM', '11 AM', '12 PM'],
            correctAnswer: '11 AM'
          }
        ],
        medium: [
          {
            category: 'School Logic',
            scenario: 'Four students have different favorite subjects and different lunch foods.',
            clues: [
              { text: 'Maria likes math and brings sandwiches', type: 'direct', difficulty: 1 },
              { text: 'The student who likes science brings fruit', type: 'indirect', difficulty: 2 },
              { text: 'John does not like art and does not bring cookies', type: 'elimination', difficulty: 3 },
              { text: 'The student who brings soup likes reading', type: 'indirect', difficulty: 2 }
            ],
            question: 'What does the student who likes science bring for lunch?',
            options: ['Sandwiches', 'Fruit', 'Cookies', 'Soup'],
            correctAnswer: 'Fruit'
          }
        ],
        hard: [
          {
            category: 'Sports Teams',
            scenario: 'Five students play different sports and wear different colored jerseys.',
            clues: [
              { text: 'The soccer player wears a green jersey', type: 'direct', difficulty: 1 },
              { text: 'Lisa plays basketball but does not wear red', type: 'elimination', difficulty: 2 },
              { text: 'The swimmer wears blue and is not Tom', type: 'indirect', difficulty: 3 },
              { text: 'The tennis player wears white', type: 'direct', difficulty: 1 },
              { text: 'The runner wears yellow and practices after school', type: 'indirect', difficulty: 3 }
            ],
            question: 'What sport does the student in the blue jersey play?',
            options: ['Soccer', 'Basketball', 'Swimming', 'Tennis'],
            correctAnswer: 'Swimming'
          }
        ]
      },
      grade6: {
        easy: [
          {
            category: 'Library Books',
            scenario: 'Four students checked out different types of books.',
            clues: [
              { text: 'Alex checked out a mystery book', type: 'direct', difficulty: 1 },
              { text: 'The fantasy book was not checked out by Maya', type: 'elimination', difficulty: 2 },
              { text: 'There are mystery, fantasy, science, and history books', type: 'direct', difficulty: 1 },
              { text: 'The science book reader sits in the front row', type: 'indirect', difficulty: 2 }
            ],
            question: 'What type of book did Maya check out?',
            options: ['Mystery', 'Fantasy', 'Science', 'History'],
            correctAnswer: 'Science'
          }
        ],
        medium: [
          {
            category: 'Science Fair',
            scenario: 'Six students did different science projects and got different awards.',
            clues: [
              { text: 'The volcano project won first place', type: 'direct', difficulty: 1 },
              { text: 'Sarah did the plant growth project and got second place', type: 'direct', difficulty: 1 },
              { text: 'The student who did the robot project did not get third place', type: 'elimination', difficulty: 3 },
              { text: 'Mike got third place but did not do the weather project', type: 'elimination', difficulty: 3 },
              { text: 'The solar system project got an honorable mention', type: 'indirect', difficulty: 2 }
            ],
            question: 'Which project won first place?',
            options: ['Volcano', 'Plant Growth', 'Robot', 'Weather'],
            correctAnswer: 'Volcano'
          }
        ],
        hard: [
          {
            category: 'Academic Competition',
            scenario: 'Eight students compete in different subjects and represent different grades.',
            clues: [
              { text: 'The math competitor is in 6th grade', type: 'direct', difficulty: 1 },
              { text: 'Emma competes in science but is not in 5th grade', type: 'elimination', difficulty: 2 },
              { text: 'The 4th grader competes in spelling', type: 'direct', difficulty: 1 },
              { text: 'The history competitor scored higher than the geography competitor', type: 'indirect', difficulty: 3 },
              { text: 'No 5th grader competes in language arts', type: 'elimination', difficulty: 3 },
              { text: 'The art competitor is younger than the music competitor', type: 'indirect', difficulty: 3 }
            ],
            question: 'What grade is Emma in?',
            options: ['4th Grade', '5th Grade', '6th Grade', '7th Grade'],
            correctAnswer: '6th Grade'
          }
        ]
      }
    };

    let categoryData, clueCount, timeLimit;

    if (grade === 4) {
      categoryData = challenges.grade4[difficulty];
      clueCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
      timeLimit = difficulty === 'easy' ? 240 : difficulty === 'medium' ? 180 : 120;
    } else if (grade === 5) {
      categoryData = challenges.grade5[difficulty];
      clueCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 5;
      timeLimit = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 150 : 100;
    } else if (grade === 6) {
      categoryData = challenges.grade6[difficulty];
      clueCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
      timeLimit = difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 80;
    }

    const selectedChallenge = categoryData[(currentRound - 1) % categoryData.length];
    
    const clues: LogicClue[] = selectedChallenge.clues
      .slice(0, clueCount)
      .map(clue => ({
        text: clue.text,
        revealed: false,
        type: clue.type as 'direct' | 'indirect' | 'elimination',
        difficulty: clue.difficulty
      }));

    return {
      id: `enhanced-deductive-${level}`,
      scenario: selectedChallenge.scenario,
      clues,
      question: selectedChallenge.question,
      options: selectedChallenge.options,
      correctAnswer: selectedChallenge.correctAnswer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      category: selectedChallenge.category,
      logicGrid: selectedChallenge.logicGrid,
      timeLimit,
      hintAvailable: true
    };
  };

  const createGameSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'enhanced-deductive-reasoning',
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
    const challenge = generateGradeChallenge(grade, currentLevel, difficulty);
    setCurrentChallenge(challenge);
    setRevealedClues(1);
    setTimeLeft(challenge.timeLimit);
    setHintsUsed(0);
    setLogicNotes('');
    if (user && !sessionId) {
      createGameSession();
    }
  }, [currentLevel, grade, difficulty, user]);

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

  const revealNextClue = () => {
    if (!currentChallenge || revealedClues >= currentChallenge.clues.length) return;
    setRevealedClues(revealedClues + 1);
    playSound('reveal');
  };

  const useHint = () => {
    if (!currentChallenge || hintsUsed >= 2) return;
    setHintsUsed(hintsUsed + 1);
    setShowHint(true);
    playSound('hint');
    setTimeout(() => setShowHint(false), 5000);
  };

  const getHintText = () => {
    if (!currentChallenge) return '';
    
    const hints = [
      'Look for direct statements first, then use elimination',
      'Cross-reference the clues to find connections',
      'Use the process of elimination to narrow down options'
    ];
    
    return hints[hintsUsed - 1] || hints[0];
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentChallenge?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSound('success');
      // Complex scoring system
      const basePoints = currentLevel * 30;
      const timeBonus = Math.floor(timeLeft * 2);
      const clueBonus = (currentChallenge!.clues.length - revealedClues + 1) * 10;
      const hintPenalty = hintsUsed * 5;
      const streakBonus = streak * 15;
      
      const totalScore = basePoints + timeBonus + clueBonus - hintPenalty + streakBonus;
      setScore(score + Math.max(totalScore, basePoints));
      setStreak(streak + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
    }
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
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
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
              <span className="text-blue-600 font-medium">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
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
              <div className="text-lg font-bold text-blue-600">{revealedClues}/{currentChallenge.clues.length}</div>
              <div className="text-sm text-muted-foreground">Clues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-red-600">{hintsUsed}/2</div>
              <div className="text-sm text-muted-foreground">Hints</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Area */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6" />
                  Advanced Logic Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Scenario */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Scenario:</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-700">{currentChallenge.scenario}</p>
                  </div>
                </div>

                {/* Clues with Enhanced UI */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Clues:
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={revealNextClue}
                        disabled={revealedClues >= currentChallenge.clues.length}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Reveal Next
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={useHint}
                        disabled={hintsUsed >= 2}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Hint ({2 - hintsUsed} left)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <AnimatePresence>
                      {currentChallenge.clues.map((clue, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: index < revealedClues ? 1 : 0.3,
                            x: 0 
                          }}
                          className={`p-4 rounded-lg border-l-4 transition-all ${
                            index < revealedClues 
                              ? clue.type === 'direct' 
                                ? 'bg-green-50 border-green-400' 
                                : clue.type === 'indirect'
                                ? 'bg-blue-50 border-blue-400'
                                : 'bg-red-50 border-red-400'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm bg-white px-2 py-1 rounded">
                                Clue {index + 1}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                clue.type === 'direct' ? 'bg-green-100 text-green-700' :
                                clue.type === 'indirect' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {clue.type}
                              </span>
                            </div>
                            <div className="flex">
                              {Array.from({ length: clue.difficulty }).map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full ml-1" />
                              ))}
                            </div>
                          </div>
                          <p className={`mt-2 ${index < revealedClues ? 'text-gray-700' : 'text-gray-400'}`}>
                            {index < revealedClues ? clue.text : '???'}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Hint Display */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Hint:</span>
                      </div>
                      <p className="text-yellow-700">{getHintText()}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Question:</h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-gray-700 font-medium">{currentChallenge.question}</p>
                  </div>
                </div>

                {/* Enhanced Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentChallenge.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-100 border-green-500 shadow-lg'
                            : 'bg-red-100 border-red-500 shadow-lg'
                          : showResult && option === currentChallenge.correctAnswer
                          ? 'bg-green-100 border-green-500 shadow-lg'
                          : 'bg-gray-50 border-gray-200 hover:border-primary hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && selectedAnswer === option && (
                          <div>
                            {isCorrect ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Enhanced Result */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                  >
                    <div className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '🎉 Excellent Deduction!' : timeLeft === 0 ? '⏰ Time\'s Up!' : '❌ Keep Reasoning!'}
                    </div>
                    {isCorrect && (
                      <div className="text-sm text-muted-foreground mb-4 space-y-1">
                        <div>Base Points: +{currentLevel * 30}</div>
                        <div>Time Bonus: +{Math.floor(timeLeft * 2)}</div>
                        <div>Clue Efficiency: +{(currentChallenge.clues.length - revealedClues + 1) * 10}</div>
                        <div>Hint Penalty: -{hintsUsed * 5}</div>
                        <div>Streak Bonus: +{streak * 15}</div>
                      </div>
                    )}
                    <Button onClick={handleNextLevel} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {isCorrect ? (currentRound < maxRounds ? 'Next Mystery' : 'Complete!') : 'Try Again'}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Logic Grid & Notes */}
          <div className="space-y-6">
            {/* Logic Grid */}
            {currentChallenge.logicGrid && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Logic Grid</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {currentChallenge.logicGrid.categories.map((category, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-gray-700 mb-1">{category}:</div>
                        <div className="flex flex-wrap gap-1">
                          {currentChallenge.logicGrid!.items[index].map((item, itemIndex) => (
                            <span key={itemIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Logic Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <textarea
                  value={logicNotes}
                  onChange={(e) => setLogicNotes(e.target.value)}
                  placeholder="Write your reasoning here..."
                  className="w-full h-32 p-2 text-xs border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2">Advanced Logic Rules:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use fewer clues for bonus points</li>
                  <li>• Direct clues are easiest to use</li>
                  <li>• Elimination clues help narrow options</li>
                  <li>• Use hints sparingly (point penalty)</li>
                  <li>• Take notes to track your reasoning</li>
                  <li>• Work systematically through possibilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
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
                      navigate(`/game/deductive-reasoning/select`);
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

export default EnhancedDeductiveReasoning;