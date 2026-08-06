'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { Search, Calendar, User, X, Sparkles, Code, Cpu, ExternalLink } from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Autonomous AI Inspection Rover',
    description: '6-wheel rocker-bogie rover built with 6-Axis Robotic arm concepts and PCB design for industrial structural inspection.',
    full_detail: 'Developed at the AICTE IDEA LAB TGPCET, this autonomous rover utilizes ROS2, OpenCV, custom PCB motor controllers, and 3D printed structural mounts. Designed for hazardous pipe inspection and industrial monitoring under Chief Student Innovator guidance.',
    leader_name: 'Darshan (Chief Student Innovator)',
    leader_email: 'darshan@tgpcet.ac.in',
    team_members: [
      { name: 'Darshan', role: 'Project Lead & AI Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
      { name: 'Aarav Mehta', role: 'PCB & Hardware Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Priya Sharma', role: 'CAD & 3D Print Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    ],
    cover_image: 'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=1200&q=80',
    tech_stack: ['ROS2', 'Python', 'Fusion 360', 'CNC PCB Machine', '3D Printing', 'OpenCV'],
    created_at: '2026-07-15',
  },
  {
    id: 'p2',
    title: 'Smart IoT Agriculture Telemetry System',
    description: 'Precision farming device fabricated with CNC PCB etching and wireless LoRa communication.',
    full_detail: 'Integrated soil moisture, thermal imaging, and automated fertigation system created in the IoT & PCB Cell. Features real-time cloud data visualization and smartphone telemetry app.',
    leader_name: 'Neha Verma',
    leader_email: 'neha.v@tgpcet.ac.in',
    team_members: [
      { name: 'Neha Verma', role: 'IoT Firmware Lead', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
      { name: 'Rohan Gupta', role: 'Embedded Hardware Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    ],
    cover_image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    tech_stack: ['ESP32', 'LoRaWAN', 'AutoCAD PCB', 'Supabase', 'Flutter'],
    created_at: '2026-06-20',
  },
  {
    id: 'p3',
    title: '6-DOF Robotic Arm Haptic Controller',
    description: 'Custom tele-operated haptic feedback glove controlling the 6-Axis Industrial Robotic Arm.',
    full_detail: 'Allows intuitive manual remote manipulation of hazardous materials. Features custom 3D printed mechanical joints and strain-gauge force feedback sensors.',
    leader_name: 'Vikram Singh',
    leader_email: 'vikram.s@tgpcet.ac.in',
    team_members: [
      { name: 'Vikram Singh', role: 'Robotics Lead', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
      { name: 'Tanvi Rao', role: 'Mechatronics Engineer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
    ],
    cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    tech_stack: ['6-Axis Arm', 'STM32', 'Fusion 360', 'Kinematics Solver'],
    created_at: '2026-05-10',
  },
  {
    id: 'p4',
    title: 'CO2 Laser Cut Precision Quadcopter Frame',
    description: 'Ultra-light carbon fiber hybrid drone frame fabricated using Laser Cutting Machine.',
    full_detail: 'Engineered for aerodynamic efficiency and structural rigidity. Custom flight controller stack mounted on CNC etched anti-vibration PCB plate.',
    leader_name: 'Amit Deshmukh',
    leader_email: 'amit.d@tgpcet.ac.in',
    team_members: [
      { name: 'Amit Deshmukh', role: 'Drone Pilot & Engineer', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
    ],
    cover_image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    tech_stack: ['Laser Cutter', 'Carbon Fiber', 'Betaflight', 'CAD'],
    created_at: '2026-04-18',
  },
];

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderFilter, setLeaderFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects by Title, Leader Name, or Date
  const filteredProjects = projects.filter((p) => {
    const matchesTitle = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeader = leaderFilter
      ? p.leader_name.toLowerCase().includes(leaderFilter.toLowerCase())
      : true;
    return matchesTitle && matchesLeader;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* PAGE HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest">
          STUDENT INNOVATIONS
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          IDEA LAB Projects Gallery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Tap on any project card to inspect student builders, full technical specifications, and photos.
        </p>
      </div>

      {/* FILTER BAR (Search Title, Leader Name) */}
      <div className="glass-card p-4 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-center gap-4">
        
        {/* TITLE SEARCH */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Filter by Project Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* LEADER FILTER */}
        <div className="relative flex-1 w-full">
          <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Filter by Leader Name..."
            value={leaderFilter}
            onChange={(e) => setLeaderFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

      </div>

      {/* PROJECT GRID - INITIALLY VISIBLE WITH ONLY COVER IMAGE AND TITLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => setSelectedProject(proj)}
            className="glass-card glass-card-hover rounded-3xl overflow-hidden cursor-pointer border border-sky-500/20 group relative shadow-md"
          >
            {/* COVER IMAGE */}
            <div className="h-64 relative overflow-hidden">
              <img
                src={proj.cover_image}
                alt={proj.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* OVERLAY TITLE & TAP BADGE */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-sky-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30 inline-block mb-2">
                  Tap to Expand Details
                </span>
                <h3 className="text-lg font-bold leading-snug group-hover:text-cyan-300 transition-colors">
                  {proj.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-4xl border border-sky-500/30 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* MODAL HEADER WITH IMAGE */}
            <div className="relative h-56 md:h-64 shrink-0">
              <img
                src={selectedProject.cover_image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Created on {selectedProject.created_at}
                </span>
                <h2 className="text-2xl font-extrabold mt-1">{selectedProject.title}</h2>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* DESCRIPTION & FULL DETAIL */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-sky-600 dark:text-cyan-400 tracking-wider">
                  Project Description & Overview
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedProject.full_detail}
                </p>
              </div>

              {/* TECH STACK */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center space-x-1">
                  <Code className="w-4 h-4 text-sky-500" />
                  <span>Technologies & Machines Used</span>
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

              {/* STUDENT BUILDERS TEAM DETAILS */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Student Builders & Contributors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.team_members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10"
                    >
                      <img
                        src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[11px] text-sky-600 dark:text-cyan-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Project Leader: <strong className="text-slate-800 dark:text-slate-200">{selectedProject.leader_name}</strong>
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-full font-bold bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
