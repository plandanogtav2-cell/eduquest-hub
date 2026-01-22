import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
}

const ManageQuizzes = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: 'all', grade: 'all' });

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    fetchQuizzes();
  }, [role, navigate]);

  const fetchQuizzes = async () => {
    try {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('grade', { ascending: true })
        .order('subject', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"? This will also delete all questions and student attempts.`)) {
      return;
    }

    try {
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      const { error: attemptsError } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('quiz_id', quizId);

      if (attemptsError) throw attemptsError;

      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (quizError) throw quizError;

      toast({
        title: 'Quiz deleted',
        description: `"${quizTitle}" has been deleted successfully.`,
      });

      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quiz. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter.subject !== 'all' && quiz.subject !== filter.subject) return false;
    if (filter.grade !== 'all' && quiz.grade !== filter.grade) return false;
    return true;
  });

  const groupedQuizzes = filteredQuizzes.reduce((acc, quiz) => {
    const key = `Grade ${quiz.grade} - ${quiz.subject}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Manage Quizzes</h2>
              <p className="text-muted-foreground">
                Create, edit, and organize quizzes
              </p>
            </div>
            <Button
              onClick={() => navigate('/teacher/quiz/new')}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filter.grade}
            onChange={(e) => setFilter({ ...filter, grade: e.target.value })}
            className="px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="all">All Grades</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>
          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            className="px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="all">All Subjects</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="logic">Logic</option>
          </select>
        </div>

        {/* Quizzes List */}
        {Object.keys(groupedQuizzes).length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No quizzes found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedQuizzes).map(([group, groupQuizzes]) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-bold">{group}</h3>
                </div>
                <div className="divide-y divide-border">
                  {groupQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">{quiz.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(quiz.id, quiz.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageQuizzes;
