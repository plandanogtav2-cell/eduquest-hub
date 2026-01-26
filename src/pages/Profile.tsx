import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Target, Calendar, Edit, Sparkles, Award, Star, Medal, Calculator, FlaskConical, Brain, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  earned_at: string;
}

interface AvatarOption {
  emoji: string;
  color_scheme: string;
  name: string;
}

interface UserStats {
  totalQuizzes: number;
  totalPoints: number;
  averageScore: number;
  bestSubject: string;
}

const Profile = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<AvatarOption | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0,
    totalPoints: 0,
    averageScore: 0,
    bestSubject: 'None'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState<string>('');

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      medal: Medal,
      calculator: Calculator,
      flask: FlaskConical,
      brain: Brain,
      target: Target,
      zap: Zap,
      crown: Crown,
      award: Award,
      search: Target,
      shuffle: Zap,
      lightbulb: Star,
      eye: Target,
      'arrow-right': Zap,
      compass: Star,
      glasses: Target,
      link: Zap,
      'crystal-ball': Star,
      diamond: Trophy,
      infinity: Medal,
      triangle: Crown,
      'brain-circuit': Brain,
      coins: Trophy
    };
    return icons[iconName] || Star;
  };

  const getBadgeColor = (color: string) => {
    const colors: { [key: string]: string } = {
      gold: 'from-yellow-400 to-yellow-600',
      silver: 'from-gray-300 to-gray-500',
      bronze: 'from-amber-600 to-amber-800',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      blue: 'from-blue-400 to-blue-600'
    };
    return colors[color] || 'from-primary to-accent';
  };

  useEffect(() => {
    if (user && profile) {
      fetchProfileData();
    }
  }, [user, profile?.selected_avatar_id]);

  // Refresh data when component mounts or when coming back from avatar selection
  useEffect(() => {
    const handleFocus = () => {
      if (user && profile) {
        fetchProfileData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, profile]);

  const fetchProfileData = async () => {
    try {
      // Fetch avatar
      if (profile?.selected_avatar_id) {
        const { data: avatarData } = await supabase
          .from('avatar_options')
          .select('emoji, color_scheme, name')
          .eq('id', profile.selected_avatar_id)
          .single();
        
        setAvatar(avatarData);
      }

      // Fetch achievements
      const { data: achievementData } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements(
            id,
            name,
            description,
            icon,
            badge_color
          )
        `)
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      if (achievementData) {
        const formattedAchievements = achievementData.map(ua => ({
          id: ua.achievements.id,
          name: ua.achievements.name,
          description: ua.achievements.description,
          icon: ua.achievements.icon,
          badge_color: ua.achievements.badge_color,
          earned_at: ua.earned_at
        }));
        setAchievements(formattedAchievements);
      }

      // Fetch brain training game stats
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, level_reached, game_type, difficulty')
        .eq('user_id', user?.id);

      if (sessions && sessions.length > 0) {
        const totalPoints = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
        const completedGames = sessions.filter(s => s.level_reached >= 10).length;
        const avgScore = sessions.length > 0 ? Math.round(totalPoints / sessions.length) : 0;

        // Calculate best game type
        const gameScores: { [key: string]: number[] } = {};
        sessions.forEach(session => {
          const gameType = session.game_type || 'unknown';
          if (!gameScores[gameType]) gameScores[gameType] = [];
          gameScores[gameType].push(session.score || 0);
        });

        let bestGame = 'None';
        let bestAvg = 0;
        Object.entries(gameScores).forEach(([game, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg > bestAvg) {
            bestAvg = avg;
            bestGame = game === 'pattern-recognition' ? 'Pattern Recognition' :
                      game === 'sequencing' ? 'Sequencing' :
                      game === 'deductive-reasoning' ? 'Deductive Reasoning' : 'Brain Training';
          }
        });

        setStats({
          totalQuizzes: sessions.length,
          totalPoints,
          averageScore: avgScore,
          bestSubject: bestGame
        });
      }

      // Get joined date
      if (profile?.created_at) {
        const date = new Date(profile.created_at);
        setJoinedDate(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <div className="glass-card rounded-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {avatar ? (
                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${avatar.color_scheme} flex items-center justify-center`}>
                    <div className="text-7xl">{avatar.emoji}</div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <div className="text-7xl">👤</div>
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => navigate('/avatar')}
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold mb-2">{profile?.full_name || 'Student'}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Grade {profile?.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {joinedDate}</span>
                    </div>
                  </div>
                  {avatar && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <Sparkles className="w-4 h-4" />
                      {avatar.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button onClick={() => navigate('/settings')} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={() => navigate('/avatar')} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
              <div className="text-3xl font-bold text-foreground mb-1">{stats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Target className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <div className="text-3xl font-bold text-foreground mb-1">{stats.totalQuizzes}</div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <div className="text-3xl font-bold text-foreground mb-1">{stats.averageScore}</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <div className="text-xl font-bold text-foreground mb-1">{stats.bestSubject}</div>
              <div className="text-sm text-muted-foreground">Best Game</div>
            </motion.div>
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">About Me</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                👋 Hi! I'm {profile?.full_name}, a Grade {profile?.grade} student at Alabang Elementary School.
              </p>
              <p>
                📚 I've completed {stats.totalQuizzes} brain training game{stats.totalQuizzes !== 1 ? 's' : ''} and earned {stats.totalPoints} points so far!
              </p>
              {stats.bestSubject !== 'None' && (
                <p>
                  ⭐ My best game is {stats.bestSubject} with an average score of {stats.averageScore} points.
                </p>
              )}
              <p>
                🎯 Keep learning and have fun!
              </p>
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <h3 className="text-2xl font-bold mb-6">My Achievements ({achievements.length})</h3>
            {achievements.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No achievements earned yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Complete brain training games to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => {
                  const IconComponent = getIcon(achievement.icon);
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="glass-card rounded-2xl p-6 text-center"
                    >
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getBadgeColor(achievement.badge_color)} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="font-bold mb-2">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;