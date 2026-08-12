-- ==========================================
-- AICTE IDEA LAB TGPCET - SEED DATA
-- Safe to run in Supabase SQL Editor
-- ==========================================

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

-- 7. PROJECTS SEED
INSERT INTO public.projects (id, title, project_type, status, team_name, description, full_detail, leader, leader_name, leader_branch, leader_email, leader_photo, image_url, cover_image, category, project_images, tech_stack, team_members, pdf_url, pdf_name, equipment_used)
VALUES
(
    'proj-1',
    'Autonomous AI Inspection Rover',
    'team',
    'running',
    'IDEA Lab Innovators',
    '6-wheel rocker-bogie rover built with 6-Axis Robotic arm concepts and PCB design for industrial structural inspection.',
    'Developed at the AICTE IDEA LAB TGPCET, this autonomous rover utilizes ROS2, OpenCV, custom PCB motor controllers, and 3D printed structural mounts. Designed for hazardous pipe inspection and industrial monitoring.',
    'Darshan',
    'Darshan',
    'Robotics & AI',
    'darshan@tgpcet.ac.in',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80',
    'Student Innovation',
    '["https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["ROS2", "Python", "Fusion 360", "CNC PCB Machine", "3D Printing", "OpenCV"]'::jsonb,
    '[{"name": "Darshan", "role": "Project Lead & AI Engineer"}, {"name": "Aarav Mehta", "role": "PCB & Hardware Lead"}, {"name": "Priya Sharma", "role": "CAD Designer"}]'::jsonb,
    '',
    '',
    '3D Printer, PCB CNC, Oscilloscope'
),
(
    'proj-2',
    'Smart IoT Agriculture Monitoring System',
    'team',
    'running',
    'GreenTech Innovators',
    'Precision farming device fabricated with CNC PCB etching and wireless LoRa communication.',
    'Integrated soil moisture, thermal imaging, and automated fertigation system created in the IoT & PCB Cell. Features real-time cloud data visualization and smartphone telemetry.',
    'Neha Verma',
    'Neha Verma',
    'Electronics & Communication',
    'neha.v@tgpcet.ac.in',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    'Student Innovation',
    '["https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["ESP32", "LoRaWAN", "AutoCAD PCB", "Supabase", "React Native"]'::jsonb,
    '[{"name": "Neha Verma", "role": "IoT Engineer"}, {"name": "Rohan Gupta", "role": "Embedded C Developer"}]'::jsonb,
    '',
    '',
    'CNC IoT PCB Milling Machine, Soldering Station'
)
ON CONFLICT (id) DO NOTHING;

-- 8. GALLERY SEED
INSERT INTO public.gallery (id, title, caption, media_type, media_url, image_url, thumbnail_url, category)
VALUES
('gal-1', 'IDEA LAB Inauguration Ceremony', 'AICTE IDEA LAB Inauguration at TGPCET Campus with Chief Guests and Management.', 'photo', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', '', 'Event'),
('gal-2', 'National Hackathon Prototyping Workshop', 'Students utilizing 3D printers and CNC PCB machines during 48-Hour Hackathon.', 'photo', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', '', 'Workshop'),
('gal-3', '6-Axis Robotic Arm Live Demonstration', 'Dr. Neeraj Waijode presenting robotic automation capabilities to industrial delegates.', 'photo', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', '', 'Industrial Visit')
ON CONFLICT (id) DO NOTHING;

-- 9. NOTIFICATIONS SEED
INSERT INTO public.notifications (title, message, type)
VALUES
('Welcome to AICTE IDEA LAB TGPCET Platform', 'Explore our 5 state-of-the-art sections, apply for training programs, and submit your project proposals.', 'general'),
('Call for Student Project Applications 2026', 'Submit your project proposal PDF under the Apply section to get lab access, guidance, and funding support.', 'application');
