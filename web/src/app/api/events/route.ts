import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface LabEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  trainer: string;
  seats: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/events] Supabase error:', error.message);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch events from database.', events: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, events: data || [] });
  } catch (e: any) {
    console.error('[GET /api/events] Exception:', e);
    return NextResponse.json(
      { success: false, message: 'Server error fetching events.', events: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, description, date, trainer, seats, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Event Title is required.' },
        { status: 400 }
      );
    }

    const eventId = id && String(id).trim() ? String(id).trim() : `ev-${Date.now()}`;

    const dbPayload: LabEvent = {
      id: eventId,
      title: title.trim(),
      category: category || 'Event',
      description: description ? description.trim() : '',
      date: date ? date.trim() : 'TBD',
      trainer: trainer ? trainer.trim() : 'Dr. Neeraj Waijode',
      seats: seats ? seats.trim() : '25 Seats',
      status: status || 'Open for Registration',
      updated_at: new Date().toISOString(),
    };

    if (!id) {
      dbPayload.created_at = new Date().toISOString();
    }

    // Persist directly to Supabase database (Single Source of Truth)
    const { data: savedData, error: upsertErr } = await supabase
      .from('events')
      .upsert([dbPayload], { onConflict: 'id' })
      .select();

    if (upsertErr) {
      console.error('[POST /api/events] Supabase error:', upsertErr.message);
      return NextResponse.json(
        { success: false, message: `Database error: ${upsertErr.message}` },
        { status: 500 }
      );
    }

    // Fetch updated list from Supabase
    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: id ? 'Event updated successfully!' : 'Event created successfully!',
      event: savedData ? savedData[0] : dbPayload,
      events: updatedList || [],
    });
  } catch (e: any) {
    console.error('[POST /api/events] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to save event.' },
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
        { success: false, message: 'Event ID is required for deletion.' },
        { status: 400 }
      );
    }

    const targetId = id.trim();
    const { error: deleteErr } = await supabase.from('events').delete().eq('id', targetId);

    if (deleteErr) {
      console.error('[DELETE /api/events] Supabase error:', deleteErr.message);
      return NextResponse.json(
        { success: false, message: `Failed to delete event: ${deleteErr.message}` },
        { status: 500 }
      );
    }

    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully from database!',
      events: updatedList || [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/events] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete event.' },
      { status: 500 }
    );
  }
}
