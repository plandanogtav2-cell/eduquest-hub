import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface GameSession {
  id: string;
  score: number;
  level_reached: number;
  streak: number;
  created_at: string;
  game_type: string;
  difficulty: string;
}

interface StudentData {
  full_name: string;
  grade: string;
  points: number;
}

const StudentReport = () => {
  const { userId } = useParams<{ userId: string }>();
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [attempts, setAttempts] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    if (userId) {
      fetchStudentData();
    }
  }, [role, navigate, userId]);

  const fetchStudentData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, grade')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        navigate('/teacher');
        return;
      }

      // Get total points from game sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score')
        .eq('user_id', userId);
      
      const totalPoints = sessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;

      setStudent({ ...profileData, points: totalPoints });

      // Get all game sessions
      const { data: gameSessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setAttempts(gameSessions || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!student || attempts.length === 0) return;

    const headers = ['Date', 'Game Type', 'Difficulty', 'Score', 'Level Reached', 'Streak'];
    const rows = attempts.map(session => [
      new Date(session.created_at).toLocaleDateString(),
      session.game_type.replace('enhanced-', '').replace('-', ' '),
      session.difficulty,
      session.score,
      session.level_reached,
      session.streak
    ]);

    const csvContent = [
      `Student Progress Report - ${student.full_name}`,
      `Grade: ${student.grade}`,
      `Total Points: ${student.points}`,
      `Total Games: ${attempts.length}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.full_name.replace(/\s+/g, '_')}_progress_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    if (attempts.length === 0) return { avgScore: 0, totalGames: 0, bestGame: 'None' };

    const avgScore = Math.round(
      attempts.reduce((sum, s) => sum + s.score, 0) / attempts.length
    );

    const gameScores: { [key: string]: number[] } = {};
    attempts.forEach(session => {
      const gameType = session.game_type.replace('enhanced-', '');
      const gameName = gameType === 'pattern-recognition' ? 'Pattern Recognition' :
                      gameType === 'sequencing' ? 'Sequencing' :
                      gameType === 'deductive-reasoning' ? 'Deductive Reasoning' : 'Unknown';
      if (!gameScores[gameName]) gameScores[gameName] = [];
      gameScores[gameName].push(session.score);
    });

    let bestGame = 'None';
    let bestAvg = 0;
    Object.entries(gameScores).forEach(([game, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestGame = game;
      }
    });

    return { avgScore, totalGames: attempts.length, bestGame };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 text-center">
          <p>Student not found</p>
          <Button onClick={() => navigate('/teacher')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/teacher')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={exportToCSV} disabled={attempts.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">{student.full_name}</h2>
          <p className="text-muted-foreground">Grade {student.grade} - Progress Report</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <Trophy className="w-8 h-8 mb-3 text-yellow-500" />
            <div className="text-3xl font-bold mb-1">{student.points}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <Target className="w-8 h-8 mb-3 text-blue-500" />
            <div className="text-3xl font-bold mb-1">{stats.totalGames}</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <TrendingUp className="w-8 h-8 mb-3 text-green-500" />
            <div className="text-3xl font-bold mb-1">{stats.avgScore}</div>
            <div className="text-sm text-muted-foreground">Avg Points</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6"
          >
            <Trophy className="w-8 h-8 mb-3 text-purple-500" />
            <div className="text-xl font-bold mb-1">{stats.bestGame}</div>
            <div className="text-sm text-muted-foreground">Best Game</div>
          </motion.div>
        </div>

        {/* Performance Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Score Progression</h3>
          {attempts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No games played yet
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice().reverse().map((session, index) => {
                const gameType = session.game_type.replace('enhanced-', '').replace('-', ' ');
                const gameName = gameType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const barWidth = Math.min((session.score / 500) * 100, 100);
                const date = new Date(session.created_at);
                const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={session.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{gameName}</span>
                        <span className="text-xs text-muted-foreground">({session.difficulty})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{dateLabel}</span>
                        <span className="text-sm font-bold">{session.score} pts</span>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          session.score >= 300 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          session.score >= 150 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quiz History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold">Game History</h3>
          </div>
          {attempts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No games played yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Game</th>
                    <th className="text-left py-3 px-4 font-medium">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium">Score</th>
                    <th className="text-left py-3 px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-4 font-medium">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((session) => {
                    const gameType = session.game_type.replace('enhanced-', '').replace('-', ' ');
                    const gameName = gameType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    return (
                      <tr key={session.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{gameName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted">
                            {session.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">{session.score} pts</td>
                        <td className="py-3 px-4">
                          <span className="font-medium">Level {session.level_reached}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${session.streak >= 5 ? 'text-green-600' : session.streak >= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {session.streak} 🔥
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudentReport;
