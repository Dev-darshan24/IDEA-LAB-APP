import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  return handleInitSuperAdmins();
}

export async function POST() {
  return handleInitSuperAdmins();
}

async function handleInitSuperAdmins() {
  try {
    const s1Email = (process.env.SUPERADMIN1_EMAIL || process.env.NEXT_PUBLIC_SUPERADMIN_1_EMAIL || 'incharge@tgpcet.ac.in').toLowerCase().trim();
    const s1Password = process.env.SUPERADMIN1_PASSWORD || process.env.NEXT_PUBLIC_SUPERADMIN_1_PASSWORD || 'demo123';

    const s2Email = (process.env.SUPERADMIN2_EMAIL || process.env.NEXT_PUBLIC_SUPERADMIN_2_EMAIL || 'darshan@tgpcet.ac.in').toLowerCase().trim();
    const s2Password = process.env.SUPERADMIN2_PASSWORD || process.env.NEXT_PUBLIC_SUPERADMIN_2_PASSWORD || 'demo123';

    const results = {
      superadmin_1: { email: s1Email, status: 'checked' },
      superadmin_2: { email: s2Email, status: 'checked' },
    };

    // 1. Check SuperAdmin 1
    const { data: existingS1 } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', s1Email)
      .maybeSingle();

    if (!existingS1) {
      // Create SuperAdmin 1 in Supabase Auth & Profile table
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: s1Email,
        password: s1Password,
        options: {
          data: {
            first_name: 'Dr. Neeraj',
            middle_name: '',
            last_name: 'Waijode',
            phone: '+91 9876543210',
            college_id: 'FAC-IDEA-01',
            education: 'Other',
            role: 'superadmin_1',
          },
        },
      });

      if (authData?.user) {
        await supabase.from('profiles').upsert([
          {
            id: authData.user.id,
            email: s1Email,
            first_name: 'Dr. Neeraj',
            middle_name: '',
            last_name: 'Waijode',
            phone: '+91 9876543210',
            college_id: 'FAC-IDEA-01',
            education: 'Other',
            role: 'superadmin_1',
          },
        ]);
        results.superadmin_1.status = 'initialized';
      }
    } else {
      results.superadmin_1.status = 'already_exists';
    }

    // 2. Check SuperAdmin 2
    const { data: existingS2 } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', s2Email)
      .maybeSingle();

    if (!existingS2) {
      // Create SuperAdmin 2 in Supabase Auth & Profile table
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: s2Email,
        password: s2Password,
        options: {
          data: {
            first_name: 'Darshan',
            middle_name: '',
            last_name: 'Developer',
            phone: '+91 9123456789',
            college_id: 'CSI-2026-001',
            education: 'B.Tech',
            role: 'superadmin_2',
          },
        },
      });

      if (authData?.user) {
        await supabase.from('profiles').upsert([
          {
            id: authData.user.id,
            email: s2Email,
            first_name: 'Darshan',
            middle_name: '',
            last_name: 'Developer',
            phone: '+91 9123456789',
            college_id: 'CSI-2026-001',
            education: 'B.Tech',
            role: 'superadmin_2',
          },
        ]);
        results.superadmin_2.status = 'initialized';
      }
    } else {
      results.superadmin_2.status = 'already_exists';
    }

    return NextResponse.json({
      success: true,
      message: 'SuperAdmin initialization check complete.',
      results,
    });
  } catch (error: any) {
    console.error('SuperAdmin Initialization Error:', error);
    return NextResponse.json({ success: false, message: 'Error initializing superadmins.' }, { status: 500 });
  }
}
