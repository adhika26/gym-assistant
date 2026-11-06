import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../lib/api'
import {
  createMealEntry,
  deleteMealEntry,
  getDailyLog,
  searchFoods,
} from './api'
import type { DailyLog, Food, MealType } from './types'
import { todayLocal } from '../../lib/date'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Sarapan',
  lunch: 'Makan siang',
  dinner: 'Makan malam',
  snack: 'Camilan',
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
        if (!cancelled) setError('Gagal memuat log makanan.')
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
        setAddError('Gagal menambah makanan.')
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteEntry(id: number) {
    if (!window.confirm('Hapus makanan ini dari log?')) return

    setDeletingId(id)
    setError(null)

    try {
      await deleteMealEntry(id)
      await refreshLog()
    } catch {
      setError('Gagal menghapus entri.')
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
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Nutrisi</h1>
            <p className="text-sm text-slate-400">Catatan makanan harian Anda.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            >
              Dashboard
            </Link>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>
        </header>

        {loading && <p className="text-slate-400">Memuat log...</p>}

        {error && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">{error}</p>
        )}

        {log && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Kalori', value: `${log.totals.calories} kcal` },
                { label: 'Protein', value: `${log.totals.protein_g} g` },
                { label: 'Karbo', value: `${log.totals.carbs_g} g` },
                { label: 'Lemak', value: `${log.totals.fat_g} g` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-emerald-400">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="font-medium">Tambah makanan</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari makanan (min. 2 huruf)..."
                  disabled={selectedFood !== null}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value as MealType)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  {MEALS.map((meal) => (
                    <option key={meal} value={meal}>
                      {MEAL_LABELS[meal]}
                    </option>
                  ))}
                </select>
              </div>

              {searching && (
                <p className="mt-2 text-sm text-slate-500">Mencari...</p>
              )}

              {!selectedFood &&
                !searching &&
                query.trim().length >= 2 &&
                results.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    Makanan tidak ditemukan.
                  </p>
                )}

              {!selectedFood && results.length > 0 && (
                <ul className="mt-3 max-h-64 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800">
                  {results.map((food) => (
                    <li key={food.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectFood(food)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-800/60"
                      >
                        <span>
                          <span className="block text-sm text-slate-100">
                            {food.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            P {food.protein_g} g | K {food.carbs_g} g | L{' '}
                            {food.fat_g} g per 100 g
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-sm text-slate-300">
                          {food.calories} kcal
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {selectedFood && (
                <div className="mt-3 rounded-xl border border-emerald-900/60 bg-slate-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {selectedFood.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedFood.calories} kcal | P {selectedFood.protein_g} g
                        {' | '}K {selectedFood.carbs_g} g | L{' '}
                        {selectedFood.fat_g} g per 100 g
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelSelection}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                      <label htmlFor="quantity" className="text-xs text-slate-400">
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
                        className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pb-2 text-sm text-slate-400">
                      {estimatedCalories !== null
                        ? `Perkiraan: ${estimatedCalories} kcal`
                        : 'Porsi tidak valid'}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleAddFood()}
                      disabled={adding}
                      className="ml-auto rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {adding ? 'Menambah...' : 'Tambah ke log'}
                    </button>
                  </div>

                  {addError && (
                    <p className="mt-2 text-sm text-red-400">{addError}</p>
                  )}
                </div>
              )}
            </section>

            {MEALS.map((meal) => {
              const entries = log.entries.filter(
                (entry) => entry.meal_type === meal,
              )

              return (
                <section
                  key={meal}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-medium">{MEAL_LABELS[meal]}</h2>
                    <span className="text-sm text-slate-400">
                      {entries.reduce((sum, entry) => sum + entry.calories, 0)} kcal
                    </span>
                  </div>

                  {entries.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Belum ada makanan.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-800">
                      {entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between gap-4 py-2 text-sm"
                        >
                          <div>
                            <p className="text-slate-100">
                              {entry.food?.name ?? 'Makanan dihapus'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entry.quantity_g} g | P {entry.protein_g} g | K{' '}
                              {entry.carbs_g} g | L {entry.fat_g} g
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="whitespace-nowrap text-slate-300">
                              {entry.calories} kcal
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleDeleteEntry(entry.id)}
                              disabled={deletingId === entry.id}
                              className="text-xs text-slate-500 hover:text-red-400 disabled:opacity-50"
                            >
                              {deletingId === entry.id ? 'Menghapus...' : 'Hapus'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </>
        )}
      </div>
    </main>
  )
}