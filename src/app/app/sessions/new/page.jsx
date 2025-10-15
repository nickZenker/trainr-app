import { redirect } from "next/navigation";
import { supabaseServer } from "../../../../lib/supabaseServer";
import Link from "next/link";

export default async function NewSessionPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login");
  }

  // Get user's plans for dropdown
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .order("name");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-brand">Neue Session</h1>
            <p className="text-text-muted">Erstelle eine neue Trainingseinheit</p>
          </div>
          <Link 
            href="/app/sessions"
            className="text-text-muted hover:text-foreground px-3 py-1 rounded"
          >
            ← Zurück
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <form action={async (formData) => {
          "use server";
          
          const { createSession } = await import("../../../../services/sessions");
          
          const name = formData.get("name");
          const type = formData.get("type");
          const planId = formData.get("planId");
          const weekday = parseInt(formData.get("weekday"));
          const time = formData.get("time");

          if (!name || !type || !planId || weekday === undefined) {
            return;
          }

          const result = await createSession({
            name: name.trim(),
            type,
            planId,
            weekday,
            time: time || null
          });

          if (result.success) {
            redirect("/app/sessions");
          } else {
            // TODO: Show error message to user
            console.error("Session creation failed:", result.message);
          }
        }} className="space-y-6">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="z.B. Oberkörper Kraft"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Session Typ *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                >
                  <option value="">Typ wählen</option>
                  <option value="strength">💪 Kraft</option>
                  <option value="cardio">🏃 Cardio</option>
                </select>
              </div>

              <div>
                <label htmlFor="planId" className="block text-sm font-medium text-foreground mb-2">
                  Trainingsplan *
                </label>
                <select
                  id="planId"
                  name="planId"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                >
                  <option value="">Plan wählen</option>
                  {plans?.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="weekday" className="block text-sm font-medium text-foreground mb-2">
                  Wochentag *
                </label>
                <select
                  id="weekday"
                  name="weekday"
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                >
                  <option value="">Wochentag wählen</option>
                  <option value="0">Sonntag</option>
                  <option value="1">Montag</option>
                  <option value="2">Dienstag</option>
                  <option value="3">Mittwoch</option>
                  <option value="4">Donnerstag</option>
                  <option value="5">Freitag</option>
                  <option value="6">Samstag</option>
                </select>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                  Zeit (optional)
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-brand text-black px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors"
            >
              Session erstellen
            </button>
            <Link
              href="/app/sessions"
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

