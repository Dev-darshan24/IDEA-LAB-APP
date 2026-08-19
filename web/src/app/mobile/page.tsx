'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  Bell, 
  Sun, 
  Moon, 
  Wifi, 
  Battery, 
  Zap, 
  Cpu, 
  Printer, 
  Bot, 
  Wrench,
  ChevronRight,
  ExternalLink,
  Smartphone,
  RotateCcw
} from 'lucide-react';

export default function AndroidMobileSimulator() {
  const [activeTab, setActiveTab] = useState<'home' | 'sections' | 'projects' | 'gallery' | 'profile'>('home');
  const [isDark, setIsDark] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [liveProjects, setLiveProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          setLiveProjects(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  const triggerNotification = () => {
    setNotificationMsg('No new notifications from Dr. Neeraj Waijode');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Header bar */}
      <div className="max-w-md w-full mb-6 flex items-center justify-between bg-slate-900/90 border border-slate-800 backdrop-blur px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">Android APK Preview</h1>
            <p className="text-xs text-slate-400">idea_lab_mobile v1.0.0 (Material 3)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Android Device Mockup Frame */}
      <div className="relative w-[380px] h-[780px] bg-black rounded-[48px] p-3 shadow-2xl shadow-sky-500/10 border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
        
        {/* Punch Hole Camera */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full z-50 ring-2 ring-slate-900/80 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className={`relative w-full h-full rounded-[38px] overflow-hidden flex flex-col transition-colors duration-300 ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>

          {/* Android Status Bar */}
          <div className={`h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-semibold z-40 select-none ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <span>08:20</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-sky-500">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Flutter App Bar */}
          <div className={`px-4 py-3 flex items-center justify-between border-b z-30 transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div>
              <h2 className="font-extrabold text-base leading-tight tracking-tight">AICTE IDEA LAB</h2>
              <p className="text-[10px] font-bold text-sky-500">TGPCET Nagpur</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full transition ${isDark ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={triggerNotification}
                className={`p-2 rounded-full transition relative ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>
              </button>
            </div>
          </div>

          {/* Toast Notification Banner inside App */}
          {notificationMsg && (
            <div className="absolute top-14 left-4 right-4 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 z-50 flex items-center gap-2 animate-bounce">
              <Bell className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* App Body Content View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
            {activeTab === 'home' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Gradient Hero Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                  <h3 className="text-xl font-extrabold tracking-tight">AICTE IDEA LAB</h3>
                  <p className="text-xs text-sky-100/90 mt-1 leading-snug">Tulsiramji Gaikwad Patil College of Engineering & Technology</p>
                  <div className="mt-3 pt-3 border-t border-white/20 text-xs font-semibold text-cyan-200">
                    Incharge: Dr. Neeraj Waijode
                  </div>
                </div>

                {/* Announcement Badge */}
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  isDark ? 'bg-sky-950/40 border-sky-800/50 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-900'
                }`}>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="truncate font-medium">🔥 Registration open for 3D Printing & Robotics Boot Camp 2026!</p>
                </div>

                {/* Vision & Mission */}
                <div>
                  <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Vision & Mission</h4>
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                  }`}>
                    "To establish IDEA LAB as a Centre of Excellence for innovation, design, research, and interdisciplinary learning that empowers students to transform ideas into impactful real-world solutions."
                  </div>
                </div>

                {/* Life Inside IDEA LAB */}
                <div>
                  <h4 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Life Inside IDEA LAB</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {[
                      { title: '3D Printing Studio', img: '' },
                      { title: '6-Axis Robotic Arm', img: '' },
                      { title: 'IoT PCB Etching', img: '' },
                    ].map((item, idx) => (
                      <div key={idx} className="relative w-48 h-28 rounded-2xl overflow-hidden shrink-0 shadow-md group bg-slate-900 flex items-center justify-center">
                        {item.img ? (
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-950 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-sky-500/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-sky-500 uppercase tracking-wider">5 Technical Lab Sections</h3>
                {[
                  { name: 'Software Cell', desc: 'AI/ML, Web Apps, Cloud Telemetry', icon: Cpu, color: 'text-indigo-500 bg-indigo-500/10' },
                  { name: 'IoT & PCB Design', desc: 'CNC Etching, Embedded Systems, LoRa', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
                  { name: '3D Printing & Prototyping', desc: 'FDM & SLA Resin Printing', icon: Printer, color: 'text-sky-500 bg-sky-500/10' },
                  { name: 'Robotics & Automation', desc: '6-Axis Industrial Robotic Arm', icon: Bot, color: 'text-emerald-500 bg-emerald-500/10' },
                  { name: 'Machining & Fabrication', desc: 'CO2 Laser Cutting & Heavy Tools', icon: Wrench, color: 'text-rose-500 bg-rose-500/10' },
                ].map((sec, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                    isDark ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                  }`}>
                    <div className={`p-2.5 rounded-xl ${sec.color}`}>
                      <sec.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold">{sec.name}</h4>
                      <p className="text-[11px] opacity-70">{sec.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-sky-500 uppercase tracking-wider">
                  Student Projects ({liveProjects.length > 0 ? liveProjects.length : 50}+ Built)
                </h3>
                {(liveProjects.length > 0 ? liveProjects : [
                  { title: 'Autonomous AI Inspection Rover', leader_name: 'Darshan', tech_stack: ['Robotics', 'ROS2'], status: 'completed' },
                  { title: 'Smart IoT Agriculture Telemetry', leader_name: 'Neha Verma', tech_stack: ['IoT', 'LoRa'], status: 'running' },
                  { title: '6-DOF Haptic Glove Controller', leader_name: 'Vikram Singh', tech_stack: ['Robotics'], status: 'completed' },
                ]).map((proj, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                        {Array.isArray(proj.tech_stack) ? proj.tech_stack[0] || 'Innovation' : proj.tag || 'Innovation'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold capitalize">{proj.status || 'Running'}</span>
                    </div>
                    <h4 className="text-xs font-bold">{proj.title}</h4>
                    <p className="text-[11px] opacity-70 mt-1">Lead: {proj.leader_name || proj.lead || 'Darshan'}</p>
                    {proj.pdf_url && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-red-400">📄 PDF Technical Report</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-sky-500 uppercase tracking-wider">Photo & Video Showcase</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: 'IDEA LAB Inauguration', img: '' },
                    { name: '48-Hr Prototyping Hackathon', img: '' },
                    { name: 'Robotic Arm Live Demo', img: '' },
                    { name: 'Laser Cutting Session', img: '' },
                  ].map((g, idx) => (
                    <div key={idx} className="relative h-28 rounded-xl overflow-hidden shadow-sm bg-slate-900 flex items-center justify-center">
                      {g.img ? (
                        <img src={g.img} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-950 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-sky-500/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-end p-2">
                        <p className="text-[10px] font-bold text-white line-clamp-2">{g.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 mx-auto shadow-md">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                    <User className="w-8 h-8 text-sky-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Darshan</h3>
                  <p className="text-xs text-sky-500 font-semibold">Chief Student Innovator</p>
                  <p className="text-[11px] opacity-60">TGPCET Student Portal</p>
                </div>
                <div className={`p-3 rounded-2xl border text-left text-xs space-y-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">Active Proposals</span>
                    <span className="font-bold text-sky-500">2 Approved</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">3D Printer Slot</span>
                    <span className="font-bold text-emerald-500">Reserved (2 PM)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Bar (Material 3 Bottom Nav) */}
          <div className={`px-2 py-2 flex items-center justify-around border-t z-30 transition-colors ${
            isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
          }`}>
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'sections', label: 'Sections', icon: Layers },
              { id: 'projects', label: 'Projects', icon: Sparkles },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition"
                >
                  <div className={`p-1.5 rounded-full transition ${
                    isActive 
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/50 scale-110' 
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold transition ${
                    isActive ? 'text-sky-500 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Android Home Navigation Pill Bar */}
          <div className={`h-4 flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            <div className={`w-32 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
          </div>

        </div>
      </div>
    </div>
  );
}
