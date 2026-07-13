-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New Query)
-- Creates the managers table used by the Manager Panel

CREATE TABLE IF NOT EXISTS public.managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Member',
  department TEXT DEFAULT '',
  season TEXT NOT NULL DEFAULT '2026-2027',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate (name + season) combinations
CREATE UNIQUE INDEX IF NOT EXISTS idx_managers_name_season
  ON public.managers (name, season);

-- Row Level Security
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "Managers are readable by authenticated users"
  ON public.managers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert/update/delete (VP controls via app logic)
CREATE POLICY "Managers can be managed by authenticated users"
  ON public.managers FOR ALL
  USING (auth.role() = 'authenticated');
