/**
 * ASCII Studio - Type Definitions
 */

export type PredefinedCharsetKey = 
  | 'simple' 
  | 'standard' 
  | 'detailed' 
  | 'artistic_blocks' 
  | 'artistic_braille' 
  | 'binary' 
  | 'minimal' 
  | 'matrix' 
  | 'custom';

export interface CharsetOption {
  id: PredefinedCharsetKey;
  name: string;
  characters: string;
  description: string;
}

export type ColorMode = 
  | 'image'       // Direct RGB from image pixels (Truecolor)
  | 'ansi16'      // Standard Linux 16-color terminal palette
  | 'monochrome'  // Single custom foreground color
  | 'palette';    // Mapped to specific curated palette

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // hex codes
  background: string;
}

export type DitherMethod = 'none' | 'floyd-steinberg' | 'bayer-4x4' | 'atkinson';

export interface CropRegion {
  x: number; // percentage (0-100) or pixel
  y: number;
  width: number;
  height: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number; // relative scaling 10 to 60
  fontFamily: 'monospace' | 'sans-serif' | 'serif' | 'impact';
  color: string;
  bold: boolean;
  outline: boolean;
  outlineColor: string;
  enabled: boolean;
}

export interface AsciiConfig {
  // Dimensions
  width: number; // in columns (characters)
  height: number; // in rows
  lockAspectRatio: boolean;
  charAspectRatio: number; // standard terminal font width/height ~ 0.50 - 0.55

  // Character set
  charsetKey: PredefinedCharsetKey;
  customCharset: string;
  invertChars: boolean; // darker chars for light or vice versa

  // Color & Palette
  colorMode: ColorMode;
  paletteId: string;
  monoColor: string;
  backgroundColor: string;
  
  // Image tuning
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  gamma: number;      // 0.2 to 2.5 (1.0 default)
  dither: DitherMethod;
  edgeDetection: boolean;
  edgeThreshold: number; // 0 to 100

  // Text Overlays on the image
  textOverlays?: TextOverlay[];

  // Preview styling
  fontSize: number; // px
  lineHeight: number; // multiplier e.g. 0.9 - 1.2
  letterSpacing: number; // px e.g. 0 to 2
  terminalTheme: 'linux-dark' | 'amber-crt' | 'green-matrix' | 'nord' | 'dracula' | 'paper-white';
}

export interface AsciiCell {
  char: string;
  r: number;
  g: number;
  b: number;
  hex: string;
  ansiCode: string;
}

export interface AsciiResult {
  text: string;
  lines: AsciiCell[][];
  width: number;
  height: number;
  ansiText: string;
}
