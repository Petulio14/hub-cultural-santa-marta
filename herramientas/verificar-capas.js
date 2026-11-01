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
 * 4. Texto alternativo — toda «img» lleva «alt» y todo «svg» escrito a mano lleva
 *    o «aria-hidden» o un nombre accesible. Es el primer criterio de aceptación de
 *    HU-32, y hasta ahora solo existía como un grep escrito en docs/31 §2.
 * 5. Documentación al día — las colecciones con reglas en «firestore.rules» son
 *    exactamente las descritas en docs/04 §1, y los índices declarados en
 *    «firestore.indexes.json» son tantos como las filas de docs/04 §10. Es de
 *    HU-39: un tercero que audite el proyecto lee la documentación y se fía de
 *    ella. Nació de encontrar que docs/06 decía «6 índices» cuando ya eran diez,
 *    y lo decía justo debajo de la frase «así que no pueden divergir».
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

// 4 · Texto alternativo
//
// Se comprueba sobre la etiqueta de apertura entera, que en este proyecto puede
// ocupar seis líneas, y por eso «[^>]*» con la bandera «s» y no una línea.
//
// Un «alt» vacío es válido y es lo correcto para una imagen decorativa, así que
// se acepta: lo que no se acepta es que no esté, porque entonces el lector de
// pantalla lee el nombre del archivo.
//
// Para un «svg» dibujado a mano lo correcto es casi siempre «aria-hidden»: es lo
// que hace la imagen predeterminada de un perfil, que no añade nada a un nombre
// que ya está escrito al lado. Si el dibujo sí dice algo, necesita «role="img"»
// con «aria-label» o un «title» dentro.
// Solo «.jsx», y sin comentarios. Las dos cosas por el mismo motivo: la primera
// versión de esta regla señalaba «src/utils/imagen.js», que no tiene ni una línea
// de JSX y sí una frase que dice «lo que sabe cargar una <img>». Una regla que
// avisa de un comentario se desactiva a la semana.
const APERTURA_IMG = /<img\b[^>]*>/gs;
const APERTURA_SVG = /<svg\b[^>]*>/gs;
const COMENTARIOS = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
for (const archivo of archivos.filter((a) => a.endsWith('.jsx'))) {
  const contenido = readFileSync(archivo, 'utf8').replace(COMENTARIOS, '');
  const relativa = nombre(archivo);

  for (const [etiqueta] of contenido.matchAll(APERTURA_IMG)) {
    if (!/\balt\s*=/.test(etiqueta)) {
      fallos.push(`${relativa} tiene una <img> sin «alt»; una imagen sin texto alternativo se anuncia por el nombre del archivo`);
    }
  }

  for (const [etiqueta] of contenido.matchAll(APERTURA_SVG)) {
    const oculto = /\baria-hidden\s*=\s*[{"']?true/.test(etiqueta);
    const nombrado = /\baria-label\s*=/.test(etiqueta) || /\baria-labelledby\s*=/.test(etiqueta);
    if (!oculto && !nombrado) {
      fallos.push(`${relativa} tiene un <svg> que no está oculto con «aria-hidden» ni nombrado con «aria-label»`);
    }
  }
}

// 5 · La documentación no se queda atrás
//
// Las dos comprobaciones son del mismo tipo y miden lo mismo: que el documento
// que un tercero va a leer siga describiendo lo que el repositorio tiene. Se
// comparan contra los archivos de configuración y no contra el código, porque
// son esos los que el servidor aplica.
const ARCHIVO_REGLAS = join(RAIZ, 'firestore.rules');
const ARCHIVO_INDICES = join(RAIZ, 'firestore.indexes.json');
const ARCHIVO_MODELO = join(RAIZ, 'docs', '04-modelo-datos.md');

/** El texto de una sección de un documento, hasta el siguiente encabezado de su nivel. */
function seccion(texto, titulo) {
  const desde = texto.indexOf(titulo);
  if (desde === -1) return '';
  const hasta = texto.indexOf('\n## ', desde + titulo.length);
  return hasta === -1 ? texto.slice(desde) : texto.slice(desde, hasta);
}

/** Los nombres entre acentos graves de la primera columna de una tabla. */
const FILA_CON_NOMBRE = /^\|\s*`([a-zA-Z]+)`\s*\|/gm;
const nombresDeTabla = (texto) => [...texto.matchAll(FILA_CON_NOMBRE)].map((f) => f[1]);

const reglas = readFileSync(ARCHIVO_REGLAS, 'utf8');
const modelo = readFileSync(ARCHIVO_MODELO, 'utf8');

// «databases» es el contenedor de Firestore, no una colección del proyecto.
const conReglas = [...reglas.matchAll(/match \/([a-zA-Z]+)\/\{/g)]
  .map((m) => m[1])
  .filter((c) => c !== 'databases');
const documentadas = nombresDeTabla(seccion(modelo, '## 1. Resumen de colecciones'));

for (const coleccion of conReglas) {
  if (!documentadas.includes(coleccion)) {
    fallos.push(
      `la colección ${coleccion} tiene reglas en firestore.rules y no aparece en docs/04 §1`
    );
  }
}
for (const coleccion of documentadas) {
  if (!conReglas.includes(coleccion)) {
    fallos.push(
      `docs/04 §1 describe la colección ${coleccion} y firestore.rules no la protege`
    );
  }
}

const indicesDeclarados = JSON.parse(readFileSync(ARCHIVO_INDICES, 'utf8')).indexes.length;
const indicesDocumentados = nombresDeTabla(
  seccion(modelo, '## 10. Índices compuestos requeridos')
).length;
if (indicesDeclarados !== indicesDocumentados) {
  fallos.push(
    `firestore.indexes.json declara ${indicesDeclarados} índice(s) y docs/04 §10 documenta ${indicesDocumentados}`
  );
}

const total = archivos.length;
console.log(
  `Verificación estructural · ${total} archivos en src/, ${vistas.length} vistas, ` +
    `${conReglas.length} colecciones, ${indicesDeclarados} índices`
);

if (fallos.length === 0) {
  console.log('  acceso a datos solo por src/services/ : correcto');
  console.log('  todas las vistas enrutadas             : correcto');
  console.log('  colores solo en variables.css          : correcto');
  console.log('  toda imagen con texto alternativo      : correcto');
  console.log('  docs/04 al día con reglas e índices    : correcto');
  console.log('\nSin incidencias.');
  process.exit(0);
}

console.log(`\n${fallos.length} incidencia(s):`);
for (const fallo of fallos) console.log(`  · ${fallo}`);
process.exit(1);
