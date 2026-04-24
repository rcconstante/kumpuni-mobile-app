-- Migration 0004: SECURITY DEFINER function for business application submission.
-- This bypasses RLS entirely so anon users can always insert pending applications.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.insert_business_application(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id  uuid;
  v_row jsonb;
BEGIN
  INSERT INTO public.businesses (
    name, category, address, city, country, phone, email,
    description, google_maps_url, lat, lng,
    logo_url, image_url, images,
    payment_proof_path, payment_reference,
    status, is_premium, rating, reviews
  ) VALUES (
    p_data->>'name',
    COALESCE((p_data->>'category')::business_category, 'Home'),
    COALESCE(p_data->>'address', ''),
    COALESCE(p_data->>'city', ''),
    COALESCE(p_data->>'country', ''),
    COALESCE(p_data->>'phone', ''),
    COALESCE(p_data->>'email', ''),
    COALESCE(p_data->>'description', ''),
    COALESCE(p_data->>'google_maps_url', ''),
    COALESCE((p_data->>'lat')::double precision, 14.5995),
    COALESCE((p_data->>'lng')::double precision, 120.9842),
    NULLIF(p_data->>'logo_url', ''),
    NULLIF(p_data->>'image_url', ''),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(p_data->'images')),
      '{}'::text[]
    ),
    NULLIF(p_data->>'payment_proof_path', ''),
    COALESCE(p_data->>'payment_reference', ''),
    'pending',
    false,
    5.0,
    0
  )
  RETURNING id INTO v_id;

  SELECT to_jsonb(b) INTO v_row FROM public.businesses b WHERE b.id = v_id;
  RETURN v_row;
END;
$$;

-- Allow anon and authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.insert_business_application(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.insert_business_application(jsonb) TO authenticated;
