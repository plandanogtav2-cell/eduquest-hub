import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, BarChart3, Brain, Puzzle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

const ProgressTracker = () => {
  const { user, profile } = useAuthStore();
  const [progressData, setProgressData] = useState({
    totalGames: 0,
    totalPoints: 0,
    averageScore: 0,
    gamePoints: { 'pattern-recognition': 0, 'sequencing': 0, 'deductive-reasoning': 0 },
    completedDifficulties: { 'pattern-recognition': 0, 'sequencing': 0, 'deductive-reasoning': 0 },
    bestStreak: 0
  });

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    // Fetch game sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('All sessions:', sessions);

    if (sessions) {
      const totalGames = sessions.length;
      const totalPoints = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = totalGames > 0 ? Math.round(totalPoints / totalGames) : 0;
      const bestStreak = Math.max(...sessions.map(s => s.streak || 0), 0);

      // Calculate total points per game type (handle both old and new naming)
      const patternSessions = sessions.filter(s => 
        s.game_type === 'pattern-recognition' || 
        s.game_type === 'pattern_recognition' ||
        s.game_type === 'Pattern Recognition' ||
        s.game_type === 'enhanced-pattern-recognition'
      );
      const sequencingSessions = sessions.filter(s => 
        s.game_type === 'sequencing' || 
        s.game_type === 'Sequencing' ||
        s.game_type === 'enhanced-sequencing'
      );
      const deductiveSessions = sessions.filter(s => 
        s.game_type === 'deductive-reasoning' || 
        s.game_type === 'deductive_reasoning' ||
        s.game_type === 'Deductive Reasoning' ||
        s.game_type === 'enhanced-deductive-reasoning'
      );
      
      const gamePoints = {
        'pattern-recognition': patternSessions.reduce((sum, s) => sum + (s.score || 0), 0),
        'sequencing': sequencingSessions.reduce((sum, s) => sum + (s.score || 0), 0),
        'deductive-reasoning': deductiveSessions.reduce((sum, s) => sum + (s.score || 0), 0)
      };

      // Log game types to debug
      const gameTypes = [...new Set(sessions.map(s => s.game_type))];
      console.log('Unique game types in database:', gameTypes);
      console.log('Pattern Recognition sessions:', patternSessions.length, 'points:', gamePoints['pattern-recognition']);
      console.log('Sequencing sessions:', sequencingSessions.length, 'points:', gamePoints['sequencing']);
      console.log('Deductive Reasoning sessions:', deductiveSessions.length, 'points:', gamePoints['deductive-reasoning']);
      console.log('Game points breakdown:', gamePoints);
      console.log('Total points:', totalPoints);

      // Count completed difficulties (check if completed_at is set)
      const completedDifficulties = {
        'pattern-recognition': new Set(patternSessions.filter(s => s.completed_at !== null).map(s => s.difficulty)).size,
        'sequencing': new Set(sequencingSessions.filter(s => s.completed_at !== null).map(s => s.difficulty)).size,
        'deductive-reasoning': new Set(deductiveSessions.filter(s => s.completed_at !== null).map(s => s.difficulty)).size
      };

      console.log('Pattern sessions with level_reached:', patternSessions.map(s => ({ level: s.level_reached, difficulty: s.difficulty, completed: s.completed_at })));
      console.log('Completed difficulties:', completedDifficulties);

      setProgressData({
        totalGames,
        totalPoints,
        averageScore,
        gamePoints,
        completedDifficulties,
        bestStreak
      });
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'pattern-recognition': return Puzzle;
      case 'sequencing': return Target;
      case 'deductive-reasoning': return Brain;
      default: return Zap;
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'pattern-recognition': return 'Pattern Recognition';
      case 'sequencing': return 'Sequencing';
      case 'deductive-reasoning': return 'Deductive Reasoning';
      default: return gameType;
    }
  };

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'pattern-recognition': return 'bg-blue-500 text-white';
      case 'sequencing': return 'bg-green-500 text-white';
      case 'deductive-reasoning': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Brain Training Progress</h2>
          <p className="text-muted-foreground">
            Track your progress across all brain training games and see how your logical thinking is improving.
          </p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Games Played</span>
            </div>
            <p className="text-3xl font-bold">{progressData.totalGames}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Brain Points</span>
            </div>
            <p className="text-3xl font-bold">{progressData.totalPoints}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Average Score</span>
            </div>
            <p className={`text-3xl font-bold ${getProgressColor(progressData.averageScore)}`}>
              {progressData.averageScore}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-3xl font-bold">{progressData.bestStreak}</p>
          </motion.div>
        </div>

        {/* Game Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Game Performance</h3>
          <div className="space-y-6">
            {Object.entries(progressData.gamePoints).map(([gameType, points]) => {
              const Icon = getGameIcon(gameType);
              const completedCount = progressData.completedDifficulties[gameType as keyof typeof progressData.completedDifficulties];
              return (
                <div key={gameType} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getGameColor(gameType)} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{getGameName(gameType)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">{points} points</span>
                      <div className="text-xs text-muted-foreground">{completedCount}/3 difficulties</div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getGameColor(gameType)}`}
                      style={{ width: `${Math.min((completedCount / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Learning Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Brain Training Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">Strengths</h4>
              {Object.entries(progressData.gamePoints)
                .filter(([_, points]) => points >= 500)
                .map(([gameType, points]) => (
                  <div key={gameType} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{getGameName(gameType)}: {points} total points</span>
                  </div>
                ))}
              {Object.entries(progressData.gamePoints).every(([_, points]) => points < 500) && (
                <p className="text-muted-foreground text-sm">Keep practicing to build your strengths!</p>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-yellow-600">Areas for Improvement</h4>
              {Object.entries(progressData.gamePoints)
                .filter(([_, points]) => points < 500)
                .map(([gameType, points]) => (
                  <div key={gameType} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>{getGameName(gameType)}: {points} total points</span>
                  </div>
                ))}
              {Object.entries(progressData.gamePoints).every(([_, points]) => points >= 500) && (
                <p className="text-muted-foreground text-sm">Excellent! You're excelling in all games!</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-bold mb-4">Keep Training Your Brain!</h3>
          <p className="text-muted-foreground mb-6">
            {progressData.totalGames === 0 
              ? "Start your brain training journey by playing your first game!"
              : progressData.averageScore >= 80
              ? "Outstanding! Your logical thinking skills are sharp. Keep challenging yourself!"
              : progressData.averageScore >= 60
              ? "Great progress! Keep practicing to boost your brain power."
              : "Every genius starts somewhere. Keep training and watch your mind grow stronger!"
            }
          </p>
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-primary to-accent">
              Continue Training
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProgressTracker;