import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface IdeaLabActivityRecord {
  id?: string;
  title: string;
  description?: string;
  type?: string; // training, workshop, activity, event, seminar, guest_lecture, competition, other
  date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  organizer?: string;
  registration_open?: boolean;
  registration_deadline?: string;
  max_participants?: number;
  status?: string; // published, unpublished, closed
  enrolled_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

const SEED_ACTIVITIES: IdeaLabActivityRecord[] = [
  {
    id: 'act-3d-printing-bootcamp',
    title: '3D Printing & Additive Manufacturing Bootcamp',
    description: 'Master SLA resin and FDM 3D printers, slicer software, STL geometry fixing, and high-precision prototyping.',
    type: 'training',
    date: 'August 20, 2026',
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    venue: 'AICTE IDEA Lab, TGPCET Main Building',
    organizer: 'Dr. Neeraj Waijode',
    registration_open: true,
    max_participants: 30,
    status: 'published',
  },
  {
    id: 'act-robotic-arm-workshop',
    title: '6-Axis Industrial Robotic Arm Trajectory Workshop',
    description: 'Hands-on programming of 6-axis robotic arm kinematics, payload balancing, ROS2 trajectory planning, and gripper end-effectors.',
    type: 'workshop',
    date: 'August 25, 2026',
    start_time: '11:00 AM',
    end_time: '03:00 PM',
    venue: 'Robotics & AI Bay, IDEA Lab',
    organizer: 'Prof. M. B. Patil',
    registration_open: true,
    max_participants: 25,
    status: 'published',
  },
  {
    id: 'act-pcb-cnc-milling',
    title: 'PCB CNC Router & Rapid Prototyping Workshop',
    description: 'Learn Gerber file export, double-sided PCB milling, solder masking, and automated Pick & Place surface mounting.',
    type: 'workshop',
    date: 'September 02, 2026',
    start_time: '10:30 AM',
    end_time: '04:30 PM',
    venue: 'Electronics Prototyping Studio, IDEA Lab',
    organizer: 'IDEA Lab Technical Team',
    registration_open: true,
    max_participants: 20,
    status: 'published',
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('all') === 'true';

    let query = supabase.from('idea_lab_activities').select('*').order('created_at', { ascending: false });
    if (!includeUnpublished) {
      query = query.eq('status', 'published');
    }

    const { data: dbActivities, error } = await query;

    let activitiesList: IdeaLabActivityRecord[] = [];

    if (error || !dbActivities || dbActivities.length === 0) {
      // Return seed activities if table is newly created or empty
      activitiesList = SEED_ACTIVITIES;
    } else {
      activitiesList = dbActivities;
    }

    // Attach current enrolled application counts for each activity
    try {
      const { data: countsData } = await supabase.from('activity_applications').select('activity_id');
      if (Array.isArray(countsData)) {
        const countsMap: Record<string, number> = {};
        countsData.forEach((row) => {
          if (row.activity_id) {
            countsMap[row.activity_id] = (countsMap[row.activity_id] || 0) + 1;
          }
        });

        activitiesList = activitiesList.map((act) => ({
          ...act,
          enrolled_count: countsMap[act.id || ''] || 0,
        }));
      }
    } catch (countErr) {}

    return NextResponse.json({
      success: true,
      activities: activitiesList,
    });
  } catch (e: any) {
    console.error('[GET /api/activities] Exception:', e);
    return NextResponse.json({ success: true, activities: SEED_ACTIVITIES });
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

    const activityId = id ? String(id) : crypto.randomUUID();

    const payload = {
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

    const { data, error } = await supabase.from('idea_lab_activities').upsert([payload], { onConflict: 'id' }).select();

    if (error) {
      console.error('[POST /api/activities] Supabase upsert error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity saved successfully!',
      activity: data ? data[0] : payload,
    });
  } catch (e: any) {
    console.error('[POST /api/activities] Exception:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to save activity.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Activity ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('idea_lab_activities').delete().eq('id', id);
    if (error) {
      console.error('[DELETE /api/activities] Supabase delete error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Activity deleted successfully.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete activity.' }, { status: 500 });
  }
}
