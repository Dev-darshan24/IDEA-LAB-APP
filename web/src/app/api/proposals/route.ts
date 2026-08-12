import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface ProjectProposalRecord {
  id?: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  college_institution?: string;
  department?: string;
  branch?: string;
  year?: string;
  roll_number?: string;
  project_name: string;
  project_description: string;
  problem_statement?: string;
  objective?: string;
  document_path: string;
  status?: string;
  admin_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at?: string;
  updated_at?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const all = searchParams.get('all');

    let query = supabase.from('project_proposals').select('*').order('submitted_at', { ascending: false });

    if (userId && all !== 'true') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[GET /api/proposals] Supabase query error:', error);
      // Fallback resilience if table not yet migrated
      if (error.code === '42P01' || error.message.includes('relation')) {
        return NextResponse.json({ success: true, proposals: [] });
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      proposals: data || [],
    });
  } catch (e: any) {
    console.error('[GET /api/proposals] Exception:', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch project proposals.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      college_institution,
      department,
      branch,
      year,
      roll_number,
      project_name,
      project_description,
      problem_statement,
      objective,
      document_path,
    } = body;

    if (!user_id || !project_name || !project_description || !document_path) {
      return NextResponse.json(
        { success: false, message: 'User ID, Project Name, Description, and PDF Document are required.' },
        { status: 400 }
      );
    }

    // Check duplicate active proposal under review for this user
    const { data: existingActive } = await supabase
      .from('project_proposals')
      .select('id, status, project_name')
      .eq('user_id', user_id)
      .in('status', ['submitted', 'under_review']);

    if (existingActive && existingActive.length > 0) {
      return NextResponse.json(
        {
          success: false,
          isDuplicate: true,
          message: `You already have an active project proposal ("${existingActive[0].project_name}") currently under review.`,
        },
        { status: 400 }
      );
    }

    const payload = {
      id: crypto.randomUUID(),
      user_id,
      applicant_name: applicant_name || 'Innovator',
      applicant_email: applicant_email || '',
      applicant_phone: applicant_phone || '',
      college_institution: college_institution || 'TGPCET Nagpur',
      department: department || branch || 'Engineering',
      branch: branch || 'Robotics & AI',
      year: year || 'Final Year',
      roll_number: roll_number || '',
      project_name: project_name.trim(),
      project_description: project_description.trim(),
      problem_statement: problem_statement ? problem_statement.trim() : project_description.trim(),
      objective: objective ? objective.trim() : project_name.trim(),
      document_path,
      status: 'submitted',
      admin_comments: '',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('project_proposals').insert([payload]).select();

    if (error) {
      console.error('[POST /api/proposals] Database insert error:', error);
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Project proposal submitted successfully to IDEA Lab Incharge!',
      proposal: data ? data[0] : payload,
    });
  } catch (e: any) {
    console.error('[POST /api/proposals] Exception:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to submit proposal.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, admin_comments, reviewed_by } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Proposal ID is required.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (admin_comments !== undefined) updatePayload.admin_comments = admin_comments;
    if (reviewed_by) {
      updatePayload.reviewed_by = reviewed_by;
      updatePayload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('project_proposals')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[PATCH /api/proposals] Update error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal status updated successfully!',
      proposal: data ? data[0] : null,
    });
  } catch (e: any) {
    console.error('[PATCH /api/proposals] Exception:', e);
    return NextResponse.json({ success: false, message: 'Failed to update proposal.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Proposal ID is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('project_proposals').delete().eq('id', id);
    if (error) {
      console.error('[DELETE /api/proposals] Delete error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Proposal deleted successfully.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete proposal.' }, { status: 500 });
  }
}
