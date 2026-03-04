import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Lightbulb, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface Clue {
  text: string;
  revealed: boolean;
}

interface DeductiveChallenge {
  id: string;
  scenario: string;
  clues: Clue[];
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const DeductiveReasoning = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { playSound } = useSoundEffects();
  
  const difficulty = searchParams.get('difficulty') || 'easy';
  const grade = parseInt(searchParams.get('grade') || '4');
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<DeductiveChallenge | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [rounds, setRounds] = useState<any[]>([]);

  // Fetch rounds from database
  useEffect(() => {
    const fetchRounds = async () => {
      console.log('Fetching deductive reasoning rounds for difficulty:', difficulty);
      const { data, error } = await supabase
        .from('deductive_reasoning_rounds')
        .select('*')
        .eq('difficulty', difficulty)
        .order('level', { ascending: true });
      
      if (error) {
        console.error('Error fetching rounds:', error);
      } else {
        console.log('Fetched rounds:', data);
        setRounds(data || []);
      }
    };
    fetchRounds();
  }, [difficulty]);

  const generateChallenge = (level: number): DeductiveChallenge | null => {
    const roundData = rounds.find(r => r.level === level);
    if (!roundData) return null;

    const clues: Clue[] = (Array.isArray(roundData.clues) ? roundData.clues : JSON.parse(roundData.clues))
      .map((text: string) => ({ text, revealed: false }));

    return {
      id: roundData.id,
      scenario: "Use the clues below to solve the mystery",
      clues,
      question: roundData.question,
      options: Array.isArray(roundData.options) ? roundData.options : JSON.parse(roundData.options),
      correctAnswer: roundData.correct_answer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  };

  useEffect(() => {
    if (rounds.length > 0) {
      const challenge = generateChallenge(currentLevel);
      if (challenge) {
        setCurrentChallenge(challenge);
        setRevealedClues(1);
      }
    }
    // Create game session on first load
    if (user && !sessionId) {
      createGameSession();
    }
  }, [currentLevel, user, rounds]);

  const createGameSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'deductive-reasoning',
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

  const updateGameSession = async (isCompleting = false) => {
    if (!sessionId) return;
    
    try {
      const updateData: any = {
        level_reached: currentLevel,
        score,
        streak
      };
      
      if (isCompleting) {
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

  const revealNextClue = () => {
    if (!currentChallenge || revealedClues >= currentChallenge.clues.length) return;
    setRevealedClues(revealedClues + 1);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentChallenge?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSound('correct');
      const bonusMultiplier = (currentChallenge!.clues.length - revealedClues + 1);
      const newScore = score + (currentLevel * 20 * bonusMultiplier);
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      // Update session immediately
      if (sessionId) {
        supabase
          .from('game_sessions')
          .update({
            level_reached: currentLevel,
            score: newScore,
            streak: newStreak
          })
          .eq('id', sessionId);
      }
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };

  const handleNextLevel = () => {
    if (isCorrect) {
      const maxLevels = 5; // 5 rounds for all difficulties
      const nextLevel = currentLevel + 1;
      if (nextLevel > maxLevels) {
        setShowCompletion(true);
        updateGameSession(true);
        return;
      }
      setCurrentLevel(nextLevel);
    }
    setSelectedAnswer(null);
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
              Grade {grade} Level
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{currentLevel}/5</div>
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
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Solve the Mystery
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Scenario */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Scenario:</h3>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700">{currentChallenge.scenario}</p>
              </div>
            </div>

            {/* Clues */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Clues:</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={revealNextClue}
                  disabled={revealedClues >= currentChallenge.clues.length}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Next Clue ({revealedClues}/{currentChallenge.clues.length})
                </Button>
              </div>
              
              <div className="space-y-3">
                {currentChallenge.clues.map((clue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index < revealedClues ? 1 : 0.3,
                      x: 0 
                    }}
                    className={`p-3 rounded-lg border-l-4 ${
                      index < revealedClues 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Clue {index + 1}:</span>
                      <span className={index < revealedClues ? 'text-gray-700' : 'text-gray-400'}>
                        {index < revealedClues ? clue.text : '???'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Question:</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-gray-700 font-medium">{currentChallenge.question}</p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {currentChallenge.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : showResult && option === currentChallenge.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-50 border-gray-200 hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
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

            {/* Result Message */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Excellent Deduction!' : '❌ Keep Thinking!'}
                </div>
                {isCorrect && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Bonus points for using only {revealedClues} clue{revealedClues !== 1 ? 's' : ''}!
                  </p>
                )}
                <Button onClick={handleNextLevel} size="lg">
                  {isCorrect ? 'Next Mystery' : 'Try Again'}
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
              <li>• Read the scenario carefully</li>
              <li>• Reveal clues one by one (fewer clues = more points!)</li>
              <li>• Use logical reasoning to deduce the answer</li>
              <li>• Select your answer from the options</li>
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
                🧠
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                Master Detective!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-600 mb-6"
              >
                You completed all 5 levels of <span className="font-bold text-primary">{difficulty}</span> difficulty!
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
                    onClick={() => navigate(`/game/deductive-reasoning/select`)}
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

export default DeductiveReasoning;