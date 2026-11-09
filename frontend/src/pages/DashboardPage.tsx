import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/auth-context'
import { getDailyLog } from '../features/nutrition/api'
import type { DailyLog, MealType } from '../features/nutrition/types'
import { getProfile } from '../features/profile/api'
import type { Profile } from '../features/profile/types'
import { todayLocal } from '../lib/date'
import {
  errorBanner,
  pageIntro,
  pageTitle,
  primaryButton,
  secondaryButton,
  sectionLabel,
} from '../lib/ui'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Sarapan',
  lunch: 'Makan siang',
  dinner: 'Makan malam',
  snack: 'Camilan',
}

const GOAL_LABELS: Record<string, string> = {
  cut: 'Cut',
  maintain: 'Maintain',
  bulk: 'Bulk',
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Jarang bergerak',
  light: 'Ringan',
  moderate: 'Sedang',
  very_active: 'Sangat aktif',
  extra_active: 'Atlet / fisik berat',
}

function percent(consumed: number, target: number | null): number {
  if (!target || target <= 0) return 0

  return Math.min(100, Math.round((consumed / target) * 100))
}

function formatCalories(value: number): string {
  return Math.round(value).toLocaleString('id-ID')
}

function formatMacro(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString('id-ID')
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getProfile(), getDailyLog(todayLocal())])
      .then(([profileData, logData]) => {
        if (cancelled) return

        if (!profileData) {
          navigate('/onboarding', { replace: true })
          return
        }

        setProfile(profileData)
        setLog(logData)
      })
      .catch(() => {
        if (!cancelled) setError('Data hari ini gagal dimuat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  const firstName = user?.name.split(' ')[0] ?? 'kamu'
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  const consumedCalories = log?.totals.calories ?? 0
  const targetCalories = profile?.calorie_target ?? 0
  const remainingCalories = targetCalories - consumedCalories
  const isOverTarget = remainingCalories < 0

  const macros =
    profile && log
      ? [
          {
            label: 'Protein',
            consumed: log.totals.protein_g,
            target: profile.protein_g,
            bar: 'bg-accent',
          },
          {
            label: 'Karbo',
            consumed: log.totals.carbs_g,
            target: profile.carbs_g,
            bar: 'bg-green',
          },
          {
            label: 'Lemak',
            consumed: log.totals.fat_g,
            target: profile.fat_g,
            bar: 'bg-ink',
          },
        ]
      : []

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            {todayLabel}
          </p>
          <h1 className={`${pageTitle} mt-2`}>Hari ini</h1>
          <p className={pageIntro}>
            Halo, {firstName}. Ini angka yang perlu kamu lihat sebelum mencatat.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/nutrition" className={primaryButton}>
            Catat makan
          </Link>
          <Link to="/workout" className={secondaryButton}>
            Mulai sesi
          </Link>
        </div>
      </header>

      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-36 bg-surface" />
          <div className="h-24 bg-surface" />
          <p className="text-sm text-muted">Memuat ringkasan hari ini...</p>
        </div>
      )}

      {error && (
        <div className={errorBanner}>
          {error}{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-medium underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {profile && log && (
        <>
          <section
            aria-labelledby="kalori-heading"
            className="grid gap-10 border-t border-line-soft pt-8 lg:grid-cols-[1.1fr_1fr]"
          >
            <div>
              <p id="kalori-heading" className={sectionLabel}>
                Sisa kalori
              </p>
              <p
                className={`mt-3 font-mono text-[clamp(3.5rem,8vw,6rem)] font-medium leading-none tracking-[-0.05em] ${
                  isOverTarget ? 'text-danger' : 'text-ink'
                }`}
              >
                {formatCalories(Math.abs(remainingCalories))}
              </p>
              <p className="mt-2 font-mono text-sm text-muted">
                kkal {isOverTarget ? 'melebihi target' : 'tersisa'}
              </p>

              <div
                className="mt-6 h-1 w-full bg-line-soft"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent(consumedCalories, targetCalories)}
                aria-label="Kalori hari ini terhadap target"
              >
                <div
                  className={`h-full ${isOverTarget ? 'bg-danger' : 'bg-accent'}`}
                  style={{
                    width: `${percent(consumedCalories, targetCalories)}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between gap-4 font-mono text-[11px] text-muted">
                <span>{formatCalories(consumedCalories)} kkal tercatat</span>
                <span>target {formatCalories(targetCalories)} kkal</span>
              </div>
            </div>

            <div className="space-y-5 lg:pt-1">
              {macros.map((macro) => (
                <div key={macro.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-ink">{macro.label}</span>
                    <span className="font-mono text-xs text-muted">
                      {formatMacro(macro.consumed)} /{' '}
                      {formatMacro(macro.target ?? 0)} g
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1 w-full bg-line-soft"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent(macro.consumed, macro.target)}
                    aria-label={`${macro.label} hari ini terhadap target`}
                  >
                    <div
                      className={`h-full ${macro.bar}`}
                      style={{
                        width: `${percent(macro.consumed, macro.target)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <p className="pt-2 font-mono text-[11px] text-muted">
                BMR {formatCalories(profile.bmr ?? 0)} kkal / TDEE{' '}
                {formatCalories(profile.tdee ?? 0)} kkal
              </p>
            </div>
          </section>

          <section aria-labelledby="catatan-heading">
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line-soft pt-8">
              <div>
                <p className={sectionLabel}>01 / Catatan</p>
                <h2
                  id="catatan-heading"
                  className="mt-1 font-display text-2xl font-semibold"
                >
                  Makan hari ini
                </h2>
              </div>
              <Link
                to="/nutrition"
                className="inline-flex min-h-11 items-center text-sm font-medium text-accent-strong hover:underline"
              >
                Buka nutrisi
              </Link>
            </div>

            <div className="mt-5 divide-y divide-line-soft border-y border-line-soft">
              {MEALS.map((meal, index) => {
                const entries = log.entries.filter(
                  (entry) => entry.meal_type === meal,
                )
                const total = entries.reduce(
                  (sum, entry) => sum + entry.calories,
                  0,
                )

                return (
                  <Link
                    key={meal}
                    to="/nutrition"
                    className="flex flex-wrap items-baseline justify-between gap-3 py-4 transition-colors hover:bg-surface"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="w-6 font-mono text-[11px] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-ink">{MEAL_LABELS[meal]}</span>
                      <span className="text-xs text-muted">
                        {entries.length === 0
                          ? 'belum dicatat'
                          : `${entries.length} item`}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-ink">
                      {formatCalories(total)} kkal
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className={sectionLabel}>02 / Profil</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                Target yang sedang kamu jalankan
              </h2>

              <dl className="mt-5 divide-y divide-line-soft border-y border-line-soft text-sm">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Tujuan</dt>
                  <dd>{GOAL_LABELS[profile.goal] ?? profile.goal}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Berat sekarang</dt>
                  <dd className="font-mono">
                    {Number(profile.weight_kg).toFixed(1)} kg
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Target berat</dt>
                  <dd className="font-mono">
                    {profile.target_weight_kg
                      ? `${Number(profile.target_weight_kg).toFixed(1)} kg`
                      : 'Belum diisi'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Aktivitas</dt>
                  <dd>
                    {ACTIVITY_LABELS[profile.activity_level] ??
                      profile.activity_level}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">Target air</dt>
                  <dd className="font-mono">
                    {formatCalories(profile.water_ml ?? 0)} ml
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-line-soft pt-8 lg:border-t-0 lg:pt-0">
              <p className={sectionLabel}>03 / Coach</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                Butuh angka berikutnya?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                Tanya coach soal sisa kalori, menu, atau sesi berikutnya.
                Jawabannya memakai data profil dan catatan hari ini.
              </p>
              <Link to="/coach" className={`${secondaryButton} mt-5`}>
                Buka coach
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
