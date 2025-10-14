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
