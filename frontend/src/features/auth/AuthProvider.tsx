import { useEffect, useState, type ReactNode } from 'react'
import { apiFetch, clearToken, getToken, setToken } from '../../lib/api'
import { AuthContext } from './auth-context'
import type { AuthResponse, RegisterPayload, User } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }

      try {
        const data = await apiFetch<{ user: User }>('/auth/me')
        setUser(data.user)
      } catch {
        clearToken()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function login(email: string, password: string) {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    setToken(data.token)
    setUser(data.user)
  }

  async function register(payload: RegisterPayload) {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })

    setToken(data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      clearToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}