import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const PlanUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  goal: z.string().max(500, "Goal description too long").optional(),
  active: z.boolean().optional(),
  archived_at: z.string().datetime("Invalid datetime format").optional()
});

function logError(operation, error, userId = null) {
  console.error(`API Error [${operation}]:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    userId,
    timestamp: new Date().toISOString()
  });
}

// GET /api/plans/[id] - Get specific plan with sessions
export async function GET(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ 
        error: "Invalid plan ID format" 
      }, { status: 400 });
    }

    // Get plan with sessions
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select(`
        *,
        sessions (
          id,
          name,
          type,
          weekday,
          time,
          order_index,
          active
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (planError) {
      logError("GET /api/plans/[id]", planError, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch plan",
        details: planError.message 
      }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ 
        error: "Plan not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    logError("GET /api/plans/[id]", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// PUT /api/plans/[id] - Update plan
export async function PUT(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ 
        error: "Invalid plan ID format" 
      }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = PlanUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { name, goal, active, archived_at } = validation.data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (goal !== undefined) updateData.goal = goal;
    if (active !== undefined) updateData.active = active;
    if (archived_at !== undefined) updateData.archived_at = archived_at;

    // Don't allow empty updates
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields provided for update" 
      }, { status: 400 });
    }

    const { data: plan, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logError("PUT /api/plans/[id]", error, user.id);
      return NextResponse.json({ 
        error: "Failed to update plan",
        details: error.message 
      }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ 
        error: "Plan not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    logError("PUT /api/plans/[id]", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// DELETE /api/plans/[id] - Delete plan
export async function DELETE(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ 
        error: "Invalid plan ID format" 
      }, { status: 400 });
    }

    // First check if plan exists and belongs to user
    const { data: existingPlan, error: checkError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError) {
      logError("DELETE /api/plans/[id] - check", checkError, user.id);
      return NextResponse.json({ 
        error: "Failed to verify plan ownership",
        details: checkError.message 
      }, { status: 500 });
    }

    if (!existingPlan) {
      return NextResponse.json({ 
        error: "Plan not found or access denied" 
      }, { status: 404 });
    }

    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logError("DELETE /api/plans/[id]", error, user.id);
      return NextResponse.json({ 
        error: "Failed to delete plan",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Plan deleted successfully" 
    });
  } catch (error) {
    logError("DELETE /api/plans/[id]", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}