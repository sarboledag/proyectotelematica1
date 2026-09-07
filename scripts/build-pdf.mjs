#!/usr/bin/env node
// Genera docs/fase1-diseno.pdf a partir de la wiki del proyecto.
// Clona la wiki, concatena las páginas en orden, renderiza los bloques
// ```mermaid``` a SVG y produce el PDF.
//
// Uso:  node scripts/build-pdf.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const WIKI = "https://github.com/sarboledag/proyectotelematica1.wiki.git";
const ROOT = resolve(dirname(process.argv[1]), "..");
const OUT = join(ROOT, "docs", "fase1-diseno.pdf");

// Orden de las páginas en el documento único.
const PAGES = [
  "1-Descripcion-del-problema",
  "2-Arquitectura",
  "3-Entidades-participantes",
  "4-Protocolo-DMCP",
  "5-Reglas-de-comunicacion",
  "6-Analisis-TCP-UDP",
  "7-Maquinas-de-estado",
  "8-Alcance-y-trabajo-restante",
  "Glosario",
];

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

const tmpDir = join(tmpdir(), `fase1-pdf-${Date.now()}`);
mkdirSync(tmpDir, { recursive: true });
const wikiDir = join(tmpDir, "wiki");
execFileSync("git", ["clone", "--depth", "1", WIKI, wikiDir], { stdio: "inherit" });

// 1. Concatenar las páginas, quitando los pies de "Anterior / Siguiente".
let md = `# Fase 1 — Diseño y Arquitectura

**Curso:** Internet: Arquitectura y Protocolos (Telemática) — 2026-2
**Proyecto:** Sistema de monitoreo distribuido y control
**Protocolo:** DMCP — *Distributed Monitoring and Control Protocol*, versión 1.0 (preliminar)
**Fecha de entrega:** 9 de septiembre de 2026

> Documento generado desde la wiki del proyecto.
> Fuente: https://github.com/sarboledag/proyectotelematica1/wiki

---

`;
for (const page of PAGES) {
  let body = readFileSync(join(wikiDir, `${page}.md`), "utf8");
  body = body.replace(/\r\n/g, "\n");
  body = body.replace(/\n---\n\*\*(Anterior|Siguiente)[\s\S]*$/m, "").trimEnd();
  md += body + "\n\n---\n\n";
}

const pptrCfg = join(tmpDir, "pptr.json");
writeFileSync(pptrCfg, JSON.stringify({ args: ["--no-sandbox"] }));

// 2. Renderizar cada bloque mermaid a SVG y embeberlo como data URI.
let i = 0;
md = md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_m, code) => {
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

const buildMd = join(tmpDir, "fase1-diseno.md");
writeFileSync(buildMd, md);

// 3. md-to-pdf.
execFileSync(node, [
  MD2PDF, buildMd,
  "--stylesheet", resolve(dirname(process.argv[1]), "pdf.css"),
  "--pdf-options", JSON.stringify({
    format: "A4",
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    printBackground: true,
  }),
], { stdio: "inherit" });

writeFileSync(OUT, readFileSync(join(tmpDir, "fase1-diseno.pdf")));
rmSync(tmpDir, { recursive: true, force: true });
console.log(`\nPDF generado: ${OUT}  (${i} diagramas renderizados)`);
