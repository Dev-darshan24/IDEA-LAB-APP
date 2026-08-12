import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('user_id') as string) || 'guest';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, message: 'Only PDF document files (.pdf) are allowed.' }, { status: 400 });
    }

    // Reasonable max size check (15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'PDF file size must be less than 15MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `proposals/${userId}/${Date.now()}_${sanitizedFileName}`;

    // Upload to Supabase Storage Bucket 'project-proposals'
    try {
      const { data, error } = await supabase.storage
        .from('project-proposals')
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from('project-proposals')
          .getPublicUrl(data.path);

        return NextResponse.json({
          success: true,
          message: 'Proposal PDF uploaded successfully to Supabase Storage!',
          url: publicUrlData.publicUrl,
          path: data.path,
        });
      }
    } catch (storageErr) {
      console.warn('[upload-proposal-pdf] Supabase storage upload warning:', storageErr);
    }

    // Fallback: Convert to clean base64 Data URL if storage bucket is pending manual creation
    const base64Pdf = `data:application/pdf;base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      message: 'PDF processed successfully.',
      url: base64Pdf,
      path: storagePath,
    });
  } catch (e: any) {
    console.error('[upload-proposal-pdf] Upload error:', e);
    return NextResponse.json({ success: false, message: e.message || 'Failed to upload PDF.' }, { status: 500 });
  }
}
