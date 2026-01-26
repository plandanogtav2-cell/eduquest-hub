import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import useSoundEffects from '@/hooks/useSoundEffects';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface PatternElement {
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon';
  color: string;
  size: number;
  rotation?: number;
  animation?: 'pulse' | 'rotate' | 'bounce';
}

interface EnhancedPattern {
  id: string;
  sequence: PatternElement[];
  options: PatternElement[];
  correctAnswer: PatternElement;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'shape' | 'color' | 'size' | 'rotation' | 'complex';
}

const EnhancedPatternRecognition = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { playSound } = useSoundEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const difficulty = searchParams.get('difficulty') || 'easy';
  const grade = parseInt(searchParams.get('grade') || '4');
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(3); // 3 rounds per difficulty
  const [showCompletion, setShowCompletion] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternElement | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<EnhancedPattern | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Grade-appropriate pattern generation
  const generateGradePattern = (grade: number, level: number, difficulty: string): EnhancedPattern => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const shapes: PatternElement['shape'][] = ['circle', 'square', 'triangle', 'diamond', 'star'];

    let patternType: EnhancedPattern['type'] = 'shape';
    let sequenceLength = 3;

    // Adjust complexity for grades 4-6 only
    if (grade === 4) {
      sequenceLength = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
      patternType = Math.random() > 0.5 ? 'shape' : 'color';
    } else if (grade === 5) {
      sequenceLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
      patternType = ['shape', 'color', 'size'][Math.floor(Math.random() * 3)] as any;
    } else if (grade === 6) {
      sequenceLength = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 6 : 7;
      patternType = ['shape', 'color', 'size', 'complex'][Math.floor(Math.random() * 4)] as any;
    }

    const sequence: PatternElement[] = [];
    let correctAnswer: PatternElement;

    switch (patternType) {
      case 'shape':
        // Easy: Simple alternating (A-B-A-B)
        if (difficulty === 'easy') {
          const shapeA = shapes[0]; // circle
          const shapeB = shapes[1]; // square
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: i % 2 === 0 ? shapeA : shapeB,
              color: colors[0],
              size: 60
            });
          }
          correctAnswer = { shape: sequenceLength % 2 === 0 ? shapeA : shapeB, color: colors[0], size: 60 };
        }
        // Medium: Three-shape rotation (A-B-C-A-B-C)
        else if (difficulty === 'medium') {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: shapes[i % 3],
              color: colors[0],
              size: 60
            });
          }
          correctAnswer = { shape: shapes[sequenceLength % 3], color: colors[0], size: 60 };
        }
        // Hard: Complex pattern with size changes
        else {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: shapes[i % 4],
              color: colors[0],
              size: 50 + (i % 2) * 20
            });
          }
          correctAnswer = { shape: shapes[sequenceLength % 4], color: colors[0], size: 50 + (sequenceLength % 2) * 20 };
        }
        break;

      case 'color':
        // Easy: Two-color alternating
        if (difficulty === 'easy') {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'circle',
              color: colors[i % 2],
              size: 60
            });
          }
          correctAnswer = { shape: 'circle', color: colors[sequenceLength % 2], size: 60 };
        }
        // Medium: Three-color progression
        else if (difficulty === 'medium') {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'circle',
              color: colors[i % 3],
              size: 60
            });
          }
          correctAnswer = { shape: 'circle', color: colors[sequenceLength % 3], size: 60 };
        }
        // Hard: Rainbow progression
        else {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'circle',
              color: colors[i % colors.length],
              size: 60
            });
          }
          correctAnswer = { shape: 'circle', color: colors[sequenceLength % colors.length], size: 60 };
        }
        break;

      case 'size':
        // Easy: Two sizes alternating (small-big-small-big)
        if (difficulty === 'easy') {
          const sizes = [50, 70];
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'square',
              color: colors[0],
              size: sizes[i % 2]
            });
          }
          correctAnswer = { shape: 'square', color: colors[0], size: sizes[sequenceLength % 2] };
        }
        // Medium: Growing pattern (gets bigger each time)
        else if (difficulty === 'medium') {
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'square',
              color: colors[0],
              size: 40 + (i * 10)
            });
          }
          correctAnswer = { shape: 'square', color: colors[0], size: 40 + (sequenceLength * 10) };
        }
        // Hard: Complex size pattern (up-down-up-down)
        else {
          const sizes = [40, 60, 80, 60];
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push({
              shape: 'square',
              color: colors[0],
              size: sizes[i % 4]
            });
          }
          correctAnswer = { shape: 'square', color: colors[0], size: sizes[sequenceLength % 4] };
        }
        break;

      case 'complex':
        // Multi-attribute pattern (shape + color + size)
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push({
            shape: shapes[i % 2],
            color: colors[i % 3],
            size: 50 + (i % 2) * 15
          });
        }
        correctAnswer = {
          shape: shapes[sequenceLength % 2],
          color: colors[sequenceLength % 3],
          size: 50 + (sequenceLength % 2) * 15
        };
        break;
    }

    // Generate wrong options
    const options: PatternElement[] = [correctAnswer];
    while (options.length < 4) {
      const wrongOption: PatternElement = {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: [40, 50, 60, 70, 80][Math.floor(Math.random() * 5)],
        rotation: Math.floor(Math.random() * 8) * 45,
        animation: ['pulse', 'rotate', 'bounce'][Math.floor(Math.random() * 3)] as any
      };
      
      if (!options.some(opt => 
        opt.shape === wrongOption.shape && 
        opt.color === wrongOption.color && 
        opt.size === wrongOption.size
      )) {
        options.push(wrongOption);
      }
    }

    return {
      id: `enhanced-pattern-${level}`,
      sequence,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      type: patternType
    };
  };

  // Canvas drawing functions
  const drawShape = (ctx: CanvasRenderingContext2D, element: PatternElement, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    if (element.rotation) {
      ctx.rotate((element.rotation * Math.PI) / 180);
    }

    ctx.fillStyle = element.color;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    const size = element.size;
    switch (element.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'square':
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.strokeRect(-size/2, -size/2, size, size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.lineTo(size/2, size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'star':
        drawStar(ctx, 0, 0, 5, size/2, size/4);
        ctx.fill();
        ctx.stroke();
        break;
      case 'hexagon':
        drawHexagon(ctx, 0, 0, size/2);
        ctx.fill();
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  const createParticleEffect = () => {
    // Simple CSS animation instead of canvas particles
    const element = document.querySelector('.pattern-container');
    if (element) {
      element.classList.add('success-flash');
      setTimeout(() => element.classList.remove('success-flash'), 500);
    }
  };

  const createGameSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'enhanced-pattern-recognition',
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

  // Static canvas drawing - no animation
  useEffect(() => {
    if (!canvasRef.current || !currentPattern) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pattern sequence (static only)
    currentPattern.sequence.forEach((element, index) => {
      const x = 100 + (index * 120);
      const y = 100;
      drawShape(ctx, element, x, y);
    });

    // Draw question mark
    ctx.fillStyle = '#64748b';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', 100 + (currentPattern.sequence.length * 120), 110);
  }, [currentPattern]);

  useEffect(() => {
    setCurrentPattern(generateGradePattern(grade, currentRound, difficulty));
    if (user && !sessionId) {
      createGameSession();
    }
  }, [currentRound, user]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
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
    playSound('incorrect');
  };

  const handleAnswerSelect = (answer: PatternElement) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = JSON.stringify(answer) === JSON.stringify(currentPattern?.correctAnswer);
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSound('correct');
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = streak * 5;
      setScore(score + (currentLevel * 20) + timeBonus + streakBonus);
      setStreak(streak + 1);
      createParticleEffect();
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };

  const handleNextLevel = () => {
    if (isCorrect) {
      const nextRound = currentRound + 1;
      if (nextRound > maxRounds) {
        // Completed all rounds for this difficulty
        setShowCompletion(true);
        updateGameSession(true); // Mark as completed
        return;
      }
      setCurrentRound(nextRound);
    }
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(difficulty === 'easy' ? 45 : difficulty === 'medium' ? 35 : 25);
    updateGameSession(); // Update progress but don't mark as completed
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
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              Grade {grade} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-blue-600" />
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
              <div className="text-lg font-bold text-purple-600">{currentPattern.type}</div>
              <div className="text-sm text-muted-foreground">Pattern Type</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Game Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Complete the Advanced Pattern</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Canvas Pattern Display */}
            <div className="flex justify-center mb-8 pattern-container">
              <canvas 
                ref={canvasRef}
                className="border-2 border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50"
              />
            </div>

            <style jsx>{`
              .success-flash {
                animation: flash 0.5s ease-in-out;
              }
              @keyframes flash {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(34, 197, 94, 0.2); }
              }
            `}</style>

            {/* Enhanced Answer Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentPattern.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500 shadow-lg'
                        : 'bg-red-100 border-red-500 shadow-lg'
                      : showResult && JSON.stringify(option) === JSON.stringify(currentPattern.correctAnswer)
                      ? 'bg-green-100 border-green-500 shadow-lg'
                      : 'bg-gray-50 border-gray-200 hover:border-primary hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center h-20">
                    <div 
                      style={{
                        width: `${option.size}px`,
                        height: `${option.size}px`,
                        backgroundColor: option.color,
                        borderRadius: option.shape === 'circle' ? '50%' : '8px',
                        transform: option.rotation ? `rotate(${option.rotation}deg)` : 'none'
                      }}
                      className="border-2 border-gray-700"
                    />
                  </div>
                  
                  {showResult && selectedAnswer === option && (
                    <div className="absolute -top-2 -right-2">
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-green-600 bg-white rounded-full p-1" />
                      ) : (
                        <X className="w-6 h-6 text-red-600 bg-white rounded-full p-1" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Enhanced Result Message */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8"
              >
                <div className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 Brilliant Pattern Recognition!' : timeLeft === 0 ? '⏰ Time\'s Up!' : '❌ Keep Analyzing!'}
                </div>
                {isCorrect && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Time Bonus: +{Math.floor(timeLeft * 2)} • Streak Bonus: +{streak * 5}
                  </div>
                )}
                <Button onClick={handleNextLevel} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                  {isCorrect ? (currentRound < maxRounds ? 'Next Round' : 'Complete!') : 'Try Again'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-2">Advanced Pattern Recognition:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Analyze shapes, colors, sizes, and rotations</li>
              <li>• Identify the pattern rule across multiple attributes</li>
              <li>• Work quickly for time bonuses</li>
              <li>• Build streaks for extra points</li>
              <li>• Pattern complexity increases with grade level</li>
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
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnhancedPatternRecognition;