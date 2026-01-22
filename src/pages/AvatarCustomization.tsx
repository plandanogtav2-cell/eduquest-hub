import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface AvatarItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
  points_cost: number;
  is_default: boolean;
}

interface UserInventory {
  avatar_item_id: string;
}

const AvatarCustomization = () => {
  const { user, profile, refreshProfile } = useAuthStore();
  const { toast } = useToast();
  const [avatarItems, setAvatarItems] = useState<AvatarItem[]>([]);
  const [userInventory, setUserInventory] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: string }>({});
  const [userPoints, setUserPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState('hair');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'hair', label: 'Hair', icon: '💇' },
    { id: 'eyes', label: 'Eyes', icon: '👁️' },
    { id: 'skin', label: 'Skin', icon: '🎨' },
    { id: 'accessories', label: 'Accessories', icon: '👓' },
    { id: 'background', label: 'Background', icon: '🌈' }
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all avatar items
      const { data: items } = await supabase
        .from('avatar_items')
        .select('*')
        .order('points_cost');

      // Fetch user's unlocked items
      const { data: inventory } = await supabase
        .from('user_avatar_items')
        .select('avatar_item_id')
        .eq('user_id', user?.id);

      // Fetch user's total points
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null);

      const totalPoints = attempts?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;

      setAvatarItems(items || []);
      setUserInventory(new Set(inventory?.map(i => i.avatar_item_id) || []));
      setUserPoints(totalPoints);

      // Load current avatar configuration
      if (profile?.avatar_config) {
        setSelectedItems(profile.avatar_config);
      }
    } catch (error) {
      console.error('Error fetching avatar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockItem = async (item: AvatarItem) => {
    if (userPoints < item.points_cost) {
      toast({
        variant: 'destructive',
        title: 'Not enough points',
        description: `You need ${item.points_cost - userPoints} more points to unlock this item.`
      });
      return;
    }

    try {
      // Add item to user's inventory
      const { error } = await supabase
        .from('user_avatar_items')
        .insert({
          user_id: user?.id,
          avatar_item_id: item.id
        });

      if (error) throw error;

      // Update local state
      setUserInventory(prev => new Set([...prev, item.id]));
      setUserPoints(prev => prev - item.points_cost);

      toast({
        title: 'Item unlocked!',
        description: `${item.name} has been added to your collection.`
      });
    } catch (error) {
      console.error('Error unlocking item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unlock item. Please try again.'
      });
    }
  };

  const handleSelectItem = (category: string, itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: itemId
    }));
  };

  const handleSaveAvatar = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_config: selectedItems })
        .eq('user_id', user?.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Avatar saved!',
        description: 'Your avatar has been updated successfully.'
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save avatar. Please try again.'
      });
    }
  };

  const getAvatarPreview = () => {
    const hair = selectedItems['hair'];
    const hairItem = hair ? avatarItems.find(i => i.id === hair) : null;
    return hairItem?.image_url || '👤';
  };

  const getBackgroundColor = () => {
    const background = selectedItems['background'];
    const bgItem = background ? avatarItems.find(i => i.id === background) : null;
    
    if (!bgItem) return 'from-primary/10 to-accent/10';
    
    const colorMap: { [key: string]: string } = {
      '🌤️': 'from-blue-200 to-blue-300',
      '🌙': 'from-indigo-900 to-purple-900',
      '🌈': 'from-pink-300 via-purple-300 to-blue-300',
      '✨': 'from-yellow-200 to-amber-300',
      '🌲': 'from-green-600 to-green-800'
    };
    
    return colorMap[bgItem.image_url] || 'from-primary/10 to-accent/10';
  };

  const getAccessoryDisplay = () => {
    const accessories = selectedItems['accessories'];
    const accessoryItem = accessories ? avatarItems.find(i => i.id === accessories) : null;
    return accessoryItem?.image_url || null;
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

  const categoryItems = avatarItems.filter(item => item.category === activeCategory);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Avatar Customization</h2>
          <p className="text-muted-foreground">
            Customize your avatar and unlock new items with points!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Avatar
              </h3>
              <div className={`aspect-square bg-gradient-to-br ${getBackgroundColor()} rounded-2xl flex flex-col items-center justify-center mb-4 relative`}>
                <div className="text-8xl">{getAvatarPreview()}</div>
                {getAccessoryDisplay() && (
                  <div className="absolute bottom-8 text-4xl">{getAccessoryDisplay()}</div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Available Points</span>
                  <span className="text-lg font-bold text-primary">{userPoints}</span>
                </div>
                <Button onClick={handleSaveAvatar} className="w-full bg-gradient-to-r from-primary to-accent">
                  <Check className="w-4 h-4 mr-2" />
                  Save Avatar
                </Button>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categoryItems.map((item, index) => {
                  const isUnlocked = userInventory.has(item.id);
                  const isSelected = selectedItems[activeCategory] === item.id;
                  const canAfford = userPoints >= item.points_cost;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : isUnlocked
                          ? 'border-border hover:border-primary/50'
                          : 'border-border opacity-60'
                      }`}
                      onClick={() => isUnlocked && handleSelectItem(activeCategory, item.id)}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      
                      <div className="text-4xl mb-2 text-center">{item.image_url}</div>
                      <p className="text-xs font-medium text-center mb-2 truncate">{item.name}</p>
                      
                      {!isUnlocked && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockItem(item);
                          }}
                          disabled={!canAfford}
                          className="w-full text-xs"
                          variant={canAfford ? 'default' : 'secondary'}
                        >
                          {canAfford ? (
                            <>
                              <ShoppingBag className="w-3 h-3 mr-1" />
                              {item.points_cost}
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              {item.points_cost}
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AvatarCustomization;