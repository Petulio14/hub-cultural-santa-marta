/**
 * Los cuatro accesos principales de la página de inicio y del menú de
 * navegación (primer criterio de aceptación de HU-09). La cabecera y el inicio
 * los leen de aquí: si mañana cambia uno, no puede quedar distinto en un sitio.
 *
 * Están en su propio archivo y no dentro de «rutas.jsx» para no crear un ciclo
 * de importaciones entre el enrutador y los componentes que él mismo renderiza.
 * Es un dato de navegación, no una ruta.
 *
 * Las descripciones son preguntas, y en español una pregunta se abre y se
 * cierra: «¿» y «?». Las tres primeras ya lo eran y les faltaban los signos.
 *
 * La de «Hubs» era la única que no preguntaba nada —«Espacios de
 * innovación»— y por eso se reescribe: con una afirmación en medio, las cuatro
 * tarjetas no se leen como una lista. Ahora las cuatro empiezan por un
 * interrogativo distinto —qué, quién, dónde, qué— y lo que ofrece cada acceso
 * se lee de un vistazo en lugar de descifrarse.
 */
export const ACCESOS_PRINCIPALES = [
  { a: '/eventos', nombre: 'Eventos', descripcion: '¿Qué pasa y cuándo?' },
  { a: '/actores', nombre: 'Actores culturales', descripcion: '¿Quién está detrás?' },
  { a: '/hubs', nombre: 'Hubs', descripcion: '¿Dónde se innova?' },
  { a: '/mapa', nombre: 'Mapa', descripcion: '¿Qué hay cerca de ti?' },
];
