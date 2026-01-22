import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, User, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  is_read: boolean;
  author_name?: string;
}

const Announcements = () => {
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAnnouncements();
  }, [user, navigate]);

  const fetchAnnouncements = async () => {
    try {
      console.log('Fetching announcements for user:', user?.id);
      const { data: announcementData, error } = await supabase
        .from('announcements')
        .select('id, title, message, created_at, created_by')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Announcement query result:', { data: announcementData, error });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (announcementData) {
        // Get read status for current user
        const { data: reads } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('user_id', user?.id);

        const readIds = new Set(reads?.map(r => r.announcement_id) || []);

        const formattedAnnouncements = announcementData.map(a => ({
          id: a.id,
          title: a.title,
          content: a.message,
          created_at: a.created_at,
          created_by: a.created_by,
          is_read: readIds.has(a.id),
          author_name: 'Admin'
        }));

        console.log('Formatted announcements:', formattedAnnouncements);
        setAnnouncements(formattedAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      await supabase
        .from('announcement_reads')
        .insert({
          announcement_id: announcementId,
          user_id: user?.id
        });

      // Update local state
      setAnnouncements(prev => 
        prev.map(a => 
          a.id === announcementId ? { ...a, is_read: true } : a
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
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
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Announcements</h2>
          </div>
          <p className="text-muted-foreground">
            Stay updated with the latest news and information
          </p>
        </motion.div>

        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-2xl p-6 relative ${
                  !announcement.is_read ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                {!announcement.is_read && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full"></div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    {announcement.title}
                  </h3>
                  {announcement.is_read && (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {announcement.content.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                    if (part.match(/https?:\/\/[^\s]+/)) {
                      return (
                        <a
                          key={index}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {part}
                        </a>
                      );
                    }
                    return part;
                  })}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{announcement.author_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {!announcement.is_read && (
                    <Button
                      size="sm"
                      onClick={() => markAsRead(announcement.id)}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Announcements;