import { NextRequest, NextResponse } from 'next/server';
import { processLogo } from '@/lib/image-processor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    const primary = formData.get('primary') as string;
    const secondary = formData.get('secondary') as string;
    const logoPadding = formData.get('logoPadding') ? Number(formData.get('logoPadding')) : undefined;
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { assets, colors } = await processLogo(buffer, { primary, secondary, logoPadding });
    
    const assetResponse: Record<string, string> = {};
    for (const [key, buf] of Object.entries(assets)) {
      assetResponse[key] = `data:image/png;base64,${buf.toString('base64')}`;
    }

    return NextResponse.json({ assets: assetResponse, colors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
