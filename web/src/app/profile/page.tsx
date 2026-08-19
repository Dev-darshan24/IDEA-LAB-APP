'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Building, GraduationCap, MapPin, FileText, CheckCircle2, Clock, XCircle, Edit, Save, Send, Camera, Upload, Eye, FileCheck, Image as ImageIcon, X, Calendar } from 'lucide-react';
import { EducationType } from '@/types';

export default function ProfilePage() {
  const { user, updateProfile, isSuperAdmin1, isSuperAdmin2 } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    middle_name: user?.middle_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    college_id: user?.college_id || '',
    college_name: user?.college_name || 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
    current_education: (user?.current_education || 'B.Tech') as EducationType,
    gender: user?.gender || 'None',
    address: user?.address || 'None',
    avatar_url: user?.avatar_url || '',
    resume_url: user?.resume_url || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAppModal, setSelectedAppModal] = useState<any | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Dynamic Applications state fetched directly from Supabase database
  const [submittedApplications, setSubmittedApplications] = useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const fetchUserApps = async () => {
      try {
        let allUserApps: any[] = [];

        // 1. Fetch project proposals from Supabase
        const propRes = await fetch(`/api/proposals?user_id=${user.id}`, { cache: 'no-store' });
        const propData = await propRes.json();
        if (propData.success && Array.isArray(propData.proposals)) {
          const mappedProps = propData.proposals.map((p: any) => ({
            id: p.id,
            title: p.project_name,
            type: 'project',
            applicant_name: p.applicant_name || `${user.first_name} ${user.last_name}`,
            applicant_email: p.applicant_email || user.email,
            applicant_phone: p.applicant_phone || user.phone,
            department: p.department || 'Engineering',
            branch: p.branch || user.current_education || 'B.Tech',
            year: p.year || 'Final Year',
            roll_number: p.roll_number || user.college_id,
            abstract: p.project_description || p.problem_statement,
            description: p.project_description,
            pdf_url: p.document_path,
            status: p.status === 'submitted' ? 'pending' : (p.status || 'pending'),
            incharge_message: p.admin_comments || '',
            created_at: p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : 'Recent',
          }));
          allUserApps = [...allUserApps, ...mappedProps];
        }

        // 2. Fetch event & training registrations from Supabase + events list for full details
        const [actRes, evRes, actAppsRes] = await Promise.all([
          fetch('/api/activities', { cache: 'no-store' }),
          fetch('/api/events', { cache: 'no-store' }),
          fetch(`/api/activity-applications?user_id=${user.id}&email=${encodeURIComponent(user.email || '')}`, { cache: 'no-store' }),
        ]);

        const actData = await actRes.json();
        const evData = await evRes.json();
        const actAppsData = await actAppsRes.json();

        let allEventsList: any[] = [];
        if (actData.success && Array.isArray(actData.activities)) {
          allEventsList = [...allEventsList, ...actData.activities];
        }
        if (evData.success && Array.isArray(evData.events)) {
          allEventsList = [...allEventsList, ...evData.events];
        }

        if (actAppsData.success && Array.isArray(actAppsData.applications)) {
          const mappedActs = actAppsData.applications.map((a: any) => {
            const matchedEvent = allEventsList.find(
              (e) => e.id === a.activity_id || e.id === a.id || e.title?.toLowerCase() === a.activity_title?.toLowerCase() || e.title?.toLowerCase() === a.title?.toLowerCase()
            );

            const displayTitle = (matchedEvent?.title || a.activity_title || a.title || 'Event 1').replace(/^Event Application$/i, 'Event 1');
            const displayDesc = matchedEvent?.description || matchedEvent?.full_detail || a.description || 'Specialized training program hosted at AICTE IDEA Lab, TGPCET.';

            return {
              id: a.id,
              activity_id: a.activity_id,
              title: displayTitle,
              type: a.type || matchedEvent?.category?.toLowerCase() || 'event',
              applicant_name: a.applicant_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Participant',
              applicant_email: a.applicant_email || user.email,
              applicant_phone: a.applicant_phone || user.phone || '',
              department: a.department || 'Engineering',
              branch: a.branch || user.current_education || 'B.Tech',
              year: a.year || 'Final Year',
              roll_number: a.roll_number || user.college_id || '',
              status: a.status || 'approved',
              abstract: displayDesc,
              description: displayDesc,
              created_at: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : (a.created_at || 'Recent'),
              date: matchedEvent?.date || a.date || 'August 28, 2026',
              venue: matchedEvent?.venue || a.venue || 'AICTE IDEA Lab, TGPCET',
              organizer: matchedEvent?.organizer || matchedEvent?.trainer || 'Dr. Neeraj Waijode',
              incharge_message: a.admin_comments || a.incharge_message || '',
            };
          });

          const existingIds = new Set(allUserApps.map((x) => x.id));
          mappedActs.forEach((ma: any) => {
            if (!existingIds.has(ma.id)) {
              allUserApps.push(ma);
            }
          });
        }

        setSubmittedApplications(allUserApps);
      } catch (e) {
        console.error('Error fetching user applications from Supabase:', e);
      }
    };

    fetchUserApps();
  }, [user]);

  // Upload Profile Picture (Avatar)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadingAvatar(true);
    setUploadMessage('');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('type', 'avatar');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, avatar_url: result.url }));
        await updateProfile({ avatar_url: result.url });
        setUploadMessage('Profile picture updated successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        showError(result.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      showError('Failed to upload image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Upload Resume (PDF)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Please select a PDF file for your resume.');
      return;
    }

    setUploadingResume(true);
    setUploadMessage('');

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
        setFormData((prev) => ({ ...prev, resume_url: result.url }));
        await updateProfile({ resume_url: result.url });
        setUploadMessage('Resume PDF uploaded successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        showError(result.message || 'Failed to upload PDF.');
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      showError('Failed to upload PDF.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!user) {
    return (
      <div className="glass-card p-10 rounded-4xl border border-sky-500/20 text-center max-w-md mx-auto my-12 space-y-5">
        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest User Session</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You are currently browsing as a guest. Please log in or register a new account to view your profile, upload your profile picture & resume PDF, and submit project proposals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-500/20 transition text-center"
          >
            Log In
          </Link>
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-center"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  const currentAvatar = formData.avatar_url || user.avatar_url;
  const currentResume = formData.resume_url || user.resume_url;

  return (
    <div className="space-y-8 pb-12">
      
      {/* HIDDEN FILE INPUTS */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={resumeInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleResumeUpload}
        className="hidden"
      />

      {/* TOP HEADER BADGE */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-indigo-500/10">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 text-center sm:text-left">
          
          {/* PROFILE PICTURE CIRCLE */}
          <div
            className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={() => isEditing && photoInputRef.current?.click()}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-xl ring-4 ring-sky-500/40 overflow-hidden shrink-0">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Profile Picture" className="w-full h-full object-cover" />
              ) : (
                user.first_name?.[0]?.toUpperCase() || 'U'
              )}
            </div>

            {/* CAMERA OVERLAY (SHOWN ONLY WHEN EDITING OR HOVERED IN EDIT MODE) */}
            {isEditing && (
              <div className="absolute inset-0 rounded-full bg-slate-900/60 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">Change</span>
              </div>
            )}

            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-slate-900/80 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                Uploading...
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {user.first_name} {user.middle_name} {user.last_name}
            </h1>
            <p className="text-xs font-semibold text-sky-600 dark:text-cyan-400">
              {user.email} • <span className="uppercase">{user.role}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              {user.college_name}
            </p>

            {/* SMALL COMPACT PHOTO BUTTON (SHOWN ONLY WHEN EDITING) */}
            {isEditing && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 text-[11px] font-bold hover:bg-sky-200 transition mt-1"
              >
                <Camera className="w-3 h-3" />
                <span>{uploadingAvatar ? 'Uploading Photo...' : currentAvatar ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            )}
          </div>
        </div>

        {/* MAIN EDIT PROFILE / SAVE CHANGES BUTTON */}
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 shadow-md ${
            isEditing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-sky-600 text-white hover:bg-sky-700'
          }`}
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      {(savedSuccess || uploadMessage) && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{uploadMessage || 'Profile updated successfully!'}</span>
        </div>
      )}

      {/* PERSONAL & ACADEMIC DETAILS CARD */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sky-500/20 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-sky-500" />
            <span>Personal & Academic Details</span>
          </h2>
          {isEditing && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/20">
              Editing Mode Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
          
          {/* FIRST / MIDDLE / LAST NAME */}
          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.first_name}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">Middle Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.middle_name || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.last_name}</p>
            )}
          </div>

          {/* PHONE & COLLEGE ID */}
          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.phone}</p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">College ID</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.college_id}
                onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.college_id || 'Not specified'}</p>
            )}
          </div>

          {/* CURRENT EDUCATION (B.Tech, MBA, BCA, Other) */}
          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">Current Education</label>
            {isEditing ? (
              <select
                value={formData.current_education}
                onChange={(e) => setFormData({ ...formData, current_education: e.target.value as EducationType })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="MBA">MBA</option>
                <option value="BCA">BCA</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="font-semibold text-sky-600 dark:text-cyan-400 mt-1">{user.current_education || 'B.Tech'}</p>
            )}
          </div>

          {/* GENDER & ADDRESS */}
          <div>
            <label className="font-bold text-slate-500 dark:text-slate-400">Gender</label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              >
                <option value="None">None</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.gender || 'None'}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="font-bold text-slate-500 dark:text-slate-400">Address</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address or leave as None"
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{user.address || 'None'}</p>
            )}
          </div>

          {/* COMPACT UPLOAD BUTTONS - ONLY APPEARS WHEN EDITING */}
          {isEditing && (
            <div>
              <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Resume Document (PDF)
              </label>
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                className="w-full p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingResume ? 'Uploading...' : currentResume ? 'Replace Resume PDF' : 'Upload Resume PDF'}</span>
              </button>
            </div>
          )}

        </div>

        {/* RESUME PDF VIEW BADGE (WHEN NOT EDITING) */}
        {!isEditing && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <FileText className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Resume Document (PDF):</span>
            </div>
            {currentResume ? (
              <a
                href={currentResume}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-sm flex items-center space-x-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Resume PDF</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">No resume PDF uploaded yet. Click "Edit Profile" to upload.</span>
            )}
          </div>
        )}
      </div>

      {/* APPLY THINGS - SUBMITTED APPLICATIONS HISTORY */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sky-500/20 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Send className="w-5 h-5 text-sky-500" />
            <span>Apply Things (Submitted Applications)</span>
          </h2>
          {!isSuperAdmin1 && !isSuperAdmin2 && (
            <Link
              href="/apply"
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition"
            >
              + Submit New Application
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {submittedApplications.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">No applications submitted yet</p>
              <p className="text-[11px] text-slate-400">Click "+ Submit New Application" above to apply for equipment access, 3D printing, or training bootcamps.</p>
            </div>
          ) : (
            submittedApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedAppModal(app)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10 hover:border-sky-500/40 cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition">{app.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 uppercase">
                      {app.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Submitted on {app.created_at || app.date || 'Recent'}</p>
                </div>

                <div className="flex items-center space-x-3">
                  {(app.type === 'project' || app.type === 'proposal') && (
                    <>
                      {app.status === 'approved' ? (
                        <span className="px-3 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved by Incharge</span>
                        </span>
                      ) : app.status === 'rejected' ? (
                        <span className="px-3 py-1 rounded-full font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Under Review</span>
                        </span>
                      )}
                    </>
                  )}
                  <button className="p-1.5 rounded-xl bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition" title="View Application Details">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* APPLICATION DETAILS MODAL */}
      {selectedAppModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl p-6 space-y-5 relative my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {selectedAppModal.type || 'Event'}
                </span>
                <h4 className="font-bold text-base text-white truncate max-w-xs">{selectedAppModal.title}</h4>
              </div>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">

              {/* EVENT SPECIFIC METADATA CARD */}
              {(selectedAppModal.type === 'event' || selectedAppModal.type === 'training' || selectedAppModal.type === 'activity') && (
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-2 text-slate-300">
                  <p className="text-[10px] uppercase font-bold text-sky-400">Event / Activity Details</p>
                  <p className="flex items-center gap-2 font-medium text-white">
                    <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Date: {selectedAppModal.date || 'August 28, 2026'}</span>
                  </p>
                  <p className="flex items-center gap-2 font-medium text-white">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Venue: {selectedAppModal.venue || 'AICTE IDEA Lab, TGPCET'}</span>
                  </p>
                  <p className="flex items-center gap-2 font-medium text-white">
                    <User className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>IDEA Lab Incharge: {selectedAppModal.organizer || 'Dr. Neeraj Waijode'}</span>
                  </p>
                </div>
              )}

              {/* APPLICANT INFO */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Applicant Details</p>
                <p className="font-bold text-sm text-white">{selectedAppModal.applicant_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Participant'}</p>
                <p className="text-slate-300">{selectedAppModal.applicant_email || user?.email} • {selectedAppModal.applicant_phone || user?.phone || 'Phone N/A'}</p>
                <p className="text-slate-400">{selectedAppModal.branch || selectedAppModal.education || user?.current_education || 'B.Tech'} {selectedAppModal.department ? `(${selectedAppModal.department})` : ''}</p>
                <p className="text-slate-500 text-[11px]">Registered On: {selectedAppModal.created_at || selectedAppModal.date || 'Recent'}</p>
              </div>

              {/* DESCRIPTION / OVERVIEW */}
              {(selectedAppModal.abstract || selectedAppModal.description) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Overview & Summary</p>
                  <p className="text-slate-300 leading-relaxed p-3 rounded-2xl bg-slate-800/40 border border-slate-800/60">
                    {selectedAppModal.abstract || selectedAppModal.description}
                  </p>
                </div>
              )}

              {/* STATUS FOR PROJECTS */}
              {(selectedAppModal.type === 'project' || selectedAppModal.type === 'proposal') ? (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-400">Project Status</span>
                  <span className={`px-3 py-1 rounded-full font-bold text-[11px] uppercase ${
                    selectedAppModal.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : selectedAppModal.status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedAppModal.status || 'Under Review'}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Registration Status</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Confirmed & Registered
                  </span>
                </div>
              )}

              {/* PDF ATTACHMENT */}
              {selectedAppModal.pdf_url && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Project Proposal PDF</span>
                  </div>
                  <a
                    href={selectedAppModal.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                  >
                    View PDF
                  </a>
                </div>
              )}

              {/* INCHARGE COMMENTS */}
              {selectedAppModal.incharge_message && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                  <p className="font-bold text-[10px] uppercase">Incharge Feedback:</p>
                  <p>{selectedAppModal.incharge_message}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAppModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
