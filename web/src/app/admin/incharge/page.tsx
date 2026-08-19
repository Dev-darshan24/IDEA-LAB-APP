'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import { ConfirmModal } from '@/components/ConfirmModal';
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
  User,
  Sparkles,
  Save,
  Check,
  Filter,
  LogOut,
  Zap,
  Globe,
  Settings,
  Search,
  X,
  ShieldCheck,
  ArrowLeft,
  Download,
  Eye,
  Clock,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  BookOpen,
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

interface MockApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  education: string;
  title: string;
  type: string;
  abstract: string;
  pdf_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  incharge_message?: string;
  date?: string;
}

const INITIAL_MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: 'app-001',
    applicant_name: 'Darshan Tripadwar',
    applicant_email: 'darshan@tgpcet.ac.in',
    education: 'B.Tech (Robotics & AI)',
    title: 'Web App',
    type: 'project',
    abstract: 'Smart AICTE IDEA LAB Web Application for project submissions and tracking.',
    status: 'pending',
    date: '2-7-2026',
  },
  {
    id: 'app-002',
    applicant_name: 'Aarav Sharma',
    applicant_email: 'aarav.sharma@tgpcet.ac.in',
    education: 'B.Tech (Mechanical)',
    title: 'Event 1',
    type: 'event',
    abstract: 'Registration for AICTE IDEA Lab 3D Printing & Additive Manufacturing Workshop.',
    status: 'approved',
    date: '3-7-2026',
  },
  {
    id: 'app-003',
    applicant_name: 'Priya Patel',
    applicant_email: 'priya.patel@tgpcet.ac.in',
    education: 'B.Tech (Computer Science)',
    title: 'Activity 1',
    type: 'event',
    abstract: 'Participation application for hands-on ESP32 and MicroPython training.',
    status: 'on_hold',
    date: '4-7-2026',
  },
  {
    id: 'app-004',
    applicant_name: 'Rohan Deshmukh',
    applicant_email: 'rohan.d@tgpcet.ac.in',
    education: 'B.Tech (Electronics)',
    title: 'Training 1',
    type: 'training',
    abstract: 'Training registration for CO2 Laser Cutting & Engraving certification.',
    status: 'pending',
    date: '5-7-2026',
  },
  {
    id: 'app-005',
    applicant_name: 'Sneha Kulkarni',
    applicant_email: 'sneha.k@tgpcet.ac.in',
    education: 'B.Tech (Civil)',
    title: 'Training 2',
    type: 'training',
    abstract: 'Reverse Engineering with 3D Laser Scanning Masterclass.',
    status: 'approved',
    date: '6-7-2026',
  },
];

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

export default function InchargeDashboardPage() {
  const { isSuperAdmin1, user, updateProfile, logout } = useAuth();
  const { triggerGlobalSync } = useRealtimeSync('*', () => { fetchLiveData(); });

  // Navigation tab:
  // 'analytics' | 'apply_edit' | 'applications' | 'users_details' | 'app_settings'
  const [activeTab, setActiveTab] = useState<'analytics' | 'apply_edit' | 'applications' | 'users_details' | 'app_settings'>('analytics');

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
    date: 'August 28, 2026',
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
    date: 'September 05, 2026',
    venue: 'AICTE IDEA Lab, TGPCET',
    organizer: 'Dr. Neeraj Waijode',
    max_participants: 30,
    status: 'published',
  });

  // Applications State (Start empty so demo records never show up; only real applications from users appear)
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'on_hold'>('all');
  const [appSidebarCategory, setAppSidebarCategory] = useState<'projects' | 'events' | 'trainings'>('projects');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Users Details State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Account / Security state
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
        propRes,
        appsRes,
        actAppsRes,
        usersRes,
        configRes,
      ] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/notifications', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/activities?all=true', { cache: 'no-store' }),
        fetch('/api/proposals?all=true', { cache: 'no-store' }),
        fetch('/api/applications', { cache: 'no-store' }),
        fetch('/api/activity-applications?all=true', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/apply-config', { cache: 'no-store' }),
      ]);

      const [
        statsData,
        notifData,
        eventsData,
        trainingsData,
        propData,
        appsData,
        actAppsData,
        usersData,
        configData,
      ] = await Promise.all([
        statsRes.json().catch(() => ({})),
        notifRes.json().catch(() => ({})),
        eventsRes.json().catch(() => ({})),
        trainingsRes.json().catch(() => ({})),
        propRes.json().catch(() => ({})),
        appsRes.json().catch(() => ({})),
        actAppsRes.json().catch(() => ({})),
        usersRes.json().catch(() => ({})),
        configRes.json().catch(() => ({})),
      ]);

      // 1. Stats
      if (statsData.success && statsData.stats) {
        setLiveStats({
          totalUsers: statsData.stats.totalUsers || 0,
          totalProjectRequests: statsData.stats.totalProjectRequests || 0,
          totalNotifications: statsData.stats.totalNotifications || 0,
        });
      }

      // 2. Notifications (Limit 10)
      if (notifData.success && Array.isArray(notifData.notifications)) {
        setNotifications(notifData.notifications.slice(0, 10));
        setUnreadCount(notifData.unreadCount || notifData.notifications.filter((n: NotificationItem) => !n.is_read).length);
      }

      // 3. Events List
      if (eventsData.success && Array.isArray(eventsData.events)) {
        setEventsList(eventsData.events);
      }

      // 4. Trainings List
      if (trainingsData.success && Array.isArray(trainingsData.activities)) {
        setTrainingsList(trainingsData.activities);
      }

      // 5. Applications / Proposals
      let realAppsList: MockApplication[] = [];
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
        realAppsList = [...mappedProps];
      }

      if (appsData.success && Array.isArray(appsData.applications) && appsData.applications.length > 0) {
        const mappedApps = appsData.applications.map((a: any) => ({
          id: a.id,
          applicant_name: a.applicant_name || 'Participant',
          applicant_email: a.applicant_email || '',
          education: a.education || 'B.Tech',
          title: a.title || 'Application',
          type: a.type || 'event',
          abstract: a.description || a.title || '',
          pdf_url: a.pdf_url || '',
          status: a.status || 'approved',
          incharge_message: a.incharge_message || '',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString() : (a.date || new Date().toLocaleDateString()),
        }));
        
        const existingIds = new Set(realAppsList.map((x) => x.id));
        mappedApps.forEach((ma: any) => {
          if (!existingIds.has(ma.id)) {
            realAppsList.push(ma);
          }
        });
      }

      if (actAppsData.success && Array.isArray(actAppsData.applications) && actAppsData.applications.length > 0) {
        const mappedActs = actAppsData.applications.map((a: any) => ({
          id: a.id,
          applicant_name: a.applicant_name || 'Participant',
          applicant_email: a.applicant_email || '',
          education: a.education || `${a.branch || 'B.Tech'} (${a.department || 'Engineering'})`,
          title: a.activity_title || a.title || 'Event Application',
          type: a.type ? a.type.toLowerCase() : 'event',
          abstract: a.description || `Event registration for ${a.activity_title || a.title || 'Activity'}`,
          pdf_url: '',
          status: a.status || 'approved',
          incharge_message: a.admin_comments || '',
          date: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : (a.date || new Date().toLocaleDateString()),
        }));

        const existingIds = new Set(realAppsList.map((x) => x.id));
        mappedActs.forEach((ma: any) => {
          if (!existingIds.has(ma.id)) {
            realAppsList.push(ma);
          }
        });
      }

      setApplications(realAppsList);

      // 6. Users List
      if (usersData.success && Array.isArray(usersData.users)) {
        setUsersList(usersData.users);
      }

      // 7. Global Apply Form Config
      if (configData.success && configData.config) {
        setProjectFormSettings(configData.config);
      }
    } catch (e) {
      console.error('Error fetching incharge live metrics:', e);
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
        setActionSuccess('Project Application Form settings saved permanently to Supabase database!');
        setTimeout(() => setActionSuccess(''), 3500);
        triggerGlobalSync();
      } else {
        setActionSuccess(`Failed to save settings: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save project form settings:', err);
      setActionSuccess('Error saving settings to Supabase database.');
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
        setActionSuccess(editingEvent ? 'Event updated permanently in Supabase!' : 'Event created permanently in Supabase!');
        setTimeout(() => setActionSuccess(''), 3000);
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
        setActionSuccess(`Failed to save event: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save event:', err);
      setActionSuccess('Error saving event to Supabase database.');
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
            setActionSuccess('Event deleted permanently from Supabase!');
            setTimeout(() => setActionSuccess(''), 3000);
            triggerGlobalSync();
          } else {
            setActionSuccess(`Failed to delete event: ${data.message}`);
          }
        } catch (err: any) {
          console.error('Failed to delete event:', err);
          setActionSuccess('Error deleting event from Supabase database.');
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
        setActionSuccess(editingTraining ? 'Training program updated permanently in Supabase!' : 'Training program created permanently in Supabase!');
        setTimeout(() => setActionSuccess(''), 3000);
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
        setActionSuccess(`Failed to save training program: ${data.message}`);
      }
    } catch (err: any) {
      console.error('Failed to save training program:', err);
      setActionSuccess('Error saving training program to Supabase database.');
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
            setActionSuccess('Training program deleted permanently from Supabase!');
            setTimeout(() => setActionSuccess(''), 3000);
            triggerGlobalSync();
          } else {
            setActionSuccess(`Failed to delete training program: ${data.message}`);
          }
        } catch (err: any) {
          console.error('Failed to delete training program:', err);
          setActionSuccess('Error deleting training program from Supabase database.');
        } finally {
          setIsDeletingItem(false);
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Proposal Approval Status Handler (Accept, Reject, Hold)
  const handleUpdateStatus = async (appId: string, status: 'approved' | 'rejected' | 'on_hold') => {
    try {
      await fetch('/api/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: appId,
          status,
          admin_comments: messageInput,
        }),
      });
    } catch (err) {
      console.error('Failed to sync proposal status:', err);
    }

    const updated = applications.map((app) =>
      app.id === appId ? { ...app, status, incharge_message: messageInput } : app
    );
    setApplications(updated);
    setActionSuccess(`Application status changed to ${status.toUpperCase().replace('_', ' ')}!`);
    setTimeout(() => setActionSuccess(''), 3500);
    setSelectedApp(null);
    setMessageInput('');
    triggerGlobalSync();
  };

  // Export Filtered Applications to CSV File
  const handleExportCSV = () => {
    const dataToExport = displayApplications.length > 0 ? displayApplications : applications;
    const headers = ['Sr. No', 'Name', 'Project / Application Name', 'Category', 'Date', 'Status', 'Applicant Email', 'Education'];
    const csvRows = [
      headers.join(','),
      ...dataToExport.map((app, index) => [
        index + 1,
        `"${(app.applicant_name || '').replace(/"/g, '""')}"`,
        `"${(app.title || '').replace(/"/g, '""')}"`,
        `"${(app.type || 'project').toUpperCase()}"`,
        `"${app.date || '2-7-2026'}"`,
        `"${(app.status || 'pending').toUpperCase()}"`,
        `"${(app.applicant_email || '').replace(/"/g, '""')}"`,
        `"${(app.education || '').replace(/"/g, '""')}"`,
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `idea_lab_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Users Directory CSV
  const exportUsersCSV = () => {
    const dataToExport = filteredUsers.length > 0 ? filteredUsers : usersList;
    const headers = ['Sr. No', 'First Name', 'Last Name', 'Email Address', 'College ID / Education', 'Role', 'Joined Date'];
    const csvRows = [
      headers.join(','),
      ...dataToExport.map((u, index) => [
        index + 1,
        `"${(u.first_name || '').replace(/"/g, '""')}"`,
        `"${(u.last_name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.college_id || u.education || 'B.Tech').replace(/"/g, '""')}"`,
        `"${(u.role || 'user').toUpperCase()}"`,
        `"${u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}"`,
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `idea_lab_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      console.error('Error sending notification:', err);
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
      setAccountStatusMsg({ type: 'success', text: 'Incharge Password updated successfully!' });
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setAccountStatusMsg({ type: 'error', text: 'Failed to update password.' });
    }
  };

  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeUsersList = Array.isArray(usersList) ? usersList : [];
  const safeEventsList = Array.isArray(eventsList) ? eventsList : [];
  const safeTrainingsList = Array.isArray(trainingsList) ? trainingsList : [];

  const displayApplications = safeApplications.filter((app) => {
    if (!app) return false;
    // 1. Status Filter
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    
    // 2. Category & Sub Filter
    if (appSidebarCategory === 'projects') {
      if (app.type && app.type !== 'project' && app.type !== 'proposal') return false;
    } else if (appSidebarCategory === 'events') {
      const isEventApp = app.type === 'event' || safeEventsList.some((e) => e && e.title && app.title && e.title.toLowerCase() === app.title.toLowerCase());
      if (!isEventApp) return false;
      if (selectedSubFilter !== 'all') {
        const titleMatch = app.title && selectedSubFilter && app.title.trim().toLowerCase() === selectedSubFilter.trim().toLowerCase();
        const containsMatch = app.title && selectedSubFilter && app.title.toLowerCase().includes(selectedSubFilter.toLowerCase());
        if (!titleMatch && !containsMatch) return false;
      }
    } else if (appSidebarCategory === 'trainings') {
      const isTrainingApp = app.type === 'training' || safeTrainingsList.some((t) => t && t.title && app.title && t.title.toLowerCase() === app.title.toLowerCase());
      if (!isTrainingApp) return false;
      if (selectedSubFilter !== 'all') {
        const titleMatch = app.title && selectedSubFilter && app.title.trim().toLowerCase() === selectedSubFilter.trim().toLowerCase();
        const containsMatch = app.title && selectedSubFilter && app.title.toLowerCase().includes(selectedSubFilter.toLowerCase());
        if (!titleMatch && !containsMatch) return false;
      }
    }
    return true;
  });

  const filteredUsers = safeUsersList.filter((u) => {
    if (!u) return false;
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.college_id || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = safeApplications.filter((a) => a && a.status === 'pending').length;

  return (
    <div className="space-y-6 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">

      {/* ==================================================================== */}
      {/* EXECUTIVE HEADER BAR */}
      {/* ==================================================================== */}
        <header className="bg-slate-900/90 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-500/40 text-cyan-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  AICTE IDEA LAB
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 text-[10px] font-semibold">
                  TGPCET Campus
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Incharge Executive Portal
              </h1>
              <p className="text-xs text-slate-400">
                Central Command Center for Projects, Events & Training Operations
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
              {/* Live Supabase Sync Status Indicator */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs font-semibold text-slate-300 shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                <span className="text-cyan-400 font-bold">Live Supabase Sync</span>
                <button
                  onClick={fetchLiveData}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors ml-1"
                  title="Manual Sync Refresh"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Public Site Quick Link */}
              <Link
                href="/"
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-sky-500/30 hover:border-sky-400 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Global Action Success Banner */}
        {actionSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl flex items-center justify-between text-sm animate-fadeIn shadow-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* NAVIGATION TABS ROW (Dark Mode Blue Palette) */}
        {/* ==================================================================== */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          
          {/* Tab 0: Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-400 shadow-sky-500/30 ring-2 ring-sky-400/50 font-extrabold scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-cyan-300" />
            <span>Analytics</span>
          </button>

          {/* Tab 1: Apply Button Edit */}
          <button
            onClick={() => setActiveTab('apply_edit')}
            className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden ${
              activeTab === 'apply_edit'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-400 shadow-sky-500/30 ring-2 ring-sky-400/50 font-extrabold scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Edit className="w-4 h-4 shrink-0 text-cyan-300" />
            <span>Apply Button Edit</span>
          </button>

          {/* Tab 2: Applications (with Pending Badge) */}
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden ${
              activeTab === 'applications'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-400 shadow-sky-500/30 ring-2 ring-sky-400/50 font-extrabold scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-cyan-300" />
            <span>Applications</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'applications'
                  ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-500 text-slate-950 animate-pulse'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Tab 3: Users Details */}
          <button
            onClick={() => setActiveTab('users_details')}
            className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden ${
              activeTab === 'users_details'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-400 shadow-sky-500/30 ring-2 ring-sky-400/50 font-extrabold scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0 text-cyan-300" />
            <span>Users Details</span>
            {liveStats.totalUsers > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'users_details' ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300'
              }`}>
                {liveStats.totalUsers}
              </span>
            )}
          </button>

          {/* Tab 4: App Settings */}
          <button
            onClick={() => setActiveTab('app_settings')}
            className={`py-3.5 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden ${
              activeTab === 'app_settings'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-sky-400 shadow-sky-500/30 ring-2 ring-sky-400/50 font-extrabold scale-[1.02]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 text-cyan-300" />
            <span>App Settings</span>
          </button>

        </nav>

        {/* ==================================================================== */}
        {/* RECENT NOTIFICATIONS PANEL (Shown ONLY on Analytics Tab) */}
        {/* ==================================================================== */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    System Notifications & Alerts
                  </h2>
                  <span className="text-xs text-sky-400/90 font-medium">Real-time system feed from Supabase database</span>
                </div>
              </div>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Notification
              </button>
            </div>

            {/* List of Notifications */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No notifications found in system log.
                </div>
              ) : (
                notifications.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                        <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type || 'System'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 pl-4">{item.message}</p>
                    </div>
                    <div className="text-xs text-slate-500 self-end md:self-center font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ACTIVE TAB MAIN MANAGEMENT AREA */}
        {/* ==================================================================== */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">

          {/* ================================================================== */}
          {/* TAB 0: ANALYTICS DASHBOARD */}
          {/* ================================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              
              {/* Analytics Header Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                    <BarChart3 className="w-6 h-6 text-sky-400" />
                    IDEA Lab Executive Analytics & Insights
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time performance metrics, proposal conversion rates, and activity distribution.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-cyan-300 shadow-inner">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Live Analytics Engine
                </div>
              </div>

              {/* STATS CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1: Total User */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-sm">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tight">{liveStats.totalUsers}</div>
                    <p className="text-xs text-slate-400 mt-1">Registered Student Innovators & Faculty</p>
                  </div>
                </div>

                {/* Card 2: Project Requests */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-sky-500/40 transition-all rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Requests</span>
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tight">{liveStats.totalProjectRequests}</div>
                    <p className="text-xs text-slate-400 mt-1">Submitted Project Proposals & Ideas</p>
                  </div>
                </div>

                {/* Card 3: Unread Notifications */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/40 transition-all rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unread Notifications</span>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 shadow-sm">
                      <Bell className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white tracking-tight">{unreadCount}</div>
                    <p className="text-xs text-slate-400 mt-1">Total System Broadcasts: {liveStats.totalNotifications}</p>
                  </div>
                </div>

              </div>

              {/* SVG APPLICATION TRENDS CHART (Electric Blue Palette) */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Application Activity Velocity
                    </h4>
                    <p className="text-[11px] text-slate-400">Monthly submission frequency across Projects, Events, and Trainings</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Projects
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Events
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Trainings
                    </span>
                  </div>
                </div>

                <div className="w-full h-44 relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                    <line x1="0" y1="70" x2="600" y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                    <line x1="0" y1="110" x2="600" y2="110" stroke="#334155" strokeWidth="0.5" />

                    {/* Gradient Area Fill */}
                    <path
                      d="M 0 110 L 0 85 Q 80 40, 150 70 T 300 35 T 450 65 T 600 25 L 600 110 Z"
                      fill="url(#chartGrad)"
                    />
                    {/* Line Stroke */}
                    <path
                      d="M 0 85 Q 80 40, 150 70 T 300 35 T 450 65 T 600 25"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />

                    {/* Data Points */}
                    <circle cx="150" cy="70" r="4" fill="#06b6d4" className="animate-pulse" />
                    <circle cx="300" cy="35" r="4" fill="#38bdf8" />
                    <circle cx="450" cy="65" r="4" fill="#06b6d4" />
                    <circle cx="600" cy="25" r="4" fill="#10b981" />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-semibold">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span className="text-cyan-400 font-bold">Aug 2026</span>
                </div>
              </div>

              {/* 4 HIGHLIGHT METRIC STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                    <span>Approved Projects</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px]">
                      {applications.filter(a => a.type === 'project' && a.status === 'approved').length}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {applications.filter(a => a.type === 'project' && a.status === 'approved').length} / {applications.filter(a => a.type === 'project').length || 1}
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (applications.filter(a => a.type === 'project' && a.status === 'approved').length /
                            (applications.filter(a => a.type === 'project').length || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {Math.round(
                      (applications.filter(a => a.type === 'project' && a.status === 'approved').length /
                        (applications.filter(a => a.type === 'project').length || 1)) *
                        100
                    )}% Approval Conversion
                  </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                    <span>Pending Review</span>
                    <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 text-[10px]">
                      {applications.filter(a => a.status === 'pending').length}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-sky-300">
                    {applications.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, applications.filter(a => a.status === 'pending').length * 25)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Proposals awaiting Incharge decision</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                    <span>Active Events</span>
                    <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-[10px]">
                      {eventsList.length}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-cyan-300">
                    {eventsList.length}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Registrations: {applications.filter(a => a.type === 'event' || eventsList.some(e => e.title === a.title)).length}
                  </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                    <span>Active Trainings</span>
                    <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 text-[10px]">
                      {trainingsList.length}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-indigo-300">
                    {trainingsList.length}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Registrations: {applications.filter(a => a.type === 'training' || trainingsList.some(t => t.title === a.title)).length}
                  </p>
                </div>

              </div>

              {/* DETAILED STATS BREAKDOWN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Proposal Status Distribution */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-cyan-400" />
                    Proposal Status Breakdown
                  </h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-semibold mb-1">
                        <span>Approved Proposals</span>
                        <span className="text-emerald-400 font-bold">
                          {applications.filter(a => a.status === 'approved').length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{
                            width: `${(applications.filter(a => a.status === 'approved').length / (applications.length || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-semibold mb-1">
                        <span>Pending Review Proposals</span>
                        <span className="text-sky-400 font-bold">
                          {applications.filter(a => a.status === 'pending').length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-sky-500 h-full transition-all duration-500"
                          style={{
                            width: `${(applications.filter(a => a.status === 'pending').length / (applications.length || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-semibold mb-1">
                        <span>On Hold Proposals</span>
                        <span className="text-indigo-400 font-bold">
                          {applications.filter(a => a.status === 'on_hold').length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-500"
                          style={{
                            width: `${(applications.filter(a => a.status === 'on_hold').length / (applications.length || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-semibold mb-1">
                        <span>Rejected Proposals</span>
                        <span className="text-rose-400 font-bold">
                          {applications.filter(a => a.status === 'rejected').length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-rose-500 h-full transition-all duration-500"
                          style={{
                            width: `${(applications.filter(a => a.status === 'rejected').length / (applications.length || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Category Distribution */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Application Category Distribution
                  </h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <div className="font-bold text-white text-sm">Innovation Projects</div>
                        <div className="text-slate-400 text-[11px]">Hardware & software student proposals</div>
                      </div>
                      <span className="text-cyan-400 font-black text-lg">
                        {applications.filter(a => a.type === 'project' || a.type === 'proposal').length}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <div className="font-bold text-white text-sm">Events & Activities</div>
                        <div className="text-slate-400 text-[11px]">Hackathons, workshops & guest lectures</div>
                      </div>
                      <span className="text-sky-400 font-black text-lg">
                        {applications.filter(a => a.type === 'event' || eventsList.some(e => e.title === a.title)).length}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <div className="font-bold text-white text-sm">Training Masterclasses</div>
                        <div className="text-slate-400 text-[11px]">3D printing, CNC laser & PCB fabrication</div>
                      </div>
                      <span className="text-emerald-400 font-black text-lg">
                        {applications.filter(a => a.type === 'training' || trainingsList.some(t => t.title === a.title)).length}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 1: APPLY BUTTON EDIT (3 COLUMNS GRID) */}
          {/* ================================================================== */}
          {activeTab === 'apply_edit' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('applications')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    Apply Button Edit Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize project form questions, manage events list, and publish training masterclasses.
                  </p>
                </div>
              </div>

              {/* 3 COLUMNS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMN 1: Project Form Edit */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-base font-extrabold text-white">Project Form Edit</h4>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Proposal Form
                      </span>
                    </div>

                    <form onSubmit={handleSaveProjectFormSettings} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Project Title Question / Label
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.titleQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, titleQuestion: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Problem Statement Question / Label
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.problemQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, problemQuestion: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Description Question / Label
                        </label>
                        <textarea
                          rows={3}
                          value={projectFormSettings.descriptionQuestion}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, descriptionQuestion: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
                        <span className="text-slate-300 font-bold text-xs">Require PDF Upload (.pdf up to 15MB)</span>
                        <input
                          type="checkbox"
                          checked={projectFormSettings.requirePdfUpload}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, requirePdfUpload: e.target.checked })}
                          className="w-4 h-4 accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Eligibility Guidance Note
                        </label>
                        <input
                          type="text"
                          value={projectFormSettings.eligibilityNote}
                          onChange={(e) => setProjectFormSettings({ ...projectFormSettings, eligibilityNote: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingProjectSettings}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isSavingProjectSettings ? 'Saving Settings...' : 'Save Form Settings'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* COLUMN 2: Event Form Edit */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <h4 className="text-base font-extrabold text-white">Event Form Edit</h4>
                      </div>

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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all hover:scale-105"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Events
                      </button>
                    </div>

                    {/* Events List Feed */}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {eventsList.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          No active events. Click "+ Add Events" above to create one.
                        </div>
                      ) : (
                        eventsList.map((ev) => (
                          <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-sky-500/30 transition-all shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                {ev.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingEvent(ev);
                                    setEventForm(ev);
                                    setShowEventModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-bold text-white text-xs">{ev.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{ev.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-semibold">
                              <span>📅 {ev.date}</span>
                              <span>👤 {ev.trainer}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Training Form Edit */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-base font-extrabold text-white">Training Form Edit</h4>
                      </div>

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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all hover:scale-105"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Training
                      </button>
                    </div>

                    {/* Training List Feed */}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {trainingsList.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          No active training programs. Click "+ Add Training" above.
                        </div>
                      ) : (
                        trainingsList.map((tr) => (
                          <div key={tr.id || tr.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-emerald-500/30 transition-all shadow-md">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {tr.type || 'Training'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingTraining(tr);
                                    setTrainingForm(tr);
                                    setShowTrainingModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTraining(tr.id || '')}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h5 className="font-bold text-white text-xs">{tr.title}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{tr.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-semibold">
                              <span>📅 {tr.date}</span>
                              <span>👥 Max: {tr.max_participants || 30} Seats</span>
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

          {/* ================================================================== */}
          {/* TAB 2: APPLICATIONS PORTAL */}
          {/* ================================================================== */}
          {activeTab === 'applications' && (
            <div className="space-y-6">

              {/* Top Bar: Title & Status Filter Pills & Export CSV */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAppSidebarCategory('projects');
                      setSelectedSubFilter('all');
                      setFilterStatus('all');
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors border border-slate-700 flex items-center gap-1 text-xs font-bold"
                    title="Reset Filters"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      Applications Review Portal
                    </h2>
                    <p className="text-xs text-slate-400">
                      Incharge decision workflow for student project proposals, events & training registrations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status Quick Filters (ONLY for Projects) */}
                  {appSidebarCategory === 'projects' && (
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl text-xs">
                      {(['all', 'pending', 'approved', 'rejected', 'on_hold'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all text-[11px] ${
                            filterStatus === status
                              ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {status === 'on_hold' ? 'Hold' : status}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* EXPORT CSV Button */}
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    EXPORT CSV
                  </button>
                </div>
              </div>

              {/* MAIN WIREFRAME GRID: Left Sidebar (1 Col) & Right Applications Table (3 Col) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* LEFT SIDEBAR CATEGORY PANEL */}
                <div className="lg:col-span-1 space-y-4">
                  
                  {/* 1. PROJECTS Box */}
                  <div
                    onClick={() => {
                      setAppSidebarCategory('projects');
                      setSelectedSubFilter('all');
                    }}
                    className={`cursor-pointer rounded-3xl p-5 transition-all border shadow-lg ${
                      appSidebarCategory === 'projects'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black tracking-wide text-white text-center w-full py-1 border-b border-rose-500/30">
                        Projects
                      </h3>
                    </div>
                  </div>

                  {/* 2. EVENTS & ACTIVITIES Box */}
                  <div
                    className={`rounded-3xl p-5 transition-all border shadow-lg space-y-3 ${
                      appSidebarCategory === 'events'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-2 ring-sky-500/30'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setAppSidebarCategory('events');
                        setSelectedSubFilter('all');
                      }}
                      className="w-full text-left"
                    >
                      <h3 className="text-sm font-black text-white text-center py-1 border-b border-slate-700">
                        Events & Activities
                      </h3>
                    </button>

                    <div className="space-y-2 pt-1">
                      {eventsList.length === 0 ? (
                        <div className="text-center py-3 px-2 bg-slate-900/60 border border-slate-800 rounded-xl">
                          <p className="text-[11px] text-slate-400 font-medium">No real events added yet</p>
                        </div>
                      ) : (
                        eventsList.map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => {
                              setAppSidebarCategory('events');
                              setSelectedSubFilter(ev.title);
                            }}
                            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center truncate block ${
                              appSidebarCategory === 'events' && selectedSubFilter === ev.title
                                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                            title={ev.title}
                          >
                            {ev.title}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 3. TRAININGS Box */}
                  <div
                    className={`rounded-3xl p-5 transition-all border shadow-lg space-y-3 ${
                      appSidebarCategory === 'trainings'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setAppSidebarCategory('trainings');
                        setSelectedSubFilter('all');
                      }}
                      className="w-full text-left"
                    >
                      <h3 className="text-sm font-black text-white text-center py-1 border-b border-slate-700">
                        Trainings
                      </h3>
                    </button>

                    <div className="space-y-2 pt-1">
                      {trainingsList.length === 0 ? (
                        <div className="text-center py-3 px-2 bg-slate-900/60 border border-slate-800 rounded-xl">
                          <p className="text-[11px] text-slate-400 font-medium">No real trainings added yet</p>
                        </div>
                      ) : (
                        trainingsList.map((tr) => (
                          <button
                            key={tr.id || tr.title}
                            onClick={() => {
                              setAppSidebarCategory('trainings');
                              setSelectedSubFilter(tr.title);
                            }}
                            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center truncate block ${
                              appSidebarCategory === 'trainings' && selectedSubFilter === tr.title
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                            title={tr.title}
                          >
                            {tr.title}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT MAIN APPLICATIONS TABLE PANEL */}
                <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">

                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-cyan-400">Applications List</span> — {appSidebarCategory.toUpperCase()}
                        {selectedSubFilter !== 'all' && <span className="text-xs text-sky-400 font-bold">({selectedSubFilter})</span>}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Showing {displayApplications.length} record(s) matching active selection.
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-slate-400">
                      Category: <span className="text-cyan-300 font-extrabold capitalize">{appSidebarCategory}</span>
                    </div>
                  </div>

                  {displayApplications.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-sm">
                      No applications found for this filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-900 text-sky-400 border border-sky-500/40 uppercase font-black text-center">
                          <tr>
                            <th className="p-3 border border-slate-800 w-14">Sr. No</th>
                            <th className="p-3 border border-slate-800 text-left">Name</th>
                            <th className="p-3 border border-slate-800 text-left">
                              {appSidebarCategory === 'events' ? 'Event Name' : appSidebarCategory === 'trainings' ? 'Training Name' : 'Project Name'}
                            </th>
                            <th className="p-3 border border-slate-800 w-24">Details</th>
                            <th className="p-3 border border-slate-800 w-28">Date</th>
                            <th className="p-3 border border-slate-800 w-52">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {displayApplications.map((app, idx) => (
                            <tr key={app.id || idx} className="hover:bg-slate-900/60 transition-colors">
                              
                              {/* 1. Sr. No */}
                              <td className="p-3 text-center font-black text-slate-300 border border-slate-800/80">
                                {idx + 1}
                              </td>

                              {/* 2. Name */}
                              <td className="p-3 border border-slate-800/80">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                                    {(app.applicant_name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-xs">{app.applicant_name}</div>
                                    <div className="text-[11px] text-slate-400">{app.applicant_email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Project Name */}
                              <td className="p-3 border border-slate-800/80 font-bold text-cyan-300">
                                {app.title}
                              </td>

                              {/* 4. Details (View Button) */}
                              <td className="p-3 text-center border border-slate-800/80">
                                <button
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setMessageInput(app.incharge_message || '');
                                  }}
                                  className="px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400 hover:border-sky-300 rounded-xl font-bold text-xs transition-colors shadow-sm"
                                >
                                  View
                                </button>
                              </td>

                              {/* 5. Date */}
                              <td className="p-3 text-center border border-slate-800/80 text-slate-300 font-medium">
                                {app.date || '2-7-2026'}
                              </td>

                              {/* 6. Action */}
                              <td className="p-3 text-center border border-slate-800/80">
                                {appSidebarCategory === 'projects' ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'approved')}
                                      className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                                        app.status === 'approved'
                                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                      }`}
                                    >
                                      Accept
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                      className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                                        app.status === 'rejected'
                                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/50'
                                      }`}
                                    >
                                      Reject
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(app.id, 'on_hold')}
                                      className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
                                        app.status === 'on_hold'
                                          ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                                          : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/50'
                                      }`}
                                    >
                                      Hold
                                    </button>
                                  </div>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                                    Registered
                                  </span>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 3: USERS DETAILS */}
          {/* ================================================================== */}
          {activeTab === 'users_details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-white">Registered User Directory</h3>
                  <p className="text-xs text-slate-400">Total {usersList.length} user profile records stored in Supabase database.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search users by name, email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 w-64 shadow-inner"
                    />
                  </div>

                  <button
                    onClick={exportUsersCSV}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95 border border-sky-400/30"
                  >
                    <Download className="w-4 h-4 text-cyan-200" />
                    Export CSV ({filteredUsers.length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-extrabold">
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
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {(u.first_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-sm">
                              {u.first_name} {u.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-cyan-300 font-medium">{u.email}</td>
                        <td className="p-3 text-slate-400">{u.college_id || u.education || 'B.Tech'}</td>
                        <td className="p-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-medium">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================== */}
          {/* TAB 4: APP SETTINGS */}
          {/* ================================================================== */}
          {activeTab === 'app_settings' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-xl font-black text-white">System Security & Incharge Credentials</h3>
                <p className="text-xs text-slate-400">Update superadmin password credentials and database security settings.</p>
              </div>

              {/* Incharge Password Update */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 space-y-4 max-w-lg shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Change Incharge Account Password
                </h4>
                {accountStatusMsg && (
                  <div className={`p-3 rounded-2xl text-xs font-semibold ${
                    accountStatusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {accountStatusMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-sky-500/20"
                  >
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Review Proposal: {selectedApp.title}</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-slate-400">Applicant:</strong> {selectedApp.applicant_name} ({selectedApp.applicant_email})</p>
              <p><strong className="text-slate-400">Branch:</strong> {selectedApp.education}</p>
              <p><strong className="text-slate-400">Description:</strong> {selectedApp.abstract}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Incharge Message / Feedback</label>
              <textarea
                rows={3}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enter feedback for student..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {appSidebarCategory === 'projects' ? (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'on_hold')}
                    className="px-4 py-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 rounded-2xl font-bold border border-sky-500/30 text-xs"
                  >
                    Hold
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    className="px-4 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-2xl font-bold border border-rose-500/30 text-xs"
                  >
                    Reject Proposal
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-bold text-xs shadow-lg"
                  >
                    Approve Proposal
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Broadcast System Notification</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {broadcastSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold rounded-2xl text-center">
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-extrabold shadow-lg"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={eventForm.category || 'Event'}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white [color-scheme:dark] cursor-pointer focus:outline-none focus:border-cyan-500"
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl font-bold disabled:opacity-50 shadow-lg"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white [color-scheme:dark] cursor-pointer focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTraining}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-bold disabled:opacity-50 shadow-lg"
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
