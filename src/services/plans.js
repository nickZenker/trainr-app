/**
 * Thin wrapper around Server Actions for Plans operations
 * Provides reusable service layer for plan management
 */

import { supabaseServerWithCookies } from '../lib/supabaseServer';
import { safeInsert, normalizeDbError, isMissingColumn } from '../lib/safeSupabase';

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

    // Get total plans count
    const { count: totalPlans, error: plansError } = await supabase
      .from("plans")
      .select('id', { count: 'exact', head: true })
      .eq("user_id", user.id);

    if (plansError) {
      console.warn('Failed to fetch plans count:', plansError?.message);
    }

    // Get active plans count (plans with at least one session)
    const { count: activePlans, error: sessionsError } = await supabase
      .from("sessions")
      .select('plan_id', { count: 'exact', head: true })
      .eq("user_id", user.id);

    if (sessionsError) {
      console.warn('Failed to fetch sessions count:', sessionsError?.message);
    }

    return {
      totalPlans: totalPlans || 0,
      activePlans: activePlans || 0
    };

  } catch (error) {
    console.warn('Plans service - getPlansStats failed:', error.message);
    return {
      totalPlans: 0,
      activePlans: 0
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

    const { data: plans, error } = await supabase
      .from("plans")
      .select('id,name,goal,weeks,created_at')
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn('listPlans error:', error?.message);
      return [];
    }

    return plans || [];

  } catch (error) {
    console.error('Plans service - listPlans failed:', error.message);
    return [];
  }
}

/**
 * Create a new plan
 * @param {Object} input - Plan data (name, description?, type)
 * @returns {Promise<Object>} Result object with plan data
 */
// Helper to detect missing type column error
function isColumnMissingType(err) {
  return err?.code === '42703' || 
         err?.message?.includes('column "type" does not exist') ||
         err?.message?.includes('does not exist');
}

export async function createPlan(input) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validation
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Plan name is required');
    }

    if (input.name.length > 120) {
      throw new Error('Plan name is too long (max 120 characters)');
    }

    // Create payload with only allowed fields
    const values = {
      user_id: user.id,
      name: input.name.trim(),
      goal: input.description?.trim() || null,
      weeks: input.weeks || null,
      ...(input.type ? { type: input.type } : {})
    };

    // Konstruiere Query-Objekt für safeInsert
    const client = supabase;
    const table = 'plans';
    const q = client.from(table).insert(values).select('id').single();
    q.__ctx = { client, table, values };

    const { data } = await safeInsert(q, { retryWithout: ['type', 'active'] });

    console.log('Plan created successfully:', data);

    return {
      success: true,
      message: 'Plan created successfully',
      plan: { id: data.id }
    };

  } catch (error) {
    console.error('Plans service - createPlan failed:', error.message);
    return {
      success: false,
      message: error.message || 'createPlan failed'
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
    console.error('Plans service - archivePlan failed:', error.message);
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
    console.error('Plans service - deletePlan failed:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to delete plan'
    };
  }
}

/**
 * Ensure we have a plan ID from either a plan object or plan ID string
 * @param {string|Object} planOrId - Plan ID string or plan object with id property
 * @returns {string} Plan ID
 */
export function ensurePlanId(planOrId) {
  if (typeof planOrId === 'string') {
    return planOrId;
  }
  
  if (planOrId && typeof planOrId === 'object' && planOrId.id) {
    return planOrId.id;
  }
  
  throw new Error('Invalid plan ID: must be a string or object with id property');
}
