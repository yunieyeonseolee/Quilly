const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets', 'images');

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writePng(fileName, width, height, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const png = Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(path.join(OUT, fileName), png);
}

function hex(value) {
  const clean = value.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function createPixels(width, height, transparent = false) {
  const pixels = Buffer.alloc(width * height * 4);
  if (!transparent) {
    drawBackground(pixels, width, height);
  }
  return pixels;
}

function blend(pixels, index, color, alpha) {
  const nextA = clamp(alpha);
  if (nextA <= 0) return;

  const prevA = pixels[index + 3] / 255;
  const outA = nextA + prevA * (1 - nextA);

  if (outA <= 0) return;

  pixels[index] = Math.round((color[0] * nextA + pixels[index] * prevA * (1 - nextA)) / outA);
  pixels[index + 1] = Math.round((color[1] * nextA + pixels[index + 1] * prevA * (1 - nextA)) / outA);
  pixels[index + 2] = Math.round((color[2] * nextA + pixels[index + 2] * prevA * (1 - nextA)) / outA);
  pixels[index + 3] = Math.round(outA * 255);
}

function drawBackground(pixels, width, height) {
  const top = hex('#f6fffb');
  const middle = hex('#fff7fb');
  const bottom = hex('#ffe4ef');

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / Math.max(width - 1, 1);
      const ny = y / Math.max(height - 1, 1);
      const vertical = ny < 0.52
        ? mix(top, middle, ny / 0.52)
        : mix(middle, bottom, (ny - 0.52) / 0.48);
      const glow = clamp(1 - Math.hypot(nx - 0.35, ny - 0.22) / 0.75);
      const color = mix(vertical, hex('#ffeef6'), glow * 0.28);
      const index = (y * width + x) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = 255;
    }
  }
}

function lineDistance(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const c1 = vx * wx + vy * wy;
  const c2 = vx * vx + vy * vy;
  const t = c2 === 0 ? 0 : clamp(c1 / c2);
  const hx = ax + vx * t;
  const hy = ay + vy * t;
  return Math.hypot(px - hx, py - hy);
}

function qMask(x, y, width, height, opts = {}) {
  const minSide = Math.min(width, height);
  const cx = width * 0.5;
  const cy = height * (opts.centerY ?? 0.46);
  const outer = minSide * (opts.outer ?? 0.255);
  const inner = outer * 0.58;
  const tailWidth = outer * 0.3;
  const aa = Math.max(1.4, minSide * 0.004);

  const distance = Math.hypot(x - cx, y - cy);
  const ring = (1 - smoothstep(outer - aa, outer + aa, distance))
    * smoothstep(inner - aa, inner + aa, distance);

  const tailStartX = cx + outer * 0.36;
  const tailStartY = cy + outer * 0.42;
  const tailEndX = cx + outer * 0.88;
  const tailEndY = cy + outer * 0.94;
  const tailDistance = lineDistance(x, y, tailStartX, tailStartY, tailEndX, tailEndY);
  const tail = 1 - smoothstep(tailWidth - aa, tailWidth + aa, tailDistance);

  return Math.max(ring, tail);
}

function drawQ(pixels, width, height, color, opacity = 1, opts = {}) {
  const offsetX = opts.offsetX ?? 0;
  const offsetY = opts.offsetY ?? 0;
  const minSide = Math.min(width, height);
  const boundsPad = minSide * 0.16;

  for (let y = Math.floor(boundsPad); y < Math.ceil(height - boundsPad * 0.55); y += 1) {
    for (let x = Math.floor(boundsPad); x < Math.ceil(width - boundsPad); x += 1) {
      const alpha = qMask(x - offsetX, y - offsetY, width, height, opts) * opacity;
      if (alpha <= 0.001) continue;
      blend(pixels, (y * width + x) * 4, color, alpha);
    }
  }
}

function drawAccent(pixels, width, height) {
  const color = hex('#ffb3ce');
  const minSide = Math.min(width, height);
  const cx = width * 0.405;
  const cy = height * 0.345;
  const radius = minSide * 0.028;
  const aa = Math.max(1, minSide * 0.003);

  for (let y = Math.floor(cy - radius - aa); y < Math.ceil(cy + radius + aa); y += 1) {
    for (let x = Math.floor(cx - radius - aa); x < Math.ceil(cx + radius + aa); x += 1) {
      const distance = Math.hypot(x - cx, y - cy);
      const alpha = 1 - smoothstep(radius - aa, radius + aa, distance);
      blend(pixels, (y * width + x) * 4, color, alpha * 0.95);
    }
  }
}

function makeIcon(width, height) {
  const pixels = createPixels(width, height);
  drawQ(pixels, width, height, hex('#4f1234'), 0.14, { offsetY: height * 0.026 });
  drawQ(pixels, width, height, hex('#a40f47'));
  drawQ(pixels, width, height, hex('#c7356f'), 0.42, { offsetX: -width * 0.012, offsetY: -height * 0.018 });
  drawAccent(pixels, width, height);
  return pixels;
}

function makeForeground(width, height, color = '#a40f47') {
  const pixels = createPixels(width, height, true);
  drawQ(pixels, width, height, hex(color), 1, { outer: 0.3 });
  drawQ(pixels, width, height, hex('#c7356f'), color === '#a40f47' ? 0.35 : 0, {
    outer: 0.3,
    offsetX: -width * 0.012,
    offsetY: -height * 0.018,
  });
  return pixels;
}

function makeSplash(width, height) {
  const pixels = createPixels(width, height, true);
  drawQ(pixels, width, height, hex('#a40f47'), 1, { outer: 0.28 });
  drawQ(pixels, width, height, hex('#c7356f'), 0.38, {
    outer: 0.28,
    offsetX: -width * 0.012,
    offsetY: -height * 0.018,
  });
  drawAccent(pixels, width, height);
  return pixels;
}

writePng('quilly-icon.png', 1024, 1024, makeIcon(1024, 1024));
writePng('quilly-splash-icon.png', 1024, 1024, makeSplash(1024, 1024));
writePng('quilly-adaptive-foreground.png', 512, 512, makeForeground(512, 512));
writePng('quilly-adaptive-background.png', 512, 512, createPixels(512, 512));
writePng('quilly-adaptive-monochrome.png', 512, 512, makeForeground(512, 512, '#000000'));
writePng('quilly-favicon.png', 48, 48, makeIcon(48, 48));

console.log('Generated Quilly launch assets in assets/images');
