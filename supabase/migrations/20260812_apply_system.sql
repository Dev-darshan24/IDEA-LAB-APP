-- ==========================================================
-- SUPABASE MIGRATION SCRIPT: COMPLETE APPLY SYSTEM
-- Tables: project_proposals, idea_lab_activities, activity_applications
-- Storage: project-proposals bucket
-- RLS Policies & Unique Constraints
-- ==========================================================

-- 1. CREATE PROJECT PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS public.project_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    college_institution TEXT,
    department TEXT,
    branch TEXT,
    year TEXT,
    roll_number TEXT,
    project_name TEXT NOT NULL,
    project_description TEXT NOT NULL,
    problem_statement TEXT,
    objective TEXT,
    document_path TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    admin_comments TEXT DEFAULT '',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE IDEA LAB ACTIVITIES / EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.idea_lab_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'training',
    date TEXT DEFAULT 'TBD',
    start_time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    venue TEXT DEFAULT 'AICTE IDEA Lab, TGPCET',
    organizer TEXT DEFAULT 'Dr. Neeraj Waijode',
    registration_open BOOLEAN DEFAULT true,
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER DEFAULT 50,
    status TEXT DEFAULT 'published',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE ACTIVITY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.activity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.idea_lab_activities(id) ON DELETE CASCADE,
    user_id UUID,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    department TEXT,
    branch TEXT,
    year TEXT,
    roll_number TEXT,
    status TEXT DEFAULT 'submitted',
    admin_comments TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_activity UNIQUE (user_id, activity_id)
);

-- Indexing for high-performance querying
CREATE INDEX IF NOT EXISTS idx_project_proposals_user ON public.project_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_applications_user ON public.activity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_applications_activity ON public.activity_applications(activity_id);
CREATE INDEX IF NOT EXISTS idx_idea_lab_activities_status ON public.idea_lab_activities(status, registration_open);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_lab_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_applications ENABLE ROW LEVEL SECURITY;

-- Project Proposals Policies
DROP POLICY IF EXISTS "Public select project proposals" ON public.project_proposals;
CREATE POLICY "Public select project proposals" ON public.project_proposals
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert project proposals" ON public.project_proposals;
CREATE POLICY "Public insert project proposals" ON public.project_proposals
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update project proposals" ON public.project_proposals;
CREATE POLICY "Public update project proposals" ON public.project_proposals
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete project proposals" ON public.project_proposals;
CREATE POLICY "Public delete project proposals" ON public.project_proposals
    FOR DELETE USING (true);

-- Activities Policies
DROP POLICY IF EXISTS "Public select activities" ON public.idea_lab_activities;
CREATE POLICY "Public select activities" ON public.idea_lab_activities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public modify activities" ON public.idea_lab_activities;
CREATE POLICY "Public modify activities" ON public.idea_lab_activities
    FOR ALL USING (true);

-- Activity Applications Policies
DROP POLICY IF EXISTS "Public select activity apps" ON public.activity_applications;
CREATE POLICY "Public select activity apps" ON public.activity_applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert activity apps" ON public.activity_applications;
CREATE POLICY "Public insert activity apps" ON public.activity_applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update activity apps" ON public.activity_applications;
CREATE POLICY "Public update activity apps" ON public.activity_applications
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete activity apps" ON public.activity_applications;
CREATE POLICY "Public delete activity apps" ON public.activity_applications
    FOR DELETE USING (true);

-- 5. STORAGE BUCKET CONFIGURATION FOR PROPOSALS
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-proposals', 'project-proposals', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
