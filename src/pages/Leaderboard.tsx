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
  total_games: number;
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
    } else {
      // If no grade after 3 seconds, stop loading
      const timeout = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [selectedGrade, selectedSubject]);

  const fetchLeaderboard = async () => {
    if (!selectedGrade) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use the database function to get leaderboard data
      const gameType = selectedSubject === 'all' ? null : selectedSubject;
      
      const { data, error } = await supabase
        .rpc('get_leaderboard', {
          p_grade: selectedGrade,
          p_game_type: gameType
        });

      if (error) {
        console.error('Leaderboard error:', error);
        setLeaderboard([]);
        setUserRank(null);
        setIsLoading(false);
        return;
      }

      console.log('Leaderboard data:', data);

      if (!data || data.length === 0) {
        setLeaderboard([]);
        setUserRank(null);
        setIsLoading(false);
        return;
      }

      setLeaderboard(data);

      // Find current user's rank
      if (user) {
        const userEntry = data.find((entry: any) => entry.user_id === user.id);
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
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="pattern-recognition">Pattern Recognition</SelectItem>
              <SelectItem value="sequencing">Sequencing</SelectItem>
              <SelectItem value="deductive-reasoning">Deductive Reasoning</SelectItem>
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
                      <p className="text-sm text-muted-foreground">total points</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {Math.round(userRank.average_score)}
                      </p>
                      <p className="text-sm text-muted-foreground">avg points</p>
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
              Grade {selectedGrade} - {selectedSubject === 'all' ? 'Overall' : 
                selectedSubject === 'pattern-recognition' ? 'Pattern Recognition' :
                selectedSubject === 'sequencing' ? 'Sequencing' :
                selectedSubject === 'deductive-reasoning' ? 'Deductive Reasoning' :
                selectedSubject} Rankings
            </h3>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rankings available yet. Complete some brain training games to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === user?.id;
                return (
                  <motion.div
                    key={entry.user_id}
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
                          {entry.total_games} game{entry.total_games !== 1 ? 's' : ''} played
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">{entry.total_points}</p>
                      <p className="text-xs text-muted-foreground">total points</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {Math.round(entry.average_score)}
                      </p>
                      <p className="text-xs text-muted-foreground">avg points</p>
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
            Complete more brain training games to improve your ranking and earn more points!
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;