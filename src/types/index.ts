// User Types
export type UserRole = 'student' | 'admin' | 'super_admin';
export type Grade = '4' | '5' | '6';
export type Subject = 'math' | 'science' | 'logic';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  grade?: Grade;
  role: UserRole;
  createdAt: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  grade?: Grade;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  grade: Grade;
  time_limit_minutes: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_image_url?: string;
  options: string[];
  correct_answer: number;
  points: number;
  order_index: number;
  difficulty?: Difficulty;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds?: number;
  completed_at?: string;
  started_at: string;
  quiz?: Quiz;
}

export interface QuestionResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer?: number;
  is_correct: boolean;
  answered_at: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  points_required: number;
  badge_color: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

// Dashboard Stats
export interface StudentStats {
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  achievementsEarned: number;
  recentAttempts: QuizAttempt[];
  subjectProgress: {
    math: number;
    science: number;
    logic: number;
  };
}

export interface AdminStats {
  totalStudents: number;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  activeQuizzes: number;
  recentActivity: QuizAttempt[];
}

// Subject metadata
export const SUBJECTS: Record<Subject, { label: string; color: string; icon: string }> = {
  math: { label: 'Math', color: 'primary', icon: 'Calculator' },
  science: { label: 'Science', color: 'success', icon: 'FlaskConical' },
  logic: { label: 'Logic', color: 'accent', icon: 'Brain' },
};

export const GRADES: Record<Grade, { label: string; color: string }> = {
  '4': { label: 'Grade 4', color: 'info' },
  '5': { label: 'Grade 5', color: 'warning' },
  '6': { label: 'Grade 6', color: 'primary' },
};
