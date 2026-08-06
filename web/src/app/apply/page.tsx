'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Send, FileText, CheckCircle2, AlertCircle, Sparkles, Upload, FileCheck, Eye } from 'lucide-react';

export default function ApplyPage() {
  const { user } = useAuth();

  const [applyType, setApplyType] = useState<'event' | 'training' | 'project'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF document.');
      return;
    }

    setUploadingPdf(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('type', 'resume');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success && result.url) {
        setPdfUrl(result.url);
      } else {
        alert(result.message || 'Failed to upload PDF.');
      }
    } catch (err: any) {
      console.error('PDF upload error:', err);
      alert('Failed to upload PDF document.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Innovator';

    const newApp = {
      id: 'app-' + Date.now(),
      user_id: user?.id,
      applicant_name: fullName,
      applicant_email: user?.email || '',
      education: user?.current_education || 'B.Tech',
      title,
      type: applyType,
      description,
      abstract: description,
      pdf_url: pdfUrl,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0],
    };

    // Save to local storage for instant user profile persistence
    const existing = JSON.parse(localStorage.getItem('idea_lab_applications') || '[]');
    localStorage.setItem('idea_lab_applications', JSON.stringify([newApp, ...existing]));

    // Try Supabase insert if connected
    try {
      await supabase.from('applications').insert([
        {
          user_id: user?.id,
          title,
          type: applyType,
          description,
          pdf_url: pdfUrl,
          status: 'pending',
        },
      ]);
    } catch (e) {}

    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      
      {/* PAGE HEADER */}
      <div className="text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RESERVE & SUBMIT</span>
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          IDEA LAB Application Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Submit project proposals for 3D printing, CNC machining, or register for training bootcamps.
        </p>
      </div>

      {!user ? (
        <div className="glass-card p-8 rounded-4xl border border-sky-500/20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In Required to Submit</h2>
          <p className="text-xs text-slate-500">
            Guest users can browse facilities, but submitting project proposals requires an authenticated profile.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
            >
              Register Account
            </Link>
          </div>
        </div>
      ) : submitted ? (
        <div className="glass-card p-8 rounded-4xl border border-emerald-500/30 text-center space-y-4 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Application Submitted Successfully!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Your application for <strong>{title}</strong> has been routed to <strong>Dr. Neeraj Waijode (Incharge, AICTE IDEA LAB)</strong>. You will receive real-time updates on approval status.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <Link
              href="/profile"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              View In My Profile
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setTitle('');
                setDescription('');
                setPdfUrl('');
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
            >
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-4xl border border-sky-500/20 space-y-6 text-xs">
          
          {/* AUTO-POPULATED PROFILE BANNER */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-cyan-400">
                Applicant Details (Auto-Populated from Profile)
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {user.first_name} {user.last_name} ({user.current_education || 'B.Tech'})
              </p>
              <p className="text-[11px] text-slate-500">
                {user.email} • {user.phone} • College ID: {user.college_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/profile"
              className="text-[11px] font-bold text-sky-600 dark:text-cyan-400 underline shrink-0"
            >
              Edit Profile Info
            </Link>
          </div>

          {/* SELECT APPLICATION TYPE */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Select Application Type *</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { type: 'project', label: 'Project Proposal', desc: 'Requires PDF' },
                { type: 'training', label: 'Training Workshop', desc: 'Machine Bootcamps' },
                { type: 'event', label: 'Lab Event', desc: 'Hackathons & Seminars' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setApplyType(item.type as any)}
                  className={`p-4 rounded-2xl text-left border transition ${
                    applyType === item.type
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  <h4 className="font-bold text-xs">{item.label}</h4>
                  <p className={`text-[10px] mt-0.5 ${applyType === item.type ? 'text-sky-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">
              {applyType === 'project' ? 'Project Title *' : 'Event / Training Program Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                applyType === 'project'
                  ? 'e.g. Autonomous AI Inspection Rover'
                  : 'e.g. 6-Axis Robotic Arm Workshop'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* DESCRIPTION ABSTRACT */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Proposal Abstract & Technical Objectives *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe technical goals, machines required (e.g. 3D Printer, Laser cutter, PCB CNC), and timeline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* REQUIRED PDF FILE UPLOAD FOR PROJECT APPLICATION */}
          {applyType === 'project' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>Project Proposal Detail Document (PDF)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />

              {pdfUrl ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span>Project Proposal PDF Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-sky-600 dark:text-cyan-400 underline"
                  >
                    Change PDF
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-sky-500/30 bg-sky-50/50 dark:bg-slate-900/50 hover:bg-sky-100/50 transition cursor-pointer text-center space-y-1"
                >
                  <Upload className="w-6 h-6 text-sky-500 mx-auto" />
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    {uploadingPdf ? 'Uploading PDF...' : 'Choose Project Proposal PDF File'}
                  </p>
                  <p className="text-[10px] text-slate-400">Attach block diagrams, circuit schematics or CAD specs</p>
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Submit Application to IDEA LAB Incharge</span>
          </button>
        </form>
      )}

    </div>
  );
}
