import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET /api/plans/[id] - Get specific plan with sessions
export async function GET(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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
          order_index
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const body = await request.json();
    const { name, goal, active, archived_at } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (goal !== undefined) updateData.goal = goal;
    if (active !== undefined) updateData.active = active;
    if (archived_at !== undefined) updateData.archived_at = archived_at;

    const { data: plan, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

