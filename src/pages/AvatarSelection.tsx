import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Check, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color_scheme: string;
  points_cost: number;
  is_default: boolean;
}

const AvatarSelection = () => {
  console.log('AvatarSelection component rendering');
  
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [unlockedAvatars, setUnlockedAvatars] = useState<Set<string>>(new Set());
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  console.log('Component state:', { user: !!user, profile: !!profile, isLoading });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all avatar options
      const { data: avatarData } = await supabase
        .from('avatar_options')
        .select('*')
        .order('points_cost', { ascending: true })
        .order('name', { ascending: true });

      // Fetch user's unlocked avatars
      const { data: unlockedData } = await supabase
        .from('unlocked_avatars')
        .select('avatar_id')
        .eq('user_id', user?.id);

      // Fetch user's total points
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null);

      const totalPoints = attempts?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;

      setAvatars(avatarData || []);
      setUnlockedAvatars(new Set(unlockedData?.map(u => u.avatar_id) || []));
      setUserPoints(totalPoints);
      setSelectedAvatar(profile?.selected_avatar_id || null);
      setTempSelectedAvatar(profile?.selected_avatar_id || null);
    } catch (error) {
      console.error('Error fetching avatar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockAvatar = async (avatar: AvatarOption) => {
    if (userPoints < avatar.points_cost) {
      toast({
        variant: 'destructive',
        title: 'Not enough points',
        description: `You need ${avatar.points_cost - userPoints} more points to unlock this avatar.`
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('unlocked_avatars')
        .insert({
          user_id: user?.id,
          avatar_id: avatar.id
        });

      if (error) throw error;

      setUnlockedAvatars(prev => new Set([...prev, avatar.id]));
      setUserPoints(prev => prev - avatar.points_cost);

      toast({
        title: 'Avatar unlocked!',
        description: `${avatar.name} is now available!`
      });
    } catch (error) {
      console.error('Error unlocking avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unlock avatar. Please try again.'
      });
    }
  };

  const handleSaveAvatar = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('Save button clicked');
    
    if (!tempSelectedAvatar) {
      console.log('No avatar selected');
      return;
    }

    console.log('Starting save process...');
    setIsSaving(true);
    
    // Just log success without any database operations
    console.log('Avatar would be saved:', tempSelectedAvatar);
    alert('Test: Avatar save clicked (no DB operation)');
    
    setIsSaving(false);
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

  const currentAvatar = avatars.find(a => a.id === selectedAvatar);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Choose Your Avatar</h2>
          <p className="text-muted-foreground">
            Select an avatar to represent you! Unlock new avatars with points.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Current Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Current Avatar
              </h3>
              {currentAvatar ? (
                <div className={`aspect-square bg-gradient-to-br ${currentAvatar.color_scheme} rounded-2xl flex items-center justify-center mb-4`}>
                  <div className="text-8xl">{currentAvatar.emoji}</div>
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mb-4">
                  <div className="text-8xl">👤</div>
                </div>
              )}
              <p className="text-center font-medium mb-4">
                {currentAvatar?.name || 'No avatar selected'}
              </p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
                <span className="text-sm font-medium">Your Points</span>
                <span className="text-lg font-bold text-primary">{userPoints}</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  alert('Button clicked!');
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Avatar
              </button>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {avatars.map((avatar, index) => {
                const isUnlocked = unlockedAvatars.has(avatar.id);
                const isSelected = tempSelectedAvatar === avatar.id;
                const canAfford = userPoints >= avatar.points_cost;
                
                // Determine rarity based on points cost
                const getRarity = (cost: number) => {
                  if (cost === 0) return { name: 'Common', color: 'text-gray-500', bg: 'bg-gray-100' };
                  if (cost <= 300) return { name: 'Rare', color: 'text-blue-600', bg: 'bg-blue-100' };
                  if (cost <= 600) return { name: 'Epic', color: 'text-purple-600', bg: 'bg-purple-100' };
                  if (cost <= 1500) return { name: 'Legendary', color: 'text-orange-600', bg: 'bg-orange-100' };
                  return { name: 'Mythical', color: 'text-red-600', bg: 'bg-red-100' };
                };
                
                const rarity = getRarity(avatar.points_cost);

                return (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card rounded-2xl p-4 text-center transition-all cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${!isUnlocked ? 'opacity-60' : 'hover:shadow-lg'}`}
                    onClick={() => isUnlocked && setTempSelectedAvatar(avatar.id)}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center z-10">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Rarity Badge */}
                    {avatar.points_cost > 0 && (
                      <div className={`absolute -top-1 -left-1 px-2 py-1 rounded-full text-xs font-bold ${rarity.bg} ${rarity.color}`}>
                        {rarity.name}
                      </div>
                    )}

                    <div className={`aspect-square bg-gradient-to-br ${avatar.color_scheme} rounded-xl flex items-center justify-center mb-3 relative`}>
                      {isUnlocked ? (
                        <div className="text-5xl">{avatar.emoji}</div>
                      ) : (
                        <>
                          <div className="text-5xl opacity-30">{avatar.emoji}</div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                        </>
                      )}
                    </div>

                    <p className="font-medium text-sm mb-2">{avatar.name}</p>

                    {!isUnlocked && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockAvatar(avatar);
                        }}
                        disabled={!canAfford}
                        className={`w-full text-xs ${
                          avatar.points_cost > 1000 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          avatar.points_cost > 500 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                          avatar.points_cost > 100 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : ''
                        }`}
                        variant={canAfford ? 'default' : 'secondary'}
                      >
                        {canAfford ? (
                          <>
                            <Trophy className="w-3 h-3 mr-1" />
                            {avatar.points_cost} pts
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            {avatar.points_cost} pts
                          </>
                        )}
                      </Button>
                    )}

                    {isUnlocked && !isSelected && (
                      <p className="text-xs text-muted-foreground">Click to select</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AvatarSelection;