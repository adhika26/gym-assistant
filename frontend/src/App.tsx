import { useEffect, useState } from 'react'

type Ping = {
  status: string
  service: string
}

export default function App() {
  const [data, setData] = useState<Ping | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPing() {
      try {
        const response = await fetch('/api/v1/ping')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const json: Ping = await response.json()

        if (!cancelled) {
          setData(json)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPing()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Gym Assistant API</h1>

        {loading && <p className="mt-4 text-slate-400">Loading...</p>}

        {error && (
          <p className="mt-4 rounded-lg bg-red-950 p-4 text-red-300">
            Gagal memuat: {error}
          </p>
        )}

        {data && !loading && (
          <dl className="mt-6 space-y-3 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">status</dt>
              <dd className="text-emerald-400">{data.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">service</dt>
              <dd className="text-emerald-400">{data.service}</dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  )
}