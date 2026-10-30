/**
 * Pre-bundled high quality sample images for instant testing
 */

export interface SampleImage {
  id: string;
  name: string;
  tag: string;
  url: string;
}

// Tux the Linux Penguin vector SVG data URL
const TUX_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="400" height="440">
  <defs>
    <radialGradient id="tuxShine" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#44444a"/>
      <stop offset="100%" stop-color="#0a0a0d"/>
    </radialGradient>
    <linearGradient id="beak" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffcc00"/>
      <stop offset="100%" stop-color="#e68a00"/>
    </linearGradient>
  </defs>
  <!-- Background circle -->
  <circle cx="200" cy="220" r="190" fill="#181822"/>
  <circle cx="200" cy="220" r="185" fill="#20202e" stroke="#3b8eea" stroke-width="4"/>
  
  <!-- Feet -->
  <ellipse cx="140" cy="385" rx="55" ry="25" fill="url(#beak)"/>
  <ellipse cx="260" cy="385" rx="55" ry="25" fill="url(#beak)"/>
  
  <!-- Body Main -->
  <ellipse cx="200" cy="250" rx="120" ry="140" fill="url(#tuxShine)"/>
  <!-- Flippers -->
  <ellipse cx="85" cy="270" rx="35" ry="75" transform="rotate(22 85 270)" fill="url(#tuxShine)"/>
  <ellipse cx="315" cy="270" rx="35" ry="75" transform="rotate(-22 315 270)" fill="url(#tuxShine)"/>
  
  <!-- White Belly -->
  <ellipse cx="200" cy="275" rx="85" ry="105" fill="#f8fafc"/>
  
  <!-- Head -->
  <ellipse cx="200" cy="150" rx="85" ry="80" fill="url(#tuxShine)"/>
  
  <!-- Eyes -->
  <ellipse cx="170" cy="135" rx="20" ry="26" fill="#ffffff"/>
  <ellipse cx="230" cy="135" rx="20" ry="26" fill="#ffffff"/>
  <ellipse cx="176" cy="136" rx="9" ry="13" fill="#000000"/>
  <ellipse cx="224" cy="136" rx="9" ry="13" fill="#000000"/>
  <circle cx="174" cy="132" r="3" fill="#ffffff"/>
  <circle cx="222" cy="132" r="3" fill="#ffffff"/>
  
  <!-- Beak -->
  <polygon points="200,148 160,185 240,185" fill="url(#beak)"/>
  <ellipse cx="200" cy="186" rx="42" ry="14" fill="#d97706"/>
</svg>
`)}`;

// Retro Linux Terminal / Computer SVG data URL
const RETRO_PC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#0f172a"/>
  <!-- Monitor Casing -->
  <rect x="50" y="40" width="300" height="230" rx="16" fill="#cbd5e1" stroke="#94a3b8" stroke-width="6"/>
  <!-- Bezel -->
  <rect x="70" y="60" width="260" height="190" rx="8" fill="#1e293b"/>
  <!-- CRT Screen Glow -->
  <rect x="80" y="70" width="240" height="170" rx="6" fill="#022c22"/>
  
  <!-- Green Terminal Text Lines -->
  <text x="95" y="105" font-family="monospace" font-size="14" font-weight="bold" fill="#34d399">root@archlinux:~# uname -a</text>
  <text x="95" y="125" font-family="monospace" font-size="12" fill="#10b981">Linux 6.8.0-zen1 #1 SMP PREEMPT</text>
  <text x="95" y="145" font-family="monospace" font-size="12" fill="#10b981">Kernel: x86_64 GNU/Linux</text>
  <text x="95" y="170" font-family="monospace" font-size="14" font-weight="bold" fill="#34d399">root@archlinux:~# ascii-studio</text>
  <text x="95" y="195" font-family="monospace" font-size="13" fill="#6ee7b7">&gt;&gt; Ready for image conversion</text>
  <rect x="95" y="208" width="10" height="16" fill="#34d399"/>
  
  <!-- Stand & Base -->
  <path d="M160,270 L140,310 L260,310 L240,270 Z" fill="#94a3b8"/>
  <rect x="110" y="310" width="180" height="24" rx="6" fill="#cbd5e1"/>
  
  <!-- Keyboard -->
  <polygon points="60,350 340,350 365,385 35,385" fill="#94a3b8"/>
  <polygon points="75,355 325,355 348,380 52,380" fill="#475569"/>
</svg>
`)}`;

// Cyberpunk Cityscape SVG
const CYBERPUNK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="100%">
      <stop offset="0%" stop-color="#090514"/>
      <stop offset="60%" stop-color="#2d0a4e"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
    <radialGradient id="neonSun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#skyGrad)"/>
  
  <!-- Retro Grid Sun -->
  <circle cx="200" cy="190" r="80" fill="url(#neonSun)"/>
  <line x1="120" y1="160" x2="280" y2="160" stroke="#090514" stroke-width="3"/>
  <line x1="123" y1="175" x2="277" y2="175" stroke="#090514" stroke-width="4"/>
  <line x1="130" y1="192" x2="270" y2="192" stroke="#090514" stroke-width="5"/>
  <line x1="145" y1="212" x2="255" y2="212" stroke="#090514" stroke-width="6"/>

  <!-- Skyline Silhouettes -->
  <rect x="20" y="210" width="45" height="190" fill="#0b0818"/>
  <rect x="50" y="170" width="55" height="230" fill="#160e29"/>
  <rect x="90" y="230" width="50" height="170" fill="#0a0515"/>
  <rect x="130" y="150" width="60" height="250" fill="#1b0e36"/>
  <!-- Antennas -->
  <line x1="160" y1="100" x2="160" y2="150" stroke="#00f0ff" stroke-width="2"/>
  <circle cx="160" cy="100" r="3" fill="#00f0ff"/>

  <rect x="180" y="200" width="60" height="200" fill="#0e081c"/>
  <rect x="230" y="165" width="55" height="235" fill="#1b0e36"/>
  <rect x="275" y="220" width="50" height="180" fill="#120924"/>
  <rect x="315" y="180" width="65" height="220" fill="#180e2f"/>

  <!-- Neon windows -->
  <rect x="65" y="190" width="4" height="6" fill="#00f0ff"/>
  <rect x="75" y="190" width="4" height="6" fill="#00f0ff"/>
  <rect x="65" y="205" width="4" height="6" fill="#ff007f"/>
  <rect x="145" y="175" width="5" height="7" fill="#ffe600"/>
  <rect x="160" y="175" width="5" height="7" fill="#ffe600"/>
  <rect x="245" y="185" width="4" height="6" fill="#00f0ff"/>
  <rect x="255" y="185" width="4" height="6" fill="#00f0ff"/>
</svg>
`)}`;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'tux',
    name: 'Tux Penguin',
    tag: 'Linux Mascot',
    url: TUX_SVG
  },
  {
    id: 'retro-pc',
    name: 'Arch Terminal',
    tag: 'Linux Console',
    url: RETRO_PC_SVG
  },
  {
    id: 'cyberpunk',
    name: 'Neon Sunset',
    tag: 'High Contrast',
    url: CYBERPUNK_SVG
  }
];
