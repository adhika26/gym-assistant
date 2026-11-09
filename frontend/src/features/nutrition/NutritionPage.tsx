import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../lib/api'
import {
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
  createMealEntry,
  deleteMealEntry,
  getDailyLog,
  searchFoods,
} from './api'
import type { DailyLog, Food, MealType } from './types'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Sarapan',
  lunch: 'Makan siang',
  dinner: 'Makan malam',
  snack: 'Camilan',
}

function formatCalories(value: number): string {
  return Math.round(value).toLocaleString('id-ID')
}

function formatMacro(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString('id-ID')
}

export default function NutritionPage() {
  const [date, setDate] = useState(todayLocal)
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mealType, setMealType] = useState<MealType>('lunch')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setLog(null)

    getDailyLog(date)
      .then((data) => {
        if (!cancelled) setLog(data)
      })
      .catch(() => {
        if (!cancelled) setError('Catatan makanan gagal dimuat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [date])

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setResults([])
      setSearching(false)
      return
    }

    let cancelled = false
    setSearching(true)

    const timeout = window.setTimeout(() => {
      searchFoods(trimmed)
        .then((foods) => {
          if (!cancelled) setResults(foods)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [query])

  async function refreshLog() {
    const data = await getDailyLog(date)
    setLog(data)
  }

  function focusAddForm(nextMeal?: MealType) {
    if (nextMeal) setMealType(nextMeal)

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    document.getElementById('tambah-makan')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    searchRef.current?.focus()
  }

  function handleSelectFood(food: Food) {
    setSelectedFood(food)
    setQuery('')
    setResults([])
    setAddError(null)
    setQuantity('100')
  }

  function handleCancelSelection() {
    setSelectedFood(null)
    setQuantity('100')
    setAddError(null)
  }

  async function handleAddFood() {
    if (!selectedFood) return

    const grams = Number(quantity)

    if (!Number.isFinite(grams) || grams < 1 || grams > 5000) {
      setAddError('Porsi harus antara 1 dan 5000 gram.')
      return
    }

    setAdding(true)
    setAddError(null)

    try {
      await createMealEntry({
        food_id: selectedFood.id,
        consumed_on: date,
        meal_type: mealType,
        quantity_g: grams,
      })

      setSelectedFood(null)
      setQuery('')
      setResults([])
      setQuantity('100')

      await refreshLog()
    } catch (err) {
      if (err instanceof ApiError) {
        setAddError(err.errors?.quantity_g?.[0] ?? err.message)
      } else {
        setAddError('Makanan gagal ditambahkan.')
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteEntry(id: number) {
    if (!window.confirm('Hapus makanan ini dari catatan?')) return

    setDeletingId(id)
    setError(null)

    try {
      await deleteMealEntry(id)
      await refreshLog()
    } catch {
      setError('Entri gagal dihapus.')
    } finally {
      setDeletingId(null)
    }
  }

  const grams = Number(quantity)
  const estimatedCalories =
    selectedFood && Number.isFinite(grams) && grams > 0
      ? Math.round((selectedFood.calories * grams) / 100)
      : null

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            Catatan makanan
          </p>
          <h1 className={`${pageTitle} mt-2`}>Nutrisi</h1>
          <p className={pageIntro}>
            Cari makanan, atur porsi, lalu lihat sisa kalori hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <label htmlFor="date" className={labelClass}>
              Tanggal
            </label>
            <input
              id="date"
              type="date"
              max={todayLocal()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-11 rounded-sm border border-line bg-surface px-3 py-2.5 font-mono text-xs text-ink focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={() => focusAddForm()}
            className={primaryButton}
          >
            Tambah makan
          </button>
        </div>
      </header>

      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-20 border-y border-line-soft bg-surface" />
          <div className="h-40 border border-line-soft bg-surface" />
          <p className="text-sm text-muted">Memuat catatan makanan...</p>
        </div>
      )}

      {error && (
        <p className={errorBanner} role="alert">
          {error}
        </p>
      )}

      {log && (
        <>
          <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line-soft py-5 sm:grid-cols-4">
            {[
              { label: 'Kalori', value: `${formatCalories(log.totals.calories)} kkal` },
              { label: 'Protein', value: `${formatMacro(log.totals.protein_g)} g` },
              { label: 'Karbo', value: `${formatMacro(log.totals.carbs_g)} g` },
              { label: 'Lemak', value: `${formatMacro(log.totals.fat_g)} g` },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={sectionLabel}>{stat.label}</p>
                <p className="mt-1 font-mono text-xl font-medium text-ink">
                  {stat.value}
                </p>
              </div>
            ))}
          </section>

          <section
            id="tambah-makan"
            className="scroll-mt-24 border border-line-soft bg-surface p-4 sm:p-5"
            aria-labelledby="tambah-makan-heading"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className={sectionLabel}>01 / Tambah</p>
                <h2
                  id="tambah-makan-heading"
                  className="mt-1 font-display text-2xl font-semibold"
                >
                  Cari makanan
                </h2>
              </div>
              <span className="text-xs text-muted">
                {searching ? 'Mencari...' : 'Minimal 2 huruf'}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label htmlFor="food-search" className={labelClass}>
                  Nama makanan
                </label>
                <input
                  ref={searchRef}
                  id="food-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Contoh: nasi, ayam, tempe"
                  disabled={selectedFood !== null}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="meal-type" className={labelClass}>
                  Waktu makan
                </label>
                <select
                  id="meal-type"
                  value={mealType}
                  onChange={(event) =>
                    setMealType(event.target.value as MealType)
                  }
                  className={inputClass}
                >
                  {MEALS.map((meal) => (
                    <option key={meal} value={meal}>
                      {MEAL_LABELS[meal]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!selectedFood && results.length > 0 && (
              <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                {results.map((food) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className="flex w-full flex-wrap items-baseline justify-between gap-3 px-2 py-3 text-left transition-colors hover:bg-paper"
                    >
                      <span>
                        <span className="block text-sm text-ink">
                          {food.name}
                        </span>
                        <span className="block font-mono text-[11px] text-muted">
                          P {formatMacro(food.protein_g)} | K{' '}
                          {formatMacro(food.carbs_g)} | L{' '}
                          {formatMacro(food.fat_g)} per 100 g
                        </span>
                      </span>
                      <span className="font-mono text-sm text-ink">
                        {formatCalories(food.calories)} kkal
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!selectedFood &&
              !searching &&
              query.trim().length >= 2 &&
              results.length === 0 && (
                <p className="mt-3 text-sm text-muted" aria-live="polite">
                  Tidak ada makanan yang cocok. Coba kata lain.
                </p>
              )}

            {selectedFood && (
              <div className="mt-5 border-t border-line-soft pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {selectedFood.name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted">
                      {formatCalories(selectedFood.calories)} kkal | P{' '}
                      {formatMacro(selectedFood.protein_g)} | K{' '}
                      {formatMacro(selectedFood.carbs_g)} | L{' '}
                      {formatMacro(selectedFood.fat_g)} per 100 g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelSelection}
                    className={ghostButton}
                  >
                    Batal
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className={labelClass}>
                      Porsi (gram)
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min={1}
                      max={5000}
                      step="1"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      className="min-h-11 w-32 rounded-sm border border-line bg-paper px-3 py-2.5 font-mono text-sm text-ink focus:border-accent"
                    />
                  </div>

                  <p className="pb-2.5 font-mono text-sm text-muted">
                    {estimatedCalories !== null
                      ? `+ ${formatCalories(estimatedCalories)} kkal`
                      : 'Porsi belum valid'}
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleAddFood()}
                    disabled={adding}
                    className={`${primaryButton} ml-auto`}
                  >
                    {adding ? 'Menambahkan...' : 'Tambah ke catatan'}
                  </button>
                </div>

                {addError && (
                  <p className="mt-2 text-xs text-danger" role="alert">
                    {addError}
                  </p>
                )}
              </div>
            )}
          </section>

          <div className="space-y-8">
            {MEALS.map((meal, index) => {
              const entries = log.entries.filter(
                (entry) => entry.meal_type === meal,
              )
              const total = entries.reduce(
                (sum, entry) => sum + entry.calories,
                0,
              )

              return (
                <section
                  key={meal}
                  className="border-t border-line-soft pt-6"
                  aria-labelledby={`meal-${meal}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[11px] text-muted">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                      <h2
                        id={`meal-${meal}`}
                        className="font-display text-2xl font-semibold"
                      >
                        {MEAL_LABELS[meal]}
                      </h2>
                      <span className="font-mono text-[11px] text-muted">
                        {entries.length === 0
                          ? 'belum dicatat'
                          : `${entries.length} item`}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-sm text-ink">
                        {formatCalories(total)} kkal
                      </span>
                      <button
                        type="button"
                        onClick={() => focusAddForm(meal)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 text-xs font-medium text-accent-strong hover:underline"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {entries.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">
                      Belum ada makanan. Kalau sudah makan, catat sekarang.
                    </p>
                  ) : (
                    <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
                      {entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex flex-wrap items-baseline justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-sm text-ink">
                              {entry.food?.name ?? 'Makanan dihapus'}
                            </p>
                            <p className="mt-1 font-mono text-[11px] text-muted">
                              {entry.quantity_g} g | P{' '}
                              {formatMacro(entry.protein_g)} | K{' '}
                              {formatMacro(entry.carbs_g)} | L{' '}
                              {formatMacro(entry.fat_g)}
                            </p>
                          </div>

                          <div className="flex items-baseline gap-4">
                            <span className="font-mono text-sm text-ink">
                              {formatCalories(entry.calories)} kkal
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleDeleteEntry(entry.id)}
                              disabled={deletingId === entry.id}
                              className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 text-xs text-muted transition-colors hover:text-danger disabled:opacity-50"
                            >
                              {deletingId === entry.id
                                ? 'Menghapus...'
                                : 'Hapus'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
