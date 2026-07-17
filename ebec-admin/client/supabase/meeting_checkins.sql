-- Meeting Check-in System
-- Run this in Supabase SQL Editor

-- 1. Add checkin_token to meetings table
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS checkin_token TEXT;

-- 2. Backfill existing meetings with tokens
UPDATE meetings SET checkin_token = gen_random_uuid()::text WHERE checkin_token IS NULL;

-- 3. Create meeting_checkins table
CREATE TABLE IF NOT EXISTS meeting_checkins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id BIGINT REFERENCES meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(meeting_id, name)
);

-- 4. RLS: anyone can insert (public check-in page), only authenticated can read
ALTER TABLE meeting_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check in" ON meeting_checkins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read checkins" ON meeting_checkins
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. RPC: check in an attendee (idempotent)
CREATE OR REPLACE FUNCTION checkin_attendee(p_meeting_id BIGINT, p_name TEXT, p_email TEXT DEFAULT '', p_role TEXT DEFAULT '')
RETURNS JSON AS $$
  INSERT INTO meeting_checkins (meeting_id, name, email, role)
  VALUES (p_meeting_id, p_name, p_email, p_role)
  ON CONFLICT (meeting_id, name) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
  RETURNING json_build_object('ok', true, 'checked_in_at', checked_in_at);
$$ LANGUAGE sql;

-- 6. RPC: get checkins for a meeting
CREATE OR REPLACE FUNCTION get_meeting_checkins(p_meeting_id BIGINT)
RETURNS JSON AS $$
  SELECT COALESCE(json_agg(json_build_object('name', name, 'email', email, 'role', role, 'checked_in_at', checked_in_at)), '[]'::json)
  FROM meeting_checkins
  WHERE meeting_id = p_meeting_id;
$$ LANGUAGE sql;
