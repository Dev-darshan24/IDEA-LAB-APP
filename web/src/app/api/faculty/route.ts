import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { FacultyMember, LabInchargeProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DEFAULT_LAB_INCHARGE: LabInchargeProfile = {
  name: 'Dr. Neeraj Waijode',
  title: 'Head & Coordinator, AICTE IDEA LAB • TGPCET',
  badge: 'LAB INCHARGE & SUPERADMIN',
  message: '"Our mission is to bridge the gap between academic theory and physical hardware prototyping. We welcome all students to leverage our 3D printers, CNC PCB machines, laser cutters, and 6-axis robotic arms."',
  photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'f1',
    name: 'Dr. Neeraj Waijode',
    role: 'Incharge, AICTE IDEA LAB',
    dept: 'Mechanical Engineering',
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    display_order: 1,
  },
  {
    id: 'f2',
    name: 'Prof. A. K. Sharma',
    role: 'Section Head',
    dept: 'Software Cell',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    display_order: 2,
  },
  {
    id: 'f3',
    name: 'Dr. R. V. Deshmukh',
    role: 'Section Head',
    dept: 'IoT & PCB Design',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    display_order: 3,
  },
  {
    id: 'f4',
    name: 'Prof. S. N. Kulkarni',
    role: 'Section Head',
    dept: '3D Printing & Prototyping',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    display_order: 4,
  },
  {
    id: 'f5',
    name: 'Prof. M. B. Patil',
    role: 'Section Head',
    dept: 'Robotics & Automation',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    display_order: 5,
  },
  {
    id: 'f6',
    name: 'Prof. V. P. Joshi',
    role: 'Section Head',
    dept: 'Machining & Fabrication',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    display_order: 6,
  },
];

export async function GET() {
  try {
    const { data: inchargeData } = await supabase.from('lab_incharge').select('*').limit(1);
    const { data: facultyData } = await supabase.from('faculty_members').select('*').order('display_order', { ascending: true });

    const incharge = inchargeData && inchargeData.length > 0 ? inchargeData[0] : DEFAULT_LAB_INCHARGE;
    const faculties = facultyData && facultyData.length > 0 ? facultyData : DEFAULT_FACULTY_MEMBERS;

    return NextResponse.json({
      success: true,
      incharge,
      faculties,
    });
  } catch (e: any) {
    return NextResponse.json({
      success: true,
      incharge: DEFAULT_LAB_INCHARGE,
      faculties: DEFAULT_FACULTY_MEMBERS,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if updating Lab Incharge profile
    if (body.type === 'incharge' || body.action === 'update_incharge' || body.incharge_update) {
      const { name, title, badge, message, photo_url } = body;

      if (!name || !title) {
        return NextResponse.json(
          { success: false, message: 'Incharge Name and Title are required.' },
          { status: 400 }
        );
      }

      const updatedIncharge = {
        id: 'incharge-main',
        name: name.trim(),
        title: title.trim(),
        badge: badge ? badge.trim() : 'LAB INCHARGE & SUPERADMIN',
        message: message ? message.trim() : '',
        photo_url: photo_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
      };

      const { error: incErr } = await supabase.from('lab_incharge').upsert([updatedIncharge], { onConflict: 'id' });
      if (incErr) {
        console.error('[POST /api/faculty] Supabase incharge error:', incErr);
        return NextResponse.json({ success: false, message: incErr.message }, { status: 500 });
      }

      const { data: facultyData } = await supabase.from('faculty_members').select('*').order('display_order', { ascending: true });

      return NextResponse.json({
        success: true,
        message: 'Lab Incharge profile updated on Supabase cloud database!',
        incharge: updatedIncharge,
        faculties: facultyData || DEFAULT_FACULTY_MEMBERS,
      });
    }

    // Otherwise updating or adding a Faculty Member
    const { id, name, role, dept, photo_url, display_order } = body;

    if (!name || !role || !dept) {
      return NextResponse.json(
        { success: false, message: 'Faculty Name, Role, and Department are required.' },
        { status: 400 }
      );
    }

    const facultyId = id ? String(id) : `f-${Date.now()}`;
    const updatedFaculty = {
      id: facultyId,
      name: name.trim(),
      role: role.trim(),
      dept: dept.trim(),
      photo_url: photo_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
      display_order: display_order !== undefined ? Number(display_order) : 99,
    };

    const { error: facErr } = await supabase.from('faculty_members').upsert([updatedFaculty], { onConflict: 'id' });
    if (facErr) {
      console.error('[POST /api/faculty] Supabase faculty error:', facErr);
      return NextResponse.json({ success: false, message: facErr.message }, { status: 500 });
    }

    const { data: inchargeData } = await supabase.from('lab_incharge').select('*').limit(1);
    const { data: facultyData } = await supabase.from('faculty_members').select('*').order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Faculty member saved to Supabase cloud database!',
      faculty: updatedFaculty,
      faculties: facultyData || DEFAULT_FACULTY_MEMBERS,
      incharge: inchargeData && inchargeData.length > 0 ? inchargeData[0] : DEFAULT_LAB_INCHARGE,
    });
  } catch (e: any) {
    console.error('[POST /api/faculty] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to save faculty details.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return NextResponse.json(
        { success: false, message: 'Faculty ID is required.' },
        { status: 400 }
      );
    }

    const targetId = id.trim();
    const { error: delErr } = await supabase.from('faculty_members').delete().eq('id', targetId);
    if (delErr) {
      console.error('[DELETE /api/faculty] Supabase delete error:', delErr);
      return NextResponse.json({ success: false, message: delErr.message }, { status: 500 });
    }

    const { data: inchargeData } = await supabase.from('lab_incharge').select('*').limit(1);
    const { data: facultyData } = await supabase.from('faculty_members').select('*').order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Faculty member deleted from Supabase cloud database!',
      faculties: facultyData || [],
      incharge: inchargeData && inchargeData.length > 0 ? inchargeData[0] : DEFAULT_LAB_INCHARGE,
    });
  } catch (e: any) {
    console.error('[DELETE /api/faculty] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete faculty member.' },
      { status: 500 }
    );
  }
}
