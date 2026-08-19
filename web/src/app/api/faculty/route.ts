import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { FacultyMember, LabInchargeProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const [{ data: inchargeData }, { data: facultyData }] = await Promise.all([
      supabase.from('lab_incharge').select('*').limit(1),
      supabase.from('faculty_members').select('*').order('display_order', { ascending: true }),
    ]);

    const incharge = inchargeData && inchargeData.length > 0 ? inchargeData[0] : null;
    const faculties = facultyData || [];

    return NextResponse.json({
      success: true,
      incharge,
      faculties,
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      message: e.message || 'Failed to fetch faculty data',
      incharge: null,
      faculties: [],
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
        photo_url: photo_url || '',
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
        faculties: facultyData || [],
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
      photo_url: photo_url || '',
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
      faculties: facultyData || [],
      incharge: inchargeData && inchargeData.length > 0 ? inchargeData[0] : null,
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
      incharge: inchargeData && inchargeData.length > 0 ? inchargeData[0] : null,
    });
  } catch (e: any) {
    console.error('[DELETE /api/faculty] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete faculty member.' },
      { status: 500 }
    );
  }
}
