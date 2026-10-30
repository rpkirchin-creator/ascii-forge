import { Terminal, Download, Sparkles } from 'lucide-react';
import { PRESET_CONFIGS } from '../utils/constants';
import { AsciiConfig } from '../types';

interface HeaderBarProps {
  onOpenExport: () => void;
  onOpenLinuxGuide: () => void;
  hasResult: boolean;
  onApplyPreset: (presetId: string) => void;
  activePresetId?: string;
}

export function HeaderBar({
  onOpenExport,
  onOpenLinuxGuide,
  hasResult,
  onApplyPreset,
  activePresetId
}: HeaderBarProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-neutral-100 whitespace-nowrap">
            ASCII Studio
          </span>
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
            for Linux & Web
          </span>
        </div>
      </div>

      {/* Zone 2: Preset Switchers */}
      <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-xs font-medium text-neutral-400">
        <span className="text-neutral-500 text-[11px] mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Presets:
        </span>
        {PRESET_CONFIGS.slice(0, 4).map((p) => {
          const isActive = activePresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onApplyPreset(p.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs ${
                isActive
                  ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 font-semibold'
                  : 'hover:text-neutral-200 hover:bg-neutral-900'
              }`}
              title={p.description}
            >
              {p.name.replace(' (No Color)', '')}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenLinuxGuide}
          className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-800"
          title="How to run this app on Linux"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Linux Guide</span>
        </button>

        <button
          onClick={onOpenExport}
          disabled={!hasResult}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            hasResult
              ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 shadow-sm'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Art</span>
        </button>
      </div>
    </header>
  );
}
