"use server";

import { startLiveSession, stopLiveSession } from "../../../../services/liveSessions";
import { revalidatePath } from "next/cache";

export async function startLive(prevState, formData) {
  try {
    const sessionId = formData.get('sessionId');
    
    if (!sessionId) {
      return { ok: false, error: "Session ID fehlt" };
    }

    const result = await startLiveSession({ sessionId });
    
    // Revalidate the page to show updated status
    revalidatePath(`/app/live/${sessionId}`);
    
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
