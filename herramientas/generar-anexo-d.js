#!/usr/bin/env node
/**
 * Escribe «docs/anexo-d.md» — el Anexo D del trabajo escrito.
 *
 *   npm run anexo              escribe el anexo
 *   npm run anexo -- --comprobar  sale con 1 si está desfasado
 *
 * Reúne la evidencia de verificación en un solo documento: los casos de prueba
 * con sus capturas, el registro de hallazgos, el instrumento de usabilidad y
 * los consentimientos de los participantes.
 *
 * ## Por qué se genera
 *
 * Por lo mismo que el informe de validación (herramientas/generar-informe.js):
 * cada dato de este anexo ya vive en otro archivo —la instantánea de criterios,
 * el catálogo de casos, el registro de hallazgos, el volcado de sesiones y las
 * capturas de «docs/caso de pruebas»—, y una copia escrita a mano de todo eso
 * empieza a mentir en cuanto cambia cualquiera de los cinco. Aquí no hay ningún
 * dato tecleado: lo único escrito a mano es cómo se presenta.
 *
 * Para el .docx que se adjunta al trabajo: «npm run anexo:word».
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const CAPTURAS = join(RAIZ, 'docs', 'caso de pruebas');
const DESTINO = join(RAIZ, 'docs', 'anexo-d.md');

const leer = (...p) => readFileSync(join(RAIZ, ...p), 'utf8');
const leerJson = (...p) => JSON.parse(leer(...p));

const criterios = leerJson('pruebas', 'casos', 'criterios.json');
const catalogo = leerJson('pruebas', 'casos', 'casos.json');
const registro = leerJson('pruebas', 'casos', 'hallazgos.json');
const sesiones = leerJson('pruebas', 'usabilidad', 'sesiones.json');

/* ── Las capturas ───────────────────────────────────────────────────────── */

const capturas = [];
for (const carpeta of readdirSync(CAPTURAS)) {
  const ruta = join(CAPTURAS, carpeta);
  if (!statSync(ruta).isDirectory()) continue;

  // La historia sale del nombre de la carpeta y no del archivo: cinco capturas
  // no llevan la «h» delante y alguna tiene un espacio en medio del número.
  const deLaCarpeta = carpeta.match(/(\d+)/);
  if (!deLaCarpeta) continue;

  for (const archivo of readdirSync(ruta).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
    const m = archivo.match(/^\s*h?\s*\d*\s*\.?\s*(\d+)(?:\s*\.\s*(\d+))?/i);
    if (!m) continue;
    capturas.push({
      codigo: `HU-${String(deLaCarpeta[1]).padStart(2, '0')}`,
      criterio: Number(m[1]),
      orden: Number(m[2] ?? 0),
      // Relativa a «docs/», que es desde donde la resuelve el conversor, y
      // codificada: los nombres llevan espacios, comas y acentos, y sin
      // codificar GitHub no dibuja ni una de las 94 imágenes.
      relativa: encodeURI(`caso de pruebas/${carpeta}/${archivo}`),
    });
  }
}
capturas.sort(
  (a, b) => a.codigo.localeCompare(b.codigo) || a.criterio - b.criterio || a.orden - b.orden
);

const capturasDe = (codigo, criterio) =>
  capturas.filter((c) => c.codigo === codigo && c.criterio === criterio);

/* ── El documento ───────────────────────────────────────────────────────── */

const lineas = [];
const w = (...t) => lineas.push(...t);

const historias = Object.entries(criterios.historias);
const casoDe = (codigo, i) => catalogo.casos[`${codigo}.${i}`];
const construidas = historias.filter(([c, h]) => h.criterios.some((_, i) => casoDe(c, i + 1)));
const conCapturas = new Set(capturas.map((c) => c.codigo));
const participantes = sesiones.sesiones?.length ?? 0;
const totalCasos = Object.keys(catalogo.casos).length;

let figura = 0;

w(
  '# Anexo D · Casos de prueba, hallazgos, instrumento de usabilidad y consentimientos',
  '',
  '> **Trabajo de grado — Hub Cultural Santa Marta**',
  '> Ingeniería en Software, Tecnológico de Antioquia.',
  '> Versión del prototipo descrita: **1.0.0**.',
  '',
  '> ⚙ **Este documento se genera.** Lo escribe `herramientas/generar-anexo-d.js`, y',
  '> `npm run verificar` comprueba que el archivo del repositorio sea el que saldría hoy.',
  '> Para actualizarlo, `npm run anexo`; para el .docx que se adjunta, `npm run anexo:word`.',
  '',
  'Este anexo reúne la evidencia de verificación del prototipo, **compuesta a partir del**',
  '**repositorio**: los criterios de aceptación salen de la instantánea de los issues, los casos',
  'de prueba del catálogo que mantiene la matriz de trazabilidad, las capturas de',
  '`docs/caso de pruebas/`, los hallazgos de su registro y el instrumento de usabilidad de',
  '`pruebas/usabilidad/`. Ninguna cifra de este documento está escrita a mano.',
  '',
  '| | |',
  '| --- | --- |',
  `| Historias de usuario | ${historias.length} |`,
  `| Criterios de aceptación | ${historias.reduce((n, [, h]) => n + h.criterios.length, 0)} |`,
  `| Criterios con caso de prueba | ${totalCasos} |`,
  `| Capturas de pantalla | **${capturas.length}**, en ${conCapturas.size} historias |`,
  `| Hallazgos registrados | ${registro.hallazgos.length} |`,
  `| Sesiones de usabilidad ejecutadas | **${participantes}** de 8 |`,
  '',
  '---',
  '',
  '## D.1 Cómo leer este anexo',
  '',
  'Cada historia trae **sus criterios de aceptación tal como están escritos en el issue**, el',
  'caso de prueba que verifica cada uno y el resultado. Debajo, las capturas que documentan la',
  'comprobación.',
  '',
  '**No todas las historias tienen capturas, y no es un olvido.** El tipo de cada caso dice qué',
  'clase de evidencia le corresponde:',
  '',
  '| Tipo de caso | Qué evidencia produce |',
  '| --- | --- |',
  '| `navegador` | Un recorrido por la pantalla: **esto sí se fotografía** |',
  '| `produccion` | Lo mismo, pero sobre el sitio publicado |',
  '| `documental` | Un documento que tiene que existir y decir algo: la evidencia es el documento |',
  '| `unidad` | `npm run probar`, que corre en cada integración |',
  '| `reglas` | `npm run probar:reglas` contra el emulador de Firestore |',
  '| `estructura` | `npm run verificar`, reglas estructurales del repositorio |',
  '| `herramienta` | Un guion que mide y falla si no llega al umbral |',
  '| `asesor` | Una aprobación externa al repositorio |',
  '',
  'Por eso las historias de documentación —requisitos, arquitectura, modelo de datos— no',
  'aparecen con fotografías: su evidencia es el documento que produjeron, y está en `docs/`.',
  '',
  '---',
  '',
  '## D.2 Casos de prueba',
  ''
);

for (const [codigo, historia] of construidas) {
  const casos = historia.criterios.map((_, i) => casoDe(codigo, i + 1));
  w(`### ${codigo} · ${historia.titulo}`, '');

  const requisitos = (historia.requisitos ?? []).join(', ') || '—';
  w(
    `**Prioridad:** ${historia.prioridad ?? '—'} · **Requisitos:** ${requisitos} · ` +
      `**Objetivo específico:** ${historia.objetivo ?? '—'}`,
    '',
    '| # | Criterio de aceptación | Caso | Tipo | Resultado |',
    '| --- | --- | --- | --- | --- |'
  );

  historia.criterios.forEach((texto, i) => {
    const caso = casos[i];
    w(
      `| ${i + 1} | ${texto.replace(/\|/g, '—')} | ${caso?.caso ?? '—'} | ` +
        `${caso ? `\`${caso.tipo}\`` : '—'} | ${caso?.resultado ?? 'sin caso'} |`
    );
  });
  w('');

  const conEvidencia = casos.filter(Boolean);
  if (conEvidencia.length) {
    w('**Evidencia registrada:**', '');
    for (const caso of conEvidencia) w(`- **${caso.caso}** — ${caso.evidencia}`);
    w('');
  }

  const suyas = capturas.filter((c) => c.codigo === codigo);
  if (suyas.length === 0) {
    const tipos = [...new Set(conEvidencia.map((c) => c.tipo))].join(', ');
    w(`*Sin capturas de pantalla: la evidencia de esta historia es de tipo ${tipos || '—'}.*`, '');
  } else {
    for (const captura of suyas) {
      figura += 1;
      const texto = historia.criterios[captura.criterio - 1];
      w(
        `![Captura del criterio ${captura.criterio} de ${codigo}](${captura.relativa})`,
        '',
        `*Figura D.${figura} — ${codigo}.${captura.criterio}` +
          `${captura.orden ? ` (${captura.orden + 1}ª captura)` : ''}: ` +
          `${texto ? texto.replace(/\*/g, '') : 'criterio no encontrado en el issue'}*`,
        ''
      );
    }

    const sinCaptura = historia.criterios
      .map((_, i) => i + 1)
      .filter((n) => capturasDe(codigo, n).length === 0);
    if (sinCaptura.length) {
      w(
        `> **Criterios de esta historia sin captura:** ${sinCaptura.join(', ')}. El caso consta en la`,
        '> matriz y el resultado está anotado; lo que falta es la fotografía.',
        ''
      );
    }
  }
}

/* ── Hallazgos ──────────────────────────────────────────────────────────── */

const abiertos = registro.hallazgos.filter((h) => h.estado === 'abierto');

w(
  '---',
  '',
  '## D.3 Registro de hallazgos',
  '',
  'Un hallazgo es **algo que se encontró y no se resolvió donde se encontró**. Los que vienen de',
  'un caso de prueba que no pasa llevan su criterio; los que vienen de haber mirado, no.',
  '',
  '| Severidad | Qué significa |',
  '| --- | --- |',
  `| crítica | ${registro.severidades.critica} |`,
  `| alta | ${registro.severidades.alta} |`,
  `| media | ${registro.severidades.media} |`,
  `| baja | ${registro.severidades.baja} |`,
  '',
  `Registrados: **${registro.hallazgos.length}**. Abiertos: **${abiertos.length}**.`,
  '',
  '| Id | Severidad | Hallazgo | Estado |',
  '| --- | --- | --- | --- |'
);
for (const h of registro.hallazgos) {
  w(`| **${h.id}** | ${h.severidad} | ${h.titulo} | ${h.estado} |`);
}
w('');

for (const h of registro.hallazgos) {
  w(
    `### ${h.id} · ${h.titulo}`,
    '',
    `**Severidad:** ${h.severidad} · **Estado:** ${h.estado} · ` +
      `**Criterio:** ${h.criterio ?? 'ninguno, viene de una observación'} · **Dónde:** ${h.donde}`,
    '',
    `**Origen.** ${h.origen}`,
    '',
    h.descripcion,
    ''
  );
  if (h.propuesta) w(`**Propuesta.** ${h.propuesta}`, '');
}

/* ── Instrumento de usabilidad ──────────────────────────────────────────── */

const sinTitulo = (texto) => texto.replace(/^#\s+[^\n]*\n/, '').trim();
const bajarNiveles = (texto) => texto.replace(/^(#{1,5})\s/gm, (m, h) => `#${h} `);

w(
  '---',
  '',
  '## D.4 Instrumento de usabilidad',
  '',
  'Los tres documentos que se llevan a cada sesión, tal como están en `pruebas/usabilidad/`.',
  'Se reproducen completos porque son el instrumento: lo que firma el participante, lo que lee',
  'quien acompaña y lo que se responde al terminar.',
  ''
);

for (const [archivo, titulo] of [
  ['consentimiento.md', 'D.4.1 Hoja de consentimiento informado'],
  ['guion.md', 'D.4.2 Guion de la sesión'],
  ['cuestionario-sus.md', 'D.4.3 Cuestionario SUS'],
]) {
  w(`### ${titulo}`, '', bajarNiveles(sinTitulo(leer('pruebas', 'usabilidad', archivo))), '');
}

/* ── Consentimientos firmados ───────────────────────────────────────────── */

w('---', '', '## D.5 Consentimientos informados de los participantes', '');

if (participantes > 0) {
  w(
    `Sesiones ejecutadas: **${participantes}**. Cada consentimiento firmado se escanea y se`,
    'añade a este apartado.',
    ''
  );
} else {
  w(
    '**No hay ninguno, porque no hay participantes.** Las ocho sesiones de usabilidad que pide',
    'HU-36 **no se han ejecutado**: `pruebas/usabilidad/sesiones.json` está vacío y',
    '`npm run usabilidad` responde que hacen falta ocho personas que no hayan construido la',
    'plataforma.',
    '',
    'Se dice aquí en lugar de dejar el apartado en blanco o rellenarlo con formularios sin',
    'firmar: un consentimiento sin firmar no es un consentimiento, y este anexo documenta lo',
    'que ocurrió y no lo que estaba previsto.',
    '',
    'Queda registrado como el hallazgo **H-07**, de severidad alta, y es lo que impide cerrar el',
    'tercer criterio de HU-40. Cuando las sesiones se ejecuten, cada consentimiento firmado se',
    'escanea y se añade a este apartado, y el volcado de `sesiones.json` hace que el puntaje SUS',
    'aparezca solo en el informe de validación.',
    ''
  );
}

w('---', '', '*Elaboración propia (2026).*');

const contenido = `${lineas.join('\n')}\n`;

if (process.argv.includes('--comprobar')) {
  let actual = null;
  try {
    actual = readFileSync(DESTINO, 'utf8');
  } catch {
    console.log('  el anexo D no existe; ejecuta «npm run anexo»');
    process.exit(1);
  }
  // Normalizados los finales de línea: en Windows git los convierte al clonar.
  const sinSaltos = (t) => t.replace(/\r\n/g, '\n');
  if (sinSaltos(actual) !== sinSaltos(contenido)) {
    console.log('  docs/anexo-d.md está desfasado; ejecuta «npm run anexo»');
    process.exit(1);
  }
  console.log('  anexo D al día                        : correcto');
  process.exit(0);
}

writeFileSync(DESTINO, contenido, 'utf8');
console.log(
  `Escrito ${DESTINO}\n  ${construidas.length} historias · ${totalCasos} casos · ` +
    `${figura} figuras · ${registro.hallazgos.length} hallazgos · ${participantes} consentimientos`
);
