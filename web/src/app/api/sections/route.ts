import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DEFAULT_SECTIONS = [
  {
    id: 'software-cell',
    title: 'Software Cell',
    subtitle: 'High Performance Workstations & Prototyping Suites',
    description: 'High-performance computing workstations hosting industry-standard tools including AutoCAD, Autodesk Fusion 360, VS Code, SolidWorks, and simulation frameworks.',
    equipments: ['Intel i9 RTX Workstations', 'AutoCAD Studio', 'Autodesk Fusion 360', 'VS Code IDE', 'MATLAB & Simulink'],
    section_head: 'Prof. A. K. Sharma',
    section_head_title: 'Head of Software Prototyping Cell',
    image_url: '',
  },
  {
    id: 'iot-pcb-design',
    title: 'IoT & PCB Design',
    subtitle: 'Embedded Systems & Automated PCB Prototyping',
    description: 'Specialized facility housing IoT microcontrollers, sensors, communication modules, and a CNC IoT PCB Milling and Etching machine for rapid circuit fabrication.',
    equipments: ['CNC IoT PCB Design Machine', 'Oscilloscopes & Logic Analyzers', 'Soldering Stations', 'ESP32 & STM32 Boards'],
    section_head: 'Dr. R. V. Deshmukh',
    section_head_title: 'Head of Embedded Systems & IoT',
    image_url: '',
  },
  {
    id: '3d-printing-prototyping',
    title: '3D Printing & Prototyping',
    subtitle: 'Additive Manufacturing & Rapid Modeling',
    description: 'Features dual industrial-grade 3D printers for high-precision additive manufacturing using PLA, ABS, PETG, and SLA resin materials.',
    equipments: ['Industrial Dual FDM 3D Printer', 'Precision Resin SLA 3D Printer', 'Handheld 3D Laser Scanner'],
    section_head: 'Prof. S. N. Kulkarni',
    section_head_title: 'Head of Additive Manufacturing',
    image_url: '',
  },
  {
    id: 'robotics-automation',
    title: 'Robotics & Automation',
    subtitle: 'Industrial Robotics & Precision CNC Machining',
    description: 'State-of-the-art facility featuring a 6-Axis Industrial Robotic Arm, CNC Lathe, and CNC Milling Machine for autonomous manufacturing research.',
    equipments: ['6-Axis Industrial Robotic Arm', 'CNC Milling Machine', 'Precision CNC Lathe Machine', 'PLC Trainer Kits'],
    section_head: 'Prof. M. B. Patil',
    section_head_title: 'Head of Robotics & Mechatronics',
    image_url: '',
  },
  {
    id: 'machining-fabrication',
    title: 'Machining & Fabrication',
    subtitle: 'Heavy Metalworking, Laser Cutting & CNC Routing',
    description: 'Includes heavy-duty metal fabrication tools, precision CO2 Laser Cutting Machine, CNC Router for wood/plastics/metals, and industrial lathe machines.',
    equipments: ['High Precision CO2 Laser Cutter', 'Heavy Duty CNC Router', 'Industrial Mechanical Lathe', 'MIG/TIG Welding'],
    section_head: 'Prof. V. P. Joshi',
    section_head_title: 'Head of Manufacturing & Fabrication',
    image_url: '',
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase.from('lab_sections').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ success: true, sections: data });
    }
  } catch (e: any) {
    console.error('[GET /api/sections] Supabase fetch error:', e);
  }

  return NextResponse.json({ success: true, sections: DEFAULT_SECTIONS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, description, equipments, section_head, section_head_title, image_url } = body;

    if (!id || !title) {
      return NextResponse.json(
        { success: false, message: 'Section ID and Title are required.' },
        { status: 400 }
      );
    }

    const sectionId = String(id).trim();
    const updatedSection = {
      id: sectionId,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      description: description ? description.trim() : '',
      equipments: Array.isArray(equipments) ? equipments : [],
      section_head: section_head ? section_head.trim() : '',
      section_head_title: section_head_title ? section_head_title.trim() : '',
      image_url: image_url || '',
    };

    const { error: upsertErr } = await supabase.from('lab_sections').upsert([updatedSection], { onConflict: 'id' });
    if (upsertErr) {
      console.error('[POST /api/sections] Supabase upsert error:', upsertErr);
      return NextResponse.json({ success: false, message: upsertErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase.from('lab_sections').select('*');

    return NextResponse.json({
      success: true,
      message: 'Section updated in Supabase cloud database!',
      section: updatedSection,
      sections: updatedList || DEFAULT_SECTIONS,
    });
  } catch (e: any) {
    console.error('[POST /api/sections] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to update section.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
