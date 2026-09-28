/**
 * El cálculo de la System Usability Scale — HU-36 · RNF-01.
 *
 * Funciones puras, sin dependencias: se comprueban con «npm run probar», igual
 * que las de «src/utils/». Viven aquí y no en «src/» porque la aplicación no las
 * usa: son del instrumento de medida, no del producto.
 *
 * ## Por qué esto es código y no una hoja de cálculo
 *
 * El SUS tiene una aritmética pequeña y traicionera: **los diez ítems no se
 * suman igual**. Los impares están redactados en positivo y aportan «respuesta
 * menos uno»; los pares están redactados en negativo y aportan «cinco menos
 * respuesta». Luego la suma se multiplica por 2,5 para llevarla a una escala de
 * 0 a 100.
 *
 * Esa alternancia es deliberada —obliga a leer cada frase en lugar de marcar
 * toda una columna— y es justo donde se equivoca quien lo calcula a mano. Una
 * hoja de cálculo con la fórmula mal puesta da un número perfectamente creíble,
 * y un puntaje de usabilidad mal calculado no se nota mirándolo.
 *
 * Por eso hay casos de prueba con los valores que el instrumento permite
 * verificar por construcción: todo «muy de acuerdo» en los impares y todo «muy
 * en desacuerdo» en los pares da exactamente 100; lo contrario da 0; y el punto
 * medio da 50.
 *
 * Brooke, J. (1996). *SUS: A quick and dirty usability scale.*
 */

/** El instrumento tiene diez ítems, ni uno más ni uno menos. */
export const CUANTOS_ITEMS = 10;

/** La escala de Likert del SUS: de «muy en desacuerdo» a «muy de acuerdo». */
export const MINIMO = 1;
export const MAXIMO = 5;

/**
 * El umbral del tercer criterio de aceptación de HU-36.
 *
 * 68 no es un número redondo elegido por gusto: es el promedio de los estudios
 * publicados con el instrumento, de modo que un puntaje por debajo no significa
 * «malo en abstracto», significa «por debajo de lo corriente».
 */
export const UMBRAL = 68;

/**
 * Los diez ítems, en el orden del instrumento. La alternancia positivo/negativo
 * es parte del método y no se puede reordenar sin romper el cálculo.
 */
export const ITEMS = [
  'Creo que usaría esta plataforma con frecuencia.',
  'Encontré la plataforma innecesariamente compleja.',
  'Me pareció fácil de usar.',
  'Creo que necesitaría el apoyo de alguien con conocimientos técnicos para poder usarla.',
  'Las funciones de la plataforma están bien integradas entre sí.',
  'Me pareció que había demasiada inconsistencia en la plataforma.',
  'Imagino que la mayoría de la gente aprendería a usarla muy rápido.',
  'Me resultó muy incómoda de usar.',
  'Me sentí seguro usándola.',
  'Necesité aprender muchas cosas antes de poder manejarme con la plataforma.',
];

/**
 * El puntaje de un participante, de 0 a 100.
 *
 * Recibe las diez respuestas en el orden de «ITEMS». Lanza si falta alguna o si
 * alguna está fuera de la escala: **un SUS incompleto no se estima**, porque
 * cada ítem vale 2,5 puntos y rellenar el que falta con la media inventaría
 * hasta dos puntos y medio de resultado.
 */
export function puntajeSUS(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== CUANTOS_ITEMS) {
    throw new Error(
      `Un SUS son ${CUANTOS_ITEMS} respuestas y llegaron ${respuestas?.length ?? 0}. No se estima el que falta.`
    );
  }

  let suma = 0;
  respuestas.forEach((respuesta, indice) => {
    if (!Number.isInteger(respuesta) || respuesta < MINIMO || respuesta > MAXIMO) {
      throw new Error(
        `La respuesta ${indice + 1} es «${respuesta}» y la escala va de ${MINIMO} a ${MAXIMO}.`
      );
    }
    // Los ítems impares del instrumento —índices pares de la lista— son los
    // redactados en positivo.
    const esPositivo = indice % 2 === 0;
    suma += esPositivo ? respuesta - MINIMO : MAXIMO - respuesta;
  });

  return suma * 2.5;
}

/**
 * El promedio de una tanda de sesiones.
 *
 * Devuelve también cuántas son, porque el criterio pide **al menos ocho** y un
 * promedio alto sobre tres participantes no cumple nada: con pocos, una sola
 * persona mueve el resultado más de diez puntos.
 */
export function resumirSUS(puntajes) {
  const lista = puntajes ?? [];
  if (lista.length === 0) {
    return { participantes: 0, promedio: null, minimo: null, maximo: null, superaUmbral: false };
  }

  const suma = lista.reduce((total, p) => total + p, 0);
  const promedio = suma / lista.length;

  return {
    participantes: lista.length,
    // A un decimal: el instrumento da múltiplos de 2,5, así que más decimales
    // serían precisión inventada por el promedio.
    promedio: Math.round(promedio * 10) / 10,
    minimo: Math.min(...lista),
    maximo: Math.max(...lista),
    superaUmbral: promedio >= UMBRAL,
  };
}

/**
 * Cuántas de las tareas guiadas se completaron sin asistencia.
 *
 * Es el otro número del segundo criterio, y no se mezcla con el SUS a
 * propósito: el SUS mide lo que la persona **opina** después, y esto mide lo que
 * **logró** mientras. Un participante puede completar todas las tareas y aun así
 * puntuar bajo porque le costó, y eso es información, no ruido.
 */
export function resumirTareas(sesiones) {
  const intentos = [];
  for (const sesion of sesiones ?? []) {
    for (const tarea of sesion.tareas ?? []) {
      intentos.push({ id: tarea.id, completada: tarea.completada === true, segundos: tarea.segundos });
    }
  }

  if (intentos.length === 0) return { intentos: 0, completadas: 0, tasa: null, porTarea: {} };

  const porTarea = {};
  for (const intento of intentos) {
    const fila = (porTarea[intento.id] ??= { intentos: 0, completadas: 0, segundos: [] });
    fila.intentos += 1;
    if (intento.completada) fila.completadas += 1;
    if (typeof intento.segundos === 'number') fila.segundos.push(intento.segundos);
  }

  for (const fila of Object.values(porTarea)) {
    // La mediana y no el promedio: con ocho participantes, uno que se distraiga
    // dos minutos mueve el promedio de una tarea de treinta segundos.
    fila.medianaSegundos = mediana(fila.segundos);
    delete fila.segundos;
  }

  const completadas = intentos.filter((i) => i.completada).length;
  return {
    intentos: intentos.length,
    completadas,
    tasa: Math.round((completadas / intentos.length) * 1000) / 10,
    porTarea,
  };
}

function mediana(numeros) {
  if (numeros.length === 0) return null;
  const orden = [...numeros].sort((a, b) => a - b);
  const medio = Math.floor(orden.length / 2);
  return orden.length % 2 === 1 ? orden[medio] : (orden[medio - 1] + orden[medio]) / 2;
}
