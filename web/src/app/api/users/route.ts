import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error fetching Supabase profiles:', error);
      return NextResponse.json({ success: true, totalUsers: 0, users: [] });
    }

    return NextResponse.json({
      success: true,
      totalUsers: count || (data ? data.length : 0),
      users: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users from Supabase' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    const cleanEmail = body.email.toLowerCase().trim();
    const collegeIdInput = body.college_id || (typeof body.id === 'string' && body.id.startsWith('IDEA-') ? body.id : '');

    // Check if id is a valid UUID
    const isValidUuid = typeof body.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id);
    let targetProfileId = isValidUuid ? body.id : null;

    // If no valid UUID id provided, query existing profile by email
    if (!targetProfileId) {
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser?.id) {
          targetProfileId = existingUser.id;
        }
      } catch (e) {}
    }

    if (!targetProfileId) {
      targetProfileId = crypto.randomUUID();
    }

    const userProfile: Record<string, any> = {
      id: targetProfileId,
      email: cleanEmail,
      first_name: body.first_name || cleanEmail.split('@')[0],
      middle_name: body.middle_name || '',
      last_name: body.last_name || 'Innovator',
      phone: body.phone || '',
      college_id: collegeIdInput,
      college_name: body.college_name || 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
      education: body.current_education || body.education || 'B.Tech',
      gender: body.gender || 'Male',
      address: body.address || '',
      role: body.role || 'user',
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('profiles')
      .upsert([userProfile], { onConflict: 'id' })
      .select();

    // Fallback resilience if extended columns are missing in remote DB schema
    if (error && (error.message.includes('Could not find') || error.message.includes('column') || error.code === 'PGRST204')) {
      console.warn('[POST /api/users] Column missing in profiles schema cache, retrying with core payload:', error.message);
      const coreProfile = {
        id: targetProfileId,
        email: cleanEmail,
        first_name: body.first_name || cleanEmail.split('@')[0],
        last_name: body.last_name || 'Innovator',
        phone: body.phone || '',
        role: body.role || 'user',
        updated_at: new Date().toISOString(),
      };
      const retryResult = await supabase.from('profiles').upsert([coreProfile], { onConflict: 'id' }).select();
      if (!retryResult.error) {
        error = null;
        data = retryResult.data;
      }
    }

    if (error) {
      console.error('[POST /api/users] Supabase profile upsert error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Get current total count from Supabase
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'User stored on Supabase successfully',
      user: data ? data[0] : userProfile,
      totalUsers: count || 1,
    });
  } catch (error: any) {
    console.error('[POST /api/users] Exception:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error saving to Supabase' }, { status: 500 });
  }
}
