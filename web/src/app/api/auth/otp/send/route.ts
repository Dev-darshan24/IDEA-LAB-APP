import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabaseClient';
import { generateOtpCode, hashOtp } from '@/lib/cryptoOtp';

// Global in-memory OTP store fallback for when Supabase DB table email_otps is unavailable
declare global {
  var __otpMemoryStore: Record<string, { email: string; hashed_otp: string; purpose: string; expires_at: string; attempt_count: number; created_at: string }> | undefined;
}

if (!global.__otpMemoryStore) {
  global.__otpMemoryStore = {};
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, purpose } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const validPurposes = ['registration', 'forgot_password', 'change_password'];
    const otpPurpose = validPurposes.includes(purpose) ? purpose : 'forgot_password';

    // 1. Rate Limiting Check: Check if an active OTP was sent in the last 60 seconds
    try {
      const { data: existingOtp } = await supabase
        .from('email_otps')
        .select('created_at')
        .eq('email', cleanEmail)
        .eq('purpose', otpPurpose)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingOtp) {
        const lastSent = new Date(existingOtp.created_at).getTime();
        const secondsPassed = Math.floor((Date.now() - lastSent) / 1000);
        if (secondsPassed < 60) {
          return NextResponse.json({
            success: false,
            message: `Please wait ${60 - secondsPassed} seconds before requesting a new OTP code.`,
          }, { status: 429 });
        }
      }
    } catch (e) {
      // Memory store check fallback
      const memKey = `${cleanEmail}:${otpPurpose}`;
      const existingMem = global.__otpMemoryStore ? global.__otpMemoryStore[memKey] : undefined;
      if (existingMem) {
        const secondsPassed = Math.floor((Date.now() - new Date(existingMem.created_at).getTime()) / 1000);
        if (secondsPassed < 60) {
          return NextResponse.json({
            success: false,
            message: `Please wait ${60 - secondsPassed} seconds before requesting a new OTP code.`,
          }, { status: 429 });
        }
      }
    }

    // 2. Generate secure 6-digit OTP & Hashed OTP
    const rawOtp = generateOtpCode();
    const hashed = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 Minutes TTL
    const createdAt = new Date().toISOString();

    // 3. Store hashed OTP in Supabase database & in-memory fallback
    const memKey = `${cleanEmail}:${otpPurpose}`;
    if (!global.__otpMemoryStore) global.__otpMemoryStore = {};
    global.__otpMemoryStore[memKey] = {
      email: cleanEmail,
      hashed_otp: hashed,
      purpose: otpPurpose,
      expires_at: expiresAt,
      attempt_count: 0,
      created_at: createdAt,
    };

    try {
      await supabase.from('email_otps').insert([
        {
          email: cleanEmail,
          hashed_otp: hashed,
          purpose: otpPurpose,
          expires_at: expiresAt,
          attempt_count: 0,
        },
      ]);
    } catch (e) {
      console.warn('Supabase email_otps insert failed, relying on memory fallback store.');
    }

    // 4. Send OTP via Nodemailer SMTP if configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    let emailSent = false;
    if (gmailUser && gmailPass && !gmailUser.includes('your-email')) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const subjectTitle =
          otpPurpose === 'forgot_password'
            ? 'Reset Password Verification Code'
            : otpPurpose === 'change_password'
            ? 'Change Password Verification Code'
            : 'Email Verification Code';

        await transporter.sendMail({
          from: `"AICTE IDEA LAB TGPCET" <${gmailUser}>`,
          to: cleanEmail,
          subject: `${rawOtp} is your ${subjectTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e0f2fe; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #0284c7; margin-bottom: 8px;">AICTE IDEA LAB — TGPCET</h2>
              <p style="font-size: 14px; color: #475569;">Your 6-digit verification security code for <strong>${otpPurpose.replace('_', ' ')}</strong> is:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; background: #f0f9ff; border: 1px dashed #0284c7; padding: 16px; text-align: center; border-radius: 12px; margin: 20px 0;">
                ${rawOtp}
              </div>
              <p style="font-size: 12px; color: #94a3b8;">This OTP will expire in <strong>5 minutes</strong>. Maximum 5 attempts allowed.</p>
              <p style="font-size: 11px; color: #cbd5e1; border-top: 1px solid #f1f5f9; pt: 12px;">TGPCET Nagpur • AICTE Center of Excellence</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (smtpErr) {
        console.error('SMTP Transport Error:', smtpErr);
      }
    }

    console.log(`🔑 [SECURITY OTP LOG] Email: ${cleanEmail} | Purpose: ${otpPurpose} | Code: ${rawOtp}`);

    return NextResponse.json({
      success: true,
      message: `6-Digit OTP code dispatched to ${cleanEmail}. Expire in 5 minutes.`,
      sentViaEmail: emailSent,
    });
  } catch (error: any) {
    console.error('OTP Send API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error processing OTP request.' }, { status: 500 });
  }
}
