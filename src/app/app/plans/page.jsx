import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import Link from "next/link";

export default async function PlansPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  // TODO: Fetch real plans from API
  const mockPlans = [
    {
      id: 1,
      name: "Ganzkörper Kraftplan",
      goal: "Muskelaufbau und Kraftsteigerung",
      active: true,
      sessionCount: 4,
      created_at: "2024-01-01"
    },
    {
      id: 2,
      name: "Cardio Intensiv",
      goal: "Ausdauer und Fettverbrennung",
      active: false,
      sessionCount: 3,
      created_at: "2024-01-15"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Trainingspläne</h1>
            <p className="text-text-muted">Verwalte deine Trainingspläne</p>
          </div>
          <Link 
            href="/app/plans/new"
            className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Neuer Plan
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Gesamt</h3>
            <p className="text-3xl font-bold text-brand">{mockPlans.length}</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Aktiv</h3>
            <p className="text-3xl font-bold text-brand">{mockPlans.filter(p => p.active).length}</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Sessions</h3>
            <p className="text-3xl font-bold text-brand">{mockPlans.reduce((sum, p) => sum + p.sessionCount, 0)}</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-6">
          <button className="bg-brand text-black px-4 py-2 rounded-lg font-medium">
            Aktiv
          </button>
          <button className="bg-surface text-foreground px-4 py-2 rounded-lg font-medium hover:bg-surface-hover transition-colors">
            Archiv
          </button>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          {mockPlans.filter(p => p.active).map((plan) => (
            <div key={plan.id} className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-text-muted mb-2">{plan.goal}</p>
                  <div className="flex gap-4 text-sm text-text-muted">
                    <span>{plan.sessionCount} Sessions</span>
                    <span>Erstellt: {new Date(plan.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/app/plans/${plan.id}`}
                    className="bg-brand text-black px-4 py-2 rounded-lg font-medium hover:bg-brand-hover transition-colors"
                  >
                    Bearbeiten
                  </Link>
                  <button className="bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors">
                    Archivieren
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockPlans.filter(p => p.active).length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg mb-4">Keine aktiven Pläne gefunden</p>
            <Link 
              href="/app/plans/new"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Ersten Plan erstellen
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
