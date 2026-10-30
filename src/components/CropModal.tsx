import { useState, useRef, useEffect, useCallback } from 'react';
import { CropRegion } from '../types';
import { Check, X, RotateCcw, Crop, Maximize2 } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialCrop?: CropRegion;
  onApplyCrop: (crop: CropRegion | undefined) => void;
}

type AspectPreset = 'free' | '1:1' | '4:3' | '16:9' | 'terminal';

export function CropModal({ isOpen, onClose, imageUrl, initialCrop, onApplyCrop }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop region stored as percentages (0 to 100)
  const [crop, setCrop] = useState<CropRegion>(
    initialCrop || { x: 0, y: 0, width: 100, height: 100 }
  );

  const [aspectRatio, setAspectRatio] = useState<AspectPreset>('free');
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startCrop: CropRegion } | null>(null);

  // Sync initialCrop when modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop(initialCrop || { x: 0, y: 0, width: 100, height: 100 });
    }
  }, [isOpen, initialCrop]);

  const handleApplyPreset = (preset: AspectPreset) => {
    setAspectRatio(preset);
    if (preset === 'free') return;

    let targetRatio = 1;
    if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;
    else if (preset === 'terminal') targetRatio = 80 / (24 / 0.52); // ~1.73

    const img = imgRef.current;
    if (!img) return;

    const imgAspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    // Adjusted ratio in % terms
    const relativeRatio = targetRatio / imgAspect;

    let newW = 80;
    let newH = newW / relativeRatio;

    if (newH > 90) {
      newH = 80;
      newW = newH * relativeRatio;
    }

    newW = Math.min(100, Math.max(10, newW));
    newH = Math.min(100, Math.max(10, newH));

    setCrop({
      x: Math.max(0, (100 - newW) / 2),
      y: Math.max(0, (100 - newH) / 2),
      width: newW,
      height: newH
    });
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(handle);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startCrop: { ...crop }
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeHandle || !dragStartRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dxPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
    const dyPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;
    const { startCrop } = dragStartRef.current;

    let next = { ...crop };

    if (activeHandle === 'move') {
      let nextX = startCrop.x + dxPercent;
      let nextY = startCrop.y + dyPercent;
      nextX = Math.max(0, Math.min(100 - startCrop.width, nextX));
      nextY = Math.max(0, Math.min(100 - startCrop.height, nextY));
      next.x = nextX;
      next.y = nextY;
    } else if (activeHandle === 'se') {
      let nextW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + dxPercent));
      let nextH = Math.max(10, Math.min(100 - startCrop.y, startCrop.height + dyPercent));
      next.width = nextW;
      next.height = nextH;
    } else if (activeHandle === 'nw') {
      let nextX = Math.min(startCrop.x + startCrop.width - 10, Math.max(0, startCrop.x + dxPercent));
      let nextY = Math.min(startCrop.y + startCrop.height - 10, Math.max(0, startCrop.y + dyPercent));
      next.width = startCrop.width + (startCrop.x - nextX);
      next.height = startCrop.height + (startCrop.y - nextY);
      next.x = nextX;
      next.y = nextY;
    } else if (activeHandle === 'ne') {
      let nextY = Math.min(startCrop.y + startCrop.height - 10, Math.max(0, startCrop.y + dyPercent));
      let nextW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + dxPercent));
      next.width = nextW;
      next.height = startCrop.height + (startCrop.y - nextY);
      next.y = nextY;
    } else if (activeHandle === 'sw') {
      let nextX = Math.min(startCrop.x + startCrop.width - 10, Math.max(0, startCrop.x + dxPercent));
      let nextH = Math.max(10, Math.min(100 - startCrop.y, startCrop.height + dyPercent));
      next.width = startCrop.width + (startCrop.x - nextX);
      next.height = nextH;
      next.x = nextX;
    }

    setCrop(next);
  }, [activeHandle, crop]);

  const handleMouseUp = useCallback(() => {
    setActiveHandle(null);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeHandle, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  const isFullImage = crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Crop className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-neutral-100">Crop & Region Selection</h2>
            <span className="text-xs text-neutral-400 font-mono">
              {Math.round(crop.width)}% × {Math.round(crop.height)}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-6 py-2.5 bg-neutral-950/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Aspect Ratio:</span>
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              {(['free', '1:1', '4:3', '16:9', 'terminal'] as AspectPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    aspectRatio === preset
                      ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preset === 'terminal' ? '80×24 Term' : preset}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setCrop({ x: 0, y: 0, width: 100, height: 100 });
              setAspectRatio('free');
            }}
            disabled={isFullImage}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
              isFullImage
                ? 'opacity-40 text-neutral-500 cursor-not-allowed'
                : 'text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (Full Image)</span>
          </button>
        </div>

        {/* Image Viewport with interactive Crop overlay */}
        <div className="flex-1 bg-neutral-950 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
          <div
            ref={containerRef}
            className="relative select-none max-w-full max-h-[50vh] flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop Source"
              className="max-h-[50vh] max-w-full w-auto object-contain block rounded pointer-events-none"
              draggable={false}
            />

            {/* Dark Mask Outer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, 0.65)`
              }}
            />

            {/* Active Crop Box */}
            <div
              className="absolute border-2 border-emerald-400 shadow-lg cursor-move bg-emerald-500/10"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              {/* Rule of Thirds Grid Guidelines */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-emerald-400/30" />
                <div className="border-r border-b border-emerald-400/30" />
                <div className="border-b border-emerald-400/30" />
                <div className="border-r border-b border-emerald-400/30" />
                <div className="border-r border-b border-emerald-400/30" />
                <div className="border-b border-emerald-400/30" />
                <div className="border-r border-emerald-400/30" />
                <div className="border-r border-emerald-400/30" />
                <div />
              </div>

              {/* Corner Handles */}
              <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-neutral-950 rounded-sm cursor-nwse-resize shadow-md"
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
              />
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-neutral-950 rounded-sm cursor-nesw-resize shadow-md"
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
              />
              <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-400 border-2 border-neutral-950 rounded-sm cursor-nesw-resize shadow-md"
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
              />
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-400 border-2 border-neutral-950 rounded-sm cursor-nwse-resize shadow-md"
                onMouseDown={(e) => handleMouseDown(e, 'se')}
              />

              {/* Center Drag Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900/80 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 pointer-events-none border border-emerald-500/40 whitespace-nowrap">
                Drag to Reposition
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
          <p className="text-xs text-neutral-400 hidden sm:block">
            Drag the green box or corners to select your conversion region.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyCrop(isFullImage ? undefined : crop);
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors font-semibold"
            >
              <Check className="w-4 h-4" />
              <span>Apply Region</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
