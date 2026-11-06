import { apiFetch } from '../../lib/api'
import type { DailyLog, Food, MealEntry, MealEntryPayload } from './types'

type FoodsResponse = {
  data: Food[]
  current_page: number
  last_page: number
  total: number
}

export async function searchFoods(query: string): Promise<Food[]> {
  const params = new URLSearchParams()

  if (query.trim() !== '') {
    params.set('q', query.trim())
  }

  const data = await apiFetch<FoodsResponse>(`/foods?${params.toString()}`)

  return data.data
}

export async function getDailyLog(date: string): Promise<DailyLog> {
  return apiFetch<DailyLog>(`/meal-entries?date=${date}`)
}

export async function createMealEntry(payload: MealEntryPayload): Promise<MealEntry> {
  const data = await apiFetch<{ entry: MealEntry }>('/meal-entries', {
    method: 'POST',
    body: payload,
  })

  return data.entry
}

export async function updateMealEntry(
  id: number,
  payload: Partial<MealEntryPayload>,
): Promise<MealEntry> {
  const data = await apiFetch<{ entry: MealEntry }>(`/meal-entries/${id}`, {
    method: 'PUT',
    body: payload,
  })

  return data.entry
}

export async function deleteMealEntry(id: number): Promise<void> {
  await apiFetch(`/meal-entries/${id}`, { method: 'DELETE' })
}