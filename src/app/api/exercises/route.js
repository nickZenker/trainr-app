import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const ExerciseCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  muscle_primary: z.string().min(1, "Primary muscle group is required").max(50, "Muscle group name too long"),
  muscle_secondary: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  favorite_variant: z.string().max(50, "Variant name too long").optional(),
  technique_notes: z.string().max(1000, "Technique notes too long").optional(),
  variants: z.array(z.string().min(1, "Variant cannot be empty").max(50, "Variant name too long")).optional()
});

const ExerciseQuerySchema = z.object({
  muscle_group: z.string().min(1).max(50).optional(),
  equipment: z.string().min(1).max(50).optional()
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

// GET /api/exercises - Get exercises (global + user-specific)
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
    const validation = ExerciseQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid query parameters",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { muscle_group, equipment } = validation.data;

    let query = supabase
      .from("exercises")
      .select(`
        *,
        exercise_variants (
          id,
          variant
        )
      `)
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name", { ascending: true });

    if (muscle_group) {
      query = query.eq("muscle_primary", muscle_group);
    }

    if (equipment) {
      query = query.contains("equipment", [equipment]);
    }

    const { data: exercises, error } = await query;

    if (error) {
      logError("GET /api/exercises", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch exercises",
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      exercises: exercises || [],
      count: exercises?.length || 0 
    });
  } catch (error) {
    logError("GET /api/exercises", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// POST /api/exercises - Create new exercise
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = ExerciseCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { 
      name, 
      muscle_primary, 
      muscle_secondary, 
      equipment, 
      favorite_variant, 
      technique_notes,
      variants 
    } = validation.data;

    // Create exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .insert({
        user_id: user.id,
        name,
        muscle_primary,
        muscle_secondary,
        equipment,
        favorite_variant,
        technique_notes
      })
      .select()
      .single();

    if (exerciseError) {
      logError("POST /api/exercises", exerciseError, user.id);
      return NextResponse.json({ 
        error: "Failed to create exercise",
        details: exerciseError.message 
      }, { status: 500 });
    }

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantData = variants.map(variant => ({
        exercise_id: exercise.id,
        variant
      }));

      const { error: variantError } = await supabase
        .from("exercise_variants")
        .insert(variantData);

      if (variantError) {
        logError("POST /api/exercises - variants", variantError, user.id);
        // Don't fail the request, just log the error
      }
    }

    // Fetch exercise with variants
    const { data: exerciseWithVariants, error: fetchError } = await supabase
      .from("exercises")
      .select(`
        *,
        exercise_variants (
          id,
          variant
        )
      `)
      .eq("id", exercise.id)
      .single();

    if (fetchError) {
      logError("POST /api/exercises - fetch", fetchError, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch created exercise",
        details: fetchError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ exercise: exerciseWithVariants }, { status: 201 });
  } catch (error) {
    logError("POST /api/exercises", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}