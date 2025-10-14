"use server";

import { startLiveSession, stopLiveSession, logSet, deleteLastSet } from "../../../../services/liveSessions";
import { revalidatePath } from "next/cache";

export async function startLive(prevState, formData) {
  try {
    const sessionId = formData.get('sessionId');
    
    if (!sessionId) {
      return { ok: false, error: "Session ID fehlt" };
    }

    const result = await startLiveSession({ sessionId });
    
    // Revalidate the page to show updated status
    revalidatePath(`/app/live/${result.id}`);
    
    return { ok: true, id: result.id };
  } catch (error) {
    console.error('Start live session error:', error);
    return { ok: false, error: error.message };
  }
}

export async function stopLive(prevState, formData) {
  try {
    const liveId = formData.get('liveId');
    
    if (!liveId) {
      return { ok: false, error: "Live Session ID fehlt" };
    }

    await stopLiveSession(liveId);
    
    // Revalidate the page to show updated status
    revalidatePath(`/app/live/${liveId}`);
    
    return { ok: true };
  } catch (error) {
    console.error('Stop live session error:', error);
    return { ok: false, error: error.message };
  }
}

export async function logSetAction(prevState, formData) {
  const liveId = formData.get("liveId");
  const sessionExerciseId = formData.get("sessionExerciseId") || null;
  const setIndex = Number(formData.get("setIndex") ?? 0);
  const reps = Number(formData.get("reps") ?? 0);
  const weight = formData.get("weight") ? Number(formData.get("weight")) : null;
  const rpe = formData.get("rpe") ? Number(formData.get("rpe")) : null;
  const notes = formData.get("notes") || null;
  
  try {
    await logSet(liveId, { sessionExerciseId, setIndex, reps, weight, rpe, notes });
    revalidatePath(`/app/live/${liveId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "logSet failed" };
  }
}

export async function undoLastSet(prevState, formData) {
  const liveId = formData.get('liveId');
  
  try {
    await deleteLastSet(liveId);
    revalidatePath(`/app/live/${liveId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'undo failed' };
  }
}
