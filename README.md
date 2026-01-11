# Room Finder (Frontend)

Setup notes and required Supabase resources:

- Create a Supabase project and set the following env variables (use `.env` or your hosting env):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

- Database table `rooms` schema (recommended):
  - id: uuid (default: gen_random_uuid())
  - title: text
  - location: text
  - rent: numeric
  - property_type: text
  - tenant_preference: text
  - contact_number: text
  - images: text[] (array of public URLs)
  - owner_id: uuid (references auth.users)
  - created_at: timestamptz (default now())

- Storage: create a bucket named `rooms` and set it to public (or configure signed URLs for private buckets). The app uploads files to `rooms/{ownerId}/...`.

- Auth: Email/password sign up is used. OTP and other flows can be added later.

Database setup (profiles table)

Create a `profiles` table in Supabase to store user roles and additional profile data. Example SQL:

```sql
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text,
  full_name text,
  created_at timestamptz default now()
);
```

Recommended policies:
- Enable RLS and allow users to insert/update their own profile only.
- Admins can manage `role` values (assign `owner` when appropriate) or set them at registration via a secure backend.

Notes:
- The app expects `role` to be `owner` for owners and `user` for normal users. The frontend will automatically try to insert a profile row on registration if Supabase returns the newly-created user immediately.
- For production, consider using a server-side endpoint to safely assign `owner` roles (avoid client-side secret keys).

Seeding test data (convenient local script)

You can run a server-side seed script that will create test auth users (owners + a normal user), profiles, rooms and images. This requires the Supabase Service Role key (keep it secret).

Steps:
1. Copy `.env.example` to `.env` and set `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL`.
2. Run:

```bash
npm run seed
```

The script will create a few users and rooms and print a summary. Use this only for development/testing; never store your service role key in a repo or in client-side code.

Local dev:

1. Copy `.env.example` to `.env`
2. Set your Supabase values
3. npm install
4. npm run dev

Deploy: Vercel or Netlify — ensure env vars are set in the hosting provider.
