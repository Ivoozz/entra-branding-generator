import React from 'react';
import Image from 'next/image';
import { ASSET_SPECS } from '@/lib/types';
import { Download } from 'lucide-react';

interface WindowsGeneratorProps {
  assets: Record<string, string>;
}

export function WindowsGenerator({ assets }: WindowsGeneratorProps) {
  const downloadAsset = (key: string, name: string) => {
    if (!assets[key]) return;
    const link = document.createElement('a');
    link.href = assets[key];
    link.download = `${name}.png`;
    link.click();
  };

  return (
    <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-6">Windows & Intune Branding</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        These assets are sized specifically for Microsoft Intune Company Portal and Windows Autopilot OOBE (Out-of-Box Experience).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Intune Company Portal</h3>
              <p className="text-sm text-zinc-500">400x100 px (Transparent PNG)</p>
            </div>
            <button
              onClick={() => downloadAsset('intuneLogo', 'intune-logo')}
              disabled={!assets.intuneLogo}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
              title="Download Intune Logo"
            >
              <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
          <div className="w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-800 checkerboard flex items-center justify-center p-4 relative">
            {assets.intuneLogo ? (
              <Image
                src={assets.intuneLogo}
                alt="Intune Logo"
                fill
                className="object-contain p-4"
              />
            ) : (
              <span className="text-sm text-zinc-400">Generate assets to preview</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Windows Autopilot Background</h3>
              <p className="text-sm text-zinc-500">1920x1080 px (JPG)</p>
            </div>
            <button
              onClick={() => downloadAsset('autopilotBg', 'windows-autopilot-bg')}
              disabled={!assets.autopilotBg}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
              title="Download Autopilot Background"
            >
              <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
          <div className="w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
            {assets.autopilotBg ? (
              <Image
                src={assets.autopilotBg}
                alt="Autopilot Background"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-sm text-zinc-400">Generate assets to preview</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
