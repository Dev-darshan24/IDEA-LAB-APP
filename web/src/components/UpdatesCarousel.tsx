'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UpdateItem } from '@/app/api/updates/route';
import { useRealtimeSync } from '@/context/RealtimeContext';

interface UpdatesCarouselProps {
  updates: UpdateItem[];
  isSuperAdmin?: boolean;
  onRefresh?: () => void;
}

export default function UpdatesCarousel({
  updates = [],
  isSuperAdmin = false,
  onRefresh,
}: UpdatesCarouselProps) {
  const { triggerGlobalSync } = useRealtimeSync('updates', () => {
    if (onRefresh) onRefresh();
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Modal State for Superadmin Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UpdateItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formLinkMode, setFormLinkMode] = useState<'preset' | 'custom'>('preset');
  const [formBadgeColor, setFormBadgeColor] = useState('sky');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Active items filter
  const activeUpdates = updates.filter(u => u.is_active !== false);

  // Continuous Auto-play interval timer (Every 3 Seconds = 3000ms - NO PAUSE)
  useEffect(() => {
    if (activeUpdates.length <= 1 || isModalOpen) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeUpdates.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeUpdates.length, isModalOpen]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeUpdates.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeUpdates.length) % activeUpdates.length);
  };

  // Open Modal for Creating new item
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormTag('BOOTCAMP 2026');
    setFormDescription('');
    setFormImageUrl('');
    setFormLinkUrl('/apply');
    setFormLinkMode('preset');
    setFormBadgeColor('sky');
    setFormDisplayOrder(activeUpdates.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Modal for Editing item
  const openEditModal = (item: UpdateItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormTag(item.tag || 'UPDATES');
    setFormDescription(item.description || '');
    setFormImageUrl(item.image_url || '');
    const link = item.link_url || '/apply';
    setFormLinkUrl(link);
    const isPreset = ['/apply', '/projects', '/gallery', '/chapter', '/sections', '/contact'].includes(link);
    setFormLinkMode(isPreset ? 'preset' : 'custom');
    setFormBadgeColor(item.badge_color || 'sky');
    setFormDisplayOrder(item.display_order || 1);
    setFormIsActive(item.is_active !== false);
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'project_image');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImageUrl(data.url);
        setToastMessage({ type: 'success', text: 'Image uploaded successfully to Supabase Storage!' });
      } else {
        setToastMessage({ type: 'error', text: data.message || 'Failed to upload image.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: 'Error uploading image to server.' });
    } finally {
      setUploadingImage(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Save / Submit Update to Supabase
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setToastMessage({ type: 'error', text: 'Please enter a title for the update.' });
      return;
    }

    if (!formLinkUrl.trim()) {
      setToastMessage({ type: 'error', text: 'Link Destination URL is compulsory. Please select a preset or type a custom URL.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<UpdateItem> = {
        id: editingItem ? editingItem.id : undefined,
        title: formTitle.trim(),
        tag: formTag.trim() || 'UPDATES',
        description: formDescription.trim(),
        image_url: formImageUrl.trim() || '',
        link_url: formLinkUrl.trim(),
        badge_color: formBadgeColor,
        display_order: Number(formDisplayOrder),
        is_active: formIsActive,
      };

      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage({
          type: 'success',
          text: editingItem ? 'Update saved permanently in Supabase database!' : 'New update added to Supabase!',
        });
        setIsModalOpen(false);
        triggerGlobalSync('updates');
        if (onRefresh) onRefresh();
      } else {
        setToastMessage({ type: 'error', text: data.message || 'Failed to save update.' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: 'Error connecting to Supabase database API.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Delete Update from Supabase
  const handleDeleteUpdate = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/updates?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({ type: 'success', text: 'Update deleted successfully!' });
        setDeleteConfirmId(null);
        setCurrentIndex(0);
        triggerGlobalSync('updates');
        if (onRefresh) onRefresh();
      } else {
        setToastMessage({ type: 'error', text: data.message || 'Failed to delete update.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Error deleting update from database.' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (activeUpdates.length === 0) {
    if (!isSuperAdmin) return null;
    return (
      <div className="relative w-full glass-card p-6 md:p-8 rounded-3xl border border-sky-500/30 bg-slate-950/80 text-center space-y-4 shadow-xl">
        <Sparkles className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-white">No Homepage Update Slides Active</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          As a Superadmin, you can publish new image updates to display on the homepage carousel.
        </p>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Update Slide</span>
        </button>
      </div>
    );
  }

  const currentUpdate = activeUpdates[currentIndex] || activeUpdates[0];

  // Helper color map for badges
  const badgeColors: Record<string, string> = {
    sky: 'bg-sky-500/30 text-sky-300 border-sky-400/50 shadow-sky-500/20',
    amber: 'bg-amber-500/30 text-amber-300 border-amber-400/50 shadow-amber-500/20',
    emerald: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50 shadow-emerald-500/20',
    purple: 'bg-purple-500/30 text-purple-300 border-purple-400/50 shadow-purple-500/20',
    rose: 'bg-rose-500/30 text-rose-300 border-rose-400/50 shadow-rose-500/20',
  };

  return (
    <div className="relative w-full">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-slate-900/95 border border-sky-500/40 text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* CAROUSEL CONTAINER */}
      <div className="relative group glass-card rounded-3xl border border-sky-500/30 overflow-hidden shadow-2xl bg-slate-950 backdrop-blur-xl min-h-[360px] md:min-h-[400px] flex flex-col justify-between">
        
        {/* BACKGROUND IMAGE & OVERLAY (EXTENDS FULL CONTAINER HEIGHT EDGE-TO-EDGE) */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentUpdate.id + currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 120 : -120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -120 : 120 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* FULL AREA BACKGROUND IMAGE */}
            {currentUpdate.image_url ? (
              <img
                src={currentUpdate.image_url}
                alt={currentUpdate.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-950 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-sky-500/30" />
              </div>
            )}

            {/* LIGHTENED OVERLAY FOR MAXIMUM IMAGE CLARITY & READABILITY */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* HEADER BAR OVERLAY FOR SUPERADMIN OR BRAND */}
        <div className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full text-[11px] font-extrabold shadow-md shadow-sky-500/25 tracking-wide">
              <Zap className="w-3 h-3 animate-bounce" />
              <span>UPDATES</span>
            </span>
            <span className="text-[11px] font-medium text-slate-300 hidden sm:inline-block">
              TGPCET AICTE IDEA LAB Announcements
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* SUPERADMIN QUICK ADD BUTTON */}
            {isSuperAdmin && (
              <button
                onClick={openCreateModal}
                className="flex items-center space-x-1 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[11px] font-bold rounded-full transition-all shadow-md hover:shadow-emerald-500/30"
              >
                <Plus className="w-3 h-3" />
                <span>Add Update</span>
              </button>
            )}
          </div>
        </div>

        {/* OVERLAY CONTENT AREA (BOTTOM LEFT TITLE, BOTTOM RIGHT BUTTON) */}
        <div className="relative z-10 w-full p-6 md:p-8 pt-8 pb-8 flex-1 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          
          {/* BOTTOM LEFT: TAG, TITLE & DESCRIPTION */}
          <div className="space-y-2.5 max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-md ${
                  badgeColors[currentUpdate.badge_color] || badgeColors.sky
                }`}
              >
                {currentUpdate.tag || 'UPDATE'}
              </span>

              {isSuperAdmin && (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openEditModal(currentUpdate)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold backdrop-blur-md transition-all"
                    title="Edit Update (Superadmin)"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(currentUpdate.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold backdrop-blur-md transition-all"
                    title="Delete Update (Superadmin)"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight leading-tight text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {currentUpdate.title}
            </h3>
          </div>

          {/* BOTTOM RIGHT: EXPLORE & REGISTER BUTTON */}
          <div className="flex items-center space-x-3 shrink-0 self-start md:self-end">
            {currentUpdate.link_url && (
              <Link
                href={currentUpdate.link_url}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Explore & Register</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <span className="text-[11px] font-semibold text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-md">
              {currentIndex + 1} / {activeUpdates.length}
            </span>
          </div>
        </div>

        {/* NAVIGATION ARROWS & INDICATORS BAR OVERLAY */}
        <div className="relative z-20 flex items-center justify-between px-4 py-1.5 bg-slate-950/40 backdrop-blur-md border-t border-white/10">
          {/* LEFT ARROW */}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full bg-white/10 hover:bg-sky-500/30 text-slate-200 hover:text-white border border-white/10 hover:border-sky-500/50 transition-all hover:scale-110 active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* DOT INDICATORS */}
          <div className="flex items-center space-x-1.5">
            {activeUpdates.map((item, idx) => (
              <button
                key={item.id + idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-gradient-to-r from-sky-400 to-cyan-400 shadow-md shadow-sky-500/50'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={handleNext}
            className="p-1.5 rounded-full bg-white/10 hover:bg-sky-500/30 text-slate-200 hover:text-white border border-white/10 hover:border-sky-500/50 transition-all hover:scale-110 active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUPERADMIN ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl glass-card rounded-3xl border border-sky-500/40 bg-slate-900 shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit Update Slide' : 'Add New Update Slide'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title / Announcement Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Summer Prototyping Boot Camp 2026 Registration Open!"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              {/* Tag & Badge Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="e.g. BOOTCAMP 2026"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Color</label>
                  <select
                    value={formBadgeColor}
                    onChange={(e) => setFormBadgeColor(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                  >
                    <option value="sky">Sky Blue</option>
                    <option value="amber">Amber Gold</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="purple">Purple Indigo</option>
                    <option value="rose">Rose Red</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide detailed information about this update or workshop..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Update Slide Image (Supabase Storage or URL)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Image URL or upload below..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                  <label className="cursor-pointer px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {formImageUrl && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-700 mt-2 bg-slate-950">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Target Link & Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Link Destination / URL *
                  </label>
                  <select
                    value={
                      formLinkMode === 'custom'
                        ? 'custom'
                        : ['/apply', '/projects', '/gallery', '/chapter', '/sections', '/contact'].includes(formLinkUrl)
                        ? formLinkUrl
                        : 'custom'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setFormLinkMode('custom');
                        setFormLinkUrl(''); // Automatically clear input area when custom URL is chosen
                      } else {
                        setFormLinkMode('preset');
                        setFormLinkUrl(val);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                  >
                    <option value="/apply">📝 Apply Form & Opportunities (/apply)</option>
                    <option value="/projects">🚀 Student Projects Feed (/projects)</option>
                    <option value="/gallery">🖼️ Media & Photo Gallery (/gallery)</option>
                    <option value="/chapter">💡 Innovation Student Chapter (/chapter)</option>
                    <option value="/sections">⚙️ 5 Technical Lab Sections (/sections)</option>
                    <option value="/contact">📞 Contact IDEA LAB (/contact)</option>
                    <option value="custom">🔗 Custom Link / External URL...</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={formLinkUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormLinkUrl(val);
                      const isPreset = ['/apply', '/projects', '/gallery', '/chapter', '/sections', '/contact'].includes(val);
                      setFormLinkMode(isPreset ? 'preset' : 'custom');
                    }}
                    placeholder={
                      formLinkMode === 'custom'
                        ? 'Type custom URL e.g. /custom-page or https://example.com'
                        : 'Selected destination path'
                    }
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="formIsActive" className="text-xs font-medium text-slate-300">
                  Visible & Active on Homepage Carousel
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl border border-rose-500/40 bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>Delete Update Slide?</span>
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this update slide permanently from Supabase? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUpdate(deleteConfirmId)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-2"
              >
                {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
