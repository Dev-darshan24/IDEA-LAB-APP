import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/applications] Error fetching applications:', error);
      return NextResponse.json({ success: true, applications: [] });
    }

    return NextResponse.json({
      success: true,
      applications: data || [],
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch applications.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      event_id,
      user_id,
      status,
      incharge_message,
      title,
      applicant_name,
      applicant_email,
      education,
      type,
      description,
      pdf_url
    } = body;

    if (id) {
      // Update existing application
      const updateData: any = {};
      if (status) updateData.status = status;
      if (incharge_message !== undefined) updateData.incharge_message = incharge_message;

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('[POST /api/applications] Error updating application:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
    } else if (title && applicant_name) {
      const eventIdToUse = event_id || `event-${Date.now()}`;
      
      const newApp: any = {
        event_id: eventIdToUse,
        applicant_name,
        applicant_email: applicant_email || '',
        education: education || 'B.Tech',
        title,
        type: type || 'project',
        description: description || title,
        pdf_url: pdf_url || '',
        status: status || 'pending',
        incharge_message: incharge_message || '',
      };

      if (user_id) {
        newApp.user_id = user_id;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('applications')
        .insert([newApp])
        .select();

      if (insertError) {
        console.error('[POST /api/applications] Insert error:', insertError);
        // Postgres Code 23505 is Unique Constraint Violation (duplicate application)
        if (insertError.code === '23505' || insertError.message?.toLowerCase().includes('unique')) {
          return NextResponse.json({
            success: false,
            isDuplicate: true,
            message: 'You have already applied for this event.',
          }, { status: 409 });
        }

        return NextResponse.json({
          success: false,
          message: insertError.message || 'Failed to submit application.',
        }, { status: 500 });
      }
    }

    // Fetch updated list from Supabase
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Applications saved to Supabase!',
      applications: data || [],
    });
  } catch (e: any) {
    console.error('[POST /api/applications] Exception:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to update application.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Application ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      console.error('[DELETE /api/applications] Error deleting application:', error);
    }

    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Application deleted from Supabase!',
      applications: data || [],
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to delete application.' }, { status: 500 });
  }
}
