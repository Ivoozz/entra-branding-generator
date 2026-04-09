export interface BrandingAsset {
  name: string;
  width: number;
  height: number;
  maxSizeKB: number;
  format: 'png' | 'jpg';
}

export const ASSET_SPECS: Record<string, BrandingAsset> = {
  favicon: { name: 'favicon', width: 32, height: 32, maxSizeKB: 5, format: 'png' },
  background: { name: 'background', width: 1920, height: 1080, maxSizeKB: 300, format: 'png' },
  header: { name: 'header', width: 245, height: 36, maxSizeKB: 10, format: 'png' },
  banner: { name: 'banner', width: 245, height: 36, maxSizeKB: 50, format: 'png' },
  squareLight: { name: 'square-light', width: 240, height: 240, maxSizeKB: 50, format: 'png' },
  squareDark: { name: 'square-dark', width: 240, height: 240, maxSizeKB: 50, format: 'png' },
};

export interface BrandingColors {
  primary: string; // HEX or RGB
  secondary?: string; // HEX or RGB
  darkBackground?: string; // HEX or RGB
  logoPadding?: number; // 0 to 50
  monochrome?: 'original' | 'white' | 'black';
  customBackground?: string | null;
}

export interface BrandingResponse {
  assets: Record<string, string>;
  colors: BrandingColors;
}
