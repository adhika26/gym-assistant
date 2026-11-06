export type Gender = 'male' | 'female'
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active'
  | 'extra_active'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'cut' | 'maintain' | 'bulk'

export type Profile = {
  id: number
  gender: Gender
  birth_date: string
  height_cm: number
  weight_kg: string
  activity_level: ActivityLevel
  experience_level: ExperienceLevel
  goal: Goal
  target_weight_kg: string | null
  weekly_rate_kg: string | null
  unit_system: string
  timezone: string
  equipment: string[] | null
  dietary_preferences: string[] | null
  allergies: string[] | null
  onboarded_at: string | null
  bmr: number | null
  tdee: number | null
  calorie_target: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
  water_ml: number | null
}

export type UpdateProfilePayload = {
  gender: Gender
  birth_date: string
  height_cm: number
  weight_kg: number
  activity_level: ActivityLevel
  experience_level: ExperienceLevel
  goal: Goal
  timezone?: string
}