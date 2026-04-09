'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import JSZip from 'jszip';
import { Sun, Moon, Image as ImageIcon, Layers, Palette, Save, CheckCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import BrandingPreview from '@/components/BrandingPreview';
import LoginMockup from '@/components/LoginMockup';
import PreFlightCheck from '@/components/PreFlightCheck';
import ProceduralBg, { ProceduralBgHandle } from '@/components/ProceduralBg';
import { getContrastRatio, getContrastRating } from '@/lib/accessibility';
import { generateStyleGuide } from '@/lib/style-guide';
import { db, Project } from '@/lib/db';
import { SharePointGenerator } from '@/components/SharePointGenerator';
import { TeamsGenerator } from '@/components/TeamsGenerator';

function GeneratorApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');

  const [logo, setLogo] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [assets, setAssets] = useState<Record<string, string> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#0078d4');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [bgMode, setBgMode] = useState<'solid' | 'gradient' | 'procedural'>('solid');
  const [logoPadding, setLogoPadding] = useState(0);
  const [logoVariant, setLogoVariant] = useState<'original' | 'white' | 'black'>('original');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [projectName, setProjectName] = useState('Default Project');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [optimize, setOptimize] = useState(false);
  const [toolMode, setToolMode] = useState<'entra' | 'sharepoint' | 'teams'>('entra');

  const proceduralBgRef = useRef<ProceduralBgHandle>(null);

  // Initialize Default Project if none exists
  useEffect(() => {
    const initDb = async () => {
      try {
        const count = await db.projects.count();
        if (count === 0) {
          const id = Math.random().toString(36).substring(2, 15);
          const defaultProject: Project = {
            id,
            name: 'Default Project',
            colors: { primary: '#0078d4', secondary: '#000000' },
            logoPadding: 0,
            bgMode: 'solid',
            logoVariant: 'original',
            updatedAt: Date.now(),
          };
          await db.projects.add(defaultProject);
          router.push(`/?project=${id}`);
        } else if (!projectId) {
          const latest = await db.projects.orderBy('updatedAt').reverse().first();
          if (latest) {
            router.push(`/?project=${latest.id}`);
          }
        }
      } catch (err) {
        console.error('Failed to initialize DB:', err);
      }
    };
    initDb();
  }, [projectId, router]);

  // Load project when ID changes
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      const project = await db.projects.get(projectId);
      if (project) {
        setProjectName(project.name);
        setPrimaryColor(project.colors.primary);
        setSecondaryColor(project.colors.secondary || '#000000');
        setLogoPadding(project.logoPadding);
        setBgMode(project.bgMode);
        setLogoVariant(project.logoVariant);
        if (project.logoSource) {
          setLogoDataUrl(project.logoSource);
          // Convert data URL back to File for generation if needed
          const res = await fetch(project.logoSource);
          const blob = await res.blob();
          setLogo(new File([blob], 'logo.png', { type: blob.type }));
        } else {
          setLogo(null);
          setLogoDataUrl(null);
        }
      }
    };
    loadProject();
  }, [projectId]);

  // Auto-save on changes
  useEffect(() => {
    if (!projectId) return;

    const saveProject = async () => {
      setSaveStatus('saving');
      await db.projects.update(projectId, {
        name: projectName,
        colors: { primary: primaryColor, secondary: secondaryColor },
        logoPadding,
        bgMode,
        logoVariant,
        logoSource: logoDataUrl || undefined,
        updatedAt: Date.now(),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const debounceTimer = setTimeout(saveProject, 1000);
    return () => clearTimeout(debounceTimer);
  }, [projectId, projectName, primaryColor, secondaryColor, logoPadding, bgMode, logoVariant, logoDataUrl]);

  const contrastInfo = useMemo(() => {
    const ratio = getContrastRatio(primaryColor, '#FFFFFF');
    const rating = getContrastRating(ratio);
    return { ratio, rating };
  }, [primaryColor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlFetch = async () => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'logo.png', { type: blob.type });
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to fetch image from URL', error);
    }
  };

  const handleGenerate = async (shouldOptimize = false) => {
    if (!logo) return;
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('logo', logo);
    
    if (isManual) {
      formData.append('primary', primaryColor);
      formData.append('secondary', secondaryColor);
    }
    
    formData.append('logoPadding', logoPadding.toString());
    formData.append('monochrome', logoVariant);
    formData.append('optimize', (optimize || shouldOptimize).toString());

    if (bgMode === 'procedural' && proceduralBgRef.current) {
      const customBackground = proceduralBgRef.current.getDataUrl();
      formData.append('customBackground', customBackground);
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

  const handleDownloadStyleGuide = async () => {
    if (!assets) return;
    const logoUrl = logo ? URL.createObjectURL(logo) : null;
    await generateStyleGuide({
      logoUrl,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
      },
      contrastRatio: contrastInfo,
      assets,
    });
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  };

  return (
    <div className="flex flex-col min-h-screen items-center p-8 font-sans transition-colors duration-300">
      <ProceduralBg 
        ref={proceduralBgRef}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
      <main className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex justify-between w-full items-center mb-8">
          <div className="flex flex-col">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2 -ml-2 transition-all cursor-text"
            />
            <div className="flex items-center gap-2 mt-1 px-2">
              {saveStatus === 'saving' ? (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Save className="w-3 h-3 animate-spin" /> Saving changes...
                </span>
              ) : saveStatus === 'saved' ? (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Saved to vault
                </span>
              ) : (
                <span className="text-xs text-zinc-400 italic">Project synced locally</span>
              )}
            </div>
          </div>
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

        <div className="w-full flex border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto scrollbar-hide">
          {(['entra', 'sharepoint', 'teams'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setToolMode(mode)}
              className={`px-8 py-4 font-bold capitalize transition-all border-b-4 shrink-0 ${
                toolMode === mode 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {mode === 'entra' ? 'Entra ID' : mode}
            </button>
          ))}
        </div>
        
        {toolMode === 'entra' ? (
          <>
            <div className="w-full p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mb-8">
              <div className="flex flex-col gap-6">
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-12 text-center hover:border-blue-500 transition-colors relative overflow-hidden group">
                  {logoDataUrl && (
                    <img src={logoDataUrl} alt="Logo" className="absolute inset-0 w-full h-full object-contain opacity-10 group-hover:opacity-20 transition-opacity" />
                  )}
                  <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept="image/*" />
                  <label htmlFor="file-upload" className="cursor-pointer relative z-10">
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
                        <label className="font-medium">Background Style</label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => setBgMode('solid')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                              bgMode === 'solid' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            <Palette className="w-5 h-5" />
                            <span className="text-xs font-medium">Solid</span>
                          </button>
                          <button
                            onClick={() => setBgMode('gradient')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                              bgMode === 'gradient' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            <Layers className="w-5 h-5" />
                            <span className="text-xs font-medium">Gradient</span>
                          </button>
                          <button
                            onClick={() => setBgMode('procedural')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                              bgMode === 'procedural' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-xs font-medium">Procedural</span>
                          </button>
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

                      <div className="flex flex-col gap-4 border-t border-zinc-200 dark:border-zinc-700 pt-6">
                        <label className="font-medium text-sm text-zinc-600 dark:text-zinc-300">Logo Style Variant</label>
                        <div className="flex gap-2">
                          {(['original', 'white', 'black'] as const).map((variant) => (
                            <button
                              key={variant}
                              onClick={() => setLogoVariant(variant)}
                              className={`flex-1 py-2 px-4 rounded-md border text-sm capitalize transition-all ${
                                logoVariant === variant
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {variant}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={!logo || isGenerating}
                  className="w-full py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-zinc-400 transition-all shadow-md"
                >
                  {isGenerating ? 'Generating...' : 'Generate Branding Bundle'}
                </button>
              </div>
            </div>

            {assets && (
              <>
                <PreFlightCheck 
                  assets={assets} 
                  onOptimize={() => {
                    setOptimize(true);
                    handleGenerate(true);
                  }} 
                />
                <LoginMockup 
                  backgroundUrl={assets.background || null} 
                  logoUrl={assets.banner || assets.squareLight || null} 
                  theme={theme}
                />
                <BrandingPreview assets={assets} currentTheme={theme} />
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleDownloadAll}
                    className="px-8 py-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-all shadow-md"
                  >
                    Download All (ZIP)
                  </button>
                  <button
                    onClick={handleDownloadStyleGuide}
                    className="px-8 py-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-all shadow-md"
                  >
                    Download Style Guide (PDF)
                  </button>
                </div>
              </>
            )}
          </>
        ) : toolMode === 'sharepoint' ? (
          <div className="w-full">
            <SharePointGenerator primaryColor={primaryColor} />
          </div>
        ) : (
          <div className="w-full">
            <TeamsGenerator assets={assets || {}} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-bold text-xl animate-pulse">Loading Entra ID Branding Generator...</div>}>
      <GeneratorApp />
    </Suspense>
  );
}
