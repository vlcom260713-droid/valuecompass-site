// One-off: white logo, favicons and the share (OG) image from the brand SVG.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const IMG = new URL("../static/assets/img/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const STATIC = new URL("../static/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");

const logo = readFileSync(IMG + "logo.svg", "utf8");
const white = logo.replaceAll('fill="#111"', 'fill="#fff"');
writeFileSync(IMG + "logo-white.svg", white);

// The mark is the first 155x138 of the wordmark; reuse its geometry inside a square tile.
const markBody = white.match(/<clipPath id="a">[\s\S]*?<\/g><\/g>/)[0];
const defs = white.match(/<defs>[\s\S]*?<\/defs>/)[0];
const tile = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" rx="${radius}" fill="#0e2a2a"/>
  <g transform="translate(96 112) scale(2.064)">${markBody}</g></svg>`;
writeFileSync(STATIC + "favicon.svg", tile(512, 112));
for (const [name, size, r] of [["favicon-32.png", 32, 112], ["apple-touch-icon.png", 180, 0], ["icon-192.png", 192, 112], ["icon-512.png", 512, 112]]) {
  await sharp(Buffer.from(tile(size, r)), { density: 300 }).resize(size, size).png().toFile(STATIC + name);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0d9488" stop-opacity=".55"/><stop offset="1" stop-color="#0d9488" stop-opacity="0"/></radialGradient>
    <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#0a0a0c"/>
  <ellipse cx="600" cy="315" rx="520" ry="300" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#p)"/>
  <g transform="translate(330 265) scale(0.5696)">${white.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(IMG + "og.png");
console.log("brand assets written");
