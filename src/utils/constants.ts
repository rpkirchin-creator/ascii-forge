import { CharsetOption, ColorPalette } from '../types';

export const PREDEFINED_CHARSETS: CharsetOption[] = [
  {
    id: 'simple',
    name: 'Simple (10 levels)',
    characters: '@%#*+=-:. ',
    description: 'Clean, highly readable ASCII characters'
  },
  {
    id: 'standard',
    name: 'Standard (12 levels)',
    characters: '@#S%?*+;:,. ',
    description: 'Classic ASCII generator charset'
  },
  {
    id: 'detailed',
    name: 'Detailed (70 levels)',
    characters: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    description: 'Ultra high dynamic range with smooth gradients'
  },
  {
    id: 'artistic_blocks',
    name: 'Artistic Blocks & Shades',
    characters: '█▓▒░ ',
    description: 'Crisp Unicode block density graphics'
  },
  {
    id: 'artistic_braille',
    name: 'Artistic Braille / Dots',
    characters: '⣿⣾⣽⣻⢿⡿⣟⣝⠁ ',
    description: 'Dense stippling dot pattern'
  },
  {
    id: 'binary',
    name: 'Binary (0 & 1)',
    characters: '10 ',
    description: 'Hacker / Matrix digital raw code'
  },
  {
    id: 'minimal',
    name: 'Minimalist Slants',
    characters: '/#\\*+:. ',
    description: 'Modern geometric line appearance'
  },
  {
    id: 'matrix',
    name: 'Retro Matrix Code',
    characters: 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ9876543210 ',
    description: 'Authentic cyberpunk terminal look'
  }
];

export const ANSI_16_COLORS = [
  { name: 'Black', hex: '#000000', ansi: 30, ansiBright: 90, r: 0, g: 0, b: 0 },
  { name: 'Red', hex: '#cd3131', ansi: 31, ansiBright: 91, r: 205, g: 49, b: 49 },
  { name: 'Green', hex: '#0dbc79', ansi: 32, ansiBright: 92, r: 13, g: 188, b: 121 },
  { name: 'Yellow', hex: '#e5e510', ansi: 33, ansiBright: 93, r: 229, g: 229, b: 16 },
  { name: 'Blue', hex: '#2472c8', ansi: 34, ansiBright: 94, r: 36, g: 114, b: 200 },
  { name: 'Magenta', hex: '#bc3fbc', ansi: 35, ansiBright: 95, r: 188, g: 63, b: 188 },
  { name: 'Cyan', hex: '#11a8cd', ansi: 36, ansiBright: 96, r: 17, g: 168, b: 205 },
  { name: 'White', hex: '#e5e5e5', ansi: 37, ansiBright: 97, r: 229, g: 229, b: 229 },
  { name: 'Bright Black', hex: '#666666', ansi: 90, ansiBright: 90, r: 102, g: 102, b: 102 },
  { name: 'Bright Red', hex: '#f14c4c', ansi: 91, ansiBright: 91, r: 241, g: 76, b: 76 },
  { name: 'Bright Green', hex: '#23d18b', ansi: 92, ansiBright: 92, r: 35, g: 209, b: 139 },
  { name: 'Bright Yellow', hex: '#f5f543', ansi: 93, ansiBright: 93, r: 245, g: 245, b: 67 },
  { name: 'Bright Blue', hex: '#3b8eea', ansi: 94, ansiBright: 94, r: 59, g: 142, b: 234 },
  { name: 'Bright Magenta', hex: '#d670d6', ansi: 95, ansiBright: 95, r: 214, g: 112, b: 214 },
  { name: 'Bright Cyan', hex: '#29b8db', ansi: 96, ansiBright: 96, r: 41, g: 184, b: 219 },
  { name: 'Bright White', hex: '#ffffff', ansi: 97, ansiBright: 97, r: 255, g: 255, b: 255 },
];

export const CURATED_PALETTES: ColorPalette[] = [
  {
    id: 'linux-term',
    name: 'Linux ANSI Terminal',
    description: '16 classic terminal colors for bash/zsh',
    colors: ['#000000', '#cd3131', '#0dbc79', '#e5e510', '#2472c8', '#bc3fbc', '#11a8cd', '#e5e5e5', '#666666', '#f14c4c', '#23d18b', '#f5f543', '#3b8eea', '#d670d6', '#29b8db', '#ffffff'],
    background: '#121214'
  },
  {
    id: 'green-matrix',
    name: 'Matrix Phosphor Green',
    description: 'Retro 80s monochrome green phosphor CRT',
    colors: ['#041a0b', '#0a3d1b', '#136e31', '#1fa34a', '#2bf26f', '#7effa7', '#dffff0'],
    background: '#040d06'
  },
  {
    id: 'amber-crt',
    name: 'Amber Monochrome CRT',
    description: 'Warm vintage VT220 terminal display',
    colors: ['#2b1700', '#5e3200', '#9c5500', '#d97800', '#ffa62b', '#ffd180', '#fff3e0'],
    background: '#0f0a04'
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    description: 'Ethan Schoonover designed developer palette',
    colors: ['#002b36', '#073642', '#586e75', '#657b83', '#268bd2', '#2aa198', '#859900', '#b58900', '#cb4b16', '#dc322f', '#d33682', '#6c71c4'],
    background: '#002b36'
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Retro Dark',
    description: 'Warm earthy retro groove palette',
    colors: ['#282828', '#3c3836', '#504945', '#cc241d', '#98971a', '#d79921', '#458588', '#b16286', '#689d6a', '#a89984', '#fb4934', '#b8bb26', '#fabd2f'],
    background: '#1d2021'
  },
  {
    id: 'nord',
    name: 'Nord Frost Arctic',
    description: 'Calm arctic North-Atlantic color suite',
    colors: ['#2e3440', '#3b4252', '#4c566a', '#d8dee9', '#88c0d0', '#81a1c1', '#5e81ac', '#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#b48ead'],
    background: '#242933'
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'High-contrast synthetic night city lights',
    colors: ['#0d0c1d', '#3f1a52', '#7928ca', '#ff007f', '#ff5400', '#ffe600', '#00f0ff', '#00ff88', '#ffffff'],
    background: '#05040a'
  },
  {
    id: 'gameboy',
    name: 'Game Boy 4-Level Green',
    description: 'Classic 1989 monochrome handheld palette',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    background: '#0f380f'
  }
];

export const PRESET_CONFIGS = [
  {
    id: 'linux-default',
    name: 'Linux Terminal 80-Col',
    description: 'Standard 80 column width with image colors',
    config: {
      width: 80,
      charsetKey: 'standard' as const,
      colorMode: 'image' as const,
      dither: 'none' as const,
      contrast: 10,
      brightness: 0,
      gamma: 1.0,
      charAspectRatio: 0.52
    }
  },
  {
    id: 'detailed-hd',
    name: 'Detailed 120-Col HD',
    description: 'High resolution 70-level characters with Floyd-Steinberg dithering',
    config: {
      width: 120,
      charsetKey: 'detailed' as const,
      colorMode: 'image' as const,
      dither: 'floyd-steinberg' as const,
      contrast: 20,
      brightness: 5,
      gamma: 1.1,
      charAspectRatio: 0.52
    }
  },
  {
    id: 'retro-matrix',
    name: 'Matrix Digital Rain',
    description: 'Glowing green Katakana and numbers on dark terminal',
    config: {
      width: 90,
      charsetKey: 'matrix' as const,
      colorMode: 'palette' as const,
      paletteId: 'green-matrix',
      dither: 'bayer-4x4' as const,
      contrast: 25,
      brightness: 10,
      gamma: 1.2,
      charAspectRatio: 0.55
    }
  },
  {
    id: 'ansi-classic',
    name: 'ANSI 16-Color Shell',
    description: 'Standard Linux console colors for bash output',
    config: {
      width: 80,
      charsetKey: 'simple' as const,
      colorMode: 'ansi16' as const,
      dither: 'floyd-steinberg' as const,
      contrast: 15,
      brightness: 0,
      gamma: 1.0,
      charAspectRatio: 0.52
    }
  },
  {
    id: 'block-poster',
    name: 'Artistic Block Art',
    description: 'Unicode shade blocks with vivid colors',
    config: {
      width: 70,
      charsetKey: 'artistic_blocks' as const,
      colorMode: 'image' as const,
      dither: 'none' as const,
      contrast: 25,
      brightness: 0,
      gamma: 1.0,
      charAspectRatio: 0.50
    }
  },
  {
    id: 'monochrome-classic',
    name: 'Classic Text (No Color)',
    description: 'Pure monochrome text ready to paste anywhere',
    config: {
      width: 80,
      charsetKey: 'standard' as const,
      colorMode: 'monochrome' as const,
      dither: 'floyd-steinberg' as const,
      contrast: 20,
      brightness: 5,
      gamma: 1.0,
      charAspectRatio: 0.52
    }
  }
];
