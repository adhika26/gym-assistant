import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import { updateProfile } from './api'
import type { ActivityLevel, ExperienceLevel, Gender, Goal } from './types'

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500'
const labelClass = 'text-sm text-slate-300'

export default function OnboardingPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    gender: 'male' as Gender,
    birth_date: '',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate' as ActivityLevel,
    experience_level: 'beginner' as ExperienceLevel,
    goal: 'cut' as Goal,
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setSubmitting(true)

    try {
      await updateProfile({
        gender: form.gender,
        birth_date: form.birth_date,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        activity_level: form.activity_level,
        experience_level: form.experience_level,
        goal: form.goal,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <p className="text-sm text-slate-400">Langkah 1 dari 1</p>
          <h1 className="text-2xl font-semibold">Lengkapi profil Anda</h1>
          <p className="mt-1 text-sm text-slate-400">
            Data ini dipakai untuk menghitung kebutuhan kalori dan makro.
          </p>
        </header>

        {message && (
          <p className="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Data tubuh
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="gender" className={labelClass}>
                  Jenis kelamin
                </label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(event) => update('gender', event.target.value as Gender)}
                  className={inputClass}
                >
                  <option value="male">Pria</option>
                  <option value="female">Wanita</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-400">{errors.gender[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="birth_date" className={labelClass}>
                  Tanggal lahir
                </label>
                <input
                  id="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={(event) => update('birth_date', event.target.value)}
                  required
                  className={inputClass}
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-400">{errors.birth_date[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="height_cm" className={labelClass}>
                  Tinggi (cm)
                </label>
                <input
                  id="height_cm"
                  type="number"
                  min={100}
                  max={250}
                  value={form.height_cm}
                  onChange={(event) => update('height_cm', event.target.value)}
                  required
                  className={inputClass}
                />
                {errors.height_cm && (
                  <p className="text-sm text-red-400">{errors.height_cm[0]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="weight_kg" className={labelClass}>
                  Berat (kg)
                </label>
                <input
                  id="weight_kg"
                  type="number"
                  min={30}
                  max={300}
                  step="0.1"
                  value={form.weight_kg}
                  onChange={(event) => update('weight_kg', event.target.value)}
                  required
                  className={inputClass}
                />
                {errors.weight_kg && (
                  <p className="text-sm text-red-400">{errors.weight_kg[0]}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Aktivitas & pengalaman
            </h2>

            <div className="space-y-1">
              <label htmlFor="activity_level" className={labelClass}>
                Level aktivitas
              </label>
              <select
                id="activity_level"
                value={form.activity_level}
                onChange={(event) =>
                  update('activity_level', event.target.value as ActivityLevel)
                }
                className={inputClass}
              >
                <option value="sedentary">Jarang bergerak</option>
                <option value="light">Olahraga ringan 1–3x/minggu</option>
                <option value="moderate">Olahraga 3–5x/minggu</option>
                <option value="very_active">Olahraga 6–7x/minggu</option>
                <option value="extra_active">Pekerjaan fisik berat / atlet</option>
              </select>
              {errors.activity_level && (
                <p className="text-sm text-red-400">{errors.activity_level[0]}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="experience_level" className={labelClass}>
                Pengalaman latihan
              </label>
              <select
                id="experience_level"
                value={form.experience_level}
                onChange={(event) =>
                  update('experience_level', event.target.value as ExperienceLevel)
                }
                className={inputClass}
              >
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
              {errors.experience_level && (
                <p className="text-sm text-red-400">{errors.experience_level[0]}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Tujuan
            </h2>

            <div className="space-y-1">
              <label htmlFor="goal" className={labelClass}>
                Target utama
              </label>
              <select
                id="goal"
                value={form.goal}
                onChange={(event) => update('goal', event.target.value as Goal)}
                className={inputClass}
              >
                <option value="cut">Cut — turunkan berat badan</option>
                <option value="maintain">Maintain — jaga berat badan</option>
                <option value="bulk">Bulk — naikkan massa otot</option>
              </select>
              {errors.goal && (
                <p className="text-sm text-red-400">{errors.goal[0]}</p>
              )}
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Menghitung...' : 'Simpan & hitung target'}
          </button>
        </form>
      </div>
    </main>
  )
}