# EduQuest Hub - Logic Brain Training

A brain training platform designed for students to develop logical thinking through engaging puzzle games.

## Games

- **Pattern Recognition**: Complete visual patterns with shapes, colors, and symbols
- **Sequencing**: Arrange items in correct logical order
- **Deductive Reasoning**: Identify and apply simple rules using clues

## Features

- **Progressive Difficulty**: Games adapt to player skill level
- **Achievement System**: Unlock rewards for completing challenges
- **Progress Tracking**: Monitor improvement over time
- **Modern UI**: Engaging game-like interface

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

- `src/pages/` - Game pages and main application
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

© 2026 EduQuest Hub. Brain training platform for logical thinking development.