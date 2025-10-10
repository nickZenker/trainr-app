import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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
      return NextResponse.json({ error: "plan_id is required" }, { status: 400 });
    }

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { plan_id, type, name, weekday, time, order_index } = body;

    if (!plan_id || !type || !name || weekday === undefined) {
      return NextResponse.json({ 
        error: "plan_id, type, name, and weekday are required" 
      }, { status: 400 });
    }

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", plan_id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
