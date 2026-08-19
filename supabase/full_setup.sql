-- ==============================================================================
-- AICTE IDEA LAB TGPCET NAGPUR - COMPLETE SUPABASE SETUP SQL
-- Run this ENTIRE script in Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- Creates all 13 section tables, enables RLS security, grants privileges, and seeds data.
-- Safe to run multiple times (idempotent).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Stores user & super admin details)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. EMAIL OTPS TABLE (Authentication & Password resets)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. APPLICATIONS TABLE (Student project & idea applications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT DEFAULT 'project-form',
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_event_app UNIQUE (event_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. PROJECTS TABLE (Innovation projects showcase)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE (App & Admin notifications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. LAB EQUIPMENT TABLE (Equipment & Machinery inventory)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lab_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  status TEXT DEFAULT 'Operational',
  specifications TEXT DEFAULT ''
);

-- ------------------------------------------------------------------------------
-- 7. GALLERY MEDIA TABLE (Media & Photo Gallery)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 8. EVENTS TABLE (Workshops, Masterclasses, and Events)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 9. LAB SECTIONS TABLE (5 Core IDEA Lab Sections)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 10. FACULTY MEMBERS TABLE (Faculty & Section Mentors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  dept TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. LAB INCHARGE PROFILE TABLE (Lab Incharge Profile)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lab_incharge (
  id TEXT PRIMARY KEY DEFAULT 'incharge-main',
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  badge TEXT DEFAULT 'LAB INCHARGE & SUPERADMIN',
  message TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. INNOVATION CHAPTER MEMBERS TABLE (Student Chapter Team)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 13. SITE CONTACT DETAILS TABLE (Contact info & Social links)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 14. UPDATES TABLE (Announcement & Image Banner Updates Carousel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT DEFAULT 'UPDATES',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  badge_color TEXT DEFAULT 'sky',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. IDEA LAB ACTIVITIES TABLE (Training Programs & Workshops)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 16. PROJECT FORM SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_form_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  title_question TEXT NOT NULL DEFAULT 'What is your Innovation Project / Idea Title?',
  problem_question TEXT NOT NULL DEFAULT 'Describe the Problem Statement & Technical Challenge',
  description_question TEXT NOT NULL DEFAULT 'Detailed Project Abstract & Proposed Hardware/Software Solution',
  require_pdf_upload BOOLEAN DEFAULT true,
  eligibility_note TEXT DEFAULT 'Open for all student innovators & faculty teams at TGPCET AICTE IDEA LAB.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_applications_user_event ON public.applications (user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_events_status_created ON public.events (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, is_read);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY & PERMISSIVE POLICIES
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
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_lab_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_form_settings ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Updates full access" ON public.updates;
CREATE POLICY "Updates full access" ON public.updates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Activities full access" ON public.idea_lab_activities;
CREATE POLICY "Activities full access" ON public.idea_lab_activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Project form settings full access" ON public.project_form_settings;
CREATE POLICY "Project form settings full access" ON public.project_form_settings FOR ALL USING (true) WITH CHECK (true);

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

-- ==============================================================================
-- SEED INITIAL DATA FOR ALL SECTIONS
-- ==============================================================================

-- 1. LAB SECTIONS SEED
INSERT INTO public.lab_sections (id, title, subtitle, description, equipments, section_head, section_head_title, image_url)
VALUES
(
    'software-cell',
    'Software Cell',
    'High Performance Workstations & Prototyping Suites',
    'Equipped with high-performance computing systems hosting industry-standard tools including AutoCAD, Autodesk Fusion 360, VS Code, SolidWorks, and simulation frameworks.',
    '["Intel i9 RTX Workstations", "AutoCAD Studio", "Autodesk Fusion 360", "VS Code IDE", "MATLAB & Simulink", "ANSYS Simulation Suite"]'::jsonb,
    'Prof. A. K. Sharma',
    'Head of Software Prototyping Cell',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'
),
(
    'iot-pcb-design',
    'IoT & PCB Design',
    'Embedded Systems & Automated PCB Prototyping',
    'Specialized facility housing IoT microcontrollers, sensors, communication modules, and a CNC IoT PCB Milling and Etching machine for rapid circuit fabrication.',
    '["CNC IoT PCB Design Machine", "Oscilloscopes & Logic Analyzers", "Soldering & Desoldering Stations", "ESP32 & STM32 Development Boards", "RF Signal Generators"]'::jsonb,
    'Dr. R. V. Deshmukh',
    'Head of Embedded Systems & IoT',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
),
(
    '3d-printing-prototyping',
    '3D Printing & Prototyping',
    'Additive Manufacturing & Rapid Modeling',
    'Features dual industrial-grade 3D printers for high-precision additive manufacturing using PLA, ABS, PETG, and composite materials.',
    '["Industrial Dual 3D Printer 01 (FDM)", "Precision Resin 3D Printer 02 (SLA)", "3D Laser Scanner", "Filament Processing Unit"]'::jsonb,
    'Prof. S. N. Kulkarni',
    'Head of Additive Manufacturing',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
),
(
    'robotics-automation',
    'Robotics & Automation',
    'Industrial Robotics & Precision CNC Machining',
    'State-of-the-art facility featuring a 6-Axis Robotic Arm, CNC Lathe, and CNC Milling Machine for autonomous manufacturing research and industrial training.',
    '["6-Axis Industrial Robotic Arm", "CNC Milling Machine", "Precision CNC Lathe Machine", "PLC & Automation Trainer Kits", "Pneumatic & Hydraulic Rig"]'::jsonb,
    'Prof. M. B. Patil',
    'Head of Robotics & Mechatronics',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
),
(
    'machining-fabrication',
    'Machining & Fabrication',
    'Heavy Metalworking, Laser Cutting & CNC Routing',
    'Includes heavy-duty metal fabrication tools, precision CO2 Laser Cutting Machine, CNC Router for wood/plastics/metals, and traditional Lathe Machines.',
    '["High Precision CO2 Laser Cutter", "Heavy Duty CNC Router Machine", "Precision Industrial Lathe", "Hydraulic Sheet Metal Cutter", "MIG/TIG Welding Station"]'::jsonb,
    'Prof. V. P. Joshi',
    'Head of Manufacturing & Fabrication',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  equipments = EXCLUDED.equipments,
  section_head = EXCLUDED.section_head,
  section_head_title = EXCLUDED.section_head_title,
  image_url = EXCLUDED.image_url;

-- 2. EVENTS SEED
INSERT INTO public.events (id, title, category, description, date, trainer, seats, status)
VALUES
(
    'ev-1',
    '3D Printing & Additive Manufacturing Masterclass',
    'Training',
    'Hands-on SLA resin and FDM 3D printing workshop covering slicer optimization and nozzle maintenance.',
    'August 15, 2026',
    'Dr. Neeraj Waijode',
    '30 Seats',
    'Open for Registration'
),
(
    'ev-2',
    '6-Axis Industrial Robotic Arm Trajectory Hackathon',
    'Workshop',
    'Learn robotic kinematics, motor payload balancing, and trajectory control on the industrial robotic arm.',
    'August 22, 2026',
    'Prof. M. B. Patil',
    '20 Seats',
    'Open for Registration'
)
ON CONFLICT (id) DO NOTHING;

-- 3. LAB INCHARGE SEED
INSERT INTO public.lab_incharge (id, name, title, badge, message, photo_url)
VALUES
(
    'incharge-main',
    'Dr. Neeraj Waijode',
    'Head & Coordinator, AICTE IDEA LAB • TGPCET',
    'LAB INCHARGE & SUPERADMIN',
    '"Our mission is to bridge the gap between academic theory and physical hardware prototyping. We welcome all students to leverage our 3D printers, CNC PCB machines, laser cutters, and 6-axis robotic arms."',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  badge = EXCLUDED.badge,
  message = EXCLUDED.message,
  photo_url = EXCLUDED.photo_url;

-- 4. FACULTY MEMBERS SEED
INSERT INTO public.faculty_members (id, name, role, dept, photo_url, display_order)
VALUES
('f1', 'Dr. Neeraj Waijode', 'Incharge, AICTE IDEA LAB', 'Mechanical Engineering', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80', 1),
('f2', 'Prof. A. K. Sharma', 'Section Head', 'Software Cell', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80', 2),
('f3', 'Dr. R. V. Deshmukh', 'Section Head', 'IoT & PCB Design', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 3),
('f4', 'Prof. S. N. Kulkarni', 'Section Head', '3D Printing & Prototyping', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80', 4),
('f5', 'Prof. M. B. Patil', 'Section Head', 'Robotics & Automation', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 5),
('f6', 'Prof. V. P. Joshi', 'Section Head', 'Machining & Fabrication', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 6)
ON CONFLICT (id) DO NOTHING;

-- 5. CHAPTER MEMBERS SEED
INSERT INTO public.chapter_members (id, name, role, branch, category, photo_url, linkedin_url, bio, display_order)
VALUES
('c1', 'Darshan', 'Chief Student Innovator', 'Computer Science & Engineering', 'leadership', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/darshan-drt', 'Pioneering student innovation, autonomous rover development, and leading student prototyping teams across IDEA LAB.', 1),
('c2', 'Ananya Deshmukh', 'Head of Software Innovation', 'Artificial Intelligence & DS', 'leadership', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/ananya-d', 'Overseeing CAD/CAM simulation, full-stack web applications, and AI model integration.', 2),
('c3', 'Aditya Kulkarni', 'Head of Hardware & Prototyping', 'Mechanical Engineering', 'leadership', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/aditya-k', 'Specializing in 3D Printing, SLA Resin post-curing, and CNC heavy metal fabrication.', 3),
('c4', 'Saniya Khan', 'Event & Outreach Coordinator', 'Information Technology', 'member', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/saniya-k', 'Managing hackathons, industrial training workshops, and inter-college student delegations.', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. SITE CONTACT SEED
INSERT INTO public.site_contact (id, email_primary, email_secondary, phone_primary, phone_secondary, address, instagram_handle, instagram_url, linkedin_handle, linkedin_url)
VALUES
(
    'contact-main',
    'idealab@tgpcet.com',
    'support.idealab@tgpcet.com',
    '+91 712 2810001',
    '+91 9876543210',
    'AICTE IDEA LAB, TGPCET Campus, Mohgaon, Wardha Road, Nagpur, Maharashtra - 441108',
    '@idealab_tgpcet',
    'https://instagram.com',
    'LinkedIn',
    'https://linkedin.com'
)
ON CONFLICT (id) DO UPDATE SET
  email_primary = EXCLUDED.email_primary,
  email_secondary = EXCLUDED.email_secondary,
  phone_primary = EXCLUDED.phone_primary,
  phone_secondary = EXCLUDED.phone_secondary,
  address = EXCLUDED.address,
  instagram_handle = EXCLUDED.instagram_handle,
  instagram_url = EXCLUDED.instagram_url,
  linkedin_handle = EXCLUDED.linkedin_handle,
  linkedin_url = EXCLUDED.linkedin_url;

-- 7. UPDATES SEED
INSERT INTO public.updates (id, title, tag, description, image_url, link_url, badge_color, is_active, display_order, updated_at)
VALUES
(
    'upd-1786766035324',
    'Independence Day',
    '15 AUGUST',
    'Celebrating 80th Independence Day at TGPCET AICTE IDEA LAB with student innovations & prototypes.',
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
    '/gallery',
    'sky',
    true,
    1,
    '2026-08-15T03:53:55.324Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tag = EXCLUDED.tag,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  badge_color = EXCLUDED.badge_color,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

-- Reload schema cache in Supabase PostgREST API
NOTIFY pgrst, 'reload schema';
