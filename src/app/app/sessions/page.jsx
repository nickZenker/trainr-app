import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  // TODO: Fetch real sessions from API
  const mockSessions = [
    {
      id: 1,
      name: "Krafttraining Oberkörper",
      type: "strength",
      weekday: 1,
      time: "18:00",
      planName: "Ganzkörper Kraftplan",
      exerciseCount: 4,
      estimatedDuration: "60 Min"
    },
    {
      id: 2,
      name: "Cardio Lauf",
      type: "cardio",
      weekday: 2,
      time: "19:00",
      planName: "Cardio Intensiv",
      exerciseCount: 1,
      estimatedDuration: "30 Min"
    },
    {
      id: 3,
      name: "Krafttraining Beine",
      type: "strength",
      weekday: 3,
      time: "18:00",
      planName: "Ganzkörper Kraftplan",
      exerciseCount: 3,
      estimatedDuration: "45 Min"
    }
  ];

  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Sessions</h1>
            <p className="text-text-muted">Alle Trainingseinheiten</p>
          </div>
          <Link 
            href="/app/sessions/new"
            className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Neue Session
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium">
            Alle
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Kraft
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Cardio
          </button>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSessions.map((session) => (
            <div key={session.id} className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${session.type === 'strength' ? 'bg-brand' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium text-text-muted">{session.planName}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{session.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Wochentag:</span>
                  <span className="font-medium">{weekDays[session.weekday]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Uhrzeit:</span>
                  <span className="font-medium">{session.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Übungen:</span>
                  <span className="font-medium">{session.exerciseCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Dauer:</span>
                  <span className="font-medium">{session.estimatedDuration}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/app/sessions/${session.id}`}
                  className="flex-1 bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors text-center"
                >
                  Bearbeiten
                </Link>
                <Link 
                  href={`/app/live/${session.id}`}
                  className="flex-1 bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors text-center"
                >
                  Starten
                </Link>
              </div>
            </div>
          ))}
        </div>

        {mockSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg mb-4">Keine Sessions gefunden</p>
            <Link 
              href="/app/sessions/new"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Erste Session erstellen
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

