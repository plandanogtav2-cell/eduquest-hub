import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import { ArrowLeft, Play, Star, Zap, Brain, Clock, Trophy, GraduationCap, CheckCircle, Sparkles, Flame, Puzzle, Target } from 'lucide-react';
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
      icon: Puzzle,
      color: 'from-blue-500 to-purple-600',
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
      icon: Target,
      color: 'from-green-500 to-teal-600',
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
      icon: Brain,
      color: 'from-orange-500 to-red-600',
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${currentGame.color} mb-4 shadow-xl`}>
              {React.createElement(currentGame.icon, { className: 'w-10 h-10 text-white' })}
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentGame.title}
            </h1>
            <p className="text-lg text-gray-600">{currentGame.subtitle}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Difficulty</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['easy', 'medium', 'hard'].map((diff, index) => {
                const isCompleted = completedDifficulties.has(diff);
                const isSelected = selectedDifficulty === diff;
                const diffConfig = {
                  easy: { gradient: 'from-green-400 to-emerald-500', icon: 'Sparkles', stars: 1 },
                  medium: { gradient: 'from-yellow-400 to-orange-500', icon: 'Zap', stars: 2 },
                  hard: { gradient: 'from-red-400 to-pink-500', icon: 'Flame', stars: 3 }
                }[diff];
                
                return (
                  <motion.div
                    key={diff}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-2xl group bg-white/80 backdrop-blur ${
                        isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : ''
                      }`}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <CardTitle className="text-2xl capitalize font-bold">{diff}</CardTitle>
                          {isCompleted && (
                            <div className="bg-green-100 rounded-full p-1">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${diffConfig.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                          {diff === 'easy' && <Sparkles className="w-10 h-10 text-white" />}
                          {diff === 'medium' && <Zap className="w-10 h-10 text-white" />}
                          {diff === 'hard' && <Flame className="w-10 h-10 text-white" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-1 mb-4">
                          {[...Array(diffConfig.stars)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {diff === 'easy' && 'Perfect for beginners'}
                          {diff === 'medium' && 'Balanced challenge'}
                          {diff === 'hard' && 'Expert level'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              onClick={() => handlePlayGame(currentGame.modes[0])}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg px-10 py-6 shadow-xl hover:shadow-glow transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedGameSelection;