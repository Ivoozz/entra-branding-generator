import Image from 'next/image';
import { ASSET_SPECS } from '@/lib/types';

interface BrandingPreviewProps {
  assets: Record<string, string>;
}

export default function BrandingPreview({ assets }: BrandingPreviewProps) {
  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Generated Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(assets).map(([key, base64]) => {
          const spec = ASSET_SPECS[key];
          if (!spec) return null;
          return (
            <div key={key} className="flex items-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
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
                  {spec.width} x {spec.height} px • {spec.format.toUpperCase()} • Max {spec.maxSizeKB}KB
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
