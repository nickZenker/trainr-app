import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const LiveSessionCreateSchema = z.object({
  session_id: z.string().uuid("Invalid session ID").optional(),
  type: z.enum(["strength", "cardio"], "Invalid session type")
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

// GET /api/live-sessions - Get active live sessions
export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: liveSessions, error } = await supabase
      .from("live_sessions")
      .select(`
        *,
        sessions (
          id,
          name,
          type
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false });

    if (error) {
      logError("GET /api/live-sessions", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch live sessions",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      liveSessions: liveSessions || [],
      count: liveSessions?.length || 0 
    });
  } catch (error) {
    logError("GET /api/live-sessions", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// POST /api/live-sessions - Start new live session
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = LiveSessionCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { session_id, type } = validation.data;

    // If session_id provided, verify it belongs to user
    if (session_id) {
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select(`
          id,
          plans!inner(user_id)
        `)
        .eq("id", session_id)
        .eq("plans.user_id", user.id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json({ 
          error: "Session not found or access denied" 
        }, { status: 404 });
      }
    }

    const { data: liveSession, error } = await supabase
      .from("live_sessions")
      .insert({
        user_id: user.id,
        session_id,
        type,
        status: "active"
      })
      .select(`
        *,
        sessions (
          id,
          name,
          type,
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
            ),
            set_schemas (
              id,
              variant,
              set_index,
              planned_reps,
              planned_weight,
              rir_or_rpe
            )
          )
        )
      `)
      .single();

    if (error) {
      logError("POST /api/live-sessions", error, user.id);
      return NextResponse.json({ 
        error: "Failed to start live session",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ liveSession }, { status: 201 });
  } catch (error) {
    logError("POST /api/live-sessions", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}