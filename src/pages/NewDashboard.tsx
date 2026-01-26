import { motion } from 'framer-motion';
import { Brain, Puzzle, Target, Trophy, User, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

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
                <div className="text-2xl font-bold">0</div>
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
                <div className="text-2xl font-bold">0</div>
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
                <div className="text-2xl font-bold">0</div>
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
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
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
                          <span className="text-muted-foreground">Levels:</span>
                          <span className="font-medium">{game.levels}</span>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => navigate(`/game/${game.id}`)}
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
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                Start Daily Challenge
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;