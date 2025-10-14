import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import { getPlansStats } from "../../../services/plans";
import Link from "next/link";
import { Suspense } from "react";
import PlanActions from "./PlanActions";
import FilterToggle from "./FilterToggle";
import { createPlanAction } from "./actions";


// Loading component for stats
function StatsLoading() {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface rounded-lg p-6 border border-border animate-pulse">
          <div className="h-6 bg-border rounded mb-2"></div>
          <div className="h-8 bg-border rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Stats component
async function PlansStats({ filter }) {
  try {
    const stats = await getPlansStats();
    
    const statsData = [
      { label: "Gesamt", value: stats.totalPlans },
      { label: "Aktiv", value: stats.activePlans },
      { label: "Archiviert", value: stats.archivedPlans },
    ];

    // Add sessions count if showing all or active plans
    if (filter === "all" || filter === "active") {
      statsData.push({ label: "Sessions", value: stats.totalSessions });
    }

    return (
      <div className={`grid gap-6 mb-8 ${statsData.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
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

// Plans list component
async function PlansList({ filter }) {
  try {
    const { listPlans } = await import("../../../services/plans");
    const plans = await listPlans(filter);

    if (!plans || plans.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg mb-4">
            {filter === "active" && "Keine aktiven Pläne gefunden"}
            {filter === "archived" && "Keine archivierten Pläne gefunden"}
            {filter === "all" && "Keine Pläne gefunden"}
          </p>
          <Link 
            href="/app/plans/new"
            className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
          >
            Ersten Plan erstellen
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-surface rounded-lg p-6 border border-border hover:border-brand transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.type && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.type === 'strength' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {plan.type === 'strength' ? 'Strength' : 'Endurance'}
                    </span>
                  )}
                </div>
                <p className="text-text-muted mb-2">{plan.goal || "Kein Ziel definiert"}</p>
                <div className="flex gap-4 text-sm text-text-muted">
                  <span>{plan.sessions?.length || 0} Sessions</span>
                  <span>Erstellt: {new Date(plan.created_at).toLocaleDateString('de-DE')}</span>
                  {plan.archived_at && (
                    <span>Archiviert: {new Date(plan.archived_at).toLocaleDateString('de-DE')}</span>
                  )}
                </div>
              </div>
              <PlanActions plan={plan} filter={filter} />
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">Fehler beim Laden der Pläne: {error.message}</p>
      </div>
    );
  }
}

// Main page component
export default async function PlansPage({ searchParams }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  const filter = searchParams?.filter || "active";

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
        {/* Stats with Suspense */}
        <Suspense fallback={<StatsLoading />}>
          <PlansStats filter={filter} />
        </Suspense>

        {/* Create Plan Form */}
        <div className="bg-surface rounded-lg p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Neuen Plan erstellen</h2>
          <form action={createPlanAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  minLength={1}
                  maxLength={120}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="z.B. Kraft – Push/Pull/Legs"
                  data-testid="plan-name"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Typ *
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue="strength"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  data-testid="plan-type"
                >
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Beschreibung
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="z.B. 3-Tage Split für Kraftaufbau"
                data-testid="plan-description"
              />
            </div>
            
            <button
              type="submit"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
              data-testid="plan-create"
            >
              Plan erstellen
            </button>
          </form>
        </div>

        {/* Filter Toggle */}
        <FilterToggle currentFilter={filter} />

        {/* Plans List with Suspense */}
        <Suspense fallback={
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">Lade Pläne...</p>
          </div>
        }>
          <PlansList filter={filter} />
        </Suspense>
      </main>
    </div>
  );
}