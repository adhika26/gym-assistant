import { apiFetch } from '../../lib/api'
import type {
  BodyMeasurement,
  MeasurementPayload,
  Paginated,
} from './types'

export async function getMeasurements(): Promise<BodyMeasurement[]> {
  const data = await apiFetch<Paginated<BodyMeasurement>>('/measurements')

  return data.data
}

export async function createMeasurement(
  payload: MeasurementPayload,
): Promise<BodyMeasurement> {
  const data = await apiFetch<{ measurement: BodyMeasurement }>(
    '/measurements',
    {
      method: 'POST',
      body: payload,
    },
  )

  return data.measurement
}

export async function deleteMeasurement(id: number): Promise<void> {
  await apiFetch(`/measurements/${id}`, { method: 'DELETE' })
}