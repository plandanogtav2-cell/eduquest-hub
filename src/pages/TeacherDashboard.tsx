import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Search, Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';

interface Student {
  user_id: string;
  full_name: string;
  grade: string;
  points: number;
  quizzes_completed: number;
  avatar_emoji?: string;
  avatar_color?: string;
}

const TeacherDashboard = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for admin dashboard...');
      
      // Count total game sessions instead of quizzes
      const { count: totalGames } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true });
      console.log('Total games:', totalGames);
      setTotalQuizzes(totalGames || 0);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          grade,
          selected_avatar_id,
          avatar_options!profiles_selected_avatar_id_fkey(
            emoji,
            color_scheme
          )
        `)
        .not('grade', 'is', null)
        .order('full_name', { ascending: true });

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        setIsLoading(false);
        return;
      }

      console.log('Fetched profiles:', profiles);

      if (profiles) {
        // Get all user roles
        const { data: allRoles } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        console.log('All roles:', allRoles);
        
        // Filter out admin/teacher accounts
        const adminIds = new Set(allRoles?.filter(r => r.role === 'admin' || r.role === 'super_admin').map(r => r.user_id) || []);
        const studentProfiles = profiles.filter(p => !adminIds.has(p.user_id));
        
        console.log('Student profiles after filtering:', studentProfiles);

        const studentsWithProgress = await Promise.all(
          studentProfiles.map(async (profile) => {
            // Calculate points from game sessions
            const { data: sessions } = await supabase
              .from('game_sessions')
              .select('score')
              .eq('user_id', profile.user_id);
            
            const totalPoints = sessions?.reduce((sum, session) => sum + (session.score || 0), 0) || 0;
            
            const { count: gamesPlayed } = await supabase
              .from('game_sessions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.user_id);
            
            return {
              user_id: profile.user_id,
              full_name: profile.full_name,
              grade: profile.grade,
              points: totalPoints,
              quizzes_completed: gamesPlayed || 0,
              avatar_emoji: profile.avatar_options?.emoji,
              avatar_color: profile.avatar_options?.color_scheme
            };
          })
        );
        
        // Sort by points descending
        studentsWithProgress.sort((a, b) => b.points - a.points);
        console.log('Students with progress:', studentsWithProgress);
        setStudents(studentsWithProgress);
        setFilteredStudents(studentsWithProgress);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on search and grade
  useEffect(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade === gradeFilter);
    }
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, gradeFilter]);

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
          <h2 className="text-3xl font-bold mb-2">Teacher Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor student progress in brain training games
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <Users className="w-8 h-8 mb-3 text-blue-500" />
            <div className="text-3xl font-bold mb-1">{students.length}</div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <BookOpen className="w-8 h-8 mb-3 text-green-500" />
            <div className="text-3xl font-bold mb-1">{totalQuizzes}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <BookOpen className="w-8 h-8 mb-3 text-purple-500" />
            <div className="text-3xl font-bold mb-1">{students.reduce((sum, s) => sum + s.quizzes_completed, 0)}</div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="text-lg font-bold mb-1">Easy • Medium • Hard</div>
            <div className="text-sm text-muted-foreground">Difficulty Levels</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">All Students</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{students.length === 0 ? 'No students found' : 'No students match your filters'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-8 text-center font-bold text-muted-foreground">#{index + 1}</span>
                    {student.avatar_emoji && student.avatar_color && (
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${student.avatar_color} flex items-center justify-center text-xl flex-shrink-0`}>
                        {student.avatar_emoji}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => navigate(`/teacher/student/${student.user_id}`)}
                        className="font-medium truncate text-left hover:text-primary hover:underline cursor-pointer"
                      >
                        {student.full_name}
                      </button>
                      <p className="text-sm text-muted-foreground">Grade {student.grade}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold">{student.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">{student.quizzes_completed}</p>
                    <p className="text-xs text-muted-foreground">games</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;