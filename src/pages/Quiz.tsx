import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle, Trophy, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuizStore } from '@/stores/quizStore';
import { useAuthStore } from '@/stores/authStore';
import useSoundEffects from '@/hooks/useSoundEffects';

const Quiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user, initialize } = useAuthStore();
  const {
    currentQuiz, currentQuestions, currentQuestionIndex, selectedAnswer, answers,
    fetchQuiz, startQuiz, submitAnswer, nextQuestion, previousQuestion, completeQuiz, resetQuiz, isLoading
  } = useQuizStore();
  const { playSound } = useSoundEffects();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (quizId) {
      fetchQuiz(quizId);
    }
    return () => resetQuiz();
  }, [quizId, user, navigate, fetchQuiz, resetQuiz]);

  const handleStartQuiz = useCallback(async () => {
    if (!currentQuiz || !user) return;
    playSound('start');
    const id = await startQuiz(currentQuiz.id, user.id);
    if (id) {
      setAttemptId(id);
      setTimeLeft(currentQuiz.time_limit_minutes * 60);
      setStartTime(Date.now());
    }
  }, [currentQuiz, user, startQuiz, playSound]);

  useEffect(() => {
    if (!attemptId || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [attemptId]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    playSound('click');
    submitAnswer(questionId, answerIndex);
    
    // Show feedback for correct/incorrect answer
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    setShowAnswerFeedback(true);
    setTimeout(() => {
      playSound(isCorrect ? 'correct' : 'incorrect');
    }, 100);
    
    // Hide feedback after 1.5 seconds
    setTimeout(() => {
      setShowAnswerFeedback(false);
    }, 1500);
  };

  const handleComplete = async () => {
    if (!attemptId) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const result = await completeQuiz(attemptId, timeTaken);
    if (result) {
      setResults({ score: result.score, correct: result.correct_answers, total: result.total_questions });
      setShowResults(true);
      playSound('complete');
    }
  };

  const handleNextQuestion = () => {
    playSound('click');
    nextQuestion();
    setShowAnswerFeedback(false);
  };

  const handlePreviousQuestion = () => {
    playSound('click');
    previousQuestion();
    setShowAnswerFeedback(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !currentQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Pre-quiz screen
  if (!attemptId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{currentQuiz.title}</h1>
          <p className="text-muted-foreground mb-6">{currentQuiz.description}</p>
          <div className="flex items-center justify-center gap-6 mb-8 text-sm">
            <div><Clock className="w-5 h-5 mx-auto mb-1 text-primary" />{currentQuiz.time_limit_minutes} min</div>
            <div><CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />{currentQuestions.length} questions</div>
          </div>
          <Button onClick={handleStartQuiz} className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6">Start Quiz</Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full mt-3">Back to Dashboard</Button>
        </motion.div>
      </div>
    );
  }

  // Results screen
  if (showResults && results) {
    const percentage = Math.round((results.correct / results.total) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 70 ? 'bg-success/20' : 'bg-warning/20'}`}>
            {percentage >= 70 ? <Trophy className="w-12 h-12 text-success" /> : <CheckCircle className="w-12 h-12 text-warning" />}
          </div>
          <h1 className="text-3xl font-bold mb-2">{percentage >= 70 ? 'Great Job!' : 'Good Effort!'}</h1>
          <p className="text-muted-foreground mb-6">You scored {results.score} points!</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted rounded-xl p-4"><p className="text-2xl font-bold text-success">{results.correct}</p><p className="text-sm text-muted-foreground">Correct</p></div>
            <div className="bg-muted rounded-xl p-4"><p className="text-2xl font-bold text-destructive">{results.total - results.correct}</p><p className="text-sm text-muted-foreground">Wrong</p></div>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="w-full bg-gradient-to-r from-primary to-accent"><Home className="w-4 h-4 mr-2" />Back to Dashboard</Button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.correct_answer;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm"><span className="font-medium">Q{currentQuestionIndex + 1}</span><span className="text-muted-foreground">of {currentQuestions.length}</span></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <Clock className="w-4 h-4" /><span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <Progress value={progress} className="mb-8 h-2" />

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold mb-8">{currentQuestion.question_text}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correct_answer;
                const showFeedback = showAnswerFeedback && isAnswered;
                
                return (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(currentQuestion.id, index)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 relative ${
                      isSelected && showFeedback
                        ? isCorrect
                          ? 'border-success bg-success/10 text-success'
                          : 'border-destructive bg-destructive/10 text-destructive'
                        : isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : showFeedback && isCorrectAnswer
                        ? 'border-success bg-success/10 text-success'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {showFeedback && isSelected && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-success" />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                    )}
                    {showFeedback && !isSelected && isCorrectAnswer && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />Previous
          </Button>
          {currentQuestionIndex === currentQuestions.length - 1 ? (
            <Button onClick={handleComplete} disabled={Object.keys(answers).length !== currentQuestions.length} className="bg-gradient-to-r from-primary to-accent">
              <CheckCircle className="w-4 h-4 mr-2" />Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
              Next<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
