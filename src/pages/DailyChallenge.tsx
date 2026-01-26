import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface DailyChallengeData {
  type: 'math' | 'logic' | 'memory' | 'riddle';
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

const DailyChallenge = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [challenge, setChallenge] = useState<DailyChallengeData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [completed, setCompleted] = useState(false);

  const challenges: DailyChallengeData[] = [
    {
      type: 'math',
      question: 'If you have 3 apples and give away 1, then buy 4 more, how many apples do you have?',
      options: ['5', '6', '7', '8'],
      correctAnswer: '6',
      points: 100
    },
    {
      type: 'logic',
      question: 'What comes next in this sequence: 2, 4, 8, 16, ?',
      options: ['24', '32', '20', '18'],
      correctAnswer: '32',
      points: 150
    },
    {
      type: 'memory',
      question: 'Which of these is NOT a primary color?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctAnswer: 'Green',
      points: 75
    },
    {
      type: 'riddle',
      question: 'I have keys but no locks. I have space but no room. What am I?',
      options: ['A piano', 'A keyboard', 'A map', 'A book'],
      correctAnswer: 'A keyboard',
      points: 200
    },
    {
      type: 'math',
      question: 'What is 15% of 80?',
      options: ['10', '12', '15', '20'],
      correctAnswer: '12',
      points: 125
    },
    {
      type: 'logic',
      question: 'If all roses are flowers and some flowers are red, which must be true?',
      options: ['All roses are red', 'Some roses might be red', 'No roses are red', 'All flowers are roses'],
      correctAnswer: 'Some roses might be red',
      points: 175
    }
  ];

  useEffect(() => {
    const today = new Date().toDateString();
    const dayIndex = new Date().getDate() % challenges.length;
    setChallenge(challenges[dayIndex]);
    checkIfCompleted(today);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !completed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, completed]);

  const checkIfCompleted = async (today: string) => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', 'daily-challenge')
        .gte('created_at', today)
        .limit(1);
        
      if (data && data.length > 0) {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error checking daily challenge:', error);
    }
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult || completed) return;
    
    setSelectedAnswer(answer);
    const correct = answer === challenge?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      saveDailyChallenge(challenge!.points);
    }
  };

  const saveDailyChallenge = async (points: number) => {
    if (!user) return;
    
    try {
      await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          game_type: 'daily-challenge',
          difficulty: 'daily',
          grade: user.profile?.grade || 4,
          level_reached: 1,
          score: points,
          streak: 1,
          completed_at: new Date().toISOString()
        });
        
      setCompleted(true);
    } catch (error) {
      console.error('Error saving daily challenge:', error);
    }
  };

  if (!challenge) {
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
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
              Daily Challenge
            </div>
            {!completed && (
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium">{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Today's Brain Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {completed ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Challenge Completed!</h2>
                <p className="text-gray-600 mb-6">Come back tomorrow for a new challenge!</p>
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {challenge.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{challenge.points} points</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{challenge.question}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {challenge.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-100 border-green-500'
                            : 'bg-red-100 border-red-500'
                          : showResult && option === challenge.correctAnswer
                          ? 'bg-green-100 border-green-500'
                          : 'bg-gray-50 border-gray-200 hover:border-primary'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className={`text-2xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '🎉 Correct!' : timeLeft === 0 ? '⏰ Time\'s Up!' : '❌ Try Again Tomorrow!'}
                    </div>
                    {isCorrect && (
                      <p className="text-gray-600 mb-4">You earned {challenge.points} bonus points!</p>
                    )}
                    <Button onClick={() => navigate('/dashboard')}>
                      Back to Dashboard
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DailyChallenge;