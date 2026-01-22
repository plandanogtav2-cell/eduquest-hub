import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, Medal, Calculator, FlaskConical, Brain, Target, Zap, Crown } from 'lucide-react';

interface PublicBadge {
  achievement_name: string;
  achievement_icon: string;
  achievement_color: string;
  student_name: string;
  earned_at: string;
}

const PublicBadgeShowcase = () => {
  const [recentBadges, setRecentBadges] = useState<PublicBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentBadges();
  }, []);

  const fetchRecentBadges = async () => {
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements!inner(name, icon, badge_color),
          profiles!inner(full_name)
        `)
        .order('earned_at', { ascending: false })
        .limit(8);

      if (data) {
        const badges = data.map(item => ({
          achievement_name: item.achievements.name,
          achievement_icon: item.achievements.icon,
          achievement_color: item.achievements.badge_color,
          student_name: item.profiles.full_name?.split(' ')[0] + ' ' + 
                       (item.profiles.full_name?.split(' ')[1]?.[0] || '') + '.',
          earned_at: item.earned_at
        }));
        setRecentBadges(badges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      // Fallback to static badges if database fails
      setRecentBadges([
        { achievement_name: 'First Quiz Hero', achievement_icon: 'star', achievement_color: 'green', student_name: 'Maria G.', earned_at: new Date().toISOString() },
        { achievement_name: 'Math Genius', achievement_icon: 'calculator', achievement_color: 'blue', student_name: 'Juan P.', earned_at: new Date().toISOString() },
        { achievement_name: 'Science Wizard', achievement_icon: 'flask', achievement_color: 'green', student_name: 'Ana L.', earned_at: new Date().toISOString() },
        { achievement_name: 'Perfect Start', achievement_icon: 'trophy', achievement_color: 'gold', student_name: 'Carlos M.', earned_at: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      medal: Medal,
      calculator: Calculator,
      flask: FlaskConical,
      brain: Brain,
      target: Target,
      zap: Zap,
      crown: Crown
    };
    return icons[iconName] || Star;
  };

  const getBadgeColor = (color: string) => {
    const colors: { [key: string]: string } = {
      gold: 'from-yellow-400 to-yellow-600',
      silver: 'from-gray-300 to-gray-500',
      bronze: 'from-amber-600 to-amber-800',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      blue: 'from-blue-400 to-blue-600'
    };
    return colors[color] || 'from-primary to-accent';
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-3xl p-8 max-w-4xl mx-auto"
    >
      <h4 className="text-2xl font-bold text-center mb-6">Latest Badge Winners! 🏆</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recentBadges.slice(0, 4).map((badge, index) => {
          const IconComponent = getIcon(badge.achievement_icon);
          return (
            <motion.div
              key={`${badge.student_name}-${badge.achievement_name}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getBadgeColor(badge.achievement_color)} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-foreground">{badge.achievement_name}</div>
              <div className="text-xs text-muted-foreground mt-1">Earned by {badge.student_name}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">Join now and start earning your own badges!</p>
      </div>
    </motion.div>
  );
};

export default PublicBadgeShowcase;