import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getPlan } from "@/services/plans";
import EditPlanForm from "./EditPlanForm";

export default async function EditPlanPage({ params }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  const planId = params.id;

  // Fetch plan details
  const plan = await getPlan(planId);

  if (!plan) {
    redirect("/app/plans");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="plan-edit-page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Plan bearbeiten
        </h1>
        <p className="text-text-muted mt-1">
          Bearbeite "{plan.name}"
        </p>
      </div>

      <EditPlanForm plan={plan} />
    </div>
  );
}
