-- Kumpuni initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_status') then
    create type business_status as enum ('pending', 'verified', 'rejected');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_category') then
    create type business_category as enum ('Home', 'Plumbing', 'Electronics', 'Car', 'Appliances', 'HVAC');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Businesses table (combines applications and verified listings)
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        business_category not null default 'Home',
  address         text not null default '',
  city            text not null default '',
  country         text not null default '',
  phone           text not null default '',
  email           text not null default '',
  description     text not null default '',
  google_maps_url text not null default '',
  lat             double precision not null default 0,
  lng             double precision not null default 0,
  logo_url        text,
  image_url       text,
  images          text[] not null default '{}',
  services        text[] not null default '{}',
  hours           text,
  rating          numeric(3,2) not null default 5.00,
  reviews         integer not null default 0,
  is_premium      boolean not null default false,
  status          business_status not null default 'pending',
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists businesses_status_idx   on public.businesses (status);
create index if not exists businesses_category_idx on public.businesses (category);
create index if not exists businesses_submitted_idx on public.businesses (submitted_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin allow-list (used by RLS to gate write access)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.admins     enable row level security;

-- Public can read verified businesses
drop policy if exists "businesses_select_verified" on public.businesses;
create policy "businesses_select_verified"
  on public.businesses for select
  using (status = 'verified');

-- Admins can read everything (including pending/rejected)
drop policy if exists "businesses_select_admin" on public.businesses;
create policy "businesses_select_admin"
  on public.businesses for select
  to authenticated
  using (public.is_admin());

-- Anyone (anon or authenticated) can submit a pending application
drop policy if exists "businesses_insert_public_pending" on public.businesses;
create policy "businesses_insert_public_pending"
  on public.businesses for insert
  with check (status = 'pending');

-- Only admins can update or delete
drop policy if exists "businesses_update_admin" on public.businesses;
create policy "businesses_update_admin"
  on public.businesses for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "businesses_delete_admin" on public.businesses;
create policy "businesses_delete_admin"
  on public.businesses for delete
  to authenticated
  using (public.is_admin());

-- Admins table: only admins can read it; no client-side write
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self"
  on public.admins for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for business images (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('business-images', 'business-images', true)
on conflict (id) do update set public = true;

-- Allow public uploads to the business-images bucket (apply form is public).
-- Admins can also overwrite/delete.
drop policy if exists "business_images_public_read" on storage.objects;
create policy "business_images_public_read"
  on storage.objects for select
  using (bucket_id = 'business-images');

drop policy if exists "business_images_public_insert" on storage.objects;
create policy "business_images_public_insert"
  on storage.objects for insert
  with check (bucket_id = 'business-images');

drop policy if exists "business_images_admin_update" on storage.objects;
create policy "business_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'business-images' and public.is_admin())
  with check (bucket_id = 'business-images' and public.is_admin());

drop policy if exists "business_images_admin_delete" on storage.objects;
create policy "business_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'business-images' and public.is_admin());
