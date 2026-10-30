import { AsciiConfig, AsciiResult, AsciiCell, CropRegion, ColorPalette } from '../types';
import { PREDEFINED_CHARSETS, ANSI_16_COLORS, CURATED_PALETTES } from './constants';

/**
 * Convert a hexadecimal color string (#RRGGBB or #RGB) into numeric {r, g, b} (0-255).
 * Bitwise operations:
 * (num >> 16) & 255 extracts the 8 most-significant bits (Red)
 * (num >> 8) & 255 extracts the middle 8 bits (Green)
 * num & 255 extracts the 8 least-significant bits (Blue)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Format numeric RGB components back into a standard hex string (#rrggbb).
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * EDUCATIONAL CONCEPT: Human Perceptual Color Distance
 * In pure Euclidean 3D space, distance is sqrt(dr^2 + dg^2 + db^2).
 * However, human vision is far more sensitive to green variations than blue.
 * This function uses the Compendium Colorimetry approximation with a red-mean
 * weighting to closely mirror how the human retina perceives color similarity.
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

/**
 * Nearest-Neighbor ANSI Color Quantization:
 * Finds the closest color match from the standard 16-color Linux terminal palette.
 */
function findClosestAnsi(r: number, g: number, b: number): { hex: string; ansi: number; r: number; g: number; b: number } {
  let minDist = Infinity;
  let best = ANSI_16_COLORS[7]; // default fallback: white

  for (const c of ANSI_16_COLORS) {
    const dist = colorDistance(r, g, b, c.r, c.g, c.b);
    if (dist < minDist) {
      minDist = dist;
      best = c;
    }
  }

  return {
    hex: best.hex,
    ansi: best.ansi,
    r: best.r,
    g: best.g,
    b: best.b
  };
}

/**
 * Nearest-Neighbor Palette Matching:
 * Finds the closest matching color within a custom curated color palette.
 */
function findClosestPaletteColor(r: number, g: number, b: number, palette: ColorPalette): { hex: string; r: number; g: number; b: number } {
  let minDist = Infinity;
  let bestHex = palette.colors[0];
  let bestRgb = hexToRgb(bestHex);

  for (const colorHex of palette.colors) {
    const rgb = hexToRgb(colorHex);
    const dist = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);
    if (dist < minDist) {
      minDist = dist;
      bestHex = colorHex;
      bestRgb = rgb;
    }
  }

  return { hex: bestHex, r: bestRgb.r, g: bestRgb.g, b: bestRgb.b };
}

/**
 * EDUCATIONAL CONCEPT: Bayer 4x4 Ordered Dithering Matrix
 * Creates a threshold map where adjacent pixels have staggered thresholds,
 * creating cross-hatch textures without accumulating diffusion error.
 */
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/**
 * MAIN ENGINE: convertImageToAscii
 * 
 * Transforms any source HTML image into an ASCII matrix through 7 steps:
 * 1. Geometry & Aspect Ratio Scaling: Monospace fonts are ~2x taller than wide;
 *    we scale height by charAspectRatio (~0.52) to avoid vertical distortion.
 * 2. Canvas Sampling: Render down to exact (targetCols, targetRows) dimensions.
 * 3. Color Pre-processing: Apply Brightness offset, S-curve Contrast, and Gamma.
 * 4. ITU-R BT.601 Luminance: Calculate perceived brightness (0.299R + 0.587G + 0.114B).
 * 5. Sobel Convolution (Optional): 3x3 gradient kernel for edge/line detection.
 * 6. Error Diffusion Dithering: Floyd-Steinberg or Atkinson error distribution.
 * 7. Character Density Mapping: Index luminance into ordered ASCII character ramp.
 */
export async function convertImageToAscii(
  img: HTMLImageElement,
  config: AsciiConfig,
  cropRegion?: CropRegion
): Promise<AsciiResult> {
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  // STEP 1: Compute Crop Region Bounds (normalized 0-100% to pixel coords)
  let cropX = 0;
  let cropY = 0;
  let cropW = naturalWidth;
  let cropH = naturalHeight;

  if (cropRegion) {
    cropX = Math.max(0, Math.min(naturalWidth - 1, (cropRegion.x / 100) * naturalWidth));
    cropY = Math.max(0, Math.min(naturalHeight - 1, (cropRegion.y / 100) * naturalHeight));
    cropW = Math.max(1, Math.min(naturalWidth - cropX, (cropRegion.width / 100) * naturalWidth));
    cropH = Math.max(1, Math.min(naturalHeight - cropY, (cropRegion.height / 100) * naturalHeight));
  }

  // STEP 2: Character Aspect Ratio Compensation
  // Monospace characters are roughly twice as tall as they are wide (~1:2).
  // Without multiplying by charAspectRatio, the output would appear 2x stretched vertically.
  const targetCols = Math.max(10, Math.min(400, Math.round(config.width)));
  let targetRows: number;

  if (config.lockAspectRatio) {
    const effectiveAspect = (cropH / cropW) * config.charAspectRatio;
    targetRows = Math.max(5, Math.round(targetCols * effectiveAspect));
  } else {
    targetRows = Math.max(5, Math.min(300, Math.round(config.height)));
  }

  // STEP 3: Offscreen Canvas Pixel Downsampling
  // Render the cropped image into a canvas whose pixel dimensions equal (targetCols, targetRows).
  // The browser's native bicubic interpolator smoothly integrates subpixel color patches.
  const canvas = document.createElement('canvas');
  canvas.width = targetCols;
  canvas.height = targetRows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Matte background with black to gracefully handle PNG transparent layers
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetCols, targetRows);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    cropX, cropY, cropW, cropH,
    0, 0, targetCols, targetRows
  );

  // STEP 3B: Render Custom Text Overlays onto the canvas matrix
  // Text is rasterized directly into pixels, allowing ASCII characters to form the words!
  if (config.textOverlays && config.textOverlays.length > 0) {
    for (const overlay of config.textOverlays) {
      if (!overlay.enabled || !overlay.text.trim()) continue;

      const posX = (overlay.x / 100) * targetCols;
      const posY = (overlay.y / 100) * targetRows;

      // Font size scaled to target grid height
      const scaledFontSize = Math.max(7, Math.round((overlay.fontSize / 100) * targetRows * 0.65));
      const family = overlay.fontFamily === 'monospace' ? '"JetBrains Mono", monospace' :
                     overlay.fontFamily === 'impact' ? 'Impact, sans-serif' :
                     overlay.fontFamily === 'serif' ? 'Georgia, serif' :
                     'system-ui, sans-serif';

      ctx.font = `${overlay.bold ? 'bold ' : ''}${scaledFontSize}px ${family}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (overlay.outline) {
        ctx.strokeStyle = overlay.outlineColor || '#000000';
        ctx.lineWidth = Math.max(1.5, scaledFontSize * 0.25);
        ctx.lineJoin = 'round';
        ctx.strokeText(overlay.text, posX, posY);
      }

      ctx.fillStyle = overlay.color || '#ffffff';
      ctx.fillText(overlay.text, posX, posY);
    }
  }

  const imgData = ctx.getImageData(0, 0, targetCols, targetRows);
  const data = imgData.data;

  // STEP 4: Character Ramp Selection
  let charsetChars: string;
  if (config.charsetKey === 'custom') {
    charsetChars = config.customCharset.length > 0 ? config.customCharset : ' .:-=+*#%@';
  } else {
    const found = PREDEFINED_CHARSETS.find(c => c.id === config.charsetKey);
    charsetChars = found ? found.characters : '@%#*+=-:. ';
  }

  if (config.invertChars) {
    charsetChars = charsetChars.split('').reverse().join('');
  }

  // Contrast Expansion Factor: S-curve formula centered at 128 mid-gray
  const contrastFactor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));
  const brightnessOffset = config.brightness * 2.55;
  const gammaVal = Math.max(0.1, config.gamma);

  // 32-bit floating point buffers to preserve sub-integer precision during error diffusion
  const lumBuffer = new Float32Array(targetCols * targetRows);
  const rBuffer = new Float32Array(targetCols * targetRows);
  const gBuffer = new Float32Array(targetCols * targetRows);
  const bBuffer = new Float32Array(targetCols * targetRows);

  for (let y = 0; y < targetRows; y++) {
    for (let x = 0; x < targetCols; x++) {
      const idx = (y * targetCols + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      const a = data[idx + 3] / 255;

      // Alpha composite over black
      r = r * a;
      g = g * a;
      b = b * a;

      // Brightness (additive offset)
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;

      // Contrast (expanded around 128 mid-point)
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // Clamp to valid 8-bit color range [0, 255]
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      // Gamma correction: Power law V_out = 255 * (V_in / 255)^(1 / gamma)
      if (gammaVal !== 1.0) {
        r = 255 * Math.pow(r / 255, 1 / gammaVal);
        g = 255 * Math.pow(g / 255, 1 / gammaVal);
        b = 255 * Math.pow(b / 255, 1 / gammaVal);
      }

      // ITU-R BT.601 Perceptual Luminance:
      // Human eyes are most sensitive to Green (58.7%), then Red (29.9%), least to Blue (11.4%).
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const bufIdx = y * targetCols + x;
      lumBuffer[bufIdx] = lum;
      rBuffer[bufIdx] = r;
      gBuffer[bufIdx] = g;
      bBuffer[bufIdx] = b;
    }
  }

  // Edge detection operator (Sobel filter for crisp outlines and line art)
  if (config.edgeDetection) {
    const edgeBuffer = new Float32Array(targetCols * targetRows);
    const threshold = (config.edgeThreshold || 30) * 2.55;

    for (let y = 1; y < targetRows - 1; y++) {
      for (let x = 1; x < targetCols - 1; x++) {
        const p00 = lumBuffer[(y - 1) * targetCols + (x - 1)];
        const p01 = lumBuffer[(y - 1) * targetCols + x];
        const p02 = lumBuffer[(y - 1) * targetCols + (x + 1)];
        const p10 = lumBuffer[y * targetCols + (x - 1)];
        const p12 = lumBuffer[y * targetCols + (x + 1)];
        const p20 = lumBuffer[(y + 1) * targetCols + (x - 1)];
        const p21 = lumBuffer[(y + 1) * targetCols + x];
        const p22 = lumBuffer[(y + 1) * targetCols + (x + 1)];

        const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
        const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;
        const mag = Math.sqrt(gx * gx + gy * gy);

        edgeBuffer[y * targetCols + x] = mag > threshold ? Math.min(255, mag) : 0;
      }
    }

    for (let i = 0; i < lumBuffer.length; i++) {
      lumBuffer[i] = edgeBuffer[i];
    }
  }

  // STEP 6: Dithering Algorithms
  // Without dithering, assigning pixels to discrete character steps causes harsh banding.
  // Dithering diffuses rounding error across adjacent neighbors to create smooth visual gradients.
  if (config.dither === 'floyd-steinberg') {
    // Floyd-Steinberg error distribution matrix:
    //          [ * ]   7/16
    //   3/16   5/16    1/16
    for (let y = 0; y < targetRows; y++) {
      for (let x = 0; x < targetCols; x++) {
        const idx = y * targetCols + x;
        const oldVal = lumBuffer[idx];
        const step = 255 / (charsetChars.length - 1);
        const newVal = Math.round(oldVal / step) * step;
        lumBuffer[idx] = newVal;
        const error = oldVal - newVal; // Quantization error

        if (x + 1 < targetCols) {
          lumBuffer[y * targetCols + (x + 1)] += (error * 7) / 16;
        }
        if (x - 1 >= 0 && y + 1 < targetRows) {
          lumBuffer[(y + 1) * targetCols + (x - 1)] += (error * 3) / 16;
        }
        if (y + 1 < targetRows) {
          lumBuffer[(y + 1) * targetCols + x] += (error * 5) / 16;
        }
        if (x + 1 < targetCols && y + 1 < targetRows) {
          lumBuffer[(y + 1) * targetCols + (x + 1)] += (error * 1) / 16;
        }
      }
    }
  } else if (config.dither === 'atkinson') {
    // Bill Atkinson dithering (created for original Apple Macintosh):
    // Only diffuses 3/4 (6/8) of error, leaving 1/4 clean to preserve crisp edges.
    for (let y = 0; y < targetRows; y++) {
      for (let x = 0; x < targetCols; x++) {
        const idx = y * targetCols + x;
        const oldVal = lumBuffer[idx];
        const step = 255 / (charsetChars.length - 1);
        const newVal = Math.round(oldVal / step) * step;
        lumBuffer[idx] = newVal;
        const error = (oldVal - newVal) / 8;

        if (x + 1 < targetCols) lumBuffer[y * targetCols + (x + 1)] += error;
        if (x + 2 < targetCols) lumBuffer[y * targetCols + (x + 2)] += error;
        if (x - 1 >= 0 && y + 1 < targetRows) lumBuffer[(y + 1) * targetCols + (x - 1)] += error;
        if (y + 1 < targetRows) lumBuffer[(y + 1) * targetCols + x] += error;
        if (x + 1 < targetCols && y + 1 < targetRows) lumBuffer[(y + 1) * targetCols + (x + 1)] += error;
        if (y + 2 < targetRows) lumBuffer[(y + 2) * targetCols + x] += error;
      }
    }
  } else if (config.dither === 'bayer-4x4') {
    // Ordered Dithering: Deterministic threshold modulation via Bayer matrix
    for (let y = 0; y < targetRows; y++) {
      for (let x = 0; x < targetCols; x++) {
        const idx = y * targetCols + x;
        const bayerVal = (BAYER_4X4[y % 4][x % 4] / 16 - 0.5) * 45;
        lumBuffer[idx] = Math.max(0, Math.min(255, lumBuffer[idx] + bayerVal));
      }
    }
  }

  // Active palette if in palette mode
  const currentPalette = CURATED_PALETTES.find(p => p.id === config.paletteId) || CURATED_PALETTES[0];
  const monoRgb = hexToRgb(config.monoColor || '#e5e7eb');

  const resultLines: AsciiCell[][] = [];
  const textLines: string[] = [];
  const ansiLines: string[] = [];

  // STEP 7: Character Density Mapping & ANSI Terminal Escape Generation
  for (let y = 0; y < targetRows; y++) {
    const lineCells: AsciiCell[] = [];
    let textLine = '';
    let ansiLine = '';
    let lastAnsiCode = '';

    for (let x = 0; x < targetCols; x++) {
      const idx = y * targetCols + x;
      const lum = Math.max(0, Math.min(255, lumBuffer[idx]));
      const normalizedLum = lum / 255;

      // Character selection based on brightness
      const charIndex = Math.min(
        charsetChars.length - 1,
        Math.max(0, Math.floor(normalizedLum * charsetChars.length))
      );
      const char = charsetChars[charIndex] || ' ';

      const rawR = Math.max(0, Math.min(255, Math.round(rBuffer[idx])));
      const rawG = Math.max(0, Math.min(255, Math.round(gBuffer[idx])));
      const rawB = Math.max(0, Math.min(255, Math.round(bBuffer[idx])));

      let finalR = rawR;
      let finalG = rawG;
      let finalB = rawB;
      let hexColor = rgbToHex(rawR, rawG, rawB);
      let ansiCode = '';

      if (config.colorMode === 'image') {
        finalR = rawR;
        finalG = rawG;
        finalB = rawB;
        hexColor = rgbToHex(finalR, finalG, finalB);
        ansiCode = `\x1b[38;2;${finalR};${finalG};${finalB}m`;
      } else if (config.colorMode === 'ansi16') {
        const match = findClosestAnsi(rawR, rawG, rawB);
        finalR = match.r;
        finalG = match.g;
        finalB = match.b;
        hexColor = match.hex;
        ansiCode = `\x1b[${match.ansi}m`;
      } else if (config.colorMode === 'palette') {
        const match = findClosestPaletteColor(rawR, rawG, rawB, currentPalette);
        finalR = match.r;
        finalG = match.g;
        finalB = match.b;
        hexColor = match.hex;
        ansiCode = `\x1b[38;2;${finalR};${finalG};${finalB}m`;
      } else {
        // Monochrome
        finalR = monoRgb.r;
        finalG = monoRgb.g;
        finalB = monoRgb.b;
        hexColor = config.monoColor || '#e5e7eb';
        ansiCode = '';
      }

      lineCells.push({
        char,
        r: finalR,
        g: finalG,
        b: finalB,
        hex: hexColor,
        ansiCode
      });

      textLine += char;

      if (ansiCode) {
        if (ansiCode !== lastAnsiCode) {
          ansiLine += ansiCode;
          lastAnsiCode = ansiCode;
        }
        ansiLine += char;
      } else {
        ansiLine += char;
      }
    }

    if (lastAnsiCode) {
      ansiLine += '\x1b[0m';
    }

    resultLines.push(lineCells);
    textLines.push(textLine);
    ansiLines.push(ansiLine);
  }

  return {
    lines: resultLines,
    text: textLines.join('\n'),
    ansiText: ansiLines.join('\n'),
    width: targetCols,
    height: targetRows
  };
}

// Generate bash script file content
export function generateLinuxBashScript(ansiText: string, scriptTitle = 'ascii-art'): string {
  return `#!/usr/bin/env bash
# Generated by ASCII Studio for Linux
# Run in any ANSI / Truecolor terminal: bash ${scriptTitle}.sh

clear
cat << 'EOF'
${ansiText}
EOF
echo ""
`;
}

// Generate standalone HTML content
export function generateStandaloneHtml(result: AsciiResult, config: AsciiConfig): string {
  const bg = config.backgroundColor || '#0a0a0f';
  let htmlBody = '';

  for (const line of result.lines) {
    let lineHtml = '';
    for (const cell of line) {
      const char = cell.char === ' ' ? '&nbsp;' : cell.char === '<' ? '&lt;' : cell.char === '>' ? '&gt;' : cell.char === '&' ? '&amp;' : cell.char;
      lineHtml += `<span style="color:${cell.hex}">${char}</span>`;
    }
    htmlBody += `<div>${lineHtml}</div>\n`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ASCII Studio Artwork (${result.width}x${result.height})</title>
  <style>
    body {
      background-color: ${bg};
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    pre {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: ${config.fontSize}px;
      line-height: ${config.lineHeight};
      letter-spacing: ${config.letterSpacing}px;
      margin: 0;
      white-space: pre;
      user-select: text;
    }
  </style>
</head>
<body>
  <pre>${htmlBody}</pre>
</body>
</html>`;
}

export interface ImageExportOptions {
  scale?: number;
  backgroundColor?: string;
  transparentBg?: boolean;
}

// Generate scalable vector SVG representation of the ASCII art
export function generateAsciiSvg(result: AsciiResult, config: AsciiConfig, options?: ImageExportOptions): string {
  const fontSize = 12;
  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize * config.lineHeight;
  const width = Math.ceil(result.width * charWidth + 32);
  const height = Math.ceil(result.height * lineHeight + 32);
  const bg = options?.transparentBg ? 'none' : (options?.backgroundColor || config.backgroundColor || '#0a0a0f');

  let textNodes = '';
  for (let y = 0; y < result.lines.length; y++) {
    const line = result.lines[y];
    const posY = 16 + y * lineHeight + fontSize * 0.8;
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (cell.char !== ' ') {
        const escaped = cell.char === '<' ? '&lt;' : cell.char === '>' ? '&gt;' : cell.char === '&' ? '&amp;' : cell.char;
        const posX = 16 + x * charWidth;
        textNodes += `<text x="${posX.toFixed(1)}" y="${posY.toFixed(1)}" fill="${cell.hex}">${escaped}</text>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    text { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: ${fontSize}px; }
  </style>
  ${bg !== 'none' ? `<rect width="100%" height="100%" fill="${bg}" />` : ''}
  ${textNodes}
</svg>`;
}

// Render high-res PNG image of the ASCII art with precise typography and scale
export async function renderAsciiToImage(
  result: AsciiResult,
  config: AsciiConfig,
  options?: ImageExportOptions
): Promise<string> {
  // Ensure web fonts are ready if available
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const scale = options?.scale || 2; // 2x default for retina sharpness
      const baseFontSize = Math.max(8, config.fontSize);
      const fontSize = baseFontSize * scale;

      // Create dummy canvas to measure font glyph
      const measureCanvas = document.createElement('canvas');
      const measureCtx = measureCanvas.getContext('2d');
      if (measureCtx) {
        measureCtx.font = `${fontSize}px "JetBrains Mono", monospace`;
      }
      const charWidth = measureCtx ? measureCtx.measureText('M').width : fontSize * 0.6;
      const lineHeight = fontSize * config.lineHeight;

      const padding = 20 * scale;
      const canvasWidth = Math.ceil(result.width * charWidth + padding * 2);
      const canvasHeight = Math.ceil(result.height * lineHeight + padding * 2);

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      // Background
      if (!options?.transparentBg) {
        ctx.fillStyle = options?.backgroundColor || config.backgroundColor || '#0d0d12';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Font rendering
      ctx.font = `${fontSize}px "JetBrains Mono", "Courier New", monospace`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < result.lines.length; y++) {
        const line = result.lines[y];
        const posY = padding + y * lineHeight;

        for (let x = 0; x < line.length; x++) {
          const cell = line[x];
          if (cell.char !== ' ') {
            ctx.fillStyle = cell.hex;
            ctx.fillText(cell.char, padding + x * charWidth, posY);
          }
        }
      }

      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
}

// Utility to trigger file download in browser
export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

