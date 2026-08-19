import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  created_at?: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const unreadCount = data.filter(n => !n.is_read).length;
      return NextResponse.json({
        success: true,
        notifications: data,
        unreadCount,
      });
    }
    if (error) {
      console.warn('[GET /api/notifications] Supabase query warning:', error.message);
    }
  } catch (e: any) {
    console.warn('[GET /api/notifications] Supabase error:', e?.message || e);
  }

  return NextResponse.json({
    success: true,
    notifications: [],
    unreadCount: 0,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, type, user_id } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required.' },
        { status: 400 }
      );
    }

    const payload: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: user_id || null,
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select();

    if (error) {
      console.error('[POST /api/notifications] Supabase insert error:', error.message);
      return NextResponse.json(
        { success: false, message: `Supabase Error: ${error.message}` },
        { status: 500 }
      );
    }

    // Retrieve refreshed notifications from Supabase
    const { data: latestNotifications } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    const unreadCount = latestNotifications ? latestNotifications.filter(n => !n.is_read).length : 0;

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully on Supabase!',
      notification: data ? data[0] : payload,
      notifications: latestNotifications || [payload],
      unreadCount,
    });
  } catch (e: any) {
    console.error('[POST /api/notifications] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to send notification.' },
      { status: 500 }
    );
  }
}
