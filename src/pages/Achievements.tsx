import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Award, Calculator, FlaskConical, Brain, Target, Zap, Crown, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  badge_color: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

const Achievements = () => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalQuizzes: 0,
    mathQuizzes: 0,
    scienceQuizzes: 0,
    logicQuizzes: 0,
    perfectScores: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all achievements (excluding disabled ones)
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .neq('badge_color', 'disabled')
        .order('points_required');

      // Fetch user's earned achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user?.id);

      // Fetch user's quiz stats
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score, quiz_id, quizzes(subject)')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null);

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);

      // Calculate user stats
      if (attempts) {
        const stats = {
          totalPoints: attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0),
          totalQuizzes: attempts.length,
          mathQuizzes: attempts.filter(a => a.quizzes?.subject === 'math').length,
          scienceQuizzes: attempts.filter(a => a.quizzes?.subject === 'science').length,
          logicQuizzes: attempts.filter(a => a.quizzes?.subject === 'logic').length,
          perfectScores: attempts.filter(a => (a.score || 0) === 100).length
        };
        setUserStats(stats);

        // Check and award new achievements
        const newlyAwarded = await checkAndAwardAchievements(stats, userAchievementsData || []);
        
        // If new achievements were awarded, refetch the data to show them immediately
        if (newlyAwarded && newlyAwarded.length > 0) {
          const { data: updatedUserAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id, earned_at')
            .eq('user_id', user?.id);
          setUserAchievements(updatedUserAchievements || []);
          
          // Show celebration for new achievements
          newlyAwarded.forEach(achievement => {
            console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
            // You could add a toast notification here
          });
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndAwardAchievements = async (stats: any, currentAchievements: UserAchievement[]) => {
    const earnedIds = new Set(currentAchievements.map(ua => ua.achievement_id));
    const newlyAwarded = [];
    
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let shouldAward = false;

      switch (achievement.name) {
        // Beginner achievements
        case 'First Quiz Hero':
        case 'First Steps':
          shouldAward = stats.totalQuizzes >= 1;
          break;
        case 'Perfect Start':
        case 'Quick Learner':
          shouldAward = stats.perfectScores >= 1;
          break;
        case 'Quiz Explorer':
          shouldAward = stats.mathQuizzes >= 1 && stats.scienceQuizzes >= 1 && stats.logicQuizzes >= 1;
          break;
          
        // Subject masters - FIXED: Only award based on actual quiz completion
        case 'Math Whiz':
          shouldAward = stats.mathQuizzes >= 5;
          break;
        case 'Math Genius':
          shouldAward = stats.mathQuizzes >= 10;
          break;
        case 'Math Ninja':
          shouldAward = stats.mathQuizzes >= 20 && stats.perfectScores >= 20;
          break;
        case 'Science Explorer':
          shouldAward = stats.scienceQuizzes >= 5;
          break;
        case 'Science Wizard':
          shouldAward = stats.scienceQuizzes >= 10;
          break;
        case 'Science Detective':
          shouldAward = stats.scienceQuizzes >= 15;
          break;
        case 'Logic Master':
          shouldAward = stats.logicQuizzes >= 5;
          break;
        case 'Logic Champion':
          shouldAward = stats.logicQuizzes >= 10;
          break;
        case 'Puzzle Master':
          shouldAward = stats.logicQuizzes >= 15;
          break;
          
        // Milestones
        case 'Dedicated Student':
          shouldAward = stats.totalQuizzes >= 20;
          break;
        case 'Quiz Collector':
          shouldAward = stats.totalQuizzes >= 25;
          break;
        case 'Knowledge Seeker':
          shouldAward = stats.totalQuizzes >= 50;
          break;
        case 'Learning Legend':
          shouldAward = stats.totalQuizzes >= 100;
          break;
          
        // Perfect scores
        case 'Perfectionist':
          shouldAward = stats.perfectScores >= 10;
          break;
        case 'Hot Streak':
        case 'Super Streak':
        case 'Mega Streak':
          // DISABLED: Need proper streak tracking implementation
          shouldAward = false;
          break;
          
        // Grade-specific - DISABLED: Need proper grade validation
        case 'Grade 4 Star':
        case 'Grade 5 Champion':
        case 'Grade 6 Legend':
          shouldAward = false; // Disable until proper grade checking is implemented
          break;
          
        // Multiplayer features - DISABLED: Not implemented yet
        case 'Study Buddy':
        case 'Helper Hero':
          shouldAward = false; // Disable until study groups are fully implemented
          break;
          
        // Time-based - DISABLED: Need proper time tracking
        case 'Speed Demon':
        case 'Quiz Marathon':
        case 'Early Bird':
        case 'Night Owl':
          shouldAward = false; // Disable until time tracking is implemented
          break;
          
        default:
          shouldAward = stats.totalPoints >= achievement.points_required;
      }

      if (shouldAward) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user?.id,
            achievement_id: achievement.id
          });
        
        if (!error) {
          newlyAwarded.push(achievement);
        }
      }
    }
    
    return newlyAwarded;
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
      crown: Crown
    };
    return icons[iconName] || Award;
  };

  const getBadgeColor = (color: string, isEarned: boolean) => {
    if (!isEarned) return 'bg-gray-200 text-gray-400';
    
    const colors: { [key: string]: string } = {
      gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
      silver: 'bg-gradient-to-br from-gray-300 to-gray-500 text-white',
      bronze: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
      green: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
      purple: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
      blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
    };
    return colors[color] || 'bg-gradient-to-br from-primary to-accent text-white';
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getProgress = (achievement: Achievement) => {
    const isEarned = isAchievementEarned(achievement.id);
    if (isEarned) return 1;
    
    switch (achievement.name) {
      case 'First Steps':
      case 'First Quiz Hero':
        return Math.min(userStats.totalQuizzes / 1, 1);
      case 'Quick Learner':
      case 'Perfect Start':
        return Math.min(userStats.perfectScores / 1, 1);
      case 'Quiz Explorer':
        const hasAllSubjects = userStats.mathQuizzes >= 1 && userStats.scienceQuizzes >= 1 && userStats.logicQuizzes >= 1;
        return hasAllSubjects ? 1 : Math.min((userStats.mathQuizzes > 0 ? 1 : 0) + (userStats.scienceQuizzes > 0 ? 1 : 0) + (userStats.logicQuizzes > 0 ? 1 : 0), 3) / 3;
      case 'Math Whiz':
        return Math.min(userStats.mathQuizzes / 5, 1);
      case 'Math Genius':
        return Math.min(userStats.mathQuizzes / 10, 1);
      case 'Math Ninja':
        return Math.min(Math.min(userStats.mathQuizzes / 20, userStats.perfectScores / 20), 1);
      case 'Science Explorer':
        return Math.min(userStats.scienceQuizzes / 5, 1);
      case 'Science Wizard':
        return Math.min(userStats.scienceQuizzes / 10, 1);
      case 'Science Detective':
        return Math.min(userStats.scienceQuizzes / 15, 1);
      case 'Logic Master':
        return Math.min(userStats.logicQuizzes / 5, 1);
      case 'Logic Champion':
        return Math.min(userStats.logicQuizzes / 10, 1);
      case 'Puzzle Master':
        return Math.min(userStats.logicQuizzes / 15, 1);
      case 'Dedicated Student':
        return Math.min(userStats.totalQuizzes / 20, 1);
      case 'Quiz Collector':
        return Math.min(userStats.totalQuizzes / 25, 1);
      case 'Knowledge Seeker':
        return Math.min(userStats.totalQuizzes / 50, 1);
      case 'Learning Legend':
        return Math.min(userStats.totalQuizzes / 100, 1);
      case 'Perfectionist':
        return Math.min(userStats.perfectScores / 10, 1);
      default:
        return Math.min(userStats.totalPoints / achievement.points_required, 1);
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

  const earnedCount = achievements.filter(a => isAchievementEarned(a.id)).length;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Achievements</h2>
          <p className="text-muted-foreground mb-6">
            Collect badges by completing quizzes and reaching milestones!
          </p>
          
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Your Progress</h3>
                <p className="text-muted-foreground">
                  {earnedCount} of {achievements.length} achievements earned
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{userStats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-xs text-muted-foreground hover:text-primary mt-1"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
            <div className="mt-4 bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements
            .sort((a, b) => {
              const aEarned = isAchievementEarned(a.id);
              const bEarned = isAchievementEarned(b.id);
              const aProgress = getProgress(a);
              const bProgress = getProgress(b);
              
              // First sort by earned status (earned first)
              if (aEarned && !bEarned) return -1;
              if (!aEarned && bEarned) return 1;
              
              // If both earned or both unearned, sort by progress (highest first)
              return bProgress - aProgress;
            })
            .map((achievement, index) => {
            const IconComponent = getIcon(achievement.icon);
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getProgress(achievement);
            
            // Auto-award achievement if progress is 100% but not yet earned
            if (progress >= 1 && !isEarned) {
              // Trigger achievement check
              checkAndAwardAchievements(userStats, userAchievements).then(newlyAwarded => {
                if (newlyAwarded && newlyAwarded.length > 0) {
                  // Refetch to update display
                  fetchData();
                }
              });
            }
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-2xl p-6 text-center transition-all hover:shadow-lg ${
                  isEarned ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="relative mb-4">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                    getBadgeColor(achievement.badge_color, isEarned)
                  } transition-all duration-300 ${isEarned ? 'animate-pulse' : ''}`}>
                    {isEarned ? (
                      <IconComponent className="w-10 h-10" />
                    ) : (
                      <Lock className="w-10 h-10" />
                    )}
                  </div>
                  {!isEarned && progress > 0 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-background border-2 border-primary rounded-full px-2 py-1">
                        <span className="text-xs font-bold text-primary">
                          {Math.round(progress * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 className={`font-bold mb-2 ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mb-4 ${isEarned ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                  {achievement.description}
                </p>
                
                {!isEarned && progress >= 1 && (
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        const newlyAwarded = await checkAndAwardAchievements(userStats, userAchievements);
                        if (newlyAwarded && newlyAwarded.length > 0) {
                          fetchData();
                        }
                      }}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      🏆 Claim Achievement!
                    </button>
                  </div>
                )}
                
                {!isEarned && progress > 0 && progress < 1 && (
                  <div className="mt-4">
                    <div className="bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {isEarned && (
                  <div className="mt-4">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      <Trophy className="w-3 h-3" />
                      Earned!
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Achievements;