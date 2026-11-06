export type Exercise = {
  id: number
  name: string
  slug: string
  primary_muscle: string
  secondary_muscles: string[] | null
  equipment: string | null
  difficulty: string
  is_compound: boolean
}

export type WorkoutSet = {
  id: number
  exercise_id: number | null
  exercise_name: string
  set_number: number
  weight_kg: number | null
  reps: number
  rpe: number | null
  is_warmup: boolean
  notes: string | null
  exercise?: Exercise | null
}

export type WorkoutSessionSummary = {
  id: number
  performed_on: string
  name: string
  duration_min: number | null
  perceived_exertion: number | null
  notes: string | null
  sets_count: number
}

export type WorkoutSessionDetail = Omit<WorkoutSessionSummary, 'sets_count'> & {
  sets: WorkoutSet[]
}

export type WorkoutSetPayload = {
  exercise_id: number
  weight_kg?: number | null
  reps: number
  rpe?: number | null
  is_warmup?: boolean
  notes?: string | null
}

export type WorkoutSessionPayload = {
  performed_on: string
  name: string
  duration_min?: number | null
  perceived_exertion?: number | null
  notes?: string | null
  sets: WorkoutSetPayload[]
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}
