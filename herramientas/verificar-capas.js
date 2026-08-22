#!/usr/bin/env node
/**
 * Verificación de las reglas estructurales del proyecto. Sin dependencias:
 * «npm run verificar».
 *
 * 1. Acceso a datos — ningún archivo fuera de «src/services/» importa el SDK de
 *    Firebase. Es el segundo criterio de aceptación de HU-04, y hasta ahora solo
 *    existía como un grep escrito en docs/03-arquitectura.md §3.
 * 2. Vistas enrutadas — toda vista de «src/views/» está declarada en la tabla de
 *    rutas. Una vista que nadie enruta es código muerto que aparenta existir.
 * 3. Paleta única — ningún color hexadecimal fuera de «src/styles/variables.css».
 *    Los contrastes de docs/05-prototipo-interfaz.md §3 solo se sostienen si los
 *    valores viven en un único sitio.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(RAIZ, 'src');
const ARCHIVO_RUTAS = join(SRC, 'routes', 'rutas.jsx');
const ARCHIVO_PALETA = join(SRC, 'styles', 'variables.css');

function listar(directorio) {
  const encontrados = [];
  for (const entrada of readdirSync(directorio)) {
    const ruta = join(directorio, entrada);
    if (statSync(ruta).isDirectory()) encontrados.push(...listar(ruta));
    else encontrados.push(ruta);
  }
  return encontrados;
}

const archivos = listar(SRC);
const nombre = (ruta) => relative(RAIZ, ruta).split(sep).join('/');
const fallos = [];

// 1 · Acceso a datos
const IMPORTA_FIREBASE = /(?:from|import)\s+['"]firebase\/[^'"]+['"]/;
for (const archivo of archivos.filter((a) => /\.jsx?$/.test(a))) {
  const relativa = nombre(archivo);
  if (relativa.startsWith('src/services/')) continue;
  if (IMPORTA_FIREBASE.test(readFileSync(archivo, 'utf8'))) {
    fallos.push(`${relativa} importa el SDK de Firebase; debe hacerlo a través de src/services/`);
  }
}

// 2 · Vistas enrutadas
const rutas = readFileSync(ARCHIVO_RUTAS, 'utf8');
const vistas = readdirSync(join(SRC, 'views'));
for (const vista of vistas) {
  if (!rutas.includes(`views/${vista}/${vista}.jsx`)) {
    fallos.push(`la vista ${vista} no está declarada en src/routes/rutas.jsx`);
  }
}

// 3 · Paleta única
const COLOR_ESCRITO = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
for (const archivo of archivos.filter((a) => a.endsWith('.css'))) {
  if (archivo === ARCHIVO_PALETA) continue;
  const encontrados = readFileSync(archivo, 'utf8').match(COLOR_ESCRITO);
  if (encontrados) {
    fallos.push(
      `${nombre(archivo)} escribe el color ${encontrados[0]}; usa una variable de src/styles/variables.css`
    );
  }
}

const total = archivos.length;
console.log(`Verificación estructural · ${total} archivos en src/, ${vistas.length} vistas`);

if (fallos.length === 0) {
  console.log('  acceso a datos solo por src/services/ : correcto');
  console.log('  todas las vistas enrutadas             : correcto');
  console.log('  colores solo en variables.css          : correcto');
  console.log('\nSin incidencias.');
  process.exit(0);
}

console.log(`\n${fallos.length} incidencia(s):`);
for (const fallo of fallos) console.log(`  · ${fallo}`);
process.exit(1);
