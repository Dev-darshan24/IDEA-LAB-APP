import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Project } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function mapSupabaseToProject(data: any[]): Project[] {
  return data.map((item) => ({
    id: String(item.id),
    title: item.title || 'Untitled Project',
    project_type: item.project_type || 'team',
    status: (item.status?.toLowerCase() === 'completed' ? 'completed' : item.status?.toLowerCase() === 'running' ? 'running' : 'upcoming') as any,
    team_name: item.team_name || 'IDEA Lab Innovators',
    description: item.description || '',
    full_detail: item.full_detail || item.description || '',
    leader_name: item.leader_name || item.leader || 'Darshan',
    leader_branch: item.leader_branch || 'Robotics & AI',
    leader_email: item.leader_email || 'darshan@tgpcet.com',
    leader_photo: item.leader_photo || '',
    team_members: Array.isArray(item.team_members) && item.team_members.length > 0 ? item.team_members : [
      {
        name: item.leader_name || item.leader || 'Darshan',
        branch: item.leader_branch || 'Robotics & AI',
        role: 'Team Lead',
        avatar: item.leader_photo || '',
      },
    ],
    cover_image: item.cover_image || item.image_url || '',
    project_images: Array.isArray(item.project_images) && item.project_images.length > 0 ? item.project_images : (item.cover_image || item.image_url ? [item.cover_image || item.image_url] : []),
    tech_stack: Array.isArray(item.tech_stack) && item.tech_stack.length > 0 ? item.tech_stack : (item.equipment_used ? item.equipment_used.split(', ') : ['3D Printing', 'PCB CNC']),
    pdf_url: item.pdf_url || '',
    pdf_name: item.pdf_name || '',
    created_at: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  }));
}

// 1. GET ALL PROJECTS FROM SUPABASE DATABASE
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/projects] Supabase database fetch error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to fetch projects from database.', projects: [] },
        { status: 500 }
      );
    }

    const projectsList = Array.isArray(data) ? mapSupabaseToProject(data) : [];
    return NextResponse.json({ success: true, projects: projectsList });
  } catch (e: any) {
    console.error('[GET /api/projects] Server error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Server connection error.', projects: [] },
      { status: 500 }
    );
  }
}

// 2. CREATE OR UPDATE PROJECT IN SUPABASE DATABASE (POST/PUT)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      project_type,
      status,
      team_name,
      leader_name,
      leader_branch,
      leader_email,
      leader_photo,
      description,
      full_detail,
      cover_image,
      project_images,
      tech_stack,
      team_members,
      pdf_url,
      pdf_name,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Project title is required.' }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ success: false, message: 'Project description is required.' }, { status: 400 });
    }

    let projectId = id ? String(id).trim() : '';
    if (!projectId || projectId.startsWith('p-')) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        projectId = crypto.randomUUID();
      } else {
        projectId = `${Date.now()}-0000-4000-8000-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      }
    }
    const imagesList = Array.isArray(project_images) && project_images.length > 0 ? project_images : (cover_image ? [cover_image] : []);
    const stackList = Array.isArray(tech_stack) ? tech_stack : (typeof tech_stack === 'string' ? tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const dbPayload = {
      id: projectId,
      title: title.trim(),
      project_type: project_type || 'team',
      status: status || 'running',
      team_name: team_name ? team_name.trim() : 'IDEA Lab Innovators',
      description: description ? description.trim() : title.trim(),
      full_detail: full_detail ? full_detail.trim() : (description ? description.trim() : title.trim()),
      leader: leader_name ? leader_name.trim() : 'Darshan',
      leader_name: leader_name ? leader_name.trim() : 'Darshan',
      leader_branch: leader_branch ? leader_branch.trim() : 'Robotics & AI',
      leader_email: leader_email ? leader_email.trim() : 'darshan@tgpcet.com',
      leader_photo: leader_photo || '',
      image_url: cover_image || imagesList[0] || '',
      cover_image: cover_image || imagesList[0] || '',
      category: 'Student Innovation',
      project_images: imagesList,
      tech_stack: stackList,
      team_members: Array.isArray(team_members) ? team_members : [],
      pdf_url: pdf_url || '',
      pdf_name: pdf_name || '',
      equipment_used: stackList.length > 0 ? stackList.join(', ') : '3D Printer, PCB CNC',
      updated_at: new Date().toISOString(),
    };

    let { error: upsertErr } = await supabase.from('projects').upsert([dbPayload], { onConflict: 'id' });

    if (upsertErr && (upsertErr.message.includes('Could not find') || upsertErr.message.includes('column') || upsertErr.code === 'PGRST204')) {
      console.warn('[POST /api/projects] Extended column missing in database schema, retrying with core payload:', upsertErr.message);
      
      const corePayload: Record<string, any> = {
        id: projectId,
        title: title.trim(),
        description: description ? description.trim() : title.trim(),
        image_url: cover_image || imagesList[0] || '',
        leader: leader_name ? leader_name.trim() : 'Darshan',
        status: status || 'running',
        category: 'Student Innovation',
        equipment_used: stackList.length > 0 ? stackList.join(', ') : '3D Printer, PCB CNC',
      };

      const retryResult = await supabase.from('projects').upsert([corePayload], { onConflict: 'id' });
      if (!retryResult.error) {
        upsertErr = null;
      }
    }

    if (upsertErr) {
      console.error('[POST /api/projects] Supabase database upsert error:', upsertErr);
      return NextResponse.json({ success: false, message: `Database error: ${upsertErr.message}` }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Project saved permanently to Supabase cloud database!',
      project: dbPayload,
      projects: updatedList ? mapSupabaseToProject(updatedList) : [mapSupabaseToProject([dbPayload])[0]],
    });
  } catch (e: any) {
    console.error('[POST /api/projects] Server error:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to save project.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

// 3. DELETE PROJECT FROM SUPABASE DATABASE
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return NextResponse.json({ success: false, message: 'Project ID is required for deletion.' }, { status: 400 });
    }

    const targetId = id.trim();
    const { error: delErr } = await supabase.from('projects').delete().eq('id', targetId);
    if (delErr) {
      console.error('[DELETE /api/projects] Supabase database delete error:', delErr);
      return NextResponse.json({ success: false, message: `Database error: ${delErr.message}` }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Project deleted permanently from Supabase cloud database!',
      projects: updatedList ? mapSupabaseToProject(updatedList) : [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/projects] Server error:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to delete project.' }, { status: 500 });
  }
}
