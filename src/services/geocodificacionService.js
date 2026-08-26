/**
 * Dirección a coordenadas — HU-20 · RF-04, RF-09.
 *
 * Usa **Nominatim**, el buscador de OpenStreetMap. Es la contrapartida natural
 * de la decisión ya tomada para el mapa —Leaflet sobre OpenStreetMap, en
 * docs/03-arquitectura.md §6—: el mismo origen de datos para buscar un sitio y
 * para pintarlo, y sin costo, que es la restricción R-02.
 *
 * Es el único punto del proyecto que habla con un servicio externo distinto de
 * Firebase, y vive en «services» por lo mismo que los demás: una vista no sale a
 * la red por su cuenta (docs/03 §3).
 *
 * ## Lo que este buscador NO sabe hacer
 *
 * Se comprobó contra direcciones reales de Santa Marta antes de construir sobre
 * él, y el resultado condiciona toda la historia:
 *
 * | Consulta | Resultado |
 * | --- | --- |
 * | «Quinta de San Pedro Alejandrino, Santa Marta» | acierta |
 * | «Universidad del Magdalena, Santa Marta» | acierta |
 * | «Calle 22 # 1-40, Santa Marta» | encuentra la calle, no el número |
 * | «Carrera 1 con Calle 22, Santa Marta» | no encuentra nada |
 *
 * La nomenclatura colombiana de «carrera con calle» no está cartografiada. De
 * ahí la decisión de interfaz: **no se geocodifica en silencio al guardar**. Se
 * busca cuando la persona lo pide, se le enseña qué se encontró con su nombre
 * completo, y es ella quien confirma que ese es su sitio. Guardar unas
 * coordenadas que nadie ha visto sería poner un punto en el mapa a ciegas.
 *
 * ## Cortesía con un servicio gratuito
 *
 * La política de uso de Nominatim pide **como máximo una consulta por segundo** y
 * nada de búsquedas automáticas mientras se teclea. Por eso la búsqueda la
 * dispara un botón y no cada pulsación, y por eso hay un intervalo mínimo entre
 * dos consultas seguidas. No es una optimización: es la condición para poder
 * seguir usándolo.
 */

import { estaEnSantaMarta } from '../utils/coordenadas.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

/** Un segundo entre consultas, que es lo que pide la política de uso. */
const INTERVALO_MINIMO = 1100;

let ultimaConsulta = 0;

export class ErrorDeGeocodificacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeGeocodificacion';
  }
}

const esperar = (ms) => new Promise((seguir) => setTimeout(seguir, ms));

/**
 * Busca una dirección y devuelve hasta tres candidatos, cada uno con su nombre
 * completo y su punto. Devolver varios y no uno es deliberado: quien registra el
 * hub sabe cuál de los tres es el suyo, y el buscador no.
 *
 * Devuelve un arreglo vacío cuando no encuentra nada. No es un error —una
 * dirección puede no estar cartografiada, que es el caso más frecuente aquí—,
 * así que la vista lo trata como un resultado y no como un fallo.
 */
export async function buscarDireccion(direccion) {
  const consulta = (direccion ?? '').trim();
  if (consulta === '') return [];

  const desdeLaUltima = Date.now() - ultimaConsulta;
  if (desdeLaUltima < INTERVALO_MINIMO) await esperar(INTERVALO_MINIMO - desdeLaUltima);
  ultimaConsulta = Date.now();

  const url = new URL(NOMINATIM);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '3');
  // Colombia, y con Santa Marta añadido si quien escribe no lo puso: sin acotar,
  // «Calle 22» devuelve una calle 22 de cualquier parte del mundo.
  url.searchParams.set('countrycodes', 'co');
  url.searchParams.set(
    'q',
    /santa\s*marta/i.test(consulta) ? consulta : `${consulta}, Santa Marta, Magdalena`
  );

  let respuesta;
  try {
    respuesta = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  } catch {
    throw new ErrorDeGeocodificacion(
      'No se pudo consultar el buscador de direcciones. Revisa tu conexión e inténtalo de nuevo.'
    );
  }

  if (!respuesta.ok) {
    throw new ErrorDeGeocodificacion(
      'El buscador de direcciones no respondió. Inténtalo de nuevo en un minuto.'
    );
  }

  const encontrados = await respuesta.json();

  return encontrados
    .map((sitio) => ({
      nombre: sitio.display_name,
      lat: Number(sitio.lat),
      lon: Number(sitio.lon),
    }))
    .filter((sitio) => Number.isFinite(sitio.lat) && Number.isFinite(sitio.lon))
    .filter(estaEnSantaMarta);
}
