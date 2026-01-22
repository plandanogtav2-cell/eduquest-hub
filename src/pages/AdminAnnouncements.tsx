import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Megaphone, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read_count: number;
  total_students: number;
}

const AdminAnnouncements = () => {
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role !== 'admin' && role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    fetchAnnouncements();
  }, [role, navigate]);

  const fetchAnnouncements = async () => {
    try {
      const { data: announcementData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (announcementData) {
        // Get student count
        const { count: totalStudents } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('grade', 'is', null);

        // Get read counts for each announcement
        const announcementsWithCounts = await Promise.all(
          announcementData.map(async (announcement) => {
            const { count: readCount } = await supabase
              .from('announcement_reads')
              .select('*', { count: 'exact', head: true })
              .eq('announcement_id', announcement.id);

            return {
              ...announcement,
              content: announcement.message,
              read_count: readCount || 0,
              total_students: totalStudents || 0
            };
          })
        );

        setAnnouncements(announcementsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Attempting to insert announcement:', formData);
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title,
          message: formData.content,
          created_by: user?.id,
          is_active: true
        })
        .select();

      console.log('Insert result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Announcement posted successfully',
      });

      setFormData({ title: '', content: '' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: 'Error',
        description: `Failed to post announcement: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Announcement deleted successfully',
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Manage Announcements</h2>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold mb-4">Create New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content"
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Posting...' : 'Post Announcement'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground">Create your first announcement to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    {announcement.title}
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {announcement.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{announcement.read_count}/{announcement.total_students} read</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAnnouncements;