import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liveSessions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { session_id, type } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

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
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liveSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
