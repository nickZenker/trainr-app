import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET /api/routes - Get all routes for user
export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const surface = searchParams.get("surface");
    const minDistance = searchParams.get("min_distance");
    const maxDistance = searchParams.get("max_distance");

    let query = supabase
      .from("routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (surface) {
      query = query.eq("surface", surface);
    }

    if (minDistance) {
      query = query.gte("distance_m", parseInt(minDistance));
    }

    if (maxDistance) {
      query = query.lte("distance_m", parseInt(maxDistance));
    }

    const { data: routes, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ routes });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/routes - Create new route
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      surface, 
      distance_m, 
      climb_m, 
      map_geojson, 
      gpx_url 
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: route, error } = await supabase
      .from("routes")
      .insert({
        user_id: user.id,
        name,
        surface,
        distance_m,
        climb_m,
        map_geojson,
        gpx_url
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

