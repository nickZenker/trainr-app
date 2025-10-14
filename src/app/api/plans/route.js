import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";
import { 
  logApiError, 
  createErrorResponse, 
  handleValidationError, 
  createApiResponse 
} from "@/lib/api-utils";

// Validation schemas
const PlanCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  goal: z.string().max(500, "Goal description too long").optional(),
  active: z.boolean().optional()
});

// TODO: Implement PlanUpdateSchema when PUT endpoint is added
// const PlanUpdateSchema = z.object({
//   name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
//   goal: z.string().max(500, "Goal description too long").optional(),
//   active: z.boolean().optional()
// });

// GET /api/plans - Get all plans for user
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plans, error } = await supabase
      .from("plans")
      .select(`
        *,
        sessions (
          id,
          name,
          type,
          weekday,
          time_slot,
          active
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logApiError("GET /api/plans", error, user.id);
      return createErrorResponse(
        "Failed to fetch plans",
        500,
        error.code || "DATABASE_ERROR",
        error.message
      );
    }

    return NextResponse.json(createApiResponse(
      plans || [],
      { count: plans?.length || 0 }
    ));
  } catch (error) {
    logApiError("GET /api/plans", error);
    return createErrorResponse("Internal server error", 500, "UNKNOWN_ERROR");
  }
}

// POST /api/plans - Create new plan
export async function POST(request) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = PlanCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const { name, goal, active } = validation.data;

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        name,
        goal,
        active: active ?? true
      })
      .select()
      .single();

    if (error) {
      logApiError("POST /api/plans", error, user.id);
      return createErrorResponse(
        "Failed to create plan",
        500,
        error.code || "DATABASE_ERROR",
        error.message
      );
    }

    return NextResponse.json(createApiResponse(plan), { status: 201 });
  } catch (error) {
    logApiError("POST /api/plans", error);
    return createErrorResponse("Internal server error", 500, "UNKNOWN_ERROR");
  }
}