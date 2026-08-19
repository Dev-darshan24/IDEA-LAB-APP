-- ==============================================================================
-- AICTE IDEA LAB NAGPUR - SUPERADMIN APPLY BUTTON EDIT DATABASE SCHEMA & MIGRATION
-- Tables: events, idea_lab_activities, project_form_settings
-- Full RLS Security & Permissions Setup
-- ==============================================================================

-- 1. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Training',
  description TEXT DEFAULT '',
  date TEXT DEFAULT 'TBD',
  trainer TEXT DEFAULT '',
  seats TEXT DEFAULT '25 Seats',
  status TEXT DEFAULT 'Open for Registration',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IDEA LAB ACTIVITIES TABLE (Training Programs & Workshops)
CREATE TABLE IF NOT EXISTS public.idea_lab_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'training',
  date TEXT DEFAULT 'TBD',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  venue TEXT DEFAULT 'AICTE IDEA Lab, TGPCET',
  organizer TEXT DEFAULT '',
  registration_open BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 50,
  status TEXT DEFAULT 'published',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECT FORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.project_form_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  title_question TEXT NOT NULL DEFAULT 'What is your Innovation Project / Idea Title?',
  problem_question TEXT NOT NULL DEFAULT 'Describe the Problem Statement & Technical Challenge',
  description_question TEXT NOT NULL DEFAULT 'Detailed Project Abstract & Proposed Hardware/Software Solution',
  require_pdf_upload BOOLEAN DEFAULT true,
  eligibility_note TEXT DEFAULT 'Open for all student innovators & faculty teams at TGPCET AICTE IDEA LAB.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_lab_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_form_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Events full access" ON public.events;
CREATE POLICY "Events full access" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Activities full access" ON public.idea_lab_activities;
CREATE POLICY "Activities full access" ON public.idea_lab_activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project form settings full access" ON public.project_form_settings;
CREATE POLICY "Project form settings full access" ON public.project_form_settings FOR ALL USING (true) WITH CHECK (true);

-- GRANT ALL PRIVILEGES TO anon, authenticated, AND service_role
GRANT ALL ON public.events TO anon, authenticated, service_role;
GRANT ALL ON public.idea_lab_activities TO anon, authenticated, service_role;
GRANT ALL ON public.project_form_settings TO anon, authenticated, service_role;

-- RELOAD SCHEMA CACHE IN POSTGREST API
NOTIFY pgrst, 'reload schema';
