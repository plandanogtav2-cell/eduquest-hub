import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isInitialized: boolean;
  
  initialize: () => Promise<(() => void) | undefined>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, grade: string, isTeacher?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  role: 'student',
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          set({ session, user: session?.user ?? null });
          
          // Defer profile and role fetch with setTimeout
          if (session?.user) {
            setTimeout(() => {
              get().updateProfile({});
            }, 0);
          } else {
            set({ profile: null, role: 'student' });
          }
        }
      );

      // THEN check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        // Fetch role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        set({
          user: session.user,
          session,
          profile: profile as Profile | null,
          role: (roleData?.role as UserRole) || 'student',
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({ isLoading: false, isInitialized: true });
      }

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error };
    }

    if (data.user) {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      set({
        user: data.user,
        session: data.session,
        profile: profile as Profile | null,
        role: (roleData?.role as UserRole) || 'student',
        isLoading: false,
      });
    }

    return { error: null };
  },

  signUp: async (email: string, password: string, fullName: string, grade: string, isTeacher = false) => {
    set({ isLoading: true });

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          grade: grade || null,
          is_teacher: isTeacher,
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      return { error };
    }

    if (data.user) {
      // If teacher, insert admin role
      if (isTeacher) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'admin'
          });
      }

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      set({
        user: data.user,
        session: data.session,
        profile: profile as Profile | null,
        role: (roleData?.role as UserRole) || 'student',
        isLoading: false,
      });
    }

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      role: 'student',
    });
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }

    return { error: error as Error | null };
  },
}));
