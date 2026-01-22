import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, ArrowLeft, Star, Medal, Calculator, FlaskConical, Brain, Zap, Crown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import DashboardLayout from '@/components/DashboardLayout';

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

interface ProfileData {
  full_name: string;
  grade: string;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isTeacher = role === 'admin' || role === 'super_admin';
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatar, setAvatar] = useState<AvatarOption | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0,
    totalPoints: 0,
    averageScore: 0,
    bestSubject: 'None'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, grade, selected_avatar_id')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        navigate(isTeacher ? '/teacher' : '/leaderboard');
        return;
      }

      setProfile(profileData);

      // Fetch avatar
      if (profileData.selected_avatar_id) {
        const { data: avatarData } = await supabase
          .from('avatar_options')
          .select('emoji, color_scheme, name')
          .eq('id', profileData.selected_avatar_id)
          .single();
        
        setAvatar(avatarData);
      }

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

      if (achievementsError) {
        console.error('Achievements error:', achievementsError);
        // If we can't fetch achievements due to RLS, set empty array
        setAchievements([]);
      } else {
        setAchievements(achievementsData || []);
      }

      // Fetch quiz stats
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score, quizzes(subject)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (attempts && attempts.length > 0) {
        const totalPoints = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const avgScore = totalPoints / attempts.length;

        // Calculate best subject
        const subjectScores: { [key: string]: number[] } = {};
        attempts.forEach(attempt => {
          const subject = attempt.quizzes?.subject || 'unknown';
          if (!subjectScores[subject]) subjectScores[subject] = [];
          subjectScores[subject].push(attempt.score || 0);
        });

        let bestSubject = 'None';
        let bestAvg = 0;
        Object.entries(subjectScores).forEach(([subject, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg > bestAvg) {
            bestAvg = avg;
            bestSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
          }
        });

        setStats({
          totalQuizzes: attempts.length,
          totalPoints,
          averageScore: Math.round(avgScore),
          bestSubject
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
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
          <p>Profile not found</p>
          <Button onClick={() => navigate(isTeacher ? '/teacher' : '/leaderboard')} className="mt-4">
            {isTeacher ? 'Back to Admin Dashboard' : 'Back to Leaderboard'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(isTeacher ? '/teacher' : '/leaderboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isTeacher ? 'Back to Admin Dashboard' : 'Back to Leaderboard'}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <div className="glass-card rounded-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              {avatar ? (
                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${avatar.color_scheme} flex items-center justify-center`}>
                  <div className="text-7xl">{avatar.emoji}</div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="text-7xl">👤</div>
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                <p className="text-muted-foreground">Grade {profile.grade} Student</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
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
              <div className="text-sm text-muted-foreground">Quizzes Completed</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <div className="text-3xl font-bold text-foreground mb-1">{stats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <Trophy className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <div className="text-xl font-bold text-foreground mb-1">{stats.bestSubject}</div>
              <div className="text-sm text-muted-foreground">Best Subject</div>
            </motion.div>
          </div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PublicProfile;