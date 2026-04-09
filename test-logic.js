const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSET_SPECS = {
  favicon: { name: 'favicon', width: 32, height: 32, maxSizeKB: 5, format: 'png' },
  background: { name: 'background', width: 1920, height: 1080, maxSizeKB: 300, format: 'png' },
};

async function processLogo(buffer, customColors) {
  const results = {};
  
  // Extract dominant color for auto-mode
  const stats = await sharp(buffer).stats();
  const dominant = stats.channels.map(c => Math.round(c.mean));
  const extractedPrimary = `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`;
  
  const primary = customColors?.primary || extractedPrimary;

  for (const [key, spec] of Object.entries(ASSET_SPECS)) {
    let pipeline;
    if (key === 'background') {
      pipeline = sharp({
        create: {
          width: spec.width,
          height: spec.height,
          channels: 4,
          background: primary
        }
      });
    } else {
      pipeline = sharp(buffer)
        .resize(spec.width, spec.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });
    }

    results[key] = await pipeline.toFormat(spec.format).toBuffer();
  }
  
  return {
    assets: results,
    colors: { primary }
  };
}

async function runTests() {
  const logoPath = path.join(__dirname, 'public', 'next.svg');
  const buffer = fs.readFileSync(logoPath);

  console.log('--- Testing Auto Mode ---');
  const autoResult = await processLogo(buffer);
  console.log('Extracted Primary Color:', autoResult.colors.primary);
  
  // Verify background color
  const backgroundStats = await sharp(autoResult.assets.background).stats();
  const bgDominant = backgroundStats.channels.map(c => Math.round(c.mean));
  const bgExtracted = `rgb(${bgDominant[0]}, ${bgDominant[1]}, ${bgDominant[2]})`;
  console.log('Background Dominant Color:', bgExtracted);
  
  if (autoResult.colors.primary === bgExtracted) {
    console.log('✅ Auto Mode: Background color matches extracted primary color.');
  } else {
    console.log('❌ Auto Mode: Background color does NOT match extracted primary color.');
  }

  console.log('\n--- Testing Manual Mode ---');
  const manualColor = '#FF0000'; // Red
  const manualResult = await processLogo(buffer, { primary: manualColor });
  console.log('Requested Manual Color:', manualColor);
  console.log('Applied Primary Color:', manualResult.colors.primary);

  const manualBgStats = await sharp(manualResult.assets.background).stats();
  const manualBgDominant = manualBgStats.channels.map(c => Math.round(c.mean));
  // #FF0000 is rgb(255, 0, 0)
  console.log('Background Dominant Color:', `rgb(${manualBgDominant[0]}, ${manualBgDominant[1]}, ${manualBgDominant[2]})`);

  if (manualBgDominant[0] === 255 && manualBgDominant[1] === 0 && manualBgDominant[2] === 0) {
    console.log('✅ Manual Mode: Background color is correctly applied (#FF0000).');
  } else {
    console.log('❌ Manual Mode: Background color was NOT correctly applied.');
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
