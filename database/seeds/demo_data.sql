-- Demo data for Trainings App
-- Run this after migrations to create sample data

-- Note: Replace 'demo-user-uuid' with actual user UUID from Supabase Auth
-- This will be replaced with a real UUID when running the seed script

-- Create demo user profile
INSERT INTO profiles (user_id, display_name, gender, birthdate, unit_mass, unit_length, level, theme, locale)
VALUES ('demo-user-uuid', 'Demo User', 'male', '1990-01-01', 'kg', 'cm', 'intermediate', 'dark', 'de');

-- Create demo plan
INSERT INTO plans (id, user_id, name, goal, active)
VALUES ('demo-plan-uuid', 'demo-user-uuid', 'Ganzkörper Kraftplan', 'Muskelaufbau und Kraftsteigerung', true);

-- Create demo sessions
INSERT INTO sessions (id, plan_id, type, name, weekday, time, order_index)
VALUES 
  ('demo-session-1-uuid', 'demo-plan-uuid', 'strength', 'Krafttraining Oberkörper', 1, '18:00:00', 0),
  ('demo-session-2-uuid', 'demo-plan-uuid', 'cardio', 'Cardio Lauf', 2, '19:00:00', 1),
  ('demo-session-3-uuid', 'demo-plan-uuid', 'strength', 'Krafttraining Beine', 3, '18:00:00', 2),
  ('demo-session-4-uuid', 'demo-plan-uuid', 'strength', 'Krafttraining Ganzkörper', 5, '18:00:00', 3),
  ('demo-session-5-uuid', 'demo-plan-uuid', 'cardio', 'Cardio Rad', 6, '10:00:00', 4);

-- Create demo exercises (global)
INSERT INTO exercises (id, user_id, name, muscle_primary, muscle_secondary, equipment, favorite_variant, technique_notes)
VALUES 
  ('demo-exercise-1-uuid', NULL, 'Bankdrücken', 'chest', ARRAY['triceps', 'shoulders'], ARRAY['barbell', 'dumbbell', 'machine'], 'barbell', 'Brust raus, Schulterblätter zusammenziehen'),
  ('demo-exercise-2-uuid', NULL, 'Kniebeugen', 'quadriceps', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bodyweight'], 'barbell', 'Tiefe bis Oberschenkel parallel zum Boden'),
  ('demo-exercise-3-uuid', NULL, 'Kreuzheben', 'hamstrings', ARRAY['glutes', 'lower_back'], ARRAY['barbell'], 'barbell', 'Gerader Rücken, Hüfte nach hinten'),
  ('demo-exercise-4-uuid', NULL, 'Überzüge', 'chest', ARRAY['triceps'], ARRAY['dumbbell'], 'dumbbell', 'Leichter Schwung, Fokus auf Dehnung'),
  ('demo-exercise-5-uuid', NULL, 'Schulterdrücken', 'shoulders', ARRAY['triceps'], ARRAY['dumbbell', 'barbell'], 'dumbbell', 'Kontrollierte Bewegung nach oben');

-- Create exercise variants
INSERT INTO exercise_variants (id, exercise_id, variant)
VALUES 
  ('demo-variant-1-uuid', 'demo-exercise-1-uuid', 'barbell'),
  ('demo-variant-2-uuid', 'demo-exercise-1-uuid', 'dumbbell'),
  ('demo-variant-3-uuid', 'demo-exercise-1-uuid', 'machine'),
  ('demo-variant-4-uuid', 'demo-exercise-2-uuid', 'barbell'),
  ('demo-variant-5-uuid', 'demo-exercise-2-uuid', 'bodyweight'),
  ('demo-variant-6-uuid', 'demo-exercise-3-uuid', 'barbell'),
  ('demo-variant-7-uuid', 'demo-exercise-4-uuid', 'dumbbell'),
  ('demo-variant-8-uuid', 'demo-exercise-5-uuid', 'dumbbell'),
  ('demo-variant-9-uuid', 'demo-exercise-5-uuid', 'barbell');

-- Create session exercises
INSERT INTO session_exercises (id, session_id, exercise_id, selected_variant, notes, order_index)
VALUES 
  ('demo-session-exercise-1-uuid', 'demo-session-1-uuid', 'demo-exercise-1-uuid', 'barbell', 'Warm-up mit leichten Gewichten', 0),
  ('demo-session-exercise-2-uuid', 'demo-session-1-uuid', 'demo-exercise-4-uuid', 'dumbbell', 'Nach Bankdrücken für mehr Volumen', 1),
  ('demo-session-exercise-3-uuid', 'demo-session-1-uuid', 'demo-exercise-5-uuid', 'dumbbell', 'Abschluss für Schultern', 2),
  ('demo-session-exercise-4-uuid', 'demo-session-3-uuid', 'demo-exercise-2-uuid', 'barbell', 'Hauptübung für Beine', 0),
  ('demo-session-exercise-5-uuid', 'demo-session-3-uuid', 'demo-exercise-3-uuid', 'barbell', 'Komplettes Beintraining', 1);

-- Create set schemas (planned sets)
INSERT INTO set_schemas (id, session_exercise_id, variant, set_index, planned_reps, planned_weight, rir_or_rpe)
VALUES 
  -- Bankdrücken sets
  ('demo-set-schema-1-uuid', 'demo-session-exercise-1-uuid', 'barbell', 1, 12, 60.0, 8),
  ('demo-set-schema-2-uuid', 'demo-session-exercise-1-uuid', 'barbell', 2, 10, 70.0, 8),
  ('demo-set-schema-3-uuid', 'demo-session-exercise-1-uuid', 'barbell', 3, 8, 80.0, 7),
  ('demo-set-schema-4-uuid', 'demo-session-exercise-1-uuid', 'barbell', 4, 6, 85.0, 7),
  
  -- Überzüge sets
  ('demo-set-schema-5-uuid', 'demo-session-exercise-2-uuid', 'dumbbell', 1, 15, 25.0, 8),
  ('demo-set-schema-6-uuid', 'demo-session-exercise-2-uuid', 'dumbbell', 2, 12, 30.0, 7),
  ('demo-set-schema-7-uuid', 'demo-session-exercise-2-uuid', 'dumbbell', 3, 10, 35.0, 7),
  
  -- Schulterdrücken sets
  ('demo-set-schema-8-uuid', 'demo-session-exercise-3-uuid', 'dumbbell', 1, 12, 20.0, 8),
  ('demo-set-schema-9-uuid', 'demo-session-exercise-3-uuid', 'dumbbell', 2, 10, 25.0, 7),
  ('demo-set-schema-10-uuid', 'demo-session-exercise-3-uuid', 'dumbbell', 3, 8, 30.0, 7),
  
  -- Kniebeugen sets
  ('demo-set-schema-11-uuid', 'demo-session-exercise-4-uuid', 'barbell', 1, 15, 60.0, 8),
  ('demo-set-schema-12-uuid', 'demo-session-exercise-4-uuid', 'barbell', 2, 12, 80.0, 7),
  ('demo-set-schema-13-uuid', 'demo-session-exercise-4-uuid', 'barbell', 3, 10, 100.0, 7),
  ('demo-set-schema-14-uuid', 'demo-session-exercise-4-uuid', 'barbell', 4, 8, 110.0, 6),
  
  -- Kreuzheben sets
  ('demo-set-schema-15-uuid', 'demo-session-exercise-5-uuid', 'barbell', 1, 12, 80.0, 8),
  ('demo-set-schema-16-uuid', 'demo-session-exercise-5-uuid', 'barbell', 2, 10, 100.0, 7),
  ('demo-set-schema-17-uuid', 'demo-session-exercise-5-uuid', 'barbell', 3, 8, 120.0, 7);

-- Create cardio targets
INSERT INTO cardio_targets (id, session_id, discipline, planned_duration_sec, planned_distance_m, planned_hr_zone)
VALUES 
  ('demo-cardio-target-1-uuid', 'demo-session-2-uuid', 'running', 1800, 5000, 3),
  ('demo-cardio-target-2-uuid', 'demo-session-5-uuid', 'cycling', 3600, 20000, 2);

-- Create demo route
INSERT INTO routes (id, user_id, name, surface, distance_m, climb_m, map_geojson)
VALUES (
  'demo-route-uuid', 
  'demo-user-uuid', 
  'Stadtpark Runde', 
  'asphalt', 
  5000, 
  50, 
  '{"type": "LineString", "coordinates": [[10.0, 50.0], [10.01, 50.01], [10.02, 50.0], [10.0, 50.0]]}'
);

-- Create demo body metrics
INSERT INTO body_metrics (id, user_id, date, weight_kg, body_fat_pct, chest_cm, biceps_cm, waist_cm, hip_cm, thigh_cm, calf_cm)
VALUES 
  ('demo-body-metric-1-uuid', 'demo-user-uuid', '2024-01-01', 75.5, 15.0, 95, 35, 85, 95, 55, 35),
  ('demo-body-metric-2-uuid', 'demo-user-uuid', '2024-01-15', 75.0, 14.5, 96, 36, 84, 94, 56, 35),
  ('demo-body-metric-3-uuid', 'demo-user-uuid', '2024-02-01', 74.8, 14.0, 97, 37, 83, 93, 57, 36);

-- Create demo goals
INSERT INTO goals (id, user_id, type, target_value, due_date, status, progress_value)
VALUES 
  ('demo-goal-1-uuid', 'demo-user-uuid', 'weight_loss', 70.0, '2024-06-01', 'active', 74.8),
  ('demo-goal-2-uuid', 'demo-user-uuid', 'strength_bench_press', 100.0, '2024-12-01', 'active', 85.0),
  ('demo-goal-3-uuid', 'demo-user-uuid', 'cardio_5k_time', 20.0, '2024-08-01', 'active', 22.5);

-- Create demo achievements
INSERT INTO achievements (id, user_id, key, title, description, unlocked_at)
VALUES 
  ('demo-achievement-1-uuid', 'demo-user-uuid', 'first_workout', 'Erstes Training', 'Du hast dein erstes Training absolviert!', '2024-01-01 18:00:00'),
  ('demo-achievement-2-uuid', 'demo-user-uuid', 'week_streak', 'Woche durchgezogen', '7 Tage Training in Folge!', '2024-01-08 18:00:00'),
  ('demo-achievement-3-uuid', 'demo-user-uuid', 'bench_press_80', 'Bankdrücken 80kg', 'Du hast 80kg Bankdrücken geschafft!', '2024-01-15 18:30:00');

-- Create demo progression cycle
INSERT INTO progression_cycles (id, user_id, name, strategy, period_days, increment_value, increment_unit, deload_rule)
VALUES 
  ('demo-progression-uuid', 'demo-user-uuid', 'Standard Progression', 'linear', 7, 2.5, 'kg', 'every_4th_week');

-- Create demo nutrition foods
INSERT INTO nutrition_foods (id, name, source, kcal, protein, carbs, fat, unit, portion_grams)
VALUES 
  ('demo-food-1-uuid', 'Hähnchenbrust', 'custom', 165, 31, 0, 3.6, '100g', 100),
  ('demo-food-2-uuid', 'Reis (gekocht)', 'custom', 130, 2.7, 28, 0.3, '100g', 100),
  ('demo-food-3-uuid', 'Brokkoli', 'custom', 34, 2.8, 7, 0.4, '100g', 100),
  ('demo-food-4-uuid', 'Banane', 'custom', 89, 1.1, 23, 0.3, '1 Stück', 120),
  ('demo-food-5-uuid', 'Magerquark', 'custom', 67, 12, 4, 0.3, '100g', 100);

-- Create demo nutrition log
INSERT INTO nutrition_logs (id, user_id, date, items, notes)
VALUES (
  'demo-nutrition-log-uuid',
  'demo-user-uuid',
  '2024-01-15',
  '[
    {"food_id": "demo-food-1-uuid", "qty": 2, "grams": 200, "kcal": 330, "protein": 62, "carbs": 0, "fat": 7.2},
    {"food_id": "demo-food-2-uuid", "qty": 1.5, "grams": 150, "kcal": 195, "protein": 4.1, "carbs": 42, "fat": 0.5},
    {"food_id": "demo-food-3-uuid", "qty": 1, "grams": 100, "kcal": 34, "protein": 2.8, "carbs": 7, "fat": 0.4}
  ]',
  'Mittagessen nach dem Training'
);

-- Create demo calendar items
INSERT INTO calendar_items (id, user_id, title, type, start_ts, end_ts, session_id)
VALUES 
  ('demo-calendar-1-uuid', 'demo-user-uuid', 'Krafttraining Oberkörper', 'session', '2024-01-22 18:00:00', '2024-01-22 19:00:00', 'demo-session-1-uuid'),
  ('demo-calendar-2-uuid', 'demo-user-uuid', 'Cardio Lauf', 'session', '2024-01-23 19:00:00', '2024-01-23 19:30:00', 'demo-session-2-uuid'),
  ('demo-calendar-3-uuid', 'demo-user-uuid', 'Krafttraining Beine', 'session', '2024-01-24 18:00:00', '2024-01-24 19:00:00', 'demo-session-3-uuid');
