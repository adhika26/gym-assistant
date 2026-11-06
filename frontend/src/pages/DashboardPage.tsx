import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/auth-context'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Selamat datang,</p>
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-400"
          >
            Logout
          </button>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-medium">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-400">
            Area ini akan menampilkan kalori, makro, latihan, dan progres Anda.
          </p>
        </section>
      </div>
    </main>
  )
}