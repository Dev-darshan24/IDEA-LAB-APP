-- ==============================================================================
-- AICTE IDEA LAB TGPCET NAGPUR - PRODUCTION SUPABASE DATABASE SCHEMA
-- Shared backend supporting Next.js Web App & Flutter Mobile App
-- (Safe to run multiple times - idempotent table and policy definitions)
-- ==============================================================================

-- 1. PROFILES TABLE (Stores user & super admin details)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  college_id TEXT DEFAULT '',
  college_name TEXT DEFAULT 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
  profile_image TEXT DEFAULT '',
  education TEXT DEFAULT 'B.Tech',
  gender TEXT DEFAULT 'Male',
  address TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMAIL OTPS TABLE
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  hashed_otp TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON public.email_otps (email, purpose);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  applicant_name TEXT DEFAULT '',
  applicant_email TEXT DEFAULT '',
  education TEXT DEFAULT '',
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  pdf_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  incharge_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LAB EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS public.lab_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  status TEXT DEFAULT 'Operational',
  specifications TEXT DEFAULT ''
);

-- 7. GALLERY MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT DEFAULT '',
  media_type TEXT DEFAULT 'photo',
  media_url TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Event',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Training',
  description TEXT DEFAULT '',
  date TEXT DEFAULT 'TBD',
  trainer TEXT DEFAULT 'Dr. Neeraj Waijode',
  seats TEXT DEFAULT '25 Seats',
  status TEXT DEFAULT 'Open for Registration',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LAB SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.lab_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  equipments JSONB DEFAULT '[]'::jsonb,
  section_head TEXT DEFAULT '',
  section_head_title TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FACULTY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  dept TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. LAB INCHARGE PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.lab_incharge (
  id TEXT PRIMARY KEY DEFAULT 'incharge-main',
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  badge TEXT DEFAULT 'LAB INCHARGE & SUPERADMIN',
  message TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INNOVATION CHAPTER MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.chapter_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  branch TEXT DEFAULT 'Computer Science & Engineering',
  category TEXT DEFAULT 'member',
  photo_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SITE CONTACT DETAILS TABLE
CREATE TABLE IF NOT EXISTS public.site_contact (
  id TEXT PRIMARY KEY DEFAULT 'contact-main',
  email_primary TEXT NOT NULL,
  email_secondary TEXT DEFAULT '',
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT DEFAULT '',
  address TEXT NOT NULL,
  instagram_handle TEXT DEFAULT '@idealab_tgpcet',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  linkedin_handle TEXT DEFAULT 'LinkedIn',
  linkedin_url TEXT DEFAULT 'https://linkedin.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE RLS & FULL ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_incharge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_contact ENABLE ROW LEVEL SECURITY;

-- Permissive policies for web API operations
DROP POLICY IF EXISTS "Profiles full access" ON public.profiles;
CREATE POLICY "Profiles full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "OTPs full access" ON public.email_otps;
CREATE POLICY "OTPs full access" ON public.email_otps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Applications full access" ON public.applications;
CREATE POLICY "Applications full access" ON public.applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Projects full access" ON public.projects;
CREATE POLICY "Projects full access" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications full access" ON public.notifications;
CREATE POLICY "Notifications full access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Equipment full access" ON public.lab_equipment;
CREATE POLICY "Equipment full access" ON public.lab_equipment FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gallery full access" ON public.gallery;
CREATE POLICY "Gallery full access" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Events full access" ON public.events;
CREATE POLICY "Events full access" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Lab sections full access" ON public.lab_sections;
CREATE POLICY "Lab sections full access" ON public.lab_sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Faculty members full access" ON public.faculty_members;
CREATE POLICY "Faculty members full access" ON public.faculty_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Lab incharge full access" ON public.lab_incharge;
CREATE POLICY "Lab incharge full access" ON public.lab_incharge FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Chapter members full access" ON public.chapter_members;
CREATE POLICY "Chapter members full access" ON public.chapter_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Site contact full access" ON public.site_contact;
CREATE POLICY "Site contact full access" ON public.site_contact FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- AUTOMATED TRIGGER FOR NEW USER CREATION FROM AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    middle_name,
    last_name,
    phone,
    college_id,
    education,
    role
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'middle_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', 'Innovator'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'college_id', ''),
    COALESCE(new.raw_user_meta_data->>'education', 'B.Tech'),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
