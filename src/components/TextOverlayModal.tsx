import { useState, useRef, useEffect, useCallback } from 'react';
import { TextOverlay } from '../types';
import { Type, X, Check, Trash2, Plus, Move, AlignCenter, Bold } from 'lucide-react';

interface TextOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  overlays: TextOverlay[];
  onSaveOverlays: (overlays: TextOverlay[]) => void;
}

export function TextOverlayModal({
  isOpen,
  onClose,
  imageUrl,
  overlays,
  onSaveOverlays
}: TextOverlayModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TextOverlay[]>(overlays || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Sync when modal opens
  useEffect(() => {
    if (isOpen) {
      if (overlays && overlays.length > 0) {
        setItems(overlays);
        setSelectedId(overlays[0].id);
      } else {
        // Create initial sample overlay
        const initialItem: TextOverlay = {
          id: 'text-1',
          text: 'LINUX',
          x: 50,
          y: 85,
          fontSize: 28,
          fontFamily: 'monospace',
          color: '#34d399',
          bold: true,
          outline: true,
          outlineColor: '#000000',
          enabled: true
        };
        setItems([initialItem]);
        setSelectedId(initialItem.id);
      }
    }
  }, [isOpen, overlays]);

  const activeItem = items.find(i => i.id === selectedId) || items[0];

  const updateActiveItem = (updater: Partial<TextOverlay>) => {
    if (!activeItem) return;
    setItems(prev => prev.map(item => item.id === activeItem.id ? { ...item, ...updater } : item));
  };

  const handleAddText = () => {
    const newItem: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'TEXT',
      x: 50,
      y: 50,
      fontSize: 26,
      fontFamily: 'monospace',
      color: '#ffffff',
      bold: true,
      outline: true,
      outlineColor: '#000000',
      enabled: true
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) {
      const remaining = items.filter(i => i.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Dragging logic for positioning text anywhere on the image
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);

    const target = items.find(i => i.id === id);
    if (!target) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: target.x,
      startY: target.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current || !activeItem) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, dragStartRef.current.startX + dx));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.startY + dy));

    updateActiveItem({ x: Math.round(newX), y: Math.round(newY) });
  }, [isDragging, activeItem]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Click on image background to move active text there directly
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !activeItem || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateActiveItem({ x: Math.round(Math.max(5, Math.min(95, x))), y: Math.round(Math.max(5, Math.min(95, y))) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Type className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-neutral-100">Add Text & Captions to Image</h2>
              <p className="text-xs text-neutral-400">
                Click or drag text anywhere on the image. It will be converted into ASCII characters!
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

        {/* Workspace Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-neutral-950">
          {/* Left: Interactive Visual Canvas (7 Cols) */}
          <div className="md:col-span-7 p-6 flex flex-col items-center justify-center overflow-auto border-r border-neutral-800 relative bg-neutral-950">
            <div
              ref={containerRef}
              onClick={handleContainerClick}
              className="relative max-w-full max-h-[50vh] cursor-crosshair select-none rounded overflow-hidden shadow-2xl border border-neutral-800"
              style={{ touchAction: 'none' }}
            >
              <img
                src={imageUrl}
                alt="Source for Text Overlay"
                className="max-h-[50vh] max-w-full w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Render placed text elements */}
              {items.map((item) => {
                if (!item.enabled) return null;
                const isSelected = item.id === activeItem?.id;

                const family = item.fontFamily === 'monospace' ? '"JetBrains Mono", monospace' :
                               item.fontFamily === 'impact' ? 'Impact, sans-serif' :
                               item.fontFamily === 'serif' ? 'Georgia, serif' :
                               'system-ui, sans-serif';

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing px-2 py-0.5 rounded transition-shadow ${
                      isSelected
                        ? 'ring-2 ring-emerald-400 bg-neutral-900/30 shadow-lg'
                        : 'hover:ring-1 hover:ring-neutral-400'
                    }`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      fontFamily: family,
                      fontWeight: item.bold ? 'bold' : 'normal',
                      fontSize: `${Math.max(12, item.fontSize * 0.9)}px`,
                      color: item.color,
                      textShadow: item.outline ? `0 0 4px ${item.outlineColor}, 1px 1px 2px ${item.outlineColor}, -1px -1px 2px ${item.outlineColor}` : 'none'
                    }}
                  >
                    <span>{item.text || 'Text'}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-500 mt-3 font-mono">
              Tip: Click anywhere or drag the text directly to position it.
            </p>
          </div>

          {/* Right: Text Configuration Panel (5 Cols) */}
          <div className="md:col-span-5 p-5 overflow-auto bg-neutral-900 space-y-4 text-xs">
            {/* Overlay selector tabs */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Text Layers:</span>
              <button
                onClick={handleAddText}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Layer</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {items.map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-2 border ${
                    it.id === activeItem?.id
                      ? 'bg-neutral-800 text-emerald-400 border-neutral-700 shadow-xs'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <span className="truncate max-w-[80px]">{it.text || `Layer ${idx + 1}`}</span>
                  {items.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(it.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-0.5"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeItem ? (
              <div className="space-y-3.5 pt-2 border-t border-neutral-800">
                {/* Text String Input */}
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Text Content:</label>
                  <input
                    type="text"
                    value={activeItem.text}
                    onChange={(e) => updateActiveItem({ text: e.target.value })}
                    placeholder="Enter custom text..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1">Quick Alignment:</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Top', x: 50, y: 15 },
                      { label: 'Center', x: 50, y: 50 },
                      { label: 'Bottom', x: 50, y: 85 },
                      { label: 'Corner', x: 80, y: 88 }
                    ].map((pos) => (
                      <button
                        key={pos.label}
                        onClick={() => updateActiveItem({ x: pos.x, y: pos.y })}
                        className="py-1 text-center bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-neutral-300 text-[11px] transition-colors"
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex items-center justify-between text-neutral-300 mb-1">
                    <span>Font Scale:</span>
                    <span className="font-mono text-neutral-400">{activeItem.fontSize}</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={55}
                    value={activeItem.fontSize}
                    onChange={(e) => updateActiveItem({ fontSize: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Font Family & Bold */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Font Family:</label>
                    <select
                      value={activeItem.fontFamily}
                      onChange={(e) => updateActiveItem({ fontFamily: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-neutral-200 text-xs focus:outline-hidden cursor-pointer"
                    >
                      <option value="monospace">JetBrains Mono</option>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="impact">Impact (Meme)</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Style:</label>
                    <button
                      onClick={() => updateActiveItem({ bold: !activeItem.bold })}
                      className={`w-full py-1.5 rounded border text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                        activeItem.bold
                          ? 'bg-neutral-800 border-emerald-400 text-emerald-400 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                      <span>Bold</span>
                    </button>
                  </div>
                </div>

                {/* Color & Outline */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Text Color:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={activeItem.color}
                        onChange={(e) => updateActiveItem({ color: e.target.value })}
                        className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5 shrink-0"
                      />
                      <div className="flex items-center gap-1">
                        {['#ffffff', '#34d399', '#ffb000', '#00f0ff'].map(c => (
                          <button
                            key={c}
                            onClick={() => updateActiveItem({ color: c })}
                            className="w-4 h-4 rounded-xs border border-neutral-700"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Outline / Glow:</label>
                    <button
                      onClick={() => updateActiveItem({ outline: !activeItem.outline })}
                      className={`w-full py-1.5 rounded border text-xs font-medium transition-colors ${
                        activeItem.outline
                          ? 'bg-neutral-800 border-emerald-400 text-emerald-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {activeItem.outline ? 'Black Outline (On)' : 'No Outline'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No text layers. Click "Add Layer" above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
          <p className="text-xs text-neutral-400 hidden sm:block">
            Text will be rendered into the pixels and converted into matching ASCII characters.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={() => {
                onSaveOverlays([]);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Text</span>
            </button>
            <button
              onClick={() => {
                onSaveOverlays(items);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply to ASCII Art</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
