import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const SessionCreateSchema = z.object({
  plan_id: z.string().uuid("Invalid plan ID"),
  type: z.enum(["strength", "cardio", "flexibility"], "Invalid session type"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  weekday: z.number().min(0, "Invalid weekday").max(6, "Invalid weekday"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  order_index: z.number().int().min(0).optional()
});

const SessionUpdateSchema = z.object({
  type: z.enum(["strength", "cardio", "flexibility"], "Invalid session type").optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  weekday: z.number().min(0, "Invalid weekday").max(6, "Invalid weekday").optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  order_index: z.number().int().min(0).optional(),
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

// GET /api/sessions?plan_id=xxx - Get sessions for a plan
export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("plan_id");

    if (!planId) {
      return NextResponse.json({ 
        error: "plan_id query parameter is required" 
      }, { status: 400 });
    }

    // Validate plan_id format
    if (!z.string().uuid().safeParse(planId).success) {
      return NextResponse.json({ 
        error: "Invalid plan_id format" 
      }, { status: 400 });
    }

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ 
        error: "Plan not found or access denied" 
      }, { status: 404 });
    }

    // Get sessions with exercises
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(`
        *,
        session_exercises (
          id,
          exercise_id,
          selected_variant,
          notes,
          order_index,
          exercises (
            id,
            name,
            muscle_primary,
            equipment
          )
        )
      `)
      .eq("plan_id", planId)
      .order("weekday", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      logError("GET /api/sessions", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch sessions",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      sessions,
      count: sessions.length 
    });
  } catch (error) {
    logError("GET /api/sessions", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// POST /api/sessions - Create new session
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = SessionCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { plan_id, type, name, weekday, time, order_index } = validation.data;

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", plan_id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ 
        error: "Plan not found or access denied" 
      }, { status: 404 });
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        plan_id,
        type,
        name,
        weekday,
        time,
        order_index: order_index || 0
      })
      .select()
      .single();

    if (error) {
      logError("POST /api/sessions", error, user.id);
      return NextResponse.json({ 
        error: "Failed to create session",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    logError("POST /api/sessions", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}