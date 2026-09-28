#!/usr/bin/env node
/**
 * Vuelca los criterios de aceptación de los issues a «pruebas/casos/criterios.json».
 *
 *   export PATH="/c/Program Files/GitHub CLI:$PATH"
 *   node herramientas/generar-criterios.js
 *
 * No se ejecuta en integración continua y no debe: necesita «gh» autenticado, y
 * lo que vigila CI es que el archivo generado y el catálogo de casos concuerden,
 * no que se pueda volver a generar.
 *
 * ## Por qué hay una copia en el repositorio
 *
 * Los criterios viven en los issues, que son la fuente (CLAUDE.md). Pero la
 * matriz de trazabilidad que exige HU-40 tiene que poder leerse dentro del
 * trabajo escrito dentro de cinco años, cuando el repositorio quizá ya no esté
 * abierto, y tiene que poder comprobarse sin credenciales. De ahí la copia, con
 * su fecha: es una instantánea fechada, no una segunda fuente.
 *
 * Si un issue cambia sus criterios, esto se vuelve a ejecutar y
 * «verificar-casos.js» dirá qué caso quedó sin criterio o qué criterio sin caso.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DESTINO = join(RAIZ, 'pruebas', 'casos', 'criterios.json');

const crudo = execFileSync(
  'gh',
  ['issue', 'list', '--limit', '60', '--state', 'all', '--json', 'number,title,body,labels'],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
);

const issues = JSON.parse(crudo).sort((a, b) => a.number - b.number);

const historias = {};
for (const issue of issues) {
  const cuerpo = issue.body ?? '';
  const bloque = cuerpo.match(/## Criterios de aceptación\s*\n([\s\S]*?)\n\s*##/);
  const criterios = bloque
    ? [...bloque[1].matchAll(/^- \[[ x]\] (.+)$/gm)].map((m) => m[1].trim())
    : [];

  const prioridad =
    issue.labels.map((l) => l.name).find((n) => n.startsWith('prioridad:'))?.split(':')[1] ?? null;

  const codigo = `HU-${String(issue.number).padStart(2, '0')}`;
  historias[codigo] = {
    titulo: issue.title.replace(/^HU-\d+ · /, ''),
    prioridad,
    criterios,
  };
}

const salida = {
  generado: new Date().toISOString().slice(0, 10),
  fuente: 'issues del repositorio, que son la fuente de los criterios (CLAUDE.md)',
  historias,
};

writeFileSync(DESTINO, JSON.stringify(salida, null, 2) + '\n', 'utf8');

const totalCriterios = Object.values(historias).reduce((n, h) => n + h.criterios.length, 0);
console.log(
  `Escrito ${DESTINO}\n  ${Object.keys(historias).length} historias · ${totalCriterios} criterios de aceptación`
);
