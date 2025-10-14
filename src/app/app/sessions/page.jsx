import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import { getSessionsStats } from "../../../services/sessions";
import Link from "next/link";
import { Suspense } from "react";
import SessionActions from "./SessionActions";
import FilterToggle from "./FilterToggle";
import { scheduleSessionAction } from "./actions";

// Helper function to get weekday abbreviation
function getWeekdayAbbr(weekday) {
  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return weekDays[weekday] || '?';
}

// Helper function to get session type color
function getSessionTypeColor(type) {
  switch (type) {
    case 'strength':
      return 'bg-brand';
    case 'cardio':
      return 'bg-blue-500';
    case 'flexibility':
      return 'bg-green-500';
    default:
      return 'bg-text-muted';
  }
}

// Loading component for stats
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-lg p-6 border border-border animate-pulse">
          <div className="h-6 bg-border rounded mb-2"></div>
          <div className="h-8 bg-border rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Stats component
async function SessionsStats({ filter }) {
  try {
    const stats = await getSessionsStats();
    
    const statsData = [
      { label: "Gesamt", value: stats.totalSessions },
      { label: "Kraft", value: stats.strengthSessions },
      { label: "Cardio", value: stats.cardioSessions },
      { label: "Übungen", value: stats.totalExercises },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-brand">{stat.value}</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">Fehler beim Laden der Statistiken: {error.message}</p>
      </div>
    );
  }
}

// Sessions list component
async function SessionsList({ filter }) {
  try {
    const { listSessions } = await import("../../../services/sessions");
    const sessions = await listSessions(filter);

    if (!sessions || sessions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg mb-4">
            {filter === "strength" && "Keine Kraft-Sessions gefunden"}
            {filter === "cardio" && "Keine Cardio-Sessions gefunden"}
            {filter === "all" && "Keine Sessions gefunden"}
          </p>
          <Link 
            href="/app/sessions/new"
            className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Erste Session erstellen
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const exerciseCount = session.session_exercises?.length || 0;

          return (
            <div key={session.id} className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${getSessionTypeColor(session.type)}`}></div>
                <span className="text-sm font-medium text-text-muted">{session.plans.name}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{session.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Wochentag:</span>
                  <span className="font-medium">{getWeekdayAbbr(session.weekday)}</span>
                </div>
                {session.time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Uhrzeit:</span>
                    <span className="font-medium">{session.time}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Übungen:</span>
                  <span className="font-medium">{exerciseCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Typ:</span>
                  <span className="font-medium capitalize">{session.type}</span>
                </div>
              </div>

              <SessionActions session={session} />

              {/* Session Scheduling Form */}
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Session planen</h4>
                <form action={scheduleSessionAction} className="grid gap-2 md:grid-cols-3 items-end">
                  <input type="hidden" name="sessionId" value={session.id} />
                  <div>
                    <label htmlFor={`scheduledAt-${session.id}`} className="block text-xs text-text-muted mb-1">
                      Start (UTC)
                    </label>
                    <input 
                      id={`scheduledAt-${session.id}`}
                      name="scheduledAtIso" 
                      type="datetime-local" 
                      required 
                      className="w-full px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent"
                      data-testid="session-datetime"
                    />
                  </div>
                  <div>
                    <label htmlFor={`duration-${session.id}`} className="block text-xs text-text-muted mb-1">
                      Dauer (Min)
                    </label>
                    <input 
                      id={`duration-${session.id}`}
                      name="durationMin" 
                      type="number" 
                      min="0" 
                      step="5" 
                      placeholder="60" 
                      className="w-full px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent"
                      data-testid="session-duration"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-brand text-black px-3 py-1 text-sm font-medium rounded hover:bg-brand-hover transition-colors"
                    data-testid="session-schedule"
                  >
                    Planen
                  </button>
                </form>
                <p className="text-xs text-text-muted mt-2">
                  Wird in UTC gespeichert; Anzeige in deiner lokalen Zeit.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">Fehler beim Laden der Sessions: {error.message}</p>
      </div>
    );
  }
}

// Main page component
export default async function SessionsPage({ searchParams }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  const filter = searchParams?.type || "all";

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
        {/* Stats with Suspense */}
        <Suspense fallback={<StatsLoading />}>
          <SessionsStats filter={filter} />
        </Suspense>

        {/* Filter Toggle */}
        <FilterToggle currentFilter={filter} />

        {/* Sessions List with Suspense */}
        <Suspense fallback={
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">Lade Sessions...</p>
          </div>
        }>
          <SessionsList filter={filter} />
        </Suspense>
      </main>
    </div>
  );
}