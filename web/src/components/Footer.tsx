'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Mail, Phone, Instagram, Linkedin, Globe, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-sky-500/10 bg-slate-950 text-slate-300 rounded-t-3xl overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* BRAND COLUMN */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 p-1.5 bg-white rounded-2xl border border-slate-800 shadow-md">
              <div className="h-8 px-1 flex items-center justify-center">
                <img src="/tgpcet_logo.png" alt="TGPCET Logo" className="h-full object-contain" />
              </div>
              <span className="text-slate-300 font-light text-xs">|</span>
              <div className="h-8 px-1 flex items-center justify-center">
                <img src="/idea_lab_logo.png" alt="IDEA LAB Logo" className="h-full object-contain" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">AICTE IDEA LAB</h3>
              <p className="text-xs text-sky-400">TGPCET Nagpur</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Centre of Excellence for Innovation, Prototyping, and Research. Empowering students to build future-ready technologies.
          </p>
          <div className="text-[11px] text-slate-500 space-y-1">
            <p><strong className="text-slate-300">Lab Incharge:</strong> Dr. Neeraj Waijode</p>
            <p><strong className="text-slate-300">Chief Student Innovator:</strong> Student Team</p>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-sky-400 transition">Home</Link></li>
            <li><Link href="/projects" className="hover:text-sky-400 transition">Major Projects</Link></li>
            <li><Link href="/gallery" className="hover:text-sky-400 transition">Photo Gallery</Link></li>
            <li><Link href="/chapter" className="hover:text-sky-400 transition">Student Innovation Chapter</Link></li>
            <li><Link href="/about" className="hover:text-sky-400 transition">5 Lab Sections & Facilities</Link></li>
            <li><Link href="/contact" className="hover:text-sky-400 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* LAB SECTIONS */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">5 Core Sections</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Software Cell</li>
            <li>IoT & PCB Design</li>
            <li>3D Printing & Prototyping</li>
            <li>Robotics & Automation</li>
            <li>Machining & Fabrication</li>
          </ul>
        </div>

        {/* CONTACT & CREDITS */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">Contact Info</h4>
          <div className="flex items-start space-x-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>TGPCET Campus, Mohgaon, Wardha Road, Nagpur, Maharashtra</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span>idealab@tgpcet.com</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Phone className="w-4 h-4 text-sky-400 shrink-0" />
            <span>+91 712 2810001</span>
          </div>

          <div className="flex space-x-3 pt-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white transition">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white transition">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://tgpcet.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white transition">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="border-t border-slate-900 bg-black/60 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 AICTE IDEA LAB - TGPCET. All Rights Reserved.</p>
        <div className="flex items-center space-x-4 mt-2 md:mt-0 font-medium">
          <span className="flex items-center space-x-1 text-sky-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured Platform</span>
          </span>
          <span>App Designer: <strong className="text-slate-300">DRT-VERSE (2026)</strong></span>
          <span>Developer: <strong className="text-cyan-400">Darshan</strong></span>
        </div>
      </div>
    </footer>
  );
};
