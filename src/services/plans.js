/**
 * Thin wrapper around Server Actions for Plans operations
 * Provides reusable service layer for plan management
 */

import { supabaseServerWithCookies } from '../lib/supabaseServer';

/**
 * Get plans statistics for the current user
 * @returns {Promise<Object>} Statistics object
 */
export async function getPlansStats() {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
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
      throw new Error(`Failed to fetch plans statistics: ${error.message}`);
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
    console.error('getPlansStats error:', error);
    return {
      totalPlans: 0,
      activePlans: 0,
      archivedPlans: 0,
      totalSessions: 0
    };
  }
}

/**
 * Get all plans for the current user with optional filtering
 * @param {string} filter - 'all', 'active', or 'archived'
 * @returns {Promise<Array>} Array of plans
 */
export async function listPlans(filter = 'all') {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

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
      .eq("user_id", user.id);

    // Apply filter
    if (filter === "active") {
      query = query.eq("active", true);
    } else if (filter === "archived") {
      query = query.eq("active", false);
    }

    const { data: plans, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`);
    }

    return plans || [];

  } catch (error) {
    console.error('listPlans error:', error);
    return [];
  }
}

/**
 * Create a new plan
 * @param {Object} input - Plan data (name, goal)
 * @returns {Promise<Object>} Result object
 */
export async function createPlan(input) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Basic validation
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Plan name is required');
    }

    if (input.name.length > 120) {
      throw new Error('Plan name is too long (max 120 characters)');
    }

    // Create plan
    const { data: newPlan, error } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        goal: input.goal?.trim() || null,
        active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create plan: ${error.message}`);
    }

    return {
      success: true,
      message: 'Plan created successfully',
      plan: newPlan
    };

  } catch (error) {
    console.error('createPlan error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create plan'
    };
  }
}

/**
 * Archive or restore a plan
 * @param {string} planId - Plan ID
 * @param {boolean} archive - Archive status
 * @returns {Promise<Object>} Result object
 */
export async function archivePlan(planId, archive) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify plan belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, active")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPlan) {
      throw new Error('Plan not found or access denied');
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
      throw new Error(`Failed to update plan: ${updateError.message}`);
    }

    return {
      success: true,
      message: archive ? 'Plan archived successfully' : 'Plan restored successfully',
      plan: updatedPlan
    };

  } catch (error) {
    console.error('archivePlan error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update plan'
    };
  }
}

/**
 * Delete a plan permanently
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Result object
 */
export async function deletePlan(planId) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify plan belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("plans")
      .select("id, name")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPlan) {
      throw new Error('Plan not found or access denied');
    }

    // Delete plan (cascade will handle related sessions)
    const { error: deleteError } = await supabase
      .from("plans")
      .delete()
      .eq("id", planId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw new Error(`Failed to delete plan: ${deleteError.message}`);
    }

    return {
      success: true,
      message: `Plan "${existingPlan.name}" deleted successfully`
    };

  } catch (error) {
    console.error('deletePlan error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete plan'
    };
  }
}
