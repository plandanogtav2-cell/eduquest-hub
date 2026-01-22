import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const StudyGroups = () => {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Study Groups</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Connect and collaborate with your classmates! This feature is coming soon.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudyGroups;