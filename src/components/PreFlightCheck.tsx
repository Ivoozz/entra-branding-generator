'use client';

import React, { useEffect, useState } from 'react';
import { ASSET_SPECS } from '@/lib/types';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface PreFlightCheckProps {
  assets: Record<string, string>;
  onOptimize: () => void;
}

interface ValidationResult {
  name: string;
  width: number;
  height: number;
  sizeKB: number;
  isValid: boolean;
  errors: string[];
}

export default function PreFlightCheck({ assets, onOptimize }: PreFlightCheckProps) {
  const [results, setResults] = useState<Record<string, ValidationResult>>({});

  useEffect(() => {
    const validate = async () => {
      const newResults: Record<string, ValidationResult> = {};
      
      for (const [key, dataUrl] of Object.entries(assets)) {
        const spec = ASSET_SPECS[key];
        if (!spec) continue;

        // Calculate size from base64
        const base64Content = dataUrl.split(',')[1];
        const sizeInBytes = Math.floor(base64Content.length * (3 / 4)) - (base64Content.endsWith('==') ? 2 : base64Content.endsWith('=') ? 1 : 0);
        const sizeKB = sizeInBytes / 1024;

        // Calculate dimensions
        const dimensions = await new Promise<{w: number, h: number}>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.width, h: img.height });
          img.src = dataUrl;
        });

        const errors: string[] = [];
        if (dimensions.w !== spec.width || dimensions.h !== spec.height) {
          errors.push(`Dimensions mismatch: Expected ${spec.width}x${spec.height}, got ${dimensions.w}x${dimensions.h}`);
        }
        if (sizeKB > spec.maxSizeKB) {
          errors.push(`File size exceeds limit: ${sizeKB.toFixed(1)}KB > ${spec.maxSizeKB}KB`);
        }

        newResults[key] = {
          name: spec.name,
          width: dimensions.w,
          height: dimensions.h,
          sizeKB,
          isValid: errors.length === 0,
          errors
        };
      }
      setResults(newResults);
    };

    validate();
  }, [assets]);

  const hasErrors = Object.values(results).some(r => !r.isValid);

  if (Object.keys(results).length === 0) return null;

  return (
    <div className="w-full mt-8 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> Pre-Flight Validation
        </h3>
        {hasErrors && (
          <button
            onClick={onOptimize}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm font-bold transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" /> Optimize Assets
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${
            result.isValid 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
          }`}>
            <div className="mt-1">
              {result.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{result.name}</span>
                <span className={`text-xs font-mono ${result.sizeKB > ASSET_SPECS[key].maxSizeKB ? 'text-red-600 font-bold' : 'text-zinc-500'}`}>
                  {result.sizeKB.toFixed(1)} KB
                </span>
              </div>
              <div className="text-xs text-zinc-500 mb-1">
                {result.width}x{result.height}px
              </div>
              {result.errors.map((error, i) => (
                <p key={i} className="text-[10px] leading-tight text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
