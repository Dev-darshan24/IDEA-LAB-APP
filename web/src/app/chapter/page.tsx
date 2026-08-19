'use client';

import React, { useState, useEffect } from 'react';
import { ChapterMember } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ImageAdjuster } from '@/components/ImageAdjuster';
import {
  Sparkles,
  Linkedin,
  Target,
  Lightbulb,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  X,
  Users,
  UserCheck,
  GraduationCap,
  Crown,
  Award,
  AlertCircle
} from 'lucide-react';

// Client-side image compression helper
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve('');
  });
}

export default function StudentInnovationChapterPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();

  // SuperAdmin privilege check: Both SuperAdmin 1 (Incharge) and SuperAdmin 2 (Developer) can add, edit, and delete
  const currentRole = user?.role?.toLowerCase();
  const canManageChapter = Boolean(
    user && (
      isSuperAdmin1 || 
      isSuperAdmin2 || 
      currentRole === 'superadmin_1' || 
      currentRole === 'superadmin_2' || 
      currentRole === 'admin_incharge' || 
      currentRole === 'admin_developer' ||
      user?.email?.toLowerCase().includes('incharge') ||
      user?.email?.toLowerCase().includes('darshan')
    )
  );

  const [members, setMembers] = useState<ChapterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ChapterMember | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'leadership' | 'member'>('member');
  const [bioInput, setBioInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [adjustedPhotoSrc, setAdjustedPhotoSrc] = useState<string>('');
  const [displayOrderInput, setDisplayOrderInput] = useState<number>(1);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Fetch chapter team members from API
  const fetchChapterMembers = async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/chapter', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
        localStorage.setItem('idea_lab_chapter', JSON.stringify(data.members));
      }
    } catch (e) {
      console.error('Error fetching chapter members:', e);
      const stored = localStorage.getItem('idea_lab_chapter');
      if (stored) {
        try { setMembers(JSON.parse(stored)); } catch (err) {}
      }
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChapterMembers();
    const interval = setInterval(() => {
      fetchChapterMembers();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Open Modal for Add Member
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setNameInput('');
    setRoleInput('');
    setBranchInput('Computer Science & Engineering');
    setCategoryInput('member');
    setBioInput('');
    setLinkedinInput('');
    setPhotoUrlInput('');
    setFilePreview(null);
    setUploadMethod('url');
    setDisplayOrderInput(members.length + 1);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Member
  const handleOpenEditModal = (mem: ChapterMember) => {
    setEditingMember(mem);
    setNameInput(mem.name);
    setRoleInput(mem.role);
    setBranchInput(mem.branch || 'Computer Science & Engineering');
    setCategoryInput(mem.category || (mem.display_order <= 3 ? 'leadership' : 'member'));
    setBioInput(mem.bio || '');
    setLinkedinInput(mem.linkedin_url || '');
    setPhotoUrlInput(mem.photo_url || '');
    setFilePreview(null);
    setUploadMethod('url');
    setDisplayOrderInput(mem.display_order || 1);
    setIsModalOpen(true);
  };

  // File Upload with Auto Compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setFilePreview(compressed);
        setPhotoUrlInput(compressed);
      } catch (err) {
        console.error('Photo upload error:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Save Member (Add or Edit) via POST /api/chapter
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !roleInput.trim()) {
      showError('Please fill out Member Name and Role/Post.');
      return;
    }

    const finalPhoto = adjustedPhotoSrc || (uploadMethod === 'file' ? (filePreview || '') : photoUrlInput);
    if (!finalPhoto.trim()) {
      showError('Please provide a Photo URL or upload an image file.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: editingMember ? editingMember.id : undefined,
      name: nameInput.trim(),
      role: roleInput.trim(),
      branch: branchInput.trim(),
      category: categoryInput,
      bio: bioInput.trim(),
      linkedin_url: linkedinInput.trim(),
      photo_url: finalPhoto.trim(),
      display_order: displayOrderInput,
    };

    try {
      const res = await fetch('/api/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.members) {
        setMembers(data.members);
      }

      setIsModalOpen(false);
      setSuccessMsg(editingMember ? 'Chapter member updated globally!' : 'New Chapter member added globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to save chapter member to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Member via DELETE /api/chapter?id=...
  const handleDeleteMember = async (id: string) => {
    if (!id) return;
    setDeleteConfirmId(null);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/chapter?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
      setSuccessMsg('Chapter member deleted globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to delete chapter member from server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Leadership (Top 3 Cards) vs General Member List (5-Column Grid)
  const leadershipMembers = members.filter(
    (m) => m.category === 'leadership' || (!m.category && m.display_order <= 3)
  );
  const generalMembers = members.filter(
    (m) => m.category === 'member' || (!m.category && m.display_order > 3)
  );

  return (
    <div className="space-y-12 pb-16">
      
      {/* BANNER HEADER */}
      <div className="glass-card p-8 md:p-12 rounded-4xl border border-sky-500/20 text-center relative overflow-hidden bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center space-x-1 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDENT INNOVATION CHAPTER</span>
          </span>
          <button
            onClick={() => fetchChapterMembers(true)}
            title="Refresh Live Chapter Team"
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Innovation Chapter Members
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-2">
          AICTE IDEA LAB • Tulsiramji Gaikwad Patil College of Engineering & Technology
        </p>

        {/* Toast Alert */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
            <button onClick={() => setErrorMsg('')} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* VISION & MISSION CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3 bg-gradient-to-br from-sky-500/5 to-cyan-500/5">
          <div className="flex items-center space-x-3 text-sky-600 dark:text-cyan-400">
            <Target className="w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chapter Vision</h3>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            "To create a culture where every student is encouraged to innovate, collaborate, and effectively utilize the resources of IDEA LAB for personal, academic, institutional, and societal growth."
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Core Objectives</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Drive hands-on student participation in interdisciplinary projects.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Organize national hackathons, 3D printing & robotics bootcamps.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Facilitate patent filing, startup incubation & industrial mentorship.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SECTION: 3 CARDS SIDE BY SIDE (EXECUTIVE LEADERSHIP) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                Chapter Leadership
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Core student coordinators leading the Innovation Chapter
            </p>
          </div>

          {canManageChapter && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Chapter Member
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Loading chapter members...</p>
          </div>
        ) : leadershipMembers.length === 0 ? (
          <div className="glass-card p-8 text-center rounded-3xl border border-sky-500/20 space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No leadership members designated yet.</p>
          </div>
        ) : (
          /* 3 CARDS CENTERED SIDE-BY-SIDE IN A ROW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {leadershipMembers.slice(0, 3).map((member) => {
              const linkedinUrl = (member.linkedin_url && member.linkedin_url.trim() !== '')
                ? member.linkedin_url.trim()
                : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(member.name)}`;

              return (
                <div
                  key={member.id}
                  className="glass-card glass-card-hover rounded-3xl p-6 border-2 border-sky-500/40 dark:border-sky-500/30 flex flex-col items-center text-center space-y-4 relative group bg-gradient-to-b from-sky-500/10 via-slate-900/40 to-slate-900/80 shadow-xl h-full justify-between"
                >
                  {/* TOP LEADERSHIP BADGE */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Core Lead
                  </span>

                  {/* SUPERADMIN EDIT & DELETE BUTTONS */}
                  {canManageChapter && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        title="Edit Member (Superadmin)"
                        className="p-1.5 rounded-full bg-sky-600/80 hover:bg-sky-600 text-white shadow-md backdrop-blur-md transition group-hover:scale-105"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        title="Delete Member (Superadmin)"
                        className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-md backdrop-blur-md transition group-hover:scale-105"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* CIRCULAR PHOTO FRAME */}
                  <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-sky-400 shadow-xl shrink-0 bg-slate-950 mt-4 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center text-sky-400 font-bold">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-12 h-12 text-sky-400" />
                    )}
                  </div>

                  {/* DETAILS: NAME, POST, BRANCH */}
                  <div className="space-y-2 w-full flex-1 flex flex-col justify-between">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                      {member.name}
                    </h3>
                    
                    {/* POST / ROLE */}
                    <div>
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase bg-sky-500/20 text-sky-700 dark:text-cyan-300 border border-sky-500/30">
                        {member.role}
                      </span>
                    </div>

                    {/* BRANCH */}
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
                      <GraduationCap className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>{member.branch || 'Computer Science & Engineering'}</span>
                    </div>
                  </div>

                  {/* LINKEDIN ALWAYS VISIBLE */}
                  <div className="mt-auto pt-2 w-full">
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={`${member.name} LinkedIn Profile`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-600 dark:text-cyan-400 hover:text-white transition border border-sky-500/20 shadow-sm text-xs font-bold w-full"
                    >
                      <Linkedin className="w-4 h-4 shrink-0" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* HORIZONTAL LINE SEPARATOR (AS SHOWN IN THE DIAGRAM) */}
      {/* ========================================================================= */}
      <div className="my-10 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sky-500/30 dark:border-sky-500/20"></div>
        </div>
        <div className="relative bg-slate-100 dark:bg-slate-900 px-6 py-2 rounded-full border border-sky-500/30 text-xs font-extrabold text-sky-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Student Member Directory</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: MEMBER DIRECTORY GRID (PHOTO, NAME, POST, BRANCH) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Member Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Student team members categorized by photo, name, post, and branch
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-cyan-400 border border-sky-500/20">
            Total: {generalMembers.length} Members
          </span>
        </div>

        {generalMembers.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No general members listed</h3>
            <p className="text-xs text-slate-500">SuperAdmin can click "+ Add Chapter Member" to add team members.</p>
          </div>
        ) : (
          /* 8-COLUMN GRID LAYOUT (8 MEMBERS IN 1 LINE ON DESKTOP) */
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {generalMembers.map((member) => {
              const linkedinUrl = (member.linkedin_url && member.linkedin_url.trim() !== '')
                ? member.linkedin_url.trim()
                : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(member.name)}`;

              return (
                <div
                  key={member.id}
                  className="glass-card glass-card-hover rounded-2xl p-3 border border-sky-500/20 flex flex-col items-center text-center relative group bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-300 shadow-sm h-full justify-between space-y-2"
                >
                  {/* SUPERADMIN EDIT & DELETE BUTTONS */}
                  {canManageChapter && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 z-10 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        title="Edit Member"
                        className="p-1 rounded-full bg-sky-600/90 hover:bg-sky-600 text-white shadow transition"
                      >
                        <Edit className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        title="Delete Member"
                        className="p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* CIRCULAR MEMBER PHOTO FRAME */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-500/40 shadow-md shrink-0 bg-slate-950 group-hover:scale-105 transition-transform duration-300 relative flex items-center justify-center text-sky-400">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-8 h-8 text-sky-400" />
                    )}
                  </div>

                  {/* MEMBER DETAILS: NAME, POST, BRANCH, LINKEDIN */}
                  <div className="w-full pt-1 flex flex-col justify-between flex-1 space-y-1.5">
                    {/* FULLY VISIBLE NAME */}
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight flex items-center justify-center text-center px-0.5 min-h-[2rem]">
                      {member.name}
                    </h3>

                    {/* POST / ROLE */}
                    <div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-sky-100 dark:bg-sky-950/90 text-sky-600 dark:text-cyan-400 border border-sky-500/20 leading-tight">
                        {member.role}
                      </span>
                    </div>

                    {/* BRANCH */}
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-0.5 leading-tight min-h-[2.2rem]">
                      <GraduationCap className="w-3 h-3 text-sky-500 shrink-0 inline" />
                      <span>{member.branch || 'Computer Science & Engg'}</span>
                    </p>

                    {/* LINKEDIN ALWAYS VISIBLE AT BOTTOM OF CARD */}
                    <div className="pt-1.5 mt-auto w-full">
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={`${member.name} LinkedIn Profile`}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 hover:bg-sky-500 text-sky-600 dark:text-cyan-400 hover:text-white border border-sky-500/20 transition shadow-xs w-full"
                      >
                        <Linkedin className="w-3 h-3 shrink-0" />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUPERADMIN ADD / EDIT CHAPTER MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingMember ? 'Edit Chapter Member' : 'Add Chapter Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              
              {/* MEMBER NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Darshan"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* POST / ROLE / DESIGNATION */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Post / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Student Innovator / Robotics Lead"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* BRANCH / DEPARTMENT */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Branch / Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* CATEGORY (TOP LEADERSHIP vs GENERAL MEMBER) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Member Category *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryInput('leadership')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      categoryInput === 'leadership'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" /> Top Leadership (3 Cards)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryInput('member')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      categoryInput === 'member'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> General Member (5-Col Grid)
                  </button>
                </div>
              </div>

              {/* PHOTO SOURCE (URL vs FILE UPLOAD) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Photo *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        uploadMethod === 'url' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" /> Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        uploadMethod === 'file' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" /> File Upload
                    </button>
                  </div>
                </div>

                {uploadMethod === 'url' ? (
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                    {isCompressing ? (
                      <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                        <span className="text-[11px] text-sky-300 font-bold">Compressing image...</span>
                      </div>
                    ) : filePreview ? (
                      <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                        <p className="text-[11px] text-emerald-400 font-bold">✓ Image loaded into adjuster</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* INTERACTIVE IMAGE CROP & ADJUSTMENT WIDGET */}
                {(uploadMethod === 'file' ? filePreview : photoUrlInput) && (
                  <div className="mt-3">
                    <ImageAdjuster
                      imageSrc={uploadMethod === 'file' ? (filePreview || '') : photoUrlInput}
                      onAdjusted={(adjusted) => setAdjustedPhotoSrc(adjusted)}
                      label="Adjust Member Photo Focus & Zoom"
                    />
                  </div>
                )}
              </div>

              {/* LINKEDIN URL & DISPLAY ORDER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinInput}
                    onChange={(e) => setLinkedinInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrderInput}
                    onChange={(e) => setDisplayOrderInput(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> {editingMember ? 'Update Globally' : 'Save Globally'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-6 border border-red-500/40 shadow-2xl space-y-4 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Chapter Member Globally?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this chapter team member? It will be removed for all users.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleDeleteMember(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Yes, Delete Globally
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
