import { useState, useEffect } from 'react';
import { AsciiResult, AsciiConfig } from '../types';
import {
  generateLinuxBashScript,
  generateStandaloneHtml,
  renderAsciiToImage,
  generateAsciiSvg,
  downloadFile,
  downloadDataUrl
} from '../utils/asciiConverter';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  FileText,
  Image as ImageIcon,
  Code2,
  Sparkles,
  Layers,
  Sliders
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AsciiResult | null;
  config: AsciiConfig;
}

type ExportTab = 'txt' | 'png' | 'bash' | 'ansi' | 'svg' | 'html';

export function ExportModal({ isOpen, onClose, result, config }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('txt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // PNG options
  const [pngScale, setPngScale] = useState<number>(2);
  const [pngBg, setPngBg] = useState<'default' | 'black' | 'dark' | 'transparent'>('default');
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [customFilename, setCustomFilename] = useState('ascii-artwork');

  // Generate PNG preview when tab is PNG or scale/bg changes
  useEffect(() => {
    if (!isOpen || !result || activeTab !== 'png') return;

    let isMounted = true;
    setIsGeneratingPng(true);

    const bgMap = {
      default: config.backgroundColor || '#0a0a0f',
      black: '#000000',
      dark: '#181825',
      transparent: 'transparent'
    };

    renderAsciiToImage(result, config, {
      scale: pngScale,
      backgroundColor: bgMap[pngBg],
      transparentBg: pngBg === 'transparent'
    })
      .then((url) => {
        if (isMounted) {
          setPngPreviewUrl(url);
          setIsGeneratingPng(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate preview PNG', err);
        if (isMounted) setIsGeneratingPng(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, result, config, activeTab, pngScale, pngBg]);

  if (!isOpen || !result) return null;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownloadTxt = () => {
    const filename = `${customFilename || 'ascii-artwork'}.txt`;
    downloadFile(result.text, filename, 'text/plain;charset=utf-8');
  };

  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);
      const bgMap = {
        default: config.backgroundColor || '#0a0a0f',
        black: '#000000',
        dark: '#181825',
        transparent: 'transparent'
      };

      const dataUrl = await renderAsciiToImage(result, config, {
        scale: pngScale,
        backgroundColor: bgMap[pngBg],
        transparentBg: pngBg === 'transparent'
      });

      const filename = `${customFilename || 'ascii-artwork'}-${result.width}x${result.height}.png`;
      downloadDataUrl(dataUrl, filename);
    } catch (err) {
      console.error('Failed to download PNG', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    const svg = generateAsciiSvg(result, config, {
      transparentBg: pngBg === 'transparent'
    });
    const filename = `${customFilename || 'ascii-artwork'}.svg`;
    downloadFile(svg, filename, 'image/svg+xml;charset=utf-8');
  };

  const handleDownloadBash = () => {
    const bash = generateLinuxBashScript(result.ansiText || result.text, customFilename || 'art');
    const filename = `${customFilename || 'art'}.sh`;
    downloadFile(bash, filename, 'application/x-sh');
  };

  const handleDownloadAnsi = () => {
    const filename = `${customFilename || 'ascii-art'}.ans`;
    downloadFile(result.ansiText, filename, 'text/plain;charset=utf-8');
  };

  const handleDownloadHtml = () => {
    const html = generateStandaloneHtml(result, config);
    const filename = `${customFilename || 'ascii-artwork'}.html`;
    downloadFile(html, filename, 'text/html;charset=utf-8');
  };

  const bashScript = generateLinuxBashScript(result.ansiText || result.text, customFilename || 'art');
  const standaloneHtml = generateStandaloneHtml(result, config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-neutral-100">Export & Save ASCII Art</h2>
              <p className="text-xs text-neutral-400">
                Save as plain text file (.txt), high-resolution image (.png), Linux bash script, or ANSI art
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

        {/* Format Selector Tabs */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('txt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'txt'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plain Text (.txt)</span>
          </button>

          <button
            onClick={() => setActiveTab('png')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'png'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Format (.png)</span>
          </button>

          <button
            onClick={() => setActiveTab('bash')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'bash'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Linux Bash Script (.sh)</span>
          </button>

          <button
            onClick={() => setActiveTab('ansi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'ansi'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>ANSI Art (.ans)</span>
          </button>

          <button
            onClick={() => setActiveTab('svg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'svg'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vector (.svg)</span>
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Webpage (.html)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-auto bg-neutral-950 text-xs">
          {/* TAB 1: PLAIN TEXT (.TXT) */}
          {activeTab === 'txt' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-300">
                <div>
                  <span className="font-semibold text-emerald-400 block">Plain Text (.txt) File Export:</span>
                  <span className="text-neutral-400 text-xs">
                    Clean, universal ASCII text compatible with any text editor, terminal, or markdown document.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-neutral-400">File:</span>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="ascii-artwork"
                    className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 w-32 font-mono"
                  />
                  <span className="text-neutral-500 font-mono text-xs">.txt</span>
                </div>
              </div>

              {/* Text Preview Box */}
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(result.text, 'txt')}
                    className="px-2.5 py-1 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center gap-1 border border-neutral-700 shadow-xs backdrop-blur-xs"
                  >
                    {copiedKey === 'txt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'txt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 overflow-x-auto max-h-[320px] text-[10px] leading-tight font-mono select-all">
                  {result.text}
                </pre>
              </div>

              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
                <span>{result.text.length.toLocaleString()} total characters · {result.height} lines</span>
                <span>Encoding: UTF-8 / ASCII</span>
              </div>
            </div>
          )}

          {/* TAB 2: COMMON IMAGE FORMAT (.PNG) */}
          {activeTab === 'png' && (
            <div className="space-y-4">
              {/* Settings strip */}
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Resolution scale */}
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1 font-medium">Image Resolution:</label>
                  <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
                    {[
                      { scale: 1, label: '1× Standard' },
                      { scale: 2, label: '2× Retina HD' },
                      { scale: 3, label: '3× Ultra 4K' }
                    ].map((opt) => (
                      <button
                        key={opt.scale}
                        onClick={() => setPngScale(opt.scale)}
                        className={`flex-1 py-1 text-center rounded text-xs font-medium transition-colors ${
                          pngScale === opt.scale
                            ? 'bg-neutral-800 text-emerald-400'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background option */}
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1 font-medium">Background Color:</label>
                  <select
                    value={pngBg}
                    onChange={(e) => setPngBg(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-hidden cursor-pointer"
                  >
                    <option value="default">App Canvas Color</option>
                    <option value="black">Pure Deep Black (#000000)</option>
                    <option value="dark">Linux Dark Slate (#181825)</option>
                    <option value="transparent">Transparent PNG</option>
                  </select>
                </div>

                {/* File name */}
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1 font-medium">Filename:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="ascii-artwork"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 font-mono"
                    />
                    <span className="text-neutral-500 font-mono text-xs">.png</span>
                  </div>
                </div>
              </div>

              {/* PNG Live Preview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex flex-col items-center justify-center min-h-[260px] max-h-[340px] overflow-auto">
                {isGeneratingPng ? (
                  <div className="text-center py-12">
                    <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-neutral-400 font-mono">Rendering high-res PNG image...</span>
                  </div>
                ) : pngPreviewUrl ? (
                  <div className="relative group max-h-full flex items-center justify-center">
                    <img
                      src={pngPreviewUrl}
                      alt="Rendered ASCII PNG"
                      className="max-h-[300px] w-auto object-contain rounded shadow-lg border border-neutral-800/80"
                    />
                  </div>
                ) : (
                  <span className="text-neutral-500 text-xs">Preview unavailable</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Lossless 32-bit PNG · Sharp pixel-aligned monospace typography</span>
                <span className="text-emerald-400 font-medium">Ready to share, post, or use in applications</span>
              </div>
            </div>
          )}

          {/* TAB 3: BASH SCRIPT (.SH) */}
          {activeTab === 'bash' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
                <span className="font-semibold text-emerald-400 block">Linux Terminal Script (.sh):</span>
                <span className="text-neutral-400 text-xs">
                  Run in terminal with <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-200">bash {customFilename || 'art'}.sh</code>. Prints full colored ASCII art to any ANSI / truecolor terminal emulator.
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 overflow-x-auto max-h-[320px] text-[11px] leading-relaxed font-mono">
                  {bashScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: ANSI ART (.ANS) */}
          {activeTab === 'ansi' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
                <span className="font-semibold text-emerald-400 block">ANSI Escape File (.ans / .asc):</span>
                <span className="text-neutral-400 text-xs">
                  Raw terminal stream with escape sequences for color and formatting. Display via <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-200">cat {customFilename || 'art'}.ans</code>.
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 overflow-x-auto max-h-[320px] text-[11px] font-mono">
                  {result.ansiText.slice(0, 1500)}
                  {result.ansiText.length > 1500 && '\n\n... (preview truncated for performance)'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: SCALABLE VECTOR (.SVG) */}
          {activeTab === 'svg' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
                <span className="font-semibold text-emerald-400 block">Scalable Vector Graphics (.svg):</span>
                <span className="text-neutral-400 text-xs">
                  Resolution-independent vector image containing colored glyphs with sharp edges at any scale or zoom level.
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 overflow-x-auto max-h-[320px] text-[11px] font-mono">
                  {generateAsciiSvg(result, config).slice(0, 1000)}
                  {'\n\n<!-- ... remaining vector text nodes ... -->\n</svg>'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: STANDALONE HTML (.HTML) */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
                <span className="font-semibold text-emerald-400 block">Self-Contained Webpage (.html):</span>
                <span className="text-neutral-400 text-xs">
                  Standalone single-file HTML document with embedded CSS and colored spans. Open in Chrome, Firefox, or Safari.
                </span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 overflow-x-auto max-h-[320px] text-[11px] font-mono">
                  {standaloneHtml.slice(0, 1000)}
                  {'\n\n<!-- ... remaining colored character spans ... -->'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0 font-sans">
          <div className="text-xs text-neutral-400 font-mono">
            {result.width} cols × {result.height} rows · {config.colorMode}
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'txt' && (
              <>
                <button
                  onClick={() => handleCopy(result.text, 'txt_btn')}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  {copiedKey === 'txt_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'txt_btn' ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt File</span>
                </button>
              </>
            )}

            {activeTab === 'png' && (
              <button
                onClick={handleDownloadPng}
                disabled={isGeneratingPng}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPng ? 'Generating...' : 'Download Image (.png)'}</span>
              </button>
            )}

            {activeTab === 'bash' && (
              <>
                <button
                  onClick={() => handleCopy(bashScript, 'bash_btn')}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  {copiedKey === 'bash_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bash_btn' ? 'Copied' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={handleDownloadBash}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sh</span>
                </button>
              </>
            )}

            {activeTab === 'ansi' && (
              <>
                <button
                  onClick={() => handleCopy(result.ansiText, 'ansi_btn')}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  {copiedKey === 'ansi_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ansi_btn' ? 'Copied' : 'Copy ANSI'}</span>
                </button>
                <button
                  onClick={handleDownloadAnsi}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ans</span>
                </button>
              </>
            )}

            {activeTab === 'svg' && (
              <button
                onClick={handleDownloadSvg}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .svg Image</span>
              </button>
            )}

            {activeTab === 'html' && (
              <>
                <button
                  onClick={() => handleCopy(standaloneHtml, 'html_btn')}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  {copiedKey === 'html_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'html_btn' ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .html</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors ml-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
