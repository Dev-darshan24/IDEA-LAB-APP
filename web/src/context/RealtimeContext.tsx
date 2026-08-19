'use client';

import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableSyncCallback = (payload?: any) => void;

interface RealtimeContextType {
  subscribeToTable: (tableName: string, callback: TableSyncCallback) => () => void;
  triggerGlobalSync: (tableName?: string, payload?: any) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const listenersRef = useRef<Map<string, Set<TableSyncCallback>>>(new Map());
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);

  const notifyListeners = useCallback((tableName?: string, payload?: any) => {
    if (tableName && listenersRef.current.has(tableName)) {
      const callbacks = listenersRef.current.get(tableName);
      callbacks?.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[RealtimeSync] Listener error for table "${tableName}":`, err);
        }
      });
    }

    if (tableName !== '*' && listenersRef.current.has('*')) {
      const wildcardCallbacks = listenersRef.current.get('*');
      wildcardCallbacks?.forEach((cb) => {
        try {
          cb({ table: tableName, ...payload });
        } catch (err) {
          console.error(`[RealtimeSync] Wildcard listener error:`, err);
        }
      });
    }
  }, []);

  const triggerGlobalSync = useCallback(
    (tableName?: string, payload?: any) => {
      const syncTarget = tableName || '*';

      // 1. Notify current tab listeners immediately
      notifyListeners(syncTarget, payload);

      // 2. Broadcast to other open tabs in the same browser (sub-millisecond)
      if (localBroadcastRef.current) {
        try {
          localBroadcastRef.current.postMessage({
            type: 'GLOBAL_SYNC',
            table: syncTarget,
            payload,
            timestamp: Date.now(),
          });
        } catch (err) {
          console.warn('[RealtimeSync] Local BroadcastChannel error:', err);
        }
      }

      // 3. Broadcast to Supabase Realtime channel for remote browsers/devices
      if (supabaseChannelRef.current) {
        try {
          supabaseChannelRef.current.send({
            type: 'broadcast',
            event: 'data_changed',
            payload: { table: syncTarget, payload, timestamp: Date.now() },
          });
        } catch (err) {
          console.warn('[RealtimeSync] Supabase broadcast send error:', err);
        }
      }
    },
    [notifyListeners]
  );

  useEffect(() => {
    // Initialize cross-tab BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('idea_lab_global_sync');
        localBroadcastRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'GLOBAL_SYNC') {
            notifyListeners(event.data.table, event.data.payload);
          }
        };
      } catch (e) {
        console.warn('[RealtimeSync] Could not initialize BroadcastChannel:', e);
      }
    }

    // Initialize unified Supabase Realtime Channel with reconnect throttling
    try {
      if (!supabaseChannelRef.current) {
        const channel = supabase
          .channel('global_db_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            (payload) => {
              notifyListeners(payload.table, payload);
            }
          )
          .on('broadcast', { event: 'data_changed' }, (evt) => {
            notifyListeners(evt.payload?.table, evt.payload?.payload);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('⚡ [RealtimeSync] Connected to Supabase Realtime channel');
            }
          });

        supabaseChannelRef.current = channel;
      }
    } catch (e) {
      console.warn('[RealtimeSync] Supabase realtime connection failed:', e);
    }

    return () => {
      if (localBroadcastRef.current) {
        localBroadcastRef.current.close();
      }
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
      }
    };
  }, [notifyListeners]);

  const subscribeToTable = useCallback((tableName: string, callback: TableSyncCallback) => {
    if (!listenersRef.current.has(tableName)) {
      listenersRef.current.set(tableName, new Set());
    }
    listenersRef.current.get(tableName)!.add(callback);

    return () => {
      if (listenersRef.current.has(tableName)) {
        listenersRef.current.get(tableName)!.delete(callback);
        if (listenersRef.current.get(tableName)!.size === 0) {
          listenersRef.current.delete(tableName);
        }
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ subscribeToTable, triggerGlobalSync }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export function useRealtimeSync(tableName: string, callback: TableSyncCallback) {
  const { subscribeToTable, triggerGlobalSync } = useRealtime();

  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = subscribeToTable(tableName, (payload) => {
      if (callbackRef.current) {
        callbackRef.current(payload);
      }
    });
    return unsubscribe;
  }, [tableName, subscribeToTable]);

  return { triggerGlobalSync };
}
