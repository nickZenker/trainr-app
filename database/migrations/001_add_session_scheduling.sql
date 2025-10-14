-- Migration: Add session scheduling columns
-- Description: Add scheduled_at and duration_min columns to sessions table for calendar functionality
-- Date: 2025-01-14

-- Add columns if not exists
ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
    ADD COLUMN IF NOT EXISTS duration_min integer;

-- Add comments for documentation
COMMENT ON COLUMN public.sessions.scheduled_at IS 'Scheduled start time in UTC for the session';
COMMENT ON COLUMN public.sessions.duration_min IS 'Duration of the session in minutes';
