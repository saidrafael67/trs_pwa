// Generador de iconos PWA en PNG puro sin dependencias (usando zlib nativo de Node.js)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcContent = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcContent);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(width, height, getPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image scanlines: filter byte (0) + 4 bytes per pixel
  const stride = 1 + width * 4;
  const rawData = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon generator logic: high contrast dark gym aesthetic (matte black background, vibrant lime/cyan barbell & plates)
function renderGymIcon(x, y, w, h, maskable = false) {
  // Normalize coordinates to -1..1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  // Background: Deep dark #0c0e12, subtle radial glow
  const rBg = Math.hypot(nx, ny);
  let bgR = 12;
  let bgG = 14;
  let bgB = 18;

  // Subtle radial gradient in center
  if (rBg < 0.9) {
    const glow = (1 - rBg / 0.9) * 0.15;
    bgR = Math.min(255, bgR + Math.round(glow * 40));
    bgG = Math.min(255, bgG + Math.round(glow * 180));
    bgB = Math.min(255, bgB + Math.round(glow * 90));
  }

  // Barbell coordinates
  // Scale down a bit if maskable for safe margin
  const s = maskable ? 0.65 : 0.82;
  const px = nx / s;
  const py = ny / s;

  // Check if pixel hits the barbell components:
  // 1. Center shaft: horizontal bar from -0.85 to 0.85, height 0.08
  // 2. Inner collars at -0.55 and 0.55
  // 3. Main big plates at -0.65..-0.58 and 0.58..0.65
  // 4. Secondary plates at -0.75..-0.68 and 0.68..0.75
  // 5. Outer collar/cap at -0.82..-0.78 and 0.78..0.82

  const absPx = Math.abs(px);
  const absPy = Math.abs(py);

  // Shaft (Titanium steel / silver-white)
  const isShaft = absPx <= 0.88 && absPy <= 0.055;

  // Big heavy plates (Electric neon green #00e676)
  const isPlate1 = absPx >= 0.54 && absPx <= 0.62 && absPy <= 0.58;

  // Medium plates (Cyan #00e5ff)
  const isPlate2 = absPx >= 0.64 && absPx <= 0.71 && absPy <= 0.46;

  // Smaller plates (Accent gold #ffd600)
  const isPlate3 = absPx >= 0.73 && absPx <= 0.79 && absPy <= 0.35;

  // Bar ends / collar
  const isCollar = absPx >= 0.49 && absPx <= 0.52 && absPy <= 0.16;

  // Knurling center knurl marks
  const isKnurl = isShaft && absPx <= 0.35 && Math.sin(px * 120) > 0.4;

  if (isPlate1) {
    // 3D edge highlight on plate 1
    const edge = (absPx > 0.61 || absPy > 0.55) ? 0.8 : 1.0;
    return [Math.round(0 * edge), Math.round(230 * edge), Math.round(118 * edge), 255];
  }

  if (isPlate2) {
    const edge = (absPx > 0.70 || absPy > 0.43) ? 0.8 : 1.0;
    return [Math.round(0 * edge), Math.round(229 * edge), Math.round(255 * edge), 255];
  }

  if (isPlate3) {
    return [255, 214, 0, 255];
  }

  if (isCollar) {
    return [220, 225, 235, 255];
  }

  if (isShaft) {
    if (isKnurl) {
      return [180, 190, 205, 255];
    }
    return [240, 245, 255, 255];
  }

  // Rounded app border for non-maskable icons
  if (!maskable) {
    const cornerR = 0.22;
    const dx = Math.max(0, Math.abs(nx) - (1 - cornerR));
    const dy = Math.max(0, Math.abs(ny) - (1 - cornerR));
    if (Math.hypot(dx, dy) > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside rounded squircle
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate files
const sizes = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false }
];

for (const { file, size, maskable } of sizes) {
  const buf = createPNG(size, size, (x, y, w, h) => renderGymIcon(x, y, w, h, maskable));
  fs.writeFileSync(path.join(__dirname, file), buf);
  console.log(`Generated ${file} (${size}x${size}, ${buf.length} bytes)`);
}

// Generate favicon.svg & icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141820"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
    <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#b0b5c0"/>
    </linearGradient>
    <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00ff88"/>
      <stop offset="100%" stop-color="#00b050"/>
    </linearGradient>
    <linearGradient id="p2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#0088cc"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <!-- Barbell shaft -->
  <rect x="50" y="242" width="412" height="28" rx="6" fill="url(#shaft)"/>
  <!-- Knurling center -->
  <rect x="180" y="244" width="152" height="24" rx="2" fill="#88909e" opacity="0.6"/>
  <!-- Collars -->
  <rect x="125" y="216" width="12" height="80" rx="4" fill="#d0d5e0"/>
  <rect x="375" y="216" width="12" height="80" rx="4" fill="#d0d5e0"/>
  <!-- Big plates (Green) -->
  <rect x="95" y="116" width="24" height="280" rx="8" fill="url(#p1)"/>
  <rect x="393" y="116" width="24" height="280" rx="8" fill="url(#p1)"/>
  <!-- Medium plates (Cyan) -->
  <rect x="68" y="156" width="22" height="200" rx="6" fill="url(#p2)"/>
  <rect x="422" y="156" width="22" height="200" rx="6" fill="url(#p2)"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'favicon.svg'), svg);
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svg);
console.log('Generated favicon.svg & icon.svg');
