import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, Target, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface QuizAttempt {
  id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
  quiz_id: string;
  quizzes: {
    title: string;
    subject: string;
  };
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
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
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
        .select('full_name, grade, points')
        .eq('user_id', userId)
        .single();

      if (!profileData) {
        navigate('/teacher');
        return;
      }

      setStudent(profileData);

      const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, subject)')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!student || attempts.length === 0) return;

    const headers = ['Date', 'Quiz Title', 'Subject', 'Score', 'Correct Answers', 'Total Questions', 'Percentage'];
    const rows = attempts.map(attempt => [
      new Date(attempt.completed_at).toLocaleDateString(),
      attempt.quizzes.title,
      attempt.quizzes.subject,
      attempt.score,
      attempt.correct_answers,
      attempt.total_questions,
      `${Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%`
    ]);

    const csvContent = [
      `Student Progress Report - ${student.full_name}`,
      `Grade: ${student.grade}`,
      `Total Points: ${student.points}`,
      `Total Quizzes: ${attempts.length}`,
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
    if (attempts.length === 0) return { avgScore: 0, totalQuizzes: 0, bestSubject: 'None' };

    const avgScore = Math.round(
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
    );

    const subjectScores: { [key: string]: number[] } = {};
    attempts.forEach(attempt => {
      const subject = attempt.quizzes.subject;
      if (!subjectScores[subject]) subjectScores[subject] = [];
      subjectScores[subject].push(attempt.score);
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

    return { avgScore, totalQuizzes: attempts.length, bestSubject };
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
            <div className="text-3xl font-bold mb-1">{stats.totalQuizzes}</div>
            <div className="text-sm text-muted-foreground">Quizzes Completed</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <TrendingUp className="w-8 h-8 mb-3 text-green-500" />
            <div className="text-3xl font-bold mb-1">{stats.avgScore}%</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6"
          >
            <Trophy className="w-8 h-8 mb-3 text-purple-500" />
            <div className="text-xl font-bold mb-1">{stats.bestSubject}</div>
            <div className="text-sm text-muted-foreground">Best Subject</div>
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
              No quiz attempts yet
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice().reverse().map((attempt, index) => {
                const percentage = Math.round((attempt.correct_answers / attempt.total_questions) * 100);
                const barWidth = percentage;
                const date = new Date(attempt.completed_at);
                const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={attempt.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{attempt.quizzes.title}</span>
                        <span className="text-xs text-muted-foreground">({attempt.quizzes.subject})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{dateLabel}</span>
                        <span className="text-sm font-bold">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
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
            <h3 className="text-xl font-bold">Quiz History</h3>
          </div>
          {attempts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No quiz attempts yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Quiz</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium">Score</th>
                    <th className="text-left py-3 px-4 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((attempt) => {
                    const percentage = Math.round((attempt.correct_answers / attempt.total_questions) * 100);
                    return (
                      <tr key={attempt.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{attempt.quizzes.title}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted">
                            {attempt.quizzes.subject}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">{attempt.score} pts</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {attempt.correct_answers}/{attempt.total_questions} ({percentage}%)
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
