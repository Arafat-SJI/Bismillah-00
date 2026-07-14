# TaskFlow - Team Task Management (Seeded)

This project is a Vite + React frontend backed by Supabase (Auth + Postgres). It implements a small team task management app (TaskFlow) with user auth, tasks CRUD, profile management, and basic notifications.

Setup (local)
1. Install dependencies
   npm install

2. Copy environment variables
   cp .env.example .env
   Fill in:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY

3. Start Supabase locally or use a Supabase project.
   - To apply database schema changes, run the Supabase migration(s) included in `supabase/migrations/` using your preferred Supabase CLI:
     supabase db push
   - Alternatively, run the SQL in `supabase/migrations/1680000000000_create_profiles_tasks.sql` in your Supabase SQL editor.

4. Run the dev server
   npm run dev

Implementation notes
- Authentication: Supabase Auth is used. After sign-up, the client inserts a `profiles` row (id = auth.user.id). This follows the common Supabase pattern rather than storing passwords in a profiles table.
- DB model: We create `profiles` (linked to auth.users) and `tasks`. RLS policies enforce owner-only access while allowing admins (profiles.role = 'admin') to access all data.
- Profile image: For simplicity the profile image is stored as a small base64 data URL in `profiles.avatar_url`. For production use, replace this with Supabase Storage uploads and store the public URL in the profile.
- Notifications: In-app toast notifications are provided via `sonner` for task create/update/delete actions.
- Rate limiting and advanced abuse protection are out-of-scope at this stage. Public writes are guarded by RLS and Supabase Auth.
- Route guard: Protected routes redirect unauthenticated users to the login page and return them to their original destination after login.
- Four UI states: Each page implements loading, empty, error, and populated states where applicable (dashboard, profile, tasks).

Notes / Known gaps
- This starter assumes a Supabase project with Auth enabled. Ensure you've created the project and applied migrations.
- The `avatars` bucket is not used; file uploads are stored inline as base64 in the DB for simplicity. Replace with Storage for larger images.
- For admin operations, set `profiles.role = 'admin'` manually in the database for a user.
