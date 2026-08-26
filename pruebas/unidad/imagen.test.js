/**
 * Imagen del perfil — HU-19 · RF-03.
 *
 * Se prueba lo que decide si un archivo es aceptable y cómo hay que encogerlo.
 * Lo que dibuja en el lienzo necesita navegador y no se prueba aquí; lo que se
 * prueba es todo lo que ocurre **antes** de dibujar, que es donde están las
 * decisiones y por tanto donde están los errores.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  LADO_MAXIMO,
  LIMITE_ARCHIVO,
  LIMITE_GUARDADO,
  esGuardable,
  medidaReducida,
  pesoLegible,
  tieneFormaDeImagen,
  validarArchivoDeImagen,
} from '../../src/utils/imagen.js';

/** Un archivo como lo entrega el navegador, en lo que a estas funciones importa. */
const archivo = (cambios = {}) => ({
  name: 'tambora.jpg',
  type: 'image/jpeg',
  size: 800 * 1024,
  ...cambios,
});

describe('archivo elegido · formato y peso (HU-19, primer y segundo criterio)', () => {
  it('un JPG de menos de 2 MB se acepta', () => {
    assert.equal(validarArchivoDeImagen(archivo()), null);
  });

  it('un PNG también', () => {
    assert.equal(validarArchivoDeImagen(archivo({ type: 'image/png', name: 'logo.png' })), null);
  });

  it('acepta exactamente el máximo, que es el borde del criterio', () => {
    assert.equal(validarArchivoDeImagen(archivo({ size: LIMITE_ARCHIVO })), null);
  });

  it('un byte de más se rechaza', () => {
    assert.ok(validarArchivoDeImagen(archivo({ size: LIMITE_ARCHIVO + 1 })));
  });

  it('el rechazo por peso dice cuánto pesa y cuánto cabe', () => {
    const mensaje = validarArchivoDeImagen(archivo({ size: 3.4 * 1024 * 1024 }));
    assert.match(mensaje, /3,4 MB/);
    assert.match(mensaje, /2 MB/);
  });

  it('el rechazo por formato dice cuál era el formato', () => {
    const mensaje = validarArchivoDeImagen(archivo({ type: 'image/gif', name: 'baile.gif' }));
    assert.match(mensaje, /GIF/);
    assert.match(mensaje, /JPG o PNG/);
  });

  it('un archivo que no es imagen se rechaza sin fingir que conoce el formato', () => {
    const mensaje = validarArchivoDeImagen({ name: 'contrato', type: '', size: 100 });
    assert.match(mensaje, /no es una imagen/);
  });

  it('deduce el formato del nombre cuando el navegador no lo declara', () => {
    // Ocurre con extensiones que el sistema no reconoce: «type» llega vacío.
    const mensaje = validarArchivoDeImagen({ name: 'foto.heic', type: '', size: 100 });
    assert.match(mensaje, /HEIC/);
  });

  it('un archivo vacío se rechaza: no es una imagen, es un archivo roto', () => {
    assert.match(validarArchivoDeImagen(archivo({ size: 0 })), /vacío/);
  });

  it('no elegir imagen NO es un error: el perfil sin ella usa la predeterminada', () => {
    assert.equal(validarArchivoDeImagen(null), null);
    assert.equal(validarArchivoDeImagen(undefined), null);
  });
});

describe('peso legible', () => {
  it('usa la unidad que se entiende de un vistazo', () => {
    assert.equal(pesoLegible(512), '512 bytes');
    assert.equal(pesoLegible(120000), '117 KB');
    assert.equal(pesoLegible(2 * 1024 * 1024), '2 MB');
  });

  it('escribe la coma decimal del español, no el punto', () => {
    assert.equal(pesoLegible(3.4 * 1024 * 1024), '3,4 MB');
  });
});

describe('lo que se guarda · el límite del documento', () => {
  it('una imagen reducida cabe', () => {
    assert.equal(esGuardable(`data:image/jpeg;base64,${'a'.repeat(50000)}`), true);
  });

  it('acepta exactamente un carácter por debajo del límite', () => {
    assert.equal(esGuardable('a'.repeat(LIMITE_GUARDADO - 1)), true);
  });

  it('el límite mismo NO cabe: la regla exige «menor que»', () => {
    assert.equal(esGuardable('a'.repeat(LIMITE_GUARDADO)), false);
  });

  it('una cadena vacía no es una imagen guardable', () => {
    assert.equal(esGuardable(''), false);
    assert.equal(esGuardable(null), false);
  });

  it('el límite es el mismo que imponen las reglas de seguridad', () => {
    // firestore.rules exige «imagen.size() < 120000» en actoresCulturales. Si
    // los dos números dejan de coincidir, el navegador daría por buena una
    // imagen que el servidor rechaza, y el error llegaría sin explicación.
    const reglas = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
    const tope = `imagen.size() < ${LIMITE_GUARDADO}`;
    assert.ok(reglas.includes(tope), `firestore.rules ya no exige «${tope}»`);
  });
});

describe('forma de la URI de datos', () => {
  it('reconoce las dos que admiten las reglas', () => {
    assert.equal(tieneFormaDeImagen('data:image/jpeg;base64,AAAA'), true);
    assert.equal(tieneFormaDeImagen('data:image/png;base64,AAAA'), true);
  });

  it('rechaza un formato que la regla no admite', () => {
    assert.equal(tieneFormaDeImagen('data:image/gif;base64,AAAA'), false);
    assert.equal(tieneFormaDeImagen('data:image/svg+xml;base64,AAAA'), false);
  });

  it('rechaza una dirección que no es una URI de datos', () => {
    // Es lo que habría guardado la versión con Firebase Storage. Si un día
    // vuelve, este caso es el que hay que cambiar (docs/03 §6.1).
    assert.equal(tieneFormaDeImagen('https://ejemplo.co/foto.jpg'), false);
  });

  it('rechaza texto que solo se le parece', () => {
    assert.equal(tieneFormaDeImagen('data:image/jpeg,AAAA'), false);
    assert.equal(tieneFormaDeImagen('AAAA'), false);
  });
});

describe('medida de la imagen reducida', () => {
  it('encoge el lado mayor hasta el máximo y conserva la proporción', () => {
    assert.deepEqual(medidaReducida(4000, 3000), { ancho: 480, alto: 360 });
    assert.deepEqual(medidaReducida(3000, 4000), { ancho: 360, alto: 480 });
  });

  it('una imagen pequeña NO se agranda', () => {
    // Estirarla no añade un solo detalle y multiplica lo que pesa.
    assert.deepEqual(medidaReducida(200, 150), { ancho: 200, alto: 150 });
  });

  it('deja intacta la que mide justo el máximo', () => {
    assert.deepEqual(medidaReducida(LADO_MAXIMO, 300), { ancho: LADO_MAXIMO, alto: 300 });
  });

  it('una panorámica extrema no se queda en cero píxeles de alto', () => {
    // 5000 × 20 daría 480 × 1,92, y redondear hacia abajo dejaría un lienzo de
    // altura cero, que no se puede dibujar.
    const medida = medidaReducida(5000, 20);
    assert.equal(medida.ancho, 480);
    assert.ok(medida.alto >= 1);
  });
});
