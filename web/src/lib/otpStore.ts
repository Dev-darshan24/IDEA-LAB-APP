// Server-side in-memory OTP Store for AICTE IDEA LAB TGPCET

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

const globalForOtp = global as unknown as { otpStore: Map<string, OtpRecord> };

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') globalForOtp.otpStore = otpStore;

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setOtpForEmail(email: string, otp: string, ttlMinutes = 10): void {
  const key = email.toLowerCase().trim();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  otpStore.set(key, { otp, expiresAt });
}

export function verifyOtpForEmail(email: string, token: string): { valid: boolean; message: string } {
  const key = email.toLowerCase().trim();
  
  // Universal test code fallback
  if (token === '123456') {
    return { valid: true, message: 'OTP verified via universal test code.' };
  }

  const record = otpStore.get(key);
  if (!record) {
    return { valid: false, message: 'No OTP requested for this email or code expired.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired. Please click Resend OTP.' };
  }

  if (record.otp !== token.trim()) {
    return { valid: false, message: 'Invalid 6-digit OTP code entered.' };
  }

  // Clear OTP on successful verification
  otpStore.delete(key);
  return { valid: true, message: 'OTP verified successfully!' };
}
