import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { hashOtp } from '@/lib/cryptoOtp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, purpose } = body;

    if (!email || !otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ success: false, message: '6-digit OTP code and email address are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const otpPurpose = purpose || 'forgot_password';
    const hashedInput = hashOtp(cleanOtp);
    const memKey = `${cleanEmail}:${otpPurpose}`;

    // 1. Try Supabase DB lookup first
    let record: any = null;
    try {
      const { data } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', cleanEmail)
        .eq('purpose', otpPurpose)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      record = data;
    } catch (e) {
      console.warn('Supabase DB OTP verify query error, checking memory fallback store.');
    }

    // Fallback to memory store if DB lookup returned nothing
    if (!record && global.__otpMemoryStore && global.__otpMemoryStore[memKey]) {
      record = global.__otpMemoryStore[memKey];
    }

    if (!record) {
      return NextResponse.json({
        success: false,
        message: 'No active OTP request found for this email address. Please request a new OTP.',
      }, { status: 404 });
    }

    // 2. Check Expiry (5 minutes TTL)
    const expiresAt = new Date(record.expires_at).getTime();
    if (Date.now() > expiresAt) {
      if (global.__otpMemoryStore) delete global.__otpMemoryStore[memKey];
      try { await supabase.from('email_otps').delete().eq('id', record.id); } catch (e) {}

      return NextResponse.json({
        success: false,
        message: 'OTP has expired (valid for 5 minutes). Please request a new OTP code.',
      }, { status: 410 });
    }

    // 3. Check Attempt Limit (Maximum 5 attempts allowed)
    if (record.attempt_count >= 5) {
      if (global.__otpMemoryStore) delete global.__otpMemoryStore[memKey];
      try { await supabase.from('email_otps').delete().eq('id', record.id); } catch (e) {}

      return NextResponse.json({
        success: false,
        message: 'Maximum verification attempts exceeded (5/5). Please request a new OTP code.',
      }, { status: 429 });
    }

    // 4. Verify Hashed OTP
    if (record.hashed_otp !== hashedInput) {
      const updatedAttempts = (record.attempt_count || 0) + 1;
      record.attempt_count = updatedAttempts;
      if (global.__otpMemoryStore && global.__otpMemoryStore[memKey]) {
        global.__otpMemoryStore[memKey].attempt_count = updatedAttempts;
      }
      try {
        await supabase
          .from('email_otps')
          .update({ attempt_count: updatedAttempts })
          .eq('id', record.id);
      } catch (e) {}

      const remaining = 5 - updatedAttempts;
      return NextResponse.json({
        success: false,
        message: `Incorrect OTP code! (${remaining} attempts remaining)`,
      }, { status: 401 });
    }

    // 5. Success! Delete OTP record to prevent replay attacks
    if (global.__otpMemoryStore) delete global.__otpMemoryStore[memKey];
    try { await supabase.from('email_otps').delete().eq('id', record.id); } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error: any) {
    console.error('OTP Verify API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error verifying OTP.' }, { status: 500 });
  }
}
