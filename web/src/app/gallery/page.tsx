'use client';

import React, { useState } from 'react';
import { GalleryItem } from '@/types';
import { Calendar, Filter, X, Image as ImageIcon } from 'lucide-react';

const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'g1',
    title: 'IDEA LAB Inauguration Ceremony',
    caption: 'Official ribbon cutting of AICTE IDEA LAB at TGPCET Campus with industrial leaders and faculty.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Event',
    created_at: '2026-08-01',
  },
  {
    id: 'g2',
    title: '48-Hour Prototyping Hackathon',
    caption: 'Student teams utilizing 3D printers and CNC PCB etching machines overnight.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Workshop',
    created_at: '2026-07-28',
  },
  {
    id: 'g3',
    title: '6-Axis Industrial Robotic Arm Live Demo',
    caption: 'Dr. Neeraj Waijode explaining robotic kinematics to engineering students.',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    category: 'Demonstration',
    created_at: '2026-07-15',
  },
  {
    id: 'g4',
    title: 'CO2 Laser Cutting & Fabrication Session',
    caption: 'Hands-on acrylic and metallic frame cutting training in Machining Section.',
    image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    category: 'Training',
    created_at: '2026-06-10',
  },
  {
    id: 'g5',
    title: 'IoT PCB Etching Masterclass',
    caption: 'Etching custom circuit boards on our CNC IoT PCB Design Machine.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Workshop',
    created_at: '2026-05-22',
  },
];

export default function GalleryPage() {
  const [gallery] = useState<GalleryItem[]>(GALLERY_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Categories
  const categories = ['All', 'Event', 'Workshop', 'Demonstration', 'Training'];

  // Filter & Sort (Latest Images on Top by Default)
  const filteredGallery = gallery
    .filter((item) => (selectedCategory === 'All' ? true : item.category === selectedCategory))
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest">
          VISUAL MEMORIES
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          IDEA LAB Gallery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Capturing moments of innovation, workshops, machine training, and industrial events.
        </p>
      </div>

      {/* FILTER & SORT CONTROLS */}
      <div className="glass-card p-4 rounded-3xl border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* CATEGORY BUTTONS */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DATE SORT DROPDOWN */}
        <div className="flex items-center space-x-2 shrink-0">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold text-slate-500">Date Sort:</span>
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

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredGallery.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="glass-card glass-card-hover rounded-3xl overflow-hidden cursor-pointer border border-sky-500/20 group relative shadow-md flex flex-col"
          >
            <div className="h-56 relative overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {item.category}
              </div>
            </div>
            <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.caption}
                </p>
              </div>
              <p className="text-[11px] font-bold text-sky-600 dark:text-cyan-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                📅 {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-6 bg-slate-900 text-white space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                {selectedImage.category} • {selectedImage.created_at}
              </span>
              <h2 className="text-xl font-bold">{selectedImage.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedImage.caption}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
