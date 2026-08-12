'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { validatePasswordStrength } from '@/lib/cryptoOtp';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { registeredUsers, sendOtp, verifyOtp, resetPasswordWithOtp } = useAuth();

  const [step, setStep] = useState<'email' | 'otp' | 'new_password'>('email');
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Step 1: Send Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered Email address');
      return;
    }

    // Check if account exists
    if (!registeredUsers[cleanEmail]) {
      setError('No account found for this email address.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(cleanEmail, 'forgot_password');
    setLoading(false);

    setStep('otp');
    setCountdown(60);
    setCanResend(false);
    setSuccessMsg(`6-Digit OTP security code sent to ${cleanEmail}. Valid for 5 minutes.`);
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpInput.join('');
    if (fullOtp.length < 6) {
      setError('Please enter complete 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);

    const res = await verifyOtp(email, fullOtp, 'forgot_password');
    setLoading(false);

    if (res.success) {
      setSuccessMsg('OTP verified successfully! Now set your new password.');
      setStep('new_password');
    } else {
      setError(res.message);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setLoading(true);
    const res = await sendOtp(email, 'forgot_password');
    setLoading(false);
    setSuccessMsg(`New 6-digit OTP code dispatched to ${email}`);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`fp-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`fp-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match! Please re-type password.');
      return;
    }

    const passVal = validatePasswordStrength(newPassword);
    if (!passVal.valid) {
      setError(passVal.message || 'Password does not meet security requirements.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithOtp(email, otpInput.join(''), newPassword, true);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password Updated Successfully! Invalidating previous sessions. Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Enter Email OTP' : 'Set New Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'email'
              ? 'Enter your registered email address to receive a 6-digit OTP code'
              : step === 'otp'
              ? `Enter the 6-digit OTP sent to ${email} (Expires in 5 mins)`
              : 'Create a strong new password for your account'}
          </p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Registered Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="email@tgpcet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Dispatching OTP...' : 'Send OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-6 text-xs text-center">
            <div className="flex justify-center space-x-2 my-2">
              {otpInput.map((digit, idx) => (
                <input
                  key={idx}
                  id={`fp-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-lg font-black rounded-2xl bg-slate-50 dark:bg-slate-900 border border-sky-500/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-inner"
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Max 5 attempts allowed</span>
              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendOtp}
                className="font-bold text-sky-600 dark:text-cyan-400 hover:underline disabled:opacity-50 inline-flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{canResend ? 'Resend OTP' : `Resend in ${countdown}s`}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 'new_password' && (
          <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-extrabold text-sky-600 dark:text-cyan-400 hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
