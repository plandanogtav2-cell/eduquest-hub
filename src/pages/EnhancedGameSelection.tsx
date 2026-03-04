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
          route: '/game/pattern-recognition/play',
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
          route: '/game/sequencing/play',
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
          route: '/game/deductive-reasoning/play',
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
      <div className="p-4 lg:p-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎮 {currentGame.title}</h1>
          <p className="text-muted-foreground text-lg">{currentGame.subtitle}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Choose Your Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['easy', 'medium', 'hard'].map((diff) => {
              const isCompleted = completedDifficulties.has(diff);
              const isSelected = selectedDifficulty === diff;
              const diffEmoji = diff === 'easy' ? '🌱' : diff === 'medium' ? '🔥' : '⚡';
              
              return (
                <Card 
                  key={diff}
                  className={`cursor-pointer transition-all hover:shadow-lg group ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl capitalize flex items-center gap-2">
                        <span className="text-2xl">{diffEmoji}</span>
                        {diff}
                      </CardTitle>
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl mb-3">
                      {diff === 'easy' ? '⭐' : diff === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {diff === 'easy' && 'Perfect for beginners'}
                      {diff === 'medium' && 'Balanced challenge'}
                      {diff === 'hard' && 'Expert level'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => handlePlayGame(currentGame.modes[0])}
            className="px-8 h-12 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Playing
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedGameSelection;