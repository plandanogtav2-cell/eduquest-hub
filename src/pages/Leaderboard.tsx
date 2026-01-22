import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Calculator, FlaskConical, Brain, BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_points: number;
  total_quizzes: number;
  average_score: number;
  rank_position: number;
  avatar_emoji?: string;
  avatar_color?: string;
}

const Leaderboard = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (profile) {
      setSelectedGrade(profile.grade || '4');
    }
  }, [profile]);

  useEffect(() => {
    if (selectedGrade) {
      fetchLeaderboard();
    }
  }, [selectedGrade, selectedSubject]);

  const fetchLeaderboard = async () => {
    if (!selectedGrade) return;

    setIsLoading(true);
    try {
      // Get all profiles for the selected grade first
      const { data: profiles, error: profilesError } = await supabase
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
        .eq('grade', selectedGrade);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        // If we can't fetch other profiles due to RLS, at least show current user
        const currentUserProfile = profile ? [{
          user_id: user?.id,
          full_name: profile.full_name,
          grade: profile.grade
        }] : [];
        
        if (currentUserProfile.length > 0 && currentUserProfile[0].grade === selectedGrade) {
          // Show just the current user if they match the selected grade
          setLeaderboard([{
            user_id: currentUserProfile[0].user_id,
            full_name: currentUserProfile[0].full_name,
            total_points: 0,
            total_quizzes: 0,
            average_score: 0,
            rank_position: 1
          }]);
          setUserRank({
            user_id: currentUserProfile[0].user_id,
            full_name: currentUserProfile[0].full_name,
            total_points: 0,
            total_quizzes: 0,
            average_score: 0,
            rank_position: 1
          });
        } else {
          setLeaderboard([]);
          setUserRank(null);
        }
        setIsLoading(false);
        return;
      }

      console.log('Profiles for grade', selectedGrade, ':', profiles);

      if (!profiles || profiles.length === 0) {
        setLeaderboard([]);
        setUserRank(null);
        return;
      }

      // Get completed quiz attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('user_id, score, quiz_id')
        .not('completed_at', 'is', null);

      if (attemptsError) {
        console.error('Quiz attempts error:', attemptsError);
        throw attemptsError;
      }

      console.log('Quiz attempts:', attempts);

      // Get quizzes for subject filtering
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, subject');

      if (quizzesError) {
        console.error('Quizzes error:', quizzesError);
      }

      // Create lookup maps
      const profileMap = new Map(profiles.map(p => [p.user_id, p]));
      const quizMap = new Map(quizzes?.map(q => [q.id, q]) || []);

      // Filter attempts by subject if needed
      const validAttempts = (attempts || []).filter(attempt => {
        const profile = profileMap.get(attempt.user_id);
        const quiz = quizMap.get(attempt.quiz_id);
        
        if (!profile) return false;
        if (selectedSubject !== 'all' && quiz?.subject !== selectedSubject) return false;
        
        return true;
      });

      console.log('Valid attempts:', validAttempts);

      // Calculate user stats for all profiles in the grade
      const userStats = new Map();
      
      // Initialize all profiles with zero stats
      profiles.forEach(profile => {
        userStats.set(profile.user_id, {
          user_id: profile.user_id,
          full_name: profile.full_name,
          total_points: 0,
          total_quizzes: 0,
          scores: [],
          avatar_emoji: profile.avatar_options?.emoji,
          avatar_color: profile.avatar_options?.color_scheme
        });
      });
      
      // Add attempt data to existing profiles
      validAttempts.forEach(attempt => {
        const existing = userStats.get(attempt.user_id);
        if (existing) {
          existing.total_points += attempt.score || 0;
          existing.total_quizzes += 1;
          existing.scores.push(attempt.score || 0);
        }
      });

      // Create leaderboard
      const leaderboardData = Array.from(userStats.values())
        .map(user => ({
          ...user,
          average_score: user.scores.length > 0 ? user.scores.reduce((a, b) => a + b, 0) / user.scores.length : 0,
          rank_position: 0
        }))
        .sort((a, b) => {
          // Sort by total points first, then by total quizzes completed
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points;
          }
          return b.total_quizzes - a.total_quizzes;
        })
        .map((user, index) => ({ ...user, rank_position: index + 1 }));

      console.log('Final leaderboard:', leaderboardData);
      setLeaderboard(leaderboardData);

      // Find current user's rank
      if (user) {
        const userEntry = leaderboardData.find(entry => entry.user_id === user.id);
        setUserRank(userEntry || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-muted/50 border-border';
    }
  };

  const getSubjectIcon = (subject: string | null) => {
    switch (subject) {
      case 'math': return Calculator;
      case 'science': return FlaskConical;
      case 'logic': return Brain;
      default: return BookOpen;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
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
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Leaderboard</h2>
          <p className="text-muted-foreground">
            See how you rank against your classmates!
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">Grade 4</SelectItem>
              <SelectItem value="5">Grade 5</SelectItem>
              <SelectItem value="6">Grade 6</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="logic">Logic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User's Current Rank */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-8 border-2 border-primary/20"
          >
            <h3 className="text-lg font-bold mb-4">Your Current Rank</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(userRank.rank_position)}
                      <div>
                        <p className="font-bold">{userRank.full_name}</p>
                        <p className="text-sm text-muted-foreground">Rank #{userRank.rank_position}</p>
                      </div>
                    </div>
                    <div className="flex-1" />
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{userRank.total_points}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getPerformanceColor(userRank.average_score)}`}>
                        {userRank.average_score.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">avg score</p>
                    </div>
                  </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold mb-6 text-center">Top Performers</h3>
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-end justify-center pb-2">
                  <Medal className="w-8 h-8 text-white" />
                </div>
                <div className="bg-gray-400/20 rounded-b-lg p-4 border border-gray-400/30">
                  <p className="font-bold text-sm">{leaderboard[1]?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{leaderboard[1]?.total_points} pts</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-24 h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="bg-yellow-500/20 rounded-b-lg p-4 border border-yellow-500/30">
                  <p className="font-bold">{leaderboard[0]?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{leaderboard[0]?.total_points} pts</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-end justify-center pb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="bg-amber-600/20 rounded-b-lg p-4 border border-amber-600/30">
                  <p className="font-bold text-sm">{leaderboard[2]?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{leaderboard[2]?.total_points} pts</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold">
              Grade {selectedGrade} - {selectedSubject === 'all' ? 'Overall' : selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Rankings
            </h3>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rankings available yet. Complete some quizzes to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === user?.id;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                      isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getRankIcon(entry.rank_position)}
                      {entry.avatar_emoji && entry.avatar_color ? (
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${entry.avatar_color} flex items-center justify-center text-xl flex-shrink-0`}>
                          {entry.avatar_emoji}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xl flex-shrink-0">
                          👤
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => !isCurrentUser && navigate(`/profile/${entry.user_id}`)}
                          className={`font-medium truncate text-left ${isCurrentUser ? 'text-primary font-bold' : 'hover:text-primary hover:underline cursor-pointer'}`}
                        >
                          {entry.full_name}
                          {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {entry.total_quizzes} quiz{entry.total_quizzes !== 1 ? 'es' : ''} completed
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">{entry.total_points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(entry.average_score)}`}>
                        {entry.average_score.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center glass-card rounded-2xl p-6"
        >
          <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-bold mb-2">Keep Learning!</h3>
          <p className="text-muted-foreground">
            Complete more quizzes to improve your ranking and earn more points!
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;