import { useEffect, useRef } from 'react';
import { hayErrores } from '../utils/validaciones.js';

/**
 * Lleva el foco al primer campo señalado tras un envío rechazado — HU-31.
 *
 * Nació dentro de «Ingreso.jsx» en HU-12 y era el único formulario que lo hacía.
 * Los otros cinco marcaban el campo, escribían el mensaje debajo y dejaban el
 * foco en el botón. En los cortos daba igual; en «MiPerfil», «MiHub» y el
 * formulario de publicación el botón está detrás de una descripción de dos mil
 * caracteres y de un mapa, así que **el error aparecía fuera de la pantalla**:
 * quien pulsaba «Guardar» veía que no pasaba nada. El campo estaba señalado —el
 * primer criterio de aceptación se cumplía al pie de la letra— y aun así nadie
 * se enteraba.
 *
 * Se busca por «aria-invalid», que es lo que ya ponen «Campo», «AreaDeTexto» y
 * «Seleccion» al recibir un error. Buscar por clase habría atado el foco a la
 * hoja de estilos; buscar por nombre de campo habría obligado a cada formulario
 * a declarar su orden, que es justo el que el navegador ya conoce.
 *
 * Enfocar arrastra la pantalla hasta el campo por sí solo, y además dice a un
 * lector de pantalla dónde está el problema: el mensaje va enlazado con
 * «aria-describedby», así que se anuncia al recibir el foco sin necesidad de una
 * región viva.
 *
 * Devuelve la referencia que hay que poner en el «form».
 */
export function useFocoEnElPrimerError(errores) {
  const formularioRef = useRef(null);

  useEffect(() => {
    if (!hayErrores(errores)) return;
    const primero = formularioRef.current?.querySelector('[aria-invalid="true"]');
    if (!primero) return;

    // Dos llamadas y no una. «focus» ya arrastra la pantalla, pero deja el campo
    // asomando por el borde y el mensaje va **debajo**, así que se queda fuera:
    // centrar es lo que hace que se lea lo que hay que corregir.
    //
    // Sin «behavior: smooth», y no por gusto. La primera versión lo llevaba y en
    // el navegador de pruebas no desplazaba nada: el campo recibía el foco, la
    // pantalla se quedaba donde estaba y el efecto era exactamente el defecto
    // que esto viene a arreglar. Con el comportamiento predeterminado, medido en
    // la misma página, el desplazamiento pasó de 593 px a 40 px. Una animación
    // que a veces no ocurre es peor que no tenerla, y de paso desaparece la
    // pregunta por «prefers-reduced-motion»: sin animación no hay nada de lo que
    // librar a quien pidió que no se moviera nada.
    primero.focus({ preventScroll: true });
    primero.scrollIntoView({ block: 'center' });
  }, [errores]);

  return formularioRef;
}
