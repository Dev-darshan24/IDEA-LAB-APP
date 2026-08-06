'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, Shield, BookOpen, Layers, Award, Sparkles, ChevronRight } from 'lucide-react';

const FACULTY_LIST = [
  { name: 'Dr. Neeraj Waijode', role: 'Incharge, AICTE IDEA LAB', dept: 'Mechanical Engineering' },
  { name: 'Prof. A. K. Sharma', role: 'Section Head', dept: 'Software Cell' },
  { name: 'Dr. R. V. Deshmukh', role: 'Section Head', dept: 'IoT & PCB Design' },
  { name: 'Prof. S. N. Kulkarni', role: 'Section Head', dept: '3D Printing & Prototyping' },
  { name: 'Prof. M. B. Patil', role: 'Section Head', dept: 'Robotics & Automation' },
  { name: 'Prof. V. P. Joshi', role: 'Section Head', dept: 'Machining & Fabrication' },
];

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest">
          ORGANIZATION & LEADERSHIP
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About AICTE IDEA LAB
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
          Tulsiramji Gaikwad Patil College of Engineering & Technology (TGPCET), Nagpur
        </p>
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

      {/* INCHARGE PROFILE - DR. NEERAJ WAIJODE */}
      <div className="glass-card p-8 rounded-4xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-indigo-500/10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-sky-500/40 shadow-xl shrink-0">
          <img
            src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80"
            alt="Dr. Neeraj Waijode"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-600 text-white tracking-widest">
            LAB INCHARGE & SUPERADMIN
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Dr. Neeraj Waijode
          </h2>
          <p className="text-xs font-bold text-sky-600 dark:text-cyan-400">
            Head & Coordinator, AICTE IDEA LAB • TGPCET
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            "Our mission is to bridge the gap between academic theory and physical hardware prototyping. We welcome all students to leverage our 3D printers, CNC PCB machines, laser cutters, and 6-axis robotic arms."
          </p>
        </div>
      </div>

      {/* FACULTIES GRID */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          IDEA LAB Faculty Committee & Section Heads
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FACULTY_LIST.map((fac, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-2xl border border-sky-500/15 flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{fac.name}</h4>
                <p className="text-[11px] font-medium text-sky-600 dark:text-cyan-400">{fac.role}</p>
                <p className="text-[10px] text-slate-500">{fac.dept}</p>
              </div>
            </div>
          ))}
        </div>
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

    </div>
  );
}
