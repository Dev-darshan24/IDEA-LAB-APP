'use client';

import React from 'react';
import { NotificationItem } from '@/types';
import { Bell, CheckCircle2, MessageSquare, AlertCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-500/20 overflow-hidden flex flex-col max-h-[85vh] mt-16">
        <div className="p-4 bg-gradient-to-r from-sky-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 animate-bounce" />
            <h3 className="font-bold text-lg">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-sky-500 mb-2 opacity-60" />
              <p className="text-sm font-medium">No new notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`pt-3 first:pt-0 p-3 rounded-2xl transition ${
                  item.is_read
                    ? 'bg-transparent text-slate-600 dark:text-slate-300'
                    : 'bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 border-l-4 border-sky-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {item.type === 'incharge' ? (
                    <MessageSquare className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                  ) : item.type === 'application' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
