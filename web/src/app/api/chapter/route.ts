import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ChapterMember } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DEFAULT_CHAPTER_MEMBERS: ChapterMember[] = [
  {
    id: 'c1',
    name: 'Darshan',
    role: 'Chief Student Innovator',
    branch: 'Computer Science & Engineering',
    category: 'leadership',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    linkedin_url: 'https://linkedin.com/in/darshan-drt',
    bio: 'Pioneering student innovation, autonomous rover development, and leading student prototyping teams across IDEA LAB.',
    display_order: 1,
  },
  {
    id: 'c2',
    name: 'Ananya Deshmukh',
    role: 'Head of Software Innovation',
    branch: 'Artificial Intelligence & DS',
    category: 'leadership',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    linkedin_url: 'https://linkedin.com/in/ananya-d',
    bio: 'Overseeing CAD/CAM simulation, full-stack web applications, and AI model integration.',
    display_order: 2,
  },
  {
    id: 'c3',
    name: 'Aditya Kulkarni',
    role: 'Head of Hardware & Prototyping',
    branch: 'Mechanical Engineering',
    category: 'leadership',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    linkedin_url: 'https://linkedin.com/in/aditya-k',
    bio: 'Specializing in 3D Printing, SLA Resin post-curing, and CNC heavy metal fabrication.',
    display_order: 3,
  },
  {
    id: 'c4',
    name: 'Saniya Khan',
    role: 'Event & Outreach Coordinator',
    branch: 'Information Technology',
    category: 'member',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    linkedin_url: 'https://linkedin.com/in/saniya-k',
    bio: 'Managing hackathons, industrial training workshops, and inter-college student delegations.',
    display_order: 4,
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('chapter_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ success: true, members: data });
    }
  } catch (e: any) {
    console.error('[GET /api/chapter] Supabase fetch error:', e);
  }

  return NextResponse.json({ success: true, members: DEFAULT_CHAPTER_MEMBERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, role, branch, category, photo_url, linkedin_url, bio, display_order } = body;

    if (!name || !name.trim() || !role || !role.trim()) {
      return NextResponse.json(
        { success: false, message: 'Member Name and Role/Title are required.' },
        { status: 400 }
      );
    }

    const memberId = id ? String(id) : `c-${Date.now()}`;

    const dbPayload = {
      id: memberId,
      name: name.trim(),
      role: role.trim(),
      branch: branch ? branch.trim() : 'Computer Science & Engineering',
      category: category || 'member',
      photo_url: photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      linkedin_url: linkedin_url ? linkedin_url.trim() : '',
      bio: bio ? bio.trim() : '',
      display_order: display_order !== undefined ? Number(display_order) : 99,
    };

    const { error: upsertErr } = await supabase.from('chapter_members').upsert([dbPayload], { onConflict: 'id' });
    if (upsertErr) {
      console.error('[POST /api/chapter] Supabase upsert error:', upsertErr);
      return NextResponse.json({ success: false, message: upsertErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('chapter_members')
      .select('*')
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Chapter member saved to Supabase cloud database!',
      member: dbPayload,
      members: updatedList || [dbPayload],
    });
  } catch (e: any) {
    console.error('[POST /api/chapter] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to save chapter member.' },
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
        { success: false, message: 'Member ID is required.' },
        { status: 400 }
      );
    }

    const targetId = id.trim();
    const { error: delErr } = await supabase.from('chapter_members').delete().eq('id', targetId);
    if (delErr) {
      console.error('[DELETE /api/chapter] Supabase delete error:', delErr);
      return NextResponse.json({ success: false, message: delErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('chapter_members')
      .select('*')
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Chapter member deleted from Supabase cloud database!',
      members: updatedList || [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/chapter] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete chapter member.' },
      { status: 500 }
    );
  }
}
