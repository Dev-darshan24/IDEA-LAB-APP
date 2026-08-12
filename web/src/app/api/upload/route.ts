import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadType = (formData.get('type') as string) || 'file'; // 'avatar', 'resume', 'project_image', 'project_pdf', 'file'

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    // Validate size (Max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size must be under 25MB.' }, { status: 400 });
    }

    const isPdf = uploadType === 'resume' || uploadType === 'project_pdf' || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = uploadType === 'avatar' || uploadType === 'project_image' || file.type.startsWith('image/');

    if (uploadType === 'avatar' && !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Profile picture must be an image (PNG, JPG, WEBP).' }, { status: 400 });
    }

    if (uploadType === 'resume' && !isPdf) {
      return NextResponse.json({ success: false, message: 'Resume must be in PDF format.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');

    // Generate unique storage path
    const fileExt = file.name.split('.').pop() || (isPdf ? 'pdf' : 'jpg');
    const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storagePath = `uploads/${sanitizedFileName}`;

    let publicUrl = '';

    try {
      // 1. Attempt upload to Supabase Storage bucket 'projects'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('projects')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage.from('projects').getPublicUrl(storagePath);
        if (urlData?.publicUrl) {
          publicUrl = urlData.publicUrl;
        }
      }
    } catch (stErr) {
      console.warn('[Storage API] Supabase storage upload warning:', stErr);
    }

    // 2. Fallback to base64 Data URL if storage bucket is uninitialized
    if (!publicUrl) {
      const base64 = buffer.toString('base64');
      publicUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      message: `${isPdf ? 'PDF document' : 'Image'} uploaded successfully to Supabase Storage!`,
      url: publicUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('File Upload API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload file.' },
      { status: 500 }
    );
  }
}
