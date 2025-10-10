import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import Link from "next/link";

export default async function PlansPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  // Fetch real plans from database
  let plans = [];
  let error = null;
  
  try {
    const { data: plansData, error: plansError } = await supabase
      .from("plans")
      .select(`
        *,
        sessions (
          id,
          name,
          type,
          active
        )
      `)
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false });

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      error = plansError.message;
    } else {
      plans = plansData || [];
    }
  } catch (err) {
    console.error("Error in PlansPage:", err);
    error = "Failed to load plans";
  }

  // Calculate stats
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.active).length;
  const totalSessions = plans.reduce((sum, plan) => {
    return sum + (plan.sessions?.filter(s => s.active).length || 0);
  }, 0);

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
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">Fehler beim Laden der Pläne: {error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Gesamt</h3>
            <p className="text-3xl font-bold text-brand">{totalPlans}</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Aktiv</h3>
            <p className="text-3xl font-bold text-brand">{activePlans}</p>
          </div>
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-2">Sessions</h3>
            <p className="text-3xl font-bold text-brand">{totalSessions}</p>
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
          {plans.filter(p => p.active).map((plan) => (
            <div key={plan.id} className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-text-muted mb-2">{plan.goal || "Kein Ziel definiert"}</p>
                  <div className="flex gap-4 text-sm text-text-muted">
                    <span>{plan.sessions?.filter(s => s.active).length || 0} Sessions</span>
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
                  <form action={async () => {
                    "use server";
                    const supabase = await supabaseServer();
                    await supabase
                      .from("plans")
                      .update({ active: false })
                      .eq("id", plan.id)
                      .eq("user_id", data.user.id);
                  }}>
                    <button 
                      type="submit"
                      className="bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-colors"
                    >
                      Archivieren
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {plans.filter(p => p.active).length === 0 && !error && (
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

        {/* Loading State */}
        {plans.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">Lade Pläne...</p>
          </div>
        )}
      </main>
    </div>
  );
}