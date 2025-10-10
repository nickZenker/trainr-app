import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trainingsnutzer';

  // TODO: Fetch real profile data from API
  const mockStats = {
    totalWorkouts: 42,
    currentStreak: 7,
    totalVolume: 12500, // kg
    favoriteExercise: "Bankdrücken",
    joinDate: "2024-01-01"
  };

  const mockRecentAchievements = [
    { title: "Woche durchgezogen", description: "7 Tage Training in Folge", unlockedAt: "2024-01-15" },
    { title: "Bankdrücken 80kg", description: "Du hast 80kg Bankdrücken geschafft!", unlockedAt: "2024-01-10" },
    { title: "Erstes Training", description: "Du hast dein erstes Training absolviert!", unlockedAt: "2024-01-01" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-brand">Profil</h1>
          <p className="text-text-muted">Deine Trainingsstatistiken und Einstellungen</p>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{displayName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{displayName}</h2>
              <p className="text-text-muted">{user.email}</p>
              <p className="text-sm text-text-muted">Mitglied seit {new Date(mockStats.joinDate).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium">
            Übersicht
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Fortschritt
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Körperdaten
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Ziele
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Erfolge
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Verlauf
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Einstellungen
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border text-center">
            <h3 className="text-lg font-semibold mb-2">Workouts</h3>
            <p className="text-3xl font-bold text-brand">{mockStats.totalWorkouts}</p>
            <p className="text-sm text-text-muted">Gesamt</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border text-center">
            <h3 className="text-lg font-semibold mb-2">Streak</h3>
            <p className="text-3xl font-bold text-brand">{mockStats.currentStreak}</p>
            <p className="text-sm text-text-muted">Tage</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border text-center">
            <h3 className="text-lg font-semibold mb-2">Volumen</h3>
            <p className="text-3xl font-bold text-brand">{mockStats.totalVolume.toLocaleString()}</p>
            <p className="text-sm text-text-muted">kg</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border text-center">
            <h3 className="text-lg font-semibold mb-2">Lieblingsübung</h3>
            <p className="text-lg font-bold text-brand">{mockStats.favoriteExercise}</p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">🏆 Aktuelle Erfolge</h3>
          <div className="space-y-4">
            {mockRecentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-surface-hover rounded-lg">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-text-muted">{achievement.description}</p>
                </div>
                <div className="text-sm text-text-muted">
                  {new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Fortschritt</div>
          </button>
          <button className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="text-sm font-medium">Körperdaten</div>
          </button>
          <button className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium">Ziele</div>
          </button>
          <button className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium">Einstellungen</div>
          </button>
        </div>
      </main>
    </div>
  );
}
