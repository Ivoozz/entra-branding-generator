'use client';

import React, { useMemo } from 'react';
import { generateSharePointTheme, generatePowerShellTheme } from '@/lib/ecosystem-utils';
import { Copy, Terminal, Code } from 'lucide-react';

interface SharePointGeneratorProps {
  primaryColor: string;
}

export const SharePointGenerator: React.FC<SharePointGeneratorProps> = ({ primaryColor }) => {
  const theme = useMemo(() => generateSharePointTheme(primaryColor), [primaryColor]);
  const psCode = useMemo(() => generatePowerShellTheme(theme), [theme]);
  const jsonCode = useMemo(() => JSON.stringify(theme, null, 2), [theme]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  const themeColors = [
    { name: 'Primary', color: theme.themePrimary },
    { name: 'Lighter Alt', color: theme.themeLighterAlt },
    { name: 'Lighter', color: theme.themeLighter },
    { name: 'Light', color: theme.themeLight },
    { name: 'Tertiary', color: theme.themeTertiary },
    { name: 'Secondary', color: theme.themeSecondary },
    { name: 'Dark Alt', color: theme.themeDarkAlt },
    { name: 'Dark', color: theme.themeDark },
    { name: 'Darker', color: theme.themeDarker },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              PowerShell (SPO Theme)
            </h3>
            <button 
              onClick={() => copyToClipboard(psCode)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-xs text-slate-300 overflow-x-auto p-4 bg-black/40 rounded-lg font-mono leading-relaxed">
            {psCode}
          </pre>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" />
              JSON Palette
            </h3>
            <button 
              onClick={() => copyToClipboard(jsonCode)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-xs text-slate-300 overflow-x-auto p-4 bg-black/40 rounded-lg font-mono leading-relaxed h-[300px]">
            {jsonCode}
          </pre>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-6">Theme Visualization</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4">
          {themeColors.map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-2">
              <div 
                className="w-full aspect-square rounded-lg border border-white/10 shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-400 text-center font-medium uppercase tracking-wider">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
