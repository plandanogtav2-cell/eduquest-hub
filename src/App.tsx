import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Syllabus from "./pages/Syllabus";
import Settings from "./pages/Settings";
import TermsAndConditions from "./pages/TermsAndConditions";
import ProgressTracker from "./pages/ProgressTracker";
import Achievements from "./pages/Achievements";
import AvatarSelection from "./pages/AvatarSelection";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import TeacherDashboard from "./pages/TeacherDashboard";
import ManageQuizzes from "./pages/ManageQuizzes";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import Analytics from "./pages/Analytics";
import Announcements from "./pages/Announcements";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import StudentReport from "./pages/StudentReport";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz/:quizId" element={<Quiz />} />
      <Route path="/syllabus" element={<Syllabus />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/progress" element={<ProgressTracker />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/avatar" element={<AvatarSelection />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<PublicProfile />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/quizzes" element={<ManageQuizzes />} />
      <Route path="/teacher/quiz/new" element={<CreateQuiz />} />
      <Route path="/teacher/quiz/:quizId/edit" element={<EditQuiz />} />
      <Route path="/teacher/analytics" element={<Analytics />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/teacher/announcements" element={<AdminAnnouncements />} />
      <Route path="/teacher/student/:userId" element={<StudentReport />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
