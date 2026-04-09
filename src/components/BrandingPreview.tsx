import Image from 'next/image';
import { ASSET_SPECS } from '@/lib/types';

interface BrandingPreviewProps {
  assets: Record<string, string>;
  currentTheme: 'light' | 'dark';
}

export default function BrandingPreview({ assets, currentTheme }: BrandingPreviewProps) {
  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Generated Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(assets).map(([key, base64]) => {
          const spec = ASSET_SPECS[key];
          if (!spec) return null;

          const isCurrentThemeSquare = (key === 'squareLight' && currentTheme === 'light') || 
                                      (key === 'squareDark' && currentTheme === 'dark');

          return (
            <div key={key} className={`flex items-center p-4 border rounded-lg shadow-sm transition-all ${
              isCurrentThemeSquare 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            }`}>
              <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden mr-4">
                <Image
                  src={base64}
                  alt={spec.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate capitalize">{spec.name.replace('-', ' ')}</h3>
                <p className="text-sm text-zinc-500">
                  {spec.width} x {spec.height} px • {spec.format.toUpperCase()}
                </p>
              </div>
              {isCurrentThemeSquare && (
                <span className="ml-auto text-[10px] font-bold uppercase bg-blue-500 text-white px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
