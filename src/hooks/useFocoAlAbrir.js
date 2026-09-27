import { useEffect, useRef } from 'react';

/**
 * Recoge el foco cuando un control se sustituye por lo que abre — HU-32.
 *
 * ## El defecto
 *
 * Hay cuatro sitios en el proyecto donde pulsar un botón **lo hace desaparecer**
 * y pone otra cosa en su lugar: «Eliminar» se convierte en la pregunta de
 * confirmación, «Editar» en el formulario de la publicación, «Renombrar» en los
 * dos campos de la categoría, y «Eliminar» de una categoría en su advertencia.
 *
 * Cuando el elemento que tiene el foco se desmonta, el navegador no lo pasa a lo
 * que vino después: lo devuelve a «body». Así que quien navega con teclado
 * pulsaba Intro y **perdía el sitio**, con el siguiente tabulador empezando otra
 * vez por la cabecera; y quien usa lector de pantalla no oía nada, porque lo
 * nuevo aparecía en una parte del documento donde su cursor ya no estaba.
 *
 * Es el segundo criterio de aceptación —«debe poderse completar la publicación
 * recorriéndola únicamente con teclado»— fallando en el momento exacto en que se
 * va a editar o a borrar.
 *
 * ## Qué se enfoca
 *
 * El elemento marcado con «data-foco-inicial», y si no lo hay, el primer control
 * enfocable de la región. La marca existe porque la respuesta correcta no es
 * siempre la primera: en una confirmación de borrado se enfoca **«Cancelar»**,
 * nunca el botón que borra. Poner el foco sobre una acción irreversible es dejar
 * que una tecla de más la ejecute, y es la misma razón por la que «Cancelar» va
 * primero en pantalla (ver la cabecera de «ConfirmacionDeBorrado.jsx»).
 *
 * No se atrapa el foco ni se bloquea nada. Ninguna de las cuatro regiones es
 * modal, y dos de ellas —las confirmaciones— están dentro de la tarjeta que se
 * va a borrar a propósito, para que se vea qué se decide. Un «diálogo» que
 * atrapa el foco sin tapar la pantalla confunde más de lo que ayuda.
 */
const ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocoAlAbrir(abierto) {
  const regionRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const region = regionRef.current;
    if (!region) return;

    const destino =
      region.querySelector('[data-foco-inicial]') ?? region.querySelector(ENFOCABLES);
    if (!destino) return;

    // Igual que en «useFocoEnElPrimerError»: sin animación, porque el
    // desplazamiento suave no llegó a desplazar nada cuando se midió
    // (docs/30 §2).
    destino.focus({ preventScroll: true });
    destino.scrollIntoView({ block: 'nearest' });
  }, [abierto]);

  return regionRef;
}
