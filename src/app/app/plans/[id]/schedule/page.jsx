import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { ensurePlanId } from "@/services/plans";
import ScheduleForm from "./ScheduleForm";

export default async function PlanSchedulePage({ params }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect("/auth/login");
  }

  const planId = ensurePlanId(params.id);

  // Fetch plan details
  const { data: plan, error } = await supabase
    .from("plans")
    .select("id, name, type, goal")
    .eq("id", planId)
    .eq("user_id", data.user.id)
    .single();

  if (error || !plan) {
    redirect("/app/plans");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Plan einplanen
        </h1>
        <p className="text-text-muted mt-1">
          Erstelle wiederkehrende Termine für "{plan.name}"
        </p>
      </div>

      <ScheduleForm plan={plan} />
    </div>
  );
}
