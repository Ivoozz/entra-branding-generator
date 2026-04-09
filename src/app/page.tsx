'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import BrandingPreview from '@/components/BrandingPreview';

export default function Home() {
  const [logo, setLogo] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [assets, setAssets] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#000000');

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
    }

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
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 dark:bg-black p-8 font-sans">
      <main className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">Entra ID Branding Generator</h1>
        
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

            <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label htmlFor="manual-mode" className="font-medium cursor-pointer">Manual Color Override</label>
                <input
                  id="manual-mode"
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
              </div>
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
            <BrandingPreview assets={assets} />
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
