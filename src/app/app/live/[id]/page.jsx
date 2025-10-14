import { redirect } from "next/navigation";
import { getLiveSession, getLiveStats } from "../../../../services/liveSessions";

export default async function LiveSessionPage({ params }) {
  const { id } = params;

  try {
    // Load real live session data from service layer
    const session = await getLiveSession(id);
    const stats = await getLiveStats(id);
    
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border px-6 py-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-brand">Live Training</h1>
              <p className="text-text-muted">Live Training • {session.type === 'strength' ? '💪 Kraft' : '🏃 Cardio'}</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
                Pause
              </button>
              <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors">
                Beenden
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto">
          {/* Session Info */}
          <div className="bg-surface rounded-lg p-6 border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Status:</span>
                <span className="ml-2 font-medium">{stats.status}</span>
              </div>
              <div>
                <span className="text-text-muted">Gestartet:</span>
                <span className="ml-2 font-medium">{new Date(stats.startedAt).toLocaleString()}</span>
              </div>
              {stats.finishedAt && (
                <div>
                  <span className="text-text-muted">Beendet:</span>
                  <span className="ml-2 font-medium">{new Date(stats.finishedAt).toLocaleString()}</span>
                </div>
              )}
              <div>
                <span className="text-text-muted">Sätze geloggt:</span>
                <span className="ml-2 font-medium">{stats.setCount}</span>
              </div>
            </div>
          </div>

          {/* Placeholder for future exercise UI */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Übungen</h3>
            <p className="text-text-muted">Exercise UI wird in zukünftigen Iterationen implementiert.</p>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Live session error:', error);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-400 mb-2">Fehler beim Laden der Live-Session</h1>
            <p className="text-red-300">Session ID: {id}</p>
            <p className="text-red-300">Fehler: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
}

