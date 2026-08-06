'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-12 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest">
          GET IN TOUCH
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact IDEA LAB Support
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Have questions regarding machine reservation, project guidance, or industrial visits?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CONTACT INFO CARD */}
        <div className="glass-card p-8 rounded-4xl border border-sky-500/20 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Official Communication Channels
            </h2>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <Mail className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Email Support</h4>
                  <p className="text-slate-600 dark:text-slate-300">idealab@tgpcet.ac.in</p>
                  <p className="text-slate-600 dark:text-slate-300">support.idealab@tgpcet.ac.in</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <Phone className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Phone Support</h4>
                  <p className="text-slate-600 dark:text-slate-300">+91 712 2810001 / +91 9876543210</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Lab Address</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    AICTE IDEA LAB, TGPCET Campus, Mohgaon, Wardha Road, Nagpur, Maharashtra - 441108
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL HANDLES */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Social Media Handles
            </h4>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>@idealab_tgpcet</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition"
              >
                <Linkedin className="w-4 h-4 text-sky-500" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

        </div>

        {/* INQUIRY FORM */}
        <div className="glass-card p-8 rounded-4xl border border-sky-500/20 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Send an Inquiry Message
          </h2>

          {submitted ? (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <h3 className="font-bold text-base">Message Sent Successfully!</h3>
              <p className="text-xs">Dr. Neeraj Waijode & IDEA LAB team will respond to your email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Patil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="aarav@tgpcet.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9800000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Message / Inquiry Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Inquire about CNC milling machine availability..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/20 transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
