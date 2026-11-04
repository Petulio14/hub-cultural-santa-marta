#!/usr/bin/env node
/**
 * Convierte un documento de «docs/» en un .docx para adjuntar al trabajo escrito.
 *
 *   node herramientas/a-word.js docs/anexo-d.md "Anexo D.docx" [diagrama.png ...]
 *
 * ## Por qué hay un conversor propio
 *
 * No hay pandoc ni LibreOffice en la máquina de desarrollo, y el documento que
 * se entrega tiene que salir del mismo Markdown que está versionado: cualquier
 * otra cosa es copiar y pegar, que es como se desincronizan las dos versiones.
 *
 * Entiende solo lo que estos documentos usan: títulos, párrafos con negrita,
 * cursiva, código y enlaces, citas, tablas, listas, imágenes, cercas de código y
 * reglas horizontales.
 *
 * Dos decisiones que no se ven leyendo el código:
 *
 * - **Los bloques «```mermaid» no se escriben como código.** En un documento
 *   técnico eso sería dejar el diagrama sin dibujar, así que se sustituyen por
 *   las imágenes que se pasen por la línea de órdenes. Se probó incrustar el SVG
 *   —sería vectorial— y Word no sirve: mermaid escribe las etiquetas dentro de
 *   «foreignObject», que es HTML metido en el SVG, y el motor de Word no lo
 *   pinta; las cajas salían negras y vacías.
 * - **Las columnas de una tabla no se reparten a partes iguales**, sino según lo
 *   que tiene que caber en cada una. Con el reparto simple, la columna del
 *   criterio de aceptación salía estrangulada en dos palabras por línea mientras
 *   la del número ocupaba lo mismo para un dígito.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, HeadingLevel, ImageRun, LevelFormat,
  PageOrientation, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const [ENTRADA, SALIDA, ...DIAGRAMAS] = process.argv.slice(2);

if (!ENTRADA || !SALIDA) {
  console.error('uso: node herramientas/a-word.js <entrada.md> <salida.docx> [diagrama.png ...]');
  process.exit(1);
}

/** Ancho útil de la caja de texto: carta (12240) menos dos márgenes de una pulgada. */
const ANCHO = 9360;
/** El mismo ancho en píxeles a 96 ppp, para las imágenes. */
const ANCHO_PX = 624;
/** Ancho mínimo de una columna: algo más de un centímetro. */
const COLUMNA_MINIMA = 620;

/** Tipo y medidas de una imagen, leyendo su cabecera. PNG y JPEG. */
function medirImagen(archivo) {
  const b = readFileSync(archivo);
  if (b[0] === 0x89 && b[1] === 0x50) {
    return { tipo: 'png', ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
  }
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const marca = b[i + 1];
    if (marca >= 0xc0 && marca <= 0xcf && marca !== 0xc4 && marca !== 0xc8 && marca !== 0xcc) {
      return { tipo: 'jpg', alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no se pudo medir ${archivo}`);
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function trozos(texto, base = {}) {
  const salida = [];
  for (const parte of texto.split(INLINE)) {
    if (!parte) continue;
    if (parte.startsWith('**') && parte.endsWith('**')) {
      salida.push(new TextRun({ ...base, text: parte.slice(2, -2), bold: true }));
    } else if (parte.startsWith('*') && parte.endsWith('*') && parte.length > 2) {
      salida.push(new TextRun({ ...base, text: parte.slice(1, -1), italics: true }));
    } else if (parte.startsWith('`') && parte.endsWith('`')) {
      salida.push(new TextRun({ ...base, text: parte.slice(1, -1), font: 'Consolas', size: 19 }));
    } else {
      const enlace = parte.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (enlace) {
        // Los enlaces relativos solo funcionan dentro de GitHub; en un .docx
        // suelto no apuntarían a nada, así que se convierten en absolutos.
        const destino = enlace[2].startsWith('http')
          ? enlace[2]
          : `https://github.com/Petulio14/hub-cultural-santa-marta/blob/master/docs/${enlace[2].replace(/^\.\.\//, '')}`;
        salida.push(new ExternalHyperlink({
          link: destino,
          children: [new TextRun({ ...base, text: enlace[1], style: 'Hyperlink' })],
        }));
      } else {
        salida.push(new TextRun({ ...base, text: parte }));
      }
    }
  }
  return salida.length ? salida : [new TextRun({ ...base, text: texto })];
}

const celdas = (fila) => fila.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const esSeparador = (fila) => /^\|[\s:|-]+\|$/.test(fila.trim());

/** Reparte el ancho entre las columnas según lo que tiene que caber en cada una. */
function repartir(columnas) {
  const pesos = columnas.map((textos) =>
    Math.min(Math.max(...textos.map((t) => (t ?? '').length), 4), 110)
  );
  const suma = pesos.reduce((a, b) => a + b, 0);
  const anchos = pesos.map((p) => Math.max(COLUMNA_MINIMA, Math.round((ANCHO * p) / suma)));

  // El mínimo y el redondeo descuadran el total: la diferencia se le quita a la
  // columna más ancha, que es la que menos lo nota.
  const sobra = anchos.reduce((a, b) => a + b, 0) - ANCHO;
  anchos[anchos.indexOf(Math.max(...anchos))] -= sobra;
  return anchos;
}

function tabla(filas) {
  const cabecera = celdas(filas[0]);
  const cuerpo = filas.slice(2).map(celdas);
  const anchos = repartir(cabecera.map((texto, i) => [texto, ...cuerpo.map((f) => f[i])]));

  const haceFila = (textos, encabezado) => new TableRow({
    tableHeader: encabezado,
    children: anchos.map((ancho, i) => new TableCell({
      width: { size: ancho, type: WidthType.DXA },
      shading: encabezado ? { type: ShadingType.CLEAR, fill: 'EDE7DC' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        spacing: { before: 0, after: 0 },
        children: trozos(textos[i] ?? '', encabezado ? { bold: true } : {}),
      })],
    })),
  });

  return new Table({
    columnWidths: anchos,
    width: { size: ANCHO, type: WidthType.DXA },
    rows: [haceFila(cabecera, true), ...cuerpo.map((f) => haceFila(f, false))],
  });
}

/* ── Recorrido del Markdown ─────────────────────────────────────────────── */

const lineas = readFileSync(ENTRADA, 'utf8').split(/\r?\n/);
const hijos = [];
let i = 0;
let imagenes = 0;
let tablas = 0;
let dibujados = 0;

while (i < lineas.length) {
  const l = lineas[i];
  if (!l.trim()) { i += 1; continue; }

  if (l.trim() === '---') {
    hijos.push(new Paragraph({
      spacing: { before: 200, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C8BFB2' } },
    }));
    i += 1;
    continue;
  }

  const titulo = l.match(/^(#{1,4})\s+(.*)$/);
  if (titulo) {
    const nivel = titulo[1].length;
    hijos.push(new Paragraph({
      heading: [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][nivel - 1],
      spacing: { before: nivel === 1 ? 0 : 320, after: 160 },
      children: trozos(titulo[2]),
    }));
    i += 1;
    continue;
  }

  const imagen = l.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
  if (imagen) {
    // La ruta viene codificada para que GitHub dibuje las imágenes cuyos
    // nombres llevan espacios y acentos; aquí hace falta la de verdad.
    const archivo = join(RAIZ, 'docs', decodeURI(imagen[2]));
    const { tipo, ancho, alto } = medirImagen(archivo);
    const escala = Math.min(1, ANCHO_PX / ancho);
    hijos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [new ImageRun({
        type: tipo,
        data: readFileSync(archivo),
        transformation: { width: Math.round(ancho * escala), height: Math.round(alto * escala) },
      })],
    }));
    imagenes += 1;
    i += 1;
    continue;
  }

  if (l.startsWith('```')) {
    const esMermaid = l.trim().toLowerCase().startsWith('```mermaid');
    i += 1;
    const dentro = [];
    while (i < lineas.length && !lineas[i].startsWith('```')) { dentro.push(lineas[i]); i += 1; }
    i += 1;

    if (esMermaid) {
      const archivo = DIAGRAMAS[dibujados];
      if (!archivo) throw new Error(`falta el dibujo del diagrama ${dibujados + 1}`);
      const { tipo, ancho, alto } = medirImagen(archivo);
      const escala = ANCHO_PX / ancho;
      hijos.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new ImageRun({
          type: tipo,
          data: readFileSync(archivo),
          transformation: { width: Math.round(ancho * escala), height: Math.round(alto * escala) },
        })],
      }));
      dibujados += 1;
      continue;
    }

    dentro.forEach((texto, n) => hijos.push(new Paragraph({
      spacing: { before: n === 0 ? 120 : 0, after: n === dentro.length - 1 ? 120 : 0 },
      shading: { type: ShadingType.CLEAR, fill: 'F4F1EB' },
      indent: { left: 240, right: 240 },
      children: [new TextRun({ text: texto || ' ', font: 'Consolas', size: 19 })],
    })));
    continue;
  }

  if (l.trim().startsWith('|') && esSeparador(lineas[i + 1] ?? '')) {
    const filas = [];
    while (i < lineas.length && lineas[i].trim().startsWith('|')) { filas.push(lineas[i]); i += 1; }
    hijos.push(tabla(filas));
    hijos.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    tablas += 1;
    continue;
  }

  if (l.startsWith('>')) {
    const dentro = [];
    while (i < lineas.length && lineas[i].startsWith('>')) { dentro.push(lineas[i].replace(/^>\s?/, '')); i += 1; }
    // Una línea que empieza en negrita abre párrafo; las demás continúan la
    // anterior. Es lo que distingue el bloque de cabecera de cada documento
    // —varios renglones, cada uno con su rótulo— de una cita larga partida a
    // los 100 caracteres.
    const parrafos = [];
    for (const linea of dentro) {
      if (!linea.trim()) continue;
      if (linea.startsWith('**') || parrafos.length === 0) parrafos.push(linea);
      else parrafos[parrafos.length - 1] += ` ${linea}`;
    }
    for (const texto of parrafos) {
      hijos.push(new Paragraph({
        indent: { left: 360 },
        spacing: { before: 120, after: 120 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: '0B3C5D', space: 12 } },
        children: trozos(texto.trim()),
      }));
    }
    continue;
  }

  const vineta = l.match(/^[-*]\s+(.*)$/);
  if (vineta) {
    hijos.push(new Paragraph({
      numbering: { reference: 'vinetas', level: 0 },
      spacing: { after: 60 },
      children: trozos(vineta[1]),
    }));
    i += 1;
    continue;
  }
  const numerada = l.match(/^(\d+)\.\s+(.*)$/);
  if (numerada) {
    hijos.push(new Paragraph({
      numbering: { reference: 'numeros', level: 0 },
      spacing: { after: 60 },
      children: trozos(numerada[2]),
    }));
    i += 1;
    continue;
  }

  // Párrafo: se junta hasta la línea en blanco, porque el Markdown parte las
  // líneas a los 100 caracteres y en Word eso serían saltos de verdad.
  const partes = [];
  while (
    i < lineas.length && lineas[i].trim() &&
    !/^(#{1,4}\s|!\[|>|\||```|---$)/.test(lineas[i].trim()) &&
    !/^[-*]\s/.test(lineas[i]) && !/^\d+\.\s/.test(lineas[i])
  ) { partes.push(lineas[i].trim()); i += 1; }

  const texto = partes.join(' ');
  const pie = /^\*[^*].*\*$/.test(texto);
  hijos.push(new Paragraph({
    spacing: { after: pie ? 240 : 120 },
    alignment: pie ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: trozos(pie ? texto.slice(1, -1) : texto, pie ? { italics: true, size: 19 } : {}),
  }));
}

const nivel = (formato, texto) => ({
  level: 0,
  format: formato,
  text: texto,
  alignment: AlignmentType.LEFT,
  style: { paragraph: { indent: { left: 540, hanging: 260 } } },
});

const documento = new Document({
  creator: 'Sebastian Rojas Gomez',
  title: basename(SALIDA, '.docx'),
  numbering: {
    config: [
      { reference: 'vinetas', levels: [nivel(LevelFormat.BULLET, '•')] },
      { reference: 'numeros', levels: [nivel(LevelFormat.DECIMAL, '%1.')] },
    ],
  },
  styles: { default: { document: { run: { font: 'Calibri', size: 22 }, paragraph: { spacing: { line: 288 } } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: hijos,
  }],
});

const bytes = await Packer.toBuffer(documento);
writeFileSync(SALIDA, bytes);
console.log(
  `Escrito ${SALIDA}\n  ${(bytes.length / 1024).toFixed(0)} KB · ${hijos.length} bloques · ` +
    `${imagenes} imagen(es) · ${dibujados} diagrama(s) · ${tablas} tablas`
);
