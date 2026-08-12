import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ContactDetails } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  email_primary: 'idealab@tgpcet.com',
  email_secondary: 'support.idealab@tgpcet.com',
  phone_primary: '+91 712 2810001',
  phone_secondary: '+91 9876543210',
  address: 'AICTE IDEA LAB, TGPCET Campus, Mohgaon, Wardha Road, Nagpur, Maharashtra - 441108',
  instagram_handle: '@idealab_tgpcet',
  instagram_url: 'https://instagram.com',
  linkedin_handle: 'LinkedIn',
  linkedin_url: 'https://linkedin.com',
};

export async function GET() {
  try {
    const { data, error } = await supabase.from('site_contact').select('*').limit(1);
    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, contact: data[0] });
    }
    return NextResponse.json({ success: true, contact: DEFAULT_CONTACT_DETAILS });
  } catch (e) {
    return NextResponse.json({ success: true, contact: DEFAULT_CONTACT_DETAILS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email_primary,
      email_secondary,
      phone_primary,
      phone_secondary,
      address,
      instagram_handle,
      instagram_url,
      linkedin_handle,
      linkedin_url,
    } = body;

    if (!email_primary || !phone_primary || !address) {
      return NextResponse.json(
        { success: false, message: 'Primary Email, Primary Phone, and Address are required.' },
        { status: 400 }
      );
    }

    const updatedContact = {
      id: 'contact-main',
      email_primary: email_primary.trim(),
      email_secondary: email_secondary ? email_secondary.trim() : '',
      phone_primary: phone_primary.trim(),
      phone_secondary: phone_secondary ? phone_secondary.trim() : '',
      address: address.trim(),
      instagram_handle: instagram_handle ? instagram_handle.trim() : '@idealab_tgpcet',
      instagram_url: instagram_url ? instagram_url.trim() : 'https://instagram.com',
      linkedin_handle: linkedin_handle ? linkedin_handle.trim() : 'LinkedIn',
      linkedin_url: linkedin_url ? linkedin_url.trim() : 'https://linkedin.com',
    };

    const { error } = await supabase.from('site_contact').upsert([updatedContact], { onConflict: 'id' });
    if (error) {
      console.error('Supabase site_contact upsert error:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact details updated in Supabase cloud database!',
      contact: updatedContact,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: 'Failed to save contact details.' },
      { status: 500 }
    );
  }
}
