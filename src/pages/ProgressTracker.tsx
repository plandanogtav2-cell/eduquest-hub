import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

const ProgressTracker = () => {
  const { user, profile } = useAuthStore();
  const [progressData, setProgressData] = useState({
    totalQuizzes: 0,
    totalPoints: 0,
    averageScore: 0,
    subjectProgress: { math: 0, science: 0, logic: 0 },
    weeklyProgress: [],
    recentAchievements: []
  });

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    // Fetch quiz attempts
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    if (attempts) {
      const totalQuizzes = attempts.length;
      const totalPoints = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const averageScore = totalQuizzes > 0 ? Math.round(totalPoints / totalQuizzes) : 0;

      // Calculate subject progress
      const subjectStats = { math: [], science: [], logic: [] };
      attempts.forEach(attempt => {
        const subject = (attempt as any).quizzes?.subject;
        if (subject && subjectStats[subject as keyof typeof subjectStats]) {
          subjectStats[subject as keyof typeof subjectStats].push(attempt.score || 0);
        }
      });

      const subjectProgress = {
        math: subjectStats.math.length > 0 ? Math.round(subjectStats.math.reduce((a, b) => a + b, 0) / subjectStats.math.length) : 0,
        science: subjectStats.science.length > 0 ? Math.round(subjectStats.science.reduce((a, b) => a + b, 0) / subjectStats.science.length) : 0,
        logic: subjectStats.logic.length > 0 ? Math.round(subjectStats.logic.reduce((a, b) => a + b, 0) / subjectStats.logic.length) : 0
      };

      setProgressData({
        totalQuizzes,
        totalPoints,
        averageScore,
        subjectProgress,
        weeklyProgress: [], // Would need more complex date calculations
        recentAchievements: []
      });
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return 'bg-primary text-primary-foreground';
      case 'science': return 'bg-success text-success-foreground';
      case 'logic': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Learning Analytics</h2>
          <p className="text-muted-foreground">
            Track your progress across all subjects and see how you're improving over time.
          </p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Quizzes Completed</span>
            </div>
            <p className="text-3xl font-bold">{progressData.totalQuizzes}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Total Points</span>
            </div>
            <p className="text-3xl font-bold">{progressData.totalPoints}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Average Score</span>
            </div>
            <p className={`text-3xl font-bold ${getProgressColor(progressData.averageScore)}`}>
              {progressData.averageScore}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Current Grade</span>
            </div>
            <p className="text-3xl font-bold">Grade {profile?.grade}</p>
          </motion.div>
        </div>

        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Subject Performance</h3>
          <div className="space-y-6">
            {Object.entries(progressData.subjectProgress).map(([subject, score]) => (
              <div key={subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{subject}</span>
                  <span className={`font-bold ${getProgressColor(score)}`}>{score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getSubjectColor(subject)}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-6">Learning Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-success">Strengths</h4>
              {Object.entries(progressData.subjectProgress)
                .filter(([_, score]) => score >= 70)
                .map(([subject, score]) => (
                  <div key={subject} className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="capitalize">{subject}: {score}% average</span>
                  </div>
                ))}
              {Object.entries(progressData.subjectProgress).every(([_, score]) => score < 70) && (
                <p className="text-muted-foreground text-sm">Keep practicing to build your strengths!</p>
              )}
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-warning">Areas for Improvement</h4>
              {Object.entries(progressData.subjectProgress)
                .filter(([_, score]) => score < 70)
                .map(([subject, score]) => (
                  <div key={subject} className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="capitalize">{subject}: {score}% average</span>
                  </div>
                ))}
              {Object.entries(progressData.subjectProgress).every(([_, score]) => score >= 70) && (
                <p className="text-muted-foreground text-sm">Great job! You're doing well in all subjects!</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-bold mb-4">Keep Learning!</h3>
          <p className="text-muted-foreground mb-6">
            {progressData.totalQuizzes === 0 
              ? "Start your learning journey by taking your first quiz!"
              : progressData.averageScore >= 80
              ? "Excellent work! You're mastering the material. Keep it up!"
              : progressData.averageScore >= 60
              ? "Good progress! Keep practicing to improve your scores."
              : "Every expert was once a beginner. Keep trying and you'll improve!"
            }
          </p>
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-primary to-accent">
              Continue Learning
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProgressTracker;