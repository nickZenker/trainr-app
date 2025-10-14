import { redirect } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabaseServer";
import Link from "next/link";

export default async function NewPlanPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Neuer Trainingsplan</h1>
            <p className="text-text-muted">Erstelle einen neuen Trainingsplan</p>
          </div>
          <Link 
            href="/app/plans"
            className="text-text-muted hover:text-foreground px-3 py-1 rounded"
          >
            ← Zurück
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <form action={async (formData) => {
          "use server";
          
          const { createPlan } = await import("../../../../services/plans");
          
          const name = formData.get("name");
          const goal = formData.get("goal");

          if (!name || name.trim().length === 0) {
            return;
          }

          const result = await createPlan({
            name: name.trim(),
            goal: goal?.trim() || null
          });

          if (result.success) {
            redirect("/app/plans");
          } else {
            // TODO: Show error message to user
            console.error("Plan creation failed:", result.message);
          }
        }} className="space-y-6">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="z.B. Ganzkörper Kraftplan"
                />
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-foreground mb-2">
                  Ziel (optional)
                </label>
                <textarea
                  id="goal"
                  name="goal"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="z.B. Muskelaufbau und Kraftsteigerung"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Plan erstellen
            </button>
            <Link
              href="/app/plans"
              className="bg-surface text-foreground px-6 py-3 rounded-lg font-medium hover:bg-surface-hover transition-colors border border-border"
            >
              Abbrechen
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
