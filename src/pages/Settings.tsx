import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

const Settings = () => {
  const { profile, updateProfile, role } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isTeacher = role === 'admin' || role === 'super_admin';
  const [settings, setSettings] = useState({
    fullName: profile?.full_name || '',
    notifications: true,
    soundEffects: true,
    darkMode: false,
    autoSave: true
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSoundEffects = localStorage.getItem('soundEffects');
    const savedNotifications = localStorage.getItem('notifications');
    const savedAutoSave = localStorage.getItem('autoSave');
    
    setSettings(prev => ({
      ...prev,
      fullName: profile?.full_name || '',
      soundEffects: savedSoundEffects !== 'false',
      notifications: savedNotifications !== 'false',
      autoSave: savedAutoSave !== 'false'
    }));
  }, [profile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save profile changes
      const { error } = await updateProfile({
        full_name: settings.fullName
      });

      // Save settings to localStorage
      localStorage.setItem('soundEffects', settings.soundEffects.toString());
      localStorage.setItem('notifications', settings.notifications.toString());
      localStorage.setItem('autoSave', settings.autoSave.toString());

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update profile, but settings were saved'
        });
      } else {
        toast({
          title: 'Settings Updated',
          description: 'Your preferences have been saved successfully'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoundEffectsChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, soundEffects: checked }));
    // Immediately save to localStorage for instant effect
    localStorage.setItem('soundEffects', checked.toString());
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Settings */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={settings.fullName}
                  onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Role</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <span className="font-medium">{isTeacher ? 'Teacher/Admin' : `Grade ${profile?.grade} Student`}</span>
                  <p className="text-sm text-muted-foreground">
                    {isTeacher ? 'Administrator account with full access' : 'Contact your teacher to change grade level'}
                  </p>
                </div>
              </div>
              {!isTeacher && (
                <div>
                  <Button
                    onClick={() => navigate('/avatar')}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Choose Avatar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          {!isTeacher && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Game Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new brain training challenges</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Achievement Alerts</Label>
                    <p className="text-sm text-muted-foreground">Celebrate when you earn badges</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* App Preferences */}
          {!isTeacher && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">App Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds during brain training games for feedback</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={handleSoundEffectsChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Data Protection</h3>
                <p className="text-sm text-muted-foreground">
                  {isTeacher 
                    ? 'All student data is securely stored and accessible only to authorized administrators.'
                    : 'Your brain training progress and personal information are securely stored and only accessible by you and your teachers.'}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                  {isTeacher
                    ? 'Your administrator account is protected with secure authentication.'
                    : 'Your account is protected with secure authentication. Contact your teacher if you need to reset your password.'}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;