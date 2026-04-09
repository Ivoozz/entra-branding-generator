// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processLogo } from '@/lib/image-processor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const assets = await processLogo(buffer);
    
    // Return base64 strings for preview
    const response: Record<string, string> = {};
    for (const [key, buf] of Object.entries(assets)) {
      response[key] = `data:image/png;base64,${buf.toString('base64')}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
