"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerWithCookies } from "@/lib/supabaseServer";
import { z } from "zod";
import { logApiError, handleValidationError } from "@/lib/api-utils";

// Validation schemas
const PlanIdSchema = z.string().uuid("Invalid Plan ID format");

const ArchivePlanSchema = z.object({
  planId: PlanIdSchema,
  archive: z.boolean()
});

const DeletePlanSchema = z.object({
  planId: PlanIdSchema
});

/**
 * Archive or restore a plan
 * @param {FormData} formData - Form data containing planId and archive status
 */
export async function togglePlanArchive(formData) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const rawData = {
      planId: formData.get("planId"),
      archive: formData.get("archive") === "true"
    };

    // Validate input
    const validation = ArchivePlanSchema.safeParse(rawData);
    if (!validation.success) {
      const error = handleValidationError(validation.error);
      throw new Error(error.message);
    }

    const { planId, archive } = validation.data;

    // Verify plan belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, active")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPlan) {
      logApiError("togglePlanArchive.fetch", fetchError, { userId: user.id, planId });
      throw new Error("Plan not found or access denied");
    }

    // Update plan status
    const updateData = {
      active: !archive,
      archived_at: archive ? new Date().toISOString() : null
    };

    const { data: updatedPlan, error: updateError } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", planId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      logApiError("togglePlanArchive.update", updateError, { userId: user.id, planId });
      throw new Error("Failed to update plan");
    }

    // Revalidate the plans page
    revalidatePath("/app/plans");
    
    return { 
      success: true, 
      message: archive ? "Plan archived successfully" : "Plan restored successfully",
      plan: updatedPlan 
    };

  } catch (error) {
    logApiError("togglePlanArchive", error);
    return { 
      success: false, 
      message: error.message || "An error occurred while updating the plan" 
    };
  }
}

/**
 * Delete a plan permanently
 * @param {FormData} formData - Form data containing planId
 */
export async function deletePlan(formData) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const rawData = {
      planId: formData.get("planId")
    };

    // Validate input
    const validation = DeletePlanSchema.safeParse(rawData);
    if (!validation.success) {
      const error = handleValidationError(validation.error);
      throw new Error(error.message);
    }

    const { planId } = validation.data;

    // Verify plan belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, name")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPlan) {
      logApiError("deletePlan.fetch", fetchError, { userId: user.id, planId });
      throw new Error("Plan not found or access denied");
    }

    // Delete plan (cascade will handle related sessions)
    const { error: deleteError } = await supabase
      .from("plans")
      .delete()
      .eq("id", planId)
      .eq("user_id", user.id);

    if (deleteError) {
      logApiError("deletePlan.delete", deleteError, { userId: user.id, planId });
      throw new Error("Failed to delete plan");
    }

    // Revalidate the plans page
    revalidatePath("/app/plans");
    
    return { 
      success: true, 
      message: `Plan "${existingPlan.name}" deleted successfully` 
    };

  } catch (error) {
    logApiError("deletePlan", error);
    return { 
      success: false, 
      message: error.message || "An error occurred while deleting the plan" 
    };
  }
}

/**
 * Create a new plan
 * @param {FormData} formData - Form data containing name and goal
 */
export async function createPlan(formData) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const rawData = {
      name: formData.get("name"),
      goal: formData.get("goal") || null
    };

    // Basic validation
    if (!rawData.name || rawData.name.trim().length === 0) {
      throw new Error("Plan name is required");
    }

    if (rawData.name.length > 120) {
      throw new Error("Plan name is too long (max 120 characters)");
    }

    // Create plan
    const { data: newPlan, error: createError } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        name: rawData.name.trim(),
        goal: rawData.goal?.trim() || null,
        active: true
      })
      .select()
      .single();

    if (createError) {
      logApiError("createPlan.create", createError, { userId: user.id });
      throw new Error("Failed to create plan");
    }

    // Revalidate the plans page
    revalidatePath("/app/plans");
    
    // Redirect to the new plan's detail page
    redirect(`/app/plans/${newPlan.id}`);

  } catch (error) {
    logApiError("createPlan", error);
    return { 
      success: false, 
      message: error.message || "An error occurred while creating the plan" 
    };
  }
}

/**
 * Get plans statistics for the current user
 * @returns {object} Statistics object
 */
export async function getPlansStats() {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    // Get all plans with session counts
    const { data: plans, error } = await supabase
      .from("plans")
      .select(`
        id,
        active,
        sessions (id)
      `)
      .eq("user_id", user.id);

    if (error) {
      logApiError("getPlansStats", error, { userId: user.id });
      throw new Error("Failed to fetch plans statistics");
    }

    const totalPlans = plans?.length || 0;
    const activePlans = plans?.filter(p => p.active).length || 0;
    const archivedPlans = totalPlans - activePlans;
    const totalSessions = plans?.reduce((sum, plan) => sum + (plan.sessions?.length || 0), 0) || 0;

    return {
      totalPlans,
      activePlans,
      archivedPlans,
      totalSessions
    };

  } catch (error) {
    logApiError("getPlansStats", error);
    return {
      totalPlans: 0,
      activePlans: 0,
      archivedPlans: 0,
      totalSessions: 0
    };
  }
}
