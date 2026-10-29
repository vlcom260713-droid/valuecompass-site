// Partner logos for the dark, see-through tiles: black/grey (and near-black navy)
// ink becomes white, brand colours stay. Writes static/assets/img/partners/light/NN.png.
import { readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SRC = new URL("../static/assets/img/partners/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const OUT = join(SRC, "light");
mkdirSync(OUT, { recursive: true });
const KEEP = ["02"];

function hsl(r, g, b) {
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2;
  const s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
  return { s, l };
}

for (const f of readdirSync(SRC).filter((f) => /\.(png|svg)$/.test(f))) {
  const { data, info } = await sharp(join(SRC, f), { density: 300 })
    .resize({ width: 320, height: 160, fit: "inside" })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // 02: blue gradient whose shadows would turn into white blotches; already reads on dark
  if (!KEEP.includes(f.slice(0, 2))) for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const { s, l } = hsl(data[i], data[i + 1], data[i + 2]);
    const neutralInk = s < 0.25 && l < 0.8;   // black / grey text
    const darkInk = l < 0.32;                 // navy and other near-black brand ink
    if (neutralInk || darkInk) data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const name = f.replace(/\.(png|svg)$/, ".png");
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(join(OUT, name));
}
console.log("light logos ->", OUT);
