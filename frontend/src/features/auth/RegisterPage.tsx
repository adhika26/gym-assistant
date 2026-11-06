import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { useAuth } from './auth-context'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
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
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
      })
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
          <h1 className="text-2xl font-semibold">Daftar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Buat akun untuk mulai mencatat progres.
          </p>
        </div>

        {message && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{message}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-slate-300">
            Nama
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          />
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name[0]}</p>
          )}
        </div>

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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password_confirmation" className="text-sm text-slate-300">
            Konfirmasi password
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
          />
          {errors.password_confirmation && (
            <p className="text-sm text-red-400">{errors.password_confirmation[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>

        <p className="text-center text-sm text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </main>
  )
}