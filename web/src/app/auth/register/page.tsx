'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, User, Mail, Phone, Lock, FileText, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { validatePasswordStrength } from '@/lib/cryptoOtp';

export default function RegisterPage() {
  const router = useRouter();
  const { checkEmailAvailable, sendOtp, verifyOtp, registerUser } = useAuth();

  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    college_id: '',
    current_education: 'B.Tech' as any,
    password: '',
    confirm_password: '',
  });

  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [createdUserId, setCreatedUserId] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAlreadyExists(false);

    // Step 1: Validate inputs
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields (*)');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match! Please re-type password.');
      return;
    }

    const passVal = validatePasswordStrength(formData.password);
    if (!passVal.valid) {
      setError(passVal.message || 'Password does not meet security requirements.');
      return;
    }

    // Step 2: Check whether Email or Phone already exists
    const availCheck = checkEmailAvailable(formData.email, formData.phone);
    if (!availCheck.available) {
      setError(availCheck.message || 'An account with this email or phone is already registered.');
      setAlreadyExists(true);
      return;
    }

    // Step 3: Dispatch Email Verification OTP
    setLoading(true);
    const res = await sendOtp(formData.email, 'registration');
    setLoading(false);

    setStep('otp');
    setCountdown(60);
    setCanResend(false);
    setSuccessMsg(`6-Digit verification code dispatched to ${formData.email}. Valid for 5 minutes.`);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setLoading(true);
    const res = await sendOtp(formData.email, 'registration');
    setLoading(false);
    setSuccessMsg(`New 6-digit verification code dispatched to ${formData.email}`);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpInput.join('');
    if (fullOtp.length < 6) {
      setError('Please enter complete 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);

    // Verify OTP against backend hashed records
    const otpRes = await verifyOtp(formData.email, fullOtp, 'registration');
    if (!otpRes.success) {
      setLoading(false);
      setError(otpRes.message);
      return;
    }

    // Create Account with role 'user' & get unique created User ID
    const regRes = await registerUser(formData);
    setLoading(false);

    if (regRes.success && regRes.userId) {
      setCreatedUserId(regRes.userId);
      setStep('success');
    } else if (regRes.success) {
      setCreatedUserId(formData.email);
      setStep('success');
    } else {
      setError(regRes.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {step === 'details'
              ? 'Student Registration'
              : step === 'otp'
              ? 'Email Verification OTP'
              : 'Registration Successful!'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'details'
              ? 'Fill in your details below. An OTP will be sent to your email for verification.'
              : step === 'otp'
              ? `Enter the 6-digit security code sent to ${formData.email}`
              : 'Your account and User ID have been created successfully!'}
          </p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            {alreadyExists && (
              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-1 text-sky-600 dark:text-cyan-400 font-extrabold hover:underline pt-1"
              >
                <span>Click Here to Sign In to Existing Account</span>
              </Link>
            )}
          </div>
        )}

        {successMsg && step === 'otp' && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: FORM DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                <div className="relative mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Middle Name</label>
                <input
                  type="text"
                  placeholder="Middle (Optional)"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="email@tgpcet.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">College ID</label>
                <div className="relative mt-1">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="TGPCET-2026-101 (Optional)"
                    value={formData.college_id}
                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Current Education</label>
                <select
                  value={formData.current_education}
                  onChange={(e) => setFormData({ ...formData, current_education: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="BCA">BCA</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Password *</label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Dispatching OTP Code...' : 'Send OTP & Proceed'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION GRID */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-6 text-xs text-center">
            <div className="flex justify-center space-x-2 sm:space-x-3 my-4">
              {otpInput.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reg-otp-${idx}`}
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
              <span>OTP Expiry: 5 Minutes</span>
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

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Complete Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & USER ID DISPLAY */}
        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Email Verified Successfully!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your registration is complete and your unique User ID has been generated.
                </p>
              </div>

              {/* USER ID BADGE */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-inner space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Assigned User ID</span>
                <div className="text-2xl font-black text-sky-600 dark:text-cyan-400 font-mono tracking-wider">
                  {createdUserId}
                </div>
              </div>

              {/* ACCOUNT SUMMARY */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">FULL NAME</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formData.first_name} {formData.middle_name} {formData.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">EMAIL ADDRESS</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{formData.email}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 font-semibold block text-[10px]">PHONE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formData.phone}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 font-semibold block text-[10px]">EDUCATION</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formData.current_education}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Proceed to Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step !== 'success' && (
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
            Already registered?{' '}
            <Link href="/auth/login" className="font-extrabold text-sky-600 dark:text-cyan-400 hover:underline">
              Sign In Here
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
