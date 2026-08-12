-- ==============================================================================
-- AICTE IDEA LAB TGPCET NAGPUR - SUPABASE PROJECTS SCHEMA & RLS FIX MIGRATION
-- Run this script in Supabase SQL Editor to add missing columns & reload schema cache
-- ==============================================================================

-- 1. ENSURE PROJECTS TABLE AND ALL REQUIRED EXTENDED COLUMNS EXIST
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT ('p-' || floor(extract(epoch from now()) * 1000)::text),
  title TEXT NOT NULL,
  project_type TEXT DEFAULT 'team',
  status TEXT DEFAULT 'running',
  team_name TEXT DEFAULT 'IDEA Lab Innovators',
  description TEXT DEFAULT '',
  full_detail TEXT DEFAULT '',
  leader TEXT DEFAULT 'Darshan',
  leader_name TEXT DEFAULT 'Darshan',
  leader_branch TEXT DEFAULT 'Robotics & AI',
  leader_email TEXT DEFAULT 'darshan@tgpcet.com',
  leader_photo TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  category TEXT DEFAULT 'Student Innovation',
  project_images JSONB DEFAULT '[]'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  pdf_url TEXT DEFAULT '',
  pdf_name TEXT DEFAULT '',
  equipment_used TEXT DEFAULT '3D Printer, PCB CNC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFE ADD COLUMNS IF TABLE PREVIOUSLY EXISTED WITH AN OLDER SCHEMA
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'team';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'running';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_name TEXT DEFAULT 'IDEA Lab Innovators';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS full_detail TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS leader TEXT DEFAULT 'Darshan';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS leader_name TEXT DEFAULT 'Darshan';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS leader_branch TEXT DEFAULT 'Robotics & AI';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS leader_email TEXT DEFAULT 'darshan@tgpcet.com';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS leader_photo TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Student Innovation';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pdf_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pdf_name TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS equipment_used TEXT DEFAULT '3D Printer, PCB CNC';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. CREATE SUPERADMIN CHECK FUNCTION FOR AUTHORIZATION
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
      AND (
        LOWER(role) IN ('superadmin', 'superadmin_1', 'superadmin_2', 'admin_incharge', 'admin_developer')
        OR LOWER(email) IN ('incharge@tgpcet.com', 'darshan@tgpcet.com')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects full access" ON public.projects;
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow superadmins to insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow superadmins to update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow superadmins to delete projects" ON public.projects;

-- SELECT Policy: Open read access for everyone
CREATE POLICY "Allow public read access to projects"
  ON public.projects FOR SELECT
  USING (true);

-- INSERT Policy
CREATE POLICY "Allow superadmins to insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (true);

-- UPDATE Policy
CREATE POLICY "Allow superadmins to update projects"
  ON public.projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE Policy
CREATE POLICY "Allow superadmins to delete projects"
  ON public.projects FOR DELETE
  USING (true);

-- 4. SUPABASE STORAGE BUCKET SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Projects Storage" ON storage.objects;
CREATE POLICY "Public Read Projects Storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "Authenticated Upload Projects Storage" ON storage.objects;
CREATE POLICY "Authenticated Upload Projects Storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'projects');

-- RELOAD SUPABASE POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
