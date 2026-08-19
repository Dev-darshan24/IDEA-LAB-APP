import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { GalleryItem } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'AICTE IDEA LAB Inauguration Ceremony',
    caption: 'Official ribbon cutting and inaugural ceremony at TGPCET campus.',
    media_type: 'photo',
    media_url: '',
    image_url: '',
    thumbnail_url: '',
    category: 'Event',
    created_at: '2026-08-01',
  },
  {
    id: 'g-2',
    title: 'Hands-on 3D Printing & CAD Bootcamp',
    caption: 'Students learning additive manufacturing slicing and post-processing.',
    media_type: 'photo',
    media_url: '',
    image_url: '',
    thumbnail_url: '',
    category: 'Workshop',
    created_at: '2026-08-05',
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const gallery: GalleryItem[] = data.map((item: any) => ({
        id: String(item.id),
        title: item.title || 'Untitled Media',
        caption: item.caption || '',
        media_type: item.media_type || 'photo',
        media_url: item.media_url || item.image_url || '',
        image_url: item.image_url || item.media_url || '',
        thumbnail_url: item.thumbnail_url || item.media_url || item.image_url || '',
        category: item.category || 'Event',
        created_at: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      return NextResponse.json({ success: true, gallery });
    }
  } catch (e: any) {
    console.error('[GET /api/gallery] Supabase fetch error:', e);
  }

  return NextResponse.json({ success: true, gallery: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, caption, media_type, media_url, image_url, thumbnail_url, category } = body;

    if (!title || (!media_url && !image_url)) {
      return NextResponse.json({ success: false, message: 'Title and Media URL are required.' }, { status: 400 });
    }

    const galId = id ? String(id) : `gal-${Date.now()}`;
    const finalUrl = (media_url || image_url).trim();

    const dbPayload = {
      id: galId,
      title: title.trim(),
      caption: caption ? caption.trim() : '',
      media_type: media_type || 'photo',
      media_url: finalUrl,
      image_url: finalUrl,
      thumbnail_url: (thumbnail_url || finalUrl).trim(),
      category: category || 'Event',
    };

    const { error: upsertErr } = await supabase.from('gallery').upsert([dbPayload], { onConflict: 'id' });
    if (upsertErr) {
      console.error('[POST /api/gallery] Supabase upsert error:', upsertErr);
      return NextResponse.json({ success: false, message: upsertErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Gallery item stored in Supabase cloud database!',
      item: dbPayload,
      gallery: updatedList || [dbPayload],
    });
  } catch (e: any) {
    console.error('[POST /api/gallery] Error:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to add gallery item.' }, { status: 500 });
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
      return NextResponse.json({ success: false, message: 'Media ID is required.' }, { status: 400 });
    }

    const targetId = id.trim();
    const { error: delErr } = await supabase.from('gallery').delete().eq('id', targetId);
    if (delErr) {
      console.error('[DELETE /api/gallery] Supabase delete error:', delErr);
      return NextResponse.json({ success: false, message: delErr.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted from Supabase cloud database!',
      gallery: updatedList || [],
    });
  } catch (e: any) {
    console.error('[DELETE /api/gallery] Error:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to delete gallery item.' }, { status: 500 });
  }
}
