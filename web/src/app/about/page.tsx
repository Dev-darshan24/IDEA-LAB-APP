'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FacultyMember, LabInchargeProfile } from '@/types';
import { ImageAdjuster } from '@/components/ImageAdjuster';
import {
  UserCheck,
  ShieldCheck,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  X
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

export default function AboutPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();

  // SuperAdmin privilege check: Both SuperAdmin 1 (Incharge) and SuperAdmin 2 (Developer) can edit
  const currentRole = user?.role?.toLowerCase();
  const canManageFaculty =
    isSuperAdmin1 ||
    isSuperAdmin2 ||
    currentRole === 'superadmin_1' ||
    currentRole === 'superadmin_2' ||
    currentRole === 'admin_incharge' ||
    currentRole === 'admin_developer';

  const [incharge, setIncharge] = useState<LabInchargeProfile>({
    name: 'Dr. Neeraj Waijode',
    title: 'Head & Coordinator, AICTE IDEA LAB • TGPCET',
    badge: 'LAB INCHARGE & SUPERADMIN',
    message: '"Our mission is to bridge the gap between academic theory and physical hardware prototyping."',
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
  });
  const [faculties, setFaculties] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add / Edit Faculty Modal State
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [deptInput, setDeptInput] = useState('');

  // Edit Incharge Modal State
  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);
  const [inchargeNameInput, setInchargeNameInput] = useState('');
  const [inchargeTitleInput, setInchargeTitleInput] = useState('');
  const [inchargeBadgeInput, setInchargeBadgeInput] = useState('');
  const [inchargeMessageInput, setInchargeMessageInput] = useState('');

  // Common Upload State
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [adjustedPhotoSrc, setAdjustedPhotoSrc] = useState<string>('');
  const [displayOrderInput, setDisplayOrderInput] = useState<number>(1);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Live Data from API
  const fetchFacultyData = async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/faculty', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (data.faculties && Array.isArray(data.faculties)) {
          setFaculties(data.faculties);
        }
        if (data.incharge) {
          setIncharge(data.incharge);
        }
      }
    } catch (e) {
      console.error('Error fetching faculty data:', e);
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  // Open Modal for Add Faculty
  const handleOpenAddFacultyModal = () => {
    setEditingFaculty(null);
    setNameInput('');
    setRoleInput('Section Head');
    setDeptInput('Mechanical Engineering');
    setPhotoUrlInput('');
    setFilePreview(null);
    setUploadMethod('url');
    setDisplayOrderInput(faculties.length + 1);
    setIsFacultyModalOpen(true);
  };

  // Open Modal for Edit Faculty
  const handleOpenEditFacultyModal = (fac: FacultyMember) => {
    setEditingFaculty(fac);
    setNameInput(fac.name);
    setRoleInput(fac.role);
    setDeptInput(fac.dept);
    setPhotoUrlInput(fac.photo_url || '');
    setFilePreview(null);
    setUploadMethod('url');
    setDisplayOrderInput(fac.display_order || 1);
    setIsFacultyModalOpen(true);
  };

  // Open Modal for Edit Lab Incharge
  const handleOpenEditInchargeModal = () => {
    setInchargeNameInput(incharge.name);
    setInchargeTitleInput(incharge.title);
    setInchargeBadgeInput(incharge.badge || 'LAB INCHARGE & SUPERADMIN');
    setInchargeMessageInput(incharge.message || '');
    setPhotoUrlInput(incharge.photo_url || '');
    setFilePreview(null);
    setUploadMethod('url');
    setIsInchargeModalOpen(true);
  };

  // File Upload Handler
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

  const [errorMsg, setErrorMsg] = useState('');

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Save Faculty Member
  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !roleInput.trim() || !deptInput.trim()) {
      showError('Please fill out Faculty Name, Role, and Department.');
      return;
    }

    const finalPhoto = adjustedPhotoSrc || (uploadMethod === 'file' ? (filePreview || '') : photoUrlInput);

    setIsSubmitting(true);
    const payload = {
      id: editingFaculty ? editingFaculty.id : undefined,
      name: nameInput.trim(),
      role: roleInput.trim(),
      dept: deptInput.trim(),
      photo_url: finalPhoto.trim(),
      display_order: displayOrderInput,
    };

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.faculties) {
        setFaculties(data.faculties);
      }

      setIsFacultyModalOpen(false);
      setSuccessMsg(editingFaculty ? 'Faculty member updated globally!' : 'New Faculty member added globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to save faculty member to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Lab Incharge Profile
  const handleSaveIncharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inchargeNameInput.trim() || !inchargeTitleInput.trim()) {
      showError('Please fill out Incharge Name and Title.');
      return;
    }

    const finalPhoto = adjustedPhotoSrc || (uploadMethod === 'file' ? (filePreview || '') : photoUrlInput);

    setIsSubmitting(true);
    const payload = {
      type: 'incharge',
      name: inchargeNameInput.trim(),
      title: inchargeTitleInput.trim(),
      badge: inchargeBadgeInput.trim(),
      message: inchargeMessageInput.trim(),
      photo_url: finalPhoto.trim(),
    };

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.incharge) {
        setIncharge(data.incharge);
      }

      setIsInchargeModalOpen(false);
      setSuccessMsg('Lab Incharge Profile updated globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to save Lab Incharge profile to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Faculty Member
  const handleDeleteFaculty = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/faculty?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success && data.faculties) {
        setFaculties(data.faculties);
      }

      setDeleteConfirmId(null);
      setSuccessMsg('Faculty member deleted globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to delete faculty member from server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center space-x-1 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORGANIZATION & LEADERSHIP</span>
          </span>
          <button
            onClick={() => fetchFacultyData(true)}
            title="Refresh Live Data"
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About AICTE IDEA LAB
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
          Tulsiramji Gaikwad Patil College of Engineering & Technology (TGPCET), Nagpur
        </p>

        {/* Toast Alert */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" /> {successMsg}
          </div>
        )}
      </div>

      {/* INTRODUCTION & HISTORY */}
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-sky-500" />
          <span>Introduction & History</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong>AICTE IDEA LAB</strong> at Tulsiramji Gaikwad Patil College of Engineering & Technology was established under the prestigious national scheme of the All India Council for Technical Education (AICTE). The lab provides 24x7 hands-on access to advanced prototyping equipment, enabling students across electrical, mechanical, computer science, and civil engineering disciplines to collaborate on real-world industry problems.
        </p>
      </div>

      {/* INCHARGE PROFILE CARD (EDITABLE BY SUPERADMINS) */}
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-indigo-500/10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 relative group shadow-xl">
        
        {/* SUPERADMIN EDIT BUTTON FOR INCHARGE */}
        {canManageFaculty && (
          <button
            onClick={handleOpenEditInchargeModal}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md"
            title="Edit Incharge Profile (Superadmin)"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}

        {/* PHOTO */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-sky-500/40 shadow-xl shrink-0 bg-slate-900">
          <img
            src={incharge.photo_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'}
            alt={incharge.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-3 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-600 text-white tracking-widest inline-flex items-center gap-1">
            <Award className="w-3 h-3" /> {incharge.badge || 'LAB INCHARGE & SUPERADMIN'}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {incharge.name}
          </h2>
          <p className="text-xs font-bold text-sky-600 dark:text-cyan-400">
            {incharge.title}
          </p>
          {incharge.message && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl italic">
              {incharge.message}
            </p>
          )}
        </div>
      </div>

      {/* FACULTIES GRID */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              IDEA LAB Faculty Committee & Section Heads
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Faculty mentors and section leads driving innovation initiatives
            </p>
          </div>

          {/* SUPERADMIN ADD FACULTY BUTTON */}
          {canManageFaculty && (
            <button
              onClick={handleOpenAddFacultyModal}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Faculty Member
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Synchronizing live faculty records...</p>
          </div>
        ) : faculties.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-2">
            <UserCheck className="w-10 h-10 text-sky-500/50 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No faculty members found in live database</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {canManageFaculty ? 'Click "Add Faculty Member" above to add faculty section heads.' : 'Faculty profiles will appear here once configured by the Lab Superadmin.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((fac) => (
              <div
                key={fac.id}
                className="glass-card glass-card-hover p-6 rounded-3xl border border-sky-500/20 flex items-center space-x-5 relative group bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-300 shadow-lg"
              >
                {/* SUPERADMIN EDIT & DELETE BUTTONS */}
                {canManageFaculty && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEditFacultyModal(fac)}
                      title="Edit Faculty Member"
                      className="p-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-md transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(fac.id)}
                      title="Delete Faculty Member"
                      className="p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* CIRCULAR PHOTO FRAME */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-sky-500/40 bg-slate-900 shrink-0 flex items-center justify-center text-sky-400 font-bold shadow-xl">
                  {fac.photo_url ? (
                    <img src={fac.photo_url} alt={fac.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCheck className="w-8 h-8" />
                  )}
                </div>

                <div className="pr-10 space-y-0.5">
                  <h4 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white line-clamp-1">{fac.name}</h4>
                  <p className="text-xs font-bold text-sky-600 dark:text-cyan-400">{fac.role}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{fac.dept}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK LINK TO SECTIONS */}
      <div className="glass-card p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
        <div>
          <h3 className="text-xl font-bold">Explore Our 5 Technical Sections in Detail</h3>
          <p className="text-xs text-sky-100 mt-1">
            Inspect Software Cell, IoT & PCB Design, 3D Printing, Robotics & Fabrication.
          </p>
        </div>
        <Link
          href="/sections"
          className="px-6 py-3 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition shrink-0 flex items-center space-x-1"
        >
          <span>View 5 Sections Showcase</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SUPERADMIN EDIT LAB INCHARGE MODAL */}
      {isInchargeModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit Lab Incharge Profile</h3>
              </div>
              <button
                onClick={() => setIsInchargeModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncharge} className="space-y-4">
              
              {/* NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Neeraj Waijode"
                  value={inchargeNameInput}
                  onChange={(e) => setInchargeNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="Head & Coordinator, AICTE IDEA LAB • TGPCET"
                  value={inchargeTitleInput}
                  onChange={(e) => setInchargeTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* BADGE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag Text</label>
                <input
                  type="text"
                  placeholder="LAB INCHARGE & SUPERADMIN"
                  value={inchargeBadgeInput}
                  onChange={(e) => setInchargeBadgeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* PHOTO SOURCE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Photo</label>
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

                {/* INTERACTIVE IMAGE CROP & ADJUSTMENT WIDGET FOR INCHARGE */}
                {(uploadMethod === 'file' ? filePreview : photoUrlInput) && (
                  <div className="mt-3">
                    <ImageAdjuster
                      imageSrc={uploadMethod === 'file' ? (filePreview || '') : photoUrlInput}
                      onAdjusted={(adjusted) => setAdjustedPhotoSrc(adjusted)}
                      label="Adjust Incharge Photo Focus & Zoom"
                    />
                  </div>
                )}
              </div>

              {/* MESSAGE / QUOTE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Incharge Quote / Message</label>
                <textarea
                  rows={3}
                  placeholder="Incharge message or vision statement..."
                  value={inchargeMessageInput}
                  onChange={(e) => setInchargeMessageInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInchargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" /> Save Incharge Profile
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUPERADMIN ADD / EDIT FACULTY MEMBER MODAL */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsFacultyModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="space-y-4">
              
              {/* FACULTY NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Neeraj Waijode"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* ROLE / DESIGNATION */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incharge, AICTE IDEA LAB / Section Head"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* DEPARTMENT */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Department / Cell *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering / Software Cell"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* PHOTO SOURCE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Photo</label>
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

                {/* INTERACTIVE IMAGE CROP & ADJUSTMENT WIDGET FOR INCHARGE */}
                {(uploadMethod === 'file' ? filePreview : photoUrlInput) && (
                  <div className="mt-3">
                    <ImageAdjuster
                      imageSrc={uploadMethod === 'file' ? (filePreview || '') : photoUrlInput}
                      onAdjusted={(adjusted) => setAdjustedPhotoSrc(adjusted)}
                      label="Adjust Incharge Photo Focus & Zoom"
                    />
                  </div>
                )}
              </div>

              {/* DISPLAY ORDER */}
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

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
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
                      <Plus className="w-4 h-4" /> {editingFaculty ? 'Update Globally' : 'Save Globally'}
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
            <h3 className="text-lg font-bold text-white">Delete Faculty Member Globally?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this faculty committee member? It will be removed globally for all users.
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
                onClick={() => handleDeleteFaculty(deleteConfirmId)}
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
