/**
 * Carga progresiva del catálogo — HU-25 · RF-09.
 *
 * Funciones puras, comprobadas con «npm run probar». Están aquí y no dentro del
 * gancho por la misma razón que las fechas: un error de uno en la aritmética de
 * una página no se ve en pantalla —se ve una tarjeta de más o de menos, y las
 * dos parecen normales—, así que se prueba con números y no mirando.
 *
 * **Doce.** El tamaño de página no es redondo por casualidad: es el número que
 * nombra el tercer criterio de aceptación —«un catálogo con más de doce
 * elementos»— y además es divisible por uno, dos y tres, que son las columnas
 * que tiene la rejilla a 360, 768 y 1366 px (docs/10 §2). Ninguna página termina
 * en una fila coja.
 */

/** Lo que se enseña de una vez. El número del tercer criterio de HU-25. */
export const TAMANO_DE_PAGINA = 12;

/**
 * Cuántas publicaciones pide el mapa de HU-30 — que **no** pagina.
 *
 * Un mapa con la mitad de los marcadores no es medio mapa: es un mapa que
 * miente sobre dónde hay oferta cultural. Paginar ahí no tiene sentido, así que
 * se piden todas de una vez con un tope, igual que hace la búsqueda de HU-27.
 *
 * Vale doscientas, el mismo número que «TOPE_DE_BUSQUEDA», y aun así son dos
 * constantes y no una. No es duplicación por descuido: responden a criterios
 * distintos y pueden separarse sin que nadie tenga que averiguar a cuál de las
 * dos vistas le importaba el número. Lo que comparten hoy es la razón —una
 * consulta sin límite crece con el catálogo y cada documento se paga—, no el
 * valor.
 */
export const TOPE_DEL_MAPA = 200;

/**
 * Separa la página de la señal de que hay más.
 *
 * Se le piden al servidor **trece** para enseñar doce. Es la forma barata de
 * saber si queda algo detrás: la alternativa es una segunda consulta que cuente,
 * y contar en Firestore cuesta una lectura por documento contado.
 *
 * El de más no se enseña ni se conserva: se descarta y se vuelve a leer en la
 * página siguiente. Guardarlo ahorraría una lectura y costaría que el catálogo
 * enseñara trece elementos en la primera página y doce en las demás.
 */
export function partirPagina(leidos, tamano = TAMANO_DE_PAGINA) {
  const hayMas = leidos.length > tamano;
  return { pagina: hayMas ? leidos.slice(0, tamano) : leidos, hayMas };
}

/**
 * Añade una página a lo que ya se tiene, sin repetir.
 *
 * La repetición no es hipotética. El cursor apunta al último elemento leído, y
 * entre una página y la siguiente el catálogo puede haber cambiado: si el
 * administrador aprueba una publicación que cae antes del cursor, la segunda
 * consulta la devuelve otra vez. React avisaría con «two children with the same
 * key», pero el aviso sale en la consola y el visitante ve la tarjeta duplicada.
 *
 * Gana la que ya estaba: es la que la persona tiene delante, y sustituirla haría
 * parpadear una tarjeta que no ha cambiado.
 */
export function anadirPagina(actuales, nuevos) {
  const vistos = new Set(actuales.map((elemento) => elemento.id));
  return [...actuales, ...nuevos.filter((elemento) => !vistos.has(elemento.id))];
}
