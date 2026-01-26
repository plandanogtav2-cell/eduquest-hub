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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalGames: 0,
    patternGames: 0,
    sequencingGames: 0,
    deductiveGames: 0,
    completedLevels: 0,
    easyCompleted: 0,
    mediumCompleted: 0,
    hardCompleted: 0,
    bestStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

      // Fetch user's game stats (updated for brain training games)
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, streak, level_reached, game_type, difficulty')
        .eq('user_id', user?.id);

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);

      // Calculate user stats for brain training games
      if (sessions) {
        const stats = {
          totalPoints: sessions.reduce((sum, session) => sum + (session.score || 0), 0),
          totalGames: sessions.length,
          patternGames: sessions.filter(s => s.game_type === 'pattern-recognition').length,
          sequencingGames: sessions.filter(s => s.game_type === 'sequencing').length,
          deductiveGames: sessions.filter(s => s.game_type === 'deductive-reasoning').length,
          completedLevels: sessions.filter(s => s.level_reached >= 10).length,
          easyCompleted: sessions.filter(s => s.difficulty === 'easy' && s.level_reached >= 10).length,
          mediumCompleted: sessions.filter(s => s.difficulty === 'medium' && s.level_reached >= 10).length,
          hardCompleted: sessions.filter(s => s.difficulty === 'hard' && s.level_reached >= 10).length,
          bestStreak: Math.max(...sessions.map(s => s.streak || 0), 0)
        };
        setUserStats(stats);

        // Check and award new achievements
        const newlyAwarded = await checkAndAwardAchievements(stats, userAchievementsData || [], sessions);
        
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

  const checkAndAwardAchievements = async (stats: any, currentAchievements: UserAchievement[], sessions: any[]) => {
    const earnedIds = new Set(currentAchievements.map(ua => ua.achievement_id));
    const newlyAwarded = [];
    
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let shouldAward = false;

      switch (achievement.name) {
        // First level completions (requires 3 levels completed)
        case 'Shape Detective':
        case 'Pattern Pioneer':
          shouldAward = sessions.filter(s => s.game_type === 'pattern-recognition').length >= 3;
          break;
        case 'Order Wizard':
        case 'Sequence Starter':
          shouldAward = sessions.filter(s => s.game_type === 'sequencing').length >= 3;
          break;
        case 'Mystery Solver':
        case 'Logic Learner':
          shouldAward = sessions.filter(s => s.game_type === 'deductive-reasoning').length >= 3;
          break;
          
        // Easy difficulty masters (complete difficulty twice)
        case 'Pattern Ninja':
        case 'Pattern Easy Master':
          shouldAward = sessions.filter(s => s.game_type === 'pattern-recognition' && s.difficulty === 'easy' && s.level_reached >= 10).length >= 2;
          break;
        case 'Flow Master':
        case 'Sequence Easy Master':
          shouldAward = sessions.filter(s => s.game_type === 'sequencing' && s.difficulty === 'easy' && s.level_reached >= 10).length >= 2;
          break;
        case 'Clue Hunter':
        case 'Logic Easy Master':
          shouldAward = sessions.filter(s => s.game_type === 'deductive-reasoning' && s.difficulty === 'easy' && s.level_reached >= 10).length >= 2;
          break;
          
        // Medium difficulty masters (complete difficulty twice)
        case 'Visual Genius':
        case 'Pattern Medium Master':
          shouldAward = sessions.filter(s => s.game_type === 'pattern-recognition' && s.difficulty === 'medium' && s.level_reached >= 10).length >= 2;
          break;
        case 'Chain Breaker':
        case 'Sequence Medium Master':
          shouldAward = sessions.filter(s => s.game_type === 'sequencing' && s.difficulty === 'medium' && s.level_reached >= 10).length >= 2;
          break;
        case 'Mind Reader':
        case 'Logic Medium Master':
          shouldAward = sessions.filter(s => s.game_type === 'deductive-reasoning' && s.difficulty === 'medium' && s.level_reached >= 10).length >= 2;
          break;
          
        // Hard difficulty masters (complete difficulty twice)
        case 'Pattern Overlord':
        case 'Pattern Hard Master':
          shouldAward = sessions.filter(s => s.game_type === 'pattern-recognition' && s.difficulty === 'hard' && s.level_reached >= 10).length >= 2;
          break;
        case 'Sequence God':
        case 'Sequence Hard Master':
          shouldAward = sessions.filter(s => s.game_type === 'sequencing' && s.difficulty === 'hard' && s.level_reached >= 10).length >= 2;
          break;
        case 'Logic Emperor':
        case 'Logic Hard Master':
          shouldAward = sessions.filter(s => s.game_type === 'deductive-reasoning' && s.difficulty === 'hard' && s.level_reached >= 10).length >= 2;
          break;
          
        // Ultimate achievements
        case 'Triple Threat':
        case 'Triple Game Master':
          shouldAward = sessions.some(s => s.game_type === 'pattern-recognition' && s.difficulty === 'easy' && s.level_reached >= 10) &&
                       sessions.some(s => s.game_type === 'sequencing' && s.difficulty === 'easy' && s.level_reached >= 10) &&
                       sessions.some(s => s.game_type === 'deductive-reasoning' && s.difficulty === 'easy' && s.level_reached >= 10);
          break;
        case 'Mastermind':
        case 'Perfect Mind':
          shouldAward = sessions.some(s => s.game_type === 'pattern-recognition' && s.difficulty === 'hard' && s.level_reached >= 10) &&
                       sessions.some(s => s.game_type === 'sequencing' && s.difficulty === 'hard' && s.level_reached >= 10) &&
                       sessions.some(s => s.game_type === 'deductive-reasoning' && s.difficulty === 'hard' && s.level_reached >= 10);
          break;
        case 'Point Collector':
        case 'Brain Champion':
          shouldAward = stats.totalPoints >= 10000;
          break;
          
        default:
          shouldAward = false;
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
      crown: Crown,
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
      case 'Shape Detective':
      case 'Pattern Pioneer':
        return Math.min(userStats.patternGames / 3, 1);
      case 'Order Wizard':
      case 'Sequence Starter':
        return Math.min(userStats.sequencingGames / 3, 1);
      case 'Mystery Solver':
      case 'Logic Learner':
        return Math.min(userStats.deductiveGames / 3, 1);
      case 'Point Collector':
      case 'Brain Champion':
        return Math.min(userStats.totalPoints / 10000, 1);
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
      {/* Modern Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`glass-card rounded-xl p-4 shadow-lg border-l-4 ${
            toast.type === 'success' ? 'border-green-500 bg-green-50/90' :
            toast.type === 'error' ? 'border-red-500 bg-red-50/90' :
            'border-blue-500 bg-blue-50/90'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              }`} />
              <span className="font-medium text-foreground">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Achievements</h2>
          <p className="text-muted-foreground mb-6">
            Collect badges by completing brain training games and reaching milestones!
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
              // Trigger achievement check with sessions data
              supabase
                .from('game_sessions')
                .select('score, streak, level_reached, game_type, difficulty')
                .eq('user_id', user?.id)
                .then(({ data: sessions }) => {
                  checkAndAwardAchievements(userStats, userAchievements, sessions || []).then(newlyAwarded => {
                    if (newlyAwarded && newlyAwarded.length > 0) {
                      fetchData();
                    }
                  });
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
                    <div
                      onClick={async () => {
                        try {
                          // Check if already earned first
                          const { data: existing } = await supabase
                            .from('user_achievements')
                            .select('id')
                            .eq('user_id', user?.id)
                            .eq('achievement_id', achievement.id)
                            .single();
                          
                          if (existing) {
                            showToast('Achievement already earned!', 'info');
                            fetchData();
                            return;
                          }
                          
                          // Insert new achievement
                          const { error } = await supabase
                            .from('user_achievements')
                            .insert({
                              user_id: user?.id,
                              achievement_id: achievement.id
                            });
                          
                          if (error) {
                            console.error('Error:', error);
                            fetchData();
                          } else {
                            showToast('🎉 Achievement unlocked!', 'success');
                            fetchData();
                          }
                        } catch (err) {
                          console.error('Catch error:', err);
                          fetchData(); // Always refresh to show correct state
                        }
                      }}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all cursor-pointer select-none"
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      🏆 Claim Achievement!
                    </div>
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