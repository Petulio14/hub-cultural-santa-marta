// Hub Cultural Santa Marta — generador del prototipo · HU-06
//
// Construye dentro del archivo abierto:
//   · 17 estilos de color y 12 de texto (docs/05-prototipo-interfaz.md §3)
//   · 3 estilos de rejilla, uno por ancho de RNF-03
//   · 7 componentes con auto layout
//   · 27 pantallas: 9 vistas × 360 / 768 / 1366 px
//   · los enlaces de navegación del prototipo
//   · una auditoría de lo construido
//
// Es re-ejecutable: borra lo que generó antes y lo vuelve a hacer.

figma.showUI(__html__, { width: 400, height: 600 });

// ═══════════════════════════════════════════════════════════ constantes

var PALETA = {
  'marca/azul-profundo': '0B3C5D',
  'marca/turquesa-oscuro': '0A5F5E',
  'marca/turquesa': '0E7C7B',
  'estado/terracota': 'B04A2F',
  'estado/ocre': '8A5A17',
  'fondo/arena': 'F7F3EC',
  'fondo/blanco': 'FFFFFF',
  'texto/negro': '14181C',
  'texto/cuerpo': '3A3F45',
  'texto/apagado': '5C666F',
  'linea/borde': 'D5CFC4',
  'categoria/musica': 'B04A2F',
  'categoria/saberes': '8A5A17',
  'categoria/patrimonio': '0B3C5D',
  'categoria/gastronomia': '0A5F5E',
  'categoria/artes': '0E7C7B',
  'categoria/artesania': '6E4A2E'
};

var ARCHIVO = 'Archivo';
var CUERPO = 'Source Sans 3';
var MONO = 'IBM Plex Mono';

var TIPOGRAFIA = [
  ['titulo/h1-movil', ARCHIVO, 'Bold', 26, 115, 0, null],
  ['titulo/h1-escritorio', ARCHIVO, 'Bold', 32, 115, 0, null],
  ['titulo/h2-movil', ARCHIVO, 'SemiBold', 19, 130, 0, null],
  ['titulo/h2-escritorio', ARCHIVO, 'SemiBold', 21, 130, 0, null],
  ['titulo/h3', ARCHIVO, 'SemiBold', 16, 130, 0, null],
  ['cuerpo/normal', CUERPO, 'Regular', 15, 150, 0, null],
  ['cuerpo/fuerte', CUERPO, 'SemiBold', 15, 150, 0, null],
  ['cuerpo/pequeno', CUERPO, 'Regular', 13.5, 145, 0, null],
  ['cuerpo/meta', CUERPO, 'Regular', 13, 140, 0, null],
  ['cuerpo/pista', CUERPO, 'Regular', 12.5, 140, 0, null],
  ['etiqueta/eyebrow', MONO, 'Medium', 10.5, 140, 10, 'UPPER'],
  ['etiqueta/dato', MONO, 'Regular', 12.5, 140, 0, null]
];

// Tamaño de cada estilo, para poder estimar el ancho natural de un texto.
var TAMANO = {};
TIPOGRAFIA.forEach(function (d) { TAMANO[d[0]] = d[3]; });

var FUENTES = [
  { family: ARCHIVO, style: 'Bold' },
  { family: ARCHIVO, style: 'SemiBold' },
  { family: ARCHIVO, style: 'Medium' },
  { family: CUERPO, style: 'Regular' },
  { family: CUERPO, style: 'SemiBold' },
  { family: MONO, style: 'Regular' },
  { family: MONO, style: 'Medium' }
];

var REJILLAS = {
  360: { count: 4, gutter: 16, offset: 16 },
  768: { count: 8, gutter: 18, offset: 24 },
  1366: { count: 12, gutter: 20, offset: 32 }
};

var ANCHOS = [360, 768, 1366];

// contenido cultural real, el mismo de docs/prototipo/index.html
var EVENTOS = [
  { t: 'Cumbia y tambora: noche abierta', c: 'Música y danza', k: 'musica',
    f: '21 ago', l: 'Parque de los Novios',
    d: 'Tambora, gaita y baile de rueda con agrupaciones del Magdalena.' },
  { t: 'Taller de tejido en telar de cintura', c: 'Saberes ancestrales', k: 'saberes',
    f: '23 ago', l: 'Bonda',
    d: 'Tres horas con tejedoras de la Sierra para aprender el punto base de la mochila.' },
  { t: 'Ruta del cacao: de la mazorca a la taza', c: 'Gastronomía', k: 'gastronomia',
    f: '24 ago', l: 'Minca',
    d: 'Recorrido por una finca cacaotera y tostión artesanal al final del camino.' },
  { t: 'Palabra de mamo: círculo de saberes', c: 'Saberes ancestrales', k: 'saberes',
    f: '26 ago', l: 'Quebrada Valencia',
    d: 'Encuentro guiado sobre la lectura del territorio en la cosmovisión kogui.' },
  { t: 'Alfarería tairona: barro y memoria', c: 'Saberes ancestrales', k: 'artesania',
    f: '29 ago', l: 'Taganga',
    d: 'Modelado a mano con arcilla local y quema tradicional a cielo abierto.' },
  { t: 'Tintes naturales: el color del monte', c: 'Artesanía', k: 'artesania',
    f: '6 sep', l: 'Bonda',
    d: 'Recorrido por las plantas tintóreas y sesión práctica de teñido de fique.' }
];

var HUBS = [
  { n: 'Hub Creativo Bahía',
    d: 'Laboratorio de economía creativa en el Centro Histórico. Acompaña colectivos en formalización, portafolio y acceso a convocatorias.',
    l: ['Economía creativa', 'Formalización', 'Convocatorias'],
    dir: 'Calle 17 #3-45, Centro Histórico', c: 'contacto@hubbahia.co' },
  { n: 'Nodo Tairona de Innovación',
    d: 'Espacio universitario de prototipado. Trabaja con comunidades de la Sierra en registro digital de saberes y turismo comunitario.',
    l: ['Prototipado', 'Turismo comunitario', 'Patrimonio digital'],
    dir: 'Carrera 32 #22-08, Mamatoco', c: 'nodo@tairona.edu.co' },
  { n: 'Casa Ancla · Cowork Cultural',
    d: 'Coworking y sala de ensayo en Taganga. Programa residencias cortas para artistas y gestores del Caribe.',
    l: ['Residencias', 'Sala de ensayo', 'Redes del Caribe'],
    dir: 'Vía Taganga km 2', c: 'hola@casaancla.org' }
];

var VISTAS = [
  { id: 'V-1', nombre: 'Inicio', hu: 'HU-09, HU-10' },
  { id: 'V-2', nombre: 'Catálogo', hu: 'HU-25, HU-26, HU-27' },
  { id: 'V-3', nombre: 'Detalle de evento', hu: 'HU-28, HU-29' },
  { id: 'V-4', nombre: 'Perfil de actor', hu: 'HU-18, HU-19' },
  { id: 'V-5', nombre: 'Directorio de hubs', hu: 'HU-20' },
  { id: 'V-6', nombre: 'Mapa interactivo', hu: 'HU-30, HU-33' },
  { id: 'V-7', nombre: 'Panel de administración', hu: 'HU-17, HU-24, HU-34' },
  { id: 'V-8', nombre: 'Ingreso y registro', hu: 'HU-12, HU-14, HU-16' },
  { id: 'V-9', nombre: 'Mis publicaciones', hu: 'HU-21, HU-22, HU-23' }
];

var MARCA_RAIZ = 'HubCultural';   // prefijo para poder limpiar en la re-ejecución

// Se imprime en el informe: sirve para saber sin ambigüedad qué build lo produjo.
var VERSION = 'build 8 · 2026-08-21';

// ═══════════════════════════════════════════════════════════ utilidades

function rgb(hex) {
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

function solido(nombreColor) {
  return [{ type: 'SOLID', color: rgb(PALETA[nombreColor]) }];
}

var incidencias = [];
var estilosColor = {};
var estilosTexto = {};
var componentes = {};
var marcos = {};        // 'V-1@1366' -> FrameNode
var auxiliares = {};    // capas que no son pantallas: 'MENU@360' -> FrameNode
var enlaces = [];       // { desde: node, hacia: 'V-3', ancho: 1366, accion: 'navegar' }
var fuentesFallidas = [];

// Imágenes que aporta la persona que ejecuta el plugin, desde el selector de la
// interfaz. Se guardan en clientStorage —no hay red: `networkAccess` es "none"—
// así que se piden una vez y sobreviven a los siguientes builds.
var CLAVE_LOGO = 'hub-cultural/logo-institucional';
var CLAVE_FONDO = 'hub-cultural/fondo-santa-marta';
var recursos = { logo: null, fondo: null };   // { nombre, base64 }
var imagenLogo = null;    // hash de imagen de Figma, o null
var imagenFondo = null;

// Proporción del logotipo del Tecnológico de Antioquia (ancho ÷ alto). Solo fija el
// hueco: el relleno va en modo FIT, así que una imagen de otra proporción se ajusta
// dentro sin deformarse.
var PROPORCION_LOGO = 4.35;

function avisar(texto) {
  figma.ui.postMessage({ tipo: 'progreso', texto: texto });
}

function aplicarRelleno(nodo, nombreColor) {
  var est = estilosColor[nombreColor];
  if (est) {
    try { nodo.fillStyleId = est.id; return; } catch (e) { /* cae al relleno directo */ }
  }
  nodo.fills = solido(nombreColor);
}

function aplicarBorde(nodo, nombreColor, grosor) {
  nodo.strokes = solido(nombreColor);
  nodo.strokeWeight = grosor || 1;
  nodo.strokeAlign = 'INSIDE';
}

// Crea un frame con auto layout vertical u horizontal.
function pila(nombre, direccion, opciones) {
  var o = opciones || {};
  var f = figma.createFrame();
  f.name = nombre;
  f.layoutMode = direccion === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  f.primaryAxisSizingMode = o.principalFijo ? 'FIXED' : 'AUTO';
  f.counterAxisSizingMode = o.cruzadoFijo ? 'FIXED' : 'AUTO';
  f.itemSpacing = o.espacio === undefined ? 12 : o.espacio;
  var p = o.relleno === undefined ? 0 : o.relleno;
  f.paddingTop = o.arriba === undefined ? p : o.arriba;
  f.paddingBottom = o.abajo === undefined ? p : o.abajo;
  f.paddingLeft = o.izq === undefined ? p : o.izq;
  f.paddingRight = o.der === undefined ? p : o.der;
  f.counterAxisAlignItems = o.alinear || 'MIN';
  f.primaryAxisAlignItems = o.justificar || 'MIN';
  // El ajuste de línea solo actúa si el eje principal tiene ancho fijo. Se consigue
  // con `ancho:` o con estirar() dentro de un padre vertical; la auditoría comprueba
  // al final que ninguno se quedó abrazando su contenido.
  if (o.envolver) {
    f.layoutWrap = 'WRAP';
    // itemSpacing solo separa los elementos DENTRO de una fila. La separación
    // ENTRE filas es counterAxisSpacing, y sin fijarla las filas quedan pegadas:
    // a 1366 se nota poco porque casi todo cabe en una fila, pero a 360 cada
    // tarjeta ocupa su propia fila y el resultado es una pila sin aire.
    try {
      f.counterAxisSpacing = o.espacioFilas === undefined
        ? (o.espacio === undefined ? 12 : o.espacio)
        : o.espacioFilas;
    } catch (e) { /* versiones antiguas de la API no exponen la propiedad */ }
  }
  if (o.radio) f.cornerRadius = o.radio;
  if (o.fondo) aplicarRelleno(f, o.fondo); else f.fills = [];
  if (o.borde) aplicarBorde(f, o.borde, o.grosorBorde);
  if (o.ancho) fijarAncho(f, o.ancho);
  return f;
}

// Fija el ancho respetando qué eje es cuál: en un frame horizontal el ancho es el
// eje principal, en uno vertical es el transversal. Confundirlos deja el ancho en
// «abrazar contenido» y el resize se deshace solo.
function fijarAncho(f, ancho) {
  if (f.layoutMode === 'HORIZONTAL') f.primaryAxisSizingMode = 'FIXED';
  else if (f.layoutMode === 'VERTICAL') f.counterAxisSizingMode = 'FIXED';
  f.resize(Math.max(0.01, ancho), Math.max(0.01, f.height));
}

// `layoutAlign` y `layoutGrow` solo tienen efecto cuando el nodo ya está dentro de un
// contenedor con auto layout, y aquí casi siempre se piden antes de añadirlo. Se deja
// la intención anotada y reaplicarDimensionado() la vuelve a aplicar al final, con el
// árbol ya montado. Sin eso el nodo se queda en los 100 px por defecto de Figma.
function estirar(nodo) {
  nodo.layoutAlign = 'STRETCH';
  if (nodo.setPluginData) nodo.setPluginData('dimensionado', 'estirar');
  // En un contenedor horizontal el ancho es el eje principal. Si rellena a su padre
  // pero sigue en «abrazar contenido», Figma colapsa a 1 px a los hijos que rellenan
  // y no aplica el ajuste de línea. Es la causa de los campos y títulos aplastados.
  if (nodo.layoutMode === 'HORIZONTAL') nodo.primaryAxisSizingMode = 'FIXED';
  return nodo;
}

function crecer(nodo) {
  nodo.layoutGrow = 1;
  if (nodo.setPluginData) nodo.setPluginData('dimensionado', 'crecer');
  return nodo;
}

function reaplicarDimensionado(nodo) {
  if (!nodo.children) return;
  var conAuto = nodo.layoutMode === 'VERTICAL' || nodo.layoutMode === 'HORIZONTAL';
  nodo.children.forEach(function (h) {
    if (conAuto && h.getPluginData) {
      var quiere = h.getPluginData('dimensionado');
      try {
        if (quiere === 'estirar') {
          h.layoutAlign = 'STRETCH';
          if (h.layoutMode === 'HORIZONTAL') h.primaryAxisSizingMode = 'FIXED';
        } else if (quiere === 'crecer') {
          h.layoutGrow = 1;
        }
      } catch (e) { /* algunos nodos no admiten estas propiedades */ }
    }
    // Un hijo que rellena dentro de un contenedor horizontal que abraza su contenido
    // colapsa a 1 px. Si aparece uno así, se le fija el ancho al contenedor.
    if (nodo.layoutMode === 'HORIZONTAL' && nodo.primaryAxisSizingMode !== 'FIXED' &&
        h.layoutGrow > 0) {
      try { nodo.primaryAxisSizingMode = 'FIXED'; } catch (e) {}
    }
    reaplicarDimensionado(h);
  });
}

// Crea un texto con su estilo y su color.
function T(estilo, contenido, color, opciones) {
  var o = opciones || {};
  var t = figma.createText();
  t.setPluginData('tam', String(TAMANO[estilo] || 15));
  var est = estilosTexto[estilo];
  if (est) {
    try { t.textStyleId = est.id; } catch (e) { t.fontName = { family: CUERPO, style: 'Regular' }; }
  } else {
    t.fontName = { family: CUERPO, style: 'Regular' };
  }
  t.characters = contenido;
  t.textAutoResize = o.altoAuto === false ? 'NONE' : 'HEIGHT';
  aplicarRelleno(t, color || 'texto/cuerpo');
  t.name = o.nombre || contenido.substring(0, 34);
  return t;
}

function rectangulo(nombre, ancho, alto, color, radio) {
  var r = figma.createRectangle();
  r.name = nombre;
  r.resize(ancho, alto);
  if (color) aplicarRelleno(r, color);
  if (radio) r.cornerRadius = radio;
  return r;
}

// Relleno degradado del tinte de la categoría hacia la arena.
function degradado(tinte) {
  var a = rgb(PALETA['categoria/' + tinte]);
  var b = rgb(PALETA['fondo/arena']);
  return [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0.8, 0.6, 0], [-0.6, 0.8, 0.35]],
    gradientStops: [
      { position: 0, color: { r: a.r, g: a.g, b: a.b, a: 1 } },
      { position: 1, color: { r: (a.r + b.r) / 2, g: (a.g + b.g) / 2, b: (a.b + b.b) / 2, a: 1 } }
    ]
  }];
}

// Bloque de imagen. El nombre lleva la descripción que será el texto alternativo.
function imagen(nombre, ancho, alto, tinte) {
  var r = figma.createRectangle();
  r.name = nombre;
  r.resize(ancho, alto);
  r.cornerRadius = 0;
  r.fills = degradado(tinte);
  return r;
}

// El entorno de los plugins no tiene `atob`. Las versiones recientes de la API sí
// traen figma.base64Decode; para las que no, el decodificador cabe en diez líneas.
var ALFABETO_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function desdeBase64(texto) {
  if (typeof figma.base64Decode === 'function') {
    try { return figma.base64Decode(texto); } catch (e) { /* se usa el manual */ }
  }
  var limpio = String(texto).replace(/[^A-Za-z0-9+/]/g, '');
  var bytes = new Uint8Array(Math.floor(limpio.length * 3 / 4) + 2);
  var acumulador = 0, bits = 0, escritos = 0;
  for (var i = 0; i < limpio.length; i++) {
    acumulador = (acumulador << 6) | ALFABETO_B64.indexOf(limpio.charAt(i));
    bits += 6;
    if (bits >= 8) { bits -= 8; bytes[escritos++] = (acumulador >> bits) & 0xFF; }
  }
  return bytes.subarray(0, escritos);
}

async function leerRecursos() {
  try {
    recursos.logo = (await figma.clientStorage.getAsync(CLAVE_LOGO)) || null;
    recursos.fondo = (await figma.clientStorage.getAsync(CLAVE_FONDO)) || null;
  } catch (e) {
    incidencias.push('no se pudieron leer las imágenes guardadas: ' + e.message);
  }
}

// Convierte lo guardado en un hash de imagen de Figma. Un fallo aquí no detiene la
// construcción: se dibuja el marcador y el informe lo dice.
function prepararImagenes() {
  imagenLogo = null;
  imagenFondo = null;
  [['logo', 'imagenLogo'], ['fondo', 'imagenFondo']].forEach(function (par) {
    var r = recursos[par[0]];
    if (!r || !r.base64) return;
    try {
      var hash = figma.createImage(desdeBase64(r.base64)).hash;
      if (par[1] === 'imagenLogo') imagenLogo = hash; else imagenFondo = hash;
    } catch (e) {
      incidencias.push('no se pudo usar la imagen «' + (r.nombre || par[0]) + '»: ' + e.message);
    }
  });
}

async function fijarReacciones(nodo, reacciones) {
  if (nodo.setReactionsAsync) {
    await nodo.setReactionsAsync(reacciones);
  } else {
    nodo.reactions = reacciones;
  }
}

// ═══════════════════════════════════════════════════════════ fase 0 · limpieza

function limpiarAnterior() {
  var borrados = 0;
  var pagina = figma.currentPage;
  for (var i = pagina.children.length - 1; i >= 0; i--) {
    var n = pagina.children[i];
    if (n.getPluginData && n.getPluginData('generador') === MARCA_RAIZ) {
      n.remove();
      borrados++;
    }
  }
  return borrados;
}

// ═══════════════════════════════════════════════════════════ fase 1 · fuentes

async function cargarFuentes() {
  for (var i = 0; i < FUENTES.length; i++) {
    try {
      await figma.loadFontAsync(FUENTES[i]);
    } catch (e) {
      fuentesFallidas.push(FUENTES[i].family + ' ' + FUENTES[i].style);
    }
  }
  // respaldo: si algo falló, Inter garantiza que el resto se construya igual
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch (e) {}
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }); } catch (e) {}
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }); } catch (e) {}
}

function fuenteDisponible(familia, estilo) {
  return fuentesFallidas.indexOf(familia + ' ' + estilo) === -1;
}

// ═══════════════════════════════════════════════════════════ fase 2 · estilos

var estilosRejilla = {};

async function crearEstilos() {
  var locales = figma.getLocalPaintStylesAsync
    ? await figma.getLocalPaintStylesAsync()
    : figma.getLocalPaintStyles();

  Object.keys(PALETA).forEach(function (nombre) {
    var ya = null;
    for (var i = 0; i < locales.length; i++) if (locales[i].name === nombre) ya = locales[i];
    var e = ya || figma.createPaintStyle();
    e.name = nombre;
    e.paints = [{ type: 'SOLID', color: rgb(PALETA[nombre]) }];
    estilosColor[nombre] = e;
  });

  var textosLocales = figma.getLocalTextStylesAsync
    ? await figma.getLocalTextStylesAsync()
    : figma.getLocalTextStyles();
  if (!textosLocales) textosLocales = [];

  TIPOGRAFIA.forEach(function (d) {
    var nombre = d[0], familia = d[1], estilo = d[2], tam = d[3], lh = d[4], ls = d[5], caja = d[6];
    if (!fuenteDisponible(familia, estilo)) {
      familia = 'Inter';
      estilo = (d[2] === 'Bold') ? 'Bold' : (d[2] === 'SemiBold' || d[2] === 'Medium') ? 'Semi Bold' : 'Regular';
    }
    var ya = null;
    for (var i = 0; i < textosLocales.length; i++) if (textosLocales[i].name === nombre) ya = textosLocales[i];
    var e = ya || figma.createTextStyle();
    e.name = nombre;
    try { e.fontName = { family: familia, style: estilo }; } catch (err) {
      e.fontName = { family: 'Inter', style: 'Regular' };
      incidencias.push('estilo de texto "' + nombre + '": fuente sustituida por Inter');
    }
    e.fontSize = tam;
    e.lineHeight = { unit: 'PERCENT', value: lh };
    if (ls) e.letterSpacing = { unit: 'PERCENT', value: ls };
    if (caja) e.textCase = caja;
    estilosTexto[nombre] = e;
  });

  var rejillasLocales = figma.getLocalGridStylesAsync
    ? await figma.getLocalGridStylesAsync()
    : figma.getLocalGridStyles();
  if (!rejillasLocales) rejillasLocales = [];

  ANCHOS.forEach(function (a) {
    var nombre = 'rejilla/' + a;
    var r = REJILLAS[a];
    var ya = null;
    for (var i = 0; i < rejillasLocales.length; i++) if (rejillasLocales[i].name === nombre) ya = rejillasLocales[i];
    var e = ya || figma.createGridStyle();
    e.name = nombre;
    e.layoutGrids = [{
      pattern: 'COLUMNS',
      alignment: 'STRETCH',
      count: r.count,
      gutterSize: r.gutter,
      offset: r.offset,
      visible: false,
      color: { r: 1, g: 0, b: 0, a: 0.08 }
    }];
    estilosRejilla[a] = e;
  });
}

// ═══════════════════════════════════════════════════════════ fase 3 · componentes

function hacerBoton(variante, movil) {
  var esSecundario = variante === 'secundario';
  var esRiesgo = variante === 'riesgo';
  var f = pila('boton', 'h', {
    espacio: 8, arriba: 11, abajo: 11, izq: 20, der: 20, radio: 5,
    alinear: 'CENTER', justificar: 'CENTER',
    fondo: esSecundario ? null : (esRiesgo ? 'estado/terracota' : 'marca/turquesa-oscuro')
  });
  if (esSecundario) {
    f.fills = [];
    aplicarBorde(f, 'marca/turquesa-oscuro', 1.5);
  }
  f.appendChild(T('cuerpo/fuerte',
    esRiesgo ? 'Devolver' : (esSecundario ? 'Acción secundaria' : 'Acción principal'),
    esSecundario ? 'marca/turquesa-oscuro' : 'fondo/blanco'));
  f.resize(f.width, Math.max(44, f.height));
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(f.width, 44);
  return f;
}

function crearComponentes() {
  var origenX = -1400, origenY = 0;

  function envolver(nodo, nombre) {
    var c = figma.createComponent();
    c.name = nombre;
    c.layoutMode = nodo.layoutMode;
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.itemSpacing = nodo.itemSpacing;
    c.paddingTop = nodo.paddingTop; c.paddingBottom = nodo.paddingBottom;
    c.paddingLeft = nodo.paddingLeft; c.paddingRight = nodo.paddingRight;
    c.counterAxisAlignItems = nodo.counterAxisAlignItems;
    c.primaryAxisAlignItems = nodo.primaryAxisAlignItems;
    c.cornerRadius = nodo.cornerRadius;
    c.fills = nodo.fills;
    c.strokes = nodo.strokes;
    c.strokeWeight = nodo.strokeWeight;
    while (nodo.children.length) c.appendChild(nodo.children[0]);
    nodo.remove();
    return c;
  }

  var creados = [];

  ['principal', 'secundario', 'riesgo'].forEach(function (v, i) {
    var c = envolver(hacerBoton(v), 'variante=' + v);
    c.x = origenX; c.y = origenY + i * 70;
    figma.currentPage.appendChild(c);
    creados.push(c);
  });
  var conjunto;
  try {
    conjunto = figma.combineAsVariants(creados, figma.currentPage);
    conjunto.name = 'Boton';
    conjunto.x = origenX; conjunto.y = origenY;
    componentes['Boton'] = conjunto;
  } catch (e) {
    incidencias.push('no se pudo agrupar las variantes de Boton: ' + e.message);
    componentes['Boton'] = creados[0];
  }

  // Insignia de estado — color Y texto, nunca solo color
  var insignias = [];
  [['pendiente', 'estado/ocre'], ['aprobado', 'marca/turquesa-oscuro'], ['devuelto', 'estado/terracota']]
    .forEach(function (d, i) {
      var f = pila('insignia', 'h', {
        espacio: 5, arriba: 3, abajo: 3, izq: 9, der: 9, radio: 99,
        alinear: 'CENTER', fondo: 'fondo/blanco'
      });
      aplicarBorde(f, d[1], 1);
      var punto = figma.createEllipse();
      punto.resize(6, 6);
      aplicarRelleno(punto, d[1]);
      punto.name = 'punto';
      f.appendChild(punto);
      f.appendChild(T('cuerpo/meta', d[0].charAt(0).toUpperCase() + d[0].slice(1), d[1]));
      var c = envolver(f, 'estado=' + d[0]);
      c.x = origenX + 200; c.y = origenY + i * 50;
      figma.currentPage.appendChild(c);
      insignias.push(c);
    });
  try {
    var ci = figma.combineAsVariants(insignias, figma.currentPage);
    ci.name = 'Insignia';
    ci.x = origenX + 200; ci.y = origenY;
    componentes['Insignia'] = ci;
  } catch (e) {
    componentes['Insignia'] = insignias[0];
  }

  // Chip
  var chips = [];
  [true, false].forEach(function (activo, i) {
    var f = pila('chip', 'h', {
      espacio: 6, arriba: 6, abajo: 6, izq: 14, der: 14, radio: 99,
      alinear: 'CENTER', fondo: activo ? 'marca/turquesa-oscuro' : 'fondo/blanco'
    });
    if (!activo) aplicarBorde(f, 'linea/borde', 1);
    f.appendChild(T('cuerpo/meta', activo ? 'Filtro activo' : 'Filtro', activo ? 'fondo/blanco' : 'texto/cuerpo'));
    var c = envolver(f, 'activo=' + (activo ? 'si' : 'no'));
    c.x = origenX + 400; c.y = origenY + i * 50;
    figma.currentPage.appendChild(c);
    chips.push(c);
  });
  try {
    var cc = figma.combineAsVariants(chips, figma.currentPage);
    cc.name = 'Chip';
    cc.x = origenX + 400; cc.y = origenY;
    componentes['Chip'] = cc;
  } catch (e) {
    componentes['Chip'] = chips[0];
  }

  // Campo de formulario
  var campos = [];
  ['normal', 'error'].forEach(function (v, i) {
    var f = pila('campo', 'v', { espacio: 5, ancho: 300 });
    f.appendChild(estirar(T('cuerpo/fuerte', 'Etiqueta del campo', 'texto/negro')));
    var caja = pila('caja', 'h', {
      arriba: 10, abajo: 10, izq: 12, der: 12, radio: 5,
      fondo: 'fondo/blanco', alinear: 'CENTER'
    });
    aplicarBorde(caja, v === 'error' ? 'estado/terracota' : 'linea/borde', 1.5);
    caja.appendChild(T('cuerpo/normal', 'Valor introducido', 'texto/cuerpo'));
    caja.counterAxisSizingMode = 'FIXED';
    caja.resize(300, 44);
    estirar(caja);
    f.appendChild(caja);
    if (v === 'error') {
      f.appendChild(estirar(T('cuerpo/meta', '▲  Explica qué corregir, sin borrar lo escrito.', 'estado/terracota')));
    }
    var c = envolver(f, 'estado=' + v);
    c.x = origenX + 600; c.y = origenY + i * 130;
    figma.currentPage.appendChild(c);
    campos.push(c);
  });
  try {
    var ccampo = figma.combineAsVariants(campos, figma.currentPage);
    ccampo.name = 'Campo';
    ccampo.x = origenX + 600; ccampo.y = origenY;
    componentes['Campo'] = ccampo;
  } catch (e) {
    componentes['Campo'] = campos[0];
  }

  // marcar todo lo generado para poder limpiarlo en la re-ejecución
  Object.keys(componentes).forEach(function (k) {
    componentes[k].setPluginData('generador', MARCA_RAIZ);
  });
}

// ═══════════════════════════════════════════════════════════ piezas de vista

function anchoUtil(ancho) { return ancho - REJILLAS[ancho].offset * 2; }
function esMovil(a) { return a < 768; }
function esEscritorio(a) { return a >= 1200; }
function h1(a) { return esMovil(a) ? 'titulo/h1-movil' : 'titulo/h1-escritorio'; }
function h2(a) { return esMovil(a) ? 'titulo/h2-movil' : 'titulo/h2-escritorio'; }

// Logotipo del Tecnológico de Antioquia, arriba a la izquierda. Va sobre una placa
// blanca: la marca es verde oscuro y la cabecera es azul profundo, así que sin la
// placa el logotipo quedaría con un contraste muy por debajo del 4,5 : 1 que exige
// el tercer criterio de HU-06 para todo lo que se tenga que leer.
function placaLogo(ancho) {
  var alto = esMovil(ancho) ? 20 : (esEscritorio(ancho) ? 30 : 26);
  var anchoImagen = Math.round(alto * PROPORCION_LOGO);
  var placa = pila('logo Tecnológico de Antioquia', 'h', {
    espacio: 0, arriba: 5, abajo: 5, izq: 8, der: 8, radio: 5,
    alinear: 'CENTER', justificar: 'CENTER', fondo: 'fondo/blanco'
  });

  if (imagenLogo) {
    var r = figma.createRectangle();
    // el nombre del nodo es el texto alternativo previsto (documento 05 §5)
    r.name = 'Tecnológico de Antioquia · Institución Universitaria';
    r.resize(anchoImagen, alto);
    r.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash: imagenLogo }];
    placa.appendChild(r);
  } else {
    // Marcador visible a propósito. Un hueco vacío se olvida; un recuadro que dice
    // lo que falta se corrige. El informe lo anota además como incidencia.
    var m = pila('logo institucional pendiente', 'h', {
      espacio: 0, alinear: 'CENTER', justificar: 'CENTER'
    });
    m.fills = [];
    aplicarBorde(m, 'estado/terracota', 1);
    m.dashPattern = [3, 3];
    var t = T('cuerpo/meta', 'logo pendiente', 'estado/terracota');
    t.resize(anchoImagen - 8, t.height);
    m.appendChild(t);
    m.counterAxisSizingMode = 'FIXED';
    m.primaryAxisSizingMode = 'FIXED';
    m.resize(anchoImagen, alto);
    placa.appendChild(m);
  }

  placa.counterAxisSizingMode = 'FIXED';
  placa.primaryAxisSizingMode = 'FIXED';
  placa.resize(anchoImagen + 16, alto + 10);
  return placa;
}

function cabecera(ancho, seleccion, destinos) {
  var f = pila('Cabecera', 'h', {
    espacio: esMovil(ancho) ? 10 : 16, arriba: 12, abajo: 12,
    izq: esMovil(ancho) ? 14 : 20, der: esMovil(ancho) ? 14 : 20,
    alinear: 'CENTER', fondo: 'marca/azul-profundo', ancho: ancho
  });
  f.appendChild(placaLogo(ancho));
  var logo = pila('logo', 'v', { espacio: 1 });
  logo.appendChild(T('titulo/h3', 'Hub Cultural', 'fondo/blanco'));
  logo.appendChild(T('cuerpo/pista', 'Santa Marta', 'fondo/blanco'));
  if (esMovil(ancho)) {
    f.appendChild(logo);
    crecer(logo);
    var hamb = pila('menu compacto', 'v', {
      radio: 5, alinear: 'CENTER', justificar: 'CENTER', fondo: 'marca/turquesa'
    });
    hamb.appendChild(T('cuerpo/fuerte', '≡', 'fondo/blanco'));
    // el tamaño se fija después de añadir el contenido: así no depende de que
    // el auto layout respete un resize previo
    hamb.counterAxisSizingMode = 'FIXED';
    hamb.primaryAxisSizingMode = 'FIXED';
    hamb.resize(44, 44);
    f.appendChild(hamb);
    enlaces.push({ desde: hamb, hacia: 'MENU', ancho: ancho, accion: 'overlay' });
  } else {
    f.appendChild(logo);
    crecer(logo);
    var nav = pila('nav', 'h', { espacio: 4 });
    (destinos || []).forEach(function (d) {
      var item = pila('nav ' + d.texto, 'h', {
        arriba: 8, abajo: 8, izq: 12, der: 12, radio: 5,
        alinear: 'CENTER'
      });
      item.fills = d.texto === seleccion
        ? [{ type: 'SOLID', color: rgb(PALETA['marca/turquesa']), opacity: 0.85 }]
        : [];
      item.appendChild(T('cuerpo/normal', d.texto, 'fondo/blanco'));
      nav.appendChild(item);
      if (d.hacia) enlaces.push({ desde: item, hacia: d.hacia, ancho: ancho });
    });
    f.appendChild(nav);
  }
  return f;
}

function pie(ancho) {
  var f = pila('Pie', 'h', {
    espacio: 20, arriba: 18, abajo: 18, izq: 20, der: 20,
    alinear: 'CENTER', fondo: 'marca/azul-profundo', ancho: ancho, envolver: true
  });
  f.appendChild(T('cuerpo/meta', 'Trabajo de grado · Tecnológico de Antioquia', 'fondo/blanco'));
  var volver = pila('volver al inicio', 'h', { alinear: 'CENTER' });
  volver.appendChild(T('cuerpo/meta', 'Volver al inicio', 'fondo/blanco'));
  f.appendChild(volver);
  enlaces.push({ desde: volver, hacia: 'V-1', ancho: ancho });
  return f;
}

function boton(texto, variante, ancho) {
  var esSec = variante === 'secundario';
  var esRiesgo = variante === 'riesgo';
  var f = pila('boton ' + texto, 'h', {
    espacio: 8, arriba: 11, abajo: 11, izq: 20, der: 20, radio: 5,
    alinear: 'CENTER', justificar: 'CENTER',
    fondo: esSec ? null : (esRiesgo ? 'estado/terracota' : 'marca/turquesa-oscuro')
  });
  if (esSec) { f.fills = []; aplicarBorde(f, 'marca/turquesa-oscuro', 1.5); }
  f.appendChild(T('cuerpo/fuerte', texto, esSec ? 'marca/turquesa-oscuro' : 'fondo/blanco'));
  f.counterAxisSizingMode = 'FIXED';
  f.resize(Math.max(f.width, 44), 44);   // HU-10: 44 × 44 mínimo
  return f;
}

function chip(texto, activo) {
  var f = pila('chip ' + texto, 'h', {
    espacio: 6, arriba: 6, abajo: 6, izq: 16, der: 16, radio: 99,
    alinear: 'CENTER', justificar: 'CENTER',
    fondo: activo ? 'marca/turquesa-oscuro' : 'fondo/blanco'
  });
  if (!activo) aplicarBorde(f, 'linea/borde', 1);
  f.appendChild(T('cuerpo/meta', texto, activo ? 'fondo/blanco' : 'texto/cuerpo'));
  f.counterAxisSizingMode = 'FIXED';
  f.resize(Math.max(f.width, 44), 44);
  return f;
}

function insignia(estado) {
  var color = estado === 'Pendiente' ? 'estado/ocre'
    : estado === 'Devuelto' ? 'estado/terracota' : 'marca/turquesa-oscuro';
  var f = pila('insignia ' + estado, 'h', {
    espacio: 5, arriba: 4, abajo: 4, izq: 9, der: 9, radio: 99,
    alinear: 'CENTER', fondo: 'fondo/blanco'
  });
  aplicarBorde(f, color, 1);
  var punto = figma.createEllipse();
  punto.resize(6, 6);
  aplicarRelleno(punto, color);
  f.appendChild(punto);
  f.appendChild(T('cuerpo/meta', estado, color));
  return f;
}

function campo(etiqueta, valor, error, anchoCaja, multilinea) {
  // Todo lleva ancho explícito: etiqueta, caja y texto interior. Depender de
  // «rellenar contenedor» es lo que dejaba los filtros aplastados a unos 20 px.
  var w = anchoCaja || 260;
  var f = pila('campo ' + etiqueta, 'v', { espacio: 5, ancho: w });

  var etq = T('cuerpo/fuerte', etiqueta, 'texto/negro');
  etq.resize(w, etq.height);
  f.appendChild(etq);

  var caja = pila('caja', 'h', {
    arriba: 10, abajo: 10, izq: 12, der: 12, radio: 5,
    fondo: 'fondo/blanco', alinear: 'CENTER'
  });
  aplicarBorde(caja, error ? 'estado/terracota' : 'linea/borde', 1.5);
  var valorTexto = T('cuerpo/normal', valor, 'texto/cuerpo');
  valorTexto.resize(Math.max(8, w - 24), valorTexto.height);   // 24 = relleno lateral
  caja.appendChild(valorTexto);
  caja.primaryAxisSizingMode = 'FIXED';
  if (multilinea) {
    caja.counterAxisSizingMode = 'AUTO';       // crece con el texto, como un área de texto
    caja.resize(w, Math.max(44, caja.height));
  } else {
    caja.counterAxisSizingMode = 'FIXED';
    caja.resize(w, 44);
  }
  f.appendChild(caja);

  if (error) {
    var err = T('cuerpo/meta', '▲  ' + error, 'estado/terracota');
    err.resize(w, err.height);
    f.appendChild(err);
  }
  return f;
}

function tarjetaEvento(ev, anchoCol, conDescripcion) {
  var f = pila('tarjeta ' + ev.t, 'v', {
    espacio: 0, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde', ancho: anchoCol
  });
  f.clipsContent = true;
  var img = imagen('imagen · ' + ev.d.substring(0, 40), anchoCol, Math.round(anchoCol * 0.62), ev.k);
  estirar(img);
  f.appendChild(img);
  var cuerpo = pila('cuerpo', 'v', { espacio: 8, arriba: 14, abajo: 16, izq: 16, der: 16 });
  estirar(cuerpo);
  cuerpo.appendChild(estirar(T('titulo/h3', ev.t, 'texto/negro')));
  var meta = pila('meta', 'h', { espacio: 12, envolver: true });
  estirar(meta);
  meta.appendChild(T('cuerpo/meta', ev.c, 'marca/turquesa-oscuro'));
  meta.appendChild(T('cuerpo/meta', ev.f, 'texto/apagado'));
  meta.appendChild(T('cuerpo/meta', ev.l, 'texto/apagado'));
  cuerpo.appendChild(meta);
  if (conDescripcion) cuerpo.appendChild(estirar(T('cuerpo/pequeno', ev.d, 'texto/cuerpo')));
  f.appendChild(cuerpo);
  return f;
}

function mapa(ancho, alto, marcadores) {
  var f = pila('Mapa · Leaflet sobre OpenStreetMap', 'v', {
    radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
  });
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(ancho, alto);
  f.layoutMode = 'NONE';
  f.clipsContent = true;
  var base = rectangulo('teselas', ancho, alto, 'fondo/arena', 0);
  base.fills = [{ type: 'SOLID', color: { r: 0.86, g: 0.9, b: 0.89 } }];
  f.appendChild(base);
  (marcadores || []).forEach(function (m, i) {
    var pin = figma.createEllipse();
    pin.name = 'marcador ' + (m.n || (i + 1));
    pin.resize(22, 22);
    aplicarRelleno(pin, 'categoria/' + (m.k || 'patrimonio'));
    pin.x = Math.round(ancho * m.x) - 11;
    pin.y = Math.round(alto * m.y) - 11;
    f.appendChild(pin);
  });
  var credito = T('etiqueta/dato', 'Leaflet · © OpenStreetMap', 'texto/apagado');
  credito.x = 10; credito.y = alto - 24;
  f.appendChild(credito);
  return f;
}

function seccion(ancho, titulo) {
  var s = pila('seccion ' + titulo, 'v', { espacio: 12 });
  s.appendChild(estirar(T(h2(ancho), titulo, 'texto/negro')));
  return s;
}

function columnas(ancho) { return esEscritorio(ancho) ? 3 : (esMovil(ancho) ? 1 : 2); }

function anchoColumna(ancho, n, espacio) {
  var util = anchoUtil(ancho);
  return Math.floor((util - espacio * (n - 1)) / n);
}

function rejillaEventos(ancho, lista, conDescripcion) {
  var n = columnas(ancho);
  var espacio = esEscritorio(ancho) ? 20 : (esMovil(ancho) ? 16 : 18);
  var col = anchoColumna(ancho, n, espacio);
  var r = pila('rejilla', 'h', { espacio: espacio, envolver: true, ancho: anchoUtil(ancho) });
  estirar(r);
  lista.forEach(function (ev) { r.appendChild(tarjetaEvento(ev, col, conDescripcion)); });
  return r;
}

// contenedor de una pantalla completa
function pantalla(vista, ancho) {
  var f = pila(vista.id + ' · ' + vista.nombre + ' · ' + ancho, 'v', {
    espacio: 0, fondo: 'fondo/arena'
  });
  f.counterAxisSizingMode = 'FIXED';
  f.resize(ancho, f.height);
  try {
    var estilo = estilosRejilla[ancho];
    if (estilo) f.gridStyleId = estilo.id;
    else f.layoutGrids = [{
      pattern: 'COLUMNS', alignment: 'STRETCH',
      count: REJILLAS[ancho].count, gutterSize: REJILLAS[ancho].gutter,
      offset: REJILLAS[ancho].offset, visible: false, color: { r: 1, g: 0, b: 0, a: 0.08 }
    }];
  } catch (e) { /* la rejilla es cosmética, no bloquea */ }
  f.setPluginData('generador', MARCA_RAIZ);
  f.setPluginData('vista', vista.id);
  f.setPluginData('ancho', String(ancho));
  f.setPluginData('marcoRaiz', 'si');
  return f;
}

function cuerpo(ancho) {
  var relleno = esEscritorio(ancho) ? 32 : (esMovil(ancho) ? 20 : 24);
  var c = pila('contenido', 'v', {
    espacio: 24, arriba: relleno, abajo: relleno,
    izq: REJILLAS[ancho].offset, der: REJILLAS[ancho].offset
  });
  estirar(c);
  return c;
}

var NAV = [
  { texto: 'Eventos', hacia: 'V-2' },
  { texto: 'Actores culturales', hacia: 'V-4' },
  { texto: 'Hubs', hacia: 'V-5' },
  { texto: 'Mapa', hacia: 'V-6' }
];

// ═══════════════════════════════════════════════════════════ las nueve vistas

function V1(ancho) {
  var f = pantalla(VISTAS[0], ancho);
  f.appendChild(cabecera(ancho, 'Eventos', NAV));
  var c = cuerpo(ancho);

  var heroe = pila('heroe', 'v', {
    espacio: 14, relleno: esMovil(ancho) ? 24 : 40, radio: 8,
    fondo: 'fondo/blanco', borde: 'linea/borde'
  });
  fijarAncho(heroe, anchoUtil(ancho));
  estirar(heroe);
  heroe.appendChild(estirar(T('etiqueta/eyebrow', 'Plataforma pública de descubrimiento', 'marca/turquesa-oscuro')));
  heroe.appendChild(estirar(T(h1(ancho), 'La cultura de Santa Marta, toda en un mismo lugar', 'texto/negro')));
  heroe.appendChild(estirar(T('cuerpo/normal',
    'Encuentra talleres, rutas, música y saberes que sostienen las comunidades del Magdalena, publicados por quienes los llevan a cabo. Sin intermediarios y sin registro para consultar.',
    'texto/cuerpo')));
  var rellenoHeroe = esMovil(ancho) ? 24 : 40;
  var acciones = pila('acciones', 'h', {
    espacio: 10, envolver: true, ancho: anchoUtil(ancho) - rellenoHeroe * 2
  });
  estirar(acciones);
  var bCatalogo = boton('Ver la oferta cultural', 'principal', ancho);
  acciones.appendChild(bCatalogo);
  enlaces.push({ desde: bCatalogo, hacia: 'V-2', ancho: ancho });
  var bRegistro = boton('Soy actor cultural', 'secundario', ancho);
  acciones.appendChild(bRegistro);
  enlaces.push({ desde: bRegistro, hacia: 'V-8', ancho: ancho });
  heroe.appendChild(acciones);
  c.appendChild(heroe);

  var sAccesos = seccion(ancho, 'Cuatro formas de empezar');
  estirar(sAccesos);
  var nCols = esMovil(ancho) ? 2 : 4;
  var espacio = esMovil(ancho) ? 12 : 16;
  var colAcceso = anchoColumna(ancho, nCols, espacio);
  var accesos = pila('accesos', 'h', {
    espacio: espacio, envolver: true, ancho: anchoUtil(ancho)
  });
  estirar(accesos);
  [['Eventos', 'Qué pasa y cuándo', 'V-2'],
   ['Actores culturales', 'Quién está detrás', 'V-4'],
   ['Hubs', 'Espacios de innovación', 'V-5'],
   ['Mapa', 'Qué hay cerca de ti', 'V-6']].forEach(function (a) {
    var caja = pila('acceso ' + a[0], 'v', {
      espacio: 6, relleno: 16, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde', ancho: colAcceso
    });
    caja.appendChild(estirar(T('titulo/h3', a[0], 'texto/negro')));
    caja.appendChild(estirar(T('cuerpo/pequeno', a[1], 'texto/apagado')));
    accesos.appendChild(caja);
    enlaces.push({ desde: caja, hacia: a[2], ancho: ancho });
  });
  sAccesos.appendChild(accesos);
  c.appendChild(sAccesos);

  var sSemana = seccion(ancho, 'Esta semana');
  estirar(sSemana);
  sSemana.appendChild(rejillaEventos(ancho, EVENTOS.slice(0, 3), false));
  c.appendChild(sSemana);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V2(ancho) {
  var f = pantalla(VISTAS[1], ancho);
  f.appendChild(cabecera(ancho, 'Eventos', NAV));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', 'v', { espacio: 4 });
  estirar(enc);
  enc.appendChild(estirar(T('etiqueta/eyebrow', 'Catálogo', 'marca/turquesa-oscuro')));
  enc.appendChild(estirar(T(h1(ancho), 'Oferta cultural', 'texto/negro')));
  c.appendChild(enc);

  // Ancho explícito en el contenedor y en cada campo. No se depende de rellenar el
  // contenedor: eso es lo que dejaba los cuatro filtros aplastados a unos 20 px, con
  // el texto partido letra a letra.
  var filtros = pila('filtros', esMovil(ancho) ? 'v' : 'h', {
    espacio: esMovil(ancho) ? 12 : 14, relleno: 16, radio: 8,
    fondo: 'fondo/blanco', borde: 'linea/borde',
    alinear: esMovil(ancho) ? 'MIN' : 'MAX', ancho: anchoUtil(ancho)
  });
  estirar(filtros);
  var anchoCampo = esMovil(ancho) ? anchoUtil(ancho) - 32 : Math.floor((anchoUtil(ancho) - 32 - 42) / 4);
  [['Buscar', 'cumbia, tejido, cacao…'], ['Categoría', 'Saberes ancestrales'],
   ['Desde', '20/08/2026'], ['Hasta', '31/08/2026']].forEach(function (d) {
    filtros.appendChild(campo(d[0], d[1], null, anchoCampo));
  });
  c.appendChild(filtros);

  var activos = pila('filtros activos', 'h', {
    espacio: 8, envolver: true, alinear: 'CENTER', ancho: anchoUtil(ancho)
  });
  estirar(activos);
  activos.appendChild(chip('Saberes ancestrales  ×', true));
  activos.appendChild(chip('20–31 ago  ×', true));
  activos.appendChild(chip('Limpiar filtros', false));
  activos.appendChild(T('etiqueta/dato', '14 resultados', 'texto/apagado'));
  c.appendChild(activos);

  c.appendChild(rejillaEventos(ancho, EVENTOS.slice(1, 6), true));

  var pag = pila('paginacion', 'h', { espacio: 6, justificar: 'CENTER' });
  estirar(pag);
  ['‹', '1', '2', '3', '›'].forEach(function (p, i) {
    var b = pila('pagina ' + p, 'v', {
      radio: 5, alinear: 'CENTER', justificar: 'CENTER',
      fondo: i === 1 ? 'marca/azul-profundo' : 'fondo/blanco'
    });
    if (i !== 1) aplicarBorde(b, 'linea/borde', 1);
    b.appendChild(T('cuerpo/normal', p, i === 1 ? 'fondo/blanco' : 'texto/cuerpo'));
    b.primaryAxisSizingMode = 'FIXED';
    b.counterAxisSizingMode = 'FIXED';
    b.resize(44, 44);   // HU-10, después de añadir el contenido
    pag.appendChild(b);
  });
  c.appendChild(pag);

  var vacio = pila('estado vacio', 'v', {
    espacio: 10, relleno: 32, radio: 8, fondo: 'fondo/blanco',
    alinear: 'CENTER', ancho: anchoUtil(ancho)
  });
  aplicarBorde(vacio, 'linea/borde', 1.5);
  vacio.dashPattern = [6, 4];
  estirar(vacio);
  var anchoVacio = anchoUtil(ancho) - 64;   // 64 = relleno lateral
  var tituloVacio = T('titulo/h3', 'Así se ve cuando ningún resultado coincide', 'texto/negro');
  tituloVacio.resize(anchoVacio, tituloVacio.height);
  tituloVacio.textAlignHorizontal = 'CENTER';
  vacio.appendChild(tituloVacio);
  var textoVacio = T('cuerpo/pequeno',
    'No encontramos experiencias de Saberes ancestrales entre el 20 y el 31 de agosto. Prueba ampliando el rango de fechas o quitando la categoría.',
    'texto/cuerpo');
  textoVacio.resize(anchoVacio, textoVacio.height);
  textoVacio.textAlignHorizontal = 'CENTER';
  vacio.appendChild(textoVacio);
  c.appendChild(vacio);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V3(ancho) {
  var ev = EVENTOS[1];
  var f = pantalla(VISTAS[2], ancho);
  f.appendChild(cabecera(ancho, 'Eventos', NAV));
  var c = cuerpo(ancho);

  var volver = pila('volver al catalogo', 'h', { alinear: 'CENTER' });
  volver.appendChild(T('cuerpo/fuerte', '‹  Volver al catálogo', 'marca/turquesa-oscuro'));
  c.appendChild(volver);
  enlaces.push({ desde: volver, hacia: 'V-2', ancho: ancho });

  var dosCol = esEscritorio(ancho);
  var util = anchoUtil(ancho);
  var anchoIzq = dosCol ? Math.floor((util - 28) * 0.608) : util;
  var anchoDer = dosCol ? util - 28 - anchoIzq : util;

  var contenedor = pila('detalle', dosCol ? 'h' : 'v', { espacio: dosCol ? 28 : 18, alinear: 'MIN' });
  estirar(contenedor);

  var izq = pila('principal', 'v', { espacio: 18, ancho: anchoIzq });
  var img = imagen('imagen · Tejedora de la Sierra trabajando una mochila', anchoIzq, Math.round(anchoIzq * 0.5625), ev.k);
  img.cornerRadius = 8;
  izq.appendChild(img);
  var t = pila('titulo', 'v', { espacio: 4 });
  estirar(t);
  t.appendChild(estirar(T('etiqueta/eyebrow', ev.c, 'marca/turquesa-oscuro')));
  t.appendChild(estirar(T(h1(ancho), ev.t, 'texto/negro')));
  izq.appendChild(t);
  var meta = pila('meta', 'h', { espacio: 20, envolver: true });
  estirar(meta);
  meta.appendChild(T('cuerpo/normal', '23 de agosto de 2026, 9:00 a 12:00', 'texto/cuerpo'));
  meta.appendChild(T('cuerpo/normal', 'Casa de la Cultura de Bonda', 'texto/cuerpo'));
  izq.appendChild(meta);
  izq.appendChild(estirar(T('cuerpo/normal',
    'Tres horas de trabajo con tejedoras de la Sierra Nevada para aprender el punto base de la mochila y entender qué significa cada figura. No se necesita experiencia previa: los materiales están incluidos y cada participante se lleva lo que teja.',
    'texto/cuerpo')));
  var sMapa = seccion(ancho, 'Dónde es');
  estirar(sMapa);
  var m = mapa(anchoIzq, 200, [{ x: 0.52, y: 0.55, k: 'saberes', n: 'taller' }]);
  sMapa.appendChild(m);
  enlaces.push({ desde: m, hacia: 'V-6', ancho: ancho });
  izq.appendChild(sMapa);
  contenedor.appendChild(izq);

  var der = pila('panel del actor', 'v', {
    espacio: 12, relleno: 18, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde', ancho: anchoDer
  });
  der.appendChild(estirar(T(h2(ancho), 'Quién lo ofrece', 'texto/negro')));
  var actor = pila('actor', 'h', { espacio: 12, alinear: 'CENTER' });
  var retrato = figma.createEllipse();
  retrato.resize(56, 56);
  retrato.name = 'imagen · retrato del colectivo';
  aplicarRelleno(retrato, 'categoria/saberes');
  actor.appendChild(retrato);
  var datosActor = pila('datos', 'v', { espacio: 2 });
  datosActor.appendChild(T('titulo/h3', 'Colectivo Kankuama Tejer', 'texto/negro'));
  datosActor.appendChild(T('cuerpo/meta', 'Tejido tradicional · Bonda', 'texto/apagado'));
  actor.appendChild(datosActor);
  der.appendChild(actor);
  enlaces.push({ desde: actor, hacia: 'V-4', ancho: ancho });
  der.appendChild(estirar(T('cuerpo/pequeno',
    'Ocho tejedoras que enseñan el oficio y sostienen la cadena de la mochila desde la fibra hasta la venta directa.',
    'texto/cuerpo')));
  var bContacto = boton('Contactar', 'principal', ancho);
  estirar(bContacto);
  der.appendChild(bContacto);
  der.appendChild(estirar(T('etiqueta/eyebrow', 'Canales autorizados', 'marca/turquesa-oscuro')));
  der.appendChild(estirar(boton('WhatsApp · 300 ••• ••42', 'secundario', ancho)));
  der.appendChild(estirar(T('cuerpo/pista',
    'Solo se muestran los canales que el actor cultural habilitó. La plataforma no guarda tus datos.',
    'texto/apagado')));
  var verPerfil = pila('ver perfil completo', 'h', {});
  verPerfil.appendChild(T('cuerpo/fuerte', 'Ver perfil completo  ›', 'marca/turquesa-oscuro'));
  der.appendChild(verPerfil);
  enlaces.push({ desde: verPerfil, hacia: 'V-4', ancho: ancho });
  contenedor.appendChild(der);

  c.appendChild(contenedor);
  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V4(ancho) {
  var f = pantalla(VISTAS[3], ancho);
  f.appendChild(cabecera(ancho, 'Actores culturales', NAV));
  var c = cuerpo(ancho);

  var horizontal = !esMovil(ancho);
  var cab = pila('perfil', horizontal ? 'h' : 'v', { espacio: horizontal ? 24 : 16, alinear: 'MIN' });
  estirar(cab);
  var lado = horizontal ? 168 : anchoUtil(ancho);
  var retrato = rectangulo('imagen · retrato del Colectivo Kankuama Tejer', lado, lado, null, 8);
  retrato.fills = degradado('saberes');
  cab.appendChild(retrato);
  // El ancho se fija de forma explícita: en la disposición vertical de móvil,
  // `crecer` rellena el eje vertical y deja el ancho abrazando el contenido, con lo
  // que el párrafo largo se va a una sola línea y desborda la pantalla.
  var anchoDatos = horizontal ? anchoUtil(ancho) - lado - 24 : anchoUtil(ancho);
  var datos = pila('datos', 'v', { espacio: 10, ancho: anchoDatos });
  datos.appendChild(estirar(T('etiqueta/eyebrow', 'Saberes ancestrales', 'marca/turquesa-oscuro')));
  datos.appendChild(estirar(T(h1(ancho), 'Colectivo Kankuama Tejer', 'texto/negro')));
  datos.appendChild(estirar(T('cuerpo/normal',
    'Manifestación: tejido tradicional en telar de cintura y fique.', 'texto/cuerpo')));
  datos.appendChild(estirar(T('cuerpo/normal',
    'Ocho tejedoras de Bonda y Masinga que enseñan el oficio y sostienen la cadena de la mochila desde la fibra hasta la venta directa. Desde 2019 acompañan a jóvenes del corregimiento en un proceso de transmisión intergeneracional.',
    'texto/cuerpo')));
  var acc = pila('acciones', 'h', { espacio: 10, envolver: true, ancho: anchoDatos });
  estirar(acc);
  acc.appendChild(boton('Contactar', 'principal', ancho));
  acc.appendChild(boton('Editar perfil', 'secundario', ancho));
  datos.appendChild(acc);
  cab.appendChild(datos);
  c.appendChild(cab);

  var s = seccion(ancho, 'Sus publicaciones');
  estirar(s);
  var rej = rejillaEventos(ancho, [EVENTOS[1], EVENTOS[5], EVENTOS[4]], false);
  s.appendChild(rej);
  rej.children.forEach(function (tj) { enlaces.push({ desde: tj, hacia: 'V-3', ancho: ancho }); });
  c.appendChild(s);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V5(ancho) {
  var f = pantalla(VISTAS[4], ancho);
  f.appendChild(cabecera(ancho, 'Hubs', NAV));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', 'v', { espacio: 8 });
  estirar(enc);
  enc.appendChild(estirar(T('etiqueta/eyebrow', 'Directorio', 'marca/turquesa-oscuro')));
  enc.appendChild(estirar(T(h1(ancho), 'Hubs de innovación', 'texto/negro')));
  enc.appendChild(estirar(T('cuerpo/normal',
    'Espacios que articulan proyectos culturales con formación, financiación y tecnología. Escríbeles directamente.',
    'texto/cuerpo')));
  c.appendChild(enc);

  var lista = pila('lista', 'v', { espacio: 12 });
  estirar(lista);
  HUBS.forEach(function (h) {
    var caja = pila('hub ' + h.n, 'v', {
      espacio: 10, arriba: 16, abajo: 16, izq: 18, der: 18,
      radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
    });
    estirar(caja);
    var fila = pila('titulo', 'h', { espacio: 16, alinear: 'MIN', envolver: true });
    estirar(fila);
    var tit = T('titulo/h3', h.n, 'texto/negro');
    fila.appendChild(tit);
    crecer(tit);
    fila.appendChild(insignia('Aprobado'));
    caja.appendChild(fila);
    caja.appendChild(estirar(T('cuerpo/pequeno', h.d, 'texto/cuerpo')));
    var lineas = pila('lineas de trabajo', 'h', { espacio: 6, envolver: true });
    estirar(lineas);
    h.l.forEach(function (l) {
      var e = pila('etiqueta ' + l, 'h', {
        arriba: 6, abajo: 6, izq: 12, der: 12, radio: 99, fondo: 'fondo/blanco', alinear: 'CENTER'
      });
      aplicarBorde(e, 'linea/borde', 1);
      e.appendChild(T('cuerpo/meta', l, 'texto/cuerpo'));
      lineas.appendChild(e);
    });
    caja.appendChild(lineas);
    var meta = pila('meta', 'h', { espacio: 20, envolver: true });
    estirar(meta);
    meta.appendChild(T('cuerpo/meta', h.dir, 'texto/apagado'));
    meta.appendChild(T('cuerpo/meta', h.c, 'texto/apagado'));
    caja.appendChild(meta);
    var bMapa = boton('Ver en el mapa', 'secundario', ancho);
    caja.appendChild(bMapa);
    enlaces.push({ desde: bMapa, hacia: 'V-6', ancho: ancho });
    lista.appendChild(caja);
  });
  c.appendChild(lista);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V6(ancho) {
  var f = pantalla(VISTAS[5], ancho);
  f.appendChild(cabecera(ancho, 'Mapa', NAV));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', 'v', { espacio: 4 });
  estirar(enc);
  enc.appendChild(estirar(T('etiqueta/eyebrow', 'Mapa interactivo', 'marca/turquesa-oscuro')));
  enc.appendChild(estirar(T(h1(ancho), 'Qué hay cerca de ti', 'texto/negro')));
  c.appendChild(enc);

  var filtros = pila('filtros de categoria', 'h', {
    espacio: 8, envolver: true, alinear: 'CENTER', ancho: anchoUtil(ancho)
  });
  estirar(filtros);
  ['Todas', 'Música y danza', 'Saberes ancestrales', 'Gastronomía', 'Patrimonio'].forEach(function (t, i) {
    filtros.appendChild(chip(t, i === 0));
  });
  c.appendChild(filtros);

  var alto = esMovil(ancho) ? 340 : 440;
  var m = mapa(anchoUtil(ancho), alto, [
    { x: 0.38, y: 0.36, k: 'musica' }, { x: 0.56, y: 0.52, k: 'saberes' },
    { x: 0.71, y: 0.30, k: 'gastronomia' }, { x: 0.47, y: 0.70, k: 'patrimonio' },
    { x: 0.33, y: 0.62, k: 'artesania' }
  ]);
  c.appendChild(m);

  var ficha = pila('ficha del marcador', 'v', {
    espacio: 6, arriba: 12, abajo: 12, izq: 14, der: 14,
    radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
  });
  ficha.appendChild(T('etiqueta/eyebrow', 'Saberes ancestrales', 'marca/turquesa-oscuro'));
  ficha.appendChild(T('titulo/h3', EVENTOS[1].t, 'texto/negro'));
  ficha.appendChild(T('cuerpo/meta', '23 ago · Bonda', 'texto/apagado'));
  var bDetalle = boton('Ver detalle', 'principal', ancho);
  ficha.appendChild(bDetalle);
  enlaces.push({ desde: bDetalle, hacia: 'V-3', ancho: ancho });
  c.appendChild(ficha);

  c.appendChild(estirar(T('cuerpo/pista',
    'El mapa no captura el desplazamiento vertical de la página: se hace zoom con dos dedos o con la rueda sobre el mapa.',
    'texto/apagado')));

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V7(ancho) {
  var f = pantalla(VISTAS[6], ancho);
  f.appendChild(cabecera(ancho, 'Moderación', [
    { texto: 'Moderación', hacia: null }, { texto: 'Categorías', hacia: null }, { texto: 'Indicadores', hacia: null }
  ]));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', 'v', { espacio: 4 });
  estirar(enc);
  enc.appendChild(estirar(T('etiqueta/eyebrow', 'Administrador', 'marca/turquesa-oscuro')));
  enc.appendChild(estirar(T(h1(ancho), 'Cola de moderación', 'texto/negro')));
  c.appendChild(enc);

  var nCif = esMovil(ancho) ? 2 : 4;
  var colCif = anchoColumna(ancho, nCif, 12);
  var cifras = pila('cifras', 'h', { espacio: 12, envolver: true, ancho: anchoUtil(ancho) });
  estirar(cifras);
  [['7', 'Pendientes'], ['52', 'Aprobadas'], ['3', 'Devueltas'], ['6', 'Categorías']].forEach(function (d) {
    var caja = pila('cifra ' + d[1], 'v', {
      espacio: 2, arriba: 14, abajo: 14, izq: 16, der: 16,
      radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde', ancho: colCif
    });
    caja.appendChild(T('titulo/h1-escritorio', d[0], 'marca/azul-profundo'));
    caja.appendChild(T('cuerpo/pista', d[1], 'texto/apagado'));
    cifras.appendChild(caja);
  });
  c.appendChild(cifras);

  // en móvil la tabla se convierte en tarjetas apiladas — HU-33
  var filas = [
    ['Alfarería tairona: barro y memoria', 'Colectivo Kankuama Tejer', 'Saberes ancestrales', '18 ago', 'Pendiente'],
    ['Noche de vallenato en La Puntica', 'Fundación Son de Río', 'Música y danza', '18 ago', 'Pendiente'],
    ['Mural colectivo del Callejón', 'Brigada Muralista SM', 'Artes visuales', '17 ago', 'Devuelto']
  ];
  var etiquetas = ['Publicación', 'Actor', 'Categoría', 'Creada', 'Estado'];

  if (esMovil(ancho)) {
    var listaMovil = pila('tabla como tarjetas apiladas', 'v', { espacio: 12 });
    estirar(listaMovil);
    filas.forEach(function (fila) {
      var caja = pila('fila ' + fila[0], 'v', {
        espacio: 6, arriba: 12, abajo: 12, izq: 14, der: 14,
        radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
      });
      estirar(caja);
      fila.forEach(function (valor, i) {
        var linea = pila('dato', 'h', { espacio: 16, alinear: 'CENTER' });
        estirar(linea);
        var et = T('etiqueta/eyebrow', etiquetas[i], 'texto/apagado');
        linea.appendChild(et);
        crecer(et);
        if (i === 4) linea.appendChild(insignia(valor));
        else linea.appendChild(T('cuerpo/meta', valor, 'texto/cuerpo'));
        caja.appendChild(linea);
      });
      var acciones = pila('acciones', 'h', { espacio: 8, arriba: 6 });
      acciones.appendChild(boton('Aprobar', 'principal', ancho));
      acciones.appendChild(boton('Devolver', 'secundario', ancho));
      caja.appendChild(acciones);
      listaMovil.appendChild(caja);
    });
    c.appendChild(listaMovil);
  } else {
    var tabla = pila('tabla de moderación', 'v', {
      espacio: 0, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
    });
    estirar(tabla);
    tabla.clipsContent = true;
    var anchoTabla = anchoUtil(ancho);
    var pesos = [0.30, 0.20, 0.17, 0.10, 0.13, 0.10];
    var cabFila = pila('encabezado de tabla', 'h', {
      espacio: 0, arriba: 10, abajo: 10, izq: 14, der: 14, alinear: 'CENTER'
    });
    estirar(cabFila);
    etiquetas.concat(['']).forEach(function (e, i) {
      var t = T('etiqueta/eyebrow', e, 'texto/apagado');
      t.resize(Math.floor(anchoTabla * pesos[i]) - 6, t.height);
      t.textAutoResize = 'HEIGHT';
      cabFila.appendChild(t);
    });
    tabla.appendChild(cabFila);
    filas.forEach(function (fila) {
      var fl = pila('fila', 'h', {
        espacio: 0, arriba: 12, abajo: 12, izq: 14, der: 14, alinear: 'CENTER'
      });
      estirar(fl);
      fila.forEach(function (valor, i) {
        var ancho_i = Math.floor(anchoTabla * pesos[i]) - 6;
        if (i === 4) {
          var env = pila('estado', 'h', { alinear: 'CENTER' });
          env.appendChild(insignia(valor));
          env.counterAxisSizingMode = 'FIXED';
          env.primaryAxisSizingMode = 'FIXED';
          env.resize(ancho_i, 30);
          fl.appendChild(env);
        } else {
          var t = T(i === 0 ? 'cuerpo/fuerte' : 'cuerpo/meta', valor, i === 0 ? 'texto/negro' : 'texto/cuerpo');
          t.resize(ancho_i, t.height);
          fl.appendChild(t);
        }
      });
      var acc = pila('acciones', 'h', { espacio: 8 });
      acc.appendChild(boton('Aprobar', 'principal', ancho));
      fl.appendChild(acc);
      tabla.appendChild(fl);
    });
    c.appendChild(tabla);
  }

  var devolver = pila('devolver publicación', 'v', {
    espacio: 12, relleno: 18, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde'
  });
  estirar(devolver);
  devolver.appendChild(estirar(T(h2(ancho), 'Devolver publicación', 'texto/negro')));
  var obs = campo('Observación para el actor cultural',
    'Explica qué debe corregirse antes de volver a enviar.',
    'La observación es obligatoria para devolver una publicación.', anchoUtil(ancho) - 36, true);
  estirar(obs);
  devolver.appendChild(obs);
  var accD = pila('acciones', 'h', { espacio: 10 });
  accD.appendChild(boton('Devolver', 'riesgo', ancho));
  accD.appendChild(boton('Cancelar', 'secundario', ancho));
  devolver.appendChild(accD);
  devolver.appendChild(estirar(T('cuerpo/pista',
    'Queda registro del administrador, la decisión, la observación y la fecha.', 'texto/apagado')));
  c.appendChild(devolver);

  var sInd = seccion(ancho, 'Publicaciones por categoría');
  estirar(sInd);
  var barras = pila('barras', 'v', { espacio: 10 });
  estirar(barras);
  [['Música y danza', 0.88, 15, 'musica'], ['Saberes ancestrales', 0.70, 12, 'saberes'],
   ['Gastronomía', 0.53, 9, 'gastronomia'], ['Patrimonio', 0.41, 7, 'patrimonio'],
   ['Artes visuales', 0.35, 6, 'artes'], ['Artesanía', 0.29, 5, 'artesania']].forEach(function (d) {
    var fila = pila('barra ' + d[0], 'h', { espacio: 12, alinear: 'CENTER' });
    estirar(fila);
    var et = T('cuerpo/meta', d[0], 'texto/cuerpo');
    et.resize(Math.min(150, Math.floor(anchoUtil(ancho) * 0.34)), et.height);
    fila.appendChild(et);
    var pista = pila('pista', 'h', { espacio: 0, radio: 99 });
    pista.fills = [{ type: 'SOLID', color: { r: 0.906, g: 0.882, b: 0.839 } }];
    pista.primaryAxisSizingMode = 'FIXED';
    pista.counterAxisSizingMode = 'FIXED';
    var anchoPista = Math.max(60, anchoUtil(ancho) - Math.min(150, Math.floor(anchoUtil(ancho) * 0.34)) - 60);
    pista.resize(anchoPista, 9);
    pista.clipsContent = true;
    var valor = rectangulo('valor', Math.round(anchoPista * d[1]), 9, 'categoria/' + d[3], 99);
    pista.appendChild(valor);
    fila.appendChild(pista);
    fila.appendChild(T('cuerpo/meta', String(d[2]), 'texto/apagado'));
    barras.appendChild(fila);
  });
  sInd.appendChild(barras);
  c.appendChild(sInd);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V8(ancho) {
  var f = pantalla(VISTAS[7], ancho);
  f.appendChild(cabecera(ancho, 'Eventos', NAV));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', 'v', { espacio: 8 });
  estirar(enc);
  enc.appendChild(estirar(T('etiqueta/eyebrow', 'Crear cuenta', 'marca/turquesa-oscuro')));
  enc.appendChild(estirar(T(h1(ancho), 'Publica tu trabajo cultural', 'texto/negro')));
  enc.appendChild(estirar(T('cuerpo/normal',
    'Solo los actores culturales y los hubs necesitan cuenta. Para consultar el catálogo no hace falta registrarse.',
    'texto/cuerpo')));
  c.appendChild(enc);

  var anchoForm = Math.min(520, anchoUtil(ancho));
  var form = pila('formulario de registro', 'v', {
    espacio: 16, relleno: esMovil(ancho) ? 20 : 28, radio: 8,
    fondo: 'fondo/blanco', borde: 'linea/borde', ancho: anchoForm
  });
  var anchoInterno = anchoForm - (esMovil(ancho) ? 40 : 56);
  form.appendChild(estirar(campo('Nombre del actor o colectivo', 'Colectivo Kankuama Tejer', null, anchoInterno)));
  form.appendChild(estirar(campo('Correo electrónico', 'tejer@kankuama.co',
    'Ya existe una cuenta con este correo. Puedes ingresar o recuperar tu contraseña.', anchoInterno)));
  form.appendChild(estirar(campo('Contraseña', '••••••••', null, anchoInterno)));
  form.appendChild(estirar(campo('Tipo de cuenta', 'Actor cultural', null, anchoInterno)));

  var consent = pila('consentimiento', 'h', {
    espacio: 10, arriba: 12, abajo: 12, izq: 14, der: 14,
    radio: 6, fondo: 'fondo/arena', borde: 'linea/borde', alinear: 'MIN'
  });
  estirar(consent);
  var caja = rectangulo('casilla sin marcar', 20, 20, 'fondo/blanco', 4);
  aplicarBorde(caja, 'linea/borde', 1.5);
  consent.appendChild(caja);
  var txt = T('cuerpo/pequeno',
    'Autorizo el tratamiento de mis datos personales conforme a la política de tratamiento, con fines académicos y de validación del prototipo.',
    'texto/cuerpo');
  txt.resize(anchoInterno - 40, txt.height);
  consent.appendChild(txt);
  form.appendChild(consent);

  var bCrear = boton('Crear cuenta', 'principal', ancho);
  estirar(bCrear);
  form.appendChild(bCrear);
  enlaces.push({ desde: bCrear, hacia: 'V-9', ancho: ancho });

  var enlacesForm = pila('enlaces', 'h', { espacio: 16, envolver: true });
  estirar(enlacesForm);
  enlacesForm.appendChild(T('cuerpo/fuerte', 'Ya tengo cuenta', 'marca/turquesa-oscuro'));
  enlacesForm.appendChild(T('cuerpo/fuerte', 'Olvidé mi contraseña', 'marca/turquesa-oscuro'));
  form.appendChild(enlacesForm);
  c.appendChild(form);

  // Acceso de demostración. El prototipo no valida credenciales —eso lo resuelven
  // HU-12 y HU-15—, así que sin estos dos accesos el panel de administración se
  // queda sin ninguna vía de entrada: es la única vista con rol restringido y el
  // mapa de navegación de docs/05 §1 la cuelga precisamente de aquí.
  var demo = pila('acceso de demostración', 'v', {
    espacio: 12, relleno: esMovil(ancho) ? 18 : 22, radio: 8,
    fondo: 'fondo/arena', borde: 'linea/borde', ancho: anchoForm
  });
  var anchoDemo = anchoForm - (esMovil(ancho) ? 36 : 44);
  demo.appendChild(estirar(T('etiqueta/eyebrow', 'Acceso de demostración', 'marca/turquesa-oscuro')));
  var pista = T('cuerpo/pequeno',
    'El prototipo no valida credenciales. Estos dos accesos abren la sesión de cada rol para poder recorrer las vistas privadas.',
    'texto/cuerpo');
  pista.resize(anchoDemo, pista.height);
  demo.appendChild(estirar(pista));

  var bActor = boton('Entrar como actor cultural', 'secundario', ancho);
  estirar(bActor);
  demo.appendChild(bActor);
  enlaces.push({ desde: bActor, hacia: 'V-9', ancho: ancho });

  var bAdmin = boton('Entrar como administrador', 'secundario', ancho);
  estirar(bAdmin);
  demo.appendChild(bAdmin);
  enlaces.push({ desde: bAdmin, hacia: 'V-7', ancho: ancho });

  c.appendChild(demo);

  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

function V9(ancho) {
  var f = pantalla(VISTAS[8], ancho);
  f.appendChild(cabecera(ancho, 'Mis publicaciones', [
    { texto: 'Mis publicaciones', hacia: null },
    { texto: 'Mi perfil', hacia: 'V-4' },
    { texto: 'Catálogo', hacia: 'V-2' }
  ]));
  var c = cuerpo(ancho);

  var enc = pila('encabezado', esMovil(ancho) ? 'v' : 'h', {
    espacio: 16, envolver: !esMovil(ancho),
    alinear: esMovil(ancho) ? 'MIN' : 'MAX', ancho: anchoUtil(ancho)
  });
  estirar(enc);
  var tit = pila('titulo', 'v', { espacio: 4 });
  crecer(tit);
  tit.appendChild(estirar(T('etiqueta/eyebrow', 'Colectivo Kankuama Tejer', 'marca/turquesa-oscuro')));
  tit.appendChild(estirar(T(h1(ancho), 'Mis publicaciones', 'texto/negro')));
  enc.appendChild(tit);
  enc.appendChild(boton('Publicar experiencia', 'principal', ancho));
  c.appendChild(enc);

  var lista = pila('lista de publicaciones', 'v', { espacio: 12 });
  estirar(lista);
  [[EVENTOS[1], 'Aprobado', null], [EVENTOS[4], 'Pendiente', null],
   [EVENTOS[5], 'Devuelto', 'Falta la fotografía principal']].forEach(function (d) {
    var caja = pila('publicacion ' + d[0].t, esMovil(ancho) ? 'v' : 'h', {
      espacio: 16, arriba: 16, abajo: 16, izq: 18, der: 18,
      radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde',
      alinear: esMovil(ancho) ? 'MIN' : 'CENTER'
    });
    estirar(caja);
    var datos = pila('datos', 'v', { espacio: 4 });
    if (esMovil(ancho)) estirar(datos); else crecer(datos);
    datos.appendChild(estirar(T('titulo/h3', d[0].t, 'texto/negro')));
    var meta = pila('meta', 'h', { espacio: 12, envolver: true });
    estirar(meta);
    meta.appendChild(T('cuerpo/meta', d[0].f, 'texto/apagado'));
    meta.appendChild(T('cuerpo/meta', d[0].l, 'texto/apagado'));
    if (d[2]) meta.appendChild(T('cuerpo/meta', d[2], 'estado/terracota'));
    datos.appendChild(meta);
    caja.appendChild(datos);
    caja.appendChild(insignia(d[1]));
    var acc = pila('acciones', 'h', { espacio: 8 });
    acc.appendChild(boton('Editar', 'secundario', ancho));
    acc.appendChild(boton('Eliminar', 'secundario', ancho));
    caja.appendChild(acc);
    lista.appendChild(caja);
  });
  c.appendChild(lista);

  var dosCol = ancho >= 1200;
  var util = anchoUtil(ancho);
  var anchoForm = dosCol ? Math.floor((util - 28) * 0.6) : util;
  var anchoLat = dosCol ? util - 28 - anchoForm : util;

  var abajo = pila('publicar', dosCol ? 'h' : 'v', { espacio: dosCol ? 28 : 16, alinear: 'MIN' });
  estirar(abajo);

  var form = pila('formulario de publicación', 'v', {
    espacio: 16, relleno: esMovil(ancho) ? 20 : 24, radio: 8,
    fondo: 'fondo/blanco', borde: 'linea/borde', ancho: anchoForm
  });
  var interno = anchoForm - (esMovil(ancho) ? 40 : 48);
  form.appendChild(estirar(T(h2(ancho), 'Nueva publicación', 'texto/negro')));
  form.appendChild(estirar(campo('Título', EVENTOS[5].t, null, interno)));
  form.appendChild(estirar(campo('Descripción', EVENTOS[5].d, null, interno, true)));
  form.appendChild(estirar(campo('Categoría', 'Artesanía', null, interno)));
  // el par inicio/fin se apila en móvil: dos campos de fecha no bajan de su ancho intrínseco
  var par = pila('par de fechas', esMovil(ancho) ? 'v' : 'h', { espacio: 12 });
  estirar(par);
  var cIni = campo('Inicio', '06/09/2026', null, esMovil(ancho) ? interno : Math.floor((interno - 12) / 2));
  var cFin = campo('Fin', '05/09/2026', 'La fecha de fin no puede ser anterior a la de inicio.',
    esMovil(ancho) ? interno : Math.floor((interno - 12) / 2));
  if (esMovil(ancho)) { estirar(cIni); estirar(cFin); } else { crecer(cIni); crecer(cFin); }
  par.appendChild(cIni);
  par.appendChild(cFin);
  form.appendChild(par);
  form.appendChild(estirar(campo('Imagen', 'JPG o PNG, máximo 2 MB', null, interno)));
  var bGuardar = boton('Guardar como pendiente', 'secundario', ancho);
  estirar(bGuardar);
  form.appendChild(bGuardar);
  form.appendChild(estirar(T('cuerpo/pista',
    'Deshabilitado mientras haya un error de validación.', 'texto/apagado')));
  abajo.appendChild(form);

  var lat = pila('ubicación', 'v', {
    espacio: 12, relleno: 18, radio: 8, fondo: 'fondo/blanco', borde: 'linea/borde', ancho: anchoLat
  });
  lat.appendChild(estirar(T(h2(ancho), 'Ubicación', 'texto/negro')));
  lat.appendChild(estirar(T('cuerpo/pequeno', 'Toca el mapa para marcar dónde ocurre la experiencia.', 'texto/cuerpo')));
  lat.appendChild(mapa(anchoLat - 36, 200, [{ x: 0.47, y: 0.52, k: 'artesania' }]));
  var coords = pila('coordenadas', 'h', { espacio: 16 });
  coords.appendChild(T('etiqueta/dato', '11.2408 N', 'texto/apagado'));
  coords.appendChild(T('etiqueta/dato', '−74.1990 W', 'texto/apagado'));
  lat.appendChild(coords);
  lat.appendChild(estirar(T('cuerpo/pista',
    'Sin coordenadas la publicación no aparece en el mapa.', 'texto/apagado')));
  abajo.appendChild(lat);

  c.appendChild(abajo);
  f.appendChild(c);
  f.appendChild(pie(ancho));
  return f;
}

var CONSTRUCTORES = [V1, V2, V3, V4, V5, V6, V7, V8, V9];

// ═══════════════════════════════════════════════════════════ menú desplegable

// El botón compacto del encabezado necesita algo que abrir. Se construye una sola
// capa por ancho de móvil y todas las pantallas de ese ancho la comparten.
function menuMovil(ancho) {
  var f = pila('Menú de navegación · ' + ancho, 'v', {
    espacio: 0, fondo: 'marca/azul-profundo'
  });
  f.counterAxisSizingMode = 'FIXED';
  f.resize(ancho, f.height);
  f.setPluginData('generador', MARCA_RAIZ);
  f.setPluginData('marcoRaiz', 'si');
  f.setPluginData('vista', 'MENU');
  f.setPluginData('ancho', String(ancho));

  var cab = pila('cabecera del menú', 'h', {
    espacio: 10, arriba: 12, abajo: 12, izq: 14, der: 14,
    alinear: 'CENTER', ancho: ancho
  });
  cab.appendChild(placaLogo(ancho));
  var logo = pila('logo', 'v', { espacio: 1 });
  logo.appendChild(T('titulo/h3', 'Hub Cultural', 'fondo/blanco'));
  logo.appendChild(T('cuerpo/pista', 'Santa Marta', 'fondo/blanco'));
  cab.appendChild(logo);
  crecer(logo);
  var cerrar = pila('cerrar el menú', 'v', {
    radio: 5, alinear: 'CENTER', justificar: 'CENTER', fondo: 'marca/turquesa'
  });
  cerrar.appendChild(T('cuerpo/fuerte', '×', 'fondo/blanco'));
  cerrar.counterAxisSizingMode = 'FIXED';
  cerrar.primaryAxisSizingMode = 'FIXED';
  cerrar.resize(44, 44);
  cab.appendChild(cerrar);
  f.appendChild(cab);
  enlaces.push({ desde: cerrar, hacia: null, ancho: ancho, accion: 'cerrar' });

  var lista = pila('opciones', 'v', {
    espacio: 0, arriba: 8, abajo: 24, izq: 20, der: 20, ancho: ancho
  });
  [['Eventos', 'V-2'], ['Actores culturales', 'V-4'],
   ['Hubs', 'V-5'], ['Mapa', 'V-6'], ['Ingresar', 'V-8']].forEach(function (o) {
    var item = pila('opción ' + o[0], 'h', {
      arriba: 14, abajo: 14, alinear: 'CENTER', ancho: ancho - 40
    });
    var t = T('cuerpo/normal', o[0], 'fondo/blanco');
    t.resize(ancho - 40, t.height);
    item.appendChild(t);
    item.counterAxisSizingMode = 'FIXED';
    item.resize(ancho - 40, 52);          // HU-10: muy por encima de 44 px
    lista.appendChild(item);
    enlaces.push({ desde: item, hacia: o[1], ancho: ancho, accion: 'navegar' });
  });
  f.appendChild(lista);
  return f;
}

// ═══════════════════════════════════════════════════════ fondo alusivo a la ciudad

// Silueta de la Sierra Nevada cayendo sobre el Caribe: es el perfil que tiene Santa
// Marta desde la bahía y se reconoce sin necesidad de fotografía. Se dibuja con
// primitivas para no depender de una imagen con licencia; si se carga una fotografía
// desde el selector del plugin, se usa esa en su lugar.
function ilustracionSantaMarta(ancho, alto) {
  var f = figma.createFrame();
  f.name = 'fondo · Santa Marta';
  f.fills = [];
  f.clipsContent = true;
  f.resize(Math.max(1, ancho), Math.max(1, alto));

  if (imagenFondo) {
    var foto = figma.createRectangle();
    foto.name = 'fotografía de Santa Marta';
    foto.resize(ancho, alto);
    foto.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: imagenFondo }];
    f.appendChild(foto);
    foto.x = 0; foto.y = 0;
    f.opacity = 0.06;
    return f;
  }

  var horizonte = alto * 0.66;

  function poner(nodo, x, y, w, h, color) {
    nodo.resize(Math.max(1, w), Math.max(1, h));
    aplicarRelleno(nodo, color);
    f.appendChild(nodo);
    nodo.x = x; nodo.y = y;
    return nodo;
  }

  var mar = figma.createRectangle();
  mar.name = 'el Caribe';
  poner(mar, 0, horizonte, ancho, alto - horizonte, 'marca/azul-profundo');

  var sol = figma.createEllipse();
  sol.name = 'sol';
  var d = alto * 0.20;
  poner(sol, ancho * 0.72, horizonte - alto * 0.62, d, d, 'estado/ocre');

  // Tres crestas de la Sierra Nevada, de la más lejana a la más cercana.
  [[-0.06, 0.62, 0.55, 'marca/azul-profundo'],
   [0.30, 0.48, 0.42, 'marca/turquesa-oscuro'],
   [0.66, 0.38, 0.28, 'marca/turquesa']].forEach(function (m, i) {
    var pico = figma.createPolygon();
    pico.name = 'cresta ' + (i + 1);
    try { pico.pointCount = 3; } catch (e) { /* ya es un triángulo por defecto */ }
    poner(pico, ancho * m[0], horizonte - alto * m[2], ancho * m[1], alto * m[2], m[3]);
  });

  // Un velero: es lo que se ve desde el Camellón a cualquier hora.
  var casco = figma.createRectangle();
  casco.name = 'velero';
  poner(casco, ancho * 0.16, horizonte + alto * 0.11, ancho * 0.07, alto * 0.02, 'fondo/blanco');
  var vela = figma.createPolygon();
  vela.name = 'vela';
  try { vela.pointCount = 3; } catch (e) {}
  poner(vela, ancho * 0.18, horizonte + alto * 0.03, ancho * 0.035, alto * 0.08, 'fondo/blanco');

  // Marejada.
  [[0.08, 0.20], [0.44, 0.26], [0.68, 0.17]].forEach(function (o, i) {
    var ola = figma.createRectangle();
    ola.name = 'ola ' + (i + 1);
    poner(ola, ancho * o[0], horizonte + alto * o[1], ancho * 0.16, Math.max(2, alto * 0.008), 'fondo/blanco');
    ola.cornerRadius = 4;
  });

  f.opacity = 0.08;
  return f;
}

// Se cuelga como hijo en posición absoluta, por debajo de todo y justo debajo de la
// cabecera. Al estar fuera del flujo no toca el auto layout: ni desplaza el contenido
// ni cambia la altura de la pantalla.
function aplicarFondo(marco, ancho) {
  if (!marco.children || !marco.children.length) return null;
  // Se lee de la caja resuelta y no de `height`: la altura de un marco con auto
  // layout la calcula Figma, y consultarla antes de que la recalcule devuelve el
  // valor anterior.
  function alturaDe(nodo) {
    var caja = nodo.absoluteBoundingBox;
    return caja ? caja.height : (nodo.height || 0);
  }
  var altoCabecera = alturaDe(marco.children[0]);
  var disponible = alturaDe(marco) - altoCabecera;
  if (disponible < 160) return null;
  var fondo = ilustracionSantaMarta(ancho, Math.min(560, disponible));
  marco.insertChild(0, fondo);
  // layoutPositioning, como layoutAlign, solo tiene efecto una vez dentro del padre
  try { fondo.layoutPositioning = 'ABSOLUTE'; } catch (e) { return fondo; }
  fondo.x = 0;
  fondo.y = altoCabecera;
  return fondo;
}

// ═══════════════════════════════════════════════════════════ fase 5 · prototipo

// A qué pantalla pertenece un nodo, subiendo hasta el marco raíz.
function pantallaDe(nodo) {
  var p = nodo;
  var n = 0;
  while (p && n < 40) {
    if (p.getPluginData && p.getPluginData('marcoRaiz') === 'si') {
      return p.getPluginData('vista') + '@' + p.getPluginData('ancho');
    }
    p = p.parent;
    n++;
  }
  return '(fuera de una pantalla)';
}

function describir(nodo) {
  if (!nodo) return '(nulo)';
  var cadena = [];
  var p = nodo;
  var n = 0;
  while (p && n < 4) { cadena.push(p.name || p.type); p = p.parent; n++; }
  return nodo.type + ' «' + cadena.join(' ← ') + '»';
}

function textoDelError(err) {
  if (!err) return 'error sin contenido';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  try { return JSON.stringify(err); } catch (e) { return String(err); }
}

async function conectarPrototipo() {
  var conectados = 0;
  var omitidos = 0;
  var propios = 0;
  for (var i = 0; i < enlaces.length; i++) {
    var e = enlaces[i];
    var accion = e.accion || 'navegar';
    if (!e.desde || e.desde.removed) { omitidos++; continue; }

    var reaccion;
    if (accion === 'cerrar') {
      reaccion = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'CLOSE' }] }];
    } else {
      var destino = (e.hacia === 'MENU')
        ? auxiliares['MENU@' + e.ancho]
        : marcos[e.hacia + '@' + e.ancho];
      if (!destino) { omitidos++; continue; }

      // Figma rechaza NAVIGATE hacia el propio marco: el destino tiene que ser otro
      // marco de primer nivel. Ocurre con la opción seleccionada del menú y con el
      // «Volver al inicio» del pie dentro de la propia pantalla de Inicio. No es un
      // enlace que falte: es un enlace que no debe existir.
      if (pantallaDe(e.desde) === e.hacia + '@' + e.ancho) { propios++; continue; }

      reaccion = [{
        trigger: { type: 'ON_CLICK' },
        actions: [{
          type: 'NODE',
          destinationId: destino.id,
          navigation: accion === 'overlay' ? 'OVERLAY' : 'NAVIGATE',
          transition: null,
          preserveScrollPosition: false
        }]
      }];
    }

    try {
      await fijarReacciones(e.desde, reaccion);
      conectados++;
    } catch (err) {
      // Reintentos en orden de preferencia: el asignador síncrono, y si la acción
      // no está disponible en esta versión de la API, su equivalente más simple.
      var segundo = null;
      try {
        e.desde.reactions = reaccion;
        conectados++;
        continue;
      } catch (err2) { segundo = err2; }

      var alternativa = null;
      if (accion === 'overlay') {
        alternativa = [{
          trigger: { type: 'ON_CLICK' },
          actions: [{
            type: 'NODE', destinationId: reaccion[0].actions[0].destinationId,
            navigation: 'NAVIGATE', transition: null, preserveScrollPosition: false
          }]
        }];
      } else if (accion === 'cerrar') {
        alternativa = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'BACK' }] }];
      }
      if (alternativa) {
        try {
          await fijarReacciones(e.desde, alternativa);
          conectados++;
          incidencias.push('«' + (e.desde.name || '?') + '»: ' + accion +
            ' no disponible, se usó la alternativa simple');
          continue;
        } catch (err3) { /* se reporta abajo */ }
      }
      incidencias.push(
        'enlace ' + pantallaDe(e.desde) + ' → ' + e.hacia +
        ' | origen: ' + describir(e.desde) +
        ' | error: ' + textoDelError(err) +
        (segundo ? ' | reintento: ' + textoDelError(segundo) : '')
      );
    }
  }
  if (omitidos) incidencias.push(omitidos + ' enlaces omitidos por falta de destino');
  return { conectados: conectados, propios: propios, aplicables: enlaces.length - propios };
}

// ═══════════════════════════════════════════════════════════ fase 6 · auditoría

function auditar() {
  var lineas = [];
  var problemas = [];
  // las comprobaciones miran también las capas auxiliares, como el menú desplegable
  var todos = {};
  Object.keys(marcos).forEach(function (k) { todos[k] = marcos[k]; });
  Object.keys(auxiliares).forEach(function (k) { todos[k] = auxiliares[k]; });

  var totalMarcos = Object.keys(marcos).length;
  lineas.push('pantallas construidas : ' + totalMarcos + ' (esperadas 27)');
  if (totalMarcos !== 27) problemas.push('faltan pantallas: hay ' + totalMarcos + ' de 27');

  ANCHOS.forEach(function (a) {
    var n = 0, malAncho = 0;
    Object.keys(marcos).forEach(function (k) {
      if (k.indexOf('@' + a) !== -1) {
        n++;
        if (Math.round(marcos[k].width) !== a) malAncho++;
      }
    });
    lineas.push('  ' + a + ' px: ' + n + ' pantallas' + (malAncho ? ' — ' + malAncho + ' con ancho incorrecto' : ''));
    if (malAncho) problemas.push(malAncho + ' pantallas de ' + a + ' px no miden ' + a);
  });

  // Desbordamiento horizontal (RNF-03, HU-33). Se compara en coordenadas absolutas:
  // el x de un nodo es relativo a su padre, así que compararlo con el ancho del marco
  // daría falsos positivos en cuanto hay anidamiento.
  var desbordan = 0;
  var ejemplos = [];
  Object.keys(todos).forEach(function (k) {
    var m = todos[k];
    var caja = m.absoluteBoundingBox;
    if (!caja) return;
    var derecha = caja.x + caja.width + 1;
    function recorrer(nodo) {
      if (!nodo.children) return;
      // lo que sobresale de un contenedor que recorta no se ve, así que no desborda
      if (nodo !== m && nodo.clipsContent) return;
      nodo.children.forEach(function (h) {
        var c = h.absoluteBoundingBox;
        if (c && c.x + c.width > derecha) {
          desbordan++;
          if (ejemplos.length < 5) {
            ejemplos.push(k + ' · ' + h.name + ' (+' + Math.round(c.x + c.width - derecha + 1) + ' px)');
          }
        }
        recorrer(h);
      });
    }
    recorrer(m);
  });
  lineas.push('desbordamiento horizontal : ' + (desbordan === 0 ? 'ninguno' : desbordan + ' elementos'));
  if (desbordan) {
    problemas.push(desbordan + ' elementos se salen del ancho de su pantalla');
    ejemplos.forEach(function (e) { lineas.push('    · ' + e); });
  }

  // HU-10 · área de toque en las pantallas de 360
  var chicos = [];
  Object.keys(todos).forEach(function (k) {
    if (k.indexOf('@360') === -1) return;
    function recorrer(nodo) {
      if (!nodo.children) return;
      nodo.children.forEach(function (h) {
        var n = (h.name || '').toLowerCase();
        var interactivo = n.indexOf('boton') === 0 || n.indexOf('chip') === 0 ||
          n.indexOf('pagina ') === 0 || n.indexOf('menu compacto') === 0;
        if (interactivo && (h.height < 43.5 || h.width < 43.5)) {
          chicos.push(k + ' · ' + h.name + ' ' + Math.round(h.width) + '×' + Math.round(h.height));
        }
        recorrer(h);
      });
    }
    recorrer(todos[k]);
  });
  lineas.push('área de toque < 44×44 en 360 px : ' + (chicos.length === 0 ? 'ninguna' : chicos.length));
  if (chicos.length) {
    problemas.push(chicos.length + ' controles por debajo de 44×44 en móvil');
    chicos.slice(0, 6).forEach(function (c) { lineas.push('    · ' + c); });
  }

  // Un contenedor con ajuste de línea cuyo eje principal siga abrazando el contenido
  // nunca envuelve: crece en una sola fila y desborda. Es el fallo que produjo la
  // primera ejecución real, así que se comprueba explícitamente.
  var sinFijar = [];
  Object.keys(todos).forEach(function (k) {
    function recorrer(nodo) {
      if (!nodo.children) return;
      nodo.children.forEach(function (h) {
        if (h.layoutWrap === 'WRAP' && h.layoutMode === 'HORIZONTAL' &&
            h.primaryAxisSizingMode !== 'FIXED') {
          sinFijar.push(k + ' · ' + h.name);
        }
        recorrer(h);
      });
    }
    recorrer(todos[k]);
  });
  lineas.push('contenedores con ajuste sin ancho fijo : ' +
    (sinFijar.length === 0 ? 'ninguno' : sinFijar.length));
  if (sinFijar.length) {
    problemas.push(sinFijar.length + ' contenedores con ajuste de línea no envolverán');
    sinFijar.slice(0, 6).forEach(function (s) { lineas.push('    · ' + s); });
  }

  // Un contenedor con ajuste de línea tiene DOS huecos, no uno: itemSpacing separa
  // los elementos dentro de una fila y counterAxisSpacing separa las filas entre sí.
  // Fijar solo el primero deja las tarjetas pegadas verticalmente, y a 360 px, donde
  // cada tarjeta ocupa su propia fila, el catálogo entero queda sin aire.
  var sinAire = [];
  Object.keys(todos).forEach(function (k) {
    function recorrer(nodo) {
      if (!nodo.children) return;
      nodo.children.forEach(function (h) {
        if (h.layoutWrap === 'WRAP' && h.layoutMode === 'HORIZONTAL' &&
            h.children && h.children.length > 1 && h.itemSpacing > 0 &&
            !(h.counterAxisSpacing > 0)) {
          sinAire.push(k + ' · ' + h.name + ' (' + h.children.length + ' elementos)');
        }
        recorrer(h);
      });
    }
    recorrer(todos[k]);
  });
  lineas.push('contenedores con ajuste sin separación entre filas : ' +
    (sinAire.length === 0 ? 'ninguno' : sinAire.length));
  if (sinAire.length) {
    problemas.push(sinAire.length + ' contenedores dejan las filas pegadas entre sí');
    sinAire.slice(0, 6).forEach(function (s) { lineas.push('    · ' + s); });
  }

  // La auditoría solo miraba desbordamiento, y un contenedor demasiado ESTRECHO no
  // desborda nada: se queda aplastado y pasa desapercibido. Aquí se comprueba que
  // todo hijo marcado para rellenar su contenedor lo esté rellenando de verdad.
  var aplastados = [];
  Object.keys(todos).forEach(function (k) {
    function recorrer(nodo) {
      if (!nodo.children) return;
      var conAuto = nodo.layoutMode === 'VERTICAL' || nodo.layoutMode === 'HORIZONTAL';
      // Un borde interior descuenta su grosor por cada lado del área de contenido.
      // Sin restarlo, todo hijo de un contenedor con borde parece 2 px corto.
      var borde = (nodo.strokes && nodo.strokes.length && nodo.strokeAlign === 'INSIDE')
        ? (nodo.strokeWeight || 0) * 2 : 0;
      var interior = nodo.width - nodo.paddingLeft - nodo.paddingRight - borde;
      nodo.children.forEach(function (h) {
        if (conAuto && nodo.layoutMode === 'VERTICAL' &&
            h.layoutAlign === 'STRETCH' && interior > 1 && h.width < interior - 1) {
          aplastados.push(k + ' · ' + h.name + ' ' +
            Math.round(h.width) + ' de ' + Math.round(interior) + ' px');
        }
        recorrer(h);
      });
    }
    recorrer(todos[k]);
  });
  lineas.push('elementos que no rellenan su contenedor : ' +
    (aplastados.length === 0 ? 'ninguno' : aplastados.length));
  if (aplastados.length) {
    problemas.push(aplastados.length + ' elementos quedaron más estrechos que su contenedor');
    aplastados.slice(0, 6).forEach(function (s) { lineas.push('    · ' + s); });
  }

  // Comprobación por síntoma y no por mecanismo: un texto de varias letras metido en
  // menos de 40 px se parte letra a letra y no hay forma de leerlo. Da igual qué lo
  // haya causado; si aparece, la pantalla está rota.
  var estrujados = [];
  Object.keys(todos).forEach(function (k) {
    function recorrer(nodo) {
      if (!nodo.children) return;
      nodo.children.forEach(function (h) {
        if (h.type === 'TEXT' && h.characters) {
          var tam = parseFloat(h.getPluginData('tam')) || 15;
          var masLarga = 0;
          h.characters.split(/\s+/).forEach(function (p) {
            if (p.length > masLarga) masLarga = p.length;
          });
          // ancho aproximado de la palabra más larga; por debajo de eso, Figma
          // parte la palabra por la mitad y el texto deja de leerse
          var minimo = masLarga * tam * 0.5 * 0.85;
          if (masLarga > 3 && h.width < minimo) {
            estrujados.push(k + ' · «' + h.characters.substring(0, 24) + '» en ' +
              Math.round(h.width) + ' px, necesita ' + Math.round(minimo));
          }
        }
        recorrer(h);
      });
    }
    recorrer(todos[k]);
  });
  lineas.push('textos partidos letra a letra : ' +
    (estrujados.length === 0 ? 'ninguno' : estrujados.length));
  if (estrujados.length) {
    problemas.push(estrujados.length + ' textos quedaron tan estrechos que se parten letra a letra');
    estrujados.slice(0, 8).forEach(function (s) { lineas.push('    · ' + s); });
  }

  // Alcanzabilidad. Ninguna comprobación anterior mira si a una pantalla se puede
  // LLEGAR: una vista perfectamente construida y sin un solo enlace de entrada pasa
  // todas las demás sin una sola queja. Así se nos escapó el panel de administración,
  // que el asesor encontró abriendo el prototipo. Se recorre el grafo desde Inicio,
  // no basta con contar enlaces de entrada: una vista solo alcanzable desde otra
  // inalcanzable sigue estando fuera del recorrido.
  var inalcanzables = [];
  ANCHOS.forEach(function (a) {
    var salidas = {};
    enlaces.forEach(function (e) {
      if (e.ancho !== a || !e.hacia || !e.desde || e.desde.removed) return;
      var origen = pantallaDe(e.desde);
      if (!origen) return;
      origen = origen.split('@')[0];
      if (!salidas[origen]) salidas[origen] = [];
      salidas[origen].push(e.hacia);
    });
    var vistos = { 'V-1': true };
    var cola = ['V-1'];
    while (cola.length) {
      var actual = cola.shift();
      (salidas[actual] || []).forEach(function (d) {
        if (!vistos[d]) { vistos[d] = true; cola.push(d); }
      });
    }
    VISTAS.forEach(function (v) {
      if (!vistos[v.id]) inalcanzables.push(v.id + ' · ' + v.nombre + ' @ ' + a);
    });
  });
  lineas.push('pantallas sin camino desde Inicio : ' +
    (inalcanzables.length === 0 ? 'ninguna' : inalcanzables.length));
  if (inalcanzables.length) {
    problemas.push(inalcanzables.length + ' pantallas no se pueden alcanzar navegando desde Inicio');
    inalcanzables.slice(0, 9).forEach(function (s) { lineas.push('    · ' + s); });
  }

  var conFondo = 0;
  Object.keys(marcos).forEach(function (k) {
    var hijos = marcos[k].children || [];
    for (var i = 0; i < hijos.length; i++) {
      if (hijos[i].name === 'fondo · Santa Marta') { conFondo++; break; }
    }
  });
  lineas.push('pantallas con fondo de Santa Marta : ' + conFondo + ' de ' +
    Object.keys(marcos).length + (imagenFondo ? ' (fotografía cargada)' : ' (ilustración generada)'));
  if (conFondo < Object.keys(marcos).length) {
    problemas.push((Object.keys(marcos).length - conFondo) + ' pantallas se quedaron sin fondo');
  }

  lineas.push('logo institucional : ' + (imagenLogo
    ? 'cargado — ' + (recursos.logo && recursos.logo.nombre ? recursos.logo.nombre : 'imagen')
    : 'NO cargado, se dibujó el marcador'));
  if (!imagenLogo) {
    problemas.push('falta el logo institucional: cárgalo en el plugin y vuelve a construir');
  }

  var capas = Object.keys(auxiliares);
  lineas.push('capas auxiliares : ' + (capas.length ? capas.join(', ') : 'ninguna'));
  lineas.push('estilos de color : ' + Object.keys(estilosColor).length + ' (esperados 17)');
  lineas.push('estilos de texto : ' + Object.keys(estilosTexto).length + ' (esperados 12)');
  lineas.push('componentes      : ' + Object.keys(componentes).join(', '));

  if (fuentesFallidas.length) {
    problemas.push('fuentes no disponibles: ' + fuentesFallidas.join(', '));
  }

  return { lineas: lineas, problemas: problemas };
}

// ═══════════════════════════════════════════════════════════ orquestación

async function construir() {
  var inicio = Date.now();
  incidencias = [];
  estilosColor = {}; estilosTexto = {}; componentes = {};
  marcos = {}; auxiliares = {}; enlaces = []; fuentesFallidas = [];

  avisar('Limpiando lo generado antes…');
  var borrados = limpiarAnterior();

  avisar('Leyendo las imágenes cargadas…');
  await leerRecursos();
  prepararImagenes();

  avisar('Cargando fuentes…');
  await cargarFuentes();

  avisar('Creando estilos…');
  await crearEstilos();

  avisar('Creando componentes…');
  try { crearComponentes(); } catch (e) { incidencias.push('componentes: ' + e.message); }

  var x = 0;
  for (var iv = 0; iv < CONSTRUCTORES.length; iv++) {
    var vista = VISTAS[iv];
    avisar('Construyendo ' + vista.id + ' · ' + vista.nombre + '…');
    var y = 0;
    var maxAncho = 0;
    for (var ia = 0; ia < ANCHOS.length; ia++) {
      var ancho = ANCHOS[ia];
      try {
        var m = CONSTRUCTORES[iv](ancho);
        m.x = x;
        m.y = y;
        figma.currentPage.appendChild(m);
        marcos[vista.id + '@' + ancho] = m;
        y += m.height + 120;
        maxAncho = Math.max(maxAncho, m.width);
      } catch (e) {
        incidencias.push(vista.id + ' @ ' + ancho + ': ' + e.message);
      }
    }
    x += maxAncho + 160;
  }

  avisar('Construyendo el menú desplegable…');
  ANCHOS.filter(esMovil).forEach(function (a) {
    try {
      var m = menuMovil(a);
      m.x = -(a + 200);
      m.y = 0;
      figma.currentPage.appendChild(m);
      auxiliares['MENU@' + a] = m;
    } catch (e) { incidencias.push('menú de ' + a + ': ' + e.message); }
  });

  avisar('Reaplicando el dimensionado…');
  Object.keys(marcos).concat(Object.keys(auxiliares)).forEach(function (k) {
    var m = marcos[k] || auxiliares[k];
    try { reaplicarDimensionado(m); }
    catch (e) { incidencias.push('dimensionado en ' + k + ': ' + e.message); }
  });

  avisar('Colocando el fondo de Santa Marta…');
  var conFondo = 0;
  Object.keys(marcos).forEach(function (k) {
    try {
      if (aplicarFondo(marcos[k], marcos[k].width)) conFondo++;
    } catch (e) { incidencias.push('fondo en ' + k + ': ' + e.message); }
  });

  avisar('Conectando el prototipo…');
  var red = { conectados: 0, propios: 0, aplicables: 0 };
  try { red = await conectarPrototipo(); }
  catch (e) { incidencias.push('prototipo: ' + e.message); }

  // punto de entrada del prototipo
  try {
    var inicioFrame = marcos['V-1@1366'];
    if (inicioFrame) figma.currentPage.selection = [inicioFrame];
  } catch (e) {}

  var lista = [];
  Object.keys(marcos).forEach(function (k) { lista.push(marcos[k]); });
  Object.keys(auxiliares).forEach(function (k) { lista.push(auxiliares[k]); });
  if (lista.length) figma.viewport.scrollAndZoomIntoView(lista);

  var a = auditar();
  var segundos = ((Date.now() - inicio) / 1000).toFixed(1);

  var texto = [];
  texto.push('INFORME DE CONSTRUCCIÓN — ' + VERSION + ' — ' + segundos + ' s');
  texto.push('');
  if (borrados) texto.push('se reemplazaron ' + borrados + ' elementos de una ejecución anterior');
  texto.push('enlaces de prototipo conectados : ' + red.conectados + ' de ' + red.aplicables);
  if (red.propios) {
    texto.push('  (' + red.propios + ' descartados por apuntar a su propia pantalla: ' +
      'la opción activa del menú y el «volver al inicio» del pie en Inicio)');
  }
  a.lineas.forEach(function (l) { texto.push(l); });

  var todosProblemas = a.problemas.concat(incidencias);
  texto.push('');
  if (todosProblemas.length === 0) {
    texto.push('Sin incidencias.');
  } else {
    texto.push('INCIDENCIAS (' + todosProblemas.length + '):');
    todosProblemas.forEach(function (p) { texto.push('  - ' + p); });
  }

  figma.ui.postMessage({
    tipo: 'informe',
    ok: todosProblemas.length === 0,
    texto: texto.join('\n')
  });
  figma.notify(todosProblemas.length === 0
    ? 'Prototipo construido: 27 pantallas.'
    : 'Construido con ' + todosProblemas.length + ' incidencias. Mira el informe.');
}

function estadoRecursos() {
  function resumir(r) {
    if (!r || !r.base64) return null;
    return { nombre: r.nombre || 'imagen', kb: Math.round(r.base64.length * 0.75 / 1024) };
  }
  figma.ui.postMessage({
    tipo: 'recursos',
    logo: resumir(recursos.logo),
    fondo: resumir(recursos.fondo)
  });
}

figma.ui.onmessage = function (msg) {
  if (msg.tipo === 'estadoRecursos') {
    leerRecursos().then(estadoRecursos);
    return;
  }
  if (msg.tipo === 'guardarRecurso' || msg.tipo === 'borrarRecurso') {
    var clave = msg.clave === 'fondo' ? CLAVE_FONDO : CLAVE_LOGO;
    var valor = msg.tipo === 'guardarRecurso'
      ? { nombre: msg.nombre, base64: msg.base64 }
      : undefined;
    figma.clientStorage.setAsync(clave, valor).then(function () {
      recursos[msg.clave === 'fondo' ? 'fondo' : 'logo'] = valor || null;
      estadoRecursos();
      figma.notify(msg.tipo === 'guardarRecurso'
        ? 'Imagen guardada. Pulsa Construir para verla en el prototipo.'
        : 'Imagen retirada.');
    }).catch(function (e) {
      figma.notify('No se pudo guardar la imagen: ' + e.message, { error: true });
    });
    return;
  }
  if (msg.tipo === 'construir') {
    construir().catch(function (e) {
      figma.ui.postMessage({
        tipo: 'informe', ok: false,
        texto: 'ERROR FATAL\n\n' + (e && e.stack ? e.stack : String(e))
      });
    });
  } else if (msg.tipo === 'cerrar') {
    figma.closePlugin();
  }
};
