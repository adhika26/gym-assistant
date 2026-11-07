export type BodyMeasurement = {
  id: number
  measured_on: string
  weight_kg: number
  body_fat_pct: number | null
  waist_cm: number | null
  chest_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  hip_cm: number | null
  notes: string | null
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export type MeasurementPayload = {
  measured_on: string
  weight_kg: number
  body_fat_pct?: number | null
  waist_cm?: number | null
  notes?: string | null
}