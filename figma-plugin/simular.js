// Banco de pruebas: ejecuta code.js contra una API de Figma simulada.
//
// No valida el aspecto visual —el simulador no implementa auto layout— pero sí atrapa
// lo que de verdad rompe un plugin: métodos inexistentes, propiedades asignadas en el
// orden equivocado, nodos usados después de borrarlos y excepciones sin capturar.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RUTA = path.join(__dirname, 'code.js');

let contadorId = 0;
const avisos = [];

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
    fills: [], strokes: [], strokeWeight: 1, strokeAlign: 'INSIDE',
    cornerRadius: 0, dashPattern: [],
    layoutMode: 'NONE', layoutAlign: 'INHERIT', layoutGrow: 0, layoutWrap: 'NO_WRAP',
    primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO',
    primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
    itemSpacing: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
    clipsContent: false, layoutGrids: [], gridStyleId: '',
    fillStyleId: '', textStyleId: '',
    reactions: [],

    resize(w, h) {
      if (!(w >= 0.01) || !(h >= 0.01)) {
        avisos.push(`resize inválido en "${this.name || this.type}": ${w}×${h}`);
        w = Math.max(0.01, w || 0.01);
        h = Math.max(0.01, h || 0.01);
      }
      this.width = w; this.height = h;
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
      // Aproximación de auto layout. Un contenedor con el eje principal en FIXED
      // conserva su tamaño, igual que en Figma: si esto no se respeta, el simulador
      // inventa incumplimientos de área de toque que no existen.
      if (this.layoutMode === 'VERTICAL' && this.primaryAxisSizingMode !== 'FIXED') {
        this.height = this.paddingTop + this.paddingBottom +
          this.children.reduce((s, c) => s + c.height, 0) +
          this.itemSpacing * Math.max(0, this.children.length - 1);
      } else if (this.layoutMode === 'HORIZONTAL' && this.counterAxisSizingMode !== 'FIXED') {
        this.height = Math.max(this.height,
          this.paddingTop + this.paddingBottom + Math.max(...this.children.map(c => c.height), 0));
      }
    },
    remove() {
      if (this.parent) {
        const i = this.parent.children.indexOf(this);
        if (i >= 0) this.parent.children.splice(i, 1);
      }
      this.removed = true;
    },
    getPluginData(k) { return this._datos[k] || ''; },
    setPluginData(k, v) { this._datos[k] = v; },
    setReactionsAsync(r) {
      if (!Array.isArray(r)) throw new Error('reacciones no es un array');
      r.forEach(x => {
        if (!x.trigger || !x.actions) throw new Error('reacción mal formada');
        x.actions.forEach(a => {
          if (a.type === 'NODE' && !a.destinationId) throw new Error('acción NODE sin destino');
        });
      });
      this.reactions = r;
      return Promise.resolve();
    }
  }, extra || {});

  Object.defineProperty(n, 'absoluteBoundingBox', {
    get() {
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
  ui: {
    postMessage(m) { mensajesUI.push(m); },
    onmessage: null
  },
  notify(t) { mensajesUI.push({ tipo: 'notify', texto: t }); },
  closePlugin() {},
  currentPage: pagina,
  viewport: { scrollAndZoomIntoView() {} },

  createFrame: () => nuevo('FRAME'),
  createRectangle: () => nuevo('RECTANGLE'),
  createEllipse: () => nuevo('ELLIPSE'),
  createComponent: () => nuevo('COMPONENT'),
  createText: () => {
    const t = nuevo('TEXT', { characters: '', textAutoResize: 'NONE', fontName: { family: 'Inter', style: 'Regular' } });
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
    nodos.forEach(n => {
      if (!/^[\w áéíóú]+=[\w áéíóú]+$/i.test(n.name)) {
        avisos.push('combineAsVariants: nombre sin formato propiedad=valor -> "' + n.name + '"');
      }
    });
    const set = crearNodo('COMPONENT_SET');
    padre.appendChild(set);
    nodos.forEach(n => set.appendChild(n));
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

// dispara la construcción igual que el botón de la interfaz
figma.ui.onmessage({ tipo: 'construir' });

setTimeout(() => {
  const informe = mensajesUI.filter(m => m.tipo === 'informe').pop();
  console.log('mensajes de progreso :', mensajesUI.filter(m => m.tipo === 'progreso').length);
  console.log('nodos creados        :', contadorId);
  console.log('hijos de la página   :', pagina.children.length);
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
    [...new Set(avisos)].slice(0, 12).forEach(a => console.log('  - ' + a));
  } else {
    console.log('\nsin avisos del simulador');
  }

  const fatal = informe.texto.indexOf('ERROR FATAL') === 0;
  process.exit(fatal ? 1 : 0);
}, 2500);
