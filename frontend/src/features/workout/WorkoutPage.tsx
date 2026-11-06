import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../lib/api'
import { todayLocal } from '../../lib/date'
import {
  createWorkoutSession,
  deleteWorkoutSession,
  getWorkoutSession,
  getWorkoutSessions,
  searchExercises,
} from './api'
import type {
  Exercise,
  WorkoutSessionDetail,
  WorkoutSessionPayload,
  WorkoutSessionSummary,
} from './types'

type SetDraft = {
  key: string
  exerciseId: string
  weight: string
  reps: string
  rpe: string
  isWarmup: boolean
}

function emptySet(): SetDraft {
  return {
    key: crypto.randomUUID(),
    exerciseId: '',
    weight: '',
    reps: '',
    rpe: '',
    isWarmup: false,
  }
}

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sessions, setSessions] = useState<WorkoutSessionSummary[]>([])
  const [detail, setDetail] = useState<WorkoutSessionDetail | null>(null)

  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [performedOn, setPerformedOn] = useState(todayLocal)
  const [durationMin, setDurationMin] = useState('')
  const [perceivedExertion, setPerceivedExertion] = useState('')
  const [notes, setNotes] = useState('')
  const [draftSets, setDraftSets] = useState<SetDraft[]>([emptySet()])

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([searchExercises(''), getWorkoutSessions()])
      .then(([exerciseData, sessionData]) => {
        if (cancelled) return
        setExercises(exerciseData)
        setSessions(sessionData)
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat data latihan.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function refreshSessions() {
    setSessions(await getWorkoutSessions())
  }

  function updateSet(key: string, patch: Partial<SetDraft>) {
    setDraftSets((current) =>
      current.map((set) => (set.key === key ? { ...set, ...patch } : set)),
    )
  }

  function addSet() {
    setDraftSets((current) => [...current, emptySet()])
  }

  function removeSet(key: string) {
    setDraftSets((current) => current.filter((set) => set.key !== key))
  }

  function resetForm() {
    setName('')
    setPerformedOn(todayLocal())
    setDurationMin('')
    setPerceivedExertion('')
    setNotes('')
    setDraftSets([emptySet()])
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (name.trim() === '') {
      setFormError('Nama sesi wajib diisi.')
      return
    }

    if (draftSets.length === 0) {
      setFormError('Minimal satu set.')
      return
    }

    const invalidSet = draftSets.some(
      (set) => set.exerciseId === '' || Number(set.reps) < 1,
    )

    if (invalidSet) {
      setFormError('Setiap set harus punya exercise dan reps minimal 1.')
      return
    }

    const payload: WorkoutSessionPayload = {
      performed_on: performedOn,
      name: name.trim(),
      duration_min: durationMin === '' ? null : Number(durationMin),
      perceived_exertion:
        perceivedExertion === '' ? null : Number(perceivedExertion),
      notes: notes.trim() === '' ? null : notes.trim(),
      sets: draftSets.map((set) => ({
        exercise_id: Number(set.exerciseId),
        weight_kg: set.weight === '' ? null : Number(set.weight),
        reps: Number(set.reps),
        rpe: set.rpe === '' ? null : Number(set.rpe),
        is_warmup: set.isWarmup,
      })),
    }

    setSaving(true)

    try {
      await createWorkoutSession(payload)
      await refreshSessions()
      resetForm()
      setDetail(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
      } else {
        setFormError('Gagal menyimpan sesi latihan.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleViewSession(id: number) {
    setDetailLoading(true)
    setError(null)

    try {
      setDetail(await getWorkoutSession(id))
    } catch {
      setError('Gagal memuat detail sesi.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleDeleteSession(id: number) {
    if (!window.confirm('Hapus sesi latihan ini?')) return

    setError(null)

    try {
      await deleteWorkoutSession(id)
      if (detail?.id === id) setDetail(null)
      await refreshSessions()
    } catch {
      setError('Gagal menghapus sesi.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Latihan</h1>
            <p className="text-sm text-slate-400">
              Catat sesi, set, reps, dan beban.
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

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <h2 className="font-medium">Sesi baru</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs text-slate-400">
                  Nama sesi
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Push Day"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="performed_on" className="text-xs text-slate-400">
                  Tanggal
                </label>
                <input
                  id="performed_on"
                  type="date"
                  value={performedOn}
                  onChange={(event) => setPerformedOn(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="duration" className="text-xs text-slate-400">
                  Durasi (menit)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={600}
                  value={durationMin}
                  onChange={(event) => setDurationMin(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="rpe" className="text-xs text-slate-400">
                  RPE sesi (1-10)
                </label>
                <input
                  id="rpe"
                  type="number"
                  min={1}
                  max={10}
                  step="0.5"
                  value={perceivedExertion}
                  onChange={(event) => setPerceivedExertion(event.target.value)}
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
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-slate-300">Set</h3>
                <button
                  type="button"
                  onClick={addSet}
                  className="text-sm text-emerald-400 hover:underline"
                >
                  + Tambah set
                </button>
              </div>

              {draftSets.map((set, index) => (
                <div
                  key={set.key}
                  className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Set {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSet(set.key)}
                      disabled={draftSets.length === 1}
                      className="text-xs text-slate-500 hover:text-red-400 disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>

                  <select
                    value={set.exerciseId}
                    onChange={(event) =>
                      updateSet(set.key, { exerciseId: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih exercise</option>
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.primary_muscle})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step="0.5"
                      value={set.weight}
                      onChange={(event) =>
                        updateSet(set.key, { weight: event.target.value })
                      }
                      placeholder="Berat (kg)"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(set.key, { reps: event.target.value })
                      }
                      placeholder="Reps"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step="0.5"
                      value={set.rpe}
                      onChange={(event) =>
                        updateSet(set.key, { rpe: event.target.value })
                      }
                      placeholder="RPE"
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={set.isWarmup}
                      onChange={(event) =>
                        updateSet(set.key, { isWarmup: event.target.checked })
                      }
                    />
                    Warm-up
                  </label>
                </div>
              ))}
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
              {saving ? 'Menyimpan...' : 'Simpan sesi'}
            </button>
          </form>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="font-medium">Riwayat</h2>

              {sessions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Belum ada sesi.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-800">
                  {sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-sm text-slate-100">{session.name}</p>
                        <p className="text-xs text-slate-500">
                          {session.performed_on} | {session.sets_count} set
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleViewSession(session.id)}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteSession(session.id)}
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {detailLoading && (
              <p className="text-sm text-slate-400">Memuat detail...</p>
            )}

            {detail && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-medium">{detail.name}</h2>
                  <span className="text-xs text-slate-500">
                    {detail.performed_on}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {detail.sets.map((set) => (
                    <li
                      key={set.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="text-slate-100">{set.exercise_name}</p>
                        <p className="text-xs text-slate-500">
                          Set {set.set_number}
                          {set.is_warmup ? ' (warm-up)' : ''}
                        </p>
                      </div>
                      <span className="text-slate-300">
                        {set.weight_kg ?? 0} kg x {set.reps}
                        {set.rpe !== null ? ` @ RPE ${set.rpe}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
