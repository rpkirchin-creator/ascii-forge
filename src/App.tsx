/**
 * ASCII Studio - Linux Image to ASCII Converter
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AsciiConfig, AsciiResult, CropRegion } from './types';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { PRESET_CONFIGS } from './utils/constants';
import { convertImageToAscii } from './utils/asciiConverter';
import { HeaderBar } from './components/HeaderBar';
import { ImageDropzone } from './components/ImageDropzone';
import { ControlsPanel } from './components/ControlsPanel';
import { AsciiPreview } from './components/AsciiPreview';
import { CropModal } from './components/CropModal';
import { ExportModal } from './components/ExportModal';
import { LinuxGuideModal } from './components/LinuxGuideModal';
import { TextOverlayModal } from './components/TextOverlayModal';

const DEFAULT_CONFIG: AsciiConfig = {
  width: 80,
  height: 40,
  lockAspectRatio: true,
  charAspectRatio: 0.52,

  charsetKey: 'standard',
  customCharset: '@%#*+=-:. ',
  invertChars: false,

  colorMode: 'image',
  paletteId: 'linux-term',
  monoColor: '#34d399',
  backgroundColor: '#121216',

  brightness: 0,
  contrast: 15,
  gamma: 1.05,
  dither: 'floyd-steinberg',
  edgeDetection: false,
  edgeThreshold: 30,

  fontSize: 9,
  lineHeight: 1.0,
  letterSpacing: 0,
  terminalTheme: 'linux-dark'
};

export default function App() {
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGES[0].url); // Tux by default
  const [cropRegion, setCropRegion] = useState<CropRegion | undefined>(undefined);
  const [config, setConfig] = useState<AsciiConfig>(DEFAULT_CONFIG);
  const [activePresetId, setActivePresetId] = useState<string>('detailed-hd');

  const [result, setResult] = useState<AsciiResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [computedRows, setComputedRows] = useState(40);

  // Modals
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLinuxGuideOpen, setIsLinuxGuideOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  // Cached image element
  const cachedImgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Load and cache HTMLImageElement
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedImgRef.current = img;
      triggerConversion();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Trigger conversion with debouncing
  const triggerConversion = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      const img = cachedImgRef.current;
      if (!img) return;

      setIsProcessing(true);
      try {
        const asciiResult = await convertImageToAscii(img, config, cropRegion);
        setResult(asciiResult);
        setComputedRows(asciiResult.height);
      } catch (err) {
        console.error('Error during ASCII conversion', err);
      } finally {
        setIsProcessing(false);
      }
    }, 40); // 40ms debounce gives 25+ fps smooth dragging for sliders
  }, [config, cropRegion]);

  // Re-run conversion when config or crop changes
  useEffect(() => {
    if (cachedImgRef.current) {
      triggerConversion();
    }
  }, [config, cropRegion, triggerConversion]);

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_CONFIGS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setConfig(prev => ({
      ...prev,
      ...preset.config
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 3-Zone Header Bar */}
      <HeaderBar
        onOpenExport={() => setIsExportOpen(true)}
        onOpenLinuxGuide={() => setIsLinuxGuideOpen(true)}
        hasResult={!!result}
        onApplyPreset={handleApplyPreset}
        activePresetId={activePresetId}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-(--breakpoint-2xl) w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Column (Upload & Settings) - 4 Cols on Large Screens */}
        <section className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Image Dropzone & Sample Picker */}
          <ImageDropzone
            currentImageUrl={imageUrl}
            onImageSelected={(url) => {
              setImageUrl(url);
              setCropRegion(undefined); // reset crop for new image
            }}
            onOpenCrop={() => setIsCropOpen(true)}
            onOpenTextOverlay={() => setIsTextModalOpen(true)}
            cropRegion={cropRegion}
            textOverlaysCount={config.textOverlays?.filter(t => t.enabled).length || 0}
          />

          {/* Full Controls: Dimensions, Charset, Colors, Dithering */}
          <ControlsPanel
            config={config}
            onChangeConfig={setConfig}
            cropRegion={cropRegion}
            onOpenCrop={() => setIsCropOpen(true)}
            onResetCrop={() => setCropRegion(undefined)}
            onOpenTextOverlay={() => setIsTextModalOpen(true)}
            computedRows={computedRows}
          />
        </section>

        {/* Right Output Column (Preview & Terminal Simulation) - 7/8 Cols */}
        <section className="lg:col-span-7 xl:col-span-8 h-full">
          <AsciiPreview
            result={result}
            config={config}
            sourceImageUrl={imageUrl}
            isProcessing={isProcessing}
            onOpenExport={() => setIsExportOpen(true)}
            onChangeConfig={setConfig}
          />
        </section>
      </main>

      {/* Interactive Crop Modal */}
      <CropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        imageUrl={imageUrl}
        initialCrop={cropRegion}
        onApplyCrop={(newCrop) => setCropRegion(newCrop)}
      />

      {/* Text Overlay Modal (Add text anywhere on image) */}
      <TextOverlayModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        imageUrl={imageUrl}
        overlays={config.textOverlays || []}
        onSaveOverlays={(overlays) => setConfig(prev => ({ ...prev, textOverlays: overlays }))}
      />

      {/* Linux Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        result={result}
        config={config}
      />

      {/* Linux Setup & Execution Guide Modal */}
      <LinuxGuideModal
        isOpen={isLinuxGuideOpen}
        onClose={() => setIsLinuxGuideOpen(false)}
      />
    </div>
  );
}
