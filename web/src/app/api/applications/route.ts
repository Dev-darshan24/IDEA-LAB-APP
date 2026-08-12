import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications from Supabase:', error);
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
    const { id, status, incharge_message, title, applicant_name, applicant_email, education, type, description, pdf_url } = body;

    if (id) {
      // Update application in Supabase
      const updateData: any = {};
      if (status) updateData.status = status;
      if (incharge_message !== undefined) updateData.incharge_message = incharge_message;

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating application in Supabase:', error);
      }
    } else if (title && applicant_name) {
      // Insert new application in Supabase
      const newApp = {
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

      const { error } = await supabase.from('applications').insert([newApp]);
      if (error) {
        console.error('Error inserting application in Supabase:', error);
      }
    }

    // Fetch updated list from Supabase
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Applications updated on Supabase!',
      applications: data || [],
    });
  } catch (e) {
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

    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      console.error('Error deleting application in Supabase:', error);
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
