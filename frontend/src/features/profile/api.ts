import { apiFetch } from '../../lib/api'
import type { Profile, UpdateProfilePayload } from './types'

export async function getProfile(): Promise<Profile | null> {
  const data = await apiFetch<{ profile: Profile | null }>('/profile')
  return data.profile
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const data = await apiFetch<{ profile: Profile }>('/profile', {
    method: 'PUT',
    body: payload,
  })

  return data.profile
}