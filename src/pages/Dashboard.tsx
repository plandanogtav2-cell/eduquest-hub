import { motion } from 'framer-motion';
import { Brain, Puzzle, Target, Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestStreak: 0,
    brainPoints: 0
  });
  const [gameCompletions, setGameCompletions] = useState<Record<string, number>>({}); // Track completed difficulties per game
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGameStats();
      checkDailyChallenge();
    }
  }, [user]);

  const handleDailyChallenge = () => {
    navigate('/daily-challenge');
  };
  const checkDailyChallenge = async () => {
    if (!user) return;
    
    const today = new Date().toDateString();
    try {
      const { data } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', 'daily-challenge')
        .gte('created_at', today)
        .limit(1);
        
      setDailyChallengeCompleted(data && data.length > 0);
    } catch (error) {
      console.error('Error checking daily challenge:', error);
    }
  };

  const fetchGameStats = async () => {
    if (!user) return;
    
    try {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, streak, level_reached, game_type, difficulty, completed_at')
        .eq('user_id', user.id);

      if (sessions && sessions.length > 0) {
        const gamesPlayed = sessions.length;
        const brainPoints = sessions.reduce((total, session) => total + (session.score || 0), 0);
        const bestStreak = Math.max(...sessions.map(session => session.streak || 0));
        
        setStats({
          gamesPlayed,
          bestStreak,
          brainPoints
        });
        
        // Count completed difficulties per game (completed_at is not null)
        const completions: Record<string, number> = {};
        sessions.forEach(session => {
          if (session.completed_at) {
            // Convert enhanced game types to base game types for counting
            let gameType = session.game_type;
            if (gameType.startsWith('enhanced-')) {
              gameType = gameType.replace('enhanced-', '');
            }
            
            // Skip daily challenge from regular game completions
            if (gameType === 'daily-challenge') return;
            
            const key = `${gameType}-${session.difficulty}`;
            if (!completions[gameType]) completions[gameType] = 0;
            if (!completions[key]) {
              completions[gameType]++;
              completions[key] = 1;
            }
          }
        });
        setGameCompletions(completions);
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  const games = [
    {
      id: 'pattern-recognition',
      title: 'Pattern Recognition',
      description: 'Complete visual patterns with shapes, colors, and symbols',
      icon: Puzzle,
      color: 'from-blue-500 to-purple-600',
      difficulty: 'Easy to Hard',
      levels: 50
    },
    {
      id: 'sequencing',
      title: 'Sequencing',
      description: 'Arrange items in correct logical order',
      icon: Target,
      color: 'from-green-500 to-teal-600',
      difficulty: 'Medium',
      levels: 40
    },
    {
      id: 'deductive-reasoning',
      title: 'Deductive Reasoning',
      description: 'Identify and apply simple rules using clues',
      icon: Brain,
      color: 'from-orange-500 to-red-600',
      difficulty: 'Hard',
      levels: 30
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || 'Player'}!</h1>
          <p className="text-muted-foreground text-lg">
            Ready to challenge your brain? Choose a game to start training your logical thinking.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
                <p className="text-xs text-muted-foreground">Start your first game!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bestStreak}</div>
                <p className="text-xs text-muted-foreground">Consecutive correct answers</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brain Points</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.brainPoints}</div>
                <p className="text-xs text-muted-foreground">Earn points by playing games</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Choose Your Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => {
              const Icon = game.icon;
              const completedCount = gameCompletions[game.id] || 0;
              const isFullyCompleted = completedCount >= 3; // All 3 difficulties completed
              
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="relative"
                >
                  {isFullyCompleted && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-yellow-500 text-white rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                  
                  <Card className={`h-full hover:shadow-lg transition-shadow cursor-pointer group ${
                    isFullyCompleted ? 'bg-yellow-50 border-yellow-200' : ''
                  }`}>
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{game.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{game.difficulty}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium">{completedCount}/3 difficulties</span>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => navigate(`/game/${game.id}/select`)}
                        >
                          Start Playing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Daily Challenge
              </CardTitle>
              <CardDescription className="text-purple-100">
                Complete today's special challenge for bonus brain points!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary" 
                className={`bg-white hover:bg-purple-50 ${
                  dailyChallengeCompleted 
                    ? 'text-green-600 border-green-200' 
                    : 'text-purple-600'
                }`}
                onClick={handleDailyChallenge}
                disabled={dailyChallengeCompleted}
              >
                {dailyChallengeCompleted ? '✅ Completed Today!' : 'Start Daily Challenge'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;