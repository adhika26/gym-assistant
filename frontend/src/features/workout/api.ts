import { apiFetch } from '../../lib/api'
import type {
  Exercise,
  Paginated,
  WorkoutSessionDetail,
  WorkoutSessionPayload,
  WorkoutSessionSummary,
} from './types'

export async function searchExercises(query: string): Promise<Exercise[]> {
  const params = new URLSearchParams()

  if (query.trim() !== '') {
    params.set('q', query.trim())
  }

  const data = await apiFetch<Paginated<Exercise>>(
    `/exercises?${params.toString()}`,
  )

  return data.data
}

export async function getWorkoutSessions(): Promise<WorkoutSessionSummary[]> {
  const data = await apiFetch<Paginated<WorkoutSessionSummary>>(
    '/workout-sessions',
  )

  return data.data
}

export async function getWorkoutSession(
  id: number,
): Promise<WorkoutSessionDetail> {
  const data = await apiFetch<{ session: WorkoutSessionDetail }>(
    `/workout-sessions/${id}`,
  )

  return data.session
}

export async function createWorkoutSession(
  payload: WorkoutSessionPayload,
): Promise<WorkoutSessionDetail> {
  const data = await apiFetch<{ session: WorkoutSessionDetail }>(
    '/workout-sessions',
    {
      method: 'POST',
      body: payload,
    },
  )

  return data.session
}

export async function deleteWorkoutSession(id: number): Promise<void> {
  await apiFetch(`/workout-sessions/${id}`, { method: 'DELETE' })
}
