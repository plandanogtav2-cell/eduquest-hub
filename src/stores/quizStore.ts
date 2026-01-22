import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Quiz, Question, QuizAttempt, Grade, Subject } from '@/types';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentQuestions: Question[];
  currentAttempt: QuizAttempt | null;
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  answers: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  
  fetchQuizzes: (grade?: Grade, subject?: Subject) => Promise<void>;
  fetchQuiz: (quizId: string) => Promise<void>;
  startQuiz: (quizId: string, userId: string) => Promise<string | null>;
  submitAnswer: (questionId: string, answer: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: (attemptId: string, timeTaken: number) => Promise<QuizAttempt | null>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  currentQuiz: null,
  currentQuestions: [],
  currentAttempt: null,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  answers: {},
  isLoading: false,
  error: null,

  fetchQuizzes: async (grade?: Grade, subject?: Subject) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (grade) {
        query = query.eq('grade', grade);
      }
      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ quizzes: data as Quiz[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchQuiz: async (quizId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      // Parse options from JSONB
      const parsedQuestions = (questions || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as Question[];

      set({
        currentQuiz: quiz as Quiz,
        currentQuestions: parsedQuestions,
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  startQuiz: async (quizId: string, userId: string) => {
    const { currentQuestions } = get();
    
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          total_questions: currentQuestions.length,
          score: 0,
          correct_answers: 0,
        })
        .select()
        .single();

      if (error) throw error;

      set({
        currentAttempt: data as QuizAttempt,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        answers: {},
      });

      return data.id;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  submitAnswer: (questionId: string, answer: number) => {
    const { answers } = get();
    set({
      answers: { ...answers, [questionId]: answer },
      selectedAnswer: answer,
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentQuestions } = get();
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = currentQuestions[nextIndex];
      set({
        currentQuestionIndex: nextIndex,
        selectedAnswer: get().answers[nextQuestion.id] ?? null,
      });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex, currentQuestions } = get();
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const prevQuestion = currentQuestions[prevIndex];
      set({
        currentQuestionIndex: prevIndex,
        selectedAnswer: get().answers[prevQuestion.id] ?? null,
      });
    }
  },

  completeQuiz: async (attemptId: string, timeTaken: number) => {
    const { currentQuestions, answers, currentAttempt } = get();
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalScore = 0;

      // Save each response and calculate score
      for (const question of currentQuestions) {
        const selectedAnswer = answers[question.id];
        const isCorrect = selectedAnswer === question.correct_answer;
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.points;
        }

        // Insert question response
        await supabase.from('question_responses').insert({
          attempt_id: attemptId,
          question_id: question.id,
          selected_answer: selectedAnswer ?? null,
          is_correct: isCorrect,
        });
      }

      // Update attempt with final score
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          score: totalScore,
          correct_answers: correctAnswers,
          time_taken_seconds: timeTaken,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      set({ currentAttempt: data as QuizAttempt });
      return data as QuizAttempt;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  resetQuiz: () => {
    set({
      currentQuiz: null,
      currentQuestions: [],
      currentAttempt: null,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answers: {},
    });
  },
}));
