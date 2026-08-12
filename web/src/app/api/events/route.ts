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
}

const DEFAULT_EVENTS: LabEvent[] = [
  {
    id: 'ev-1',
    title: '3D Printing & Additive Manufacturing Masterclass',
    category: 'Training',
    description: 'Hands-on SLA resin and FDM 3D printing workshop covering slicer optimization and nozzle maintenance.',
    date: 'August 15, 2026',
    trainer: 'Dr. Neeraj Waijode',
    seats: '30 Seats',
    status: 'Open for Registration',
  },
  {
    id: 'ev-2',
    title: '6-Axis Industrial Robotic Arm Trajectory Hackathon',
    category: 'Workshop',
    description: 'Learn robotic kinematics, motor payload balancing, and trajectory control on the industrial robotic arm.',
    date: 'August 22, 2026',
    trainer: 'Prof. M. B. Patil',
    seats: '20 Seats',
    status: 'Open for Registration',
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ success: true, events: data });
    }
  } catch (e: any) {
    console.error('[GET /api/events] Supabase fetch error:', e);
  }

  return NextResponse.json({ success: true, events: DEFAULT_EVENTS });
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

    const eventId = id ? String(id) : `ev-${Date.now()}`;

    const dbPayload = {
      id: eventId,
      title: title.trim(),
      category: category || 'Training',
      description: description ? description.trim() : '',
      date: date ? date.trim() : 'TBD',
      trainer: trainer ? trainer.trim() : 'Dr. Neeraj Waijode',
      seats: seats ? seats.trim() : '25 Seats',
      status: status || 'Open for Registration',
    };

    const { error: upsertErr } = await supabase.from('events').upsert([dbPayload], { onConflict: 'id' });
    if (upsertErr) {
      console.error('[POST /api/events] Supabase upsert error:', upsertErr);
      return NextResponse.json({ success: false, message: upsertErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Event saved to Supabase cloud database!',
      event: dbPayload,
      events: updatedList || [dbPayload],
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
        { success: false, message: 'Event ID is required.' },
        { status: 400 }
      );
    }

    const targetId = id.trim();
    const { error: delErr } = await supabase.from('events').delete().eq('id', targetId);
    if (delErr) {
      console.error('[DELETE /api/events] Supabase delete error:', delErr);
      return NextResponse.json({ success: false, message: delErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Event deleted from Supabase cloud database!',
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
