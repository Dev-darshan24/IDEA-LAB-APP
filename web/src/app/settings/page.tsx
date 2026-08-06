'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon, KeyRound, HelpCircle, Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { validatePasswordStrength } from '@/lib/cryptoOtp';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, sendOtp, changePasswordWithOtp } = useAuth();

  const [step, setStep] = useState<'current_pass' | 'otp' | 'new_pass'>('current_pass');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>();

  // Step 1: Verify Current Password & Send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!user || !user.email) {
      setError('User email not found. Please log in again.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(user.email, 'change_password');
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setSuccess(`6-Digit OTP security code sent to ${user.email}. Valid for 5 minutes.`);
    } else {
      setError(res.message);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`sett-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`sett-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Proceed from OTP to New Password
  const handleProceedToNewPass = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpInput.join('');
    if (fullOtp.length < 6) {
      setError('Please enter complete 6-digit OTP code');
      return;
    }
    setError('');
    setStep('new_pass');
  };

  // Step 3: Complete Change Password
  const handleCompleteChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match! Please re-type.');
      return;
    }

    const passVal = validatePasswordStrength(newPassword);
    if (!passVal.valid) {
      setError(passVal.message || 'Password strength requirement not met.');
      return;
    }

    setLoading(true);
    const fullOtp = otpInput.join('');
    const res = await changePasswordWithOtp(currentPassword, fullOtp, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Password updated successfully! Previous sessions invalidated. Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1800);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          App Settings & Security
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage appearance themes, password security, and administrator contacts
        </p>
      </div>

      {/* 1. THEME SWITCH (LIGHT / DARK) */}
      <div className="glass-card p-6 rounded-3xl border border-sky-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-amber-400">
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appearance Theme</h3>
            <p className="text-xs text-slate-500">
              Current mode: <strong className="uppercase text-sky-600 dark:text-cyan-400">{theme} Mode</strong>
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:scale-105 transition shadow-md"
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      {/* 2. CHANGE PASSWORD (CURRENT PASS -> VERIFY -> EMAIL OTP -> NEW PASS -> INVALIDATE) */}
      <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500">Requires Current Password + Email OTP Verification</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: CURRENT PASSWORD */}
        {step === 'current_pass' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Enter Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center space-x-2"
            >
              <span>{loading ? 'Requesting OTP...' : 'Send OTP to Registered Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'otp' && (
          <form onSubmit={handleProceedToNewPass} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit Email OTP</label>
              <div className="flex space-x-2 my-2">
                {otpInput.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`sett-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 text-center text-lg font-black rounded-xl bg-slate-50 dark:bg-slate-900 border border-sky-500/30 text-slate-900 dark:text-white"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-2xl font-bold text-white bg-sky-600 hover:bg-sky-700 transition shadow-md flex items-center space-x-2"
            >
              <span>Verify OTP & Proceed to New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'new_pass' && (
          <form onSubmit={handleCompleteChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center space-x-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password & Logout All Devices'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* 3. HELP & SUPPORT */}
      <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Help & Technical Support</h3>
            <p className="text-xs text-slate-500">Contact IDEA LAB administrators or developer Darshan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
            <h4 className="font-bold text-slate-900 dark:text-white">Super Admin 1 (Incharge)</h4>
            <p className="text-slate-500 mt-1">Dr. Neeraj Waijode</p>
            <p className="text-sky-600 dark:text-cyan-400 font-medium">incharge@tgpcet.ac.in</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
            <h4 className="font-bold text-slate-900 dark:text-white">Super Admin 2 (Developer)</h4>
            <p className="text-slate-500 mt-1">Darshan (DRT-VERSE HQ)</p>
            <p className="text-sky-600 dark:text-cyan-400 font-medium">darshan@tgpcet.ac.in</p>
          </div>
        </div>
      </div>

    </div>
  );
}
