import { motion } from 'framer-motion';
import { FileText, Shield, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';

const TermsAndConditions = () => {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome to EduQuest Hub</h2>
            <p className="text-muted-foreground">
              EduQuest Hub is a brain training platform designed specifically for students at Alabang Elementary School. 
              By using this platform, you agree to follow these terms and conditions to ensure a safe and productive 
              learning environment for everyone.
            </p>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                Last updated: January 12, 2026
              </p>
            </div>
          </div>

          {/* Educational Use */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Educational Use</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Purpose:</strong> This platform is designed exclusively for educational purposes to help 
                Grade 4-6 students develop logical thinking through interactive brain training games including 
                Pattern Recognition, Sequencing, and Deductive Reasoning.
              </p>
              <p>
                <strong>Academic Integrity:</strong> Students are expected to complete games honestly and 
                independently. Using external help undermines the brain training process.
              </p>
              <p>
                <strong>Learning Goals:</strong> The platform aims to strengthen logical thinking skills and help 
                students track their cognitive development through engaging gameplay.
              </p>
            </div>
          </div>

          {/* Student Responsibilities */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-success" />
              <h3 className="text-xl font-bold">Student Responsibilities</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2" />
                <p className="text-muted-foreground">
                  <strong>Respectful Behavior:</strong> Treat the platform and other users with respect
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2" />
                <p className="text-muted-foreground">
                  <strong>Honest Participation:</strong> Complete brain training games using your own thinking and effort
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2" />
                <p className="text-muted-foreground">
                  <strong>Account Security:</strong> Keep your login information private and secure
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2" />
                <p className="text-muted-foreground">
                  <strong>Appropriate Use:</strong> Use the platform only for its intended educational purposes
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2" />
                <p className="text-muted-foreground">
                  <strong>Report Issues:</strong> Inform teachers about any technical problems or concerns
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Data Protection */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold">Privacy & Data Protection</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Data Collection:</strong> We collect only necessary information including your name, 
                grade level, and brain training game performance to track your cognitive development.
              </p>
              <p>
                <strong>Data Use:</strong> Your information is used solely for educational purposes and to 
                help teachers understand your logical thinking progress.
              </p>
              <p>
                <strong>Data Security:</strong> All student data is securely stored and protected. Only 
                authorized school personnel have access to your information.
              </p>
              <p>
                <strong>Data Sharing:</strong> We do not share student information with third parties. 
                Your data remains within the school's educational system.
              </p>
            </div>
          </div>

          {/* Platform Rules */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Platform Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-success">✓ Allowed</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Playing brain training games multiple times to improve</li>
                  <li>• Asking teachers for help when needed</li>
                  <li>• Using the platform during designated times</li>
                  <li>• Celebrating achievements and progress</li>
                  <li>• Learning from mistakes and trying again</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-destructive">✗ Not Allowed</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sharing login credentials with others</li>
                  <li>• Getting help from others during brain training</li>
                  <li>• Using external resources during games</li>
                  <li>• Attempting to access other students' accounts</li>
                  <li>• Misusing the platform for non-educational purposes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Support & Contact */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Support & Contact</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                If you have questions about these terms or need help with the platform, please contact:
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <p><strong>Alabang Elementary School</strong></p>
                <p>Educational Technology Department</p>
                <p>Email: eduquest@alabangelementary.edu.ph</p>
                <p>Phone: (02) 8XXX-XXXX</p>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <div className="glass-card rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Agreement</h3>
            <p className="text-muted-foreground mb-6">
              By using EduQuest Hub, you acknowledge that you have read, understood, and agree to 
              follow these terms and conditions. These terms help ensure a positive learning 
              environment for all students.
            </p>
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Return to Learning
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TermsAndConditions;