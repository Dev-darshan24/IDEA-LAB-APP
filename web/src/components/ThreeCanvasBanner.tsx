'use client';

import React, { useState, useEffect, useRef } from 'react';

export const ThreeCanvasBanner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 350);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 350;
    };

    window.addEventListener('resize', handleResize);

    // Particle 3D-like Nodes
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 1.5,
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.005;

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(2, 132, 199, ${1 - dist / 110})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0284c7';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Central 3D Wireframe Cube
      const cx = width / 2;
      const cy = height / 2;
      const size = 50;

      const vertices = [
        [-size, -size, -size],
        [size, -size, -size],
        [size, size, -size],
        [-size, size, -size],
        [-size, -size, size],
        [size, -size, size],
        [size, size, size],
        [-size, size, size],
      ];

      // Rotate & Project
      const projected = vertices.map(([x, y, z]) => {
        const radX = angle;
        const radY = angle * 1.3;

        // Y-axis rotation
        let x1 = x * Math.cos(radY) + z * Math.sin(radY);
        let z1 = -x * Math.sin(radY) + z * Math.cos(radY);

        // X-axis rotation
        let y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

        const fov = 300;
        const scale = fov / (fov + z2 + 100);

        return [cx + x1 * scale, cy + y2 * scale];
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      edges.forEach(([u, v]) => {
        ctx.beginPath();
        ctx.moveTo(projected[u][0], projected[u][1]);
        ctx.lineTo(projected[v][0], projected[v][1]);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  return (
    <div className="relative w-full h-[350px] overflow-hidden rounded-3xl bg-slate-950/20 border border-sky-500/20 my-6 shadow-2xl backdrop-blur-md">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none">
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 mb-3 uppercase animate-pulse">
          AICTE Center of Excellence
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 tracking-tight drop-shadow-md">
          Tulsiramji Gaikwad Patil College of Engineering & Technology
        </h2>
        <p className="text-slate-300 mt-2 max-w-2xl text-sm md:text-base font-light">
          Innovate • Design • Research • Prototype — Transforming Ideas into Impactful Real-World Solutions.
        </p>
      </div>
    </div>
  );
};
