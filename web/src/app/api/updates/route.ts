import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

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

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'updates.json');

// Helper to read persistent local storage file
function readLocalUpdates(): UpdateItem[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local updates.json:', err);
  }
  return [];
}

// Helper to write persistent local storage file
function writeLocalUpdates(updates: UpdateItem[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updates, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local updates.json:', err);
  }
}

export async function GET() {
  try {
    // Attempt query from Supabase cloud database
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      writeLocalUpdates(data);
      return NextResponse.json({ success: true, updates: data });
    }
  } catch (e: any) {
    console.warn('[GET /api/updates] Supabase warning:', e?.message || e);
  }

  // Fallback to local persistent JSON file
  const localList = readLocalUpdates();
  return NextResponse.json({ success: true, updates: localList });
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
      image_url: image_url ? image_url.trim() : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      link_url: link_url ? link_url.trim() : '/apply',
      badge_color: badge_color || 'sky',
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      display_order: Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
      updated_at: new Date().toISOString(),
    };

    // 1. Update persistent local disk file
    const currentList = readLocalUpdates();
    const existingIndex = currentList.findIndex(u => u.id === updateId);
    if (existingIndex >= 0) {
      currentList[existingIndex] = dbPayload;
    } else {
      currentList.push(dbPayload);
    }
    writeLocalUpdates(currentList);

    // 2. Attempt upsert to Supabase
    try {
      await supabase.from('updates').upsert([dbPayload], { onConflict: 'id' });
    } catch (stErr) {
      console.warn('[POST /api/updates] Supabase cloud upsert warning:', stErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Update slide saved successfully!',
      update: dbPayload,
      updates: currentList,
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

    // 1. Delete permanently from persistent local disk file
    const currentList = readLocalUpdates();
    const filteredList = currentList.filter(u => u.id !== targetId);
    writeLocalUpdates(filteredList);

    // 2. Delete permanently from Supabase cloud database if available
    try {
      await supabase.from('updates').delete().eq('id', targetId);
    } catch (stErr) {
      console.warn('[DELETE /api/updates] Supabase cloud delete warning:', stErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Update slide deleted permanently!',
      updates: filteredList,
    });
  } catch (e: any) {
    console.error('[DELETE /api/updates] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to delete update.' },
      { status: 500 }
    );
  }
}
