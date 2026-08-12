'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { NotificationsModal } from './NotificationsModal';
import { NotificationItem } from '@/types';
import {
  Sparkles,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Send,
  Layers,
  Award,
  BookOpen,
  Image as ImageIcon,
  PhoneCall,
  Home,
  KeyRound,
} from 'lucide-react';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin1, isSuperAdmin2 } = useAuth();
  const isSuperAdmin = isSuperAdmin1 || isSuperAdmin2;
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: Award },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'Innovation Chapter', href: '/chapter', icon: Sparkles },
    { name: 'About & Sections', href: '/about', icon: Layers },
    { name: 'Contact', href: '/contact', icon: PhoneCall },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-sky-500/15 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* LOGO & BRANDING */}
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
            {/* UNIFIED LOGO BADGE */}
            <div className="flex items-center space-x-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm group-hover:scale-105 transition-transform">
              <div className="h-7 px-1 flex items-center justify-center">
                <img src="/tgpcet_logo.png" alt="TGPCET Logo" className="h-full object-contain" />
              </div>
              <span className="text-slate-300 font-light text-xs">|</span>
              <div className="h-7 px-1 flex items-center justify-center">
                <img src="/idea_lab_logo.png" alt="IDEA LAB Logo" className="h-full object-contain" />
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors tracking-tight">
                AICTE IDEA LAB
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                TGPCET Nagpur
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION BAR */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-sky-500/10 whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* APPLY QUICK BUTTON (USERS ONLY) */}
            {!isSuperAdmin && (
              <Link
                href="/apply"
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply</span>
              </Link>
            )}

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer select-none active:scale-95 shadow-sm"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* NOTIFICATIONS BELL */}
            <button
              onClick={() => setNotifOpen(true)}
              aria-label="Notifications"
              className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-700 transition"
            >
              <Bell className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* PROFILE AVATAR / SIGN IN */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center ring-2 ring-sky-500/50 shadow-md hover:scale-105 transition overflow-hidden"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.first_name?.[0]?.toUpperCase() || 'U'
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-500/20 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                        {isSuperAdmin1 ? 'LAB INCHARGE' : isSuperAdmin2 ? 'LEAD DEVELOPER' : 'USER'}
                      </span>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <User className="w-4 h-4 text-sky-500" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4 text-sky-500" />
                        <span>Settings & Password</span>
                      </Link>

                      {/* SUPERADMIN 1 DASHBOARD */}
                      {isSuperAdmin1 && (
                        <Link
                          href="/admin/incharge"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-500" />
                          <span>Incharge Dashboard</span>
                        </Link>
                      )}

                      {/* SUPERADMIN 2 DASHBOARD */}
                      {isSuperAdmin2 && (
                        <Link
                          href="/admin/developer"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-extrabold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition"
                        >
                          <KeyRound className="w-4 h-4 text-cyan-500" />
                          <span>Developer Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-500/20 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-sky-500/20 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                >
                  <Icon className="w-4 h-4 text-sky-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* MOBILE THEME TOGGLE BUTTON */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 transition"
            >
              <div className="flex items-center space-x-3">
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>Theme: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-xs font-bold text-sky-600 dark:text-cyan-400">
                Switch to {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>

            {isSuperAdmin1 && (
              <Link
                href="/admin/incharge"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
              >
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>Incharge Console</span>
              </Link>
            )}

            {isSuperAdmin2 && (
              <Link
                href="/admin/developer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40"
              >
                <KeyRound className="w-4 h-4 text-cyan-500" />
                <span>Developer Console</span>
              </Link>
            )}

            {!isSuperAdmin && (
              <div className="pt-2">
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply for Project / Event</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={markAllRead}
      />
    </>
  );
};
