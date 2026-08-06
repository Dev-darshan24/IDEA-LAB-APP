'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, resendVerificationEmail } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needRegister, setNeedRegister] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNeedRegister(false);
    setUnverifiedEmail('');
    setLoading(true);

    const res = await login(emailOrPhone, password);
    setLoading(false);

    if (res.success) {
      // Role Routing: user -> /profile, superadmin_1 -> /admin/incharge, superadmin_2 -> /admin/developer
      const role = res.role?.toLowerCase();
      if (role === 'superadmin_1' || role === 'admin_incharge') {
        router.push('/admin/incharge');
      } else if (role === 'superadmin_2' || role === 'admin_developer') {
        router.push('/admin/developer');
      } else {
        router.push('/profile');
      }
    } else {
      setError(res.message);
      if (res.message.includes('not found') || res.message.includes('register first')) {
        setNeedRegister(true);
      }
      if (res.message.includes('verify your email')) {
        setUnverifiedEmail(emailOrPhone.includes('@') ? emailOrPhone : '');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setLoading(true);
    const res = await resendVerificationEmail(unverifiedEmail);
    setLoading(false);
    if (res.success) {
      setSuccess(`Verification OTP sent to ${unverifiedEmail}. Please verify your email.`);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Sign In to IDEA LAB
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your profile, reserve prototyping equipment & submit project proposals
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>

            {needRegister && (
              <Link
                href="/auth/register"
                className="inline-flex items-center space-x-1 text-sky-600 dark:text-cyan-400 font-extrabold hover:underline pt-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Click Here to Register Your Account</span>
              </Link>
            )}

            {unverifiedEmail && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Verification Email</span>
              </button>
            )}
          </div>
        )}

        {/* SUCCESS STATE */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            {success}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Registered Email ID or Phone</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter your registered email or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] font-bold text-sky-600 dark:text-cyan-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
          Don't have an account yet?{' '}
          <Link href="/auth/register" className="font-extrabold text-sky-600 dark:text-cyan-400 hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
