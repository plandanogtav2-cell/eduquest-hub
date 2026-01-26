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
    gameProgress: { 'pattern-recognition': 0, 'sequencing': 0, 'deductive-reasoning': 0 },
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
      .eq('user_id', user.id);

    if (sessions) {
      const totalGames = sessions.length;
      const totalPoints = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = totalGames > 0 ? Math.round(totalPoints / totalGames) : 0;
      const bestStreak = Math.max(...sessions.map(s => s.streak || 0), 0);

      // Calculate game progress (average scores)
      const gameStats = { 'pattern-recognition': [], 'sequencing': [], 'deductive-reasoning': [] };
      sessions.forEach(session => {
        const gameType = session.game_type;
        if (gameType && gameStats[gameType as keyof typeof gameStats]) {
          gameStats[gameType as keyof typeof gameStats].push(session.score || 0);
        }
      });

      const gameProgress = {
        'pattern-recognition': gameStats['pattern-recognition'].length > 0 ? Math.round(gameStats['pattern-recognition'].reduce((a, b) => a + b, 0) / gameStats['pattern-recognition'].length) : 0,
        'sequencing': gameStats['sequencing'].length > 0 ? Math.round(gameStats['sequencing'].reduce((a, b) => a + b, 0) / gameStats['sequencing'].length) : 0,
        'deductive-reasoning': gameStats['deductive-reasoning'].length > 0 ? Math.round(gameStats['deductive-reasoning'].reduce((a, b) => a + b, 0) / gameStats['deductive-reasoning'].length) : 0
      };

      // Count completed difficulties (level_reached >= 10)
      const completedDifficulties = {
        'pattern-recognition': sessions.filter(s => s.game_type === 'pattern-recognition' && s.level_reached >= 10).length,
        'sequencing': sessions.filter(s => s.game_type === 'sequencing' && s.level_reached >= 10).length,
        'deductive-reasoning': sessions.filter(s => s.game_type === 'deductive-reasoning' && s.level_reached >= 10).length
      };

      setProgressData({
        totalGames,
        totalPoints,
        averageScore,
        gameProgress,
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
            {Object.entries(progressData.gameProgress).map(([gameType, score]) => {
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
                      <span className={`font-bold ${getProgressColor(score)}`}>{score} avg</span>
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
              {Object.entries(progressData.gameProgress)
                .filter(([_, score]) => score >= 70)
                .map(([gameType, score]) => (
                  <div key={gameType} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{getGameName(gameType)}: {score} avg points</span>
                  </div>
                ))}
              {Object.entries(progressData.gameProgress).every(([_, score]) => score < 70) && (
                <p className="text-muted-foreground text-sm">Keep practicing to build your strengths!</p>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-yellow-600">Areas for Improvement</h4>
              {Object.entries(progressData.gameProgress)
                .filter(([_, score]) => score < 70)
                .map(([gameType, score]) => (
                  <div key={gameType} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>{getGameName(gameType)}: {score} avg points</span>
                  </div>
                ))}
              {Object.entries(progressData.gameProgress).every(([_, score]) => score >= 70) && (
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