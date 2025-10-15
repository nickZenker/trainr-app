"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createRecurringSessions } from "@/services/sessions";

export async function schedulePlanAction(formData) {
  try {
    const planId = formData.get("planId");
    const startDate = formData.get("startDate");
    const timezone = formData.get("timezone");
    const weeks = parseInt(formData.get("weeks"));
    
    // Parse pattern from form data
    const pattern = [];
    let index = 0;
    while (formData.get(`pattern[${index}][weekday]`) !== null) {
      pattern.push({
        weekday: parseInt(formData.get(`pattern[${index}][weekday]`)),
        time: formData.get(`pattern[${index}][time]`),
        title: formData.get(`pattern[${index}][title]`) || null
      });
      index++;
    }

    if (pattern.length === 0) {
      throw new Error("Bitte mindestens einen Wochentag hinzufügen");
    }

    const result = await createRecurringSessions({
      planId,
      startDate,
      timezone,
      weeks,
      pattern
    });

    if (result.success) {
      revalidatePath("/app/calendar");
      revalidatePath("/app/sessions");
      redirect("/app/calendar");
    } else {
      throw new Error(result.message || "Fehler beim Erstellen der Termine");
    }
  } catch (error) {
    console.error("schedulePlanAction error:", error);
    throw error;
  }
}
