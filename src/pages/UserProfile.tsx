import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star, Medal, Calculator, FlaskConical, Brain, Target, Zap, Crown, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

interface UserProfile {
  user_id: string;
  full_name: string;
  grade: string;
  avatar_emoji?: string;
  avatar_color?: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
  achievements: {
    name: string;
    description: string;
    icon: string;
    badge_color: string;
  };
}

interface UserStats {
  totalPoints: number;
  totalQuizzes: number;
  mathQuizzes: number;
  scienceQuizzes: number;
  logicQuizzes: number;
  perfectScores: number;
  averageScore: number;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    totalQuizzes: 0,
    mathQuizzes: 0,
    scienceQuizzes: 0,
    logicQuizzes: 0,
    perfectScores: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          grade,
          selected_avatar_id,
          avatar_options!profiles_selected_avatar_id_fkey(
            emoji,
            color_scheme
          )
        `)
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile({
        user_id: profileData.user_id,
        full_name: profileData.full_name,
        grade: profileData.grade,
        avatar_emoji: profileData.avatar_options?.emoji,
        avatar_color: profileData.avatar_options?.color_scheme
      });

      // Fetch user achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          earned_at,
          achievements!inner(
            name,
            description,
            icon,
            badge_color
          )
        `)
        .eq('user_id', userId)
        .neq('achievements.badge_color', 'disabled');

      if (achievementsError) throw achievementsError;

      setAchievements(achievementsData || []);

      // Fetch user quiz stats
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('score, quiz_id, quizzes(subject)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (attemptsError) throw attemptsError;

      // Calculate stats
      if (attempts) {
        const userStats = {
          totalPoints: attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0),
          totalQuizzes: attempts.length,
          mathQuizzes: attempts.filter(a => a.quizzes?.subject === 'math').length,
          scienceQuizzes: attempts.filter(a => a.quizzes?.subject === 'science').length,
          logicQuizzes: attempts.filter(a => a.quizzes?.subject === 'logic').length,
          perfectScores: attempts.filter(a => (a.score || 0) === 100).length,
          averageScore: attempts.length > 0 ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length : 0
        };
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      award: Award
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">This user profile could not be found.</p>
          <Button onClick={() => navigate('/leaderboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/leaderboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-6">
            {profile.avatar_emoji && profile.avatar_color && (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${profile.avatar_color} flex items-center justify-center text-4xl`}>
                {profile.avatar_emoji}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
              <p className="text-muted-foreground text-lg">Grade {profile.grade} Student</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{stats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <div className="text-sm text-muted-foreground">Quizzes</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Star className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{stats.perfectScores}</div>
            <div className="text-sm text-muted-foreground">Perfect Scores</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{Math.round(stats.averageScore)}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-4 text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Badges</div>
          </motion.div>
        </div>

        {/* Subject Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-4">Subject Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl">
              <Calculator className="w-8 h-8 text-primary" />
              <div>
                <div className="font-bold">{stats.mathQuizzes} Math Quizzes</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl">
              <FlaskConical className="w-8 h-8 text-success" />
              <div>
                <div className="font-bold">{stats.scienceQuizzes} Science Quizzes</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl">
              <Brain className="w-8 h-8 text-accent" />
              <div>
                <div className="font-bold">{stats.logicQuizzes} Logic Quizzes</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-6">Achievements ({achievements.length})</h3>
          {achievements.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No achievements earned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const IconComponent = getIcon(achievement.achievements.icon);
                return (
                  <motion.div
                    key={achievement.achievement_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-card rounded-2xl p-6 text-center"
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getBadgeColor(achievement.achievements.badge_color)} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">{achievement.achievements.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.achievements.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;