import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface Question {
  id?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const EditQuiz = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    subject: 'math',
    grade: '4',
    difficulty: 'easy'
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    if (quizId) {
      fetchQuiz();
    }
  }, [role, navigate, quizId]);

  const fetchQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      setQuiz({
        title: quizData.title,
        description: quizData.description,
        subject: quizData.subject,
        grade: quizData.grade,
        difficulty: quizData.title.includes('Easy') ? 'easy' : quizData.title.includes('Medium') ? 'medium' : quizData.title.includes('Hard') ? 'hard' : 'easy'
      });

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Convert database format to form format
      const formattedQuestions = (questionsData || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.options[0] || '',
        option_b: q.options[1] || '',
        option_c: q.options[2] || '',
        option_d: q.options[3] || '',
        correct_answer: q.correct_answer === 0 ? 'A' : q.correct_answer === 1 ? 'B' : q.correct_answer === 2 ? 'C' : 'D'
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quiz.title || questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add a title and at least one question',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quiz.title,
          description: quiz.description,
          subject: quiz.subject,
          grade: quiz.grade
        })
        .eq('id', quizId);

      if (quizError) throw quizError;

      // Delete existing questions
      await supabase.from('questions').delete().eq('quiz_id', quizId);

      // Insert updated questions
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correct_answer: q.correct_answer === 'A' ? 0 : q.correct_answer === 'B' ? 1 : q.correct_answer === 'C' ? 2 : 3,
        points: quiz.difficulty === 'easy' ? 10 : quiz.difficulty === 'medium' ? 15 : 20,
        order_index: index,
        difficulty: quiz.difficulty
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: 'Success',
        description: 'Quiz updated successfully',
      });

      navigate('/teacher/quizzes');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A'
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
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
          <Button variant="ghost" onClick={() => navigate('/teacher/quizzes')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
          <h2 className="text-3xl font-bold mb-2">Edit Quiz</h2>
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Quiz Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="Quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={quiz.description}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                  placeholder="Quiz description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    value={quiz.subject}
                    onChange={(e) => setQuiz({ ...quiz, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="math">Math</option>
                    <option value="science">Science</option>
                    <option value="logic">Logic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Grade</label>
                  <select
                    value={quiz.grade}
                    onChange={(e) => setQuiz({ ...quiz, grade: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={quiz.difficulty}
                    onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Questions</h3>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Question {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      value={q.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                      placeholder="Question text"
                    />
                    <Input
                      value={q.option_a}
                      onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                      placeholder="Option A"
                    />
                    <Input
                      value={q.option_b}
                      onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                      placeholder="Option B"
                    />
                    <Input
                      value={q.option_c}
                      onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                      placeholder="Option C"
                    />
                    <Input
                      value={q.option_d}
                      onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                      placeholder="Option D"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Correct Answer</label>
                      <select
                        value={q.correct_answer}
                        onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/quizzes')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditQuiz;
