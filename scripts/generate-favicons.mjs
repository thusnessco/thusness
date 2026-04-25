/**
 * Writes raster favicons. Run: node scripts/generate-favicons.mjs
 *
 * Mark: **thin red stroke ring + solid red center dot** (not a thick donut with a
 * punched hole). Tab PNGs use a transparent field outside the ring; Apple touch
 * uses the cream page background with the same mark.
 *
 * Outputs:
 *   public/favicon.ico — ICO for legacy clients
 *   public/favicon-32.png — PNG for Safari tab icons
 *   public/apple-touch-icon.png — 180×180 for iOS
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
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
const TRANSPARENT = [0, 0, 0, 0];

function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Thin ring (stroke centered at rRing) + filled center dot.
 * @param {number} mode 0 = transparent outside ring (tab), 1 = cream outside (apple)
 */
function thinRingDotRgba(x, y, size, mode) {
  const cx = size / 2;
  const cy = size / 2;
  const px = x + 0.5;
  const py = y + 0.5;
  const d = Math.hypot(px - cx, py - cy);

  const rRing = size / 2 - size * 0.125;
  const halfStroke = Math.max(0.55, size * 0.022);
  const rDot = Math.max(1.9, size * 0.072);

  const ringDist = Math.abs(d - rRing);
  let ringA = 0;
  if (ringDist < halfStroke + 0.55) {
    ringA = 1 - smoothstep((ringDist - (halfStroke - 0.35)) / 0.9);
  }

  let dotA = 0;
  if (d < rDot + 0.45) {
    dotA = 1 - smoothstep((d - (rDot - 0.35)) / 0.8);
  }

  const a = Math.max(ringA, dotA);
  if (a <= 0.001) {
    return mode === 1 ? CREAM : TRANSPARENT;
  }
  if (a >= 0.999) return RED;
  return [RED[0], RED[1], RED[2], Math.round(255 * a)];
}

function tabIconRgba(x, y, size) {
  return thinRingDotRgba(x, y, size, 0);
}

function appleTouchRgba(x, y, size) {
  return thinRingDotRgba(x, y, size, 1);
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

const fav32 = makePng(32, 32, (x, y) => tabIconRgba(x, y, 32));
const apple = makePng(180, 180, (x, y) => appleTouchRgba(x, y, 180));

fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(pub, "favicon.ico"), pngToIco(fav32));
fs.writeFileSync(path.join(pub, "favicon-32.png"), fav32);
fs.writeFileSync(path.join(pub, "apple-touch-icon.png"), apple);
console.log(
  "Wrote public/favicon.ico, public/favicon-32.png, public/apple-touch-icon.png",
);
