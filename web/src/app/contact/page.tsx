'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ContactDetails } from '@/types';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Send,
  CheckCircle2,
  ShieldCheck,
  Edit,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const INITIAL_CONTACT = {
  email_primary: 'idealab@tgpcet.com',
  email_secondary: 'support.idealab@tgpcet.com',
  phone_primary: '+91 712 2810001',
  phone_secondary: '+91 9876543210',
  address: 'AICTE IDEA LAB, TGPCET Campus, Mohgaon, Wardha Road, Nagpur, Maharashtra - 441108',
  instagram_handle: '@idealab_tgpcet',
  instagram_url: 'https://instagram.com',
  linkedin_handle: 'LinkedIn',
  linkedin_url: 'https://linkedin.com',
};

export default function ContactPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();

  // SuperAdmin privilege check: Both SuperAdmin 1 (Incharge) and SuperAdmin 2 (Developer) can edit contact details
  const currentRole = user?.role?.toLowerCase();
  const canManageContact = 
    isSuperAdmin1 || 
    isSuperAdmin2 || 
    currentRole === 'superadmin_1' || 
    currentRole === 'superadmin_2' || 
    currentRole === 'admin_incharge' || 
    currentRole === 'admin_developer';

  const [contact, setContact] = useState<ContactDetails>(INITIAL_CONTACT);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User Inquiry Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // SuperAdmin Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailPrimary, setEmailPrimary] = useState('');
  const [emailSecondary, setEmailSecondary] = useState('');
  const [phonePrimary, setPhonePrimary] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [address, setAddress] = useState('');
  const [instaHandle, setInstaHandle] = useState('');
  const [instaUrl, setInstaUrl] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Fetch Live Contact Details from API
  const fetchContactDetails = async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.contact) {
        setContact(data.contact);
        localStorage.setItem('idea_lab_contact', JSON.stringify(data.contact));
      }
    } catch (e) {
      console.error('Error fetching contact details:', e);
      const stored = localStorage.getItem('idea_lab_contact');
      if (stored) {
        try { setContact(JSON.parse(stored)); } catch (err) {}
      }
    } finally {
      setLoading(false);
      if (showIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContactDetails();
    const interval = setInterval(() => {
      fetchContactDetails();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Open Edit Modal
  const handleOpenEditModal = () => {
    setEmailPrimary(contact.email_primary);
    setEmailSecondary(contact.email_secondary || '');
    setPhonePrimary(contact.phone_primary);
    setPhoneSecondary(contact.phone_secondary || '');
    setAddress(contact.address);
    setInstaHandle(contact.instagram_handle || '@idealab_tgpcet');
    setInstaUrl(contact.instagram_url || 'https://instagram.com');
    setLinkedinHandle(contact.linkedin_handle || 'LinkedIn');
    setLinkedinUrl(contact.linkedin_url || 'https://linkedin.com');
    setIsModalOpen(true);
  };

  // Save Contact Details
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailPrimary.trim() || !phonePrimary.trim() || !address.trim()) {
      showError('Primary Email, Primary Phone, and Address are required.');
      return;
    }

    setIsSubmitting(true);
    const payload: ContactDetails = {
      email_primary: emailPrimary.trim(),
      email_secondary: emailSecondary.trim(),
      phone_primary: phonePrimary.trim(),
      phone_secondary: phoneSecondary.trim(),
      address: address.trim(),
      instagram_handle: instaHandle.trim(),
      instagram_url: instaUrl.trim(),
      linkedin_handle: linkedinHandle.trim(),
      linkedin_url: linkedinUrl.trim(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.contact) {
        setContact(data.contact);
      }

      setIsModalOpen(false);
      setSuccessMsg('Official Contact Details updated globally!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showError('Failed to save contact details to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormSubject('');
      setFormMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-12 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center space-x-1 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GET IN TOUCH</span>
          </span>
          <button
            onClick={() => fetchContactDetails(true)}
            title="Refresh Live Contact Info"
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact IDEA LAB Support
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Have questions regarding machine reservation, project guidance, or industrial visits?
        </p>

        {/* Toast Alert */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" /> {successMsg}
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${canManageContact ? 'max-w-3xl mx-auto' : 'md:grid-cols-2'} gap-8`}>
        
        {/* CONTACT INFO CARD */}
        <div className="glass-card p-8 rounded-4xl border border-sky-500/20 space-y-6 flex flex-col justify-between relative group">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Official Communication Channels
              </h2>

              {/* SUPERADMIN EDIT BUTTON */}
              {canManageContact && (
                <button
                  onClick={handleOpenEditModal}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md"
                  title="Edit Contact Details (Superadmin)"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Info
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              {/* EMAIL SUPPORT */}
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <Mail className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Email Support</h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{contact.email_primary}</p>
                  {contact.email_secondary && (
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{contact.email_secondary}</p>
                  )}
                </div>
              </div>

              {/* PHONE SUPPORT */}
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <Phone className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Phone Support</h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {contact.phone_primary} {contact.phone_secondary ? `/ ${contact.phone_secondary}` : ''}
                  </p>
                </div>
              </div>

              {/* LAB ADDRESS */}
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-sky-500/10">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Lab Address</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {contact.address}
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
            <div className="flex flex-wrap gap-3">
              {contact.instagram_url && (
                <a
                  href={contact.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition border border-slate-700/30"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>{contact.instagram_handle || '@idealab_tgpcet'}</span>
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition border border-slate-700/30"
                >
                  <Linkedin className="w-4 h-4 text-sky-500" />
                  <span>{contact.linkedin_handle || 'LinkedIn'}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* INQUIRY FORM - VISIBLE ONLY TO NON-SUPERADMIN USERS & VISITORS */}
        {!canManageContact && (
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
              <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Patil"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@tgpcet.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9800000000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Inquire about CNC milling machine availability..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
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
        )}

      </div>

      {/* SUPERADMIN EDIT CONTACT DETAILS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit Official Contact Details</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              
              {/* PRIMARY & SECONDARY EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Primary Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="idealab@tgpcet.com"
                    value={emailPrimary}
                    onChange={(e) => setEmailPrimary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Secondary Email</label>
                  <input
                    type="email"
                    placeholder="support.idealab@tgpcet.com"
                    value={emailSecondary}
                    onChange={(e) => setEmailSecondary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* PRIMARY & SECONDARY PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 712 2810001"
                    value={phonePrimary}
                    onChange={(e) => setPhonePrimary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phoneSecondary}
                    onChange={(e) => setPhoneSecondary(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* LAB ADDRESS */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lab Address *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Full lab campus address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* INSTAGRAM HANDLE & LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    placeholder="@idealab_tgpcet"
                    value={instaHandle}
                    onChange={(e) => setInstaHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={instaUrl}
                    onChange={(e) => setInstaUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* LINKEDIN HANDLE & LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn Handle / Title</label>
                  <input
                    type="text"
                    placeholder="LinkedIn"
                    value={linkedinHandle}
                    onChange={(e) => setLinkedinHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" /> Save Contact Details
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
