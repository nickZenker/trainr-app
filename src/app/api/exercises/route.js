import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// GET /api/exercises - Get exercises (global + user-specific)
export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get("muscle_group");
    const equipment = searchParams.get("equipment");

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

    if (muscleGroup) {
      query = query.eq("muscle_primary", muscleGroup);
    }

    if (equipment) {
      query = query.contains("equipment", [equipment]);
    }

    const { data: exercises, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exercises });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const { 
      name, 
      muscle_primary, 
      muscle_secondary, 
      equipment, 
      favorite_variant, 
      technique_notes,
      variants 
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

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
      return NextResponse.json({ error: exerciseError.message }, { status: 500 });
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
        console.error("Error creating variants:", variantError);
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
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ exercise: exerciseWithVariants }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

