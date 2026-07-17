-- Meeting Check-in Updates
-- Run this in Supabase SQL Editor

-- 1. Add email and role columns to meeting_checkins (if not already added)
ALTER TABLE meeting_checkins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE meeting_checkins ADD COLUMN IF NOT EXISTS role TEXT;

-- 2. Backfill checkin_token on existing meetings
UPDATE meetings SET checkin_token = gen_random_uuid()::text WHERE checkin_token IS NULL;

-- 3. Drop and recreate checkin_attendee — syncs to meetings.attendance JSONB
DROP FUNCTION IF EXISTS checkin_attendee(BIGINT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION checkin_attendee(p_meeting_id BIGINT, p_name TEXT, p_email TEXT DEFAULT '', p_role TEXT DEFAULT '')
RETURNS JSON
SECURITY DEFINER
LANGUAGE sql AS $$
  WITH ins AS (
    INSERT INTO meeting_checkins (meeting_id, name, email, role)
    VALUES (p_meeting_id, p_name, p_email, p_role)
    ON CONFLICT (meeting_id, name) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
    RETURNING checked_in_at
  ),
  sync AS (
    UPDATE meetings
    SET attendance = COALESCE(attendance, '{}'::jsonb) || jsonb_build_object(p_name, 'present')
    WHERE id = p_meeting_id
  )
  SELECT json_build_object('ok', true, 'checked_in_at', checked_in_at) FROM ins;
$$;

-- 4. Drop and recreate get_meeting_checkins
DROP FUNCTION IF EXISTS get_meeting_checkins(BIGINT);
CREATE OR REPLACE FUNCTION get_meeting_checkins(p_meeting_id BIGINT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE sql AS $$
  SELECT COALESCE(json_agg(json_build_object('name', name, 'email', email, 'role', role, 'checked_in_at', checked_in_at)), '[]'::json)
  FROM meeting_checkins
  WHERE meeting_id = p_meeting_id;
$$;
