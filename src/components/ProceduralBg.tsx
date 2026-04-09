'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

interface ProceduralBgProps {
  primaryColor: string;
  secondaryColor: string;
}

export interface ProceduralBgHandle {
  getDataUrl: () => string;
}

const ProceduralBg = forwardRef<ProceduralBgHandle, ProceduralBgProps>(
  ({ primaryColor, secondaryColor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Fill background with primary color (slightly darkened or as is)
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, width, height);

      // Draw soft blurred blobs
      const drawBlob = (color: string, x: number, y: number, radius: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Add multiple blobs for "Fluent" look
      // Blob 1: Secondary color top right
      drawBlob(secondaryColor, width * 0.8, height * 0.2, width * 0.6);
      
      // Blob 2: Primary color (lighter/vibrant) bottom left
      drawBlob(primaryColor, width * 0.2, height * 0.8, width * 0.5);
      
      // Blob 3: White/Soft light top left
      drawBlob('rgba(255, 255, 255, 0.2)', width * 0.1, height * 0.1, width * 0.4);
      
      // Blob 4: Secondary color bottom right
      drawBlob(secondaryColor, width * 0.9, height * 0.9, width * 0.3);
    };

    useEffect(() => {
      draw();
    }, [primaryColor, secondaryColor]);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL('image/png');
        }
        return '';
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ display: 'none' }}
      />
    );
  }
);

ProceduralBg.displayName = 'ProceduralBg';

export default ProceduralBg;
