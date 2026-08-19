'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Award, ImageIcon, User, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, isSuperAdmin1, isSuperAdmin2 } = useAuth();
  const isSuperAdmin = isSuperAdmin1 || isSuperAdmin2;

  const tabs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Sections', href: '/about', icon: Layers },
    { name: 'Projects', href: '/projects', icon: Award },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { 
      name: user ? 'Profile' : 'Apply', 
      href: user ? '/profile' : '/apply', 
      icon: user ? User : Send 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)] shadow-lg transition-colors">
      <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center group transition-all duration-200 ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-transform duration-200 ${
                  isActive
                    ? 'bg-sky-500/15 dark:bg-sky-400/20 scale-110'
                    : 'group-active:scale-95'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
