'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThreeCanvasBanner } from '@/components/ThreeCanvasBanner';
import { useAuth } from '@/context/AuthContext';
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
    image: 'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=800&q=80',
    desc: '6-wheel rocker-bogie rover built with ROS2 and custom CNC-etched PCB motor drivers for hazardous inspection.',
  },
  {
    id: 'p2',
    title: 'Smart IoT Agriculture System',
    leader: 'Neha Verma',
    category: 'IoT & Embedded',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    desc: 'LoRaWAN precision farming soil moisture telemetry with cloud dashboard telemetry.',
  },
  {
    id: 'p3',
    title: '6-DOF Robotic Arm Haptic Glove',
    leader: 'Vikram Singh',
    category: 'Automation',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    desc: 'Tele-operated strain-gauge haptic controller operating 6-axis industrial robotic arm.',
  },
];

const CAROUSEL_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80', caption: 'High Precision 3D Printing Prototyping' },
  { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80', caption: '6-Axis Industrial Robotic Arm Facility' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', caption: 'CNC PCB Etching & IoT Circuit Design' },
  { url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80', caption: 'CO2 Laser Cutting & Fabrication Studio' },
  { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80', caption: 'Software Cell CAD/CAM Workstations' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'vision' | 'mission'>('vision');

  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO & 3D ANIMATED CANVAS */}
      <section className="relative">
        <ThreeCanvasBanner />
      </section>

      {/* ANNOUNCEMENT UPDATES MARQUEE */}
      <section className="glass-card p-4 rounded-2xl border border-sky-500/20 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10">
        <div className="flex items-center space-x-2 px-3 py-1 bg-sky-600 text-white rounded-full text-xs font-bold shrink-0 shadow-md">
          <Zap className="w-3.5 h-3.5 animate-bounce" />
          <span>UPDATES</span>
        </div>
        <div className="overflow-hidden w-full">
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap animate-pulse">
            🔥 Summer Prototyping Boot Camp 2026 Registration Open! | 🤖 6-Axis Robotic Arm Masterclass with Dr. Neeraj Waijode on August 15 | 🏆 Chief Student Innovator Darshan wins AICTE National Award!
          </p>
        </div>
      </section>

      {/* QUICK LAB METRICS STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Core Sections', value: '5 Technical Labs', icon: Cpu, color: 'text-sky-500' },
          { label: 'Prototyping Equipment', value: '15+ Machines', icon: Printer, color: 'text-cyan-500' },
          { label: 'Student Projects', value: '50+ Built', icon: Award, color: 'text-amber-500' },
          { label: 'Lab Incharge', value: 'Dr. Neeraj Waijode', icon: Users, color: 'text-indigo-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="glass-card glass-card-hover p-5 rounded-3xl flex flex-col justify-between border border-sky-500/15"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stat.value}
              </p>
            </div>
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
          {CAROUSEL_IMAGES.map((item, idx) => (
            <div
              key={idx}
              className="w-80 md:w-96 shrink-0 rounded-3xl overflow-hidden glass-card glass-card-hover border border-sky-500/20 group relative"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {item.caption}
                </p>
              </div>
            </div>
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
          {MAJOR_PROJECTS_PREVIEW.map((proj) => (
            <div
              key={proj.id}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-sky-500/20"
            >
              <div className="h-44 relative">
                <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  {proj.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{proj.title}</h4>
                  <p className="text-xs text-sky-600 dark:text-cyan-400 font-medium mt-0.5">
                    Lead: {proj.leader}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {proj.desc}
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline pt-2"
                >
                  <span>View Builder & Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
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
              href="https://tgpcet.ac.in"
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

    </div>
  );
}
