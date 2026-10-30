# Student Guide: The Computer Science of ASCII Art & Image Processing

Welcome to **ASCII Studio**! This guide breaks down the mathematics, computer graphics algorithms, and terminal protocols used to convert digital images into ASCII artwork on Linux.

---

## 1. How Digital Images Work

A digital raster image is a 2D matrix of colored squares called **pixels** (picture elements):
$$\text{Image}[x, y] = [R, G, B, A]$$

- **$R$ (Red)**: $0 \to 255$ (8 bits)
- **$G$ (Green)**: $0 \to 255$ (8 bits)
- **$B$ (Blue)**: $0 \to 255$ (8 bits)
- **$A$ (Alpha / Opacity)**: $0.0 \to 1.0$

In a typical full HD photo ($1920 \times 1080$), there are over **2 million pixels**. However, a typical Linux terminal is only **80 to 120 characters wide**. Therefore, the first step is downscaling and spatial resampling.

---

## 2. Step 1: Character Aspect Ratio Compensation

### Why Do Images Look Stretched Without Correction?
In digital screens, pixels are usually square ($1:1$ aspect ratio). But in monospace fonts (like *JetBrains Mono*, *Courier*, or *Consolas*), a character is about **twice as tall as it is wide** (aspect ratio $\approx 1:2$ or $0.5$).

If you mapped 1 pixel directly to 1 character, the resulting ASCII art would look stretched vertically by $2\times$!

### The Formula:
To preserve the original geometry:
$$\text{Output Columns} = W_{\text{target}}$$
$$\text{Output Rows} = W_{\text{target}} \times \left(\frac{\text{Image Height}}{\text{Image Width}}\right) \times \text{CharAspectRatio}$$

Where $\text{CharAspectRatio} \approx 0.50 \text{ to } 0.55$.

---

## 3. Step 2: Perceptual Luminance (Grayscale Conversion)

Computers see colors as Red, Green, and Blue, but the human eye has unequal sensitivity to different wavelengths:
- **Green** looks brightest to human eyes because we have more M-cones (wavelength $\approx 530\text{ nm}$).
- **Red** is moderately bright.
- **Blue** looks darkest.

Instead of simple averaging $\frac{R+G+B}{3}$, we use the **ITU-R BT.601 standard**:
$$Y = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

Notice that Green accounts for nearly **$59\%$** of perceived brightness, Red for **$30\%$**, and Blue for only **$11\%$**!

---

## 4. Step 3: Brightness, Contrast, and Gamma Curves

Before assigning characters, we adjust the pixel dynamics:

### Brightness (Additive Offset):
$$V' = \text{clamp}(V + \text{offset}, 0, 255)$$

### Contrast (S-Curve Expansion):
$$\text{Factor} = \frac{259 \times (\text{contrast} + 255)}{255 \times (259 - \text{contrast})}$$
$$V' = \text{clamp}(\text{Factor} \times (V - 128) + 128, 0, 255)$$
This pivots around mid-gray ($128$), pushing brights brighter and darks darker.

### Gamma Correction (Power Law):
Human perception of brightness follows an exponential curve:
$$V' = 255 \times \left(\frac{V}{255}\right)^{\frac{1}{\gamma}}$$
- $\gamma > 1.0$: lifts shadows, revealing details in dark areas.
- $\gamma < 1.0$: suppresses noise, enriching highlights.

---

## 5. Step 4: Edge Detection via Sobel Convolution

To detect outlines (like in cartoons, logos, or silhouettes), we use a **3×3 Sobel filter**. It computes the discrete gradient across horizontal ($G_x$) and vertical ($G_y$) directions:

$$G_x = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix} * \text{Image}$$

$$G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1 \end{bmatrix} * \text{Image}$$

### Edge Magnitude:
$$G = \sqrt{G_x^2 + G_y^2}$$

If $G > \text{Threshold}$, the pixel is identified as an edge and assigned an outline glyph.

---

## 5B. Text Overlay & Pre-Conversion Compositing

When you place text on an image before ASCII conversion:
1. **Coordinate Normalization**: Text position is stored as percentages ($X\%, Y\%$) relative to the image bounds so it stays in the exact same location when resolution changes.
2. **Rasterization**: The text is drawn directly onto the offscreen canvas pixel buffer *before* luminance sampling.
3. **Glyph Synthesis**: Because the text is now part of the raw image pixels, the ASCII generator's character mapping, edge detection, and dithering algorithms convert the letters into matching ASCII glyphs! High-contrast outlines ensure the text remains legible across bright or dark backgrounds.

---

## 6. Step 5: Dithering (Simulating Continuous Tones)

When converting a smooth photograph into only 10 or 70 discrete ASCII characters, harsh banding (quantization error) can occur. **Dithering** tricks the human eye into perceiving smooth gradients.

### Floyd-Steinberg Error Diffusion:
For every pixel, we determine the closest discrete character value, compute the quantization error:
$$\text{Error} = \text{Old Value} - \text{Quantized Value}$$

Then we diffuse that error to neighboring unvisited pixels using this matrix:

```
          [ Current Pixel ]   ----->   (x + 1, y)   [+ 7/16]
(x - 1, y + 1) [+ 3/16]       (x, y + 1) [+ 5/16]   (x + 1, y + 1) [+ 1/16]
```

$$\sum = \frac{7}{16} + \frac{3}{16} + \frac{5}{16} + \frac{1}{16} = \frac{16}{16} = 1.0 \quad \text{(Energy is conserved!)}$$

---

## 7. Step 6: Optical Character Density Mapping

Each character has an **optical density** based on the ratio of dark ink/pixels to empty space:

| Character | Optical Density | Brightness Rank |
| :---: | :---: | :---: |
| `@` | Dense glyph, lots of pixels filled | Darkest / Heaviest ($0\%$) |
| `%` / `#` | Medium-heavy fill | Deep Shadow ($20\%$) |
| `*` / `+` | Moderate fill | Midtone ($50\%$) |
| `:` / `.` | Tiny dots | Highlight ($80\%$) |
| ` ` (space) | Completely blank | Pure Light / White ($100\%$) |

### Standard 10-level ramp:
`@%#*+=-:. `

### Ultra-detailed 70-level ramp:
`$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'. `

---

## 8. Step 7: ANSI Escape Sequences for Linux Terminal

In modern Linux terminals (GNOME Terminal, Alacritty, Kitty, Konsole), colors are transmitted using **ANSI Escape Codes**:

### Truecolor (24-bit RGB):
`\x1b[38;2;R;G;Bm`
- `\x1b[` (Escape code `0x1B` + `[`, also called CSI — Control Sequence Introducer)
- `38`: Set foreground color
- `2`: Truecolor 24-bit RGB mode
- `R;G;B`: Red, Green, and Blue values ($0\text{--}255$)
- `m`: Graphics Select Rendition (SGR) terminator

### Reset Sequence:
`\x1b[0m` resets the terminal to standard colors.

### Example in Bash:
```bash
echo -e "\x1b[38;2;255;100;0mHello Linux!\x1b[0m"
```

---

## 9. Hands-On Student Exercises

1. **Exercise 1 (Custom Character Ramps)**:
   - Try designing your own 5-character ramp in the Custom input (e.g. `M+#. `).
   - How does the image clarity change when using mathematical symbols vs alphabetic letters?

2. **Exercise 2 (Dithering Comparison)**:
   - Load a portrait or face photo.
   - Switch between **None**, **Floyd-Steinberg**, and **Atkinson**.
   - Notice how Floyd-Steinberg produces smooth continuous shading, while Atkinson produces high-contrast vintage textures.

3. **Exercise 3 (Linux Bash Automation)**:
   - Export your art as `.sh`.
   - Open a terminal and run `bash ascii-art.sh`.
   - Pipe it into a pager: `bash ascii-art.sh | less -R` (the `-R` flag tells `less` to interpret raw ANSI escape sequences!).

---

*Authored for students learning Computer Graphics, Linux Shell Scripting, and Image Processing.*
