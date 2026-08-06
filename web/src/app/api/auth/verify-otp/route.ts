import { NextResponse } from 'next/server';
import { verifyOtpForEmail } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json({ success: false, message: 'Email and 6-digit OTP code are required.' }, { status: 400 });
    }

    const result = verifyOtpForEmail(email, otpCode);

    if (!result.valid) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify OTP.' },
      { status: 500 }
    );
  }
}
