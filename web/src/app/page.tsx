'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThreeCanvasBanner } from '@/components/ThreeCanvasBanner';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import { GalleryItem, Project } from '@/types';
import UpdatesCarousel from '@/components/UpdatesCarousel';
import { UpdateItem } from '@/app/api/updates/route';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Printer,
  Bot,
  Wrench,
  Monitor,
  CheckCircle2,
  Award,
  BookOpen,
  Building2,
  Users,
  ChevronRight,
  Send,
  Zap,
  LogIn,
  UserPlus,
} from 'lucide-react';

const MAJOR_PROJECTS_PREVIEW = [
  {
    id: 'p1',
    title: 'Autonomous AI Inspection Rover',
    leader: 'Darshan (Chief Student Innovator)',
    category: 'Robotics & AI',
    image: '',
    desc: '6-wheel rocker-bogie rover built with ROS2 and custom CNC-etched PCB motor drivers for hazardous inspection.',
  },
  {
    id: 'p2',
    title: 'Smart IoT Agriculture System',
    leader: 'Neha Verma',
    category: 'IoT & Embedded',
    image: '',
    desc: 'LoRaWAN precision farming soil moisture telemetry with cloud dashboard telemetry.',
  },
  {
    id: 'p3',
    title: '6-DOF Robotic Arm Haptic Glove',
    leader: 'Vikram Singh',
    category: 'Automation',
    image: '',
    desc: 'Tele-operated strain-gauge haptic controller operating 6-axis industrial robotic arm.',
  },
];

const CAROUSEL_IMAGES = [
  { url: '', caption: 'High Precision 3D Printing Prototyping' },
  { url: '', caption: '6-Axis Industrial Robotic Arm Facility' },
  { url: '', caption: 'CNC PCB Etching & IoT Circuit Design' },
  { url: '', caption: 'CO2 Laser Cutting & Fabrication Studio' },
  { url: '', caption: 'Software Cell CAD/CAM Workstations' },
];

export default function HomePage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();
  const isSuperAdmin = isSuperAdmin1 || isSuperAdmin2;
  const [activeTab, setActiveTab] = useState<'vision' | 'mission'>('vision');
  const [projectCount, setProjectCount] = useState<number>(50);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/updates', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.updates)) {
        setUpdates(data.updates);
      }
    } catch (e) {
      console.error('Error fetching updates from API:', e);
    }
  }, []);

  const fetchLiveProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setLiveProjects(data.projects);
        setProjectCount(data.projects.length);
      }
    } catch (e) {
      console.error('Error fetching live project count for stats:', e);
    }
  }, []);

  const fetchLiveGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.gallery) && data.gallery.length > 0) {
        setGalleryItems(data.gallery);
      }
    } catch (e) {
      console.error('Error fetching gallery items for home page:', e);
    }
  }, []);

  // Hook up zero-delay realtime subscriptions for home page components
  useRealtimeSync('updates', fetchUpdates);
  useRealtimeSync('projects', fetchLiveProjects);
  useRealtimeSync('gallery', fetchLiveGallery);

  useEffect(() => {
    fetchLiveProjects();
    fetchLiveGallery();
    fetchUpdates();
  }, [fetchLiveProjects, fetchLiveGallery, fetchUpdates]);

  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO & 3D ANIMATED CANVAS */}
      <section className="relative">
        <ThreeCanvasBanner />
      </section>

      {/* ANNOUNCEMENT UPDATES SLIDER CAROUSEL */}
      <section>
        <UpdatesCarousel
          updates={updates}
          isSuperAdmin={isSuperAdmin}
          onRefresh={fetchUpdates}
        />
      </section>

      {/* QUICK LAB METRICS STATS WITH INTERACTIVE LINKS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Core Sections', value: '5 Technical Labs', icon: Cpu, color: 'text-sky-500', href: '/sections' },
          { label: 'Prototyping Equipment', value: '15+ Machines', icon: Printer, color: 'text-cyan-500', href: '/sections' },
          { label: 'Student Projects', value: `${projectCount > 0 ? projectCount : 50}+ Built`, icon: Award, color: 'text-amber-500', href: '/projects' },
          { label: 'Lab Incharge', value: 'Dr. Neeraj Waijode', icon: Users, color: 'text-indigo-500', href: '/about' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className="glass-card glass-card-hover p-5 rounded-3xl flex flex-col justify-between border border-sky-500/15 group cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-sky-500/40 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center justify-between">
                <span>{stat.value}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </p>
            </Link>
          );
        })}
      </section>

      {/* ABOUT IDEA LAB - VISION & MISSION */}
      <section className="glass-card p-8 rounded-4xl border border-sky-500/20 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 inline-flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AICTE IDEA LAB OVERVIEW</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Empowering Next-Gen Innovators & Prototypers
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            AICTE IDEA LAB at <strong>Tulsiramji Gaikwad Patil College of Engineering & Technology (TGPCET)</strong> is established to transform STEM education by providing hands-on facilities for ideation, rapid prototyping, and product design under expert guidance.
          </p>

          {/* TAB TOGGLE FOR VISION & MISSION */}
          <div className="pt-4">
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition ${
                  activeTab === 'vision'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition ${
                  activeTab === 'mission'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Our Mission
              </button>
            </div>

            <div className="mt-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-sky-500/10">
              {activeTab === 'vision' ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  "To establish IDEA LAB as a Centre of Excellence for innovation, design, research, and interdisciplinary learning that empowers students to transform ideas into impactful real-world solutions."
                </p>
              ) : (
                <ul className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                    <span>To encourage creativity, innovation, and hands-on learning.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                    <span>To provide opportunities for research, prototyping, and entrepreneurship.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                    <span>To collaborate with industry and academia for skill development and innovation.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                    <span>To develop responsible, skilled, and future-ready professionals.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLLING GALLERY CAROUSEL */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Life Inside IDEA LAB
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State-of-the-art facilities & active student prototyping sessions
            </p>
          </div>
          <Link
            href="/gallery"
            className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>View Full Gallery</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scroll-smooth">
          {galleryItems.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href="/gallery"
              className="w-80 md:w-96 shrink-0 rounded-3xl overflow-hidden glass-card glass-card-hover border border-sky-500/20 group relative block cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={item.image_url || item.thumbnail_url || item.media_url}
                  alt={item.title || item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {item.media_type === 'video' && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center space-x-1 shadow-md">
                    <span>🎬 VIDEO</span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-sky-500 transition-colors">
                  {item.title}
                </p>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {item.caption}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MAJOR PROJECTS HIGHLIGHT */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold uppercase text-sky-500 tracking-wider">PROTOTYPES</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Featured Major Projects
            </h3>
          </div>
          <Link
            href="/projects"
            className="px-4 py-2 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition"
          >
            Explore All Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {liveProjects.slice(0, 3).map((proj) => (
            <Link
              key={proj.id}
              href={`/projects?id=${proj.id}`}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-sky-500/20 group cursor-pointer block"
            >
              <div className="h-48 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                {proj.cover_image || proj.project_images?.[0] ? (
                  <img
                    src={proj.cover_image || proj.project_images?.[0]}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-950 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-sky-500/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {proj.tech_stack?.[0] || (proj.project_type === 'team' ? 'Team Project' : 'Student Innovation')}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors line-clamp-1">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-sky-600 dark:text-cyan-400 font-medium mt-0.5">
                    Lead: {proj.leader_name} {proj.leader_branch ? `(${proj.leader_branch})` : ''}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {proj.description || proj.full_detail}
                  </p>
                </div>
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-sky-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>View Builder & Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT COLLEGE & ABOUT AICTE GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ABOUT COLLEGE */}
        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3">
          <div className="flex items-center space-x-3 text-sky-600 dark:text-cyan-400">
            <Building2 className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              About TGPCET College
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Tulsiramji Gaikwad Patil College of Engineering & Technology (TGPCET)</strong>, Nagpur, is an autonomous institute accredited by NAAC with Grade A+. It offers premier engineering, management, and computer science programs focused on practical skill innovation.
          </p>
          <div className="pt-2">
            <a
              href="https://tgpcet.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Visit Official TGPCET Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ABOUT AICTE */}
        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              About AICTE IDEA LAB Scheme
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All India Council for Technical Education (AICTE) introduced IDEA LAB (Idea Development, Evaluation & Application Lab) to encourage students to apply Science, Technology, Engineering & Mathematics (STEM) fundamentals towards hands-on prototyping.
          </p>
          <div className="pt-2">
            <a
              href="https://www.aicte-india.org"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Learn More About AICTE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </section>

      {/* GUEST LOGIN & REGISTER ACTION CARD */}
      {!user && (
        <section className="glass-card p-8 rounded-4xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950 uppercase tracking-widest inline-block">
              GET STARTED WITH IDEA LAB
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Not Logged In? Join the Student Innovation Chapter!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Sign in to your TGPCET student account or register a new account to submit project applications, reserve 3D printers, and track proposal approvals.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-500/20 transition flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-full text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-2 border border-sky-500/20"
            >
              <UserPlus className="w-4 h-4 text-sky-500" />
              <span>Register</span>
            </Link>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      {!isSuperAdmin && (
        <section className="rounded-4xl p-8 bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-700 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold">Have a Revolutionary Prototype Idea?</h3>
            <p className="text-xs md:text-sm text-sky-100">
              Apply to access 3D Printers, CNC PCB etching, 6-Axis Robotic Arm, and mentorship from Dr. Neeraj Waijode.
            </p>
          </div>
          <Link
            href="/apply"
            className="px-6 py-3 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-105 transition shrink-0 flex items-center space-x-2"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>Submit Project Proposal</span>
          </Link>
        </section>
      )}

    </div>
  );
}
