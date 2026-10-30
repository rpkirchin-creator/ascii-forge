import { useState } from 'react';
import { AsciiConfig, PredefinedCharsetKey, ColorMode, DitherMethod, CropRegion } from '../types';
import { PREDEFINED_CHARSETS, CURATED_PALETTES } from '../utils/constants';
import { Sliders, Palette, Type, Maximize, Crop, RotateCcw, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface ControlsPanelProps {
  config: AsciiConfig;
  onChangeConfig: (updater: (prev: AsciiConfig) => AsciiConfig) => void;
  cropRegion?: CropRegion;
  onOpenCrop: () => void;
  onResetCrop: () => void;
  computedRows: number;
  onOpenTextOverlay?: () => void;
}

export function ControlsPanel({
  config,
  onChangeConfig,
  cropRegion,
  onOpenCrop,
  onResetCrop,
  computedRows,
  onOpenTextOverlay
}: ControlsPanelProps) {
  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    dimensions: true,
    charset: true,
    color: true,
    tuning: true
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = <K extends keyof AsciiConfig>(key: K, value: AsciiConfig[K]) => {
    onChangeConfig(prev => ({ ...prev, [key]: value }));
  };

  const activeCharsetObj = PREDEFINED_CHARSETS.find(c => c.id === config.charsetKey);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800 flex flex-col">
      {/* 1. Dimensions & Resizing */}
      <div>
        <button
          onClick={() => toggleSection('dimensions')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Maximize className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-200">Dimensions & Scaling</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">
              {config.width} × {config.lockAspectRatio ? computedRows : config.height}
            </span>
            {openSections.dimensions ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.dimensions && (
          <div className="p-4 pt-1 space-y-4 text-xs">
            {/* Columns (Width) */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1.5">
                <span className="font-medium">Width (Columns):</span>
                <span className="font-mono text-emerald-400 font-semibold">{config.width} cols</span>
              </div>
              <input
                type="range"
                min={24}
                max={220}
                step={2}
                value={config.width}
                onChange={(e) => handleUpdate('width', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>40 (Compact)</span>
                <span>80 (Linux Bash)</span>
                <span>120 (Standard)</span>
                <span>180+ (HD)</span>
              </div>
            </div>

            {/* Rows / Aspect Lock */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div>
                <span className="text-neutral-300 font-medium block">Lock Aspect Ratio</span>
                <span className="text-[11px] text-neutral-500">Compensates for terminal character height</span>
              </div>
              <input
                type="checkbox"
                checked={config.lockAspectRatio}
                onChange={(e) => handleUpdate('lockAspectRatio', e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-neutral-800 cursor-pointer"
              />
            </div>

            {!config.lockAspectRatio && (
              <div>
                <div className="flex items-center justify-between text-neutral-300 mb-1.5">
                  <span className="font-medium">Height (Rows):</span>
                  <span className="font-mono text-emerald-400 font-semibold">{config.height} rows</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={1}
                  value={config.height}
                  onChange={(e) => handleUpdate('height', Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>
            )}

            {/* Character Aspect Correction */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1.5">
                <span className="text-[11px] text-neutral-400">Char Aspect Ratio:</span>
                <span className="font-mono text-[11px] text-neutral-300">{config.charAspectRatio.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.40}
                max={0.70}
                step={0.01}
                value={config.charAspectRatio}
                onChange={(e) => handleUpdate('charAspectRatio', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-neutral-500">Fine-tune vertical stretch for your terminal font</span>
            </div>

            {/* Region / Crop Action */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-300">Image Region:</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {cropRegion ? `${Math.round(cropRegion.width)}% × ${Math.round(cropRegion.height)}%` : 'Full'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {cropRegion && (
                  <button
                    onClick={onResetCrop}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200"
                    title="Reset to full image"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onOpenCrop}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  {cropRegion ? 'Modify' : 'Select Crop'}
                </button>
              </div>
            </div>

            {/* Text on Image Action */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-300">Text on Image:</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {config.textOverlays && config.textOverlays.length > 0
                    ? `${config.textOverlays.filter(t => t.enabled).length} layer(s)`
                    : 'None'}
                </span>
              </div>
              {onOpenTextOverlay && (
                <button
                  onClick={onOpenTextOverlay}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
                >
                  {config.textOverlays && config.textOverlays.length > 0 ? 'Edit Text' : '+ Add Text'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Character Sets */}
      <div>
        <button
          onClick={() => toggleSection('charset')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-200">Character Set</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 capitalize">
              {config.charsetKey === 'custom' ? 'Custom' : activeCharsetObj?.name.split(' (')[0] || config.charsetKey}
            </span>
            {openSections.charset ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.charset && (
          <div className="p-4 pt-1 space-y-3 text-xs">
            {/* Predefined Dropdown */}
            <div>
              <label className="block text-neutral-400 mb-1 text-[11px]">Select Preset Set:</label>
              <select
                value={config.charsetKey}
                onChange={(e) => handleUpdate('charsetKey', e.target.value as PredefinedCharsetKey)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-emerald-400 cursor-pointer"
              >
                {PREDEFINED_CHARSETS.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.name} — {cs.description}
                  </option>
                ))}
                <option value="custom">Custom Defined Character Set</option>
              </select>
            </div>

            {/* Custom Character Set Input */}
            {config.charsetKey === 'custom' ? (
              <div className="space-y-1.5 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-300 font-medium">Your Custom Characters:</span>
                  <span className="text-neutral-500 font-mono">
                    {config.customCharset.length} glyphs
                  </span>
                </div>
                <input
                  type="text"
                  value={config.customCharset}
                  onChange={(e) => handleUpdate('customCharset', e.target.value)}
                  placeholder="e.g. @%#*+=-:. "
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-emerald-400"
                />
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Ordered from densest/darkest to lightest/empty space.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-neutral-950/70 rounded border border-neutral-800/80">
                <div className="text-[10px] text-neutral-400 mb-1">Active Glyph Ramp:</div>
                <div className="font-mono text-neutral-300 text-xs truncate bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                  {activeCharsetObj?.characters}
                </div>
              </div>
            )}

            {/* Invert Ramp */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-neutral-300 font-medium">Invert Character Luminance</span>
                <span className="text-[11px] text-neutral-500 block">Swap dark & light character mapping</span>
              </div>
              <input
                type="checkbox"
                checked={config.invertChars}
                onChange={(e) => handleUpdate('invertChars', e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-neutral-800 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Color & Palettes */}
      <div>
        <button
          onClick={() => toggleSection('color')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-200">Color & Palette</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 capitalize">
              {config.colorMode === 'image'
                ? 'Truecolor RGB'
                : config.colorMode === 'ansi16'
                ? 'ANSI 16-Col'
                : config.colorMode === 'palette'
                ? 'Curated Palette'
                : 'Monochrome'}
            </span>
            {openSections.color ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.color && (
          <div className="p-4 pt-1 space-y-3.5 text-xs">
            {/* Color Mode Selector */}
            <div>
              <label className="block text-neutral-400 mb-1.5 text-[11px]">Color Mode:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'image', label: 'Image Truecolor', desc: 'RGB from photo' },
                  { id: 'ansi16', label: 'Linux ANSI 16', desc: 'Terminal colors' },
                  { id: 'palette', label: 'Curated Palette', desc: 'Themed swatches' },
                  { id: 'monochrome', label: 'Monochrome', desc: 'Single tone' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdate('colorMode', mode.id as ColorMode)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      config.colorMode === mode.id
                        ? 'bg-neutral-800 border-emerald-400 text-neutral-100 shadow-xs'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-medium text-xs">{mode.label}</div>
                    <div className="text-[10px] text-neutral-500">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Curated Palette Options */}
            {config.colorMode === 'palette' && (
              <div className="space-y-2 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <label className="block text-neutral-400 text-[11px]">Choose Palette:</label>
                <select
                  value={config.paletteId}
                  onChange={(e) => handleUpdate('paletteId', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-emerald-400 cursor-pointer"
                >
                  {CURATED_PALETTES.map((pal) => (
                    <option key={pal.id} value={pal.id}>
                      {pal.name} ({pal.colors.length} colors)
                    </option>
                  ))}
                </select>

                {/* Swatches preview */}
                {(() => {
                  const pal = CURATED_PALETTES.find(p => p.id === config.paletteId) || CURATED_PALETTES[0];
                  return (
                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                      {pal.colors.slice(0, 10).map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-xs shrink-0 border border-neutral-800"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Monochrome Color Options */}
            {config.colorMode === 'monochrome' && (
              <div className="space-y-2 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="block text-neutral-400 text-[11px]">Foreground Color:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.monoColor}
                    onChange={(e) => handleUpdate('monoColor', e.target.value)}
                    className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.monoColor}
                    onChange={(e) => handleUpdate('monoColor', e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-neutral-200 w-24"
                  />
                  <div className="flex items-center gap-1 ml-auto">
                    {[
                      { hex: '#33ff33', name: 'Green' },
                      { hex: '#ffb000', name: 'Amber' },
                      { hex: '#00f0ff', name: 'Cyan' },
                      { hex: '#f8fafc', name: 'White' }
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => handleUpdate('monoColor', swatch.hex)}
                        className="w-5 h-5 rounded-xs border border-neutral-700 transition-transform hover:scale-110"
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Background Color */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-neutral-300 font-medium">Canvas Background:</span>
                <span className="text-[11px] text-neutral-500 block">Preview & PNG export backdrop</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { hex: '#0a0a0f', title: 'Deep Black' },
                  { hex: '#181825', title: 'Catppuccin' },
                  { hex: '#0f0a04', title: 'Amber CRT' },
                  { hex: '#f8fafc', title: 'Paper Light' }
                ].map((bg) => (
                  <button
                    key={bg.hex}
                    onClick={() => handleUpdate('backgroundColor', bg.hex)}
                    className={`w-5 h-5 rounded-xs border transition-all ${
                      config.backgroundColor === bg.hex ? 'border-emerald-400 scale-110 ring-1 ring-emerald-400' : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                    title={bg.title}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Image Tuning & Dithering */}
      <div>
        <button
          onClick={() => toggleSection('tuning')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-200">Image Tuning & Dithering</span>
          </div>
          {openSections.tuning ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
        </button>

        {openSections.tuning && (
          <div className="p-4 pt-1 space-y-3.5 text-xs">
            {/* Dither Algorithm */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1">
                <span className="font-medium">Dithering Method:</span>
                <span className="text-[11px] text-emerald-400 font-mono capitalize">
                  {config.dither === 'floyd-steinberg' ? 'Floyd-Steinberg' : config.dither}
                </span>
              </div>
              <select
                value={config.dither}
                onChange={(e) => handleUpdate('dither', e.target.value as DitherMethod)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden focus:border-emerald-400 cursor-pointer"
              >
                <option value="none">None (Direct Threshold)</option>
                <option value="floyd-steinberg">Floyd-Steinberg (Smooth Error Diffusion)</option>
                <option value="bayer-4x4">Bayer 4×4 (Retro Ordered Dithering)</option>
                <option value="atkinson">Atkinson (Classic High Detail)</option>
              </select>
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Dithering creates smoother gradients and brings out fine photographic details.
              </span>
            </div>

            {/* Contrast Slider */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1">
                <span>Contrast:</span>
                <span className="font-mono text-neutral-400">{config.contrast > 0 ? `+${config.contrast}` : config.contrast}</span>
              </div>
              <input
                type="range"
                min={-50}
                max={80}
                value={config.contrast}
                onChange={(e) => handleUpdate('contrast', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>

            {/* Brightness Slider */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1">
                <span>Brightness:</span>
                <span className="font-mono text-neutral-400">{config.brightness > 0 ? `+${config.brightness}` : config.brightness}</span>
              </div>
              <input
                type="range"
                min={-60}
                max={60}
                value={config.brightness}
                onChange={(e) => handleUpdate('brightness', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>

            {/* Gamma Slider */}
            <div>
              <div className="flex items-center justify-between text-neutral-300 mb-1">
                <span>Gamma:</span>
                <span className="font-mono text-neutral-400">{config.gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={config.gamma}
                onChange={(e) => handleUpdate('gamma', Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>

            {/* Edge Detection Filter */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-neutral-300 font-medium">Outline / Edge Mode</span>
                  <span className="text-[11px] text-neutral-500 block">Sobel contour filter for line art & logos</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.edgeDetection}
                  onChange={(e) => handleUpdate('edgeDetection', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-neutral-800 cursor-pointer"
                />
              </div>

              {config.edgeDetection && (
                <div>
                  <div className="flex items-center justify-between text-neutral-300 mb-1">
                    <span className="text-[11px] text-neutral-400">Edge Sensitivity:</span>
                    <span className="font-mono text-[11px] text-emerald-400">{config.edgeThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={config.edgeThreshold}
                    onChange={(e) => handleUpdate('edgeThreshold', Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
