// Banco de pruebas: ejecuta code.js contra una API de Figma simulada.
//
// Implementa auto layout de forma aproximada —ejes, relleno, separación, ajuste de línea
// y crecimiento— para que la auditoría del plugin mida algo real. No reproduce el render
// de Figma: los anchos de texto son una estimación. Sirve para atrapar métodos
// inexistentes, ejes confundidos, contenedores que no envuelven y excepciones sin capturar.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RUTA = path.join(__dirname, 'code.js');

let contadorId = 0;
const avisos = [];
let sucio = true;

// ───────────────────────────────────────────────── maquetación aproximada

// Ancho que tendría el nodo si abraza su contenido, sin estirar a nadie.
// Figma resuelve así el caso circular «padre que abraza con hijos que rellenan»:
// el padre toma el ancho natural del contenido y los hijos se ajustan a él. Un
// párrafo largo dentro de un contenedor sin ancho fijo se va a una sola línea.
function anchoNatural(n) {
  if (n.type === 'TEXT') return n._anchoNatural || n.width;
  if (!n.children || n.children.length === 0) return n.width;
  if (n.layoutMode === 'NONE') return n.width;
  const h = n.layoutMode === 'HORIZONTAL';
  const fijo = h ? n.primaryAxisSizingMode === 'FIXED' : n.counterAxisSizingMode === 'FIXED';
  if (fijo || n._anchoImpuesto) return n.width;
  const anchos = n.children.map(anchoNatural);
  const contenido = h
    ? anchos.reduce((a, b) => a + b, 0) + n.itemSpacing * Math.max(0, anchos.length - 1)
    : Math.max.apply(null, anchos.concat([0]));
  return contenido + n.paddingLeft + n.paddingRight;
}

function disponer(n) {
  if (!n.children || n.children.length === 0) return;

  if (n.layoutMode === 'NONE') {
    n.children.forEach(disponer);
    return;
  }

  const h = n.layoutMode === 'HORIZONTAL';

  // Si nadie le impuso el ancho, abraza el contenido natural antes de estirar hijos.
  const anchoFijado = h ? n.primaryAxisSizingMode === 'FIXED' : n.counterAxisSizingMode === 'FIXED';
  if (!anchoFijado && !n._anchoImpuesto) {
    n.width = Math.max(0.01, anchoNatural(n));
  }

  const borde = (n.strokes && n.strokes.length && n.strokeAlign === 'INSIDE')
    ? (n.strokeWeight || 0) * 2 : 0;
  const anchoInterno = n.width - n.paddingLeft - n.paddingRight - borde;

  // El eje transversal se estira antes de medir a los hijos. Un hijo estirado recibe
  // su ancho del padre: marcarlo evita que luego vuelva a abrazar su contenido, que es
  // lo que hace Figma con «rellenar contenedor».
  n.children.forEach((c) => {
    if (c.layoutAlign === 'STRETCH' && !h) {
      c.width = Math.max(0.01, anchoInterno);
      c._anchoImpuesto = true;
    }
  });

  n.children.forEach(disponer);

  // Figma colapsa a 1 px a los hijos que rellenan cuando el contenedor horizontal
  // abraza su contenido. Reproducirlo delata los titulos y campos aplastados.
  if (h && n.primaryAxisSizingMode !== 'FIXED') {
    n.children.forEach((c) => {
      if (c.layoutGrow > 0) { c.width = 1; c._anchoImpuesto = true; }
    });
  }

  // Crecimiento en el eje principal (layoutGrow) en contenedores horizontales fijos.
  if (h && n.primaryAxisSizingMode === 'FIXED') {
    const crecen = n.children.filter((c) => c.layoutGrow > 0);
    if (crecen.length) {
      const fijos = n.children.filter((c) => !c.layoutGrow).reduce((s, c) => s + c.width, 0);
      const huecos = n.itemSpacing * Math.max(0, n.children.length - 1);
      const sobra = anchoInterno - fijos - huecos;
      if (sobra > 0) {
        crecen.forEach((c) => { c.width = Math.max(0.01, sobra / crecen.length); disponer(c); });
      }
    }
  }

  const envuelve = h && n.layoutWrap === 'WRAP' && n.primaryAxisSizingMode === 'FIXED';
  const limite = n.paddingLeft + anchoInterno + 0.5;

  let x = n.paddingLeft, y = n.paddingTop;
  let altoFila = 0, primeroEnFila = true;
  let maxDerecha = n.paddingLeft, maxAbajo = n.paddingTop;

  n.children.forEach((c) => {
    if (h) {
      if (envuelve && !primeroEnFila && x + c.width > limite) {
        x = n.paddingLeft;
        y += altoFila + n.itemSpacing;
        altoFila = 0;
      }
      c.x = x; c.y = y;
      x += c.width + n.itemSpacing;
      altoFila = Math.max(altoFila, c.height);
      primeroEnFila = false;
    } else {
      c.x = n.paddingLeft; c.y = y;
      y += c.height + n.itemSpacing;
    }
    maxDerecha = Math.max(maxDerecha, c.x + c.width);
    maxAbajo = Math.max(maxAbajo, c.y + c.height);
  });

  const anchoContenido = maxDerecha + n.paddingRight;
  const altoContenido = maxAbajo + n.paddingBottom;

  const anchoLibre = !n._anchoImpuesto;
  if (h) {
    if (n.primaryAxisSizingMode !== 'FIXED' && anchoLibre) n.width = Math.max(0.01, anchoContenido);
    if (n.counterAxisSizingMode !== 'FIXED') n.height = Math.max(0.01, altoContenido);
  } else {
    if (n.primaryAxisSizingMode !== 'FIXED') n.height = Math.max(0.01, altoContenido);
    if (n.counterAxisSizingMode !== 'FIXED' && anchoLibre) n.width = Math.max(0.01, anchoContenido);
  }
}

function disponerTodo(pagina) {
  if (!sucio) return;
  sucio = false;
  pagina.children.forEach(disponer);
}

// ───────────────────────────────────────────────── nodos

function crearNodo(tipo, extra) {
  const n = Object.assign({
    id: tipo + ':' + (++contadorId),
    type: tipo,
    name: '',
    x: 0, y: 0, width: 100, height: 100,
    children: [],
    parent: null,
    removed: false,
    _datos: {},
    _caracteres: '',
    fills: [], strokes: [], strokeWeight: 1, strokeAlign: 'INSIDE',
    cornerRadius: 0, dashPattern: [],
    layoutMode: 'NONE', layoutWrap: 'NO_WRAP',
    _layoutAlign: 'INHERIT', _layoutGrow: 0,
    primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO',
    primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
    itemSpacing: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
    clipsContent: false, layoutGrids: [], gridStyleId: '',
    fillStyleId: '', textStyleId: '',
    reactions: [],

    resize(w, hh) {
      if (!(w >= 0.01) || !(hh >= 0.01)) {
        avisos.push(`resize inválido en "${this.name || this.type}": ${w}×${hh}`);
        w = Math.max(0.01, w || 0.01);
        hh = Math.max(0.01, hh || 0.01);
      }
      this.width = w; this.height = hh;
      sucio = true;
    },
    appendChild(hijo) {
      if (!hijo) throw new Error('appendChild(undefined) en ' + this.name);
      if (hijo.removed) throw new Error('appendChild de un nodo ya borrado: ' + hijo.name);
      if (hijo.parent) {
        const i = hijo.parent.children.indexOf(hijo);
        if (i >= 0) hijo.parent.children.splice(i, 1);
      }
      hijo.parent = this;
      this.children.push(hijo);
      sucio = true;
    },
    remove() {
      if (this.parent) {
        const i = this.parent.children.indexOf(this);
        if (i >= 0) this.parent.children.splice(i, 1);
      }
      this.removed = true;
      sucio = true;
    },
    getPluginData(k) { return this._datos[k] || ''; },
    setPluginData(k, v) { this._datos[k] = v; },
    setReactionsAsync(r) {
      if (!Array.isArray(r)) throw new Error('reacciones no es un array');
      r.forEach((x) => {
        if (!x.trigger || !x.actions) throw new Error('reacción mal formada');
        x.actions.forEach((a) => {
          if (a.type === 'NODE' && !a.destinationId) throw new Error('acción NODE sin destino');
        });
      });
      this.reactions = r;
      return Promise.resolve();
    }
  }, extra || {});

  // Figma ignora layoutAlign y layoutGrow si el nodo todavía no está dentro de un
  // contenedor con auto layout. Reproducirlo es lo que delata a los contenedores que
  // se quedan en su ancho por defecto en lugar de rellenar a su padre.
  const dentroDeAutoLayout = (nodo) => !!nodo.parent &&
    (nodo.parent.layoutMode === 'VERTICAL' || nodo.parent.layoutMode === 'HORIZONTAL');

  Object.defineProperty(n, 'layoutAlign', {
    get() { return this._layoutAlign; },
    set(v) {
      if (!dentroDeAutoLayout(this)) {
        avisos.push('layoutAlign ignorado: "' + (this.name || this.type) + '" aun no esta en un contenedor con auto layout');
        return;
      }
      this._layoutAlign = v; sucio = true;
    }
  });
  Object.defineProperty(n, 'layoutGrow', {
    get() { return this._layoutGrow; },
    set(v) {
      if (!dentroDeAutoLayout(this)) {
        avisos.push('layoutGrow ignorado: "' + (this.name || this.type) + '" aun no esta en un contenedor con auto layout');
        return;
      }
      this._layoutGrow = v; sucio = true;
    }
  });

  if (tipo === 'TEXT') {
    Object.defineProperty(n, 'characters', {
      get() { return this._caracteres; },
      set(v) {
        this._caracteres = String(v);
        // Estimación: el simulador no mide tipografía real. Sin tope superior, para
        // que un párrafo largo delate al contenedor que no le fija el ancho.
        // mismo estimador que usa la auditoría del plugin, para que ambos coincidan
        const tam = parseFloat(this._datos['tam']) || 15;
        this._anchoNatural = Math.max(8, this._caracteres.length * tam * 0.5);
        this.width = this._anchoNatural;
        this.height = 20;
        sucio = true;
      }
    });
  }

  Object.defineProperty(n, 'absoluteBoundingBox', {
    get() {
      disponerTodo(pagina);
      let x = 0, y = 0, p = this;
      while (p) { x += p.x || 0; y += p.y || 0; p = p.parent; }
      return { x, y, width: this.width, height: this.height };
    }
  });
  return n;
}

const pagina = crearNodo('PAGE', { width: 0, height: 0 });
pagina.selection = [];

function nuevo(tipo, extra) {
  const n = crearNodo(tipo, extra);
  pagina.appendChild(n);
  return n;
}

const FUENTES_OK = new Set([
  'Archivo|Bold', 'Archivo|SemiBold', 'Archivo|Medium',
  'Source Sans 3|Regular', 'Source Sans 3|SemiBold',
  'IBM Plex Mono|Regular', 'IBM Plex Mono|Medium',
  'Inter|Regular', 'Inter|Bold', 'Inter|Semi Bold'
]);

const mensajesUI = [];

const figma = {
  showUI() {},
  ui: { postMessage(m) { mensajesUI.push(m); }, onmessage: null },
  notify(t) { mensajesUI.push({ tipo: 'notify', texto: t }); },
  closePlugin() {},
  currentPage: pagina,
  viewport: { scrollAndZoomIntoView() {} },

  createFrame: () => nuevo('FRAME'),
  createRectangle: () => nuevo('RECTANGLE'),
  createEllipse: () => nuevo('ELLIPSE'),
  createComponent: () => nuevo('COMPONENT'),
  createText: () => {
    const t = nuevo('TEXT', { textAutoResize: 'NONE', fontName: { family: 'Inter', style: 'Regular' } });
    t.height = 20;
    return t;
  },

  createPaintStyle: () => ({ id: 'S:' + (++contadorId), name: '', paints: [], type: 'PAINT' }),
  createTextStyle: () => ({ id: 'S:' + (++contadorId), name: '', type: 'TEXT' }),
  createGridStyle: () => ({ id: 'S:' + (++contadorId), name: '', layoutGrids: [], type: 'GRID' }),

  getLocalPaintStylesAsync: async () => [],
  getLocalTextStylesAsync: async () => [],
  getLocalGridStylesAsync: async () => [],

  loadFontAsync: async (f) => {
    if (!FUENTES_OK.has(f.family + '|' + f.style)) {
      throw new Error('fuente no disponible: ' + f.family + ' ' + f.style);
    }
  },

  combineAsVariants(nodos, padre) {
    nodos.forEach((n) => {
      if (!/^[\w áéíóúñ]+=[\w áéíóúñ]+$/i.test(n.name)) {
        avisos.push('combineAsVariants: nombre sin formato propiedad=valor -> "' + n.name + '"');
      }
    });
    const set = crearNodo('COMPONENT_SET');
    padre.appendChild(set);
    nodos.forEach((n) => set.appendChild(n));
    return set;
  }
};

const codigo = fs.readFileSync(RUTA, 'utf8');
const contexto = vm.createContext({
  figma,
  __html__: '<html></html>',
  console,
  setTimeout, clearTimeout,
  Promise, Date, Math, JSON, Object, Array, String, Number, Boolean, Error
});

try {
  vm.runInContext(codigo, contexto, { filename: 'code.js' });
} catch (e) {
  console.log('FALLO AL CARGAR code.js\n' + e.stack);
  process.exit(1);
}

if (typeof figma.ui.onmessage !== 'function') {
  console.log('FALLO: code.js no registró figma.ui.onmessage');
  process.exit(1);
}

figma.ui.onmessage({ tipo: 'construir' });

setTimeout(() => {
  const informe = mensajesUI.filter((m) => m.tipo === 'informe').pop();
  console.log('mensajes de progreso :', mensajesUI.filter((m) => m.tipo === 'progreso').length);
  console.log('nodos creados        :', contadorId);
  console.log('');

  if (!informe) {
    console.log('FALLO: la construcción nunca emitió un informe.');
    process.exit(1);
  }
  console.log('---------- informe del plugin ----------');
  console.log(informe.texto);
  console.log('----------------------------------------');

  if (avisos.length) {
    console.log('\navisos del simulador (' + avisos.length + '):');
    [...new Set(avisos)].slice(0, 12).forEach((a) => console.log('  - ' + a));
  } else {
    console.log('\nsin avisos del simulador');
  }

  process.exit(informe.texto.indexOf('ERROR FATAL') === 0 ? 1 : 0);
}, 2500);
