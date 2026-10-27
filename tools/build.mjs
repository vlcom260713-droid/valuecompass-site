// Static build: src/pages/*.html (+ partials) -> docs/, which GitHub Pages serves.
//
// Page files start with a front-matter comment:
//   <!--
//   path: consulting/          (output folder; "" for the home page)
//   title: 컨설팅 | 밸류컴퍼스
//   description: ...
//   -->
// Templates understand:
//   {{> name}}         include src/partials/name.html
//   {{root}}           relative prefix back to the site root ("", "../", "../../")
//   {{current:path}}   aria-current="page" when the page being built is `path`
//   {{key}}            any front-matter value
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs");
const SITE_URL = "https://vlcom.co.kr";

const partial = (name) => readFileSync(join(ROOT, "src/partials", name + ".html"), "utf8");

function parse(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^<!--\n([\s\S]*?)\n-->\n/);
  if (!m) throw new Error("missing front matter: " + file);
  const meta = Object.fromEntries(m[1].split("\n").filter(Boolean).map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  return { meta, body: raw.slice(m[0].length) };
}

function render(tpl, vars, depth = 0) {
  if (depth > 8) throw new Error("partial nesting too deep");
  return tpl
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => render(partial(n), vars, depth + 1))
    .replace(/\{\{current:([^}]*)\}\}/g, (_, p) => (p === vars.path ? 'aria-current="page"' : ""))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));
}

rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, "static"), OUT, { recursive: true });

const pages = [];
const version = Date.now().toString(36);
for (const f of readdirSync(join(ROOT, "src/pages")).filter((f) => f.endsWith(".html"))) {
  const { meta, body } = parse(join(ROOT, "src/pages", f));
  const path = meta.path === '""' ? "" : meta.path;
  const is404 = path === "404.html";
  const depth = is404 ? 0 : path.split("/").filter(Boolean).length;
  // the 404 page is served from any URL, so it cannot use relative links
  const root = is404 ? "/" : "../".repeat(depth);
  const vars = { bodyClass: "", ...meta, path, root, version, canonical: SITE_URL + "/" + (is404 ? "" : path), content: "" };
  vars.content = render(body, vars);
  const html = render(partial("layout"), vars);
  const dest = is404 ? join(OUT, "404.html") : join(OUT, path, "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  if (!is404 && meta.sitemap !== "no") pages.push(path);
  const left = html.match(/\{\{[^}]+\}\}/);
  if (left) throw new Error(`${f}: unresolved ${left[0]}`);
}

writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.sort().map((p) => `  <url><loc>${SITE_URL}/${p}</loc></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
writeFileSync(join(OUT, "CNAME"), "vlcom.co.kr\n");
writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`built ${pages.length} pages + 404 -> docs/`);
