import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface IdeaLabActivityRecord {
  id?: string;
  title: string;
  description?: string;
  type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  organizer?: string;
  registration_open?: boolean;
  registration_deadline?: string;
  max_participants?: number;
  status?: string;
  enrolled_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('all') === 'true';

    let query = supabase
      .from('idea_lab_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('status', 'published');
    }

    const { data: dbActivities, error } = await query;

    if (error) {
      // Graceful fallback to 'events' table if idea_lab_activities table is not yet migrated in Supabase
      const { data: evData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      const convertedEvents: IdeaLabActivityRecord[] = (evData || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        type: e.category ? e.category.toLowerCase() : 'training',
        date: e.date || 'TBD',
        venue: 'AICTE IDEA Lab, TGPCET',
        organizer: e.trainer || 'Dr. Neeraj Waijode',
        registration_open: e.status !== 'Closed',
        max_participants: e.seats ? parseInt(e.seats) || 50 : 50,
        status: 'published',
        created_at: e.created_at,
      }));

      return NextResponse.json({
        success: true,
        activities: convertedEvents,
      });
    }

    return NextResponse.json({
      success: true,
      activities: dbActivities || [],
    });
  } catch (e: any) {
    console.error('[GET /api/activities] Exception:', e);
    return NextResponse.json({ success: true, activities: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      type,
      date,
      start_time,
      end_time,
      venue,
      organizer,
      registration_open,
      registration_deadline,
      max_participants,
      status,
      created_by,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Activity title is required.' }, { status: 400 });
    }

    const activityId = id && String(id).trim() ? String(id).trim() : `act-${Date.now()}`;

    const payload: IdeaLabActivityRecord = {
      id: activityId,
      title: title.trim(),
      description: description ? description.trim() : '',
      type: type || 'training',
      date: date ? date.trim() : 'TBD',
      start_time: start_time || '',
      end_time: end_time || '',
      venue: venue || 'AICTE IDEA Lab, TGPCET',
      organizer: organizer || 'Dr. Neeraj Waijode',
      registration_open: registration_open !== undefined ? Boolean(registration_open) : true,
      registration_deadline: registration_deadline || null,
      max_participants: max_participants ? Number(max_participants) : 50,
      status: status || 'published',
      created_by: created_by || null,
      updated_at: new Date().toISOString(),
    };

    if (!id) {
      payload.created_at = new Date().toISOString();
    }

    // 1. Try upserting into idea_lab_activities
    const { data: savedData, error: upsertErr } = await supabase
      .from('idea_lab_activities')
      .upsert([payload], { onConflict: 'id' })
      .select();

    // 2. Dual-persist to events table as well to guarantee cross-table availability
    await supabase.from('events').upsert([{
      id: activityId,
      title: title.trim(),
      category: type || 'Training',
      description: description ? description.trim() : '',
      date: date ? date.trim() : 'TBD',
      trainer: organizer || 'Dr. Neeraj Waijode',
      seats: max_participants ? `${max_participants} Seats` : '50 Seats',
      status: registration_open ? 'Open for Registration' : 'Closed',
      created_at: payload.created_at || new Date().toISOString(),
    }], { onConflict: 'id' });

    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: id ? 'Training program updated successfully!' : 'Training program created successfully!',
      activity: savedData ? savedData[0] : payload,
      activities: updatedList || [],
    });
  } catch (e: any) {
    console.error('[POST /api/activities] Exception:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to save activity.' }, { status: 500 });
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
      return NextResponse.json({ success: false, message: 'Activity ID is required for deletion.' }, { status: 400 });
    }

    const targetId = id.trim();
    
    try {
      await supabase.from('idea_lab_activities').delete().eq('id', targetId);
    } catch (e) {}

    await supabase.from('events').delete().eq('id', targetId);

    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Training program deleted successfully!',
      activities: updatedList || [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/activities] Exception:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to delete activity.' }, { status: 500 });
  }
}
