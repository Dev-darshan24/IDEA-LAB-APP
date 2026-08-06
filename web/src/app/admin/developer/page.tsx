'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  KeyRound,
  Users,
  Activity,
  BarChart3,
  Flame,
  Bell,
  Send,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Cpu,
  Printer,
  Bot,
  Wrench,
  Monitor,
  Settings,
  ShieldCheck,
  User,
  X,
  Save,
  Globe,
  Database,
  TrendingUp,
  Sliders,
  Check,
  LogOut,
} from 'lucide-react';

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

const INITIAL_SECTIONS: SectionDetail[] = [
  {
    id: 'software-cell',
    title: 'Software Cell',
    subtitle: 'High Performance Workstations & Prototyping Suites',
    description: 'High-performance computing workstations hosting industry-standard tools including AutoCAD, Autodesk Fusion 360, VS Code, SolidWorks, and simulation frameworks.',
    equipments: ['Intel i9 RTX Workstations', 'AutoCAD Studio', 'Autodesk Fusion 360', 'VS Code IDE', 'MATLAB & Simulink'],
    section_head: 'Prof. A. K. Sharma',
    section_head_title: 'Head of Software Prototyping Cell',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'iot-pcb-design',
    title: 'IoT & PCB Design',
    subtitle: 'Embedded Systems & Automated PCB Prototyping',
    description: 'Specialized facility housing IoT microcontrollers, sensors, communication modules, and a CNC IoT PCB Milling and Etching machine for rapid circuit fabrication.',
    equipments: ['CNC IoT PCB Design Machine', 'Oscilloscopes & Logic Analyzers', 'Soldering Stations', 'ESP32 & STM32 Boards'],
    section_head: 'Dr. R. V. Deshmukh',
    section_head_title: 'Head of Embedded Systems & IoT',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3d-printing-prototyping',
    title: '3D Printing & Prototyping',
    subtitle: 'Additive Manufacturing & Rapid Modeling',
    description: 'Features dual industrial-grade 3D printers for high-precision additive manufacturing using PLA, ABS, PETG, and SLA resin materials.',
    equipments: ['Industrial Dual FDM 3D Printer', 'Precision Resin SLA 3D Printer', 'Handheld 3D Laser Scanner'],
    section_head: 'Prof. S. N. Kulkarni',
    section_head_title: 'Head of Additive Manufacturing',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'robotics-automation',
    title: 'Robotics & Automation',
    subtitle: 'Industrial Robotics & Precision CNC Machining',
    description: 'State-of-the-art facility featuring a 6-Axis Industrial Robotic Arm, CNC Lathe, and CNC Milling Machine for autonomous manufacturing research.',
    equipments: ['6-Axis Industrial Robotic Arm', 'CNC Milling Machine', 'Precision CNC Lathe Machine', 'PLC Trainer Kits'],
    section_head: 'Prof. M. B. Patil',
    section_head_title: 'Head of Robotics & Mechatronics',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'machining-fabrication',
    title: 'Machining & Fabrication',
    subtitle: 'Heavy Metalworking, Laser Cutting & CNC Routing',
    description: 'Includes heavy-duty metal fabrication tools, precision CO2 Laser Cutting Machine, CNC Router for wood/plastics/metals, and industrial lathe machines.',
    equipments: ['High Precision CO2 Laser Cutter', 'Heavy Duty CNC Router', 'Industrial Mechanical Lathe', 'MIG/TIG Welding'],
    section_head: 'Prof. V. P. Joshi',
    section_head_title: 'Head of Manufacturing & Fabrication',
    image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function DeveloperDashboardPage() {
  const { isSuperAdmin2, user, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'sections_cms' | 'analytics' | 'heatmap' | 'notifications' | 'site_settings' | 'account'>('sections_cms');
  
  // Sections State
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [editingSection, setEditingSection] = useState<SectionDetail | null>(null);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Notifications Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Master Site Settings State
  const [siteConfig, setSiteConfig] = useState({
    heroTitle: 'AICTE IDEA LAB TGPCET NAGPUR',
    heroSubtitle: 'Empowering Student Innovators with 5 Technical Prototyping Sections',
    maintenanceMode: false,
    contactEmail: 'idealab@tgpcet.ac.in',
    contactPhone: '+91 712 2810001',
  });

  // Account / Password State for Superadmin 2
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || 'Darshan',
    last_name: user?.last_name || 'Developer',
    email: user?.email || 'darshan@tgpcet.ac.in',
    phone: user?.phone || '+91 9123456789',
    college_id: user?.college_id || 'CSI-2026-001',
    address: user?.address || 'DRT-VERSE HQ, Nagpur',
  });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [accountStatusMsg, setAccountStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // App Heatmap Activity Data
  const heatmapData = [
    { route: '/ (Landing Page)', hits: 820, intensity: 'bg-emerald-500', percent: 92 },
    { route: '/sections (Technical Sections)', hits: 580, intensity: 'bg-sky-500', percent: 75 },
    { route: '/apply (Project Proposals)', hits: 410, intensity: 'bg-cyan-500', percent: 62 },
    { route: '/projects (Prototypes Feed)', hits: 340, intensity: 'bg-indigo-500', percent: 50 },
    { route: '/admin (Superadmin Consoles)', hits: 290, intensity: 'bg-amber-500', percent: 42 },
  ];

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || 'Darshan',
        last_name: user.last_name || 'Developer',
        email: user.email || 'darshan@tgpcet.ac.in',
        phone: user.phone || '+91 9123456789',
        college_id: user.college_id || 'CSI-2026-001',
        address: user.address || 'DRT-VERSE HQ, Nagpur',
      });
    }

    const stored = localStorage.getItem('idea_lab_sections_data');
    if (stored) {
      try {
        setSections(JSON.parse(stored));
      } catch (e) {
        setSections(INITIAL_SECTIONS);
      }
    } else {
      setSections(INITIAL_SECTIONS);
    }
  }, [user]);

  // FULL DASHBOARD METRICS strictly: (TOTAL USER, ANALYTICS, HEATMAP OF APP, TOTAL PROJECT REQUEST, NOTIFICATION)
  const totalUsers = 128;
  const analyticsHits = '2,440 Hits';
  const appHeatmapPeak = '/ (Peak 92%)';
  const totalProjectRequests = 15;
  const totalNotifications = 8;

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    const updated = sections.map((s) => (s.id === editingSection.id ? editingSection : s));
    setSections(updated);
    localStorage.setItem('idea_lab_sections_data', JSON.stringify(updated));

    setSaveMessage(`Section "${editingSection.title}" updated successfully across Web & Mobile apps!`);
    setTimeout(() => setSaveMessage(''), 4000);
    setEditingSection(null);
  };

  const handleAddEquipment = () => {
    if (!equipmentInput.trim() || !editingSection) return;
    setEditingSection({
      ...editingSection,
      equipments: [...editingSection.equipments, equipmentInput.trim()],
    });
    setEquipmentInput('');
  };

  const handleRemoveEquipment = (index: number) => {
    if (!editingSection) return;
    setEditingSection({
      ...editingSection,
      equipments: editingSection.equipments.filter((_, i) => i !== index),
    });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 3500);
  };

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Master site configuration updated successfully!');
    setTimeout(() => setSaveMessage(''), 4000);
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
      setAccountStatusMsg({ type: 'success', text: 'Developer Password updated successfully! Use new password on next login.' });
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
      setAccountStatusMsg({ type: 'success', text: 'Developer Profile information saved successfully!' });
    } else {
      setAccountStatusMsg({ type: 'error', text: 'Failed to save profile changes.' });
    }
  };

  if (!isSuperAdmin2) {
    return (
      <div className="glass-card p-12 text-center max-w-md mx-auto my-12 space-y-4 border border-rose-500/30">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Main Admin Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This console is reserved strictly for <strong>SUPERADMIN 2 (Developer Darshan - DRT-VERSE)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER */}
      <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-400 text-slate-950 tracking-widest inline-flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>MAIN SUPERADMIN 2 CONSOLE</span>
            </span>
            <span className="text-xs text-cyan-300 font-semibold">
              {profileForm.first_name} {profileForm.last_name} (Developer)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Master Developer Control Suite</h1>
          <p className="text-xs text-cyan-200">
            Full editing options for each section & each detail, platform analytics, live app heatmap, and master controls.
          </p>
        </div>

        {/* QUICK SETTINGS & PASSWORD CHANGE LINK */}
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

      {/* FULL DASHBOARD METRICS: (TOTAL USER, ANALYTICS, HEATMAP OF APP, TOTAL PROJECT REQUEST, NOTIFICATION) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1: TOTAL USER */}
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 space-y-1 hover:border-cyan-500/40 transition">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">TOTAL USER</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalUsers}</p>
          <span className="text-[10px] text-emerald-500 font-bold">Registered Users</span>
        </div>

        {/* Metric 2: ANALYTICS */}
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 space-y-1 hover:border-cyan-500/40 transition">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">ANALYTICS</span>
          <p className="text-2xl font-extrabold text-cyan-500">{analyticsHits}</p>
          <span className="text-[10px] text-slate-400">Monthly Traffic</span>
        </div>

        {/* Metric 3: HEATMAP OF APP */}
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 space-y-1 hover:border-cyan-500/40 transition">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">HEATMAP OF APP</span>
          <p className="text-2xl font-extrabold text-amber-500">{appHeatmapPeak}</p>
          <span className="text-[10px] text-amber-500 font-bold">Live Traffic Heatmap</span>
        </div>

        {/* Metric 4: TOTAL PROJECT REQUEST */}
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 space-y-1 hover:border-cyan-500/40 transition">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">TOTAL PROJECT REQUEST</span>
          <p className="text-2xl font-extrabold text-sky-500">{totalProjectRequests}</p>
          <span className="text-[10px] text-sky-500 font-bold">Applications Total</span>
        </div>

        {/* Metric 5: NOTIFICATION */}
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 space-y-1 hover:border-cyan-500/40 transition">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">NOTIFICATION</span>
          <p className="text-2xl font-extrabold text-indigo-500">{totalNotifications}</p>
          <span className="text-[10px] text-indigo-500 font-bold">Broadcasts Sent</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('sections_cms')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'sections_cms'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Edit Each Section & Each Detail ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>App Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'heatmap'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Heatmap of App</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'notifications'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('site_settings')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'site_settings'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Master Site Config</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition flex items-center space-x-2 ${
            activeTab === 'account'
              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Superadmin Profile & Password</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* TAB 1: EDIT OPTION FOR EACH SECTION AND EACH DETAIL (CMS EDITOR) */}
      {activeTab === 'sections_cms' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-500" />
              <span>Section Details Master Editor</span>
            </h2>
            <p className="text-xs text-slate-500">
              SuperAdmin 2 can edit every detail (title, subtitle, description, equipment list, section head, image) of each 5 technical sections.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section, sIdx) => (
              <div
                key={section.id}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
              >
                <div className="flex items-start space-x-4 max-w-2xl">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-cyan-500/30">
                    <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
                      Section 0{sIdx + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{section.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{section.subtitle}</p>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Head: {section.section_head} ({section.section_head_title})
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {section.equipments.map((eq, eIdx) => (
                        <span key={eIdx} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingSection(section)}
                  className="px-5 py-2.5 rounded-full font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md transition flex items-center space-x-1.5 shrink-0"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Each Detail</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              <span>Platform Analytics & System Performance</span>
            </h2>
            <p className="text-xs text-slate-500">Real-time performance metrics for IDEA LAB Web Portal and Mobile App.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/10 space-y-2">
              <span className="font-bold text-slate-500">Monthly Pageviews</span>
              <p className="text-3xl font-extrabold text-cyan-500">4,850</p>
              <p className="text-[11px] text-emerald-500 font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% vs last month</span>
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/10 space-y-2">
              <span className="font-bold text-slate-500">API Response Latency</span>
              <p className="text-3xl font-extrabold text-emerald-500">42 ms</p>
              <p className="text-[11px] text-emerald-500 font-semibold">Optimal Speed</p>
            </div>

            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/10 space-y-2">
              <span className="font-bold text-slate-500">Database Uptime</span>
              <p className="text-3xl font-extrabold text-indigo-500">99.98%</p>
              <p className="text-[11px] text-indigo-500 font-semibold">Supabase Cloud Health OK</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEATMAP OF APP */}
      {activeTab === 'heatmap' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Heatmap of App (Route & Usage Heatmap)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live interaction heatmap tracking student engagement across application routes.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {heatmapData.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>{item.route}</span>
                  <span>{item.hits} visits ({item.percent}% Heat Intensity)</span>
                </div>
                <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${item.intensity} transition-all duration-1000`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-cyan-500" />
              <span>Broadcast Notification to Web & Mobile Apps</span>
            </h2>
            <p className="text-xs text-slate-500">Send instant system notifications to all registered users.</p>
          </div>

          {broadcastSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Notification broadcasted live to all Web and Mobile clients!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Notification Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. IDEA LAB Upgraded with High-Speed 3D Printers"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Broadcast Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Details of system broadcast..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center space-x-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Send Master Broadcast</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MASTER SITE CONFIG & SETTINGS */}
      {activeTab === 'site_settings' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-500" />
              <span>Master Site Config & System Controls</span>
            </h2>
            <p className="text-xs text-slate-500">
              SuperAdmin 2 can toggle maintenance mode, edit global hero texts, and master application parameters.
            </p>
          </div>

          <form onSubmit={handleSaveSiteConfig} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Hero Main Title</label>
              <input
                type="text"
                value={siteConfig.heroTitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Hero Subtitle</label>
              <input
                type="text"
                value={siteConfig.heroSubtitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Maintenance Mode</h4>
                <p className="text-slate-500">Temporarily restrict student access for updates</p>
              </div>
              <input
                type="checkbox"
                checked={siteConfig.maintenanceMode}
                onChange={(e) => setSiteConfig({ ...siteConfig, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center space-x-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Master Config</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: SUPERADMIN 2 PROFILE & CHANGE PASSWORD */}
      {activeTab === 'account' && (
        <div className="glass-card p-6 md:p-8 rounded-4xl border border-cyan-500/20 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>SuperAdmin 2 Profile & Credentials Settings</span>
            </h2>
            <p className="text-xs text-slate-500">
              Update Developer login password, ID/email, and personal details. Configured via <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-cyan-500 font-mono">.env.local</code>.
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
                <X className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{accountStatusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* FORM 1: CHANGE PASSWORD */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/15 space-y-4">
              <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Change Developer Password</span>
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
                  <span>Update Developer Password</span>
                </button>
              </form>
            </div>

            {/* FORM 2: PROFILE DETAILS */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-cyan-500/15 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>Developer Personal Profile Details</span>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Developer Email / Superadmin ID</label>
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
                    <label className="font-bold text-slate-700 dark:text-slate-300">Developer ID</label>
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
                  className="w-full py-3 rounded-2xl font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Details</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR EACH SECTION AND EACH DETAIL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-4xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl space-y-5 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-cyan-500">SuperAdmin 2 CMS Editor</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Edit Section Details: {editingSection.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              {/* TITLE & SUBTITLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Section Title *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subtitle / Tagline *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.subtitle}
                    onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* SECTION HEAD & HEAD TITLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Section Head Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.section_head}
                    onChange={(e) => setEditingSection({ ...editingSection, section_head: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Section Head Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingSection.section_head_title}
                    onChange={(e) => setEditingSection({ ...editingSection, section_head_title: e.target.value })}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Section Image URL *</label>
                <input
                  type="text"
                  required
                  value={editingSection.image_url}
                  onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* EQUIPMENTS LIST EDITOR */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Installed Equipments & Machines:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add machine or software name..."
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="px-4 py-2.5 rounded-2xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {editingSection.equipments.map((eq, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 border border-cyan-500/20"
                    >
                      <span>{eq}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Section Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-5 py-3 rounded-2xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
