'use client';

import React from 'react';
import { Download, Info, CheckCircle2 } from 'lucide-react';

interface TeamsGeneratorProps {
  assets: Record<string, string>;
}

export const TeamsGenerator: React.FC<TeamsGeneratorProps> = ({ assets }) => {
  const colorIcon = assets.teamsColorIcon;
  const monoIcon = assets.teamsMonoIcon;

  const downloadAsset = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = name;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Color Icon */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Full Color Icon</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-blue-500/30">
              192 x 192 px
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center p-4 shadow-inner border border-white/5">
              {colorIcon ? (
                <img src={colorIcon} alt="Teams Color Icon" className="w-full h-full object-contain" />
              ) : (
                <div className="w-16 h-16 bg-slate-700 rounded-lg animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                Used in the Teams app store, activity feed, and during installation. Should be a full color logo.
              </p>
              <button
                disabled={!colorIcon}
                onClick={() => downloadAsset(colorIcon, 'teams-color-icon.png')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* Monochrome Icon */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Outline Icon</h3>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-purple-500/30">
              32 x 32 px
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-[#464775] rounded-2xl flex items-center justify-center p-4 shadow-inner border border-white/5">
              {monoIcon ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={monoIcon} alt="Teams Mono Icon" className="w-8 h-8 object-contain" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-slate-700 rounded-lg animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                Used in the left rail and message bar. Must be a white outline/transparent logo (rendered on Teams purple).
              </p>
              <button
                disabled={!monoIcon}
                onClick={() => downloadAsset(monoIcon, 'teams-outline-icon.png')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex gap-4">
          <Info className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">App Package Requirements</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {[
                'Icons must be in PNG format',
                'Outline icon must be 32x32px',
                'Color icon must be 192x192px',
                'Color icon should not have rounded corners',
                'Outline icon should be white or transparent',
                'App manifest must reference these paths'
              ].map((req, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
