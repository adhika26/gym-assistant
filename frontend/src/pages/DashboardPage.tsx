import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../features/auth/auth-context";
import { getDailyLog } from "../features/nutrition/api";
import type { DailyLog } from "../features/nutrition/types";
import { getProfile } from "../features/profile/api";
import type { Profile } from "../features/profile/types";
import { todayLocal } from "../lib/date";

function percent(consumed: number, target: number | null): number {
  if (!target || target <= 0) return 0;

  return Math.min(100, Math.round((consumed / target) * 100));
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getProfile(), getDailyLog(todayLocal())])
      .then(([profileData, logData]) => {
        if (cancelled) return;

        if (!profileData) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setProfile(profileData);
        setLog(logData);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data dashboard.");
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

  const consumedCalories = log?.totals.calories ?? 0;
  const targetCalories = profile?.calorie_target ?? 0;
  const remainingCalories = targetCalories - consumedCalories;

  const macros =
    profile && log
      ? [
          {
            label: "Protein",
            consumed: log.totals.protein_g,
            target: profile.protein_g,
          },
          {
            label: "Karbo",
            consumed: log.totals.carbs_g,
            target: profile.carbs_g,
          },
          {
            label: "Lemak",
            consumed: log.totals.fat_g,
            target: profile.fat_g,
          },
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
              to="/progress"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            >
              Progress
            </Link>
            <Link
              to="/workout"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400"
            >
              Latihan
            </Link>
            <Link
              to="/nutrition"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Catat makanan
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </header>

        {loading && <p className="text-slate-400">Memuat dashboard...</p>}

        {error && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {profile && log && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium">Hari ini</h2>
                <p className="text-sm text-slate-400">
                  BMR {profile.bmr} kcal | TDEE {profile.tdee} kcal
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Sisa kalori
                </p>
                <p
                  className={`mt-1 text-3xl font-semibold ${
                    remainingCalories < 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {Math.abs(remainingCalories)} kcal
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {remainingCalories < 0 ? "Melebihi target" : "Tersisa"} |{" "}
                  {consumedCalories} / {targetCalories} kcal
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${percent(consumedCalories, targetCalories)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {macros.map((macro) => (
                  <div key={macro.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-slate-300">{macro.label}</span>
                      <span className="text-slate-400">
                        {macro.consumed} / {macro.target} g
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${percent(macro.consumed, macro.target)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Target air: {profile.water_ml} ml
              </p>
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
