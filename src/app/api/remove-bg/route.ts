import { NextRequest, NextResponse } from 'next/server';
import { removeBackground } from '@imgly/background-removal-node';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // We pass the buffer to removeBackground by wrapping it as a Blob.
    const blob = new Blob([buffer], { type: file.type });
    const resultBlob = await removeBackground(blob);
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

    const headers = new Headers();
    headers.set('Content-Type', 'image/png');

    return new NextResponse(resultBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('BG Removal error:', error);
    return NextResponse.json({ error: 'Failed to remove background' }, { status: 500 });
  }
}
