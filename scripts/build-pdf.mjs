#!/usr/bin/env node
// Genera un PDF de un Markdown renderizando los bloques ```mermaid``` a SVG.
// Uso: node scripts/build-pdf.mjs docs/fase1-diseno.md
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join, basename, extname, resolve } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("uso: node scripts/build-pdf.mjs <archivo.md>");
  process.exit(1);
}

const NPM_MODS = join(process.env.APPDATA || "", "npm", "node_modules");
const MMDC = join(NPM_MODS, "@mermaid-js", "mermaid-cli", "src", "cli.js");
const MD2PDF = join(NPM_MODS, "md-to-pdf", "dist", "cli.js");
for (const p of [MMDC, MD2PDF]) {
  if (!existsSync(p)) {
    console.error(`falta: ${p}\n  instala:  npm install -g @mermaid-js/mermaid-cli md-to-pdf`);
    process.exit(1);
  }
}
const node = process.execPath;

const srcPath = resolve(src);
const md = readFileSync(srcPath, "utf8");
const outDir = dirname(srcPath);
const stem = basename(srcPath, extname(srcPath));
const tmpDir = join(outDir, ".pdfbuild");
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

const pptrCfg = join(tmpDir, "pptr.json");
writeFileSync(pptrCfg, JSON.stringify({ args: ["--no-sandbox"] }));

// 1. Renderizar cada bloque mermaid a SVG y embeberlo como data URI.
let i = 0;
const withImgs = md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_m, code) => {
  i += 1;
  const mmd = join(tmpDir, `d${i}.mmd`);
  const svg = join(tmpDir, `d${i}.svg`);
  writeFileSync(mmd, code);
  execFileSync(node, [
    MMDC, "-i", mmd, "-o", svg,
    "-b", "white", "-t", "neutral",
    "--puppeteerConfigFile", pptrCfg,
  ], { stdio: "inherit" });
  const b64 = readFileSync(svg).toString("base64");
  return `\n<p align="center"><img src="data:image/svg+xml;base64,${b64}" alt="diagrama ${i}"></p>\n`;
});

const buildMd = join(tmpDir, `${stem}.md`);
writeFileSync(buildMd, withImgs);

// 2. md-to-pdf sobre la copia con imágenes.
execFileSync(node, [
  MD2PDF, buildMd,
  "--stylesheet", resolve(dirname(process.argv[1]), "pdf.css"),
  "--pdf-options", JSON.stringify({
    format: "A4",
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    printBackground: true,
  }),
], { stdio: "inherit" });

const producedPdf = join(tmpDir, `${stem}.pdf`);
const outPdf = join(outDir, `${stem}.pdf`);
writeFileSync(outPdf, readFileSync(producedPdf));
console.log(`\nPDF generado: ${outPdf}  (${i} diagramas renderizados)`);
