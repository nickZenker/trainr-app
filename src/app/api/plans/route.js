import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const PlanCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  goal: z.string().max(500, "Goal description too long").optional(),
  active: z.boolean().optional()
});

const PlanUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  goal: z.string().max(500, "Goal description too long").optional(),
  active: z.boolean().optional()
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

// GET /api/plans - Get all plans for user
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plans, error } = await supabase
      .from("plans")
      .select(`
        *,
        sessions (
          id,
          name,
          type,
          weekday,
          time_slot,
          active
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logError("GET /api/plans", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch plans",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      plans,
      count: plans.length 
    });
  } catch (error) {
    logError("GET /api/plans", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// POST /api/plans - Create new plan
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = PlanCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { name, goal, active } = validation.data;

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        name,
        goal,
        active: active ?? true
      })
      .select()
      .single();

    if (error) {
      logError("POST /api/plans", error, user.id);
      return NextResponse.json({ 
        error: "Failed to create plan",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    logError("POST /api/plans", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}