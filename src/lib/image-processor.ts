import sharp from 'sharp';
import { ASSET_SPECS, BrandingColors } from './types';

export async function processLogo(buffer: Buffer, customColors?: Partial<BrandingColors>) {
  const results: Record<string, Buffer> = {};
  
  // Extract dominant color for auto-mode
  const stats = await sharp(buffer).stats();
  const dominant = stats.channels.map(c => Math.round(c.mean));
  const extractedPrimary = `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`;
  
  const primary = customColors?.primary || extractedPrimary;

  for (const [key, spec] of Object.entries(ASSET_SPECS)) {
    let pipeline = sharp(buffer)
      .resize(spec.width, spec.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });

    if (key === 'background') {
      pipeline = sharp({
        create: {
          width: spec.width,
          height: spec.height,
          channels: 4,
          background: primary
        }
      });
    }

    results[key] = await pipeline.toFormat(spec.format).toBuffer();
  }
  
  return {
    assets: results,
    colors: { primary }
  };
}
