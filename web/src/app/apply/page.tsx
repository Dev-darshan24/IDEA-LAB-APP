'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import {
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  FileCheck,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  GraduationCap,
  BookOpen,
  Check,
  XCircle,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { IdeaLabActivityRecord } from '../api/activities/route';
import { ProjectProposalRecord } from '../api/proposals/route';
import { ActivityApplicationRecord } from '../api/activity-applications/route';

export default function ApplyPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();
  const isSuperAdmin = isSuperAdmin1 || isSuperAdmin2;

  // Active Tab: proposals | activities | history
  const [activeTab, setActiveTab] = useState<'proposals' | 'activities' | 'history'>('proposals');

  // --- TAB 1: PROJECT PROPOSAL STATE ---
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState('');
  const [proposalError, setProposalError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TAB 2: ACTIVITIES / TRAINING STATE ---
  const [activities, setActivities] = useState<IdeaLabActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<IdeaLabActivityRecord | null>(null);
  const [applyingActivityId, setApplyingActivityId] = useState<string | null>(null);
  const [activitySuccess, setActivitySuccess] = useState('');
  const [activityError, setActivityError] = useState('');

  // --- TAB 3: MY APPLICATIONS HISTORY STATE ---
  const [userProposals, setUserProposals] = useState<ProjectProposalRecord[]>([]);
  const [userActivityApps, setUserActivityApps] = useState<ActivityApplicationRecord[]>([]);
  const [allActivityApps, setAllActivityApps] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fast O(1) Map lookup for user applied activities
  const appliedActivityIdsMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    if (!user) return map;

    const userEmail = (user.email || '').trim().toLowerCase();
    const userId = (user.id || '').trim();

    userActivityApps.forEach((app) => {
      if (app.activity_id) map.set(app.activity_id, true);
      if (app.id) map.set(app.id, true);
      if (app.activity_title) map.set(app.activity_title.trim().toLowerCase(), true);
      if (app.title) map.set(app.title.trim().toLowerCase(), true);
    });

    allActivityApps.forEach((app) => {
      const appEmail = (app.applicant_email || app.email || '').trim().toLowerCase();
      const appUserId = (app.user_id || '').trim();
      const userMatch = (userEmail && appEmail === userEmail) || (userId && appUserId === userId);
      if (userMatch) {
        if (app.activity_id) map.set(app.activity_id, true);
        if (app.event_id) map.set(app.event_id, true);
        if (app.id) map.set(app.id, true);
        if (app.activity_title) map.set(app.activity_title.trim().toLowerCase(), true);
        if (app.title) map.set(app.title.trim().toLowerCase(), true);
      }
    });

    return map;
  }, [user, userActivityApps, allActivityApps]);

  const isAppliedToActivity = (activityId?: string, activityTitle?: string) => {
    if (!user) return false;
    if (activityId && appliedActivityIdsMap.has(activityId)) return true;
    if (activityTitle && appliedActivityIdsMap.has(activityTitle.trim().toLowerCase())) return true;
    return false;
  };

  const showError = (msg: string, type: 'proposal' | 'activity' = 'proposal') => {
    if (type === 'proposal') {
      setProposalError(msg);
      setTimeout(() => setProposalError(''), 6000);
    } else {
      setActivityError(msg);
      setTimeout(() => setActivityError(''), 6000);
    }
  };

  // --- GLOBAL APPLY FORM CONFIG FROM SUPABASE ---
  const [formConfig, setFormConfig] = useState({
    titleQuestion: 'Project Name / Title *',
    problemQuestion: 'Problem Statement & Objective *',
    descriptionQuestion: 'Detailed Project Abstract & Technical Requirements *',
    requirePdfUpload: true,
    eligibilityNote: 'Open for all student innovators & faculty teams at TGPCET AICTE IDEA LAB.',
  });

  const fetchApplyConfig = async () => {
    try {
      const res = await fetch('/api/apply-config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.config) {
        setFormConfig(data.config);
      }
    } catch (e) {
      console.error('Error fetching apply config:', e);
    }
  };

  // Fetch Available Activities & Events globally from Supabase
  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const [actRes, evRes, appsRes] = await Promise.all([
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/activity-applications?all=true', { cache: 'no-store' }),
      ]);
      const actData = await actRes.json();
      const evData = await evRes.json();
      const appsData = await appsRes.json();

      if (appsData.success && Array.isArray(appsData.applications)) {
        setAllActivityApps(appsData.applications);
      }

      let combined: IdeaLabActivityRecord[] = [];

      if (actData.success && Array.isArray(actData.activities)) {
        combined = [...actData.activities];
      }

      if (evData.success && Array.isArray(evData.events)) {
        const convertedEvents: IdeaLabActivityRecord[] = evData.events.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          type: e.category ? e.category.toLowerCase() : 'event',
          date: e.date || 'TBD',
          venue: 'AICTE IDEA Lab, TGPCET',
          organizer: e.trainer || 'Dr. Neeraj Waijode',
          registration_open: e.status !== 'Closed',
          max_participants: e.seats ? parseInt(e.seats) || 50 : 50,
          status: 'published',
        }));

        const existingIds = new Set(combined.map((a) => a.id));
        convertedEvents.forEach((ce) => {
          if (!existingIds.has(ce.id)) {
            combined.push(ce);
          }
        });
      }

      setActivities(combined);
    } catch (e) {
      console.error('Error fetching activities and events:', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch User Applications History from Supabase
  const fetchUserHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      // 1. Fetch Proposals
      const propRes = await fetch(`/api/proposals?user_id=${user.id}`, { cache: 'no-store' });
      const propData = await propRes.json();
      if (propData.success && Array.isArray(propData.proposals)) {
        setUserProposals(propData.proposals);
      }

      // 2. Fetch Activity Registrations
      const actRes = await fetch(`/api/activity-applications?user_id=${user.id}&email=${encodeURIComponent(user.email || '')}`, { cache: 'no-store' });
      const actData = await actRes.json();
      if (actData.success && Array.isArray(actData.applications)) {
        setUserActivityApps(actData.applications);
      }
    } catch (e) {
      console.error('Error fetching application history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useRealtimeSync('applications', () => {
    fetchActivities();
    if (user?.id) fetchUserHistory();
  });
  useRealtimeSync('events', () => {
    fetchActivities();
  });

  useEffect(() => {
    fetchApplyConfig();
    fetchActivities();
    if (user?.id) {
      fetchUserHistory();
    }
  }, [user?.id]);

  // Handle PDF Upload to Supabase Storage
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('Please upload a valid PDF document (.pdf file only).', 'proposal');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showError('PDF document file size must be less than 15MB.', 'proposal');
      return;
    }

    setUploadingPdf(true);
    setPdfFileName(file.name);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('user_id', user?.id || 'guest');

      const res = await fetch('/api/upload-proposal-pdf', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success && result.url) {
        setPdfUrl(result.url);
      } else {
        showError(result.message || 'Failed to upload proposal PDF.', 'proposal');
      }
    } catch (err: any) {
      console.error('PDF upload error:', err);
      showError('Failed to upload PDF document.', 'proposal');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Submit Project Proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!projectName.trim() || !projectDescription.trim()) {
      showError('Project Name and Description are required.', 'proposal');
      return;
    }

    if (!pdfUrl) {
      showError('Please upload your Project Proposal PDF document before submitting.', 'proposal');
      return;
    }

    setSubmittingProposal(true);

    const payload = {
      user_id: user.id,
      applicant_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Innovator',
      applicant_email: user.email || '',
      applicant_phone: user.phone || '',
      college_institution: user.college_name || 'TGPCET Nagpur',
      department: user.department || user.current_education || 'Engineering',
      branch: user.current_education || 'B.Tech',
      year: 'Final Year',
      roll_number: user.college_id || '',
      project_name: projectName.trim(),
      problem_statement: problemStatement.trim() || projectDescription.trim(),
      project_description: projectDescription.trim(),
      document_path: pdfUrl,
    };

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        setProposalSuccess('Project proposal submitted successfully to IDEA Lab Incharge!');
        setProjectName('');
        setProblemStatement('');
        setProjectDescription('');
        setPdfUrl('');
        setPdfFileName('');

        // Refresh user history and switch tab
        fetchUserHistory();
        setTimeout(() => {
          setProposalSuccess('');
          setActiveTab('history');
        }, 2000);
      } else {
        showError(result.message || 'Failed to submit project proposal.', 'proposal');
      }
    } catch (err: any) {
      console.error('Proposal submission error:', err);
      showError('Unable to submit your application. Please try again.', 'proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Submit Activity Application
  const handleConfirmActivityApplication = async () => {
    if (!selectedActivity?.id) return;
    if (!user) {
      showError('Please log in or register an account to apply for opportunities.', 'activity');
      return;
    }

    setApplyingActivityId(selectedActivity.id);

    const payload = {
      activity_id: selectedActivity.id,
      activity_title: selectedActivity.title || 'Event 1',
      type: selectedActivity.type ? selectedActivity.type.toLowerCase() : 'event',
      user_id: user.id || 'guest',
      applicant_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Participant',
      applicant_email: user.email || '',
      applicant_phone: user.phone || '',
      department: user.department || 'Engineering',
      branch: user.current_education || 'B.Tech',
      year: 'Final Year',
      roll_number: user.college_id || '',
    };

    try {
      const res = await fetch('/api/activity-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        const newRecord: ActivityApplicationRecord = {
          id: result.application?.id || crypto.randomUUID(),
          activity_id: selectedActivity.id,
          activity_title: selectedActivity.title,
          title: selectedActivity.title,
          applicant_name: payload.applicant_name,
          applicant_email: payload.applicant_email,
          user_id: payload.user_id,
          status: 'approved',
          applied_at: new Date().toISOString(),
        };

        setUserActivityApps((prev) => [newRecord, ...prev]);
        setActivitySuccess(`Your application for "${selectedActivity.title}" has been submitted! Check status in your Profile.`);
        setSelectedActivity(null);

        fetchActivities();
        fetchUserHistory();
        setTimeout(() => {
          setActivitySuccess('');
        }, 4000);
      } else if (result.isDuplicate || res.status === 409) {
        const newRecord: ActivityApplicationRecord = {
          id: crypto.randomUUID(),
          activity_id: selectedActivity.id,
          activity_title: selectedActivity.title,
          title: selectedActivity.title,
          applicant_name: payload.applicant_name,
          applicant_email: payload.applicant_email,
          user_id: payload.user_id,
          status: 'approved',
          applied_at: new Date().toISOString(),
        };
        setUserActivityApps((prev) => [newRecord, ...prev]);
        setSelectedActivity(null);
        showError('You have already applied for this event.', 'activity');
        fetchUserHistory();
      } else {
        showError(result.message || 'Failed to apply for activity.', 'activity');
      }
    } catch (err: any) {
      console.error('Activity application error:', err);
      showError('Unable to submit your activity registration. Please try again.', 'activity');
    } finally {
      setApplyingActivityId(null);
    }
  };



  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* PAGE HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>APPLY & INNOVATE</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          IDEA LAB Apply Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Submit project proposals for 3D printing, PCB CNC machining, or register for specialized IDEA Lab training bootcamps.
        </p>
      </div>

      {/* UNAUTHENTICATED GUARD */}
      {!user ? (
        <div className="glass-card p-8 md:p-12 rounded-4xl border border-sky-500/20 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Please login/register to apply</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Anonymous users are not allowed to submit applications. Please sign in to your authenticated IDEA Lab user account.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-500/25 transition"
            >
              Sign In to Account
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
            >
              Register New Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB NAVIGATION HEADER */}
          <div className="flex flex-wrap p-1.5 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('proposals')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'proposals'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Project Proposal</span>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'activities'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Training & Activities</span>
            </button>
          </div>

          {/* AUTO-POPULATED APPLICANT PROFILE BANNER */}
          <div className="glass-card p-5 rounded-3xl border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500/5 to-cyan-500/5">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-cyan-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Authenticated Applicant Profile (Auto-Filled)
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {user.first_name} {user.middle_name || ''} {user.last_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email} • {user.phone || 'Phone N/A'} • {user.college_name || 'TGPCET Nagpur'}
              </p>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Dept: {user.department || 'Engineering'} | Edu: {user.current_education || 'B.Tech'} | Roll/ID: {user.college_id || 'N/A'}
              </p>
            </div>
            <Link
              href="/profile"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 transition shrink-0 border border-slate-700/20"
            >
              Edit Profile Info
            </Link>
          </div>

          {/* ================= TAB 1: PROJECT PROPOSAL ================= */}
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              
              {proposalSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{proposalSuccess}</span>
                </div>
              )}

              {proposalError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{proposalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="glass-card p-6 md:p-8 rounded-4xl border border-sky-500/20 space-y-6 text-xs">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-sky-500" />
                    <span>Submit Project Proposal</span>
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    {formConfig.eligibilityNote || 'Permanent submission for 3D printer, PCB CNC, or robotics lab hardware execution.'}
                  </p>
                </div>

                {/* PROJECT NAME */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {formConfig.titleQuestion || 'Project Name / Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autonomous AI Inspection Rover for Industrial Pipe Leakage"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* PROBLEM STATEMENT / OBJECTIVE */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {formConfig.problemQuestion || 'Problem Statement & Objective *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. To eliminate hazardous human inspection in high-pressure chemical conduits using ROS2 & SLA printed chassis"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* PROJECT DESCRIPTION */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {formConfig.descriptionQuestion || 'Detailed Project Abstract & Technical Requirements *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe hardware requirements (e.g. 3D Printer resin, PCB Milling machine, CNC Router), estimated timeline, and expected outcomes..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* REQUIRED PDF FILE UPLOAD */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-500" />
                      <span>Project Proposal Detail Document (PDF Required) *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Max 15MB (.pdf format only)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />

                  {pdfUrl ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                        <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div className="truncate max-w-xs md:max-w-md">
                          <p className="truncate">{pdfFileName || 'Project_Proposal.pdf'}</p>
                          <p className="text-[10px] text-emerald-500 font-normal">Attached to Supabase Storage</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold shrink-0 hover:bg-sky-500 transition"
                      >
                        Change PDF
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-6 rounded-2xl border-2 border-dashed border-sky-500/30 bg-sky-50/50 dark:bg-slate-900/50 hover:bg-sky-100/50 transition cursor-pointer text-center space-y-2"
                    >
                      <Upload className="w-7 h-7 text-sky-500 mx-auto animate-pulse" />
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        {uploadingPdf ? 'Uploading PDF to Supabase Storage...' : 'Click to Upload Project Proposal PDF File'}
                      </p>
                      <p className="text-[10px] text-slate-400">Include block diagrams, circuit schematics, bill of materials, or CAD specs</p>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingProposal || uploadingPdf}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-xl shadow-sky-500/20 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingProposal ? 'Submitting to Supabase...' : 'Submit Project Proposal to IDEA LAB Incharge'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 2: TRAINING & ACTIVITIES ================= */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              
              {activitySuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{activitySuccess}</span>
                </div>
              )}

              {activityError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{activityError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-sky-500" />
                    <span>Available Training Programs & Activities</span>
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Live bootcamps, equipment workshops, and hackathons hosted at AICTE IDEA Lab.
                  </p>
                </div>
                <button
                  onClick={fetchActivities}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
                  title="Refresh Opportunities"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingActivities ? 'animate-spin text-sky-500' : ''}`} />
                </button>
              </div>

              {loadingActivities ? (
                <div className="glass-card p-12 rounded-3xl text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Loading available opportunities from Supabase...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl text-center space-y-3 border border-slate-800">
                  <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">No active training programs or events available at this moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((act) => {
                    const alreadyApplied = isAppliedToActivity(act.id, act.title);
                    const registeredCount = allActivityApps.filter(
                      (a) => a.activity_id === act.id || a.activity_title?.toLowerCase() === act.title?.toLowerCase() || a.title?.toLowerCase() === act.title?.toLowerCase()
                    ).length;
                    const spotsFilled = (act.enrolled_count || 0) + registeredCount;
                    const maxSpots = act.max_participants || 50;
                    const isLimitReached = spotsFilled >= maxSpots;
                    const isClosed = act.registration_open === false || act.status === 'closed';

                    return (
                      <div
                        key={act.id}
                        className="glass-card p-6 rounded-3xl border border-sky-500/20 flex flex-col justify-between space-y-4 hover:border-sky-500/40 transition group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/10 text-sky-600 dark:text-cyan-400 border border-sky-500/20">
                              {act.type || 'Training'}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isClosed
                                ? 'bg-red-500/10 text-red-500'
                                : isLimitReached
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {isClosed ? 'Registration Closed' : isLimitReached ? 'Limit Reached' : 'Registration Open'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-500 transition line-clamp-2">
                            {act.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {act.description}
                          </p>

                          <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <p className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>{act.date || 'TBD'}</span>
                              {act.start_time && <span>({act.start_time})</span>}
                            </p>
                            <p className="flex items-center gap-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="truncate">{act.venue || 'AICTE IDEA Lab'}</span>
                            </p>
                            <p className="flex items-center gap-1.5 font-medium">
                              <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>Trainer: {act.organizer || 'Dr. Neeraj Waijode'}</span>
                            </p>
                            <p className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-cyan-400">
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span>{spotsFilled} / {maxSpots} Participants Registered</span>
                            </p>
                          </div>
                        </div>

                        {/* APPLY BUTTON */}
                        <div className="pt-2">
                          {loadingActivities || loadingHistory ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-800/60 border border-slate-700/30 flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                              <span>Checking...</span>
                            </button>
                          ) : applyingActivityId === act.id ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl font-bold text-xs text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center gap-1.5 cursor-not-allowed shadow-inner"
                            >
                              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                              <span>Submitting...</span>
                            </button>
                          ) : alreadyApplied ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-not-allowed shadow-inner"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Already Applied</span>
                            </button>
                          ) : isClosed || isLimitReached ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-700/20 flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{isClosed ? 'Registration Closed' : 'Limit Reached'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedActivity(act)}
                              className="w-full py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <span>Apply Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* CONFIRMATION MODAL FOR ACTIVITY APPLICATION */}
      {selectedActivity && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl p-6 space-y-5 relative my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> Confirm Activity Application
              </h4>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <p className="text-[10px] font-bold uppercase text-sky-400">Selected Opportunity</p>
                <h5 className="font-bold text-xs text-white">{selectedActivity.title}</h5>
                <p className="text-[11px] text-slate-400">{selectedActivity.date} • {selectedActivity.venue}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
                <p className="text-[10px] font-bold uppercase text-cyan-400">Applicant Details (Auto-Filled)</p>
                <p className="font-bold text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-slate-400">{user?.email} • {user?.phone}</p>
                <p className="text-slate-400">{user?.current_education || 'B.Tech'} • Dept: {user?.department || 'Engineering'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActivityApplication}
                disabled={applyingActivityId === selectedActivity.id}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
              >
                {applyingActivityId === selectedActivity.id ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
