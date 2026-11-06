export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Food = {
  id: number
  name: string
  brand: string | null
  category: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export type MealEntry = {
  id: number
  food_id: number | null
  consumed_on: string
  meal_type: MealType
  quantity_g: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  food: Food | null
}

export type DailyTotals = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export type DailyLog = {
  date: string
  entries: MealEntry[]
  totals: DailyTotals
}

export type MealEntryPayload = {
  food_id: number
  consumed_on: string
  meal_type: MealType
  quantity_g: number
}