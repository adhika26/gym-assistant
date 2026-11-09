import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { errorBanner, inputClass, labelClass, primaryButton } from '../../lib/ui'
import AuthLayout from './AuthLayout'
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
        setMessage('Server tidak bisa dihubungi. Coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      kicker="Buat akun"
      title="Mulai dari angka awal"
      intro="Isi data dasar, lalu onboarding akan menghitung target kalori dan makro yang masuk akal untuk tujuanmu."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center font-medium text-accent-strong underline underline-offset-4"
          >
            Masuk
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
          <label htmlFor="name" className={labelClass}>
            Nama
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className={inputClass}
          />
          {errors.name?.[0] && (
            <p className="text-xs text-danger">{errors.name[0]}</p>
          )}
        </div>

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
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
          {errors.password?.[0] && (
            <p className="text-xs text-danger">{errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password_confirmation" className={labelClass}>
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
            className={inputClass}
          />
          {errors.password_confirmation?.[0] && (
            <p className="text-xs text-danger">
              {errors.password_confirmation[0]}
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
          {submitting ? 'Menyiapkan...' : 'Buat akun'}
        </button>
      </form>
    </AuthLayout>
  )
}
