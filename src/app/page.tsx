'use client';

import { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { Sun, Moon } from 'lucide-react';
import BrandingPreview from '@/components/BrandingPreview';
import LoginMockup from '@/components/LoginMockup';
import { getContrastRatio, getContrastRating } from '@/lib/accessibility';

export default function Home() {
  const [logo, setLogo] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [assets, setAssets] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [logoPadding, setLogoPadding] = useState(0);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const contrastInfo = useMemo(() => {
    const ratio = getContrastRatio(primaryColor, '#FFFFFF');
    const rating = getContrastRating(ratio);
    return { ratio, rating };
  }, [primaryColor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleUrlFetch = async () => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'logo.png', { type: blob.type });
      setLogo(file);
    } catch (error) {
      console.error('Failed to fetch image from URL', error);
    }
  };

  const handleGenerate = async () => {
    if (!logo) return;
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('logo', logo);
    
    if (isManual) {
      formData.append('primary', primaryColor);
      formData.append('secondary', secondaryColor);
    }
    
    formData.append('logoPadding', logoPadding.toString());

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      const { assets, colors } = await res.json();
      setAssets(assets);
      
      // In auto mode, sync the picker to what was extracted
      if (!isManual && colors?.primary) {
        setPrimaryColor(colors.primary); 
      }
    } catch (error) {
      console.error('Generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!assets) return;
    const zip = new JSZip();
    for (const [key, base64] of Object.entries(assets)) {
      const base64Data = base64.split(',')[1];
      zip.file(`${key}.png`, base64Data, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'entra-branding.zip';
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 dark:bg-black p-8 font-sans transition-colors duration-300">
      <main className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex justify-between w-full items-center mb-8">
          <h1 className="text-4xl font-bold">Entra ID Branding Generator</h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-6 h-6 text-zinc-600" />
            ) : (
              <Sun className="w-6 h-6 text-yellow-500" />
            )}
          </button>
        </div>
        
        <div className="w-full p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mb-8">
          <div className="flex flex-col gap-6">
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept="image/*" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <p className="text-lg mb-2">{logo ? logo.name : 'Drag & drop your logo here or click to browse'}</p>
                <span className="text-sm text-zinc-500 italic">Supports PNG, JPG (SVG recommended)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-black dark:text-white"
              />
              <button 
                onClick={handleUrlFetch}
                className="px-4 bg-zinc-200 dark:bg-zinc-800 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                Fetch
              </button>
            </div>

            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'basic' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'advanced' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                Advanced
              </button>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 min-h-[200px]">
              {activeTab === 'basic' ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-zinc-500">Auto-extracted colors will be used. Upload a logo to see the results.</p>
                  <div className="flex items-center justify-between">
                    <label htmlFor="manual-mode-basic" className="font-medium cursor-pointer">Manual Color Override</label>
                    <input
                      id="manual-mode-basic"
                      type="checkbox"
                      checked={isManual}
                      onChange={(e) => setIsManual(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="manual-mode-adv" className="font-medium cursor-pointer">Manual Color Override</label>
                      <input
                        id="manual-mode-adv"
                        type="checkbox"
                        checked={isManual}
                        onChange={(e) => setIsManual(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label htmlFor="primary-color" className={`text-sm ${!isManual ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'}`}>Primary Brand Color</label>
                      <input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={!isManual}
                        className="p-1 h-10 w-20 rounded bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-mono text-zinc-500 uppercase">{primaryColor}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                        contrastInfo.rating === 'Fail' || contrastInfo.rating === 'AA Large'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {contrastInfo.rating === 'Fail' || contrastInfo.rating === 'AA Large' ? '⚠️ Low Contrast' : '✅ Good Contrast'} ({contrastInfo.ratio.toFixed(2)}:1)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label htmlFor="secondary-color" className={`text-sm ${!isManual ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'}`}>Secondary Brand Color (for gradients)</label>
                      <input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={!isManual}
                        className="p-1 h-10 w-20 rounded bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-mono text-zinc-500 uppercase">{secondaryColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-zinc-200 dark:border-zinc-700 pt-6">
                    <div className="flex justify-between items-center">
                      <label htmlFor="logo-padding" className="font-medium">Logo Padding / Zoom</label>
                      <span className="text-sm font-mono bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">{logoPadding}%</span>
                    </div>
                    <input
                      id="logo-padding"
                      type="range"
                      min="0"
                      max="50"
                      value={logoPadding}
                      onChange={(e) => setLogoPadding(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-zinc-500">Increases the whitespace around the logo in square assets.</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!logo || isGenerating}
              className="w-full py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-zinc-400 transition-all shadow-md"
            >
              {isGenerating ? 'Generating...' : 'Generate Branding Bundle'}
            </button>
          </div>
        </div>

        {assets && (
          <>
            <LoginMockup 
              backgroundUrl={assets.background || null} 
              logoUrl={assets.banner || assets.squareLight || null} 
              theme={theme}
            />
            <BrandingPreview assets={assets} currentTheme={theme} />
            <button
              onClick={handleDownloadAll}
              className="mt-8 px-8 py-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-all shadow-md"
            >
              Download All (ZIP)
            </button>
          </>
        )}
      </main>
    </div>
  );
}
