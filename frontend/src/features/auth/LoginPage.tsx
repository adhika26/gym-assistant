import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { useAuth } from './auth-context'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setSubmitting(true)

    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {})
        if (!error.errors) setMessage(error.message)
      } else {
        setMessage('Tidak dapat terhubung ke server.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">Masuk</h1>
          <p className="mt-1 text-sm text-slate-400">
            Lanjutkan perjalanan kebugaran Anda.
          </p>
        </div>

        {message && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{message}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Daftar
          </Link>
        </p>
      </form>
    </main>
  )
}