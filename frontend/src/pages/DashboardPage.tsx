import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/auth-context";
import { getProfile } from "../features/profile/api";
import type { Profile } from "../features/profile/types";
import { Link } from "react-router";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((data) => {
        if (cancelled) return;

        if (!data) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat profil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const stats = profile
    ? [
        { label: "Kalori", value: `${profile.calorie_target} kcal` },
        { label: "Protein", value: `${profile.protein_g} g` },
        { label: "Lemak", value: `${profile.fat_g} g` },
        { label: "Karbo", value: `${profile.carbs_g} g` },
        { label: "Air", value: `${profile.water_ml} ml` },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Selamat datang,</p>
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/nutrition"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400">
              Catat makanan
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-400">
              Logout
            </button>
          </div>
        </header>

        {loading && <p className="text-slate-400">Memuat profil...</p>}

        {error && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {profile && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium">Target harian</h2>
                <p className="text-sm text-slate-400">
                  BBMR {profile.bmr} kcal | TDEE {profile.tdee} kcal
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-emerald-400">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-medium">Profil</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Tujuan</dt>
                  <dd className="capitalize">{profile.goal}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Tinggi</dt>
                  <dd>{profile.height_cm} cm</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Berat</dt>
                  <dd>{Number(profile.weight_kg)} kg</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Aktivitas</dt>
                  <dd className="capitalize">{profile.activity_level}</dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
