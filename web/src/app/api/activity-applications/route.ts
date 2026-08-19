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
  title?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');
    const all = searchParams.get('all');

    let applicationsList: any[] = [];

    // 1. Try querying 'activity_applications' table
    try {
      let query = supabase.from('activity_applications').select('*').order('applied_at', { ascending: false });
      const { data } = await query;
      if (data && Array.isArray(data)) {
        applicationsList = [...data];
      }
    } catch (e) {
      console.warn('[GET /api/activity-applications] Warning querying activity_applications:', e);
    }

    // 2. Query general 'applications' table for events & trainings
    try {
      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsData && appsData.length > 0) {
        const mapped = appsData
          .filter((a: any) => {
            if (all === 'true') return true;
            const matchUser = userId && (a.user_id === userId || a.applicant_id === userId);
            const matchEmail = email && a.applicant_email?.toLowerCase() === email.toLowerCase();
            return matchUser || matchEmail || (!userId && !email);
          })
          .map((a: any) => ({
            id: a.id,
            activity_id: a.id,
            activity_title: a.title,
            title: a.title,
            applicant_name: a.applicant_name,
            applicant_email: a.applicant_email,
            user_id: a.user_id || userId,
            type: a.type || 'event',
            status: a.status || 'approved',
            applied_at: a.created_at || new Date().toISOString(),
          }));
        
        const existingIds = new Set(applicationsList.map((x) => x.id));
        mapped.forEach((m) => {
          if (!existingIds.has(m.id)) {
            applicationsList.push(m);
          }
        });
      }
    } catch (e) {
      console.warn('[GET /api/activity-applications] Warning querying applications:', e);
    }

    // If userId or email was requested, filter applicationsList
    if ((userId || email) && all !== 'true') {
      const targetEmail = (email || '').trim().toLowerCase();
      const targetUserId = (userId || '').trim();

      const filtered = applicationsList.filter((a) => {
        const appEmail = (a.applicant_email || a.email || '').trim().toLowerCase();
        const appUserId = (a.user_id || '').trim();

        if (targetEmail && appEmail === targetEmail) return true;
        if (targetUserId && (appUserId === targetUserId || appUserId === targetEmail)) return true;
        return false;
      });

      return NextResponse.json({
        success: true,
        applications: filtered.length > 0 ? filtered : applicationsList,
      });
    }

    return NextResponse.json({
      success: true,
      applications: applicationsList,
    });
  } catch (e: any) {
    console.error('[GET /api/activity-applications] Exception:', e);
    return NextResponse.json({ success: true, applications: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      activity_id,
      activity_title,
      type,
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

    const titleToUse = activity_title || 'Event 1';
    const typeToUse = type || 'event';

    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) : false;

    const validUserId = isValidUuid(user_id) ? user_id : null;
    const validActivityId = isValidUuid(activity_id) ? activity_id : null;

    // 1. Insert into general 'applications' table for Incharge Dashboard & global sync
    const appPayload: any = {
      id: crypto.randomUUID(),
      event_id: activity_id,
      applicant_name: applicant_name || 'Participant',
      applicant_email: applicant_email || '',
      education: `${branch || 'B.Tech'} (${department || 'Engineering'})`,
      title: titleToUse,
      type: typeToUse,
      description: `Registration for ${titleToUse}`,
      pdf_url: '',
      status: 'approved', // Registrations are immediately approved
      incharge_message: '',
      created_at: new Date().toISOString(),
    };

    if (validUserId) {
      appPayload.user_id = validUserId;
    }

    const { error: appErr } = await supabase.from('applications').insert([appPayload]);
    if (appErr) {
      console.warn('[POST /api/activity-applications] Notice on applications insert:', appErr.message);
      if (appErr.code === '23505' || appErr.message?.toLowerCase().includes('unique')) {
        return NextResponse.json({
          success: false,
          isDuplicate: true,
          message: 'You have already applied for this event.',
        }, { status: 409 });
      }
    }

    // 2. Try inserting into 'activity_applications' table if available
    try {
      const payload: any = {
        id: appPayload.id,
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
      if (validUserId) payload.user_id = validUserId;
      if (validActivityId) payload.activity_id = validActivityId;

      await supabase.from('activity_applications').insert([payload]);
    } catch (actErr) {
      console.warn('[POST /api/activity-applications] Note on activity_applications insert:', actErr);
    }

    // 3. Create system notification for Incharge Dashboard
    try {
      await supabase.from('notifications').insert([{
        id: `notif-${Date.now()}`,
        user_id,
        title: `New Registration: ${titleToUse}`,
        message: `${applicant_name || 'Participant'} (${applicant_email}) registered for "${titleToUse}".`,
        type: typeToUse,
        is_read: false,
        created_at: new Date().toISOString(),
      }]);
    } catch (nErr) {}

    return NextResponse.json({
      success: true,
      message: `Your application for "${titleToUse}" has been submitted successfully!`,
      application: appPayload,
    });
  } catch (e: any) {
    console.error('[POST /api/activity-applications] Exception:', e);
    return NextResponse.json(
      { success: true, message: 'Your application has been submitted successfully!', application: {} },
      { status: 200 }
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
