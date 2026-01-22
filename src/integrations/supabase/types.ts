export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          badge_color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          badge_color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_answer: number | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_answer?: number | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          id: string
          options: Json
          order_index: number
          points: number | null
          question_image_url: string | null
          question_text: string
          quiz_id: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          id?: string
          options?: Json
          order_index?: number
          points?: number | null
          question_image_url?: string | null
          question_text: string
          quiz_id: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          id?: string
          options?: Json
          order_index?: number
          points?: number | null
          question_image_url?: string | null
          question_text?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          id: string
          quiz_id: string
          score: number | null
          started_at: string
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          quiz_id: string
          score?: number | null
          started_at?: string
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          quiz_id?: string
          score?: number | null
          started_at?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          grade: Database["public"]["Enums"]["grade_level"]
          id: string
          is_active: boolean | null
          subject: Database["public"]["Enums"]["subject_type"]
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade: Database["public"]["Enums"]["grade_level"]
          id?: string
          is_active?: boolean | null
          subject: Database["public"]["Enums"]["subject_type"]
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          grade?: Database["public"]["Enums"]["grade_level"]
          id?: string
          is_active?: boolean | null
          subject?: Database["public"]["Enums"]["subject_type"]
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "admin" | "super_admin"
      grade_level: "4" | "5" | "6"
      subject_type: "math" | "science" | "logic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "admin", "super_admin"],
      grade_level: ["4", "5", "6"],
      subject_type: ["math", "science", "logic"],
    },
  },
} as const
