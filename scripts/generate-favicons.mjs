/**
 * Writes raster favicons matching `RedDot`: cream field, red ring, cream center.
 * Run: node scripts/generate-favicons.mjs
 *
 * Outputs:
 *   app/favicon.ico — Next serves /favicon.ico (Safari-friendly)
 *   public/apple-touch-icon.png — 180×180 for iOS
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appDir = path.join(root, "app");
const pub = path.join(root, "public");

function crc32(buf) {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** 8-bit RGBA PNG, filter type 0 per scanline */
function makePng(width, height, rgbaAt) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = rgbaAt(x, y);
      const o = y * (width * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const CREAM = [239, 236, 225, 255];
const RED = [194, 58, 42, 255];

/** RedDot: outer red disc, inner cream hole (~⅓ diameter). */
function redDotRgba(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const px = x + 0.5;
  const py = y + 0.5;
  const d = Math.hypot(px - cx, py - cy);
  const margin = Math.max(1, size * 0.06);
  const rOuter = size / 2 - margin;
  const rInner = rOuter * 0.33;
  if (d <= rInner) return CREAM;
  if (d <= rOuter) return RED;
  return CREAM;
}

function pngIco(size) {
  return makePng(size, size, (x, y) => redDotRgba(x, y, size));
}

function pngToIco(pngBuf) {
  const reserved = Buffer.alloc(2);
  const type = Buffer.alloc(2);
  type.writeUInt16LE(1, 0);
  const count = Buffer.alloc(2);
  count.writeUInt16LE(1, 0);
  const entry = Buffer.alloc(16);
  const dim = 32;
  entry.writeUInt8(dim < 256 ? dim : 0, 0);
  entry.writeUInt8(dim < 256 ? dim : 0, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([reserved, type, count, entry, pngBuf]);
}

const fav32 = pngIco(32);
const apple = pngIco(180);

fs.mkdirSync(appDir, { recursive: true });
fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(appDir, "favicon.ico"), pngToIco(fav32));
fs.writeFileSync(path.join(pub, "favicon.ico"), pngToIco(fav32));
fs.writeFileSync(path.join(pub, "apple-touch-icon.png"), apple);
console.log("Wrote app/favicon.ico, public/favicon.ico, public/apple-touch-icon.png");
