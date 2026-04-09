
export interface SharePointTheme {
  themePrimary: string;
  themeLighterAlt: string;
  themeLighter: string;
  themeLight: string;
  themeTertiary: string;
  themeSecondary: string;
  themeDarkAlt: string;
  themeDark: string;
  themeDarker: string;
  neutralLighterAlt: string;
  neutralLighter: string;
  neutralLight: string;
  neutralQuaternaryAlt: string;
  neutralQuaternary: string;
  neutralTertiaryAlt: string;
  neutralTertiary: string;
  neutralSecondary: string;
  neutralPrimaryAlt: string;
  neutralPrimary: string;
  neutralDark: string;
  black: string;
  white: string;
}

export function generateSharePointTheme(primaryColor: string): SharePointTheme {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const adjust = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex);
    const newR = Math.round(Math.max(0, Math.min(255, r + (255 - r) * percent)));
    const newG = Math.round(Math.max(0, Math.min(255, g + (255 - g) * percent)));
    const newB = Math.round(Math.max(0, Math.min(255, b + (255 - b) * percent)));
    return rgbToHex(newR, newG, newB);
  };

  const darken = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex);
    const newR = Math.round(Math.max(0, Math.min(255, r * (1 - percent))));
    const newG = Math.round(Math.max(0, Math.min(255, g * (1 - percent))));
    const newB = Math.round(Math.max(0, Math.min(255, b * (1 - percent))));
    return rgbToHex(newR, newG, newB);
  };

  return {
    themePrimary: primaryColor,
    themeLighterAlt: adjust(primaryColor, 0.95),
    themeLighter: adjust(primaryColor, 0.85),
    themeLight: adjust(primaryColor, 0.7),
    themeTertiary: adjust(primaryColor, 0.45),
    themeSecondary: adjust(primaryColor, 0.2),
    themeDarkAlt: darken(primaryColor, 0.1),
    themeDark: darken(primaryColor, 0.3),
    themeDarker: darken(primaryColor, 0.5),
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d2d0ce',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  };
}

export function generatePowerShellTheme(theme: SharePointTheme, themeName: string = "BrandTheme") {
  const paletteJson = JSON.stringify(theme, null, 2);
  // Convert JSON to PowerShell Hashtable-like string
  const psPalette = paletteJson
    .replace(/\{/g, '@{')
    .replace(/\}/g, '}')
    .replace(/:/g, '=')
    .replace(/"/g, "'");
    
  return `$themepalette = ${psPalette}
Add-SPOTheme -Name "${themeName}" -Palette $themepalette -IsInverted $false`;
}
