import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AppShell from './components/layout/AppShell'
import ScrollToTop from './components/layout/ScrollToTop'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import RequireAuth from './features/auth/RequireAuth'
import OnboardingPage from './features/profile/OnboardingPage'
import DashboardPage from './pages/DashboardPage'

const NutritionPage = lazy(() => import('./features/nutrition/NutritionPage'))
const WorkoutPage = lazy(() => import('./features/workout/WorkoutPage'))
const ProgressPage = lazy(() => import('./features/progress/ProgressPage'))
const ChatPage = lazy(() => import('./features/chat/ChatPage'))

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-sm text-muted">
          Memuat...
        </div>
      }
    >
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/coach" element={<ChatPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
