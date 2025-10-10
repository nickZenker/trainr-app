import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET /api/live-sessions/[id] - Get specific live session
export async function GET(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const { data: liveSession, error } = await supabase
      .from("live_sessions")
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
        ),
        set_logs (
          id,
          session_exercise_id,
          variant,
          set_index,
          actual_reps,
          actual_weight,
          rpe,
          notes,
          auto_progression_applied,
          created_at
        ),
        cardio_logs (
          id,
          distance_m,
          duration_sec,
          avg_hr,
          avg_pace,
          calories,
          created_at
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!liveSession) {
      return NextResponse.json({ error: "Live session not found" }, { status: 404 });
    }

    return NextResponse.json({ liveSession });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/live-sessions/[id] - Update live session (finish, pause, etc.)
export async function PUT(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, finished_at, duration_sec } = body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (finished_at !== undefined) updateData.finished_at = finished_at;
    if (duration_sec !== undefined) updateData.duration_sec = duration_sec;

    const { data: liveSession, error } = await supabase
      .from("live_sessions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!liveSession) {
      return NextResponse.json({ error: "Live session not found" }, { status: 404 });
    }

    return NextResponse.json({ liveSession });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

