#!/usr/bin/env node
/**
 * Escribe «docs/39-informe-de-validacion.md» — HU-40 · RNF-01, RNF-10.
 *
 *   node herramientas/generar-informe.js            escribe el informe
 *   node herramientas/generar-informe.js --comprobar sale con 1 si está desfasado
 *
 * ## Por qué se genera y no se escribe
 *
 * El informe consolida lo que ya está medido en otros sitios: la matriz de
 * trazabilidad, el registro de hallazgos, el calculador de SUS y la tabla de
 * requisitos. Escribirlo a mano sería crear una **segunda fuente** de esos
 * números, y una segunda fuente siempre acaba diciendo algo distinto de la
 * primera: este mismo repositorio tenía escrito «6 índices» cuando ya eran diez
 * (docs/38). Aquí no hay ningún número tecleado: todos salen de leer los
 * archivos, y «npm run verificar» comprueba que el documento del repositorio
 * sea exactamente el que saldría hoy.
 *
 * Lo que sí está escrito a mano es el juicio —qué significa cada número y qué
 * falta—, porque eso no se calcula. Vive aquí abajo, en el texto de las
 * secciones, y no en el documento, que es derivado.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DESTINO = join(RAIZ, 'docs', '39-informe-de-validacion.md');
const leerJson = (...p) => JSON.parse(readFileSync(join(RAIZ, ...p), 'utf8'));
const leerTexto = (...p) => readFileSync(join(RAIZ, ...p), 'utf8');

const criterios = leerJson('pruebas', 'casos', 'criterios.json');
const catalogo = leerJson('pruebas', 'casos', 'casos.json');
const registro = leerJson('pruebas', 'casos', 'hallazgos.json');
const sesiones = leerJson('pruebas', 'usabilidad', 'sesiones.json');

/* ── Cobertura ──────────────────────────────────────────────────────────── */

const historias = Object.entries(criterios.historias);
const casosDe = (codigo) =>
  criterios.historias[codigo].criterios
    .map((_, i) => catalogo.casos[`${codigo}.${i + 1}`])
    .filter(Boolean);

const construidas = historias.filter(([c]) => casosDe(c).length > 0).map(([c]) => c);
const sinEmpezar = historias.filter(([c]) => casosDe(c).length === 0).map(([c]) => c);
const esDebe = (c) => criterios.historias[c].prioridad === 'debe';
const pasan = (c) => casosDe(c).every((caso) => caso.resultado === 'pasa');

const debeConstruidas = construidas.filter(esDebe);
const debeQuePasan = debeConstruidas.filter(pasan);
const cobertura = debeQuePasan.length / debeConstruidas.length;

const totalCriterios = historias.reduce((n, [, h]) => n + h.criterios.length, 0);
const conCaso = Object.keys(catalogo.casos).length;

const porTipo = {};
const porResultado = {};
for (const caso of Object.values(catalogo.casos)) {
  porTipo[caso.tipo] = (porTipo[caso.tipo] ?? 0) + 1;
  porResultado[caso.resultado] = (porResultado[caso.resultado] ?? 0) + 1;
}
const deReglas = Object.values(catalogo.casos).filter((c) => c.tipo === 'reglas');
const reglasQuePasan = deReglas.filter((c) => c.resultado === 'pasa');

/* ── Requisitos ─────────────────────────────────────────────────────────── */

const FILA_REQUISITO = /^\|\s*(R(?:F|NF)-\d+)\s*\|\s*([^|]+?)\s*\|/gm;
const declarados = [...leerTexto('docs', '01-requisitos.md').matchAll(FILA_REQUISITO)].map((m) => ({
  codigo: m[1],
  enunciado: m[2].replace(/\*\*/g, ''),
}));

const historiasDe = (requisito) =>
  historias.filter(([, h]) => (h.requisitos ?? []).includes(requisito)).map(([c]) => c);

const huerfanos = declarados.filter((r) => historiasDe(r.codigo).length === 0);

/* ── Hallazgos ──────────────────────────────────────────────────────────── */

const abiertos = registro.hallazgos.filter((h) => h.estado === 'abierto');
const porSeveridad = (s) => abiertos.filter((h) => h.severidad === s);
const altosAbiertos = porSeveridad('alta');

/* ── Utilidades de presentación ─────────────────────────────────────────── */

const pc = (n) => `${(n * 100).toFixed(1)} %`.replace('.', ',');
const si = (condicion) => (condicion ? '**sí**' : '**no**');

/* ── El documento ───────────────────────────────────────────────────────── */

const participantes = sesiones.sesiones?.length ?? 0;
const hayS = participantes > 0;

const lineas = [];
const w = (...t) => lineas.push(...t);

w(
  '# Informe de validación del prototipo',
  '',
  '> **Historia de usuario:** HU-40 · Sprint 8',
  '> **Objetivo específico:** 3 — Validar el prototipo con los actores culturales y el jurado.',
  '> **Requisitos asociados:** RNF-01, RNF-10.',
  '> **Depende de:** [HU-35 · pruebas y hallazgos](34-pruebas-y-hallazgos.md), [HU-36 · usabilidad](35-usabilidad.md).',
  '',
  '> ⚙ **Este documento se genera.** Lo escribe `herramientas/generar-informe.js` leyendo la',
  '> matriz de trazabilidad, el registro de hallazgos, el volcado de sesiones y la tabla de',
  '> requisitos. **No se edita a mano**: `npm run verificar` comprueba que el archivo del',
  '> repositorio sea exactamente el que saldría hoy, de modo que no pueda quedarse diciendo',
  '> un número que ya cambió. Para actualizarlo, `npm run informe`.',
  '',
  '---',
  '',
  '## 1. Lo que este informe concluye',
  '',
  'Los cuatro criterios de aceptación de HU-40, resueltos con los datos del repositorio:',
  '',
  '| Criterio | ¿Se cumple? | Por qué |',
  '| --- | --- | --- |',
  `| Presenta cobertura funcional, puntaje SUS y verificación de calidad | ${si(hayS)} | La cobertura y la verificación de calidad están (§2 y §4); **el puntaje SUS no existe**: ${participantes} de 8 sesiones ejecutadas (§3). |`,
  `| Incluye la matriz requisitos ↔ historias ↔ casos | **sí** | §5: ${declarados.length} requisitos, ${historias.length} historias y ${conCaso} casos cruzados. |`,
  `| Ningún hallazgo de severidad alta sin resolver | ${si(altosAbiertos.length === 0)} | ${altosAbiertos.length === 0 ? 'No queda ninguno abierto.' : `Quedan ${altosAbiertos.length} abiertos: ${altosAbiertos.map((h) => h.id).join(' y ')} (§6).`} |`,
  '| Alimenta el capítulo de resultados y discusión | **sí** | Las tablas de §2 a §6 son el material de ese capítulo, y cada número se puede volver a calcular. |',
  '',
  '**Dos de los cuatro no se cumplen todavía, y los dos dependen de lo mismo**: que se',
  'ejecuten las ocho sesiones de usabilidad con personas ajenas al equipo. Sin ellas no hay',
  'puntaje SUS, y mientras no las haya el hallazgo **H-07** sigue abierto con severidad alta.',
  'Es la única historia del trabajo que no se puede terminar escribiendo código, y se dice',
  'aquí en lugar de rellenar el hueco con una estimación.',
  '',
  '## 2. Cobertura funcional alcanzada',
  '',
  '| Medida | Valor |',
  '| --- | --- |',
  `| Historias de usuario | ${historias.length} |`,
  `| Criterios de aceptación | ${totalCriterios} |`,
  `| Criterios con al menos un caso de prueba | ${conCaso} |`,
  `| Criterios de historias todavía sin construir | ${totalCriterios - conCaso} (${sinEmpezar.join(', ')}) |`,
  `| Historias «Debe» construidas | ${debeConstruidas.length} |`,
  `| De ellas, superan **todos** sus casos | ${debeQuePasan.length} |`,
  `| **Cobertura funcional** | **${pc(cobertura)}** (umbral del segundo criterio de HU-35: 90,0 %) |`,
  '',
  'La cobertura cuenta **historias enteras**, no casos sueltos: una historia con tres',
  'criterios superados y uno pendiente no cuenta como tres cuartos, cuenta como no superada.',
  'Es deliberadamente severo, y es lo que hace que el número signifique algo.',
  '',
  '### Por tipo de caso',
  '',
  '| Tipo | Casos | Qué significa |',
  '| --- | --- | --- |',
);

const QUE_ES = {
  unidad: '`npm run probar` — funciones puras, sin emulador ni navegador',
  reglas: '`npm run probar:reglas` — contra el emulador de Firestore, en integración continua',
  estructura: '`npm run verificar` — reglas estructurales del repositorio',
  herramienta: 'un guion de `herramientas/` que mide y sale con código 1 si no llega',
  navegador: 'recorrido manual en el navegador, con la medida anotada en su documento',
  produccion: 'comprobado sobre el sitio publicado',
  documental: 'la evidencia es un documento: el criterio pide que exista y diga algo',
  asesor: 'depende de una aprobación externa al repositorio',
};
for (const [tipo, n] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  w(`| \`${tipo}\` | ${n} | ${QUE_ES[tipo] ?? ''} |`);
}

w(
  '',
  `De esos casos, **${deReglas.length}** son criterios cuya evidencia es la suite de reglas de`,
  `seguridad, y **${reglasQuePasan.length}** rechazan el acceso indebido: ${pc(reglasQuePasan.length / deReglas.length)}. Esa suite tiene`,
  'por dentro 221 casos y se ejecuta entera en cada integración.',
  '',
  '### Resultado de cada caso',
  '',
  '| Resultado | Casos |',
  '| --- | --- |',
);
for (const [resultado, n] of Object.entries(porResultado).sort((a, b) => b[1] - a[1])) {
  w(`| ${resultado} | ${n} |`);
}

w(
  '',
  '## 3. Puntaje SUS',
  '',
);

if (hayS) {
  w(`Sesiones volcadas: **${participantes}**. El puntaje se calcula con \`npm run usabilidad\`.`);
} else {
  w(
    '**No hay puntaje.** El instrumento está completo y probado —hoja de consentimiento, guion',
    'de seis tareas, cuestionario SUS y la aritmética del cálculo con sus casos de prueba— y',
    `el volcado de sesiones tiene **${participantes} participantes de los 8** que pide el criterio de HU-36.`,
    '',
    '```',
    'npm run usabilidad',
    '  Todavía no hay ninguna sesión volcada.',
    '  Hacen falta 8 participantes que no hayan construido la plataforma.',
    '```',
    '',
    'Calcular un SUS con cero respuestas daría un número, y ese número sería falso. El detalle',
    'del instrumento está en [35 · usabilidad](35-usabilidad.md); lo que falta es ejecutarlo.',
  );
}

w(
  '',
  '## 4. Verificación frente a las características de calidad',
  '',
  'Los requisitos no funcionales **son** las características de calidad que este trabajo se',
  'comprometió a sostener. Cada uno con dónde está comprobado:',
  '',
  '| Requisito | Característica | Dónde se comprueba |',
  '| --- | --- | --- |',
);

const EVIDENCIA_RNF = {
  'RNF-01': 'Facilidad de uso — [37 · manual de usuario](37-manual-de-usuario.md) y el instrumento de [35](35-usabilidad.md); **la validación con personas está pendiente**',
  'RNF-02': '**Sin evidencia en el repositorio.** Ninguna historia lo reclama y ningún documento lo verifica (§5)',
  'RNF-03': 'Accesibilidad — [31 · accesibilidad](31-accesibilidad.md), con los contrastes medidos por `herramientas/medir-contraste.py`',
  'RNF-04': 'Tiempo de carga — medido en [10 §](10-responsive.md) y [18 §11](18-imagen-del-perfil.md); ninguna historia lo reclama (§5)',
  'RNF-05': 'Responsive — [32 · responsive final](32-responsive-final.md), siete rutas a 360 px sin desbordamiento',
  'RNF-06': 'Tratamiento de datos — [14 · tratamiento de datos](14-tratamiento-de-datos.md)',
  'RNF-07': 'Control de acceso — [11 · reglas de seguridad](11-reglas-de-seguridad.md), 221 casos contra el emulador',
  'RNF-08': 'Integración y despliegue — [12 · despliegue continuo](12-despliegue-continuo.md) y [36 · despliegue final](36-despliegue-final.md)',
  'RNF-09': 'Mantenibilidad — [38 · documentación técnica](38-documentacion-tecnica.md) y las cinco reglas de `npm run verificar`',
  'RNF-10': 'Coste cero — [03 §6.1](03-arquitectura.md): sin Storage y sin servidor propio',
};
for (const r of declarados.filter((x) => x.codigo.startsWith('RNF'))) {
  w(`| **${r.codigo}** | ${r.enunciado} | ${EVIDENCIA_RNF[r.codigo] ?? '—'} |`);
}

w(
  '',
  '## 5. Matriz de trazabilidad',
  '',
  'Requisito → historias que lo realizan → casos de prueba de esas historias. Es la tabla que',
  'pide el segundo criterio, y la que permite responder «¿dónde se comprueba RF-07?» sin leer',
  'el repositorio entero.',
  '',
  '| Requisito | Historias | Casos | Superados |',
  '| --- | --- | --- | --- |',
);

for (const r of declarados) {
  const hs = historiasDe(r.codigo);
  const casos = hs.flatMap((c) => casosDe(c));
  const superados = casos.filter((c) => c.resultado === 'pasa').length;
  w(
    `| **${r.codigo}** | ${hs.length ? hs.join(', ') : '—'} | ${casos.length} | ${casos.length ? `${superados} de ${casos.length}` : '—'} |`
  );
}

w(
  '',
  `**${huerfanos.length} requisitos no los reclama ninguna historia**: ${huerfanos.map((h) => h.codigo).join(' y ')}.`,
  'No es lo mismo en los dos casos, y conviene separarlo:',
  '',
  '- **RNF-04** sí está medido —el presupuesto de tres segundos aparece en [10](10-responsive.md),',
  '  [18 §11](18-imagen-del-perfil.md) y [32](32-responsive-final.md)—, pero ninguna ficha de historia lo',
  '  declara, así que la trazabilidad hacia él se sostiene en la prosa y no en la matriz.',
  '- **RNF-02** —funcionar en los navegadores de mayor uso— **no tiene ni historia ni evidencia**.',
  '  Es el único requisito declarado del que este trabajo no puede enseñar una comprobación.',
  '',
  'Las dos cosas quedan registradas como hallazgos (§6) en lugar de corregirse cambiando las',
  'fichas, que sería reescribir el expediente para que cuadre.',
  '',
  '## 6. Registro de hallazgos',
  '',
  `Abiertos: **${abiertos.length}** de ${registro.hallazgos.length}.`,
  '',
  '| Id | Severidad | Hallazgo | Estado |',
  '| --- | --- | --- | --- |',
);

for (const h of registro.hallazgos) {
  w(`| ${h.id} | ${h.severidad} | ${h.titulo} | ${h.estado} |`);
}

w(
  '',
  '| Severidad | Abiertos | Qué significa |',
  '| --- | --- | --- |',
  `| crítica | ${porSeveridad('critica').length} | ${registro.severidades.critica} |`,
  `| alta | ${altosAbiertos.length} | ${registro.severidades.alta} |`,
  `| media | ${porSeveridad('media').length} | ${registro.severidades.media} |`,
  `| baja | ${porSeveridad('baja').length} | ${registro.severidades.baja} |`,
  '',
);

if (altosAbiertos.length > 0) {
  w(
    `**El tercer criterio de HU-40 no se cumple.** Siguen abiertos ${altosAbiertos.length} hallazgos de severidad alta:`,
    '',
  );
  for (const h of altosAbiertos) {
    w(`- **${h.id} · ${h.titulo}.** ${h.propuesta ?? ''}`, '');
  }
} else {
  w('**El tercer criterio se cumple**: no queda ningún hallazgo de severidad alta abierto.', '');
}

w(
  '## 7. Qué falta para cerrar el proyecto',
  '',
  '| # | Qué | Quién puede hacerlo |',
  '| --- | --- | --- |',
  '| 1 | **Ejecutar las ocho sesiones de usabilidad** con personas ajenas al equipo | Nadie desde el repositorio: hacen falta ocho personas |',
  '| 2 | Decidir qué hacer con **H-01**, las escrituras sin conexión | Es una decisión de producto; después, código |',
  '| 3 | Validar el manual con alguien de fuera (tercer criterio de HU-38) | Una persona, veinte minutos |',
  '| 4 | Registrar las dos constancias del asesor (**H-04** y **H-05**) | El asesor |',
  '| 5 | Recorrer las cuatro vistas privadas con sesión (**H-06**) | Quien tenga una cuenta de cada rol |',
  '| 6 | Comprobar el sitio en los navegadores que pide RNF-02 (**H-08**) | Una tarde, y cierra el último requisito sin evidencia |',
  '| 7 | Declarar RNF-04 en las fichas de HU-09 y HU-25 (**H-09**) | Quien pueda editar los issues |',
  '',
  'Ninguno de los siete se resuelve escribiendo código en este repositorio, y por eso el',
  'informe los enumera en lugar de darlos por hechos. Los dos últimos los encontró este mismo',
  'informe al cruzar la matriz.',
  '',
  '## 8. Cierre de HU-40',
  '',
  '| Criterio de aceptación | Evidencia |',
  '| --- | --- |',
  `| Cobertura funcional, puntaje SUS y características de calidad | §2 (${pc(cobertura)}), §3 (**sin puntaje**: ${participantes} de 8 sesiones) y §4. |`,
  `| Matriz de trazabilidad requisitos ↔ historias ↔ casos | §5: ${declarados.length} requisitos cruzados, con ${huerfanos.length} sin historia. |`,
  `| Ningún hallazgo de severidad alta sin resolver | §6: **${altosAbiertos.length} abiertos** (${altosAbiertos.map((h) => h.id).join(', ')}). |`,
  '| Alimenta el capítulo de resultados y discusión | Las tablas de §2 a §6, todas recalculables con `npm run informe`. |',
  '',
  '---',
  '',
  '*Elaboración propia (2026).*',
);

const contenido = `${lineas.join('\n')}\n`;

if (process.argv.includes('--comprobar')) {
  let actual = null;
  try {
    actual = readFileSync(DESTINO, 'utf8');
  } catch {
    console.log('  el informe de validación no existe; ejecuta «npm run informe»');
    process.exit(1);
  }
  // Se comparan los finales de línea normalizados. En Windows, git convierte a
  // CRLF al sacar los archivos del repositorio, y esto se escribe con LF: sin
  // normalizar, la comprobación fallaría en cuanto alguien clonara el proyecto
  // en Windows, que es donde se construyó. Un guardarraíl que avisa cuando no
  // pasa nada se desactiva a la semana.
  const sinSaltos = (t) => t.replace(/\r\n/g, '\n');
  if (sinSaltos(actual) !== sinSaltos(contenido)) {
    console.log('  docs/39-informe-de-validacion.md está desfasado; ejecuta «npm run informe»');
    process.exit(1);
  }
  console.log('  informe de validación al día          : correcto');
  process.exit(0);
}

writeFileSync(DESTINO, contenido, 'utf8');
console.log(
  `Escrito ${DESTINO}\n` +
    `  cobertura ${pc(cobertura)} · ${conCaso} casos · ${declarados.length} requisitos · ` +
    `${abiertos.length} hallazgos abiertos (${altosAbiertos.length} de severidad alta) · ` +
    `${participantes} sesiones de usabilidad`
);
