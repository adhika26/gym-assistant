import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { errorBanner, inputClass, labelClass, primaryButton } from '../../lib/ui'
import AuthLayout from './AuthLayout'
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
        setMessage('Server tidak bisa dihubungi. Coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      kicker="Masuk ke akun"
      title="Lanjutkan catatanmu"
      intro="Masuk untuk melihat sisa kalori, sesi terakhir, dan progres yang sudah kamu catat."
      footer={
        <>
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="inline-flex min-h-11 items-center font-medium text-accent-strong underline underline-offset-4"
          >
            Buat akun
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <p className={errorBanner} role="alert" aria-live="polite">
            {message}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className={inputClass}
          />
          {errors.email?.[0] && (
            <p className="text-xs text-danger">{errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className={inputClass}
          />
          {errors.password?.[0] && (
            <p className="text-xs text-danger">{errors.password[0]}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
          {submitting ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </AuthLayout>
  )
}
