import { useState } from 'react';
import { X, Copy, Check, Terminal, Monitor, Play, FileCode2 } from 'lucide-react';

interface LinuxGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LinuxGuideModal({ isOpen, onClose }: LinuxGuideModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const localRunSnippet = `# 1. Install Node.js (if not installed)
# Ubuntu / Debian: sudo apt install nodejs npm
# Arch Linux:      sudo pacman -S nodejs npm
# Fedora:          sudo dnf install nodejs npm

# 2. Extract or clone project and install dependencies
npm install

# 3. Start local development server
npm run dev

# App runs at: http://localhost:3000`;

  const desktopAppSnippet = `# Launch as a borderless native-feeling Linux desktop window:
google-chrome --app=http://localhost:3000

# Or with Brave:
brave --app=http://localhost:3000

# Or with Chromium:
chromium --app=http://localhost:3000`;

  const desktopEntrySnippet = `[Desktop Entry]
Name=ASCII Studio
Comment=Linux Image to ASCII Art Generator
Exec=google-chrome --app=http://localhost:3000
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Graphics;Utility;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-neutral-100">Running on Linux</h2>
              <p className="text-xs text-neutral-400">
                Instructions for running locally, creating a desktop app, or executing terminal scripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto space-y-6 text-xs text-neutral-300">
          {/* Method 1: In your Browser right now */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm">
              <Play className="w-4 h-4" />
              <span>Option 1: Direct in your Linux Browser (No Install Needed)</span>
            </div>
            <p className="text-neutral-400 text-xs">
              This app is fully client-side and runs directly in Firefox, Chromium, Chrome, or Brave on any Linux distro (Ubuntu, Fedora, Arch, Debian, openSUSE, etc.). All image processing runs locally in your browser canvas.
            </p>
          </div>

          {/* Method 2: Running Locally */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-2 text-xs">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Option 2: Run Locally via Node.js / npm
              </span>
              <button
                onClick={() => handleCopy(localRunSnippet, 'local')}
                className="text-[11px] px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'local' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'local' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
              {localRunSnippet}
            </pre>
          </div>

          {/* Method 3: Desktop App Window */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-2 text-xs">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Option 3: Run as a Standalone Linux Desktop App Window
              </span>
              <button
                onClick={() => handleCopy(desktopAppSnippet, 'desktop')}
                className="text-[11px] px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'desktop' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'desktop' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
              {desktopAppSnippet}
            </pre>
            <p className="text-[11px] text-neutral-500">
              Tip: You can also create a desktop shortcut by saving a <code className="text-neutral-400 bg-neutral-950 px-1 py-0.5 rounded">~/.local/share/applications/ascii-studio.desktop</code> launcher entry.
            </p>
          </div>

          {/* Terminal output usage */}
          <div className="space-y-2 border-t border-neutral-800 pt-4">
            <span className="font-semibold text-neutral-200 block text-xs">
              Displaying exported files in your Linux Terminal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-neutral-500 block mb-1 font-sans">View Plain Text:</span>
                <span className="text-emerald-400">cat ascii-art.txt</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-neutral-500 block mb-1 font-sans">Run Colored Script:</span>
                <span className="text-emerald-400">bash ascii-art.sh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
