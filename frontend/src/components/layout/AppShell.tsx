import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-context'

const NAV_ITEMS = [
  { to: '/', label: 'Hari ini', end: true },
  { to: '/nutrition', label: 'Nutrisi' },
  { to: '/workout', label: 'Latihan' },
  { to: '/progress', label: 'Progress' },
  { to: '/coach', label: 'Coach' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <NavLink
            to="/"
            className="inline-flex min-h-11 items-center font-display text-2xl font-semibold tracking-[-0.02em]"
          >
            ANGKAT
          </NavLink>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-b-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="min-h-11 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-danger"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:pb-12">
        <Outlet />
      </main>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line-soft bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center border-t-2 px-1 py-2 text-[10px] uppercase tracking-[0.06em] transition-colors ${
                  isActive
                    ? 'border-accent font-semibold text-accent-strong'
                    : 'border-transparent font-medium text-muted'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
