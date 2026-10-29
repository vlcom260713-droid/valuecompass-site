// Contact sheet of the partner logos on a given tile colour, for eyeballing contrast.
// node tools/logo-sheet.mjs <dir> <out.png> [tileHex]
import { readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const [, , dir, out, tile = "#2b2c33"] = process.argv;
const files = readdirSync(dir).filter((f) => /\.(png|svg)$/.test(f)).sort();
const W = 220, H = 140, COLS = 6;
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(join(dir, f), { density: 300 }).resize(160, 80, { fit: "inside" }).png().toBuffer();
  const m = await sharp(img).metadata();
  const label = Buffer.from(`<svg width="${W}" height="20"><text x="6" y="15" font-size="13" fill="#888" font-family="sans-serif">${f}</text></svg>`);
  return [
    { input: img, left: (i % COLS) * W + Math.round((W - m.width) / 2), top: Math.floor(i / COLS) * H + Math.round((H - m.height) / 2) },
    { input: label, left: (i % COLS) * W, top: Math.floor(i / COLS) * H },
  ];
}));
await sharp({ create: { width: W * COLS, height: H * Math.ceil(files.length / COLS), channels: 4, background: tile } })
  .composite(tiles.flat()).png().toFile(out);
console.log(files.length, "logos ->", out);
