import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIconPNG(size: number): Buffer {
  const width = size;
  const height = size;
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outer rounded border / futuristic shield
      if (dist <= radius) {
        // Gradient dark background
        const t = (y / height);
        const r = Math.round(8 + t * 15);
        const g = Math.round(14 + t * 20);
        const b = Math.round(26 + t * 35);

        // Cyan / Electric Blue glow ring at edge
        if (dist >= radius - 3) {
          rawData[pxOffset] = 0;       // R
          rawData[pxOffset + 1] = 240; // G
          rawData[pxOffset + 2] = 255; // B (cyan)
          rawData[pxOffset + 3] = 255; // Alpha
        } else if (dist >= radius - 6) {
          rawData[pxOffset] = 14;
          rawData[pxOffset + 1] = 165;
          rawData[pxOffset + 2] = 233;
          rawData[pxOffset + 3] = 230;
        } else {
          // Center symbol: A sleek stylized "C" and lightning / target command symbol
          // Let's draw an inner ring and center dot
          const innerDist = Math.abs(dist - radius * 0.55);
          const isCenterCross = (Math.abs(dx) <= 2 && Math.abs(dy) <= radius * 0.4) || (Math.abs(dy) <= 2 && Math.abs(dx) <= radius * 0.4);

          if (innerDist <= 2.5) {
            // Neon cyan ring
            rawData[pxOffset] = 0;
            rawData[pxOffset + 1] = 240;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else if (isCenterCross) {
            // Bright white/cyan reticle
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 255;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = r;
            rawData[pxOffset + 1] = g;
            rawData[pxOffset + 2] = b;
            rawData[pxOffset + 3] = 255;
          }
        }
      } else {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(pngBuffer: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  dirEntry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  dirEntry.writeUInt8(0, 2); // Color palette
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Image data size
  dirEntry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const png256 = generateIconPNG(256);
fs.writeFileSync(path.join(buildDir, 'icon.png'), png256);

const ico = createIco(png256, 256);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);

console.log('Successfully generated build/icon.png and build/icon.ico!');
