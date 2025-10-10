import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const RouteCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  surface: z.enum(["asphalt", "trail", "gravel", "track", "mixed"], "Invalid surface type").optional(),
  distance_m: z.number().positive("Distance must be positive").optional(),
  climb_m: z.number().min(0, "Climb cannot be negative").optional(),
  map_geojson: z.record(z.any()).optional(),
  gpx_url: z.string().url("Invalid GPX URL").optional()
});

const RouteQuerySchema = z.object({
  surface: z.enum(["asphalt", "trail", "gravel", "track", "mixed"]).optional(),
  min_distance: z.string().regex(/^\d+$/, "Invalid distance format").optional(),
  max_distance: z.string().regex(/^\d+$/, "Invalid distance format").optional()
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

// GET /api/routes - Get all routes for user
export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = RouteQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid query parameters",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { surface, min_distance, max_distance } = validation.data;

    let query = supabase
      .from("routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (surface) {
      query = query.eq("surface", surface);
    }

    if (min_distance) {
      query = query.gte("distance_m", parseInt(min_distance));
    }

    if (max_distance) {
      query = query.lte("distance_m", parseInt(max_distance));
    }

    const { data: routes, error } = await query;

    if (error) {
      logError("GET /api/routes", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch routes",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      routes: routes || [],
      count: routes?.length || 0 
    });
  } catch (error) {
    logError("GET /api/routes", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
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
    
    // Validate input
    const validation = RouteCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { name, surface, distance_m, climb_m, map_geojson, gpx_url } = validation.data;

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
      logError("POST /api/routes", error, user.id);
      return NextResponse.json({ 
        error: "Failed to create route",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    logError("POST /api/routes", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}