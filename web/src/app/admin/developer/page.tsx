'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  Users,
  FileText,
  Bell,
  Send,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Settings,
  ShieldCheck,
  User,
  X,
  Save,
  Globe,
  Sliders,
  Check,
  LogOut,
  Zap,
  Sparkles,
  Search,
  Activity,
  Layers,
  Calendar,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  created_at?: string;
}

interface LabEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  trainer: string;
  seats: string;
  status: string;
}

interface IdeaLabActivityRecord {
  id?: string;
  title: string;
  description?: string;
  type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  organizer?: string;
  registration_open?: boolean;
  max_participants?: number;
  status?: string;
}

interface SectionDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  equipments: string[];
  section_head: string;
  section_head_title: string;
  image_url: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  college_id?: string;
  education?: string;
  role?: string;
  created_at?: string;
}

function formatDateForPicker(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return '';
}

function formatDateForDisplay(yyyyMmDd: string): string {
  if (!yyyyMmDd) return '';
  try {
    const parts = yyyyMmDd.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
  } catch (e) {}
  return yyyyMmDd;
}

interface ApplicationItem {
  id: string;
  applicant_name: string;
  applicant_email: string;
  education?: string;
  title: string;
  type: string;
  description: string;
  status: string;
  created_at?: string;
}

export default function DeveloperDashboardPage() {
  const { isSuperAdmin2, user, updateProfile, logout } = useAuth();
  const { triggerGlobalSync } = useRealtimeSync('*', () => { fetchLiveData(); });

  // Navigation tab state: 'apply_edit' | 'applications' | 'users_details' | 'app_settings'
  const [activeTab, setActiveTab] = useState<'apply_edit' | 'applications' | 'users_details' | 'app_settings'>('apply_edit');

  // Stats state
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    totalProjectRequests: 0,
    totalNotifications: 0,
  });

  // Notifications State (Limit 10)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // --- APPLY BUTTON EDIT STATE ---
  // 1. Project Form Settings State
  const [projectFormSettings, setProjectFormSettings] = useState({
    titleQuestion: 'What is your Innovation Project / Idea Title?',
    problemQuestion: 'Describe the Problem Statement & Technical Challenge',
    descriptionQuestion: 'Detailed Project Abstract & Proposed Hardware/Software Solution',
    requirePdfUpload: true,
    eligibilityNote: 'Open for all student innovators & faculty teams at TGPCET AICTE IDEA LAB.',
  });

  // 2. Events Form State
  const [eventsList, setEventsList] = useState<LabEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LabEvent | null>(null);
  const [eventForm, setEventForm] = useState<Partial<LabEvent>>({
    title: '',
    category: 'Event',
    description: '',
    date: 'August 25, 2026',
    trainer: 'Dr. Neeraj Waijode',
    seats: '30 Seats',
    status: 'Open for Registration',
  });

  // 3. Training Form State
  const [trainingsList, setTrainingsList] = useState<IdeaLabActivityRecord[]>([]);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<IdeaLabActivityRecord | null>(null);
  const [trainingForm, setTrainingForm] = useState<Partial<IdeaLabActivityRecord>>({
    title: '',
    description: '',
    type: 'training',
    date: 'September 01, 2026',
    venue: 'AICTE IDEA Lab, TGPCET',
    organizer: 'Dr. Neeraj Waijode',
    max_participants: 25,
    status: 'published',
  });

  // Applications & Users State
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // App Settings / Sections CMS State
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [editingSection, setEditingSection] = useState<SectionDetail | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [accountStatusMsg, setAccountStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all live data from backend APIs
  const fetchLiveData = useCallback(async () => {
    try {
      const [
        statsRes,
        notifRes,
        eventsRes,
        trainingsRes,
        appsRes,
        usersRes,
        secRes,
        configRes,
      ] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/notifications', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/activities?all=true', { cache: 'no-store' }),
        fetch('/api/applications', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/sections', { cache: 'no-store' }),
        fetch('/api/apply-config', { cache: 'no-store' }),
      ]);

      const [
        statsData,
        notifData,
        eventsData,
        trainingsData,
        appsData,
        usersData,
        secData,
        configData,
      ] = await Promise.all([
        statsRes.json().catch(() => ({})),
        notifRes.json().catch(() => ({})),
        eventsRes.json().catch(() => ({})),
        trainingsRes.json().catch(() => ({})),
        appsRes.json().catch(() => ({})),
        usersRes.json().catch(() => ({})),
        secRes.json().catch(() => ({})),
        configRes.json().catch(() => ({})),
      ]);

      if (statsData.success && statsData.stats) {
        setLiveStats({
          totalUsers: statsData.stats.totalUsers || 0,
          totalProjectRequests: statsData.stats.totalProjectRequests || 0,
          totalNotifications: statsData.stats.totalNotifications || 0,
        });
      }

      if (notifData.success && Array.isArray(notifData.notifications)) {
        setNotifications(notifData.notifications.slice(0, 10));
        setUnreadCount(notifData.unreadCount || notifData.notifications.filter((n: NotificationItem) => !n.is_read).length);
      }

      if (eventsData.success && Array.isArray(eventsData.events)) {
        setEventsList(eventsData.events);
      }

      if (trainingsData.success && Array.isArray(trainingsData.activities)) {
        setTrainingsList(trainingsData.activities);
      }

      if (appsData.success && Array.isArray(appsData.applications)) {
        setApplications(appsData.applications);
      }

      if (usersData.success && Array.isArray(usersData.users)) {
        setUsersList(usersData.users);
      }

      if (secData.success && Array.isArray(secData.sections)) {
        setSections(secData.sections);
      }

      if (configData.success && configData.config) {
        setProjectFormSettings(configData.config);
      }
    } catch (e) {
      console.error('Error fetching live data in developer admin:', e);
    }
  }, []);

  useRealtimeSync('*', fetchLiveData);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isSavingTraining, setIsSavingTraining] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Project Form Settings Save Handler
  const handleSaveProjectFormSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProjectSettings(true);
    try {
      const res = await fetch('/api/apply-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectFormSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('Project Application Form settings saved permanently to Supabase database!');
        setTimeout(() => setSaveMessage(''), 3500);
        triggerGlobalSync();
      } else {
        setSaveMessage(`Failed to save settings: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save project form settings:', err);
      setSaveMessage('Error saving settings to Supabase database.');
    } finally {
      setIsSavingProjectSettings(false);
    }
  };

  // Event Add/Edit Save Handler
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.title.trim()) return;

    setIsSavingEvent(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEventsList(data.events);
        setSaveMessage(editingEvent ? 'Event updated permanently in Supabase!' : 'Event created permanently in Supabase!');
        setTimeout(() => setSaveMessage(''), 3000);
        setShowEventModal(false);
        setEditingEvent(null);
        setEventForm({
          title: '',
          category: 'Event',
          description: '',
          date: '',
          trainer: 'Dr. Neeraj Waijode',
          seats: '25 Seats',
          status: 'Open for Registration',
        });
        triggerGlobalSync();
      } else {
        setSaveMessage(`Failed to save event: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save event:', err);
      setSaveMessage('Error saving event to Supabase database.');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action will remove it permanently from Supabase database.',
      onConfirm: async () => {
        setIsDeletingItem(true);
        try {
          const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success && Array.isArray(data.events)) {
            setEventsList(data.events);
            setSaveMessage('Event deleted permanently from Supabase!');
            setTimeout(() => setSaveMessage(''), 3000);
            triggerGlobalSync();
          } else {
            setSaveMessage(`Failed to delete event: ${data.message}`);
          }
        } catch (err: any) {
          console.error('Failed to delete event:', err);
          setSaveMessage('Error deleting event from Supabase database.');
        } finally {
          setIsDeletingItem(false);
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Training Add/Edit Save Handler
  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingForm.title || !trainingForm.title.trim()) return;

    setIsSavingTraining(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.activities)) {
          setTrainingsList(data.activities);
        }
        setSaveMessage(editingTraining ? 'Training program updated permanently in Supabase!' : 'Training program created permanently in Supabase!');
        setTimeout(() => setSaveMessage(''), 3000);
        setShowTrainingModal(false);
        setEditingTraining(null);
        setTrainingForm({
          title: '',
          description: '',
          type: 'training',
          date: '',
          venue: 'AICTE IDEA Lab, TGPCET',
          organizer: 'Dr. Neeraj Waijode',
          max_participants: 25,
        });
        triggerGlobalSync();
      } else {
        setSaveMessage(`Failed to save training program: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save training program:', err);
      setSaveMessage('Error saving training program to Supabase database.');
    } finally {
      setIsSavingTraining(false);
    }
  };

  const handleDeleteTraining = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Delete Training Program',
      message: 'Are you sure you want to delete this training program? This action will remove it permanently from Supabase database.',
      onConfirm: async () => {
        setIsDeletingItem(true);
        try {
          const res = await fetch(`/api/activities?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success && Array.isArray(data.activities)) {
            setTrainingsList(data.activities);
            setSaveMessage('Training program deleted permanently from Supabase!');
            setTimeout(() => setSaveMessage(''), 3000);
            triggerGlobalSync();
          } else {
            setSaveMessage(`Failed to delete training program: ${data.message}`);
          }
        } catch (err: any) {
          console.error('Failed to delete training program:', err);
          setSaveMessage('Error deleting training program from Supabase database.');
        } finally {
          setIsDeletingItem(false);
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Broadcast Notification Handler
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: 'system',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastSuccess(true);
        setBroadcastTitle('');
        setBroadcastMessage('');
        setTimeout(() => {
          setBroadcastSuccess(false);
          setShowBroadcastModal(false);
        }, 2000);
        fetchLiveData();
      }
    } catch (err) {
      console.error('Error broadcasting notification:', err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput !== confirmPasswordInput) {
      setAccountStatusMsg({ type: 'error', text: 'New password and confirm password do not match!' });
      return;
    }
    if (newPasswordInput.length < 4) {
      setAccountStatusMsg({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }

    const ok = await updateProfile({ password: newPasswordInput });
    if (ok) {
      setAccountStatusMsg({ type: 'success', text: 'Developer Password updated successfully!' });
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setAccountStatusMsg({ type: 'error', text: 'Failed to update password.' });
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.college_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ==================================================================== */}
        {/* TOP ROUNDED HEADER BAR (Pill shape matching user wireframe design) */}
        {/* ==================================================================== */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-full px-6 py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                SUPERADMIN CONSOLE 2
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  DEVELOPER ADMIN
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-cyan-300 font-medium">{user?.first_name || 'Darshan'}</span> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase System Live
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5" />
              View Site
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-full border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Global Alert Notification Banner */}
        {saveMessage && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{saveMessage}</span>
            </div>
            <button onClick={() => setSaveMessage('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TOP STATS CARDS (3 Columns Grid matching exact user wireframe) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total User */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total User</span>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tight">{liveStats.totalUsers}</div>
              <p className="text-xs text-slate-400 mt-1">Registered Innovators & Students</p>
            </div>
          </div>

          {/* Card 2: Project Requests */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Requests</span>
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tight">{liveStats.totalProjectRequests}</div>
              <p className="text-xs text-slate-400 mt-1">Submitted Ideas & Applications</p>
            </div>
          </div>

          {/* Card 3: Unread Notifications */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unread Notifications</span>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tight">{unreadCount}</div>
              <p className="text-xs text-slate-400 mt-1">Total System Alerts: {liveStats.totalNotifications}</p>
            </div>
          </div>

        </div>

        {/* ==================================================================== */}
        {/* ACTION BUTTON ROW (4 Columns Grid matching exact user wireframe) */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Button 1: Apply Button Edit */}
          <button
            onClick={() => setActiveTab('apply_edit')}
            className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              activeTab === 'apply_edit'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
          >
            <Edit className="w-4 h-4" />
            Apply Button Edit
          </button>

          {/* Button 2: Applications */}
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              activeTab === 'applications'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            Applications
          </button>

          {/* Button 3: Users Details */}
          <button
            onClick={() => setActiveTab('users_details')}
            className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              activeTab === 'users_details'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            Users Details
          </button>

          {/* Button 4: App Settings */}
          <button
            onClick={() => setActiveTab('app_settings')}
            className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              activeTab === 'app_settings'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
            }`}
          >
            <Settings className="w-4 h-4" />
            App Settings
          </button>

        </div>

        {/* ==================================================================== */}
        {/* RECENT NOTIFICATIONS PANEL (Hidden when User Details or Apply Edit is active) */}
        {/* ==================================================================== */}
        {activeTab !== 'users_details' && activeTab !== 'apply_edit' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Recent Notifications</h2>
                  <span className="text-xs text-amber-400/90 font-medium">Show only 10 recent notification</span>
                </div>
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Notification
              </button>
            </div>

            {/* List of 10 recent notifications */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No recent notifications found.
                </div>
              ) : (
                notifications.slice(0, 10).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type || 'System'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 pl-4">{item.message}</p>
                    </div>
                    <div className="text-xs text-slate-500 self-end md:self-center">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ACTIVE TAB MANAGEMENT CONTENT AREA */}
        {/* ==================================================================== */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">

          {/* ================================================================== */}
          {/* TAB 1: APPLY BUTTON EDIT (3 COLUMNS GRID LAYOUT FROM USER IMAGE) */}
          {/* ================================================================== */}
          {activeTab === 'apply_edit' && (
            <div className="space-y-6">
              
              {/* Header Title with Back Arrow matching user wireframe */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('applications')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    Apply Button Edit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize project form questions, add/edit multiple events, and manage training masterclasses.
                  </p>
                </div>
              </div>

              {/* 3 COLUMNS GRID matching exact wireframe layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 1: Project Form Edit */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-base font-bold text-white">Project Form edit</h4>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Proposal Form
                      </span>
                    </div>

                    <form onSubmit={handleSaveProjectFormSettings} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Project Title Question / Label
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.titleQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, titleQuestion: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Problem Statement Question / Label
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.problemQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, problemQuestion: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Description Question / Label
                        </label>
                        <textarea
                          rows={2}
                          value={projectFormSettings.descriptionQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, descriptionQuestion: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <span className="text-slate-300 font-semibold">Require PDF Upload (.pdf up to 15MB)</span>
                        <input
                          type="checkbox"
                          checked={projectFormSettings.requirePdfUpload}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, requirePdfUpload: e.target.checked })}
                          className="w-4 h-4 accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">
                          Eligibility Guidance Note
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.eligibilityNote}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, eligibilityNote: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingProjectSettings}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSavingProjectSettings ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Saving Settings...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Project Form Settings</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 2: Event Form Edit */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <h4 className="text-base font-bold text-white">Event Form edit</h4>
                      </div>

                      {/* Add Events Button matching wireframe */}
                      <button
                        onClick={() => {
                          setEditingEvent(null);
                          setEventForm({
                            title: '',
                            category: 'Event',
                            description: '',
                            date: 'August 28, 2026',
                            trainer: 'Dr. Neeraj Waijode',
                            seats: '30 Seats',
                            status: 'Open for Registration',
                          });
                          setShowEventModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Events
                      </button>
                    </div>

                    {/* Events List Feed */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {eventsList.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">
                          No active events. Click "Add Events" above to create one.
                        </div>
                      ) : (
                        eventsList.map((ev) => (
                          <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 relative group hover:border-slate-700 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                {ev.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingEvent(ev);
                                    setEventForm(ev);
                                    setShowEventModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="p-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-md"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-bold text-white text-xs">{ev.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{ev.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span>📅 {ev.date}</span>
                              <span>👤 {ev.trainer}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMN 3: Training Form Edit */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-base font-bold text-white">Training Form edit</h4>
                      </div>

                      {/* Add Events/Training Button matching wireframe */}
                      <button
                        onClick={() => {
                          setEditingTraining(null);
                          setTrainingForm({
                            title: '',
                            description: '',
                            type: 'training',
                            date: 'September 05, 2026',
                            venue: 'AICTE IDEA Lab, TGPCET',
                            organizer: 'Dr. Neeraj Waijode',
                            max_participants: 30,
                            status: 'published',
                          });
                          setShowTrainingModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Events
                      </button>
                    </div>

                    {/* Training List Feed */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {trainingsList.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">
                          No active training programs. Click "Add Events" above to add one.
                        </div>
                      ) : (
                        trainingsList.map((tr) => (
                          <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 relative group hover:border-slate-700 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {tr.type || 'Training'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingTraining(tr);
                                    setTrainingForm(tr);
                                    setShowTrainingModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTraining(tr.id || '')}
                                  className="p-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-md"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-bold text-white text-xs">{tr.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{tr.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span>📅 {tr.date}</span>
                              <span>👥 Max: {tr.max_participants || 30}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">Student Project Applications & Requests</h3>
                <p className="text-xs text-slate-400">Review all project requests and student innovation proposals.</p>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No project requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Applicant</th>
                        <th className="p-3">Project Title</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-white">{app.applicant_name}</div>
                            <div className="text-slate-400 text-[11px]">{app.applicant_email}</div>
                          </td>
                          <td className="p-3 font-semibold text-cyan-300">{app.title}</td>
                          <td className="p-3 uppercase text-[10px] text-slate-400">{app.type}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              app.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USERS DETAILS */}
          {activeTab === 'users_details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Registered Users & Student Details</h3>
                  <p className="text-xs text-slate-400">Total {usersList.length} registered profiles in Supabase database.</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">College ID / Education</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">
                          {u.first_name} {u.last_name}
                        </td>
                        <td className="p-3 text-cyan-300">{u.email}</td>
                        <td className="p-3 text-slate-400">{u.college_id || u.education || 'B.Tech'}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: APP SETTINGS */}
          {activeTab === 'app_settings' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">System & Developer Account Settings</h3>
                <p className="text-xs text-slate-400">Configure technical section details and update developer security credentials.</p>
              </div>

              {/* Technical Sections Editor */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">5 Technical Sections Manager</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((sec) => (
                    <div key={sec.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <h5 className="font-bold text-white text-sm">{sec.title}</h5>
                      <p className="text-xs text-slate-400 line-clamp-2">{sec.subtitle}</p>
                      <button
                        onClick={() => setEditingSection(sec)}
                        className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700"
                      >
                        Edit Section Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Password Update */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 max-w-lg">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Change Developer Password
                </h4>
                {accountStatusMsg && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    accountStatusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {accountStatusMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Broadcast New Notification</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {broadcastSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold rounded-xl text-center">
                ✓ Notification sent successfully to all users!
              </div>
            ) : (
              <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Notice Title..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Message</label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter notification message details..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold"
                  >
                    Send Broadcast
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventForm.title || ''}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. 6-Axis Industrial Robotic Arm Trajectory Hackathon"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={eventForm.category || 'Event'}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Event">Event</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Training">Training</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date (Calendar Picker)</label>
                  <input
                    type="date"
                    value={formatDateForPicker(eventForm.date)}
                    onChange={(e) => {
                      const formatted = formatDateForDisplay(e.target.value);
                      setEventForm({ ...eventForm, date: formatted || e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white [color-scheme:dark] cursor-pointer focus:outline-none focus:border-cyan-500"
                  />
                  {eventForm.date && (
                    <p className="text-[10px] text-cyan-400 font-medium mt-1">
                      Selected: {eventForm.date}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description || ''}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold disabled:opacity-50"
                >
                  {isSavingEvent ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Training Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingTraining ? 'Edit Training Program' : 'Add New Training Program'}
              </h3>
              <button onClick={() => setShowTrainingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTraining} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Training Title</label>
                <input
                  type="text"
                  required
                  value={trainingForm.title || ''}
                  onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  placeholder="e.g. SLA Resin 3D Printing & Slicer Masterclass"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date (Calendar Picker)</label>
                  <input
                    type="date"
                    value={formatDateForPicker(trainingForm.date)}
                    onChange={(e) => {
                      const formatted = formatDateForDisplay(e.target.value);
                      setTrainingForm({ ...trainingForm, date: formatted || e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white [color-scheme:dark] cursor-pointer focus:outline-none focus:border-emerald-500"
                  />
                  {trainingForm.date && (
                    <p className="text-[10px] text-emerald-400 font-medium mt-1">
                      Selected: {trainingForm.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={trainingForm.max_participants || 25}
                    onChange={(e) => setTrainingForm({ ...trainingForm, max_participants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={trainingForm.description || ''}
                  onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  placeholder="Training syllabus and practical modules..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTraining}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold disabled:opacity-50"
                >
                  {isSavingTraining ? 'Saving...' : 'Save Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        isLoading={isDeletingItem}
        onConfirm={confirmModalState.onConfirm}
        onClose={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
      />

    </div>
  );
}
