/**
 * Thin service layer for Live Sessions.
 * Uses server-side Supabase client (RLS enforced). No secrets returned.
 */
import { supabaseServerWithCookies } from '../lib/supabaseServer.js';

/** Helpers */
async function getClientAndUser() {
  const supabase = await supabaseServerWithCookies();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Auth getUser error:', error);
    throw new Error(`auth:getUser failed - ${error.message}`);
  }
  if (!user) {
    console.error('No authenticated user found');
    throw new Error('auth:unauthenticated');
  }
  console.log('Authenticated user:', user.id);
  return { supabase, user };
}

/** Read a single live session with latest logs (lightweight) */
export async function getLiveSession(id) {
  const { supabase, user } = await getClientAndUser();
  const { data, error } = await supabase
    .from('live_sessions')
    .select('id, user_id, session_id, type, started_at, finished_at, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (error) throw new Error('live_sessions:get failed');
  return data;
}

/** Start a new live session */
export async function startLiveSession(payload) {
  const { supabase, user } = await getClientAndUser();
  const input = {
    user_id: user.id,
    session_id: payload?.sessionId ?? null,
    type: payload?.type ?? 'strength',
    started_at: new Date().toISOString(),
    status: 'active',
  };
  console.log('Creating live session with input:', input);
  const { data, error } = await supabase.from('live_sessions').insert(input).select('id').single();
  if (error) {
    console.error('Live session creation error:', error);
    throw new Error(`live_sessions:start failed - ${error.message}`);
  }
  return data; // { id }
}

/** Log a completed set into set_logs */
export async function logSet(liveSessionId, setPayload) {
  const { supabase } = await getClientAndUser();
  // Minimal required fields; extend as schema evolves
  const row = {
    live_session_id: liveSessionId,
    set_index: setPayload?.setIndex ?? 0,
    session_exercise_id: setPayload?.sessionExerciseId ?? null,
    variant: setPayload?.variant ?? null,
    actual_reps: setPayload?.reps ?? null,
    actual_weight: setPayload?.weight ?? null,
    rpe: setPayload?.rpe ?? null,
    notes: setPayload?.notes ?? null,
  };
  const { data, error } = await supabase.from('set_logs').insert(row).select('id').single();
  if (error) throw new Error('set_logs:insert failed');
  return data; // { id }
}

/** Stop (finish) a live session */
export async function stopLiveSession(id) {
  const { supabase, user } = await getClientAndUser();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('live_sessions')
    .update({ finished_at: now, status: 'completed' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, started_at, finished_at, status')
    .single();
  if (error) throw new Error('live_sessions:stop failed');
  return data;
}

/** Lightweight stats for Live UI header */
export async function getLiveStats(id) {
  const { supabase, user } = await getClientAndUser();
  const [{ data: session, error: e1 }, { data: sets, error: e2 }] = await Promise.all([
    supabase.from('live_sessions')
      .select('id, started_at, finished_at, status')
      .eq('id', id).eq('user_id', user.id).single(),
    supabase.from('set_logs')
      .select('id').eq('live_session_id', id),
  ]);
  if (e1) throw new Error('live_sessions:stats session failed');
  if (e2) throw new Error('live_sessions:stats sets failed');
  return {
    status: session.status,
    startedAt: session.started_at,
    finishedAt: session.finished_at,
    setCount: sets?.length ?? 0,
  };
}

/** Get recent set logs for verification */
export async function getRecentSets(liveSessionId, limit = 10) {
  const { supabase } = await getClientAndUser();
  const { data, error } = await supabase
    .from('set_logs')
    .select('id, set_index, session_exercise_id, actual_reps, actual_weight, rpe, notes, created_at')
    .eq('live_session_id', liveSessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error('set_logs:list failed');
  return data ?? [];
}

/** Get session exercises for live session */
export async function getSessionExercisesForLive(liveId) {
  const { supabase } = await getClientAndUser();
  
  // First get the session_id from live_sessions
  const { data: liveSession, error: liveError } = await supabase
    .from('live_sessions')
    .select('session_id')
    .eq('id', liveId)
    .single();
    
  if (liveError) throw new Error('live_sessions:get session_id failed');
  if (!liveSession?.session_id) return [];
  
  // Then get session_exercises with exercise names
  const { data, error } = await supabase
    .from('session_exercises')
    .select(`
      id,
      exercise_id,
      exercises (
        name
      )
    `)
    .eq('session_id', liveSession.session_id)
    .order('id', { ascending: true });
    
  if (error) throw new Error('session_exercises:list failed');
  return data ?? [];
}

/** Delete the most recent set from a live session */
export async function deleteLastSet(liveSessionId) {
  const { supabase } = await getClientAndUser();
  
  // Find newest set of the session (user-scope via RLS)
  const { data: last, error: e1 } = await supabase
    .from('set_logs')
    .select('id')
    .eq('live_session_id', liveSessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (e1 || !last) throw new Error('set_logs:last not found');
  
  const { error: e2 } = await supabase
    .from('set_logs')
    .delete()
    .eq('id', last.id);
    
  if (e2) throw new Error('set_logs:delete failed');
  return { ok: true, id: last.id };
}
