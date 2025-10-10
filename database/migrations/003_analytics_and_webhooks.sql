-- Analytics and Webhooks Migration
-- Adds webhook_events table and muscle_volume_agg materialized view

-- Webhook Events table for tracking external service webhooks
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('garmin', 'strava', 'apple_health', 'google_fit', 'yazio', 'system')),
  event_type TEXT NOT NULL,
  event_id TEXT, -- External event ID for deduplication
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Muscle Volume Aggregation Materialized View
-- Aggregates training volume by muscle group for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS muscle_volume_agg AS
SELECT 
  p.user_id,
  e.muscle_primary,
  e.muscle_secondary,
  DATE_TRUNC('week', sl.created_at) as week_start,
  COUNT(DISTINCT sl.live_session_id) as sessions_count,
  COUNT(sl.id) as total_sets,
  SUM(sl.actual_reps) as total_reps,
  AVG(sl.actual_reps) as avg_reps_per_set,
  SUM(sl.actual_reps * COALESCE(sl.actual_weight, 0)) as total_volume_kg,
  AVG(sl.actual_weight) as avg_weight_kg,
  MAX(sl.actual_weight) as max_weight_kg,
  AVG(sl.rpe) as avg_rpe,
  COUNT(DISTINCT e.id) as unique_exercises,
  MAX(sl.created_at) as last_trained
FROM set_logs sl
JOIN session_exercises se ON se.id = sl.session_exercise_id
JOIN exercises e ON e.id = se.exercise_id
JOIN sessions s ON s.id = se.session_id
JOIN plans p ON p.id = s.plan_id
WHERE sl.created_at >= NOW() - INTERVAL '12 weeks'
  AND e.muscle_primary IS NOT NULL
GROUP BY 
  p.user_id,
  e.muscle_primary,
  e.muscle_secondary,
  DATE_TRUNC('week', sl.created_at)

UNION ALL

-- Secondary muscle groups (unnest muscle_secondary array)
SELECT 
  p.user_id,
  unnest(e.muscle_secondary) as muscle_primary,
  e.muscle_secondary,
  DATE_TRUNC('week', sl.created_at) as week_start,
  COUNT(DISTINCT sl.live_session_id) as sessions_count,
  COUNT(sl.id) as total_sets,
  SUM(sl.actual_reps) as total_reps,
  AVG(sl.actual_reps) as avg_reps_per_set,
  SUM(sl.actual_reps * COALESCE(sl.actual_weight, 0)) as total_volume_kg,
  AVG(sl.actual_weight) as avg_weight_kg,
  MAX(sl.actual_weight) as max_weight_kg,
  AVG(sl.rpe) as avg_rpe,
  COUNT(DISTINCT e.id) as unique_exercises,
  MAX(sl.created_at) as last_trained
FROM set_logs sl
JOIN session_exercises se ON se.id = sl.session_exercise_id
JOIN exercises e ON e.id = se.exercise_id
JOIN sessions s ON s.id = se.session_id
JOIN plans p ON p.id = s.plan_id
WHERE sl.created_at >= NOW() - INTERVAL '12 weeks'
  AND e.muscle_secondary IS NOT NULL
  AND array_length(e.muscle_secondary, 1) > 0
GROUP BY 
  p.user_id,
  unnest(e.muscle_secondary),
  e.muscle_secondary,
  DATE_TRUNC('week', sl.created_at);

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_muscle_volume_agg_unique 
ON muscle_volume_agg (user_id, muscle_primary, week_start);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Indexes for materialized view queries
CREATE INDEX IF NOT EXISTS idx_muscle_volume_agg_user_week ON muscle_volume_agg(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_muscle_volume_agg_muscle ON muscle_volume_agg(muscle_primary);
CREATE INDEX IF NOT EXISTS idx_muscle_volume_agg_last_trained ON muscle_volume_agg(last_trained);

-- Enable RLS on webhook_events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Webhook events policies
CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert webhook events" ON webhook_events
  FOR INSERT WITH CHECK (true); -- Allow system to insert webhooks for any user

CREATE POLICY "Users can update own webhook events" ON webhook_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can delete old webhook events" ON webhook_events
  FOR DELETE USING (true); -- Allow system cleanup of old events

-- Function to refresh muscle volume aggregation
CREATE OR REPLACE FUNCTION refresh_muscle_volume_agg()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY muscle_volume_agg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get muscle group training status (optimal/under/over)
CREATE OR REPLACE FUNCTION get_muscle_group_status(p_user_id UUID, p_muscle_group TEXT)
RETURNS TEXT AS $$
DECLARE
  recent_weeks INTEGER := 4;
  current_week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
  avg_weekly_volume DECIMAL;
  weeks_trained INTEGER;
BEGIN
  -- Get average weekly volume for the muscle group in recent weeks
  SELECT 
    AVG(total_volume_kg),
    COUNT(DISTINCT week_start)
  INTO avg_weekly_volume, weeks_trained
  FROM muscle_volume_agg
  WHERE user_id = p_user_id
    AND muscle_primary = p_muscle_group
    AND week_start >= current_week_start - INTERVAL (recent_weeks - 1) * 7 DAY;
  
  -- If no training data, return 'untrained'
  IF avg_weekly_volume IS NULL OR weeks_trained = 0 THEN
    RETURN 'untrained';
  END IF;
  
  -- Simple heuristic: if trained less than 2 weeks, under-trained
  IF weeks_trained < 2 THEN
    RETURN 'under';
  END IF;
  
  -- If average volume is very low (< 100kg), under-trained
  IF avg_weekly_volume < 100 THEN
    RETURN 'under';
  END IF;
  
  -- If average volume is very high (> 2000kg), over-trained
  IF avg_weekly_volume > 2000 THEN
    RETURN 'over';
  END IF;
  
  -- Otherwise, optimal
  RETURN 'optimal';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get training streak
CREATE OR REPLACE FUNCTION get_training_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_days INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  last_training_date DATE;
BEGIN
  -- Get the most recent training date
  SELECT MAX(DATE(l.started_at))
  INTO last_training_date
  FROM live_sessions l
  WHERE l.user_id = p_user_id
    AND l.status = 'completed'
    AND l.started_at < current_date;
  
  -- If no training found, return 0
  IF last_training_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate streak backwards from last training date
  WHILE last_training_date >= current_date - INTERVAL (streak_days + 1) DAY LOOP
    -- Check if there was training on this date
    IF EXISTS (
      SELECT 1 FROM live_sessions l
      WHERE l.user_id = p_user_id
        AND l.status = 'completed'
        AND DATE(l.started_at) = last_training_date
    ) THEN
      streak_days := streak_days + 1;
      last_training_date := last_training_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect personal records
CREATE OR REPLACE FUNCTION detect_personal_records(p_user_id UUID, p_live_session_id UUID)
RETURNS TABLE(exercise_id UUID, exercise_name TEXT, record_type TEXT, new_value DECIMAL, previous_value DECIMAL) AS $$
BEGIN
  RETURN QUERY
  WITH current_session_stats AS (
    SELECT 
      se.exercise_id,
      e.name as exercise_name,
      MAX(sl.actual_weight) as max_weight,
      MAX(sl.actual_reps) as max_reps,
      MAX(sl.actual_weight * sl.actual_reps) as max_volume
    FROM set_logs sl
    JOIN session_exercises se ON se.id = sl.session_exercise_id
    JOIN exercises e ON e.id = se.exercise_id
    WHERE sl.live_session_id = p_live_session_id
      AND sl.actual_weight IS NOT NULL
      AND sl.actual_reps IS NOT NULL
    GROUP BY se.exercise_id, e.name
  ),
  previous_max AS (
    SELECT 
      se.exercise_id,
      MAX(sl.actual_weight) as prev_max_weight,
      MAX(sl.actual_reps) as prev_max_reps,
      MAX(sl.actual_weight * sl.actual_reps) as prev_max_volume
    FROM set_logs sl
    JOIN session_exercises se ON se.id = sl.session_exercise_id
    JOIN live_sessions ls ON ls.id = sl.live_session_id
    WHERE ls.user_id = p_user_id
      AND ls.id != p_live_session_id
      AND ls.status = 'completed'
      AND sl.actual_weight IS NOT NULL
      AND sl.actual_reps IS NOT NULL
    GROUP BY se.exercise_id
  )
  SELECT 
    cs.exercise_id,
    cs.exercise_name,
    CASE 
      WHEN cs.max_weight > COALESCE(pm.prev_max_weight, 0) THEN 'max_weight'
      WHEN cs.max_reps > COALESCE(pm.prev_max_reps, 0) THEN 'max_reps'
      WHEN cs.max_volume > COALESCE(pm.prev_max_volume, 0) THEN 'max_volume'
    END as record_type,
    CASE 
      WHEN cs.max_weight > COALESCE(pm.prev_max_weight, 0) THEN cs.max_weight
      WHEN cs.max_reps > COALESCE(pm.prev_max_reps, 0) THEN cs.max_reps
      WHEN cs.max_volume > COALESCE(pm.prev_max_volume, 0) THEN cs.max_volume
    END as new_value,
    CASE 
      WHEN cs.max_weight > COALESCE(pm.prev_max_weight, 0) THEN COALESCE(pm.prev_max_weight, 0)
      WHEN cs.max_reps > COALESCE(pm.prev_max_reps, 0) THEN COALESCE(pm.prev_max_reps, 0)
      WHEN cs.max_volume > COALESCE(pm.prev_max_volume, 0) THEN COALESCE(pm.prev_max_volume, 0)
    END as previous_value
  FROM current_session_stats cs
  LEFT JOIN previous_max pm ON pm.exercise_id = cs.exercise_id
  WHERE cs.max_weight > COALESCE(pm.prev_max_weight, 0)
     OR cs.max_reps > COALESCE(pm.prev_max_reps, 0)
     OR cs.max_volume > COALESCE(pm.prev_max_volume, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for functions
GRANT EXECUTE ON FUNCTION refresh_muscle_volume_agg() TO authenticated;
GRANT EXECUTE ON FUNCTION get_muscle_group_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_training_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_personal_records(UUID, UUID) TO authenticated;

-- Create a scheduled job to refresh the materialized view (requires pg_cron extension)
-- This would typically be set up in Supabase Dashboard or via a cron service
-- SELECT cron.schedule('refresh-muscle-volume', '0 2 * * *', 'SELECT refresh_muscle_volume_agg();');

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW muscle_volume_agg;
