import { useState, useMemo, useRef } from 'react';
import { AsciiResult, AsciiConfig } from '../types';
import { downloadFile, downloadDataUrl, renderAsciiToImage } from '../utils/asciiConverter';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Terminal,
  Columns,
  Share2,
  FileCode,
  FileText,
  Download,
  Eye,
  Type
} from 'lucide-react';

interface AsciiPreviewProps {
  result: AsciiResult | null;
  config: AsciiConfig;
  sourceImageUrl: string | null;
  isProcessing: boolean;
  onOpenExport: () => void;
  onChangeConfig: (updater: (prev: AsciiConfig) => AsciiConfig) => void;
}

type ViewMode = 'terminal' | 'raw' | 'split';

export function AsciiPreview({
  result,
  config,
  sourceImageUrl,
  isProcessing,
  onOpenExport,
  onChangeConfig
}: AsciiPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('terminal');
  const [zoom, setZoom] = useState(100);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Optimize DOM nodes: combine consecutive characters with identical colors into a single span
  const optimizedLines = useMemo(() => {
    if (!result) return [];

    return result.lines.map((line) => {
      const spans: { text: string; color: string }[] = [];
      let curText = '';
      let curColor = '';

      for (let i = 0; i < line.length; i++) {
        const cell = line[i];
        if (i === 0) {
          curText = cell.char;
          curColor = cell.hex;
        } else if (cell.hex === curColor) {
          curText += cell.char;
        } else {
          spans.push({ text: curText, color: curColor });
          curText = cell.char;
          curColor = cell.hex;
        }
      }

      if (curText) {
        spans.push({ text: curText, color: curColor });
      }

      return spans;
    });
  }, [result]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[520px]">
      {/* Top Preview Control Bar */}
      <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'terminal'
                  ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Linux Terminal</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'raw'
                  ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Art</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>

        {/* Center / Controls: Font Size & Zoom */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          {/* Font Size */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-neutral-400" />
            <span>Font:</span>
            <input
              type="range"
              min={6}
              max={16}
              step={0.5}
              value={config.fontSize}
              onChange={(e) => onChangeConfig(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
              className="w-16 accent-emerald-400 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
            />
            <span className="font-mono text-[11px] text-neutral-300">{config.fontSize}px</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(z => Math.max(40, z - 15))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-neutral-300 w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(250, z + 15))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-1.5 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
          </div>
        </div>

        {/* Right: Quick Copy & 1-Click Save / Export */}
        <div className="flex items-center gap-2">
          {result && (
            <>
              {/* 1-Click Download .txt */}
              <button
                onClick={() => {
                  downloadFile(result.text, `ascii-art-${result.width}x${result.height}.txt`);
                  setCopiedKey('dl_txt');
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                title="Save as plain text (.txt) file"
              >
                {copiedKey === 'dl_txt' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-neutral-300" />
                )}
                <span>.txt</span>
              </button>

              {/* 1-Click Download .png */}
              <button
                onClick={async () => {
                  setCopiedKey('dl_png');
                  try {
                    const dataUrl = await renderAsciiToImage(result, config, { scale: 2 });
                    downloadDataUrl(dataUrl, `ascii-art-${result.width}x${result.height}.png`);
                  } catch (err) {
                    console.error('Failed to download PNG', err);
                  } finally {
                    setTimeout(() => setCopiedKey(null), 2000);
                  }
                }}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                title="Save as image (.png) file"
              >
                {copiedKey === 'dl_png' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>.png</span>
              </button>

              {/* Copy Plain Text */}
              <button
                onClick={() => handleCopy(result.text, 'text')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium hidden md:flex items-center gap-1.5 transition-colors border border-neutral-700"
                title="Copy clean plain text ASCII to clipboard"
              >
                {copiedKey === 'text' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>

              {/* Full Export Hub */}
              <button
                onClick={onOpenExport}
                className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                title="Open Export Hub (Full PNG options, Bash scripts, ANSI art)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export...</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        className="flex-1 bg-neutral-950 p-4 sm:p-6 overflow-auto flex items-center justify-center relative min-h-[440px]"
        style={{ backgroundColor: config.backgroundColor || '#0a0a0f' }}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-neutral-300 font-mono">Rendering ASCII conversion...</p>
          </div>
        )}

        {!result ? (
          <div className="text-center text-neutral-500 py-16">
            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-400" />
            <p className="text-sm font-medium text-neutral-300">No Image Loaded</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Upload an image, drag & drop a file, or pick a sample from above to generate your ASCII art.
            </p>
          </div>
        ) : viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl h-full items-start">
            {/* Original / Source */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex flex-col items-center">
              <span className="text-[11px] font-mono text-neutral-400 mb-2 self-start">Source Image</span>
              {sourceImageUrl && (
                <img
                  src={sourceImageUrl}
                  alt="Original"
                  className="max-h-[380px] w-auto object-contain rounded"
                />
              )}
            </div>

            {/* ASCII Output */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 overflow-auto max-h-[460px]">
              <span className="text-[11px] font-mono text-neutral-400 mb-2 block">
                ASCII Art ({result.width} × {result.height})
              </span>
              <pre
                className="font-mono leading-none select-all overflow-x-auto"
                style={{
                  fontSize: `${config.fontSize * (zoom / 100)}px`,
                  lineHeight: config.lineHeight,
                  letterSpacing: `${config.letterSpacing}px`
                }}
              >
                {optimizedLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="whitespace-pre">
                    {line.map((span, sIdx) => (
                      <span key={sIdx} style={{ color: span.color }}>
                        {span.text}
                      </span>
                    ))}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        ) : viewMode === 'terminal' ? (
          /* Linux Terminal Window Frame */
          <div
            className="w-full max-w-4xl shadow-2xl rounded-xl border border-neutral-800 overflow-hidden transition-transform"
            style={{
              backgroundColor: '#181825',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Linux Window Header / GNOME Titlebar */}
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Traffic lights / Close, Min, Max */}
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/90" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/90" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/90" />
                </div>
                <span className="text-xs font-mono text-neutral-300 font-medium">
                  bash — user@linux: ~/art
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-400">
                {result.width}x{result.height}
              </div>
            </div>

            {/* Terminal Inner Console */}
            <div className="p-4 sm:p-6 overflow-auto max-h-[600px] font-mono">
              {/* Shell prompt command */}
              <div className="text-xs font-mono text-neutral-400 mb-3 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">user@linux:~$</span>
                <span className="text-neutral-200">cat ascii-artwork.txt</span>
              </div>

              {/* Monospace ASCII Art Lines */}
              <pre
                className="font-mono leading-none select-all"
                style={{
                  fontSize: `${config.fontSize}px`,
                  lineHeight: config.lineHeight,
                  letterSpacing: `${config.letterSpacing}px`
                }}
              >
                {optimizedLines.map((line, lineIdx) => (
                  <div key={lineIdx} className="whitespace-pre">
                    {line.map((span, sIdx) => (
                      <span key={sIdx} style={{ color: span.color }}>
                        {span.text}
                      </span>
                    ))}
                  </div>
                ))}
              </pre>

              {/* Trailing shell prompt */}
              <div className="text-xs font-mono text-neutral-400 mt-4 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">user@linux:~$</span>
                <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          /* Raw Art View (Direct Canvas Output) */
          <div
            className="transition-transform overflow-auto max-w-full max-h-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <pre
              className="font-mono leading-none select-all"
              style={{
                fontSize: `${config.fontSize}px`,
                lineHeight: config.lineHeight,
                letterSpacing: `${config.letterSpacing}px`
              }}
            >
              {optimizedLines.map((line, lineIdx) => (
                <div key={lineIdx} className="whitespace-pre">
                  {line.map((span, sIdx) => (
                    <span key={sIdx} style={{ color: span.color }}>
                      {span.text}
                    </span>
                  ))}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      {result && (
        <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Characters: <span className="text-neutral-200 font-semibold">{result.width * result.height}</span>
            </span>
            <span>·</span>
            <span>
              Grid: <span className="text-neutral-200">{result.width} cols × {result.height} rows</span>
            </span>
            <span>·</span>
            <span className="capitalize text-emerald-400">
              {config.colorMode === 'image' ? 'Truecolor RGB' : config.colorMode}
            </span>
          </div>

          <div className="text-neutral-500">
            Press <kbd className="px-1 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">Ctrl+V</kbd> anywhere to paste a new image
          </div>
        </div>
      )}
    </div>
  );
}
