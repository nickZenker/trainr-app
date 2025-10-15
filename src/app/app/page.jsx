import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabaseServer";
import Link from "next/link";

export default async function AppPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trainingsnutzer';

  // Mock-Daten für heute's Session und Wochenplan
  const todaySession = {
    id: 1,
    name: "Krafttraining Oberkörper",
    type: "strength",
    time: "18:00",
    duration: "60 Min"
  };

  const weekPlan = [
    { day: "Mo", session: "Kraft Oberkörper", time: "18:00", type: "strength" },
    { day: "Di", session: "Cardio Lauf", time: "19:00", type: "cardio" },
    { day: "Mi", session: "Kraft Beine", time: "18:00", type: "strength" },
    { day: "Do", session: "Ruhetag", time: "-", type: "rest" },
    { day: "Fr", session: "Kraft Ganzkörper", time: "18:00", type: "strength" },
    { day: "Sa", session: "Cardio Rad", time: "10:00", type: "cardio" },
    { day: "So", session: "Yoga/Stretching", time: "16:00", type: "flexibility" }
  ];

  const quickLinks = [
    { name: "Pläne verwalten", href: "/app/plans", icon: "📋" },
    { name: "Sessions", href: "/app/sessions", icon: "🏋️" },
    { name: "Profil", href: "/app/profile", icon: "👤" },
    { name: "Fortschritt", href: "/app/progress", icon: "📊" }
  ];

  return (
    <div className="space-y-8">
      <main className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Begrüßung */}
        <section>
          <h2 className="text-3xl font-semibold mb-2">Willkommen, {displayName}!</h2>
          <p className="text-text-muted">Bereit für dein Training heute?</p>
        </section>

        {/* Heute's Session */}
        <section className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🏋️ Heute's Session
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium">{todaySession.name}</h4>
              <p className="text-text-muted">{todaySession.time} • {todaySession.duration}</p>
            </div>
            <Link 
              href={`/app/live/${todaySession.id}`}
              className="bg-brand text-black px-6 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Training starten
            </Link>
          </div>
        </section>

        {/* Wochenplan */}
        <section>
          <h3 className="text-xl font-semibold mb-4">📅 Wochenplan</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekPlan.map((day, index) => (
              <div key={index} className="bg-surface rounded-lg p-3 border border-border">
                <div className="text-center">
                  <div className="font-semibold text-sm mb-1">{day.day}</div>
                  <div className="text-xs text-text-muted mb-2">{day.time}</div>
                  <div className="text-xs">
                    {day.type === 'strength' && '💪'}
                    {day.type === 'cardio' && '🏃'}
                    {day.type === 'flexibility' && '🧘'}
                    {day.type === 'rest' && '😴'}
                  </div>
                  <div className="text-xs text-foreground mt-1">{day.session}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quicklinks */}
        <section>
          <h3 className="text-xl font-semibold mb-4">🔗 Quicklinks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="bg-surface rounded-lg p-4 border border-border hover:border-brand transition-colors group"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{link.icon}</div>
                  <div className="text-sm font-medium group-hover:text-brand transition-colors">
                    {link.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


