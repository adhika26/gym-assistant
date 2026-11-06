import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import RequireAuth from './features/auth/RequireAuth'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './features/profile/OnboardingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route
  path="/onboarding"
  element={
    <RequireAuth>
      <OnboardingPage />
    </RequireAuth>
  }
/>
    </Routes>
  )
}