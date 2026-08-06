import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string || 'file'; // 'avatar' or 'resume'

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    // Validate size (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size must be under 10MB.' }, { status: 400 });
    }

    // Validate file type
    if (uploadType === 'avatar' && !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Profile picture must be an image (PNG, JPG, WEBP).' }, { status: 400 });
    }

    if (uploadType === 'resume' && file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'Resume must be in PDF format.' }, { status: 400 });
    }

    // Convert file to base64 Data URL for universal instant rendering
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || (uploadType === 'resume' ? 'application/pdf' : 'image/png');
    const fileDataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      message: `${uploadType === 'avatar' ? 'Profile picture' : 'Resume PDF'} uploaded successfully!`,
      url: fileDataUrl,
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
