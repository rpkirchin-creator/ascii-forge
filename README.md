# ASCII Studio — Linux Image to ASCII Art Converter
# Coded with Gemini by Randy Kirchin
A high-performance, Linux-focused ASCII art generator and converter with an interactive GUI, authentic Linux terminal emulator preview, Floyd-Steinberg dithering, Sobel edge detection, and multi-format export capabilities.

---

## Features

- **Intuitive GUI**: Clean, distraction-free desktop interface built with Tailwind CSS and React.
- **Image Input**:
  - Drag-and-drop file upload.
  - File picker supporting `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, and `.gif`.
  - Global `Ctrl+V` clipboard paste.
  - 90° image rotation and quick test samples (Tux Linux mascot, Arch Terminal, Cyberpunk skyline).
- **Interactive Region Cropper**: Draggable crop box with aspect ratio presets (Free, 1:1, 4:3, 16:9, and 80×24 Terminal).
- **Character Sets**:
  - 8 predefined ramps (Simple, Standard, Detailed 70-level, Unicode Blocks, Braille Dots, Binary, Minimal Slants, Matrix Code).
  - Custom user-defined character ramp input with real-time character count.
  - Invert luminance toggle.
- **Color Engines**:
  - **Truecolor RGB (24-bit)**: Exact image pixel sampling with ANSI truecolor escape codes.
  - **Linux ANSI 16-Color**: Nearest-neighbor quantization to standard Linux console colors.
  - **Curated Palettes**: Matrix Phosphor Green, Amber CRT, Solarized Dark, Gruvbox, Nord, Cyberpunk, Game Boy.
  - **Monochrome**: Single foreground color with CRT green/amber presets.
- **Image Processing Algorithms**:
  - Perceptual luminance calculation (ITU-R BT.601: $Y = 0.299R + 0.587G + 0.114B$).
  - Character aspect ratio compensation ($\approx 0.52$) to avoid monospace font stretching.
  - S-curve contrast expansion and exponential power-law gamma curves.
  - 3×3 Sobel convolution filter for contour and outline detection.
  - Dithering algorithms: Floyd-Steinberg error diffusion, Atkinson, and Bayer 4×4 ordered dithering.
- **Export Suite**:
  - **Plain Text (`.txt`)**: 1-click download of pure ASCII text.
  - **High-Res Image (`.png`)**: 1× / 2× Retina / 3× Ultra 4K scaling with custom or transparent background.
  - **Bash Shell Script (`.sh`)**: Ready to run with `bash art.sh`.
  - **ANSI Art File (`.ans`)**: Raw terminal escape stream for `cat art.ans`.
  - **Vector Image (`.svg`)**: Scalable vector format.
  - **Webpage (`.html`)**: Standalone colored HTML document.

---

## Quick Start on Linux

### 1. Run in Browser
Open your Linux web browser (Firefox, Chrome, Brave) and visit the hosted URL.

### 2. Run Locally via Node.js
```bash
# Clone or extract project
cd ascii-studio

# Install dependencies
npm install

# Start local server
npm run dev
# Open http://localhost:3000
```

### 3. Run as a Borderless Linux Desktop Window
```bash
google-chrome --app=http://localhost:3000
# or with Brave:
brave --app=http://localhost:3000
```

---

## Educational Documentation

For a comprehensive explanation of the computer science, color models, convolution kernels, and dithering math, see [`STUDENT_GUIDE.md`](./STUDENT_GUIDE.md).
