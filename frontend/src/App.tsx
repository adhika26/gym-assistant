import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import RequireAuth from "./features/auth/RequireAuth";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./features/profile/OnboardingPage";

const NutritionPage = lazy(
  () => import("./features/nutrition/NutritionPage"),
);
const WorkoutPage = lazy(() => import("./features/workout/WorkoutPage"));
const ProgressPage = lazy(() => import("./features/progress/ProgressPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Memuat...
        </div>
      }
    >
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

        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/nutrition"
          element={
            <RequireAuth>
              <NutritionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workout"
          element={
            <RequireAuth>
              <WorkoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireAuth>
              <ProgressPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}