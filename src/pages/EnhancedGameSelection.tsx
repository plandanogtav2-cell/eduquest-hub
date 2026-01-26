import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Star, Zap, Brain, Clock, Trophy, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface GameMode {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  route: string;
  enhanced: boolean;
}

const EnhancedGameSelection = () => {
  const navigate = useNavigate();
  const { gameType } = useParams();
  const { user } = useAuthStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [completedDifficulties, setCompletedDifficulties] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchCompletedDifficulties();
    }
  }, [user, gameType]);

  const fetchCompletedDifficulties = async () => {
    if (!user) return;
    
    try {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('difficulty, completed_at')
        .eq('user_id', user.id)
        .eq('game_type', `enhanced-${gameType}`)
        .not('completed_at', 'is', null);

      if (sessions) {
        const completed = new Set(sessions.map(s => s.difficulty));
        setCompletedDifficulties(completed);
      }
    } catch (error) {
      console.error('Error fetching completed difficulties:', error);
    }
  };

  const gameConfigs = {
    'pattern-recognition': {
      title: 'Pattern Recognition',
      subtitle: 'Enhance visual-spatial intelligence',
      modes: [
        {
          id: 'enhanced',
          name: 'Pattern Recognition',
          description: 'Advanced patterns with animations and complex logic',
          features: ['Multi-attribute patterns', 'Canvas animations', 'Time bonuses', 'Particle effects', 'Grade-adaptive difficulty'],
          icon: <Zap className="w-6 h-6" />,
          route: '/game/enhanced-pattern-recognition',
          enhanced: true
        }
      ]
    },
    'sequencing': {
      title: 'Sequencing',
      subtitle: 'Develop logical ordering skills',
      modes: [
        {
          id: 'enhanced',
          name: 'Sequencing',
          description: 'Advanced sequencing with rich interactions',
          features: ['Drag & drop physics', 'Grade-appropriate content', 'Detailed descriptions', 'Time challenges', 'Category-based learning'],
          icon: <Brain className="w-6 h-6" />,
          route: '/game/enhanced-sequencing',
          enhanced: true
        }
      ]
    },
    'deductive-reasoning': {
      title: 'Deductive Reasoning',
      subtitle: 'Master logical thinking and problem-solving',
      modes: [
        {
          id: 'enhanced',
          name: 'Deductive Reasoning',
          description: 'Complex logic grids with advanced reasoning',
          features: ['Logic grids', 'Multi-step reasoning', 'Hint system', 'Note-taking', 'Complex scoring', 'Grade-level adaptation'],
          icon: <Brain className="w-6 h-6" />,
          route: '/game/enhanced-deductive-reasoning',
          enhanced: true
        }
      ]
    }
  };

  const currentGame = gameConfigs[gameType as keyof typeof gameConfigs];

  if (!currentGame) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Game Not Found</h1>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePlayGame = (mode: GameMode) => {
    const userGrade = user?.profile?.grade || 4;
    const params = new URLSearchParams({
      difficulty: selectedDifficulty,
      grade: userGrade.toString()
    });
    navigate(`${mode.route}?${params.toString()}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">{currentGame.title}</h1>
            <p className="text-gray-600">{currentGame.subtitle}</p>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Grade Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Grade Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Your Grade: {user?.profile?.grade || 4}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Your games are customized for your grade level
              </p>
            </CardContent>
          </Card>

          {/* Difficulty Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['easy', 'medium', 'hard'].map((difficulty) => {
                  const isCompleted = completedDifficulties.has(difficulty);
                  return (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`w-full justify-start h-12 relative ${
                        selectedDifficulty === difficulty ? getDifficultyColor(difficulty) : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="capitalize font-medium">{difficulty}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm opacity-75">
                            {difficulty === 'easy' ? '⭐' : difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                          </span>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Higher difficulty = more points and challenges
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Mode */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {currentGame.modes[0].icon}
                    {currentGame.modes[0].name}
                  </CardTitle>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ENHANCED
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{currentGame.modes[0].description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {currentGame.modes[0].features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handlePlayGame(currentGame.modes[0])}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Game Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Adaptive Learning</h3>
                <p className="text-sm text-gray-600">
                  Content automatically adjusts to your grade level and performance
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Progress Tracking</h3>
                <p className="text-sm text-gray-600">
                  Earn points, build streaks, and unlock achievements
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Enhanced Experience</h3>
                <p className="text-sm text-gray-600">
                  Interactive animations, sound effects, and engaging gameplay
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedGameSelection;