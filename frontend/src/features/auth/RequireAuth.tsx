import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from './auth-context'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-paper px-6 text-sm text-muted"
        aria-live="polite"
      >
        Memuat sesi...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
