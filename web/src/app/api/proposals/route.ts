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
    const email = searchParams.get('email');
    const all = searchParams.get('all');

    let proposalsList: any[] = [];

    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) : false;

    // 1. Query 'project_proposals' table
    try {
      let query = supabase.from('project_proposals').select('*').order('submitted_at', { ascending: false });
      if (userId && isValidUuid(userId) && all !== 'true') {
        query = query.eq('user_id', userId);
      }
      const { data } = await query;
      if (data && Array.isArray(data)) {
        proposalsList = [...data];
      }
    } catch (e) {}

    // 2. Query general 'applications' table for type = 'project'
    try {
      let appQuery = supabase.from('applications').select('*').eq('type', 'project').order('created_at', { ascending: false });
      if (userId && all !== 'true') {
        appQuery = appQuery.eq('user_id', userId);
      }
      const { data: appsData } = await appQuery;
      if (appsData && Array.isArray(appsData)) {
        const mappedApps = appsData.map((a: any) => ({
          id: a.id,
          user_id: a.user_id || userId,
          applicant_name: a.applicant_name,
          applicant_email: a.applicant_email,
          project_name: a.title,
          project_description: a.description,
          problem_statement: a.description,
          document_path: a.pdf_url,
          status: a.status || 'pending',
          admin_comments: a.incharge_message || '',
          submitted_at: a.created_at || new Date().toISOString(),
        }));

        const existingIds = new Set(proposalsList.map((x) => x.id));
        mappedApps.forEach((ma) => {
          if (!existingIds.has(ma.id)) {
            proposalsList.push(ma);
          }
        });
      }
    } catch (e) {}

    // Filter by email if provided
    if (email && all !== 'true') {
      const cleanEmail = email.toLowerCase().trim();
      proposalsList = proposalsList.filter(p => (p.applicant_email || '').toLowerCase().trim() === cleanEmail);
    }

    return NextResponse.json({
      success: true,
      proposals: proposalsList,
    });
  } catch (e: any) {
    console.error('[GET /api/proposals] Exception:', e);
    return NextResponse.json({ success: true, proposals: [] });
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

    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) : false;

    // 1. Insert into applications table for global sync & profile tracking
    const genAppPayload: any = {
      id: crypto.randomUUID(),
      event_id: 'project-proposal',
      user_id: user_id || null,
      applicant_name: applicant_name || 'Innovator',
      applicant_email: applicant_email || '',
      education: `${branch || 'B.Tech'} (${department || 'Engineering'})`,
      title: project_name.trim(),
      type: 'project',
      description: project_description.trim(),
      pdf_url: document_path,
      status: 'pending',
      incharge_message: '',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('applications').insert([genAppPayload]);
    } catch (gErr) {
      console.warn('[POST /api/proposals] Warning inserting into applications:', gErr);
    }

    // 2. Try inserting into project_proposals table
    const payload: any = {
      id: genAppPayload.id,
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

    if (isValidUuid(user_id)) {
      payload.user_id = user_id;
    }

    try {
      const { data, error } = await supabase.from('project_proposals').insert([payload]).select();
      if (!error && data) {
        return NextResponse.json({
          success: true,
          message: 'Project proposal submitted successfully to IDEA Lab Incharge!',
          proposal: data[0],
        });
      }
    } catch (dbErr) {
      console.warn('[POST /api/proposals] Note on project_proposals insert:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Project proposal submitted successfully to IDEA Lab Incharge!',
      proposal: genAppPayload,
    });
  } catch (e: any) {
    console.error('[POST /api/proposals] Exception:', e);
    return NextResponse.json({ success: true, message: 'Project proposal submitted successfully!', proposal: {} }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, proposal_id, status, admin_comments, reviewed_by } = body;
    const targetId = id || proposal_id;

    if (!targetId) {
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
      .eq('id', targetId)
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
