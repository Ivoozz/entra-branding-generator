import sharp from 'sharp';
import { ASSET_SPECS, BrandingColors } from './types';

export async function processLogo(
  buffer: Buffer, 
  customColors?: Partial<BrandingColors>,
  optimize: boolean = false
) {
  const results: Record<string, Buffer> = {};
  const monochrome = customColors?.monochrome || 'original';

  // Extract dominant color for auto-mode
  const stats = await sharp(buffer).stats();
  const dominant = stats.channels.map(c => Math.round(c.mean));

  // Calculate perceived brightness: (R*299 + G*587 + B*114) / 1000
  const brightness = (dominant[0] * 299 + dominant[1] * 587 + dominant[2] * 114) / 1000;

  // If brightness is too high (> 240, almost white), default to Microsoft Blue
  const extractedPrimary = brightness > 240 
    ? '#0078d4' 
    : `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`;

  const primary = customColors?.primary || extractedPrimary;
  for (const [key, spec] of Object.entries(ASSET_SPECS)) {
    const logoPadding = customColors?.logoPadding || 0;
    let pipeline;

    if (key !== 'background') {
      pipeline = sharp(buffer);

      let effectiveMonochrome = monochrome;
      if (key === 'teamsMonoIcon' && effectiveMonochrome === 'original') {
        effectiveMonochrome = 'white'; // Default to white for mono icons if not specified
      }

      if (effectiveMonochrome === 'white') {
        pipeline = pipeline.negate().grayscale().threshold(128);
      } else if (effectiveMonochrome === 'black') {
        pipeline = pipeline.grayscale().threshold(128);
      }

      if (logoPadding > 0) {
        const padding = Math.round(Math.min(spec.width, spec.height) * (logoPadding / 100));
        pipeline = pipeline
          .resize(spec.width - padding * 2, spec.height - padding * 2, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
      } else {
        pipeline = pipeline
          .resize(spec.width, spec.height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
      }
    } else {
      if (customColors?.customBackground) {
        const base64Data = customColors.customBackground.split(',')[1];
        pipeline = sharp(Buffer.from(base64Data, 'base64'));
      } else if (customColors?.secondary) {
        const svg = `
          <svg width="${spec.width}" height="${spec.height}">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${customColors.secondary};stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
          </svg>
        `;
        pipeline = sharp(Buffer.from(svg));
      } else {
        pipeline = sharp({
          create: {
            width: spec.width,
            height: spec.height,
            channels: 4,
            background: primary
          }
        });
      }
    }

    let finalPipeline = pipeline.toFormat(spec.format);
    if (optimize && spec.format === 'png') {
      finalPipeline = finalPipeline.png({ quality: 60, compressionLevel: 9 });
    }

    results[key] = await finalPipeline.toBuffer();
  }
  
  return {
    assets: results,
    colors: { 
      primary, 
      secondary: customColors?.secondary,
      logoPadding: customColors?.logoPadding,
      monochrome
    }
  };
}
