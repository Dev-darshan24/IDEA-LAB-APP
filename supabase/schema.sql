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
  education TEXT DEFAULT 'B.Tech', -- B.Tech, MBA, BCA, Other
  gender TEXT DEFAULT 'Male',
  address TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  role TEXT DEFAULT 'user', -- 'user', 'superadmin_1', 'superadmin_2'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMAIL OTPS TABLE (Stores hashed OTPs for registration, forgot_password, change_password)
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  hashed_otp TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'registration', 'forgot_password', 'change_password'
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email & purpose for high-performance OTP lookups
CREATE INDEX IF NOT EXISTS idx_email_otps_email_purpose ON public.email_otps (email, purpose);

-- 3. APPLICATIONS TABLE (Project proposals, equipment access & training registrations)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  applicant_name TEXT DEFAULT '',
  applicant_email TEXT DEFAULT '',
  education TEXT DEFAULT '',
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'project', 'training', 'event'
  description TEXT NOT NULL,
  pdf_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  incharge_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS TABLE (Showcased Student Innovation Prototypes)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  leader TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Robotics & AI', 'IoT & Embedded', 'Automation', etc.
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Completed',
  equipment_used TEXT DEFAULT '3D Printer, PCB CNC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE (Lab updates & announcements)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general', -- 'general', 'incharge', 'alert'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LAB EQUIPMENT TABLE (3D Printers, CNC, Robotic Arm, Laser Cutter status)
CREATE TABLE IF NOT EXISTS public.lab_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL, -- '3D Printing', 'PCB Design', 'Robotics', 'Machining'
  status TEXT DEFAULT 'Operational', -- 'Operational', 'Maintenance', 'Reserved'
  specifications TEXT DEFAULT ''
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & IDEMPOTENT POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_equipment ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin_2'));

-- Email OTPs RLS Policies (Controlled via service role and backend APIs)
DROP POLICY IF EXISTS "Email OTPs accessible by backend service." ON public.email_otps;
CREATE POLICY "Email OTPs accessible by backend service." ON public.email_otps FOR ALL USING (true);

-- Applications RLS Policies
DROP POLICY IF EXISTS "Users can view their own applications." ON public.applications;
DROP POLICY IF EXISTS "Users can insert applications." ON public.applications;
DROP POLICY IF EXISTS "Admins can manage applications." ON public.applications;

CREATE POLICY "Users can view their own applications." ON public.applications FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin_1', 'superadmin_2')));
CREATE POLICY "Users can insert applications." ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage applications." ON public.applications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin_1', 'superadmin_2')));

-- Projects RLS Policies
DROP POLICY IF EXISTS "Projects are viewable by everyone." ON public.projects;
CREATE POLICY "Projects are viewable by everyone." ON public.projects FOR SELECT USING (true);

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Notifications are viewable by everyone." ON public.notifications;
CREATE POLICY "Notifications are viewable by everyone." ON public.notifications FOR SELECT USING (true);

-- Lab Equipment RLS Policies
DROP POLICY IF EXISTS "Equipment status is viewable by everyone." ON public.lab_equipment;
CREATE POLICY "Equipment status is viewable by everyone." ON public.lab_equipment FOR SELECT USING (true);

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

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED INITIAL DATA (Featured Projects, Announcements & Lab Equipment)
-- ==============================================================================

INSERT INTO public.projects (title, leader, category, image_url, description, status) VALUES
('Autonomous AI Inspection Rover', 'Darshan (Chief Student Innovator)', 'Robotics & AI', 'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=800&q=80', '6-wheel rocker-bogie rover built with ROS2 and custom CNC-etched PCB motor drivers for hazardous inspection.', 'Completed'),
('Smart IoT Agriculture System', 'Neha Verma', 'IoT & Embedded', 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80', 'LoRaWAN precision farming soil moisture telemetry with cloud dashboard telemetry.', 'Completed'),
('6-DOF Robotic Arm Haptic Glove', 'Vikram Singh', 'Automation', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', 'Tele-operated strain-gauge haptic controller operating 6-axis industrial robotic arm.', 'Completed')
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (title, message, type) VALUES
('Welcome to AICTE IDEA LAB TGPCET', 'Explore our 5 technical sections, submit project proposals, and register for training workshops.', 'general'),
('Message from Lab Incharge Dr. Neeraj Waijode', 'Prototyping equipment calibration complete. All 5 sections are operational for innovation teams.', 'incharge')
ON CONFLICT DO NOTHING;

INSERT INTO public.lab_equipment (name, section, status, specifications) VALUES
('High Precision FDM 3D Printer Dual Extruder', '3D Printing & Prototyping', 'Operational', 'PLA/ABS 300x300x400mm build volume'),
('6-Axis Industrial Robotic Arm', 'Robotics & Automation', 'Operational', 'Payload 5kg, reach 850mm with gripper'),
('CNC Circuit Board PCB Etching Machine', 'IoT & PCB Design', 'Operational', 'Double sided FR4 milling 0.1mm trace'),
('CO2 Laser Cutter & Engraver 100W', 'Machining & Fabrication', 'Operational', '900x600mm bed acrylic/wood/leather')
ON CONFLICT DO NOTHING;
