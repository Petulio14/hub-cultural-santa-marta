import { paraEntradaDeFecha } from './fechas.js';

/**
 * Una publicación guardada, vista como los valores de su formulario — HU-23 · RF-06.
 *
 * Esto existe por una razón concreta y no por ordenar: **es aquí donde puede
 * volver el defecto de las fechas de HU-21**. Una publicación guardada trae
 * `Date`; el control «datetime-local» necesita el texto `2026-09-01T19:00`, y la
 * conversión ingenua —`toISOString().slice(0, 16)`— devuelve la hora en UTC. En
 * Santa Marta eso adelanta cinco horas: un evento de las siete de la tarde se
 * abriría a editar como si fuera de medianoche del día siguiente, y quien
 * guardara sin mirar el reloj movería su propio evento un día.
 *
 * Lo grave es que **el formulario no se quejaría**: las dos fechas seguirían
 * siendo coherentes entre sí, así que ninguna validación lo vería. Solo lo ve
 * una prueba, y por eso esta función vive en «utils» y no dentro de la vista
 * (CLAUDE.md).
 *
 * El molde vacío está al lado a propósito. Si el formulario declarase sus campos
 * por su cuenta y esta función los declarase aquí, los dos se irían separando en
 * cuanto la publicación ganara un campo: uno se rellenaría y el otro no.
 */
export const PUBLICACION_VACIA = {
  titulo: '',
  descripcion: '',
  categoria: '',
  fechaInicio: '',
  fechaFin: '',
  lugar: '',
  punto: null,
  imagen: null,
};

export function valoresDeFormulario(publicacion) {
  if (!publicacion) return { ...PUBLICACION_VACIA };

  return {
    titulo: publicacion.titulo ?? '',
    descripcion: publicacion.descripcion ?? '',
    categoria: publicacion.categoria ?? '',
    fechaInicio: paraEntradaDeFecha(publicacion.fechaInicio),
    fechaFin: paraEntradaDeFecha(publicacion.fechaFin),
    lugar: publicacion.lugar ?? '',
    punto: publicacion.punto ?? null,
    imagen: publicacion.imagen ?? null,
  };
}
