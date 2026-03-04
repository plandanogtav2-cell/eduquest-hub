import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface Pattern {
  id: string;
  sequence: string[];
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const PatternRecognition = () => {
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
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [patterns, setPatterns] = useState<any[]>([]);

  // Fetch patterns from database
  useEffect(() => {
    const fetchPatterns = async () => {
      console.log('Fetching patterns for difficulty:', difficulty);
      const { data, error } = await supabase
        .from('pattern_rounds')
        .select('*')
        .eq('difficulty', difficulty)
        .order('level', { ascending: true });
      
      if (error) {
        console.error('Error fetching patterns:', error);
      } else {
        console.log('Fetched patterns:', data);
        setPatterns(data || []);
      }
    };
    fetchPatterns();
  }, [difficulty]);

  // Generate pattern from database
  const generatePattern = (level: number): Pattern | null => {
    const patternData = patterns.find(p => p.level === level);
    if (!patternData) return null;
    
    console.log('Generating pattern for level', level, ':', patternData);
    
    return {
      id: patternData.id,
      sequence: Array.isArray(patternData.sequence) ? patternData.sequence : JSON.parse(patternData.sequence),
      options: Array.isArray(patternData.options) ? patternData.options : JSON.parse(patternData.options),
      correctAnswer: patternData.correct_answer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  };

  useEffect(() => {
    if (patterns.length > 0) {
      const pattern = generatePattern(currentLevel);
      if (pattern) setCurrentPattern(pattern);
    }
    // Create game session on first load
    if (user && !sessionId) {
      createGameSession();
    }
  }, [currentLevel, user, patterns]);

  const createGameSession = async () => {
    if (!user) return;
    
    try {
      console.log('Creating game session for user:', user.id);
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'pattern-recognition',
          difficulty,
          grade,
          level_reached: currentLevel,
          score: 0,
          streak: 0
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Game session created:', data);
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
      
      // Only set completed_at when finishing all 10 levels
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

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentPattern?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSound('correct');
      const newScore = score + (currentLevel * 10);
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      // Update session immediately with new score
      if (sessionId) {
        supabase
          .from('game_sessions')
          .update({
            level_reached: currentLevel,
            score: newScore,
            streak: newStreak
          })
          .eq('id', sessionId)
          .then(() => console.log('Score updated:', newScore));
      }
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };

  const getMaxLevels = (difficulty: string) => {
    return difficulty === 'easy' ? 5 : 10;
  };

  const handleNextLevel = () => {
    if (isCorrect) {
      const maxLevels = getMaxLevels(difficulty);
      const nextLevel = currentLevel + 1;
      console.log('Moving to next level:', nextLevel, 'Max levels:', maxLevels);
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

  if (!currentPattern) {
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
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              Grade {grade} Level
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
            <CardTitle className="text-center">Complete the Pattern</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Pattern Sequence */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {currentPattern.sequence.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl border-2 border-gray-200"
                >
                  {item}
                </motion.div>
              ))}
              
              {/* Question Mark */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: currentPattern.sequence.length * 0.2 }}
                className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl border-2 border-blue-300 border-dashed"
              >
                ?
              </motion.div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentPattern.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`w-full h-20 rounded-xl border-2 text-3xl transition-all hover:scale-105 ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : showResult && option === currentPattern.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-50 border-gray-200 hover:border-primary'
                  }`}
                >
                  {option}
                  {showResult && selectedAnswer === option && (
                    <div className="absolute -top-2 -right-2">
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-green-600 bg-white rounded-full p-1" />
                      ) : (
                        <X className="w-6 h-6 text-red-600 bg-white rounded-full p-1" />
                      )}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Result Message */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8"
              >
                <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Correct!' : '❌ Try Again!'}
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
              <li>• Look at the pattern sequence carefully</li>
              <li>• Identify what comes next in the pattern</li>
              <li>• Click on the correct answer from the options</li>
              <li>• Complete levels to increase difficulty and earn more points!</li>
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
            {/* Confetti Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100" />
            
            {/* Content */}
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
                Amazing Work!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-600 mb-6"
              >
                You completed all {getMaxLevels(difficulty)} levels of <span className="font-bold text-primary">{difficulty}</span> difficulty!
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
                      const nextDifficulty = difficulty === 'easy' ? 'medium' : 'hard';
                      navigate(`/game/pattern-recognition/select`);
                    }}
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3"
                  >
                    🚀 Try {difficulty === 'easy' ? 'Medium' : 'Hard'} Level
                  </Button>
                )}
              </motion.div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 right-4 text-3xl"
            >
              ⭐
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute bottom-4 left-4 text-2xl"
            >
              🎆
            </motion.div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatternRecognition;