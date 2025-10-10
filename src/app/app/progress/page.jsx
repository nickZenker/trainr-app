import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import Link from "next/link";

export default async function ProgressPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  // Mock-Daten für Fortschritt (später durch echte API-Calls ersetzen)
  const progressData = {
    totalWorkouts: 24,
    currentStreak: 7,
    weeklyGoal: 4,
    completedThisWeek: 3,
    bodyWeight: 75.2,
    bodyFat: 15.8,
    muscleMass: 32.1,
    recentPRs: [
      { exercise: "Bankdrücken", weight: "85kg", date: "2025-02-15" },
      { exercise: "Kniebeugen", weight: "120kg", date: "2025-02-12" },
      { exercise: "Kreuzheben", weight: "140kg", date: "2025-02-10" }
    ],
    weeklyVolume: [
      { week: "KW 6", volume: 28500 },
      { week: "KW 7", volume: 31200 },
      { week: "KW 8", volume: 29800 },
      { week: "KW 9", volume: 32600 }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-brand hover:text-brand-hover">
              ← Zurück
            </Link>
            <h1 className="text-2xl font-bold text-brand">Fortschritt</h1>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Übersichtskarten */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="text-sm text-text-muted mb-1">Trainings gesamt</h3>
            <p className="text-2xl font-bold text-brand">{progressData.totalWorkouts}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="text-sm text-text-muted mb-1">Aktuelle Serie</h3>
            <p className="text-2xl font-bold text-brand">{progressData.currentStreak} Tage</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="text-sm text-text-muted mb-1">Wochenziel</h3>
            <p className="text-2xl font-bold text-brand">{progressData.completedThisWeek}/{progressData.weeklyGoal}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h3 className="text-sm text-text-muted mb-1">Körpergewicht</h3>
            <p className="text-2xl font-bold text-brand">{progressData.bodyWeight}kg</p>
          </div>
        </section>

        {/* Körperdaten */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">📊 Körperdaten</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{progressData.bodyWeight}kg</p>
              <p className="text-text-muted">Körpergewicht</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{progressData.bodyFat}%</p>
              <p className="text-text-muted">Körperfett</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{progressData.muscleMass}kg</p>
              <p className="text-text-muted">Muskelmasse</p>
            </div>
          </div>
        </section>

        {/* Personal Records */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">🏆 Personal Records</h3>
          <div className="space-y-3">
            {progressData.recentPRs.map((pr, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-surface-hover rounded-lg">
                <div>
                  <p className="font-medium">{pr.exercise}</p>
                  <p className="text-sm text-text-muted">{new Date(pr.date).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-brand">{pr.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wöchentliches Volumen */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">📈 Wöchentliches Volumen</h3>
          <div className="space-y-3">
            {progressData.weeklyVolume.map((week, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-text-muted">{week.week}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-surface-hover rounded-full h-2">
                    <div 
                      className="bg-brand h-2 rounded-full" 
                      style={{ width: `${(week.volume / 35000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{week.volume.toLocaleString()}kg</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-xl font-semibold mb-4">⚡ Schnellaktionen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/app/profile"
              className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Profil bearbeiten</div>
            </Link>
            <Link
              href="/app/plans"
              className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Training planen</div>
            </Link>
            <Link
              href="/app/routes"
              className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-medium">Routen verwalten</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
