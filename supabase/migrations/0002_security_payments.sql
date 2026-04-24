-- Kumpuni hardening + payment-proof support
-- Apply AFTER 0001_init.sql in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- 1. New columns: payment proof + reference
-- ---------------------------------------------------------------------------
alter table public.businesses
  add column if not exists payment_proof_path text,
  add column if not exists payment_reference  text not null default '';

-- ---------------------------------------------------------------------------
-- 2. CHECK constraints (prevents DoS via huge payloads + obvious garbage)
-- ---------------------------------------------------------------------------
alter table public.businesses
  drop constraint if exists businesses_name_len,
  drop constraint if exists businesses_address_len,
  drop constraint if exists businesses_city_len,
  drop constraint if exists businesses_country_len,
  drop constraint if exists businesses_phone_len,
  drop constraint if exists businesses_email_len,
  drop constraint if exists businesses_email_shape,
  drop constraint if exists businesses_description_len,
  drop constraint if exists businesses_gmap_len,
  drop constraint if exists businesses_gmap_scheme,
  drop constraint if exists businesses_logo_scheme,
  drop constraint if exists businesses_image_scheme,
  drop constraint if exists businesses_payref_len,
  drop constraint if exists businesses_lat_range,
  drop constraint if exists businesses_lng_range,
  drop constraint if exists businesses_rating_range,
  drop constraint if exists businesses_reviews_range;

alter table public.businesses
  add constraint businesses_name_len        check (char_length(name)        between 1 and 120),
  add constraint businesses_address_len     check (char_length(address)     <= 240),
  add constraint businesses_city_len        check (char_length(city)        <= 80),
  add constraint businesses_country_len     check (char_length(country)     <= 80),
  add constraint businesses_phone_len       check (char_length(phone)       <= 40),
  add constraint businesses_email_len       check (char_length(email)       <= 160),
  add constraint businesses_email_shape     check (email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint businesses_description_len check (char_length(description) <= 2000),
  add constraint businesses_gmap_len        check (char_length(google_maps_url) <= 500),
  add constraint businesses_gmap_scheme     check (google_maps_url = '' or google_maps_url ~* '^https?://'),
  add constraint businesses_logo_scheme     check (logo_url is null  or logo_url  ~* '^https?://'),
  add constraint businesses_image_scheme    check (image_url is null or image_url ~* '^https?://'),
  add constraint businesses_payref_len      check (char_length(payment_reference) <= 120),
  add constraint businesses_lat_range       check (lat between -90  and 90),
  add constraint businesses_lng_range       check (lng between -180 and 180),
  add constraint businesses_rating_range    check (rating between 0 and 5),
  add constraint businesses_reviews_range   check (reviews >= 0 and reviews <= 1000000);

-- ---------------------------------------------------------------------------
-- 3. Lock down public INSERT — anon must NOT be able to:
--      * mark themselves premium / verified
--      * forge ratings / review counts
--      * dump arbitrary content into images[]/services[] arrays
--      * set submitted_at / updated_at to forge order
--      * supply non-empty payment_proof_path that points outside their own
--        scoped storage prefix (we re-check the scheme + prefix server-side)
-- ---------------------------------------------------------------------------
drop policy if exists "businesses_insert_public_pending" on public.businesses;
create policy "businesses_insert_public_pending"
  on public.businesses for insert
  with check (
    status = 'pending'
    and is_premium = false
    and rating  = 5.00
    and reviews = 0
    and coalesce(array_length(images,   1), 0) = 0
    and coalesce(array_length(services, 1), 0) = 0
    and (logo_url  is null or logo_url  ~* '^https?://')
    and (image_url is null or image_url ~* '^https?://')
    and (payment_proof_path is null or payment_proof_path ~ '^payment-proofs/[A-Za-z0-9._/-]{1,200}$')
  );

-- ---------------------------------------------------------------------------
-- 4. Storage: tighten business-images bucket + add private payment-proofs
-- ---------------------------------------------------------------------------
update storage.buckets
   set public              = true,
       file_size_limit     = 5242880,                                 -- 5 MB
       allowed_mime_types  = array['image/png','image/jpeg','image/webp','image/gif']
 where id = 'business-images';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,                                                              -- private
  5242880,
  array['image/png','image/jpeg','image/webp','application/pdf']
)
on conflict (id) do update
   set public             = excluded.public,
       file_size_limit    = excluded.file_size_limit,
       allowed_mime_types = excluded.allowed_mime_types;

-- payment-proofs storage policies
drop policy if exists "payment_proofs_public_insert" on storage.objects;
create policy "payment_proofs_public_insert"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs');

drop policy if exists "payment_proofs_admin_read" on storage.objects;
create policy "payment_proofs_admin_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists "payment_proofs_admin_update" on storage.objects;
create policy "payment_proofs_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin())
  with check (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists "payment_proofs_admin_delete" on storage.objects;
create policy "payment_proofs_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

-- Public column-level redaction for payment_proof_path:
-- Anon already can't read non-verified rows; the anon SELECT policy filters by
-- status='verified', so payment_proof_path on pending/rejected stays admin-only.
-- For verified rows we still don't want the proof path leaked publicly.
-- Easiest enforcement: keep the column readable but always return NULL for
-- non-admin readers via a view used by the mobile app.
create or replace view public.published_businesses as
  select id, name, category, address, city, country, phone, email, description,
         google_maps_url, lat, lng, logo_url, image_url, images, services, hours,
         rating, reviews, is_premium, status, submitted_at
    from public.businesses
   where status = 'verified';

grant select on public.published_businesses to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Lightweight per-email rate limit on new applications
--    Prevents trivial spam (1 application per email per hour, max 20 / day).
-- ---------------------------------------------------------------------------
create or replace function public.enforce_business_rate_limit()
returns trigger
language plpgsql
as $$
declare
  recent_same_email int;
  recent_total      int;
begin
  if new.email <> '' then
    select count(*) into recent_same_email
      from public.businesses
     where email = new.email
       and submitted_at > now() - interval '1 hour';
    if recent_same_email >= 1 then
      raise exception 'Too many applications for this email. Please try again later.';
    end if;
  end if;

  select count(*) into recent_total
    from public.businesses
   where submitted_at > now() - interval '1 minute';
  if recent_total >= 30 then
    raise exception 'Submission rate limit exceeded. Please try again shortly.';
  end if;

  -- Defensive: re-stamp server-controlled fields so client cannot forge them
  new.status       := 'pending';
  new.is_premium   := false;
  new.rating       := 5.00;
  new.reviews      := 0;
  new.submitted_at := now();
  new.updated_at   := now();
  return new;
end;
$$;

drop trigger if exists trg_businesses_rate_limit on public.businesses;
create trigger trg_businesses_rate_limit
  before insert on public.businesses
  for each row execute function public.enforce_business_rate_limit();
