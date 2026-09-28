#!/usr/bin/env node
/**
 * La matriz de trazabilidad criterios–casos — HU-35 · RNF-08.
 *
 *   node herramientas/verificar-casos.js
 *
 * Sale con código 1 si algún criterio de aceptación se queda sin caso o si la
 * cobertura de las historias «Debe» baja del umbral. Por eso puede colgarse de
 * la integración continua: lo que comprueba no es que el software funcione
 * —para eso están las otras tres— sino que **no haya un criterio sin
 * comprobar**, que es el primer criterio de aceptación de HU-35.
 *
 * ## Las dos mitades
 *
 * - `pruebas/casos/criterios.json` es una instantánea fechada de los issues, que
 *   son la fuente de los criterios (CLAUDE.md). La genera
 *   `herramientas/generar-criterios.js` con `gh`.
 * - `pruebas/casos/casos.json` se escribe a mano: un caso por criterio, con su
 *   tipo, dónde está la evidencia y qué dio.
 *
 * Separarlas es lo que hace que esto sirva de algo. Si estuvieran en el mismo
 * archivo, regenerar desde los issues borraría los resultados, y nadie volvería
 * a regenerar. Así, cuando un issue cambia sus criterios, este guion dice qué
 * caso se quedó huérfano y qué criterio nuevo no tiene ninguno.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const leer = (...p) => JSON.parse(readFileSync(join(RAIZ, ...p), 'utf8'));

const criterios = leer('pruebas', 'casos', 'criterios.json');
const catalogo = leer('pruebas', 'casos', 'casos.json');
const registro = leer('pruebas', 'casos', 'hallazgos.json');

/** El segundo criterio de aceptación pide no bajar del 90 %. */
const UMBRAL_DE_COBERTURA = 0.9;

const fallos = [];
const hallazgos = [];

// ── 1 · Cada criterio con al menos un caso ─────────────────────────────────
//
// Una historia sin ningún caso **no cuenta como incumplimiento aquí**: es una
// historia que todavía no se ha construido, y las hay —HU-36 a HU-40 son del
// Sprint 7 y del 8—. Medirlas como falladas sería medir el futuro. Lo que sí es
// un incumplimiento es una historia con unos criterios cubiertos y otros no:
// eso es un olvido, no un plan.
const implementadas = [];
const sinEmpezar = [];

for (const [codigo, historia] of Object.entries(criterios.historias)) {
  const conCaso = historia.criterios.map(
    (_, i) => catalogo.casos[`${codigo}.${i + 1}`] ?? null
  );
  const cubiertos = conCaso.filter(Boolean).length;

  if (cubiertos === 0) {
    sinEmpezar.push(codigo);
    continue;
  }

  implementadas.push(codigo);

  conCaso.forEach((caso, i) => {
    if (!caso) {
      fallos.push(
        `${codigo}.${i + 1} no tiene caso, y la historia sí tiene otros: «${historia.criterios[i].slice(0, 72)}…»`
      );
    }
  });
}

// Y al revés: un caso que ya no apunta a ningún criterio.
for (const clave of Object.keys(catalogo.casos)) {
  const [codigo, numero] = clave.split('.');
  const historia = criterios.historias[codigo];
  if (!historia) {
    fallos.push(`${clave} apunta a una historia que no existe`);
  } else if (Number(numero) > historia.criterios.length) {
    fallos.push(`${clave} apunta a un criterio que el issue ya no tiene`);
  }
}

// ── 2 · Cobertura de las historias «Debe» ──────────────────────────────────
const esDebe = (codigo) => criterios.historias[codigo].prioridad === 'debe';
const casosDe = (codigo) =>
  criterios.historias[codigo].criterios
    .map((_, i) => catalogo.casos[`${codigo}.${i + 1}`])
    .filter(Boolean);

const debeImplementadas = implementadas.filter(esDebe);
const debeQuePasan = debeImplementadas.filter((codigo) =>
  casosDe(codigo).every((caso) => caso.resultado === 'pasa')
);
const cobertura = debeImplementadas.length === 0 ? 0 : debeQuePasan.length / debeImplementadas.length;

// ── 3 · Los accesos no autorizados ─────────────────────────────────────────
const deReglas = Object.entries(catalogo.casos).filter(([, c]) => c.tipo === 'reglas');
const reglasQuePasan = deReglas.filter(([, c]) => c.resultado === 'pasa');

// ── 4 · Los hallazgos ──────────────────────────────────────────────────────
for (const [clave, caso] of Object.entries(catalogo.casos)) {
  if (caso.resultado !== 'pasa') hallazgos.push({ clave, ...caso });
}

// ── Informe ────────────────────────────────────────────────────────────────
const porcentaje = (n) => `${(n * 100).toFixed(1)} %`;
const total = Object.values(criterios.historias).reduce((n, h) => n + h.criterios.length, 0);
const conCaso = Object.keys(catalogo.casos).length;

console.log(`Matriz de trazabilidad · criterios de ${criterios.generado}, casos de ${catalogo.generado}`);
console.log('-'.repeat(78));
console.log(`  Historias                       ${Object.keys(criterios.historias).length}`);
console.log(`  Criterios de aceptación         ${total}`);
console.log(`  Con al menos un caso            ${conCaso}`);
console.log(`  De historias aún sin construir  ${total - conCaso}  (${sinEmpezar.join(', ')})`);
console.log();
console.log(`  Historias «Debe» construidas    ${debeImplementadas.length}`);
console.log(`  De ellas, superan todos sus casos ${debeQuePasan.length}`);
console.log(`  Cobertura                       ${porcentaje(cobertura)}   (umbral ${porcentaje(UMBRAL_DE_COBERTURA)})`);
console.log();
// El número de abajo son **criterios**, no casos de prueba: son los criterios de
// aceptación cuya evidencia es la suite de reglas, que por dentro tiene sus
// propios casos —221 a día de hoy— y se ejecuta entera en integración continua.
// Decir «22 pruebas de permisos» sería quedarse corto por diez.
console.log(`  Criterios verificados por reglas ${deReglas.length}`);
console.log(`  Con el acceso indebido rechazado ${reglasQuePasan.length}  (${porcentaje(reglasQuePasan.length / Math.max(1, deReglas.length))})`);

const porTipo = {};
for (const caso of Object.values(catalogo.casos)) porTipo[caso.tipo] = (porTipo[caso.tipo] ?? 0) + 1;
console.log();
console.log('  Por tipo de caso:');
for (const [tipo, n] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${tipo.padEnd(14)} ${String(n).padStart(3)}`);
}

if (hallazgos.length > 0) {
  console.log();
  console.log(`  ${hallazgos.length} criterio(s) sin superar:`);
  for (const h of hallazgos) {
    console.log(`    ${h.clave}  [${h.resultado}]  ${h.evidencia}`);
  }
}

// ── 4 · El registro de hallazgos ───────────────────────────────────────────
//
// Cada criterio sin superar tiene que tener su hallazgo. Al revés no: hay
// hallazgos que no vienen de un caso fallido sino de haber mirado —un peso de
// más, una escritura que no avisa—, y esos no tienen criterio al que apuntar.
const abiertos = registro.hallazgos.filter((h) => h.estado === 'abierto');
const porSeveridad = {};
for (const h of abiertos) porSeveridad[h.severidad] = (porSeveridad[h.severidad] ?? 0) + 1;

console.log();
console.log(`  Hallazgos abiertos              ${abiertos.length}`);
for (const [severidad, n] of Object.entries(porSeveridad)) {
  console.log(`    ${severidad.padEnd(14)} ${String(n).padStart(3)}`);
}
for (const h of abiertos) {
  console.log(`    ${h.id} [${h.severidad}] ${h.titulo}`);
}

// Un hallazgo puede cubrir varios criterios: «las sesiones de usabilidad no se
// han ejecutado» es uno solo y deja sin evaluar los cuatro de HU-36. Partirlo en
// cuatro entradas iguales sería ruido, no precisión.
const conHallazgo = new Set(
  registro.hallazgos.flatMap((h) => (Array.isArray(h.criterio) ? h.criterio : [h.criterio])).filter(Boolean)
);
for (const h of hallazgos) {
  if (!conHallazgo.has(h.clave)) {
    fallos.push(`${h.clave} no supera su caso y no tiene hallazgo registrado`);
  }
}
for (const h of registro.hallazgos) {
  if (h.severidad && !(h.severidad in registro.severidades)) {
    fallos.push(`${h.id} tiene una severidad que no está en la tabla: «${h.severidad}»`);
  }
}

if (cobertura < UMBRAL_DE_COBERTURA) {
  fallos.push(
    `la cobertura de las historias «Debe» es ${porcentaje(cobertura)} y el umbral es ${porcentaje(UMBRAL_DE_COBERTURA)}`
  );
}
if (reglasQuePasan.length !== deReglas.length) {
  fallos.push('hay casos de permisos que no rechazan lo que deben');
}

console.log();
if (fallos.length === 0) {
  console.log('Sin incidencias.');
  process.exit(0);
}

console.log(`${fallos.length} incidencia(s):`);
for (const fallo of fallos) console.log(`  · ${fallo}`);
process.exit(1);
