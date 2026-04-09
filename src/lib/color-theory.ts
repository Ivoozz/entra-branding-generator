// Utility to convert HEX to HSL
function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

// Utility to convert HSL to HEX
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r: number | string = 0,
      g: number | string = 0,
      b: number | string = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  r = Math.round((Number(r) + m) * 255).toString(16);
  g = Math.round((Number(g) + m) * 255).toString(16);
  b = Math.round((Number(b) + m) * 255).toString(16);

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;

  return "#" + r + g + b;
}

export function generateMagicPalettes(primaryHex: string) {
  if (!/^#[0-9A-F]{6}$/i.test(primaryHex)) return [];
  
  const { h, s, l } = hexToHSL(primaryHex);

  return [
    {
      name: 'Complementary',
      colors: [primaryHex, hslToHex((h + 180) % 360, s, l)]
    },
    {
      name: 'Analogous',
      colors: [hslToHex((h + 330) % 360, s, l), primaryHex, hslToHex((h + 30) % 360, s, l)]
    },
    {
      name: 'Triadic',
      colors: [primaryHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)]
    },
    {
      name: 'Monochromatic',
      colors: [primaryHex, hslToHex(h, s, Math.max(0, l - 30)), hslToHex(h, s, Math.min(100, l + 30))]
    }
  ];
}
