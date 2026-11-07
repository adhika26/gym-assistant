import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
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
import { todayLocal } from '../../lib/date'
import { getProfile } from '../profile/api'
import type { Profile } from '../profile/types'
import { createMeasurement, deleteMeasurement, getMeasurements } from './api'
import type { BodyMeasurement } from './types'

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
        if (!cancelled) setError('Gagal memuat data progress.')
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
        setFormError('Gagal menyimpan pengukuran.')
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
      setError('Gagal menghapus pengukuran.')
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
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Progress</h1>
            <p className="text-sm text-slate-400">
              Pantau berat badan dan ukuran tubuh.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
          >
            Dashboard
          </Link>
        </header>

        {loading && <p className="text-slate-400">Memuat data...</p>}

        {error && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{error}</p>
        )}

        {!loading && (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Berat terbaru
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-400">
                  {latest ? `${latest.weight_kg} kg` : '-'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Perubahan
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold ${
                    change === 0
                      ? 'text-slate-300'
                      : change < 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)} kg
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Target berat
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-200">
                  {profile?.target_weight_kg
                    ? `${Number(profile.target_weight_kg).toFixed(1)} kg`
                    : '-'}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="font-medium">Grafik berat badan</h2>

              {chartData.length < 2 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Tambahkan minimal dua pengukuran untuk melihat tren.
                </p>
              ) : (
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                      <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        name="Berat (kg)"
                        stroke="#34d399"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <form
                onSubmit={handleSubmit}
                className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <h2 className="font-medium">Catat pengukuran</h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="measured_on" className="text-xs text-slate-400">
                      Tanggal
                    </label>
                    <input
                      id="measured_on"
                      type="date"
                      value={measuredOn}
                      onChange={(event) => setMeasuredOn(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="weight" className="text-xs text-slate-400">
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
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="body_fat" className="text-xs text-slate-400">
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
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="waist" className="text-xs text-slate-400">
                      Lingkar pinggang (cm)
                    </label>
                    <input
                      id="waist"
                      type="number"
                      min={20}
                      max={250}
                      step="0.1"
                      value={waist}
                      onChange={(event) => setWaist(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="notes" className="text-xs text-slate-400">
                    Catatan
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                {formError && (
                  <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan pengukuran'}
                </button>
              </form>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="font-medium">Riwayat</h2>

                {measurements.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Belum ada pengukuran.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-800">
                    {measurements.map((measurement) => (
                      <li
                        key={measurement.id}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div>
                          <p className="text-sm text-slate-100">
                            {measurement.measured_on}
                          </p>
                          <p className="text-xs text-slate-500">
                            {measurement.weight_kg} kg
                            {measurement.body_fat_pct !== null
                              ? ` | BF ${measurement.body_fat_pct}%`
                              : ''}
                            {measurement.waist_cm !== null
                              ? ` | Pinggang ${measurement.waist_cm} cm`
                              : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDelete(measurement.id)}
                          className="text-xs text-slate-500 hover:text-red-400"
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
    </main>
  )
}