-- ==========================================
-- AICTE IDEA LAB SEED DATA
-- Tulsiramji Gaikwad Patil College of Engineering & Technology
-- ==========================================

-- 1. SECTIONS SEED
INSERT INTO public.sections (slug, title, subtitle, description, equipments, section_head, section_head_title, image_url)
VALUES
(
    'software-cell',
    'Software Cell',
    'High Performance Workstations & Prototyping Suites',
    'Equipped with high-performance computing systems hosting industry-standard tools including AutoCAD, Autodesk Fusion 360, VS Code, SolidWorks, and simulation frameworks.',
    '["High Performance Workstations", "AutoCAD Studio", "Autodesk Fusion 360", "VS Code IDE", "MATLAB & Simulink", "ANSYS Simulation Suite"]'::jsonb,
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
ON CONFLICT (slug) DO NOTHING;

-- 2. PROJECTS SEED
INSERT INTO public.projects (title, description, full_detail, leader_name, leader_email, team_members, cover_image, tech_stack)
VALUES
(
    'Autonomous AI Inspection Rover',
    '6-wheel rocker-bogie rover built with 6-Axis Robotic arm concepts and PCB design for industrial structural inspection.',
    'Developed at the AICTE IDEA LAB TGPCET, this autonomous rover utilizes ROS2, OpenCV, custom PCB motor controllers, and 3D printed structural mounts. Designed for hazardous pipe inspection and industrial monitoring.',
    'Darshan (Chief Student Innovator)',
    'darshan@tgpcet.ac.in',
    '[{"name": "Darshan", "role": "Project Lead & AI Engineer"}, {"name": "Aarav Mehta", "role": "PCB & Hardware Lead"}, {"name": "Priya Sharma", "role": "CAD Designer"}]'::jsonb,
    'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80',
    '["ROS2", "Python", "Fusion 360", "CNC PCB Machine", "3D Printing", "OpenCV"]'::jsonb
),
(
    'Smart IoT Agriculture Monitoring System',
    'Precision farming device fabricated with CNC PCB etching and wireless LoRa communication.',
    'Integrated soil moisture, thermal imaging, and automated fertigation system created in the IoT & PCB Cell. Features real-time cloud data visualization and smartphone telemetry.',
    'Neha Verma',
    'neha.v@tgpcet.ac.in',
    '[{"name": "Neha Verma", "role": "IoT Engineer"}, {"name": "Rohan Gupta", "role": "Embedded C Developer"}]'::jsonb,
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    '["ESP32", "LoRaWAN", "AutoCAD PCB", "Supabase", "React Native"]'::jsonb
),
(
    '6-DOF Robotic Arm Haptic Controller',
    'Custom tele-operated haptic feedback glove controlling the 6-Axis Industrial Robotic Arm.',
    'Allows intuitive manual remote manipulation of hazardous materials. Features custom 3D printed mechanical joints and strain-gauge force feedback sensors.',
    'Vikram Singh',
    'vikram.s@tgpcet.ac.in',
    '[{"name": "Vikram Singh", "role": "Robotics Lead"}, {"name": "Tanvi Rao", "role": "Mechatronics Engineer"}]'::jsonb,
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    ['6-Axis Arm', 'STM32', 'Fusion 360', 'Kinematics Solver']::jsonb
);

-- 3. GALLERY SEED
INSERT INTO public.gallery (title, caption, image_url, category)
VALUES
('IDEA LAB Inauguration Ceremony', 'AICTE IDEA LAB Inauguration at TGPCET Campus with Chief Guests and Management.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', 'Event'),
('National Hackathon 2026 Prototyping Workshop', 'Students utilizing 3D printers and CNC PCB machines during 48-Hour Hackathon.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', 'Workshop'),
('6-Axis Robotic Arm Live Demonstration', 'Dr. Neeraj Waijode presenting robotic automation capabilities to industrial delegates.', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', 'Industrial Visit'),
('Laser Cutting & Metal Fabrication Demo', 'Hands-on training session on precision CO2 laser cutter.', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80', 'Training');

-- 4. STUDENT INNOVATION CHAPTER SEED
INSERT INTO public.chapter_members (name, role, photo_url, linkedin_url, display_order)
VALUES
('Darshan', 'Chief Student Innovator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/darshan-drt', 1),
('Ananya Deshmukh', 'Head of Software Innovation', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/ananya-d', 2),
('Aditya Kulkarni', 'Head of Hardware & Prototyping', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/aditya-k', 3),
('Saniya Khan', 'Event & Outreach Coordinator', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'https://linkedin.com/in/saniya-k', 4);

-- 5. APP UPDATES SEED
INSERT INTO public.app_updates (title, content, tag)
VALUES
('Registration Open for Summer Prototyping Boot Camp 2026', 'Learn AutoCAD, 3D printing, and CNC machining in a 2-week hands-on intensive course at IDEA LAB.', 'Event'),
('New 6-Axis Robotic Arm Workshop Announced', 'Dr. Neeraj Waijode will conduct an interactive masterclass on industrial robotics on August 15, 2026.', 'Training'),
('Congratulations Team Rover for Winning AICTE National Innovation Award', 'Our Chief Student Innovator Darshan and team won 1st prize for Autonomous Inspection Rover!', 'Achievement');

-- 6. BROADCAST NOTIFICATIONS SEED
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
(NULL, 'Welcome to AICTE IDEA LAB TGPCET Platform', 'Explore our 5 state-of-the-art sections, apply for training programs, and submit your project proposals.', 'general'),
(NULL, 'Call for Student Project Applications 2026', 'Submit your project proposal PDF under the Apply section to get lab access, guidance, and funding support.', 'application');
