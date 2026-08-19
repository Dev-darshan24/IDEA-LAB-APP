'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeSync } from '@/context/RealtimeContext';
import {
  Calendar,
  Search,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Trash2,
  Play,
  Upload,
  Link as LinkIcon,
  Sparkles,
  ShieldCheck,
  Film,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// Helper to convert YouTube URL to embed link
function getEmbedVideoUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('youtube.com/watch?v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  return url;
}

// Client-side image compression to convert large photos (e.g. 5-15MB) into lightweight ~150KB web-optimized JPEGs
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve('');
  });
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'AICTE IDEA LAB Inauguration Ceremony',
    caption: 'Official ribbon cutting and inaugural ceremony at TGPCET campus.',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Event',
    created_at: '2026-08-01',
  },
  {
    id: 'g-2',
    title: 'Hands-on 3D Printing & CAD Bootcamp',
    caption: 'Students learning additive manufacturing slicing and post-processing.',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    category: 'Workshop',
    created_at: '2026-08-05',
  },
];

export default function GalleryPage() {
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();
  
  // SuperAdmin privilege check: Both SuperAdmin 1 (Incharge) and SuperAdmin 2 (Developer) can add/delete
  const currentRole = user?.role?.toLowerCase();
  const canManageGallery = 
    isSuperAdmin1 || 
    isSuperAdmin2 || 
    currentRole === 'superadmin_1' || 
    currentRole === 'superadmin_2' || 
    currentRole === 'admin_incharge' || 
    currentRole === 'admin_developer';

  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'photo' | 'video'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Add Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Load global gallery data from backend API
  const fetchGlobalGallery = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.gallery)) {
        setGallery(data.gallery);
      } else {
        console.error('API error fetching gallery:', data.message);
      }
    } catch (e) {
      console.error('Error fetching global gallery:', e);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  }, []);

  // Hook up zero-delay realtime sync
  const { triggerGlobalSync } = useRealtimeSync('gallery', () => {
    fetchGlobalGallery();
  });

  useEffect(() => {
    fetchGlobalGallery();
  }, [fetchGlobalGallery]);

  // Handle File Input Change with Auto-Compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          setFilePreview(compressed);
          setNewMediaUrl(compressed);
        } else {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            setFilePreview(result);
            setNewMediaUrl(result);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('File compression error:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Handle Add Item Submit via POST /api/gallery
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showError('Please enter a title.');
      return;
    }
    const finalMediaUrl = uploadMethod === 'file' ? (filePreview || '') : newMediaUrl;
    if (!finalMediaUrl.trim()) {
      showError('Please provide a media URL or upload a file.');
      return;
    }

    setIsSubmitting(true);
    const processedUrl = newMediaType === 'video' ? getEmbedVideoUrl(finalMediaUrl) : finalMediaUrl;
    const defaultThumb = newMediaType === 'video' 
      ? (newThumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80')
      : processedUrl;

    const payload = {
      title: newTitle.trim(),
      caption: newCaption.trim(),
      media_type: newMediaType,
      media_url: processedUrl,
      image_url: defaultThumb,
      thumbnail_url: defaultThumb,
      category: 'Event',
    };

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.gallery) {
        setGallery(data.gallery);
        setNewTitle('');
        setNewCaption('');
        setNewMediaUrl('');
        setNewThumbnailUrl('');
        setFilePreview(null);
        setIsAddModalOpen(false);
        setSuccessMsg(`Successfully added ${newMediaType === 'video' ? 'video' : 'photo'} permanently to Supabase database!`);
        triggerGlobalSync('gallery');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError(`Failed to add gallery item: ${data.message || 'Database error'}`);
      }
    } catch (err: any) {
      showError(`Failed to save to global backend: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Item via DELETE /api/gallery?id=...
  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success && data.gallery) {
        setGallery(data.gallery);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        setDeleteConfirmId(null);
        setSuccessMsg('Media deleted permanently from Supabase database!');
        triggerGlobalSync('gallery');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError(`Failed to delete gallery item: ${data.message || 'Database error'}`);
      }
    } catch (err: any) {
      showError(`Failed to delete media from server: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search & Sort
  const filteredGallery = gallery
    .filter((item) => {
      const type = item.media_type || 'photo';
      const matchType = selectedMediaType === 'all' ? true : type === selectedMediaType;

      if (!searchQuery.trim()) return matchType;

      const query = searchQuery.toLowerCase().trim();
      const titleMatch = item.title?.toLowerCase().includes(query);
      const dateMatch = item.created_at?.toLowerCase().includes(query) ||
                        new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase().includes(query);
      const captionMatch = item.caption?.toLowerCase().includes(query);

      return matchType && (titleMatch || dateMatch || captionMatch);
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative">
        <div className="flex items-center justify-center gap-2">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest inline-flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            LIVE GLOBAL MEDIA GALLERY
          </span>
          <button
            onClick={() => fetchGlobalGallery(true)}
            title="Refresh Live Global Gallery"
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          IDEA LAB Gallery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          High-definition photos and video highlights of innovation workshops, machinery demonstrations, and events.
        </p>



        {/* Global Success Alert Toast */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Global Error Alert Toast */}
        {errorMsg && (
          <div className="fixed top-6 right-6 z-[10000] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
            <button onClick={() => setErrorMsg('')} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="glass-card p-4 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* MEDIA TYPE TABS */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedMediaType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              selectedMediaType === 'all'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setSelectedMediaType('photo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              selectedMediaType === 'photo'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            Photos
          </button>
          <button
            onClick={() => setSelectedMediaType('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              selectedMediaType === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
            Videos
          </button>

          {/* Superadmin Quick Add Button */}
          {canManageGallery && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-auto md:ml-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Photo/Video
            </button>
          )}
        </div>

        {/* SEARCH BAR & SORT CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* DATE SORT DROPDOWN */}
          <div className="flex items-center space-x-2 shrink-0">
            <Calendar className="w-4 h-4 text-sky-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

      </div>

      {/* GALLERY GRID */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Synchronizing live gallery records...</p>
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-sky-500/20 space-y-3">
          <Film className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No gallery items found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery ? `No results for "${searchQuery}". Try clearing search.` : 'Try clearing your media type filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGallery.map((item) => {
            const isVideo = item.media_type === 'video';
            const displayImage = item.image_url || item.thumbnail_url || item.media_url;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden cursor-pointer border border-sky-500/20 group relative shadow-md flex flex-col"
              >
                {/* MEDIA PREVIEW CONTAINER */}
                <div className="h-56 relative overflow-hidden bg-slate-950">
                  <img
                    src={displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  
                  {/* MEDIA TYPE BADGE */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                    {isVideo ? (
                      <>
                        <VideoIcon className="w-3 h-3 text-purple-400" /> Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-cyan-400" /> Photo
                      </>
                    )}
                  </div>

                  {/* VIDEO PLAY OVERLAY ICON */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                      <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* SUPERADMIN GLOBAL DELETE BUTTON */}
                  {canManageGallery && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(item.id);
                      }}
                      title="Delete Globally (Superadmin)"
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-lg backdrop-blur-md transition group-hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.caption || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="font-bold text-sky-600 dark:text-cyan-400">
                      📅 {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-slate-400 group-hover:text-sky-500 font-semibold transition">
                      Click to {isVideo ? 'Play Video' : 'View'} →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX / PLAYER MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative flex flex-col max-h-[90vh] my-auto">
            
            {/* TOP BAR WITH CLOSE & DELETE */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  selectedItem.media_type === 'video' ? 'bg-purple-900/80 text-purple-300' : 'bg-cyan-900/80 text-cyan-300'
                }`}>
                  {selectedItem.media_type === 'video' ? '🎥 Video' : '🖼️ Photo'}
                </span>
                <span className="text-xs text-slate-400">({selectedItem.created_at})</span>
              </div>
              <div className="flex items-center gap-2">
                {canManageGallery && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Globally
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MEDIA DISPLAY CONTAINER */}
            <div className="bg-black flex-1 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden relative">
              {selectedItem.media_type === 'video' ? (
                selectedItem.media_url?.includes('youtube.com/embed') ? (
                  <iframe
                    src={selectedItem.media_url}
                    title={selectedItem.title}
                    className="w-full h-full min-h-[350px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedItem.media_url || selectedItem.image_url}
                    controls
                    autoPlay
                    className="w-full max-h-[60vh] object-contain"
                  />
                )
              ) : (
                <img
                  src={selectedItem.media_url || selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full max-h-[60vh] object-contain"
                />
              )}
            </div>

            {/* BOTTOM INFO BAR */}
            <div className="p-6 bg-slate-900 text-white space-y-2">
              <h2 className="text-xl font-bold">{selectedItem.title}</h2>
              {selectedItem.caption && (
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedItem.caption}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUPERADMIN ADD MEDIA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Add Photo / Video</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              
              {/* MEDIA TYPE SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Media Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMediaType('photo')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      newMediaType === 'photo'
                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" /> Photo 🖼️
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMediaType('video')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                      newMediaType === 'video'
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <VideoIcon className="w-4 h-4" /> Video 🎥
                  </button>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder={newMediaType === 'video' ? 'e.g. CNC Machine Operation Video' : 'e.g. Robotics Workshop 2026'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* UPLOAD METHOD TABS (URL vs FILE UPLOAD) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {newMediaType === 'video' ? 'Video Source *' : 'Photo Source *'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        uploadMethod === 'url' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" /> Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition ${
                        uploadMethod === 'file' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" /> File Upload
                    </button>
                  </div>
                </div>

                {uploadMethod === 'url' ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      placeholder={
                        newMediaType === 'video'
                          ? 'Paste Video Link (YouTube link or .mp4 video URL)'
                          : 'Paste Image URL (https://images.unsplash.com/...)'
                      }
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                    />
                    {newMediaType === 'video' && (
                      <p className="text-[11px] text-purple-400">
                        💡 Supports direct MP4 video URLs and YouTube links (`https://youtube.com/watch?v=...`).
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept={newMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                    {isCompressing ? (
                      <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                        <span className="text-[11px] text-sky-300 font-bold">Compressing image for fast global upload...</span>
                      </div>
                    ) : filePreview ? (
                      <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                        <p className="text-[11px] text-emerald-400 font-bold">✓ File web-optimized & ready for upload</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* CAPTION */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Caption / Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details about this photo/video..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Globally
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-6 border border-red-500/40 shadow-2xl space-y-4 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Gallery Item Globally?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this item? It will be removed for all users across all devices.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Yes, Delete Globally
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
