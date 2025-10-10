-- RLS Policies for Trainings App
-- All policies ensure users can only access their own data

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Users can view own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view sessions from own plans" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sessions to own plans" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sessions from own plans" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sessions from own plans" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM plans 
      WHERE plans.id = sessions.plan_id 
      AND plans.user_id = auth.uid()
    )
  );

-- Exercises policies (global + user-specific)
CREATE POLICY "Anyone can view global exercises" ON exercises
  FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise variants policies
CREATE POLICY "Anyone can view variants for accessible exercises" ON exercise_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND (exercises.user_id IS NULL OR exercises.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert variants for own exercises" ON exercise_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND exercises.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variants for own exercises" ON exercise_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND exercises.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variants for own exercises" ON exercise_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM exercises 
      WHERE exercises.id = exercise_variants.exercise_id 
      AND exercises.user_id = auth.uid()
    )
  );

-- Session exercises policies
CREATE POLICY "Users can view session exercises from own sessions" ON session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert session exercises to own sessions" ON session_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update session exercises from own sessions" ON session_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete session exercises from own sessions" ON session_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = session_exercises.session_id 
      AND plans.user_id = auth.uid()
    )
  );

-- Set schemas policies
CREATE POLICY "Users can view set schemas from own session exercises" ON set_schemas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM session_exercises
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert set schemas for own session exercises" ON set_schemas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_exercises
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update set schemas from own session exercises" ON set_schemas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM session_exercises
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete set schemas from own session exercises" ON set_schemas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM session_exercises
      JOIN sessions ON sessions.id = session_exercises.session_id
      JOIN plans ON plans.id = sessions.plan_id
      WHERE session_exercises.id = set_schemas.session_exercise_id 
      AND plans.user_id = auth.uid()
    )
  );

-- Live sessions policies
CREATE POLICY "Users can view own live sessions" ON live_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own live sessions" ON live_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own live sessions" ON live_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own live sessions" ON live_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Set logs policies
CREATE POLICY "Users can view set logs from own live sessions" ON set_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert set logs for own live sessions" ON set_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update set logs from own live sessions" ON set_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete set logs from own live sessions" ON set_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = set_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

-- Cardio targets policies
CREATE POLICY "Users can view cardio targets from own sessions" ON cardio_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = cardio_targets.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cardio targets for own sessions" ON cardio_targets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = cardio_targets.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cardio targets from own sessions" ON cardio_targets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = cardio_targets.session_id 
      AND plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cardio targets from own sessions" ON cardio_targets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN plans ON plans.id = sessions.plan_id
      WHERE sessions.id = cardio_targets.session_id 
      AND plans.user_id = auth.uid()
    )
  );

-- Cardio logs policies
CREATE POLICY "Users can view cardio logs from own live sessions" ON cardio_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = cardio_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cardio logs for own live sessions" ON cardio_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = cardio_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cardio logs from own live sessions" ON cardio_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = cardio_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cardio logs from own live sessions" ON cardio_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM live_sessions 
      WHERE live_sessions.id = cardio_logs.live_session_id 
      AND live_sessions.user_id = auth.uid()
    )
  );

-- Progression cycles policies
CREATE POLICY "Users can view own progression cycles" ON progression_cycles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progression cycles" ON progression_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progression cycles" ON progression_cycles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progression cycles" ON progression_cycles
  FOR DELETE USING (auth.uid() = user_id);

-- Body metrics policies
CREATE POLICY "Users can view own body metrics" ON body_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body metrics" ON body_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body metrics" ON body_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body metrics" ON body_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON achievements
  FOR DELETE USING (auth.uid() = user_id);

-- Routes policies
CREATE POLICY "Users can view own routes" ON routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes" ON routes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes" ON routes
  FOR DELETE USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Nutrition foods policies (global + user-specific)
CREATE POLICY "Anyone can view global nutrition foods" ON nutrition_foods
  FOR SELECT USING (source IN ('usda', 'yazio'));

CREATE POLICY "Users can view own custom nutrition foods" ON nutrition_foods
  FOR SELECT USING (source = 'custom' AND auth.uid() IS NOT NULL); -- Custom foods visible to all users

CREATE POLICY "Users can insert custom nutrition foods" ON nutrition_foods
  FOR INSERT WITH CHECK (source = 'custom');

CREATE POLICY "Users can update own custom nutrition foods" ON nutrition_foods
  FOR UPDATE USING (source = 'custom');

CREATE POLICY "Users can delete own custom nutrition foods" ON nutrition_foods
  FOR DELETE USING (source = 'custom');

-- Nutrition logs policies
CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON nutrition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON nutrition_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON nutrition_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar items policies
CREATE POLICY "Users can view own calendar items" ON calendar_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar items" ON calendar_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar items" ON calendar_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar items" ON calendar_items
  FOR DELETE USING (auth.uid() = user_id);

-- Sync jobs policies
CREATE POLICY "Users can view own sync jobs" ON sync_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync jobs" ON sync_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync jobs" ON sync_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync jobs" ON sync_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Feedback policies (anyone can submit, only admins can view all)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

