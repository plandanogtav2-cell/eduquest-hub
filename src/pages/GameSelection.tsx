import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Shield, Flame, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const GameSelection = () => {
  const navigate = useNavigate();
  const { gameType } = useParams();
  const { profile, user } = useAuthStore();
  const [completedDifficulties, setCompletedDifficulties] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && gameType) {
      fetchCompletedDifficulties();
    }
  }, [user, gameType]);

  const fetchCompletedDifficulties = async () => {
    if (!user || !gameType) return;
    
    try {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('difficulty, level_reached')
        .eq('user_id', user.id)
        .eq('game_type', gameType)
        .gte('level_reached', 10); // Completed all 10 levels
        
      if (sessions) {
        const completed = new Set(sessions.map(session => session.difficulty));
        setCompletedDifficulties(completed);
      }
    } catch (error) {
      console.error('Error fetching completed difficulties:', error);
    }
  };

  const gameInfo = {
    'pattern-recognition': {
      title: 'Pattern Recognition',
      description: 'Complete visual patterns with shapes, colors, and symbols',
      icon: '🧩'
    },
    'sequencing': {
      title: 'Sequencing',
      description: 'Arrange items in correct logical order',
      icon: '🎯'
    },
    'deductive-reasoning': {
      title: 'Deductive Reasoning',
      description: 'Identify and apply simple rules using clues',
      icon: '🧠'
    }
  };

  const difficulties = [
    {
      level: 'easy',
      title: 'Easy',
      description: 'Perfect for beginners',
      icon: Zap,
      color: 'from-green-400 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      gradeRange: profile?.grade === 4 ? 'Grade 4 Level' : 'Beginner Level'
    },
    {
      level: 'medium',
      title: 'Medium',
      description: 'Good challenge level',
      icon: Shield,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradeRange: profile?.grade === 5 ? 'Grade 5 Level' : 'Intermediate Level'
    },
    {
      level: 'hard',
      title: 'Hard',
      description: 'For advanced players',
      icon: Flame,
      color: 'from-red-400 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      gradeRange: profile?.grade === 6 ? 'Grade 6 Level' : 'Advanced Level'
    }
  ];

  const currentGame = gameInfo[gameType as keyof typeof gameInfo];

  if (!currentGame) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDifficultySelect = (difficulty: string) => {
    navigate(`/game/${gameType}/play?difficulty=${difficulty}&grade=${profile?.grade || 4}`);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">{currentGame.icon}</div>
          <h1 className="text-4xl font-bold mb-4">{currentGame.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{currentGame.description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
            <span className="text-sm font-medium">Grade {profile?.grade || 4} Player</span>
          </div>
        </motion.div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficulties.map((diff, index) => {
              const Icon = diff.icon;
              const isRecommended = 
                (profile?.grade === 4 && diff.level === 'easy') ||
                (profile?.grade === 5 && diff.level === 'medium') ||
                (profile?.grade === 6 && diff.level === 'hard');
              
              const isCompleted = completedDifficulties.has(diff.level);

              return (
                <motion.div
                  key={diff.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Recommended
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                  
                  <Card className={`h-full hover:shadow-lg transition-all cursor-pointer group ${
                    isRecommended ? 'ring-2 ring-primary' : ''
                  } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                    <CardHeader className="text-center">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${diff.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{diff.title}</CardTitle>
                      <CardDescription>{diff.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className={`${diff.bgColor} ${diff.textColor} px-3 py-2 rounded-lg mb-4 font-medium`}>
                        {diff.gradeRange}
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleDifficultySelect(diff.level)}
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isCompleted ? `Play Again` : `Start ${diff.title}`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Grade-based Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3">💡 Tips for Grade {profile?.grade || 4} Students:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Easy:</strong> Start here to learn the basics and build confidence
                </div>
                <div>
                  <strong>Medium:</strong> Challenge yourself once you master the easy level
                </div>
                <div>
                  <strong>Hard:</strong> Test your skills with complex problems
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default GameSelection;