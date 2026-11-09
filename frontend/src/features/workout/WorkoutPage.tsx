import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../../lib/api'
import {
  dangerButton,
  errorBanner,
  ghostButton,
  inputClass,
  labelClass,
  pageIntro,
  pageTitle,
  primaryButton,
  sectionLabel,
} from '../../lib/ui'
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

function formatNumber(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString('id-ID')
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
        if (!cancelled) setError('Data latihan gagal dimuat.')
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
      setFormError('Setiap set butuh latihan dan reps minimal 1.')
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
        setFormError('Sesi gagal disimpan.')
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
      setError('Detail sesi gagal dimuat.')
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
      setError('Sesi gagal dihapus.')
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          Catatan latihan
        </p>
        <h1 className={`${pageTitle} mt-2`}>Latihan</h1>
        <p className={pageIntro}>
          Catat sesi, set, reps, dan beban. Angka yang sama akan jadi
          pembanding minggu depan.
        </p>
      </header>

      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-48 border border-line-soft bg-surface" />
          <p className="text-sm text-muted">Memuat data latihan...</p>
        </div>
      )}

      {error && (
        <p className={errorBanner} role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-line-soft bg-surface p-4 sm:p-5"
        >
          <div>
            <p className={sectionLabel}>01 / Sesi baru</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              Mulai dari satu set
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className={labelClass}>
                Nama sesi
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Push day"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="performed_on" className={labelClass}>
                Tanggal
              </label>
              <input
                id="performed_on"
                type="date"
                value={performedOn}
                onChange={(event) => setPerformedOn(event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className={labelClass}>
                Durasi (menit)
              </label>
              <input
                id="duration"
                type="number"
                min={1}
                max={600}
                value={durationMin}
                onChange={(event) => setDurationMin(event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rpe" className={labelClass}>
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
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className={`${inputClass} min-h-20 resize-y`}
            />
          </div>

          <div className="space-y-4 border-t border-line-soft pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className={sectionLabel}>02 / Set</p>
              <button
                type="button"
                onClick={addSet}
                className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 text-xs font-medium text-accent-strong hover:underline"
              >
                Tambah set
              </button>
            </div>

            {draftSets.map((set, index) => (
              <fieldset
                key={set.key}
                className="space-y-3 border-t border-line-soft pt-4"
              >
                <legend className="sr-only">Set {index + 1}</legend>

                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[11px] text-muted">
                    Set {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSet(set.key)}
                    disabled={draftSets.length === 1}
                    className={ghostButton}
                  >
                    Hapus
                  </button>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`exercise-${set.key}`}
                    className={labelClass}
                  >
                    Latihan
                  </label>
                  <select
                    id={`exercise-${set.key}`}
                    value={set.exerciseId}
                    onChange={(event) =>
                      updateSet(set.key, { exerciseId: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Pilih latihan</option>
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.primary_muscle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label
                      htmlFor={`weight-${set.key}`}
                      className="block text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
                    >
                      Berat
                    </label>
                    <input
                      id={`weight-${set.key}`}
                      type="number"
                      min={0}
                      max={1000}
                      step="0.5"
                      value={set.weight}
                      onChange={(event) =>
                        updateSet(set.key, { weight: event.target.value })
                      }
                      placeholder="kg"
                      className="min-h-11 w-full rounded-sm border border-line bg-paper px-2 py-2.5 font-mono text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`reps-${set.key}`}
                      className="block text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
                    >
                      Reps
                    </label>
                    <input
                      id={`reps-${set.key}`}
                      type="number"
                      min={1}
                      max={1000}
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(set.key, { reps: event.target.value })
                      }
                      placeholder="10"
                      className="min-h-11 w-full rounded-sm border border-line bg-paper px-2 py-2.5 font-mono text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`rpe-${set.key}`}
                      className="block text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
                    >
                      RPE
                    </label>
                    <input
                      id={`rpe-${set.key}`}
                      type="number"
                      min={1}
                      max={10}
                      step="0.5"
                      value={set.rpe}
                      onChange={(event) =>
                        updateSet(set.key, { rpe: event.target.value })
                      }
                      placeholder="8"
                      className="min-h-11 w-full rounded-sm border border-line bg-paper px-2 py-2.5 font-mono text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                    />
                  </div>
                </div>

                <label className="flex min-h-11 items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={set.isWarmup}
                    onChange={(event) =>
                      updateSet(set.key, { isWarmup: event.target.checked })
                    }
                  />
                  Warm-up
                </label>
              </fieldset>
            ))}
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
            {saving ? 'Menyimpan...' : 'Simpan sesi'}
          </button>
        </form>

        <div className="space-y-8">
          <section aria-labelledby="riwayat-heading">
            <p className={sectionLabel}>03 / Riwayat</p>
            <h2
              id="riwayat-heading"
              className="mt-1 font-display text-2xl font-semibold"
            >
              Sesi terakhir
            </h2>

            {sessions.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-muted">
                Belum ada sesi. Sesi pertama akan jadi pembanding untuk
                berikutnya.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm text-ink">{session.name}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        {session.performed_on} | {session.sets_count} set
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleViewSession(session.id)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-xs font-medium text-accent-strong hover:underline"
                      >
                        Lihat
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSession(session.id)}
                        className={dangerButton}
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
            <p className="text-sm text-muted" aria-live="polite">
              Memuat detail...
            </p>
          )}

          {detail && (
            <section className="border-t border-line-soft pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">
                  {detail.name}
                </h2>
                <span className="font-mono text-[11px] text-muted">
                  {detail.performed_on}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                {detail.sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex flex-wrap items-baseline justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm text-ink">{set.exercise_name}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        Set {set.set_number}
                        {set.is_warmup ? ' | warm-up' : ''}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-ink">
                      {formatNumber(set.weight_kg ?? 0)} kg x {set.reps}
                      {set.rpe !== null ? ` | RPE ${set.rpe}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
