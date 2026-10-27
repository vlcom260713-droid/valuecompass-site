// Minimal static server for docs/ (GitHub Pages-like: folder index.html, 404.html).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)), "docs");
const PORT = Number(process.env.PORT || 4890);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json" };

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, path);
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!req.url.split("?")[0].endsWith("/")) { res.writeHead(301, { Location: req.url.replace(/(\?|$)/, "/$1") }); return res.end(); }
      file = join(file, "index.html");
    }
    const body = await readFile(file);
    const range = req.headers.range;
    const type = TYPES[extname(file)] || "application/octet-stream";
    if (range && type === "video/mp4") {
      const [a, b] = range.replace("bytes=", "").split("-");
      const start = Number(a), end = b ? Number(b) : body.length - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${body.length}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
      return res.end(body.subarray(start, end + 1));
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    const nf = await readFile(join(ROOT, "404.html")).catch(() => "Not found");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(nf);
  }
}).listen(PORT, () => console.log(`serving docs/ on http://localhost:${PORT}`));
