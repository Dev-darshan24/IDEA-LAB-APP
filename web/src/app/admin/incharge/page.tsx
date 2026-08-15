'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import UpdatesCarousel from '@/components/UpdatesCarousel';
import { UpdateItem } from '@/app/api/updates/route';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Users,
  FileText,
  Bell,
  Send,
  Lock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  User,
  Sparkles,
  Save,
  Check,
  Filter,
  LogOut,
  Zap,
} from 'lucide-react';

interface MockApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  education: string;
  title: string;
  type: string;
  abstract: string;
  pdf_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  incharge_message?: string;
  date?: string;
}

interface EventItem {
  id: string;
  title: string;
  category: 'Event' | 'Training' | 'Workshop';
  description: string;
  date: string;
  trainer: string;
  seats: string;
  status: 'Upcoming' | 'Completed' | 'Open for Registration';
}

export default function InchargeDashboardPage() {
  const { isSuperAdmin1, user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'events' | 'updates' | 'notifications' | 'account'>('requests');
  const [updatesList, setUpdatesList] = useState<UpdateItem[]>([]);

  // Applications State
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Events & Training State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventForm, setEventForm] = useState<Omit<EventItem, 'id'>>({
    title: '',
    category: 'Training',
    description: '',
    date: '',
    trainer: 'Dr. Neeraj Waijode',
    seats: '25 Seats',
    status: 'Open for Registration',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; time: string }>>([]);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');
  const [notifSent, setNotifSent] = useState(false);

  // Account / Password Change state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || 'Dr. Neeraj',
    last_name: user?.last_name || 'Waijode',
    email: user?.email || 'incharge@tgpcet.ac.in',
    phone: user?.phone || '+91 9876543210',
    college_id: user?.college_id || 'FAC-IDEA-01',
    address: user?.address || 'IDEA LAB TGPCET Campus, Nagpur',
  });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [accountStatusMsg, setAccountStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live stats from API
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    totalProjectRequests: 0,
    totalNotifications: 0,
  });

  const fetchUpdatesList = useCallback(async () => {
    try {
      const res = await fetch('/api/updates', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.updates)) {
        setUpdatesList(data.updates);
      }
    } catch (e) {
      console.error('Error fetching updates in admin:', e);
    }
  }, []);

  // Fetch all live data from Supabase APIs
  const fetchLiveData = useCallback(async () => {
    try {
      fetchUpdatesList();
      // 1. Fetch live proposals & applications from Supabase
      const propRes = await fetch('/api/proposals?all=true', { cache: 'no-store' });
      const propData = await propRes.json();
      if (propData.success && Array.isArray(propData.proposals) && propData.proposals.length > 0) {
        const mappedProps = propData.proposals.map((p: any) => ({
          id: p.id,
          applicant_name: p.applicant_name,
          applicant_email: p.applicant_email,
          education: `${p.branch || 'B.Tech'} (${p.department || 'Engineering'})`,
          title: p.project_name,
          type: 'project',
          abstract: p.project_description || p.problem_statement,
          pdf_url: p.document_path,
          status: p.status === 'submitted' ? 'pending' : (p.status || 'pending'),
          incharge_message: p.admin_comments || '',
          date: p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '',
        }));
        setApplications(mappedProps);
      } else {
        const appsRes = await fetch('/api/applications', { cache: 'no-store' });
        const appsData = await appsRes.json();
        if (appsData.success && Array.isArray(appsData.applications)) {
          setApplications(appsData.applications);
        }
      }

      // 2. Fetch live events & activities from Supabase
      const actRes = await fetch('/api/activities?all=true', { cache: 'no-store' });
      const actData = await actRes.json();
      if (actData.success && Array.isArray(actData.activities)) {
        const mappedEvents = actData.activities.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.type === 'workshop' ? 'Workshop' : (a.type === 'event' ? 'Event' : 'Training'),
          description: a.description,
          date: a.date,
          trainer: a.organizer || 'Dr. Neeraj Waijode',
          seats: `${a.max_participants || 30} Seats (${a.enrolled_count || 0} Registered)`,
          status: a.registration_open ? 'Open for Registration' : 'Upcoming',
        }));
        setEvents(mappedEvents);
      }

      // 3. Fetch live admin stats
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setLiveStats({
          totalUsers: statsData.stats.totalUsers || 0,
          totalProjectRequests: statsData.stats.totalProjectRequests || 0,
          totalNotifications: statsData.stats.totalNotifications || 0,
        });
      }
    } catch (e) {
      console.error('Error fetching incharge live data:', e);
    }
  }, [fetchUpdatesList]);

  // Hook up zero-delay realtime sync
  const { triggerGlobalSync } = useRealtimeSync('*', () => {
    fetchLiveData();
  });

  useEffect(() => {
    // Sync profile form when user object updates
    if (user) {
      setProfileForm({
        first_name: user.first_name || 'Dr. Neeraj',
        last_name: user.last_name || 'Waijode',
        email: user.email || 'incharge@tgpcet.ac.in',
        phone: user.phone || '+91 9876543210',
        college_id: user.college_id || 'FAC-IDEA-01',
        address: user.address || 'IDEA LAB TGPCET Campus, Nagpur',
      });
    }

    // Sync incharge notifications from local storage
    const storedNotifs = localStorage.getItem('idea_lab_incharge_notifications');
    if (storedNotifs) {
      try {
        const parsedNotifs = JSON.parse(storedNotifs);
        setNotifications(Array.isArray(parsedNotifs) ? parsedNotifs : []);
      } catch (e) {
        setNotifications([]);
      }
    }

    // Initial fetch
    fetchLiveData();
  }, [user, fetchLiveData]);

  // LIMITED DASHBOARD METRICS strictly: (TOTAL USER, TOTAL PROJECT REQUEST, NOTIFICATION)
  const totalUsers = liveStats.totalUsers;
  const totalProjectRequests = applications.length || liveStats.totalProjectRequests;
  const totalNotifications = notifications.length || liveStats.totalNotifications;

  const filteredApplications = applications.filter((app) =>
    filterStatus === 'all' ? true : app.status === filterStatus
  );

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, status, incharge_message: messageInput } : app
    );
    setApplications(updated);

    try {
      await fetch('/api/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_comments: messageInput }),
      });
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, incharge_message: messageInput }),
      });
      triggerGlobalSync('project_proposals');
    } catch (err) {
      console.error('Failed to sync decision to server:', err);
    }

    setActionSuccess(`Application ${status} successfully! Direct message dispatched to ${selectedApp?.applicant_name}.`);
    setTimeout(() => setActionSuccess(''), 5000);

    setSelectedApp(null);
    setMessageInput('');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedEv: EventItem[];
    const payload = editingEvent ? { id: editingEvent.id, ...eventForm } : { ...eventForm };

    if (editingEvent) {
      updatedEv = events.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...eventForm } : ev));
    } else {
      const newEv: EventItem = {
        id: 'ev-' + Date.now(),
        ...eventForm,
      };
      updatedEv = [newEv, ...events];
    }
    setEvents(updatedEv);

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent ? editingEvent.id : undefined,
          title: eventForm.title,
          type: eventForm.category.toLowerCase(),
          description: eventForm.description,
          date: eventForm.date,
          organizer: eventForm.trainer,
          registration_open: eventForm.status === 'Open for Registration',
          status: 'published',
        }),
      });
      triggerGlobalSync('events');
    } catch (err) {
      console.error('Failed to sync activity to server:', err);
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({
      title: '',
      category: 'Training',
      description: '',
      date: '',
      trainer: 'Dr. Neeraj Waijode',
      seats: '25 Seats',
      status: 'Open for Registration',
    });
  };

  const [deleteConfirmEventId, setDeleteConfirmEventId] = useState<string | null>(null);

  const handleDeleteEvent = async (id: string) => {
    const updatedEv = events.filter((ev) => ev.id !== id);
    setEvents(updatedEv);
    setDeleteConfirmEventId(null);

    try {
      await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      triggerGlobalSync('events');
    } catch (err) {
      console.error('Failed to delete event on server:', err);
    }
  };

  const handleSendInchargeNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const newN = {
      id: 'n-' + Date.now(),
      title: newNotifTitle,
      message: newNotifMessage,
      time: 'Just Now',
    };
    const updatedNotifs = [newN, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('idea_lab_incharge_notifications', JSON.stringify(updatedNotifs));
    setNotifSent(true);
    setTimeout(() => {
      setNotifSent(false);
      setNewNotifTitle('');
      setNewNotifMessage('');
    }, 3000);
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
      setAccountStatusMsg({ type: 'success', text: 'Superadmin Password updated successfully! Use new password on next login.' });
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setAccountStatusMsg({ type: 'error', text: 'Failed to update password.' });
    }
  };

  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile(profileForm);
    if (ok) {
      setAccountStatusMsg({ type: 'success', text: 'Incharge Profile information saved successfully!' });
    } else {
      setAccountStatusMsg({ type: 'error', text: 'Failed to save profile changes.' });
    }
  };

  if (!isSuperAdmin1) {
    return (
      <div className="glass-card p-12 text-center max-w-md mx-auto my-12 space-y-4 border border-rose-500/30">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Incharge Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This console is reserved strictly for <strong>Dr. Neeraj Waijode (IDEA LAB Incharge)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="glass-card p-6 md:p-8 rounded-4xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white tracking-widest inline-flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>INCHARGE CONSOLE</span>
            </span>
            <span className="text-xs text-indigo-300 font-semibold">
              {profileForm.first_name} {profileForm.last_name} (Lab Incharge)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Incharge Administration Suite</h1>
          <p className="text-xs text-slate-300">
            Manage project applications, edit events & training programs, and direct message student innovators.
          </p>
        </div>

        {/* QUICK SETTINGS & PROFILE CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center space-x-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Change Password & Profile</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-full text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400/30 transition flex items-center space-x-1.5 shadow-lg shadow-rose-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* LIMITED DASHBOARD METRICS strictly: (TOTAL USER, TOTAL PROJECT REQUEST, NOTIFICATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: TOTAL USER */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/20 space-y-2 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">TOTAL USER</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalUsers}</p>
          <p className="text-[11px] text-emerald-500 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Registered Students & Faculty</span>
          </p>
        </div>

        {/* Metric 2: TOTAL PROJECT REQUEST */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/20 space-y-2 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">TOTAL PROJECT REQUEST</span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalProjectRequests}</p>
          <p className="text-[11px] text-sky-500 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proposals Awaiting Approval / Review</span>
          </p>
        </div>

        {/* Metric 3: NOTIFICATION */}
        <div className="glass-card p-5 rounded-3xl border border-indigo-500/20 space-y-2 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider">NOTIFICATION</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalNotifications}</p>
          <p className="text-[11px] text-amber-500 font-semibold flex items-center space-x-1">
            <Send className="w-3.5 h-3.5" />
            <span>Lab Broadcasts & Incharge Notices</span>
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Project Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Edit Events & Training Programs ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'updates'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Image Updates Carousel ({updatesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Incharge Notices ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'account'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Profile & Password</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: PROJECT APPLICATIONS & APPROVALS */}
      {activeTab === 'requests' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-indigo-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Project Applications & Proposals
              </h2>
              <p className="text-xs text-slate-500">
                Review student proposals, approve or reject, and attach direct messages to applicants.
              </p>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-full font-bold uppercase text-[10px] transition ${
                    filterStatus === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Live Proposals or Applications Received</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Student project proposals and training applications submitted through the <strong>/apply</strong> page will appear here live in real time.
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{app.title}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 uppercase">
                        {app.type || 'project'}
                      </span>
                    </div>

                    <p className="text-sky-600 dark:text-cyan-400 font-semibold">
                      Applicant: <strong>{app.applicant_name}</strong> ({app.education}) • {app.applicant_email}
                    </p>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{app.abstract}</p>

                    {app.incharge_message && (
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-start space-x-1.5 mt-1">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Direct Message Sent: "{app.incharge_message}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {app.pdf_url && (
                      <a
                        href={app.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition"
                      >
                        View Proposal PDF
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setMessageInput(app.incharge_message || '');
                      }}
                      className="px-4 py-2 rounded-full font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Review & Action</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EDIT EVENTS & TRAINING PROGRAMS */}
      {activeTab === 'events' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-indigo-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>Edit Events & Training Programs</span>
              </h2>
              <p className="text-xs text-slate-500">
                SuperAdmin 1 controls upcoming workshops, bootcamps, and training registrations.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({
                  title: '',
                  category: 'Training',
                  description: '',
                  date: '',
                  trainer: profileForm.first_name + ' ' + profileForm.last_name,
                  seats: '25 Seats',
                  status: 'Open for Registration',
                });
                setShowEventModal(true);
              }}
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Event / Training</span>
            </button>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Events or Training Workshops Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>"+ Add Event / Training"</strong> above to publish upcoming workshops, boot camps, or hackathons.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-500/15 space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {ev.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-500">{ev.status}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{ev.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{ev.description}</p>

                    <div className="pt-2 space-y-1 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700/50">
                      <p>📅 <strong>Date:</strong> {ev.date}</p>
                      <p>👨‍🏫 <strong>Trainer / Coordinator:</strong> {ev.trainer}</p>
                      <p>👥 <strong>Capacity:</strong> {ev.seats}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingEvent(ev);
                        setEventForm({
                          title: ev.title,
                          category: ev.category,
                          description: ev.description,
                          date: ev.date,
                          trainer: ev.trainer,
                          seats: ev.seats,
                          status: ev.status,
                        });
                        setShowEventModal(true);
                      }}
                      className="flex-1 py-2 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-200 transition flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Program</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="px-3 py-2 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IMAGE UPDATES CAROUSEL MANAGER */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-900/40 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Image Updates & Banner Management</span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage auto-sliding homepage updates (3s interval). Add, edit, or delete update slides stored permanently in Supabase.
            </p>
          </div>
          <UpdatesCarousel updates={updatesList} isSuperAdmin={true} onRefresh={fetchUpdatesList} />
        </div>
      )}

      {/* TAB 4: INCHARGE NOTIFICATIONS & ANNOUNCEMENTS */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-indigo-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              <span>Incharge Announcements & Notices</span>
            </h2>
            <p className="text-xs text-slate-500">
              Publish official notices from Dr. Neeraj Waijode to all students and faculty.
            </p>
          </div>

          {notifSent && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Announcement published live!</span>
            </div>
          )}

          <form onSubmit={handleSendInchargeNotice} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Safety Briefing for 3D Printing Cell"
                value={newNotifTitle}
                onChange={(e) => setNewNotifTitle(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Message Content *</label>
              <textarea
                rows={3}
                required
                placeholder="Details of notice from Incharge Dr. Neeraj Waijode..."
                value={newNotifMessage}
                onChange={(e) => setNewNotifMessage(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Notices History</h3>
            <div className="space-y-2 text-xs">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-2">No incharge notices or announcements broadcasted yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-500/10">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPERADMIN PROFILE & CHANGE PASSWORD */}
      {activeTab === 'account' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-indigo-500/20 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>Incharge Profile & Credentials Settings</span>
            </h2>
            <p className="text-xs text-slate-500">
              Update Incharge login password, ID/email, and contact details. Initial credentials are configured via <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500 font-mono">.env.local</code>.
            </p>
          </div>

          {accountStatusMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${
                accountStatusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              {accountStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{accountStatusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* FORM 1: CHANGE PASSWORD */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-500/15 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Change Superadmin Password</span>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* FORM 2: PROFILE DETAILS */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-500/15 space-y-4">
              <div className="flex items-center space-x-2 text-sky-600 dark:text-cyan-400 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>Incharge Personal Profile Details</span>
              </div>

              <form onSubmit={handleSaveProfileInfo} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">First Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Incharge Email / Superadmin ID</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">Faculty ID</label>
                    <input
                      type="text"
                      value={profileForm.college_id}
                      onChange={(e) => setProfileForm({ ...profileForm, college_id: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Details</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE / REJECT MODAL WITH DIRECT MESSAGE TO APPLICANT */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-4xl p-6 border border-indigo-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-500">Incharge Review</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedApp.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Applicant: <strong>{selectedApp.applicant_name}</strong> ({selectedApp.applicant_email})
            </p>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Send Direct Incharge Message to Applicant:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Project approved! Meet Dr. Neeraj Waijode on Monday at 11 AM in IDEA LAB."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => handleDecision(selectedApp.id, 'approved')}
                className="flex-1 py-3 rounded-2xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center justify-center space-x-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
              <button
                onClick={() => handleDecision(selectedApp.id, 'rejected')}
                className="flex-1 py-3 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md flex items-center justify-center space-x-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT EDIT / ADD MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-4xl p-6 border border-indigo-500/30 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Event / Training Program' : 'Create New Event / Training Program'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Training">Training</option>
                    <option value="Event">Event</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                    className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Open for Registration">Open for Registration</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date / Schedule</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aug 15-20, 2026"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Trainer / Head</label>
                  <input
                    type="text"
                    required
                    value={eventForm.trainer}
                    onChange={(e) => setEventForm({ ...eventForm, trainer: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition"
              >
                {editingEvent ? 'Save Event Changes' : 'Create Event Program'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
