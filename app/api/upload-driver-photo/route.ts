import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
}

export async function POST(request: Request) {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    const formData = await request.formData();
    const file = formData.get('file');
    const caseId = String(formData.get('caseId') || 'unknown-case').trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Photo file is required' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name || 'driver-photo.jpg');

    if (isDevelopment && !token) {
      // Local development: save to public/uploads directory
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'driver-photos', caseId);
      await mkdir(uploadsDir, { recursive: true });

      const localPath = join(uploadsDir, `${timestamp}-${safeName}`);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(localPath, buffer);

      const localUrl = `/uploads/driver-photos/${caseId}/${timestamp}-${safeName}`;

      return NextResponse.json({
        success: true,
        url: localUrl,
        pathname: localPath,
        isLocal: true,
      });
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Missing BLOB_READ_WRITE_TOKEN' },
        { status: 500 }
      );
    }

    const pathname = `driver-photos/${caseId}/${timestamp}-${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      token,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      isLocal: false,
    });
  } catch (error) {
    console.error('Upload driver photo error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown upload driver photo error',
      },
      { status: 500 }
    );
  }
}