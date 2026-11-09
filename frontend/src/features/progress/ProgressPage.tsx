import { useEffect, useState, type FormEvent } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ApiError } from '../../lib/api'
import {
  errorBanner,
  inputClass,
  labelClass,
  pageIntro,
  pageTitle,
  primaryButton,
  sectionLabel,
} from '../../lib/ui'
import { todayLocal } from '../../lib/date'
import { getProfile } from '../profile/api'
import type { Profile } from '../profile/types'
import { createMeasurement, deleteMeasurement, getMeasurements } from './api'
import type { BodyMeasurement } from './types'

function formatNumber(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString('id-ID')
}

export default function ProgressPage() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [measuredOn, setMeasuredOn] = useState(todayLocal)
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    Promise.all([getMeasurements(), getProfile()])
      .then(([measurementData, profileData]) => {
        if (cancelled) return
        setMeasurements(measurementData)
        setProfile(profileData)
      })
      .catch(() => {
        if (!cancelled) setError('Data progress gagal dimuat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function loadData() {
    const [measurementData, profileData] = await Promise.all([
      getMeasurements(),
      getProfile(),
    ])

    setMeasurements(measurementData)
    setProfile(profileData)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const weightValue = Number(weight)

    if (!Number.isFinite(weightValue) || weightValue < 20) {
      setFormError('Berat harus diisi dengan angka yang valid.')
      return
    }

    setSaving(true)

    try {
      await createMeasurement({
        measured_on: measuredOn,
        weight_kg: weightValue,
        body_fat_pct: bodyFat === '' ? null : Number(bodyFat),
        waist_cm: waist === '' ? null : Number(waist),
        notes: notes.trim() === '' ? null : notes.trim(),
      })

      await loadData()

      setWeight('')
      setBodyFat('')
      setWaist('')
      setNotes('')
      setMeasuredOn(todayLocal())
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.errors?.weight_kg?.[0] ?? err.message)
      } else {
        setFormError('Pengukuran gagal disimpan.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Hapus data pengukuran ini?')) return

    try {
      await deleteMeasurement(id)
      await loadData()
    } catch {
      setError('Pengukuran gagal dihapus.')
    }
  }

  const latest = measurements[0] ?? null
  const oldest = measurements[measurements.length - 1] ?? null
  const change = latest && oldest ? latest.weight_kg - oldest.weight_kg : 0

  const chartData = [...measurements].reverse().map((measurement) => ({
    label: measurement.measured_on.slice(5),
    weight: measurement.weight_kg,
  }))

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          Ukur, jangan menebak
        </p>
        <h1 className={`${pageTitle} mt-2`}>Progress</h1>
        <p className={pageIntro}>
          Berat dan lingkar tubuh dari waktu ke waktu. Satu angka tidak
          menentukan apa pun, arahnya yang penting.
        </p>
      </header>

      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-24 border-y border-line-soft bg-surface" />
          <div className="h-64 border border-line-soft bg-surface" />
          <p className="text-sm text-muted">Memuat progress...</p>
        </div>
      )}

      {error && (
        <p className={errorBanner} role="alert">
          {error}
        </p>
      )}

      {!loading && (
        <>
          <section className="grid grid-cols-1 gap-x-8 gap-y-5 border-y border-line-soft py-5 sm:grid-cols-3">
            <div>
              <p className={sectionLabel}>Berat terbaru</p>
              <p className="mt-1 font-mono text-2xl font-medium text-ink">
                {latest ? `${formatNumber(latest.weight_kg)} kg` : '-'}
              </p>
            </div>

            <div>
              <p className={sectionLabel}>Perubahan</p>
              <p className="mt-1 font-mono text-2xl font-medium text-ink">
                {change > 0 ? '+' : ''}
                {formatNumber(change)} kg
              </p>
              <p className="mt-1 text-[11px] text-muted">
                dari {measurements.length} pengukuran
              </p>
            </div>

            <div>
              <p className={sectionLabel}>Target berat</p>
              <p className="mt-1 font-mono text-2xl font-medium text-ink">
                {profile?.target_weight_kg
                  ? `${formatNumber(Number(profile.target_weight_kg))} kg`
                  : '-'}
              </p>
            </div>
          </section>

          <section aria-labelledby="grafik-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className={sectionLabel}>01 / Grafik</p>
                <h2
                  id="grafik-heading"
                  className="mt-1 font-display text-2xl font-semibold"
                >
                  Berat badan
                </h2>
              </div>
              <span className="text-xs text-muted">
                {chartData.length < 2
                  ? 'Butuh minimal dua pengukuran'
                  : `${chartData.length} titik`}
              </span>
            </div>

            {chartData.length < 2 ? (
              <p className="mt-4 border-y border-line-soft py-8 text-sm text-muted">
                Catat pengukuran kedua untuk melihat arah perubahan. Satu titik
                belum membentuk tren.
              </p>
            ) : (
              <div className="mt-4 h-72 w-full border-y border-line-soft py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d8d1c2" />
                    <XAxis
                      dataKey="label"
                      stroke="#6d675c"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="#6d675c"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#faf7ef',
                        border: '1px solid #8a8273',
                        borderRadius: 4,
                        color: '#191816',
                      }}
                      labelStyle={{ color: '#6d675c' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Berat (kg)"
                      stroke="#c8451b"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#f2eee4', stroke: '#c8451b' }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="grid gap-10 lg:grid-cols-2">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 border border-line-soft bg-surface p-4 sm:p-5"
            >
              <div>
                <p className={sectionLabel}>02 / Catat</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  Pengukuran baru
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="measured_on" className={labelClass}>
                    Tanggal
                  </label>
                  <input
                    id="measured_on"
                    type="date"
                    max={todayLocal()}
                    value={measuredOn}
                    onChange={(event) => setMeasuredOn(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="weight" className={labelClass}>
                    Berat (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min={20}
                    max={400}
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="body_fat" className={labelClass}>
                    Body fat (%)
                  </label>
                  <input
                    id="body_fat"
                    type="number"
                    min={1}
                    max={70}
                    step="0.1"
                    value={bodyFat}
                    onChange={(event) => setBodyFat(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="waist" className={labelClass}>
                    Pinggang (cm)
                  </label>
                  <input
                    id="waist"
                    type="number"
                    min={20}
                    max={250}
                    step="0.1"
                    value={waist}
                    onChange={(event) => setWaist(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className={labelClass}>
                  Catatan
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={`${inputClass} min-h-20 resize-y`}
                />
              </div>

              {formError && (
                <p className={errorBanner} role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`${primaryButton} w-full`}
              >
                {saving ? 'Menyimpan...' : 'Simpan pengukuran'}
              </button>
            </form>

            <section aria-labelledby="riwayat-heading">
              <p className={sectionLabel}>03 / Riwayat</p>
              <h2
                id="riwayat-heading"
                className="mt-1 font-display text-2xl font-semibold"
              >
                Semua pengukuran
              </h2>

              {measurements.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">
                  Belum ada pengukuran. Mulai dari berat hari ini, lalu ulangi
                  di waktu yang sama setiap minggu.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                  {measurements.map((measurement) => (
                    <li
                      key={measurement.id}
                      className="flex flex-wrap items-baseline justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-mono text-sm text-ink">
                          {measurement.measured_on}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-muted">
                          {formatNumber(measurement.weight_kg)} kg
                          {measurement.body_fat_pct !== null
                            ? ` | BF ${formatNumber(measurement.body_fat_pct)}%`
                            : ''}
                          {measurement.waist_cm !== null
                            ? ` | pinggang ${formatNumber(measurement.waist_cm)} cm`
                            : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDelete(measurement.id)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-xs text-muted transition-colors hover:text-danger"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
