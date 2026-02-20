import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Mail, Lock, User, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  grade: z.enum(['4', '5', '6'], { required_error: 'Please select your grade' }).optional(),
  isTeacher: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, role, isLoading } = useAuthStore();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', grade: '4', isTeacher: false },
  });

  useEffect(() => {
    if (user && role && !isLoading) {
      // Redirect based on role
      if (role === 'admin' || role === 'super_admin') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, role, isLoading, navigate]);

  const handleLogin = async (data: LoginForm) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
      });
    } else {
      toast({ title: 'Welcome back!', description: 'Successfully logged in' });
      // Wait a bit for role to be loaded, then redirect
      setTimeout(() => {
        const currentRole = useAuthStore.getState().role;
        if (currentRole === 'admin' || currentRole === 'super_admin') {
          navigate('/teacher');
        } else {
          navigate('/dashboard');
        }
      }, 100);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    // For teachers, use a default grade temporarily
    const gradeToUse = data.isTeacher ? '4' : data.grade;
    
    const { error } = await signUp(data.email, data.password, data.fullName, gradeToUse, data.isTeacher);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Could not create account',
      });
    } else {
      toast({ title: 'Welcome!', description: data.isTeacher ? 'Teacher account created successfully' : 'Account created successfully' });
      navigate(data.isTeacher ? '/teacher' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/school-logo.PNG" alt="EduQuest Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-xl">{isSignup ? 'Create Account' : 'Welcome Back!'}</h1>
              <p className="text-sm text-muted-foreground">
                {isSignup ? 'Start your learning journey' : 'Continue your learning adventure'}
              </p>
            </div>
          </div>

          {isSignup ? (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="fullName" placeholder="Enter your name" className="pl-10" {...signupForm.register('fullName')} />
                </div>
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" {...signupForm.register('email')} />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Create a password" className="pl-10" {...signupForm.register('password')} />
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      !signupForm.watch('isTeacher')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="student"
                      className="sr-only"
                      checked={!signupForm.watch('isTeacher')}
                      onChange={() => signupForm.setValue('isTeacher', false)}
                    />
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">Student</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      signupForm.watch('isTeacher')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="teacher"
                      className="sr-only"
                      checked={signupForm.watch('isTeacher')}
                      onChange={() => signupForm.setValue('isTeacher', true)}
                    />
                    <User className="w-4 h-4" />
                    <span className="font-medium">Teacher</span>
                  </label>
                </div>
              </div>

              {!signupForm.watch('isTeacher') && (
                <div>
                  <Label>Grade Level</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {['4', '5', '6'].map((grade) => (
                      <label
                        key={grade}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          signupForm.watch('grade') === grade
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input type="radio" value={grade} className="sr-only" {...signupForm.register('grade')} />
                        <GraduationCap className="w-4 h-4" />
                        <span className="font-medium">Grade {grade}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" {...loginForm.register('email')} />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter your password" className="pl-10" {...loginForm.register('password')} />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-accent items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-primary-foreground"
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center animate-float">
            <img src="/school-logo.PNG" alt="EduQuest Logo" className="w-24 h-24 object-contain" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Alabang Elementary</h2>
          <p className="text-lg opacity-90">Educational Game</p>
          <p className="mt-4 opacity-75 max-w-sm">Learn Math, Science, and Logic through fun interactive quizzes!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
