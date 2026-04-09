import sharp from 'sharp';
import { ASSET_SPECS } from './types';

export async function processLogo(buffer: Buffer) {
  const results: Record<string, Buffer> = {};

  for (const [key, spec] of Object.entries(ASSET_SPECS)) {
    let pipeline = sharp(buffer)
      .resize(spec.width, spec.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });

    if (key === 'background') {
      // Logic for generating gradient/color background based on logo
      const stats = await sharp(buffer).stats();
      const dominant = stats.channels.map(c => Math.round(c.mean));
      pipeline = sharp({
        create: {
          width: spec.width,
          height: spec.height,
          channels: 4,
          background: { r: dominant[0], g: dominant[1], b: dominant[2], alpha: 1 }
        }
      });
    }

    results[key] = await pipeline.toFormat(spec.format).toBuffer();
  }
  return results;
}
