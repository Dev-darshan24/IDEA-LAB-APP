import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface UpdateItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  image_url: string;
  link_url: string;
  badge_color: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function GET() {
  try {
    // Query directly from Supabase cloud database
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return NextResponse.json({ success: true, updates: data });
    }
    if (error) {
      console.warn('[GET /api/updates] Supabase query warning:', error.message);
    }
  } catch (e: any) {
    console.warn('[GET /api/updates] Supabase warning:', e?.message || e);
  }

  return NextResponse.json({ success: true, updates: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, tag, description, image_url, link_url, badge_color, is_active, display_order } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Update Title is required.' },
        { status: 400 }
      );
    }

    const updateId = id ? String(id) : `upd-${Date.now()}`;

    const dbPayload: UpdateItem = {
      id: updateId,
      title: title.trim(),
      tag: tag ? tag.trim() : 'UPDATES',
      description: description ? description.trim() : '',
      image_url: image_url ? image_url.trim() : '',
      link_url: link_url ? link_url.trim() : '/apply',
      badge_color: badge_color || 'sky',
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      display_order: Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
      updated_at: new Date().toISOString(),
    };

    // Upsert directly to Supabase
    const { data, error } = await supabase
      .from('updates')
      .upsert([dbPayload], { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[POST /api/updates] Supabase upsert error:', error.message);
      return NextResponse.json(
        { success: false, message: `Supabase Error: ${error.message}` },
        { status: 500 }
      );
    }

    // Retrieve full updated list from Supabase
    const { data: refreshedUpdates } = await supabase
      .from('updates')
      .select('*')
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Update slide saved on Supabase successfully!',
      update: data ? data[0] : dbPayload,
      updates: refreshedUpdates || [dbPayload],
    });
  } catch (e: any) {
    console.error('[POST /api/updates] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to save update slide.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return NextResponse.json(
        { success: false, message: 'Update ID is required for deletion.' },
        { status: 400 }
      );
    }

    const targetId = id.trim();

    // Delete directly from Supabase cloud database
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', targetId);

    if (error) {
      console.error('[DELETE /api/updates] Supabase delete error:', error.message);
      return NextResponse.json(
        { success: false, message: `Supabase Error: ${error.message}` },
        { status: 500 }
      );
    }

    // Retrieve full updated list from Supabase
    const { data: refreshedUpdates } = await supabase
      .from('updates')
      .select('*')
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      message: 'Update slide deleted permanently from Supabase!',
      updates: refreshedUpdates || [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/updates] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete update.' },
      { status: 500 }
    );
  }
}
