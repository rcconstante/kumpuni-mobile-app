# Kumpuni Supabase setup

## 1. Apply the migration

Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/wuwspgflzfhyothfqifh/sql)
and run the contents of `migrations/0001_init.sql`.

This creates:

- `public.businesses` — single source of truth for both applications and
  verified listings.
- `public.admins` — allow-list of `auth.users` IDs that can manage data.
- `storage.business-images` — public bucket used by the apply form and the
  admin panel for logos / highlight pictures.
- Row-Level Security policies that:
  - let the public read verified businesses,
  - let anyone submit a pending application,
  - restrict updates / deletes / pending reads to admins.

## 2. Create the first admin

In **Authentication → Users**, create a user (e.g. `admin@kumpuni.com`) with a
password. Then in the SQL editor:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'admin@kumpuni.com';
```

That user can now sign in to the web admin panel at `/admin`.

## 3. Environment variables

Both apps use the **publishable (anon) key** — never the service-role key.

`.env` (mobile, repo root):

```
EXPO_PUBLIC_SUPABASE_URL=https://wuwspgflzfhyothfqifh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FIzThmd-eLuHlXQ9gbjY2w_TjOYcHYN
```

`web/.env`:

```
VITE_SUPABASE_URL=https://wuwspgflzfhyothfqifh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_FIzThmd-eLuHlXQ9gbjY2w_TjOYcHYN
```

> The Postgres connection string and service-role key must **never** ship in
> the mobile or web bundles. Rotate the database password you shared in chat.
