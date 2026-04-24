-- Migration 0003: Fix businesses INSERT RLS policy so anon users can submit applications.
-- Run this in the Supabase SQL Editor if you're getting
-- "new row violates row-level security policy" errors on form submission.

-- Drop old policy (handles both 0001 and 0002 versions)
DROP POLICY IF EXISTS "businesses_insert_public_pending" ON public.businesses;

-- Clean, permissive INSERT policy for anonymous submissions.
-- Enforces: status must be pending, no premium/rating/review forgery.
-- The server-side trigger (enforce_business_fields) re-stamps all these
-- values anyway, so this is just a defence-in-depth check.
CREATE POLICY "businesses_insert_public_pending"
  ON public.businesses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND is_premium = false
    AND rating = 5.0
    AND reviews = 0
  );
