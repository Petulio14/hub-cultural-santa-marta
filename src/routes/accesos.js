/**
 * Los cuatro accesos principales de la página de inicio y del menú de
 * navegación (primer criterio de aceptación de HU-09). La cabecera y el inicio
 * los leen de aquí: si mañana cambia uno, no puede quedar distinto en un sitio.
 *
 * Están en su propio archivo y no dentro de «rutas.jsx» para no crear un ciclo
 * de importaciones entre el enrutador y los componentes que él mismo renderiza.
 * Es un dato de navegación, no una ruta.
 */
export const ACCESOS_PRINCIPALES = [
  { a: '/eventos', nombre: 'Eventos', descripcion: 'Qué pasa y cuándo' },
  { a: '/actores', nombre: 'Actores culturales', descripcion: 'Quién está detrás' },
  { a: '/hubs', nombre: 'Hubs', descripcion: 'Espacios de innovación' },
  { a: '/mapa', nombre: 'Mapa', descripcion: 'Qué hay cerca de ti' },
];
