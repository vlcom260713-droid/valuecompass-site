// One-off: pull every asset the Framer site used into ./site/assets with
// readable names, resizing photos for the sizes they are actually shown at.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import sharp from "sharp";

const ROOT = new URL("../site/assets/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const F = "https://framerusercontent.com/";
const LOGOS = ["0gEVIjfnAfRZjZXXuOlabPoCmg.png", "DOVs5m3ilwZpxAFuj1EU82K0Lc.png", "cVRvyvDBrSdbGBoiyWfXLNxVUzY.png", "JUIuoMRlNL74um44vZdauSLVwJQ.png",
  "MKA7YOVFjAzxMK1zjqspWsHUSsw.png", "oBjhr4ycxhLPNvtp38StJ2FrXYM.svg", "drKGEmvNc9Q7kuDwyP2PpdY.png", "OkA7VgB2xTxFS7PIUPgg35M4ms8.png",
  "jGNuQOV2BHekgcV60Z7o6DnIh4.svg", "6K0J1RQlIYrmUgvp63uNj0ZA.png", "W8kDuKLtu2mqDsU84MKGOmOx79A.png", "6cBBtyN73caKPRo2lCzjVgiKY.png",
  "vVO4rKVqb7Of0QLSQ89NTH1RTk.svg", "BZO6CagZA9WEIFurzbcNAwNSVo.svg", "rN77RUEbSQEhwJkUVFjX5PY7Q4.png", "dks1TL6csrsrQiYxyEymdtSffA.png",
  "lHBogNzgCAgtpVcqXFpSnczXia0.png", "kIadmp35m9RaK7s5ZFqP1jZCeus.svg"];
const PHOTOS = { "funding-1": "lMIMvlhsBEtEV8ybZo7gSs.jpg", "funding-2": "b5oGmceLF7iVbUU7Z06OI9CtQs.jpg", "certify-1": "Mo3Ulv5bKJj3EH9YGwltNS0Qnc.jpg",
  "certify-2": "Ayasqk8IHD5VYduObipHUCjjk.jpg", "programs-1": "fyDIzCGJ9NA41VRjO8fewXTZ18.jpg", "programs-2": "AtVEN8Ozp4ut8fCr56A074bkrZc.jpg",
  "strategy-1": "ud736cStPhBFiHsz2hDKWG5r1PE.jpg" };

const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(r.status + " " + url); return Buffer.from(await r.arrayBuffer()); };
const kb = (b) => (b.length / 1024).toFixed(0) + " KB";
for (const d of ["img/partners", "img/consulting", "video"]) mkdirSync(ROOT + d, { recursive: true });

writeFileSync(ROOT + "img/logo.svg", await get(F + "images/p0lBD4ABMs4MIzREkptChraE.svg"));
console.log("logo.svg");

for (const [i, f] of LOGOS.entries()) {
  const ext = f.split(".").pop();
  const out = `${ROOT}img/partners/${String(i + 1).padStart(2, "0")}.${ext === "svg" ? "svg" : "png"}`;
  let buf = await get(F + "images/" + f);
  // shown at ~124px wide; keep 2x for sharp screens
  if (ext !== "svg") buf = await sharp(buf).resize({ width: 320, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(out, buf);
  console.log(out.split("assets/")[1], kb(buf));
}
for (const [name, f] of Object.entries(PHOTOS)) {
  const src = await get(F + "images/" + f);
  // cards are 620x380 at most; 2x
  const buf = await sharp(src).resize({ width: 1240, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  writeFileSync(`${ROOT}img/consulting/${name}.jpg`, buf);
  console.log(`img/consulting/${name}.jpg`, kb(src), "->", kb(buf));
}
const posters = { "consulting-hero.jpg": "536ytaNtKhUvB5qTKAW581nekc.jpg", "consulting-hero-vertical.jpg": "vhimW9SCRxvM4UQ6KZJNdjM.jpg" };
for (const [name, f] of Object.entries(posters)) {
  const buf = await sharp(await get(F + "images/" + f)).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  writeFileSync(`${ROOT}video/${name}`, buf); console.log("video/" + name, kb(buf));
}
const videos = { "consulting-hero.mp4": "aCttR6pKQEBwNKQrAgcTkurJ360.mp4", "consulting-hero-vertical.mp4": "kQ04BxPoHgLw51xBKwbT3BXrIaM.mp4" };
for (const [name, f] of Object.entries(videos)) {
  const buf = await get(F + "assets/" + f);
  writeFileSync(`${ROOT}video/${name}`, buf); console.log("video/" + name, kb(buf));
}
