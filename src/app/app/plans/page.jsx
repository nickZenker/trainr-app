import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";
import { getPlansStats } from "./actions";
import Link from "next/link";
import { Suspense } from "react";
import PlanActions from "./PlanActions";
import FilterToggle from "./FilterToggle";


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
}

// Plans list component
async function PlansList({ filter }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  // Build query based on filter
  let query = supabase
    .from("plans")
    .select(`
      *,
      sessions (
        id,
        name,
        type
      )
    `)
    .eq("user_id", data.user.id);

  // Apply filter
  if (filter === "active") {
    query = query.eq("active", true);
  } else if (filter === "archived") {
    query = query.eq("active", false);
  }

  const { data: plans, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400">Fehler beim Laden der Pläne: {error.message}</p>
      </div>
    );
  }

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
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
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