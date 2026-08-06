'use client';

import React from 'react';
import { Sparkles, Linkedin, Award, Target, Users, Lightbulb } from 'lucide-react';

const CHAPTER_TEAM = [
  {
    name: 'Darshan',
    role: 'Chief Student Innovator',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    linkedin: 'https://linkedin.com/in/darshan-drt',
    bio: 'Pioneering student innovation, autonomous rover development, and leading student prototyping teams across IDEA LAB.',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Head of Software Innovation',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    linkedin: 'https://linkedin.com/in/ananya-d',
    bio: 'Overseeing CAD/CAM simulation, full-stack web applications, and AI model integration.',
  },
  {
    name: 'Aditya Kulkarni',
    role: 'Head of Hardware & Prototyping',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    linkedin: 'https://linkedin.com/in/aditya-k',
    bio: 'Specializing in 3D Printing, SLA Resin post-curing, and CNC heavy metal fabrication.',
  },
  {
    name: 'Saniya Khan',
    role: 'Event & Outreach Coordinator',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    linkedin: 'https://linkedin.com/in/saniya-k',
    bio: 'Managing hackathons, industrial training workshops, and inter-college student delegations.',
  },
];

export default function StudentInnovationChapterPage() {
  return (
    <div className="space-y-12 pb-12">
      
      {/* BANNER HEADER */}
      <div className="glass-card p-8 md:p-12 rounded-4xl border border-sky-500/20 text-center relative overflow-hidden bg-gradient-to-b from-sky-500/10 to-transparent">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center space-x-1 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NEW FORUM ESTABLISHED</span>
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Innovation Chapter
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-2">
          AICTE IDEA LAB • Tulsiramji Gaikwad Patil College of Engineering & Technology
        </p>
      </div>

      {/* VISION & MISSION CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3 bg-gradient-to-br from-sky-500/5 to-cyan-500/5">
          <div className="flex items-center space-x-3 text-sky-600 dark:text-cyan-400">
            <Target className="w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chapter Vision</h3>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            "To create a culture where every student is encouraged to innovate, collaborate, and effectively utilize the resources of IDEA LAB for personal, academic, institutional, and societal growth."
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-sky-500/20 space-y-3 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="w-6 h-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Core Objectives</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Drive hands-on student participation in interdisciplinary projects.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Organize national hackathons, 3D printing & robotics bootcamps.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Facilitate patent filing, startup incubation & industrial mentorship.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* TEAM MEMBERS GRID */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Chapter Leadership & Team
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Meet the student innovators leading the IDEA LAB chapter
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CHAPTER_TEAM.map((member, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-sky-500/20 flex flex-col items-center text-center space-y-3"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sky-500/50 shadow-md">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{member.name}</h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-cyan-400 mt-1">
                  {member.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {member.bio}
              </p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 hover:bg-sky-500 hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
