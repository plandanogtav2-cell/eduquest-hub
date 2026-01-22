import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calculator, FlaskConical, Brain } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalAttempts: number;
  studentCount: number;
}

interface TimeSeriesData {
  date: string;
  averageScore: number;
  attempts: number;
}

const Analytics = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    classAverage: 0
  });

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    fetchAnalytics();
  }, [role, navigate]);

  const fetchAnalytics = async () => {
    try {
      // Get all quiz attempts with quiz details
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score, completed_at, user_id, quizzes(subject)')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      if (!attempts) return;

      // Calculate overall stats
      const uniqueStudents = new Set(attempts.map(a => a.user_id)).size;
      const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const classAvg = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

      setOverallStats({
        totalStudents: uniqueStudents,
        totalAttempts: attempts.length,
        classAverage: classAvg
      });

      // Calculate subject performance
      const subjectMap: { [key: string]: { scores: number[], students: Set<string> } } = {};
      
      attempts.forEach(attempt => {
        const subject = attempt.quizzes?.subject || 'unknown';
        if (!subjectMap[subject]) {
          subjectMap[subject] = { scores: [], students: new Set() };
        }
        subjectMap[subject].scores.push(attempt.score || 0);
        subjectMap[subject].students.add(attempt.user_id);
      });

      const subjectPerf = Object.entries(subjectMap).map(([subject, data]) => ({
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        totalAttempts: data.scores.length,
        studentCount: data.students.size
      }));

      setSubjectPerformance(subjectPerf);

      // Calculate time series data (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const dailyData: { [key: string]: { scores: number[], count: number } } = {};
      
      attempts.forEach(attempt => {
        const date = new Date(attempt.completed_at || '');
        if (date >= last30Days) {
          const dateKey = date.toISOString().split('T')[0];
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = { scores: [], count: 0 };
          }
          dailyData[dateKey].scores.push(attempt.score || 0);
          dailyData[dateKey].count++;
        }
      });

      const timeSeries = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          attempts: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setTimeSeriesData(timeSeries);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'math': return Calculator;
      case 'science': return FlaskConical;
      case 'logic': return Brain;
      default: return BarChart3;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'math': return 'from-blue-500 to-blue-600';
      case 'science': return 'from-green-500 to-green-600';
      case 'logic': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
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
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Class Performance Analytics</h2>
          <p className="text-muted-foreground">
            Track student progress and identify areas for improvement
          </p>
        </motion.div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <Users className="w-8 h-8 mb-3 text-blue-500" />
            <div className="text-3xl font-bold mb-1">{overallStats.totalStudents}</div>
            <div className="text-sm text-muted-foreground">Active Students</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <BarChart3 className="w-8 h-8 mb-3 text-green-500" />
            <div className="text-3xl font-bold mb-1">{overallStats.totalAttempts}</div>
            <div className="text-sm text-muted-foreground">Total Quiz Attempts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <TrendingUp className="w-8 h-8 mb-3 text-purple-500" />
            <div className="text-3xl font-bold mb-1">{overallStats.classAverage}%</div>
            <div className="text-sm text-muted-foreground">Class Average</div>
          </motion.div>
        </div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Performance by Subject</h3>
          <div className="space-y-6">
            {subjectPerformance.map((subject, index) => {
              const Icon = getSubjectIcon(subject.subject);
              const maxScore = Math.max(...subjectPerformance.map(s => s.averageScore));
              const barWidth = (subject.averageScore / maxScore) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{subject.subject}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{subject.averageScore}%</span>
                      <p className="text-xs text-muted-foreground">
                        {subject.totalAttempts} attempts • {subject.studentCount} students
                      </p>
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getSubjectColor(subject.subject)} transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Time Series Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">Average Score Over Time (Last 30 Days)</h3>
          {timeSeriesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No quiz data available for the last 30 days
            </div>
          ) : (
            <div className="space-y-2">
              {timeSeriesData.map((data, index) => {
                const maxScore = 100;
                const barWidth = (data.averageScore / maxScore) * 100;
                const date = new Date(data.date);
                const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">{dateLabel}</div>
                    <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-sm font-medium text-white drop-shadow">
                          {data.averageScore}% ({data.attempts} attempts)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
