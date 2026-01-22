# EduQuest Hub - Alabang Elementary School

An interactive educational platform designed for Grades 4-6 students to learn Math, Science, and Logic through engaging quizzes and achievements.

## Features

- **Three Subject Areas**: Math, Science, and Logic
- **Grade-Specific Content**: Tailored for Grades 4, 5, and 6
- **Interactive Quizzes**: Engaging quiz system with progress tracking
- **Achievement System**: Students earn rewards for completing challenges
- **User Authentication**: Secure login/signup system
- **Modern UI**: Built with React and Tailwind CSS

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Animations**: Framer Motion

## How to Run the Project

### Prerequisites
- Node.js (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun

### Steps

1. **Navigate to project directory:**
   ```cmd
   cd eduquest-hub-main
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

4. **Start development server:**
   ```cmd
   npm run dev
   ```

5. **Open in browser:**
   - Visit `http://localhost:5173`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `src/pages/` - Main application pages
- `src/components/ui/` - Reusable UI components
- `src/stores/` - State management
- `src/integrations/supabase/` - Database integration
- `supabase/` - Database migrations and configuration

## Database Setup

1. Create a Supabase project
2. Run the SQL migration in `supabase/migrations/`
3. Configure authentication settings
4. Update environment variables

---

© 2026 Alabang Elementary School. Educational platform for students.