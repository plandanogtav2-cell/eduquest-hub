import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Users, Brain, Calculator, FlaskConical, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicBadgeShowcase from '@/components/PublicBadgeShowcase';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-success/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src="/school-logo.PNG" alt="EduQuest Logo" className="w-16 h-16 object-contain rounded-xl shadow-glow" />
            <div>
              <h1 className="font-bold text-lg text-foreground">EduQuest</h1>
              <p className="text-xs text-muted-foreground">Alabang Elementary School</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-glow transition-shadow">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Learning Made Fun!</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-balance"
            >
              <span className="gradient-text">Learn, Play, Grow</span>
              <br />
              <span className="text-foreground">Together!</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance"
            >
              An interactive educational platform designed for Alabang Elementary School students. 
              Master Math, Science, and Logic through exciting quizzes and earn achievements!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg px-8 py-6 shadow-xl hover:shadow-glow transition-all">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  I Have an Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Three Amazing Subjects</h3>
            <p className="text-muted-foreground text-lg">Choose your favorite and start exploring!</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Math Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator className="w-10 h-10 text-primary" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-foreground">Math</h4>
              <p className="text-muted-foreground">Addition, multiplication, fractions, and more exciting number adventures!</p>
            </motion.div>

            {/* Science Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FlaskConical className="w-10 h-10 text-success" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-foreground">Science</h4>
              <p className="text-muted-foreground">Discover plants, animals, the human body, and the wonders of nature!</p>
            </motion.div>

            {/* Logic Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-10 h-10 text-accent" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-foreground">Logic</h4>
              <p className="text-muted-foreground">Solve puzzles, find patterns, and train your brain to think critically!</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Student Achievements</h3>
            <p className="text-muted-foreground text-lg">See what our amazing students have accomplished!</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
            {[
              { icon: BookOpen, value: '50+', label: 'Quizzes' },
              { icon: Trophy, value: '30+', label: 'Achievements' },
              { icon: Sparkles, value: '3', label: 'Grades' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Public Badge Showcase */}
          <PublicBadgeShowcase />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10">
              <Trophy className="w-16 h-16 mx-auto mb-6 text-warning" />
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Learning Adventure?</h3>
              <p className="text-muted-foreground mb-8">Join your classmates at Alabang Elementary School and start learning today - it's always free!</p>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg px-10 py-6">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 EduQuest - Alabang Elementary School. Made with 💜 for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
