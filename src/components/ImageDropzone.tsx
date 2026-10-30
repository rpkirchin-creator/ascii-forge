import { useRef, useState, useEffect } from 'react';
import { SAMPLE_IMAGES, SampleImage } from '../utils/sampleImages';
import { CropRegion } from '../types';
import { Upload, Image as ImageIcon, Crop, RefreshCw, Sparkles, Check, Type } from 'lucide-react';

interface ImageDropzoneProps {
  currentImageUrl: string | null;
  onImageSelected: (url: string, fileInfo?: { name: string; width: number; height: number }) => void;
  onOpenCrop: () => void;
  onOpenTextOverlay?: () => void;
  cropRegion?: CropRegion;
  textOverlaysCount?: number;
}

export function ImageDropzone({
  currentImageUrl,
  onImageSelected,
  onOpenCrop,
  onOpenTextOverlay,
  cropRegion,
  textOverlaysCount = 0
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; name?: string } | null>(null);

  // Load image metadata when image URL changes
  useEffect(() => {
    if (!currentImageUrl) {
      setImageMeta(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = currentImageUrl;
  }, [currentImageUrl]);

  // Handle global paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            loadFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) {
        onImageSelected(url, { name: file.name, width: 0, height: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Main Dropzone / Current Image preview */}
      {currentImageUrl ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800">
          <div className="relative group shrink-0 w-24 h-24 sm:w-20 sm:h-20 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt="Source Thumbnail"
              className="w-full h-full object-contain"
            />
            {cropRegion && (
              <div
                className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-400 pointer-events-none"
                style={{
                  left: `${cropRegion.x}%`,
                  top: `${cropRegion.y}%`,
                  width: `${cropRegion.width}%`,
                  height: `${cropRegion.height}%`
                }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-medium text-neutral-200">Loaded Image</span>
              {cropRegion && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Cropped ({Math.round(cropRegion.width)}%×{Math.round(cropRegion.height)}%)
                </span>
              )}
            </div>
            {imageMeta && (
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Original: {imageMeta.width} × {imageMeta.height} px
              </p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1 truncate">
              Drag new file or paste (Ctrl+V) anytime
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.height;
                  canvas.height = img.width;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  ctx.translate(canvas.width / 2, canvas.height / 2);
                  ctx.rotate(Math.PI / 2);
                  ctx.drawImage(img, -img.width / 2, -img.height / 2);
                  onImageSelected(canvas.toDataURL('image/png'));
                };
                img.src = currentImageUrl;
              }}
              className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
              title="Rotate image 90° clockwise"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenCrop}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border ${
                cropRegion
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white'
              }`}
              title="Crop or select region"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{cropRegion ? 'Edit Crop' : 'Crop'}</span>
            </button>

            {onOpenTextOverlay && (
              <button
                onClick={onOpenTextOverlay}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border ${
                  textOverlaysCount > 0
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white'
                }`}
                title="Add text or captions anywhere on the image"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text{textOverlaysCount > 0 ? ` (${textOverlaysCount})` : ''}</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-700"
              title="Choose a different image"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : 'border-neutral-700 hover:border-neutral-500 bg-neutral-950/40 hover:bg-neutral-950/70'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto mb-3 text-emerald-400 border border-neutral-700">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-neutral-200">
            Click to upload or drag & drop an image
          </p>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            PNG, JPG, WEBP, SVG · Ctrl+V to paste
          </p>
        </div>
      )}

      {/* Quick Sample Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Quick Samples:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = currentImageUrl === sample.url;
            return (
              <button
                key={sample.id}
                onClick={() => onImageSelected(sample.url, { name: sample.name, width: 400, height: 400 })}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-neutral-800/70 text-neutral-300 hover:text-white hover:bg-neutral-700/80'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                <span>{sample.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
