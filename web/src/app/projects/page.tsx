'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Project, TeamMember } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import {
  Search,
  User,
  Users,
  X,
  Sparkles,
  Code,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  RefreshCw,
  Award,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
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
        const MAX_WIDTH = 1200;
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

// Client-side PDF reader to Base64
function readPdfFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function ProjectsPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();

  // SuperAdmin privilege check: ONLY SuperAdmin 1 (Incharge) and SuperAdmin 2 (Developer) can add, edit, and delete projects
  const currentRole = user?.role?.toLowerCase();
  const canManageProjects = Boolean(
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed' | 'upcoming'>('all');
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Modal State for Add / Edit
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Requirement 1 & 2 & Status: Title, Type, Status
  const [titleInput, setTitleInput] = useState('');
  const [projectTypeInput, setProjectTypeInput] = useState<'individual' | 'team'>('individual');
  const [statusInput, setStatusInput] = useState<'running' | 'completed' | 'upcoming'>('running');
  const [teamNameInput, setTeamNameInput] = useState('');

  // Requirement 3 & 4: Leader & Team Members
  const [leaderNameInput, setLeaderNameInput] = useState('');
  const [leaderBranchInput, setLeaderBranchInput] = useState('');
  const [leaderEmailInput, setLeaderEmailInput] = useState('');
  const [leaderPhotoInput, setLeaderPhotoInput] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState<TeamMember[]>([
    { name: '', branch: '', role: '', avatar: '' }
  ]);

  // Requirement 5: Multiple Project Images & Cover
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [coverImageUrlInput, setCoverImageUrlInput] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [adjustedCoverSrc, setAdjustedCoverSrc] = useState('');
  const [imagesList, setImagesList] = useState<string[]>(['']);

  // Requirement 6: Description & Full Detail
  const [descriptionInput, setDescriptionInput] = useState('');
  const [fullDetailInput, setFullDetailInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  // Requirement 7: PDF Upload System
  const [pdfMethod, setPdfMethod] = useState<'file' | 'url'>('file');
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Load global projects from API
  const fetchGlobalProjects = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        console.error('API error fetching projects:', data.message);
      }
    } catch (e) {
      console.error('Error fetching global projects:', e);
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  }, []);

  // Hook up zero-delay realtime sync
  const { triggerGlobalSync } = useRealtimeSync('projects', () => {
    fetchGlobalProjects();
  });

  useEffect(() => {
    fetchGlobalProjects();
  }, [fetchGlobalProjects]);

  // Open Modal for Add Project
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setTitleInput('');
    setProjectTypeInput('team');
    setStatusInput('running');
    setTeamNameInput('Team Robotics Alpha');
    setDescriptionInput('');
    setFullDetailInput('');
    setLeaderNameInput('Darshan');
    setLeaderBranchInput('Robotics & Artificial Intelligence');
    setLeaderPhotoInput('');
    setUploadMethod('url');
    setCoverImageUrlInput('');
    setFilePreview(null);
    setAdjustedCoverSrc('');
    setImagesList(['']);
    setTechStackInput('ROS2, Python, Fusion 360, CNC PCB Machine, 3D Printing');
    setTeamMembersInput([
      { name: 'Darshan', role: 'Project Lead & AI Engineer', branch: 'Robotics & AI', avatar: '' },
    ]);
    setPdfMethod('file');
    setPdfUrlInput('');
    setPdfFileName('');
    setIsProjectModalOpen(true);
  };

  // Open Modal for Edit Project
  const handleOpenEditModal = (proj: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProject(proj);
    setTitleInput(proj.title);
    setProjectTypeInput(proj.project_type || 'team');
    setStatusInput(proj.status || 'running');
    setTeamNameInput(proj.team_name || '');
    setDescriptionInput(proj.description || '');
    setFullDetailInput(proj.full_detail || proj.description || '');
    setLeaderNameInput(proj.leader_name || 'Darshan');
    setLeaderBranchInput(proj.leader_branch || 'Robotics & AI');
    setLeaderEmailInput(proj.leader_email || 'darshan@tgpcet.com');
    const existingPhoto = proj.leader_photo || proj.team_members?.[0]?.avatar || '';
    setLeaderPhotoInput(existingPhoto);
    setUploadMethod('url');
    setCoverImageUrlInput(proj.cover_image || proj.project_images?.[0] || '');
    setFilePreview(null);
    setAdjustedCoverSrc('');
    setImagesList(
      Array.isArray(proj.project_images) && proj.project_images.length > 0
        ? proj.project_images
        : [proj.cover_image || '']
    );
    setTechStackInput(Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : '');
    setTeamMembersInput(
      Array.isArray(proj.team_members) && proj.team_members.length > 0
        ? proj.team_members.map((m, idx) => idx === 0 ? { ...m, avatar: m.avatar || existingPhoto } : m)
        : [{ name: proj.leader_name || 'Darshan', role: 'Project Lead', branch: proj.leader_branch || 'Robotics & AI', avatar: existingPhoto }]
    );
    setPdfMethod('url');
    setPdfUrlInput(proj.pdf_url || '');
    setPdfFileName(proj.pdf_name || '');
    setIsProjectModalOpen(true);
  };

  // Project Image List Handlers
  const handleAddImageSlot = () => {
    setImagesList((prev) => [...prev, '']);
  };

  const handleRemoveImageSlot = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProjectImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setImagesList((prev) => {
          const next = [...prev];
          next[index] = compressed;
          return next;
        });
      } catch (err) {
        console.error('Project image upload failed:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Cover Image File Upload Handler
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setFilePreview(compressed);
        setCoverImageUrlInput(compressed);
      } catch (err) {
        console.error('Image compression failed:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Leader Photo Upload Handler
  const handleLeaderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setLeaderPhotoInput(compressed);
        setTeamMembersInput((prev) => {
          const next = [...prev];
          if (next[0]) {
            next[0].avatar = compressed;
          } else {
            next.push({ name: leaderNameInput || 'Darshan', branch: leaderBranchInput, role: 'Project Lead', avatar: compressed });
          }
          return next;
        });
      } catch (err) {
        console.error('Leader photo compression failed:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Dynamic Team Member Handlers
  const handleAddTeamMember = () => {
    setTeamMembersInput((prev) => [...prev, { name: '', branch: '', role: '', avatar: '' }]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembersInput((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembersInput((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleMemberPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        handleTeamMemberChange(index, 'avatar', compressed);
      } catch (err) {
        console.error('Member photo compression failed:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // PDF Report Upload Handler
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showError('Please select a valid PDF document file.');
        return;
      }
      setPdfFileName(file.name);
      try {
        const pdfDataUrl = await readPdfFile(file);
        setPdfUrlInput(pdfDataUrl);
      } catch (err) {
        console.error('PDF file reading error:', err);
      }
    }
  };

  // Save Project (Add or Edit) via POST /api/projects
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showError('Project Title is required.');
      return;
    }

    const validImages = imagesList.map((img) => img.trim()).filter((img) => img.length > 0);
    const finalCoverImage =
      adjustedCoverSrc ||
      validImages[0] ||
      (uploadMethod === 'file' ? (filePreview || '') : coverImageUrlInput.trim()) ||
      'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80';
    if (validImages.length === 0) {
      validImages.push(finalCoverImage);
    }

    let finalTeamMembers: TeamMember[] = [];

    if (projectTypeInput === 'individual') {
      finalTeamMembers = [
        {
          name: leaderNameInput.trim() || 'Darshan',
          branch: leaderBranchInput.trim() || 'Robotics & AI',
          role: 'Project Lead & AI Engineer',
          avatar: leaderPhotoInput.trim(),
        },
      ];
    } else {
      const leaderObj: TeamMember = {
        name: leaderNameInput.trim() || 'Team Leader',
        branch: leaderBranchInput.trim() || 'Engineering',
        role: 'Team Leader',
        avatar: leaderPhotoInput.trim(),
      };

      const memberObjs = teamMembersInput
        .filter((tm) => tm.name && tm.name.trim() !== '')
        .map((tm) => ({
          name: tm.name.trim(),
          branch: tm.branch?.trim() || '',
          role: tm.role?.trim() || 'Team Member',
          avatar: tm.avatar?.trim() || '',
        }));

      finalTeamMembers = [leaderObj, ...memberObjs];
    }

    setIsSubmitting(true);

    const techArray = techStackInput
      ? techStackInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['3D Printing', 'PCB CNC', 'ROS2', 'Python'];

    const payload = {
      id: editingProject ? editingProject.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-0000-4000-8000-000000000000`),
      title: titleInput.trim(),
      project_type: projectTypeInput,
      status: statusInput,
      team_name: teamNameInput.trim() || 'Team Robotics Alpha',
      description: descriptionInput.trim(),
      full_detail: fullDetailInput.trim() || descriptionInput.trim(),
      leader_name: leaderNameInput.trim() || 'Darshan',
      leader_branch: leaderBranchInput.trim() || 'Robotics & AI',
      leader_email: leaderEmailInput.trim() || 'darshan@tgpcet.com',
      leader_photo: leaderPhotoInput.trim(),
      cover_image: finalCoverImage,
      project_images: validImages,
      pdf_url: pdfUrlInput.trim(),
      pdf_name: pdfFileName.trim() || (pdfUrlInput ? `${titleInput.trim()}_Report.pdf` : ''),
      tech_stack: techArray,
      team_members: finalTeamMembers,
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.projects) {
        setProjects(data.projects);
        setIsProjectModalOpen(false);
        if (selectedProject && selectedProject.id === payload.id) {
          setSelectedProject({ ...selectedProject, ...payload } as Project);
        }
        setSuccessMsg(editingProject ? 'Project updated permanently in Supabase database!' : 'New Project added permanently to Supabase database!');
        triggerGlobalSync('projects');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError(`Failed to save project: ${data.message || 'Database error'}`);
      }
    } catch (err: any) {
      showError(`Failed to save project: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Project via DELETE /api/projects?id=...
  const handleDeleteProject = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;

    // Immediately close modal and filter projects state for instant snappy UI feedback
    setDeleteConfirmId(null);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        setSuccessMsg('Project deleted permanently from Supabase database!');
        triggerGlobalSync('projects');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError(`Failed to delete project: ${data.message || 'Database error'}`);
      }
    } catch (err: any) {
      showError(`Failed to delete project: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter projects by Title, Leader Name, Team Name, and Status
  const filteredProjects = projects.filter((p) => {
    const pStatus = p.status || 'running';
    const matchesStatus = statusFilter === 'all' ? true : pStatus === statusFilter;

    if (!searchQuery.trim()) return matchesStatus;

    const q = searchQuery.toLowerCase().trim();
    const titleMatch = p.title?.toLowerCase().includes(q);
    const leaderMatch = p.leader_name?.toLowerCase().includes(q);
    const teamMatch = p.team_name?.toLowerCase().includes(q);
    const memberMatch = p.team_members?.some(
      (m) => m.name.toLowerCase().includes(q) || m.branch?.toLowerCase().includes(q)
    );

    return matchesStatus && (titleMatch || leaderMatch || teamMatch || memberMatch);
  });

  // Helper for Status Badge Rendering
  const renderStatusBadge = (status?: string) => {
    const st = status || 'running';
    if (st === 'running') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Zap className="w-3 h-3 fill-amber-400" /> Running
        </span>
      );
    }
    if (st === 'completed') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3 text-purple-400" /> Upcoming
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* PAGE HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            LIVE GLOBAL STUDENT INNOVATIONS
          </span>
          <button
            onClick={() => fetchGlobalProjects(true)}
            title="Refresh Live Projects"
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          IDEA LAB Projects Gallery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Inspect student builders, team branches, status (Running, Completed, Upcoming), and PDF documentation.
        </p>


        {/* Success Alert Toast */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Error Alert Toast */}
        {errorMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
            <button onClick={() => setErrorMsg('')} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* FILTER & CONTROLS BAR */}
      <div className="glass-card p-4 rounded-3xl border border-sky-500/20 flex flex-col space-y-4">
        
        {/* STATUS FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setStatusFilter('running')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'running'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" /> Running
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'upcoming'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Upcoming
          </button>

          {/* Superadmin Quick Add Button */}
          {canManageProjects && (
            <button
              onClick={handleOpenAddModal}
              className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
        </div>

        {/* UNIFIED SINGLE SEARCH BAR */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by project title, team name, or innovator / leader name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* PROJECT GRID */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Synchronizing live project records...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No projects found</h3>
          <p className="text-xs text-slate-500">Try clearing your status or title search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const isTeam = proj.project_type === 'team' || (proj.team_members && proj.team_members.length > 1);
            const displayImage = proj.cover_image || (proj.project_images && proj.project_images[0]);

            return (
              <div
                key={proj.id}
                onClick={() => {
                  setSelectedProject(proj);
                  setActiveImageIndex(0);
                }}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden cursor-pointer border border-sky-500/20 group relative shadow-md flex flex-col"
              >
                {/* COVER IMAGE */}
                <div className="h-64 relative overflow-hidden bg-slate-950">
                  <img
                    src={displayImage}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                  {/* STATUS & TYPE BADGES */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    {renderStatusBadge(proj.status)}
                    <div className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                      {isTeam ? (
                        <>
                          <Users className="w-3 h-3 text-cyan-400" /> Team ({proj.team_members?.length || 2})
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-amber-400" /> Individual
                        </>
                      )}
                    </div>
                  </div>

                  {/* PDF BADGE IF AVAILABLE */}
                  {proj.pdf_url && (
                    <div className="absolute bottom-16 right-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 shadow-md">
                      <FileText className="w-3 h-3" /> PDF Report
                    </div>
                  )}

                  {/* SUPERADMIN EDIT & DELETE BUTTONS ON CARD */}
                  {canManageProjects && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <button
                        onClick={(e) => handleOpenEditModal(proj, e)}
                        title="Edit Project (Superadmin)"
                        className="p-2 rounded-full bg-sky-600/80 hover:bg-sky-600 text-white shadow-lg backdrop-blur-md transition group-hover:scale-105"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(proj.id);
                        }}
                        title="Delete Project (Superadmin)"
                        className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-lg backdrop-blur-md transition group-hover:scale-105"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* OVERLAY TITLE & BUILDER */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                      {isTeam ? `👥 ${proj.team_name || 'Team'}` : `👤 ${proj.leader_name}`}
                    </span>
                    <h3 className="text-lg font-bold leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {proj.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-4xl border border-sky-500/30 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col my-auto relative">
            
            {/* MODAL HEADER / IMAGE CAROUSEL */}
            <div className="relative h-64 md:h-72 shrink-0 bg-slate-950">
              {selectedProject.project_images && selectedProject.project_images.length > 0 ? (
                <img
                  src={selectedProject.project_images[activeImageIndex] || selectedProject.cover_image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <img
                  src={selectedProject.cover_image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              {/* IMAGE CAROUSEL CONTROLS IF MULTIPLE IMAGES */}
              {selectedProject.project_images && selectedProject.project_images.length > 1 && (
                <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedProject.project_images!.length - 1))}
                    className="text-white hover:text-cyan-400 p-0.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-bold text-white px-1">
                    {activeImageIndex + 1} / {selectedProject.project_images.length}
                  </span>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < selectedProject.project_images!.length - 1 ? prev + 1 : 0))}
                    className="text-white hover:text-cyan-400 p-0.5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TOP ACTION BUTTONS */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {canManageProjects && (
                  <>
                    <button
                      onClick={(e) => handleOpenEditModal(selectedProject, e)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(selectedProject.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-36 text-white space-y-1">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(selectedProject.status)}
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                    {selectedProject.project_type === 'team' ? `👥 Team: ${selectedProject.team_name || 'Project Team'}` : `👤 Individual Project`}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold leading-snug">{selectedProject.title}</h2>
              </div>
            </div>

            {/* THUMBNAIL CAROUSEL BAR IF MULTIPLE IMAGES */}
            {selectedProject.project_images && selectedProject.project_images.length > 1 && (
              <div className="p-2 bg-slate-950 flex gap-2 overflow-x-auto border-b border-slate-800">
                {selectedProject.project_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition ${
                      activeImageIndex === idx ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* MODAL BODY */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* REQUIREMENT 7: PDF DOWNLOAD/VIEW BUTTON */}
              {selectedProject.pdf_url && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Overall Project Technical Report (PDF)</h4>
                      <p className="text-[11px] text-slate-400">{selectedProject.pdf_name || 'Download complete project documentation'}</p>
                    </div>
                  </div>
                  <a
                    href={selectedProject.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-lg"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View / Download PDF
                  </a>
                </div>
              )}

              {/* REQUIREMENT 6: DESCRIPTION & OVERVIEW */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-sky-600 dark:text-cyan-400 tracking-wider">
                  Project Overview & Specifications
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedProject.full_detail || selectedProject.description}
                </p>
              </div>

              {/* TECH STACK */}
              {selectedProject.tech_stack && selectedProject.tech_stack.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center space-x-1">
                    <Code className="w-4 h-4 text-sky-500" />
                    <span>Technologies & Facilities Used</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech_stack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* REQUIREMENT 3 & 4: INNOVATORS & TEAM MEMBERS WITH BRANCH & PHOTOS */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center justify-between">
                  <span>{selectedProject.project_type === 'team' ? 'Team Builders & Department Branches' : 'Project Innovator'}</span>
                  {selectedProject.leader_branch && (
                    <span className="text-sky-500 font-bold text-[11px]">Branch: {selectedProject.leader_branch}</span>
                  )}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.team_members && selectedProject.team_members.length > 0 ? (
                    selectedProject.team_members.map((member, mIdx) => {
                      const avatarSrc = (member.avatar && !member.avatar.includes('photo-1534528741775-53994a69daeb'))
                        ? member.avatar
                        : '';
                      return (
                        <div
                          key={mIdx}
                          className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10"
                        >
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-sky-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border-2 border-sky-500/30 flex items-center justify-center shrink-0">
                              <User className="w-6 h-6 text-sky-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</p>
                            {member.branch && (
                              <p className="text-[11px] font-semibold text-sky-600 dark:text-cyan-400">🎓 {member.branch}</p>
                            )}
                            {member.role && (
                              <p className="text-[10px] text-slate-400">{member.role}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                      {selectedProject.leader_photo && !selectedProject.leader_photo.includes('photo-1534528741775-53994a69daeb') ? (
                        <img
                          src={selectedProject.leader_photo}
                          alt={selectedProject.leader_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-sky-500/30 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border-2 border-sky-500/30 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-sky-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedProject.leader_name}</p>
                        {selectedProject.leader_branch && (
                          <p className="text-[11px] font-semibold text-sky-600 dark:text-cyan-400">🎓 {selectedProject.leader_branch}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Created: <strong className="text-slate-800 dark:text-slate-200">{selectedProject.created_at}</strong>
              </span>
              <div className="flex items-center gap-2">
                {canManageProjects && (
                  <>
                    <button
                      onClick={(e) => {
                        const targetProj = selectedProject;
                        setSelectedProject(null);
                        handleOpenEditModal(targetProj, e);
                      }}
                      className="px-3.5 py-1.5 rounded-full font-bold bg-sky-600 hover:bg-sky-500 text-white transition flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Project
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetId = selectedProject.id;
                        setSelectedProject(null);
                        setDeleteConfirmId(targetId);
                      }}
                      className="px-3.5 py-1.5 rounded-full font-bold bg-red-600 hover:bg-red-500 text-white transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-1.5 rounded-full font-bold bg-slate-700 hover:bg-slate-600 text-white transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUPERADMIN ADD / EDIT PROJECT MODAL - UPDATED WITH STATUS SELECTION */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-3xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              
              {/* REQUIREMENT 1: PROJECT TITLE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">1. Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* PROJECT STATUS SELECTION (RUNNING, COMPLETED, UPCOMING) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Project Status *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatusInput('running')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      statusInput === 'running'
                        ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-300" /> Running
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusInput('completed')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      statusInput === 'completed'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusInput('upcoming')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      statusInput === 'upcoming'
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-purple-300" /> Upcoming
                  </button>
                </div>
              </div>

              {/* REQUIREMENT 2: SELECT TEAM OR INDIVIDUAL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">2. Select Project Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProjectTypeInput('individual')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      projectTypeInput === 'individual'
                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" /> Individual Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectTypeInput('team')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      projectTypeInput === 'team'
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Team Project
                  </button>
                </div>
              </div>

              {/* REQUIREMENT 3 & 4: BUILDER DETAILS (INDIVIDUAL VS TEAM) */}
              {projectTypeInput === 'individual' ? (
                /* REQUIREMENT 3: INDIVIDUAL INNOVATOR DETAILS */
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Individual Innovator Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Innovator Name *</label>
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={leaderNameInput}
                        onChange={(e) => setLeaderNameInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Branch / Department</label>
                      <input
                        type="text"
                        placeholder=""
                        value={leaderBranchInput}
                        onChange={(e) => setLeaderBranchInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Innovator Photo</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder=""
                        value={leaderPhotoInput}
                        onChange={(e) => setLeaderPhotoInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <label className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0">
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleLeaderPhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                /* REQUIREMENT 4: TEAM DETAILS & DYNAMIC MEMBERS */
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Team Details & Members
                    </h4>
                    <input
                      type="text"
                      placeholder="Team Name"
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* TEAM LEADER */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Team Leader</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Leader Name *"
                        value={leaderNameInput}
                        onChange={(e) => setLeaderNameInput(e.target.value)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Leader Branch"
                        value={leaderBranchInput}
                        onChange={(e) => setLeaderBranchInput(e.target.value)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Leader Photo URL"
                        value={leaderPhotoInput}
                        onChange={(e) => setLeaderPhotoInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <label className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0">
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleLeaderPhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* ADDITIONAL TEAM MEMBERS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Team Members</span>
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Member
                      </button>
                    </div>

                    {teamMembersInput.map((member, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Member #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(idx)}
                            className="text-red-400 hover:text-red-300 text-xs p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Member Name *"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Branch"
                            value={member.branch || ''}
                            onChange={(e) => handleTeamMemberChange(idx, 'branch', e.target.value)}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={member.role || ''}
                            onChange={(e) => handleTeamMemberChange(idx, 'role', e.target.value)}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder=""
                            value={member.avatar || ''}
                            onChange={(e) => handleTeamMemberChange(idx, 'avatar', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                          />
                          <label className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0">
                            Upload Photo
                            <input type="file" accept="image/*" onChange={(e) => handleMemberPhotoUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* REQUIREMENT 5: MULTIPLE PROJECT IMAGES */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">5. Project Images (Multiple Images Allowed) *</label>
                    <p className="text-[11px] text-slate-400">First image will be used as the primary cover photo.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageSlot}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Image
                  </button>
                </div>

                <div className="space-y-2">
                  {imagesList.map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0">
                        {idx === 0 ? 'Cover Img:' : `Image #${idx + 1}:`}
                      </span>
                      <input
                        type="text"
                        placeholder=""
                        value={imgUrl}
                        onChange={(e) => {
                          const updated = [...imagesList];
                          updated[idx] = e.target.value;
                          setImagesList(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0">
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleProjectImageUpload(idx, e)} className="hidden" />
                      </label>
                      {imagesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageSlot(idx)}
                          className="p-2 text-red-400 hover:text-red-300 transition shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* REQUIREMENT 6: DESCRIPTION & TECHNICAL OVERVIEW */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">6. Short Description *</label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Technical Overview & Abstract</label>
                  <textarea
                    rows={3}
                    placeholder=""
                    value={fullDetailInput}
                    onChange={(e) => setFullDetailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tech Stack / Machines Used</label>
                  <input
                    type="text"
                    placeholder=""
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* REQUIREMENT 7: PDF UPLOAD SYSTEM */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-400" />
                    7. PDF Upload System (Overall Project Report)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfMethod('file')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        pdfMethod === 'file' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfMethod('url')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        pdfMethod === 'url' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {pdfMethod === 'file' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileChange}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                    />
                    {pdfFileName && (
                      <div className="p-2 bg-slate-900 rounded-xl border border-red-500/30 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-emerald-400 font-bold">Attached PDF: {pdfFileName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder=""
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                  />
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> {editingProject ? 'Update Globally' : 'Save Globally'}
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
            <h3 className="text-lg font-bold text-white">Delete Project Permanently?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="text-cyan-400 font-bold">"{projects.find(p => p.id === deleteConfirmId)?.title || 'this project'}"</span>? This operation will permanently remove the project from Supabase.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDeleteProject(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
