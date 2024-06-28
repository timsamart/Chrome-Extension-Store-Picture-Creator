'use client'

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ImageProcessor: React.FC = () => {
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [smallPromo, setSmallPromo] = useState<string | null>(null);
  const [marqueePromo, setMarqueePromo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = (file: File, width: number, height: number, setFunction: React.Dispatch<React.SetStateAction<string | string[] | null>>, maxFiles = 1) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = width;
        canvas.height = height;

        // Fill canvas with base color (top-left pixel)
        ctx.fillStyle = getBaseColor(img);
        ctx.fillRect(0, 0, width, height);

        // Calculate scaling factor
        const scale = Math.min(width / img.width, height / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        // Draw scaled image
        const x = (width - newWidth) / 2;
        const y = (height - newHeight) / 2;
        ctx.drawImage(img, x, y, newWidth, newHeight);

        const processedImage = canvas.toDataURL('image/jpeg', 0.95);
        setFunction((prev) => 
          maxFiles === 1 ? processedImage : [...(prev as string[]), processedImage].slice(0, maxFiles)
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getBaseColor = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'rgb(0,0,0)';
    ctx.drawImage(img, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r},${g},${b})`;
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => processImage(file, 1280, 800, setScreenshots, 5));
  };

  const handleSmallPromoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processImage(e.target.files[0], 440, 280, setSmallPromo);
  };

  const handleMarqueePromoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processImage(e.target.files[0], 1400, 560, setMarqueePromo);
  };

  const downloadImages = () => {
    if (screenshots.length === 0) {
      setError("Please upload at least one screenshot before downloading.");
      return;
    }

    screenshots.forEach((screenshot, index) => {
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `screenshot_${index + 1}.jpg`;
      link.click();
    });

    if (smallPromo) {
      const link = document.createElement('a');
      link.href = smallPromo;
      link.download = 'small_promo.jpg';
      link.click();
    }

    if (marqueePromo) {
      const link = document.createElement('a');
      link.href = marqueePromo;
      link.download = 'marquee_promo.jpg';
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game Store Image Processor</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Screenshots (Max 5)</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleScreenshotUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {screenshots.map((screenshot, index) => (
            <img key={index} src={screenshot} alt={`Screenshot ${index + 1}`} className="w-32 h-20 object-cover" />
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Small Promo Tile</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleSmallPromoUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {smallPromo && <img src={smallPromo} alt="Small Promo" className="mt-2 w-32 h-20 object-cover" />}
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Marquee Promo Tile</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleMarqueePromoUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {marqueePromo && <img src={marqueePromo} alt="Marquee Promo" className="mt-2 w-64 h-24 object-cover" />}
      </div>
      
      <button
        onClick={downloadImages}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Download Processed Images
      </button>
    </div>
  );
};

export default ImageProcessor;