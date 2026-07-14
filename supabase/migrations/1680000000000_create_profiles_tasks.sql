-- Migration: create profiles and tasks tables with RLS and policies
-- 1. Create enums
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- 2. Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  role text DEFAULT 'user' NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 255),
  description text,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date date,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Helper: allow admin via checking profiles role = 'admin' for the current jwt uid
-- Profiles: select
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Profiles: insert (allow creating your own profile when auth.uid() = new.id)
CREATE POLICY "profiles_insert_owner" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = new.id);

-- Profiles: update (owner or admin)
CREATE POLICY "profiles_update_owner_or_admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  ) WITH CHECK (
    auth.uid() = new.id
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tasks: select (owner or admin)
CREATE POLICY "tasks_select_owner_or_admin" ON public.tasks
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tasks: insert (only allow new.user_id to equal auth.uid() or admin)
CREATE POLICY "tasks_insert_owner_or_admin" ON public.tasks
  FOR INSERT WITH CHECK (
    new.user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tasks: update (owner or admin)
CREATE POLICY "tasks_update_owner_or_admin" ON public.tasks
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  ) WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tasks: delete (owner or admin)
CREATE POLICY "tasks_delete_owner_or_admin" ON public.tasks
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 6. Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Notes:
-- This migration assumes Supabase Auth is used and that auth.users exists.
-- Profiles.id is tied to auth.users.id. After sign-up, client should insert a profile row
-- with id = auth.user.id to establish the user profile (name, avatar_url, role).
-- Admins can be marked by setting profiles.role = 'admin'.
