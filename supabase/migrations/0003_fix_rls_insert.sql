-- Migration 0003: Fix businesses INSERT RLS policy so anon users can submit applications.
-- Run this in the Supabase SQL Editor if you're getting
-- "new row violates row-level security policy" errors on form submission.

-- 1. Make sure the table exists and RLS is enabled
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing insert policies (catches any name variation)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'businesses'
      AND cmd        = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.businesses', r.policyname);
  END LOOP;
END$$;

-- 3. Create a simple, permissive INSERT policy for anonymous submissions.
CREATE POLICY "businesses_insert_public_pending"
  ON public.businesses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Grant INSERT to the anon and authenticated roles (required in addition to RLS policy)
GRANT INSERT ON public.businesses TO anon;
GRANT INSERT ON public.businesses TO authenticated;
