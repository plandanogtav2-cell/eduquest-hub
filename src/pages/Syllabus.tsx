import { motion } from 'framer-motion';
import { BookOpen, Calculator, FlaskConical, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const Syllabus = () => {
  const { profile } = useAuthStore();
  const [quizCounts, setQuizCounts] = useState<{[key: string]: number}>({});
  const [syllabusTopics, setSyllabusTopics] = useState<{[key: string]: string[]}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [profile?.grade]);

  const fetchQuizData = async () => {
    if (!profile?.grade) return;
    
    try {
      const subjects = ['math', 'science', 'logic'];
      const counts: {[key: string]: number} = {};
      const topics: {[key: string]: string[]} = {};
      
      for (const subject of subjects) {
        // Get quiz count
        const { count } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })
          .eq('subject', subject)
          .eq('grade', profile.grade);
        
        counts[subject] = count || 0;
        
        // Get unique topics from quiz titles
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('title')
          .eq('subject', subject)
          .eq('grade', profile.grade);
        
        if (quizzes) {
          const uniqueTopics = [...new Set(
            quizzes.map(quiz => {
              // Extract topic from title (remove difficulty level)
              return quiz.title.replace(/ - (Easy|Medium|Hard)$/, '');
            })
          )];
          topics[subject] = uniqueTopics;
        } else {
          topics[subject] = [];
        }
      }
      
      setQuizCounts(counts);
      setSyllabusTopics(topics);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syllabusData = {
    '4': {
      math: [
        'Addition and Subtraction (up to 4 digits)',
        'Multiplication Tables (1-12)',
        'Basic Division',
        'Fractions (halves, quarters)',
        'Time and Money',
        'Basic Geometry Shapes'
      ],
      science: [
        'Plant Life Cycles',
        'Animal Habitats',
        'Weather Patterns',
        'States of Matter',
        'Human Body Basics',
        'Simple Ecosystems'
      ],
      logic: [
        'Pattern Recognition',
        'Sequence Completion',
        'Basic Problem Solving',
        'Sorting and Classification',
        'Simple Puzzles',
        'Logical Reasoning'
      ]
    },
    '5': {
      math: [
        'Fractions and Decimals',
        'Percentages',
        'Area and Perimeter',
        'Data and Graphs',
        'Measurement Units',
        'Basic Algebra Concepts'
      ],
      science: [
        'Human Body Systems',
        'Weather and Climate',
        'Forces and Motion',
        'Earth and Space',
        'Properties of Materials',
        'Energy and Light'
      ],
      logic: [
        'Logical Sequences',
        'Cause and Effect',
        'Deductive Reasoning',
        'Word Problems',
        'Strategy Games',
        'Critical Analysis'
      ]
    },
    '6': {
      math: [
        'Algebra - Simple to Complex Equations',
        'Geometry - Shapes, Area, Perimeter, Volume',
        'Ratios and Proportions - Basic to Advanced'
      ],
      science: [
        'Ecosystems and Food Webs',
        'Simple Machines',
        'Chemical vs Physical Changes',
        'Solar System',
        'Electricity and Magnetism',
        'Environmental Science'
      ],
      logic: [
        'Critical Thinking',
        'Advanced Patterns',
        'Logic Puzzles',
        'Scientific Method',
        'Decision Making',
        'Abstract Reasoning'
      ]
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'math': return Calculator;
      case 'science': return FlaskConical;
      case 'logic': return Brain;
      default: return BookOpen;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return 'bg-primary/10 text-primary border-primary/20';
      case 'science': return 'bg-success/10 text-success border-success/20';
      case 'logic': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const currentGrade = profile?.grade || '4';
  const subjects = ['math', 'science', 'logic'];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Grade {currentGrade} Curriculum Overview</h2>
          <p className="text-muted-foreground">
            Here's what you'll learn this year across Math, Science, and Logic subjects.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {subjects.map((subject, index) => {
            const Icon = getSubjectIcon(subject);
            const topics = syllabusTopics[subject] || [];
            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSubjectColor(subject)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{subject}</h3>
                    <p className="text-muted-foreground">
                      {isLoading ? 'Loading...' : `${quizCounts[subject] || 0} quizzes available`} • {topics.length} topics covered
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.length > 0 ? topics.map((topic, topicIndex) => (
                    <motion.div
                      key={topicIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (topicIndex * 0.05) }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{topic}</span>
                    </motion.div>
                  )) : (
                    <div className="text-muted-foreground text-sm p-3">
                      {isLoading ? 'Loading topics...' : 'No quizzes available yet'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Ready to Start Learning?</h3>
          <p className="text-muted-foreground mb-4">
            Take quizzes to test your knowledge on these topics!
          </p>
          <Link to="/dashboard">
            <Button className="bg-gradient-to-r from-primary to-accent">
              Start Taking Quizzes
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Syllabus;