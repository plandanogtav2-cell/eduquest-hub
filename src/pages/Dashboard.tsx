import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Target, Calculator, FlaskConical, Brain, Play, Star, Clock, CheckCircle, Zap, Shield, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useQuizStore } from '@/stores/quizStore';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import type { Quiz, QuizAttempt } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, role, signOut, isLoading: authLoading, initialize } = useAuthStore();
  const { quizzes, fetchQuizzes, isLoading: quizzesLoading } = useQuizStore();
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0, totalPoints: 0 });
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && (role === 'admin' || role === 'super_admin')) {
      navigate('/teacher');
    }
  }, [user, authLoading, role, navigate]);

  useEffect(() => {
    if (user && profile) {
      fetchQuizzes(profile.grade as '4' | '5' | '6');
      fetchUserStats();
    }
  }, [user, profile, fetchQuizzes]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (attempts) {
        // Get only the most recent attempt per quiz
        const latestAttempts = attempts.reduce((acc, attempt) => {
          if (!acc[attempt.quiz_id] || new Date(attempt.completed_at) > new Date(acc[attempt.quiz_id].completed_at)) {
            acc[attempt.quiz_id] = attempt;
          }
          return acc;
        }, {} as Record<string, any>);
        
        const totalQuizzes = Object.keys(latestAttempts).length;
        const totalPoints = Object.values(latestAttempts).reduce((sum: number, a: any) => sum + (a.score || 0), 0);
        const avgScore = totalQuizzes > 0 ? Math.round(totalPoints / totalQuizzes) : 0;
        setStats({ totalQuizzes, avgScore, totalPoints });
        
        // Only mark as completed if the latest attempt exists
        const completed = new Set(Object.keys(latestAttempts));
        setCompletedQuizzes(completed);
        
        // Set recent attempts (simplified)
        setRecentAttempts(Object.values(latestAttempts).slice(0, 3) as unknown as QuizAttempt[]);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'math': return Calculator;
      case 'science': return FlaskConical;
      case 'logic': return Brain;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (title: string) => {
    if (title.includes('Easy')) return 'bg-green-100 text-green-700 border-green-200';
    if (title.includes('Medium')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (title.includes('Hard')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDifficultyIcon = (title: string) => {
    if (title.includes('Easy')) return Zap;
    if (title.includes('Medium')) return Shield;
    if (title.includes('Hard')) return Flame;
    return Star;
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return 'bg-primary/10 text-primary border-primary/20';
      case 'science': return 'bg-success/10 text-success border-success/20';
      case 'logic': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalQuizzes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgScore} pts</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPoints}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Available Quizzes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Quizzes</h2>
          {quizzesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No quizzes available for your grade yet.</div>
          ) : (
            <div className="space-y-8">
              {/* Math Quizzes */}
              {quizzes.filter(q => q.subject === 'math').length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">Math</h3>
                    <span className="text-sm text-muted-foreground">({quizzes.filter(q => q.subject === 'math').length} quizzes)</span>
                  </div>
                  
                  {/* Group by difficulty */}
                  {['Easy', 'Medium', 'Hard'].map(difficulty => {
                    const difficultyQuizzes = quizzes.filter(quiz => 
                      quiz.subject === 'math' && 
                      quiz.title.includes(difficulty)
                    );
                    
                    if (difficultyQuizzes.length === 0) return null;
                    
                    return (
                      <div key={difficulty} className="mb-6">
                        <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                          difficulty === 'Easy' ? 'text-green-600' :
                          difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {difficulty === 'Easy' && <Zap className="w-5 h-5" />}
                          {difficulty === 'Medium' && <Shield className="w-5 h-5" />}
                          {difficulty === 'Hard' && <Flame className="w-5 h-5" />}
                          {difficulty} Level
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {difficultyQuizzes.map((quiz, index) => {
                            const Icon = getSubjectIcon(quiz.subject);
                            const isCompleted = completedQuizzes.has(quiz.id);
                            return (
                              <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card rounded-2xl p-6 hover:shadow-lg transition-all group relative ${
                                  isCompleted ? 'ring-2 ring-success/50' : ''
                                }`}
                              >
                                {isCompleted && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSubjectColor(quiz.subject)}`}>
                                    <Icon className="w-6 h-6" />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubjectColor(quiz.subject)}`}>
                                      {quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.title)}`}>
                                      {difficulty}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-2">{quiz.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{quiz.time_limit_minutes} min</span>
                                    {isCompleted && (
                                      <span className="text-success font-medium">✓ Done</span>
                                    )}
                                  </div>
                                  <Link to={`/quiz/${quiz.id}`}>
                                    <Button size="sm" className={`group-hover:shadow-glow transition-all ${
                                      isCompleted 
                                        ? 'bg-gradient-to-r from-success to-success/80' 
                                        : 'bg-gradient-to-r from-primary to-accent'
                                    }`}>
                                      <Play className="w-4 h-4 mr-1" />
                                      {isCompleted ? 'Retake' : 'Start'}
                                    </Button>
                                  </Link>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Science Quizzes */}
              {quizzes.filter(q => q.subject === 'science').length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FlaskConical className="w-6 h-6 text-success" />
                    <h3 className="text-xl font-bold text-foreground">Science</h3>
                    <span className="text-sm text-muted-foreground">({quizzes.filter(q => q.subject === 'science').length} quizzes)</span>
                  </div>
                  
                  {/* Group by difficulty */}
                  {['Easy', 'Medium', 'Hard'].map(difficulty => {
                    const difficultyQuizzes = quizzes.filter(quiz => 
                      quiz.subject === 'science' && 
                      quiz.title.includes(difficulty)
                    );
                    
                    if (difficultyQuizzes.length === 0) return null;
                    
                    return (
                      <div key={difficulty} className="mb-6">
                        <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                          difficulty === 'Easy' ? 'text-green-600' :
                          difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {difficulty === 'Easy' && <Zap className="w-5 h-5" />}
                          {difficulty === 'Medium' && <Shield className="w-5 h-5" />}
                          {difficulty === 'Hard' && <Flame className="w-5 h-5" />}
                          {difficulty} Level
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {difficultyQuizzes.map((quiz, index) => {
                            const Icon = getSubjectIcon(quiz.subject);
                            const isCompleted = completedQuizzes.has(quiz.id);
                            return (
                              <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card rounded-2xl p-6 hover:shadow-lg transition-all group relative ${
                                  isCompleted ? 'ring-2 ring-success/50' : ''
                                }`}
                              >
                                {isCompleted && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSubjectColor(quiz.subject)}`}>
                                    <Icon className="w-6 h-6" />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubjectColor(quiz.subject)}`}>
                                      {quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.title)}`}>
                                      {difficulty}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-2">{quiz.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{quiz.time_limit_minutes} min</span>
                                    {isCompleted && (
                                      <span className="text-success font-medium">✓ Done</span>
                                    )}
                                  </div>
                                  <Link to={`/quiz/${quiz.id}`}>
                                    <Button size="sm" className={`group-hover:shadow-glow transition-all ${
                                      isCompleted 
                                        ? 'bg-gradient-to-r from-success to-success/80' 
                                        : 'bg-gradient-to-r from-primary to-accent'
                                    }`}>
                                      <Play className="w-4 h-4 mr-1" />
                                      {isCompleted ? 'Retake' : 'Start'}
                                    </Button>
                                  </Link>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Logic Quizzes */}
              {quizzes.filter(q => q.subject === 'logic').length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-accent" />
                    <h3 className="text-xl font-bold text-foreground">Logic</h3>
                    <span className="text-sm text-muted-foreground">({quizzes.filter(q => q.subject === 'logic').length} quizzes)</span>
                  </div>
                  
                  {/* Group by difficulty */}
                  {['Easy', 'Medium', 'Hard'].map(difficulty => {
                    const difficultyQuizzes = quizzes.filter(quiz => 
                      quiz.subject === 'logic' && 
                      quiz.title.includes(difficulty)
                    );
                    
                    if (difficultyQuizzes.length === 0) return null;
                    
                    return (
                      <div key={difficulty} className="mb-6">
                        <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                          difficulty === 'Easy' ? 'text-green-600' :
                          difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {difficulty === 'Easy' && <Zap className="w-5 h-5" />}
                          {difficulty === 'Medium' && <Shield className="w-5 h-5" />}
                          {difficulty === 'Hard' && <Flame className="w-5 h-5" />}
                          {difficulty} Level
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {difficultyQuizzes.map((quiz, index) => {
                            const Icon = getSubjectIcon(quiz.subject);
                            const isCompleted = completedQuizzes.has(quiz.id);
                            return (
                              <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-card rounded-2xl p-6 hover:shadow-lg transition-all group relative ${
                                  isCompleted ? 'ring-2 ring-success/50' : ''
                                }`}
                              >
                                {isCompleted && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSubjectColor(quiz.subject)}`}>
                                    <Icon className="w-6 h-6" />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubjectColor(quiz.subject)}`}>
                                      {quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.title)}`}>
                                      {difficulty}
                                    </span>
                                  </div>
                                </div>
                                <h4 className="text-lg font-bold text-foreground mb-2">{quiz.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{quiz.time_limit_minutes} min</span>
                                    {isCompleted && (
                                      <span className="text-success font-medium">✓ Done</span>
                                    )}
                                  </div>
                                  <Link to={`/quiz/${quiz.id}`}>
                                    <Button size="sm" className={`group-hover:shadow-glow transition-all ${
                                      isCompleted 
                                        ? 'bg-gradient-to-r from-success to-success/80' 
                                        : 'bg-gradient-to-r from-primary to-accent'
                                    }`}>
                                      <Play className="w-4 h-4 mr-1" />
                                      {isCompleted ? 'Retake' : 'Start'}
                                    </Button>
                                  </Link>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        {recentAttempts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="glass-card rounded-2xl p-4">
              <p className="text-muted-foreground">You've completed {stats.totalQuizzes} quizzes with an average score of {stats.avgScore} points!</p>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;