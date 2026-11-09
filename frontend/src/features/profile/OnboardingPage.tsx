import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../lib/api'
import {
  errorBanner,
  inputClass,
  labelClass,
  primaryButton,
  sectionLabel,
} from '../../lib/ui'
import { updateProfile } from './api'
import type { ActivityLevel, ExperienceLevel, Gender, Goal } from './types'

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
        setMessage('Server tidak bisa dihubungi. Coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen max-w-5xl lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="hidden flex-col justify-between border-r border-line-soft p-10 lg:flex">
          <div>
            <p className="font-display text-3xl font-semibold tracking-[-0.02em]">
              ANGKAT
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Onboarding
            </p>
          </div>

          <div>
            <p className="font-display text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.02em]">
              Tiga bagian. Setelah itu targetmu dihitung.
            </p>
            <ol className="mt-8 space-y-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              <li>01 Data tubuh</li>
              <li>02 Aktivitas</li>
              <li>03 Tujuan</li>
            </ol>
          </div>

          <p className="text-xs leading-5 text-muted">
            Angka ini bukan patokan final. Berat dan target bisa diubah kapan
            saja saat latihan berjalan.
          </p>
        </aside>

        <section className="px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-xl">
            <p className="font-display text-2xl font-semibold tracking-[-0.02em] lg:hidden">
              ANGKAT
            </p>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.08em] text-muted lg:mt-0">
              Langkah 1 dari 1
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.01em] sm:text-4xl">
              Lengkapi profil
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Data ini dipakai untuk menghitung BMR, TDEE, dan target makro.
              Kamu bisa mengubahnya lagi nanti.
            </p>

            {message && (
              <p className={`${errorBanner} mt-6`} role="alert" aria-live="polite">
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <fieldset className="space-y-4 border-t border-line-soft pt-6">
                <legend className={sectionLabel}>01 / Data tubuh</legend>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="gender" className={labelClass}>
                      Jenis kelamin
                    </label>
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={(event) =>
                        update('gender', event.target.value as Gender)
                      }
                      className={inputClass}
                    >
                      <option value="male">Pria</option>
                      <option value="female">Wanita</option>
                    </select>
                    {errors.gender?.[0] && (
                      <p className="text-xs text-danger">{errors.gender[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="birth_date" className={labelClass}>
                      Tanggal lahir
                    </label>
                    <input
                      id="birth_date"
                      type="date"
                      value={form.birth_date}
                      onChange={(event) =>
                        update('birth_date', event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                    {errors.birth_date?.[0] && (
                      <p className="text-xs text-danger">
                        {errors.birth_date[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="height_cm" className={labelClass}>
                      Tinggi (cm)
                    </label>
                    <input
                      id="height_cm"
                      type="number"
                      min={100}
                      max={250}
                      value={form.height_cm}
                      onChange={(event) =>
                        update('height_cm', event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                    {errors.height_cm?.[0] && (
                      <p className="text-xs text-danger">
                        {errors.height_cm[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
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
                      onChange={(event) =>
                        update('weight_kg', event.target.value)
                      }
                      required
                      className={inputClass}
                    />
                    {errors.weight_kg?.[0] && (
                      <p className="text-xs text-danger">
                        {errors.weight_kg[0]}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-line-soft pt-6">
                <legend className={sectionLabel}>02 / Aktivitas</legend>

                <div className="space-y-2">
                  <label htmlFor="activity_level" className={labelClass}>
                    Level aktivitas
                  </label>
                  <select
                    id="activity_level"
                    value={form.activity_level}
                    onChange={(event) =>
                      update(
                        'activity_level',
                        event.target.value as ActivityLevel,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="sedentary">Jarang bergerak</option>
                    <option value="light">Olahraga ringan 1-3x per minggu</option>
                    <option value="moderate">Olahraga 3-5x per minggu</option>
                    <option value="very_active">Olahraga 6-7x per minggu</option>
                    <option value="extra_active">
                      Pekerjaan fisik berat atau atlet
                    </option>
                  </select>
                  {errors.activity_level?.[0] && (
                    <p className="text-xs text-danger">
                      {errors.activity_level[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="experience_level" className={labelClass}>
                    Pengalaman latihan
                  </label>
                  <select
                    id="experience_level"
                    value={form.experience_level}
                    onChange={(event) =>
                      update(
                        'experience_level',
                        event.target.value as ExperienceLevel,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Lanjutan</option>
                  </select>
                  {errors.experience_level?.[0] && (
                    <p className="text-xs text-danger">
                      {errors.experience_level[0]}
                    </p>
                  )}
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-line-soft pt-6">
                <legend className={sectionLabel}>03 / Tujuan</legend>

                <div className="space-y-2">
                  <label htmlFor="goal" className={labelClass}>
                    Target utama
                  </label>
                  <select
                    id="goal"
                    value={form.goal}
                    onChange={(event) =>
                      update('goal', event.target.value as Goal)
                    }
                    className={inputClass}
                  >
                    <option value="cut">Cut: turunkan berat badan</option>
                    <option value="maintain">Maintain: jaga berat badan</option>
                    <option value="bulk">Bulk: naikkan massa otot</option>
                  </select>
                  {errors.goal?.[0] && (
                    <p className="text-xs text-danger">{errors.goal[0]}</p>
                  )}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submitting}
                className={`${primaryButton} w-full`}
              >
                {submitting ? 'Menghitung...' : 'Simpan dan hitung target'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
