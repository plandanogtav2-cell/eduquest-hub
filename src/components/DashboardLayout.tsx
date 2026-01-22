import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Menu, X, FileText, Settings, TrendingUp, Users, GraduationCap, Home, Trophy, User as UserIcon, Shield, BarChart3, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && role === 'student') {
      fetchUnreadCount();
    }
  }, [user, role]);

  const fetchUnreadCount = async () => {
    try {
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id')
        .eq('is_active', true);

      if (announcements) {
        const { data: reads } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('user_id', user?.id);

        const readIds = new Set(reads?.map(r => r.announcement_id) || []);
        const unread = announcements.filter(a => !readIds.has(a.id));
        setUnreadCount(unread.length);
      }
    } catch (error) {
      // Silently fail - just show 0 unread
      setUnreadCount(0);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = role === 'admin' || role === 'super_admin';

  const sidebarItems = isAdmin ? [
    { icon: Shield, label: 'Admin Dashboard', path: '/teacher' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: BookOpen, label: 'Manage Quizzes', path: '/teacher/quizzes' },
    { icon: Megaphone, label: 'Announcements', path: '/teacher/announcements' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ] : [
    { icon: Home, label: 'Quizzes', path: '/dashboard' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: GraduationCap, label: 'Syllabus', path: '/syllabus' },
    { icon: TrendingUp, label: 'Progress Tracker', path: '/progress' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: Users, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: FileText, label: 'Terms & Conditions', path: '/terms' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:sticky lg:top-0 lg:h-screen ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src="/school-logo.PNG" alt="EduQuest Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="font-bold text-sm">EduQuest</h2>
                <p className="text-xs text-muted-foreground">Alabang Elementary School</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0" style={{maxHeight: 'calc(100vh - 200px)'}}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => {
                    console.log('Navigating to:', item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.path === '/announcements' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="p-3 bg-muted/50 rounded-lg mb-3">
              <p className="text-xs font-medium">{profile?.full_name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border bg-card">
          <div className="px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <img src="/school-logo.PNG" alt="EduQuest Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-sm">EduQuest</h1>
                <p className="text-xs text-muted-foreground">Alabang Elementary School</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;