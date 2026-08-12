import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface ActivityApplicationRecord {
  id?: string;
  activity_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  department?: string;
  branch?: string;
  year?: string;
  roll_number?: string;
  status?: string;
  admin_comments?: string;
  applied_at?: string;
  updated_at?: string;
  activity_title?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const all = searchParams.get('all');

    let query = supabase.from('activity_applications').select('*').order('applied_at', { ascending: false });

    if (userId && all !== 'true') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/activity-applications] Error:', error);
      if (error.code === '42P01' || error.message.includes('relation')) {
        return NextResponse.json({ success: true, applications: [] });
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      applications: data || [],
    });
  } catch (e: any) {
    console.error('[GET /api/activity-applications] Exception:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch activity applications.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      activity_id,
      user_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      department,
      branch,
      year,
      roll_number,
    } = body;

    if (!activity_id || !user_id) {
      return NextResponse.json(
        { success: false, message: 'Activity ID and User ID are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch Target Activity Details to check status and participant limit
    const { data: activityList } = await supabase
      .from('idea_lab_activities')
      .select('*')
      .eq('id', activity_id);

    const activity = activityList && activityList.length > 0 ? activityList[0] : null;

    if (activity) {
      if (activity.registration_open === false || activity.status === 'closed') {
        return NextResponse.json(
          { success: false, message: 'Registration for this activity is closed.' },
          { status: 400 }
        );
      }

      if (activity.registration_deadline) {
        const deadline = new Date(activity.registration_deadline).getTime();
        if (Date.now() > deadline) {
          return NextResponse.json(
            { success: false, message: 'The registration deadline for this activity has passed.' },
            { status: 400 }
          );
        }
      }
    }

    // 2. Check Database Participant Limit Count
    const { count: currentCount } = await supabase
      .from('activity_applications')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activity_id);

    const maxLimit = activity?.max_participants || 50;
    if (currentCount !== null && currentCount >= maxLimit) {
      return NextResponse.json(
        { success: false, message: 'Maximum participant limit has been reached for this activity.' },
        { status: 400 }
      );
    }

    // 3. Unique Constraint Check: Check if User already applied
    const { data: existingApp } = await supabase
      .from('activity_applications')
      .select('id')
      .eq('user_id', user_id)
      .eq('activity_id', activity_id);

    if (existingApp && existingApp.length > 0) {
      return NextResponse.json(
        {
          success: false,
          isDuplicate: true,
          message: 'You have already applied for this activity.',
        },
        { status: 400 }
      );
    }

    // 4. Insert Application into Supabase Database
    const payload = {
      id: crypto.randomUUID(),
      activity_id,
      user_id,
      applicant_name: applicant_name || 'Participant',
      applicant_email: applicant_email || '',
      applicant_phone: applicant_phone || '',
      department: department || branch || 'Engineering',
      branch: branch || 'Robotics & AI',
      year: year || 'Final Year',
      roll_number: roll_number || '',
      status: 'submitted',
      admin_comments: '',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('activity_applications').insert([payload]).select();

    if (error) {
      console.error('[POST /api/activity-applications] Insert error:', error);
      if (error.code === '23505' || error.message.includes('unique')) {
        return NextResponse.json(
          { success: false, isDuplicate: true, message: 'You have already applied for this activity.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your application for this activity has been submitted successfully!',
      application: data ? data[0] : payload,
    });
  } catch (e: any) {
    console.error('[POST /api/activity-applications] Exception:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to submit application.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, admin_comments } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (admin_comments !== undefined) updatePayload.admin_comments = admin_comments;

    const { data, error } = await supabase
      .from('activity_applications')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[PATCH /api/activity-applications] Update error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully!',
      application: data ? data[0] : null,
    });
  } catch (e: any) {
    console.error('[PATCH /api/activity-applications] Exception:', e);
    return NextResponse.json({ success: false, message: 'Failed to update application.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('activity_applications').delete().eq('id', id);
    if (error) {
      console.error('[DELETE /api/activity-applications] Delete error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Application deleted successfully.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete application.' }, { status: 500 });
  }
}
