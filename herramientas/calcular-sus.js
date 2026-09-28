#!/usr/bin/env node
/**
 * Procesa las sesiones de usabilidad — HU-36 · RNF-01.
 *
 *   node herramientas/calcular-sus.js
 *
 * Lee «pruebas/usabilidad/sesiones.json», calcula el SUS de cada participante y
 * el promedio de la tanda, y resume qué tareas se completaron y cuánto costaron.
 *
 * ## Qué hace cuando no hay datos
 *
 * **No falla: informa.** El archivo nace vacío a propósito, porque las sesiones
 * las ejecuta una persona con participantes reales, y este guion existe desde
 * antes para que cuando lleguen los datos no haya que improvisar la aritmética.
 * Salir con código 1 por no haber medido todavía convertiría la integración
 * continua en roja durante semanas por algo que no es un defecto.
 *
 * Sale con 1 en dos casos, y los dos son resultados de verdad: cuando hay ocho
 * participantes o más y el promedio no llega al umbral, y cuando una sesión está
 * mal volcada. Lo primero es el cuarto criterio de aceptación —un puntaje por
 * debajo obliga a registrar hallazgos y repetir la medición—; lo segundo es que
 * un dato mal copiado no se puede distinguir de un resultado malo.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UMBRAL, puntajeSUS, resumirSUS, resumirTareas } from './sus.js';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ARCHIVO = join(RAIZ, 'pruebas', 'usabilidad', 'sesiones.json');

/** El tercer criterio pide al menos ocho. */
const MINIMO_DE_PARTICIPANTES = 8;

const datos = JSON.parse(readFileSync(ARCHIVO, 'utf8'));

// Las entradas de ejemplo se descartan por el número de participante: así el
// archivo puede enseñar cómo se rellena sin contaminar el resultado.
const sesiones = (datos.sesiones ?? []).filter((s) => !String(s.participante ?? '').startsWith('P0'));

console.log('Sesiones de usabilidad · System Usability Scale');
console.log('-'.repeat(70));

if (sesiones.length === 0) {
  console.log('  Todavía no hay ninguna sesión volcada.');
  console.log();
  console.log('  El instrumento está listo:');
  console.log('    · pruebas/usabilidad/consentimiento.md   se firma antes de empezar');
  console.log('    · pruebas/usabilidad/guion.md            las seis tareas y las tres reglas');
  console.log('    · pruebas/usabilidad/cuestionario-sus.md se pasa al terminar');
  console.log();
  console.log(`  Hacen falta ${MINIMO_DE_PARTICIPANTES} participantes que no hayan construido la plataforma.`);
  process.exit(0);
}

// ── El SUS de cada uno ─────────────────────────────────────────────────────
const problemas = [];
const puntajes = [];

for (const sesion of sesiones) {
  try {
    const puntaje = puntajeSUS(sesion.sus);
    puntajes.push(puntaje);
    const tareas = sesion.tareas ?? [];
    const hechas = tareas.filter((t) => t.completada === true).length;
    console.log(
      `  ${String(sesion.participante).padEnd(5)} ${String(sesion.rol ?? '').padEnd(15)}` +
        ` SUS ${String(puntaje).padStart(5)}   tareas ${hechas}/${tareas.length}`
    );
  } catch (fallo) {
    problemas.push(`${sesion.participante}: ${fallo.message}`);
  }
}

const resumen = resumirSUS(puntajes);
const tareas = resumirTareas(sesiones);

console.log();
console.log(`  Participantes            ${resumen.participantes}  (hacen falta ${MINIMO_DE_PARTICIPANTES})`);
console.log(`  SUS promedio             ${resumen.promedio}   (umbral ${UMBRAL})`);
console.log(`  Peor y mejor             ${resumen.minimo} y ${resumen.maximo}`);
console.log();
console.log(`  Tareas intentadas        ${tareas.intentos}`);
console.log(`  Completadas sin ayuda    ${tareas.completadas}  (${tareas.tasa} %)`);

console.log();
console.log('  Por tarea:');
for (const [id, fila] of Object.entries(tareas.porTarea).sort()) {
  const mediana = fila.medianaSegundos === null ? '—' : `${fila.medianaSegundos} s`;
  console.log(
    `    ${id}  ${String(fila.completadas).padStart(2)}/${String(fila.intentos).padEnd(2)} completadas` +
      `   mediana ${mediana.padStart(6)}`
  );
}

// Lo que se observó, junto, que es donde se ven los patrones.
const dificultades = sesiones.flatMap((s) => (s.tareas ?? []).flatMap((t) => t.dificultades ?? []));
if (dificultades.length > 0) {
  console.log();
  console.log(`  Dificultades observadas  ${dificultades.length}`);
  for (const d of dificultades) console.log(`    · ${d}`);
}

const incomodidades = sesiones.map((s) => s.loMasIncomodo).filter(Boolean);
if (incomodidades.length > 0) {
  console.log();
  console.log('  Lo más incómodo, en sus palabras:');
  for (const frase of incomodidades) console.log(`    · ${frase}`);
}

// ── Veredicto ──────────────────────────────────────────────────────────────
console.log();
if (problemas.length > 0) {
  console.log(`${problemas.length} sesión(es) mal volcada(s):`);
  for (const p of problemas) console.log(`  · ${p}`);
  process.exit(1);
}

if (resumen.participantes < MINIMO_DE_PARTICIPANTES) {
  console.log(
    `Faltan ${MINIMO_DE_PARTICIPANTES - resumen.participantes} participante(s) para poder ` +
      'concluir. El promedio de arriba es provisional y no cumple el tercer criterio.'
  );
  process.exit(0);
}

if (!resumen.superaUmbral) {
  console.log(
    `El promedio es ${resumen.promedio} y el umbral es ${UMBRAL}.\n` +
      'El cuarto criterio pide registrar los hallazgos en el backlog y repetir la medición\n' +
      'después de corregirlos. Las dificultades y las frases de arriba son el material.'
  );
  process.exit(1);
}

console.log(`El promedio es ${resumen.promedio}, por encima del umbral de ${UMBRAL}.`);
process.exit(0);
