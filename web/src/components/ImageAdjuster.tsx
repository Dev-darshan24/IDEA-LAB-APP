'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, MoveVertical, MoveHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ImageAdjusterProps {
  imageSrc: string;
  onAdjusted: (adjustedBase64: string) => void;
  label?: string;
}

/**
 * Utility function to crop and adjust image source to a 400x400 Base64 JPEG.
 */
export function cropAndAdjustImage(
  imageSrc: string,
  zoom: number = 1.0,
  offsetY: number = 20, // 0 = top (head focus), 50 = center, 100 = bottom
  offsetX: number = 50  // 0 = left, 50 = center, 100 = right
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const OUTPUT_SIZE = 400; // High resolution 400x400 square avatar
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      // Calculate source crop region based on zoom
      const minDimension = Math.min(img.width, img.height);
      const cropSize = minDimension / zoom;

      // Max allowable crop offsets
      const maxX = img.width - cropSize;
      const maxY = img.height - cropSize;

      // Map 0-100 percentage to exact pixel positions
      const srcX = Math.max(0, Math.min(maxX, (offsetX / 100) * maxX));
      const srcY = Math.max(0, Math.min(maxY, (offsetY / 100) * maxY));

      ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(imageSrc);
  });
}

export const ImageAdjuster: React.FC<ImageAdjusterProps> = ({
  imageSrc,
  onAdjusted,
  label = 'Adjust Image Focus & Visibility',
}) => {
  const [zoom, setZoom] = useState<number>(1.1);
  const [offsetY, setOffsetY] = useState<number>(15); // Default: Head / Face Focus
  const [offsetX, setOffsetX] = useState<number>(50);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update preview when parameters change
  useEffect(() => {
    if (!imageSrc) {
      setPreviewSrc('');
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const cropped = await cropAndAdjustImage(imageSrc, zoom, offsetY, offsetX);
        setPreviewSrc(cropped);
        onAdjusted(cropped);
      } catch (err) {
        console.error('Image adjust error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 150);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [imageSrc, zoom, offsetY, offsetX]);

  if (!imageSrc) return null;

  return (
    <div className="p-4 bg-slate-950/70 border border-sky-500/30 rounded-2xl space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {label}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold">Live Circular Preview</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        
        {/* LIVE CIRCULAR PREVIEW BADGE */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-sky-400 shadow-xl bg-slate-900 flex items-center justify-center relative">
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-slate-500 font-bold animate-pulse">Loading...</div>
            )}
          </div>
          {isProcessing && (
            <div className="absolute inset-0 rounded-full bg-slate-950/50 backdrop-blur-xs flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* ADJUSTMENT SLIDERS & PRESETS */}
        <div className="flex-1 space-y-3 w-full">
          
          {/* QUICK PRESETS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => { setOffsetY(15); setOffsetX(50); setZoom(1.2); }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/30 transition"
            >
              👤 Head Focus
            </button>
            <button
              type="button"
              onClick={() => { setOffsetY(50); setOffsetX(50); setZoom(1.0); }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              🎯 Center
            </button>
            <button
              type="button"
              onClick={() => { setZoom((prev) => Math.min(2.5, prev + 0.2)); }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
            >
              <ZoomIn className="w-3 h-3" /> Zoom +
            </button>
            <button
              type="button"
              onClick={() => { setZoom(1.0); setOffsetY(20); setOffsetX(50); }}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* ZOOM SLIDER */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-sky-400" /> Zoom Level</span>
              <span className="text-sky-400 font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* VERTICAL SHIFT SLIDER (FACE FOCUS) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1"><MoveVertical className="w-3 h-3 text-sky-400" /> Vertical Focus (Head / Body)</span>
              <span className="text-sky-400 font-bold">{offsetY < 30 ? 'Top Head' : offsetY > 70 ? 'Bottom' : 'Middle'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={offsetY}
              onChange={(e) => setOffsetY(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
