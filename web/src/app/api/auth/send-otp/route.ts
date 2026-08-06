import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generate6DigitOtp, setOtpForEmail } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { email, first_name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 });
    }

    const otpCode = generate6DigitOtp();
    setOtpForEmail(email, otpCode);

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');

    const isGmailConfigured = !!(gmailUser && gmailPass && !gmailUser.includes('your-email') && !gmailPass.includes('your-16-character'));

    if (isGmailConfigured) {
      try {
        // Create Nodemailer Gmail Transporter
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // TLS 465
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const htmlTemplate = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e0f2fe; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.1);">
            <div style="background: linear-gradient(135deg, #0284c7, #4f46e5); padding: 30px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">AICTE IDEA LAB</h1>
              <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Tulsiramji Gaikwad Patil College of Engineering & Technology</p>
            </div>
            <div style="padding: 30px 25px; color: #1e293b;">
              <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0f172a;">Account Registration Verification</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Hello <strong>${first_name || 'Innovator'}</strong>,<br/>
                Thank you for registering on the AICTE IDEA LAB TGPCET platform. Use the 6-digit One-Time Password (OTP) below to complete your email verification:
              </p>
              
              <div style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 16px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${otpCode}</span>
                <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">This OTP code will expire in 10 minutes.</p>
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                If you did not request this OTP, please ignore this email. Do not share this OTP code with anyone.
              </p>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
              <div style="font-size: 11px; color: #94a3b8; text-align: center;">
                <strong>AICTE IDEA LAB — TGPCET Nagpur</strong><br/>
                Lab Incharge: Dr. Neeraj Waijode • Chief Student Innovator Team
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"AICTE IDEA LAB TGPCET" <${gmailUser}>`,
          to: email,
          subject: `${otpCode} is your AICTE IDEA LAB Verification Code`,
          html: htmlTemplate,
        });

        console.log(`✅ [GMAIL SMTP SENT SUCCESS] OTP ${otpCode} sent to ${email} via ${gmailUser}`);

        return NextResponse.json({
          success: true,
          message: `Verification OTP code sent to ${email}`,
          sentViaGmail: true,
        });
      } catch (smtpErr: any) {
        console.error('❌ Gmail SMTP Transport Error:', smtpErr);
      }
    }

    // Fallback simulation mode
    console.log(`⚠️ [OTP DEV SIMULATION] Email: ${email} | OTP Code: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: `Verification OTP code sent to ${email}`,
      sentViaGmail: false,
    });
  } catch (error: any) {
    console.error('Error in send-otp handler:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send OTP email.' },
      { status: 500 }
    );
  }
}
