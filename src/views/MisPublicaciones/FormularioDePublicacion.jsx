import { useState } from 'react';
import AreaDeTexto from '../../components/AreaDeTexto.jsx';
import Campo from '../../components/Campo.jsx';
import CampoDeImagen from '../../components/CampoDeImagen.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { desdeEntradaDeFecha } from '../../utils/fechas.js';
import { reducirImagen, validarArchivoDeImagen } from '../../utils/imagen.js';
import {
  LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION,
  hayErrores,
  validarPublicacion,
} from '../../utils/validaciones.js';
import UbicacionDeLaPublicacion from './UbicacionDeLaPublicacion.jsx';

/**
 * El formulario de una publicación — HU-21 · RF-05, ampliado en HU-22 · RF-08.
 *
 * Vive aparte de la vista porque la vista hace además otras dos cosas —decidir si
 * se puede publicar y listar lo publicado—, y porque HU-23 va a necesitar este
 * mismo formulario relleno para editar.
 *
 * Las dos fechas se guardan en el estado **como el texto que escribe el control**,
 * no como «Date». Un «datetime-local» es un campo controlado y necesita
 * exactamente «2026-09-01T18:00»; convertir a «Date» y volver a texto en cada
 * pulsación sería redondear una y otra vez lo que alguien está escribiendo, y
 * borraría el día a medio teclear. La conversión ocurre una sola vez, al validar.
 *
 * ## La advertencia de guardar sin punto — segundo criterio de HU-22
 *
 * «Debe advertirse que no aparecerá en el mapa» pide una advertencia, no una
 * prohibición: el modelo admite publicaciones sin coordenadas desde HU-21
 * (docs/04 §6), y las hay legítimas —un taller en línea, algo cuyo sitio aún no
 * está cerrado—.
 *
 * Una advertencia que no detiene nada no se lee: aparece junto al botón que se
 * acaba de pulsar, en el mismo instante en que la página cambia porque el envío
 * ya salió. Así que el primer envío **no guarda**: enseña el aviso y cambia el
 * texto del botón. El segundo guarda. Son dos pulsaciones en lugar de una para
 * quien de verdad no quiere poner punto, y ese es el precio de que la advertencia
 * exista de verdad y no solo en el código.
 */
const VACIO = {
  titulo: '',
  descripcion: '',
  categoria: '',
  fechaInicio: '',
  fechaFin: '',
  lugar: '',
  punto: null,
  imagen: null,
};

export default function FormularioDePublicacion({
  categorias,
  cargandoCategorias,
  alEnviar,
  guardando,
}) {
  const [formulario, setFormulario] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [reduciendo, setReduciendo] = useState(false);
  const [avisoSinPunto, setAvisoSinPunto] = useState(false);

  const escribir = (campo) => (valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  // Cambiar la fecha de inicio limpia también el error de la de fin: el mensaje
  // del orden invertido se pinta en la segunda, y quien corrige la primera
  // esperaría verlo desaparecer.
  const escribirInicio = (valor) => {
    setFormulario((actual) => ({ ...actual, fechaInicio: valor }));
    setErrores((actuales) => ({ ...actuales, fechaInicio: undefined, fechaFin: undefined }));
  };

  // Situar el punto retira el aviso: ya no queda nada de qué advertir, y dejarlo
  // puesto convertiría el botón en «publicar de todos modos» cuando ya no hay
  // ningún «modo» que salvar.
  const elegirPunto = (punto) => {
    setFormulario((actual) => ({ ...actual, punto }));
    setErrores((actuales) => ({ ...actuales, punto: undefined }));
    if (punto) setAvisoSinPunto(false);
  };

  async function elegirImagen(archivo) {
    const problema = validarArchivoDeImagen(archivo);
    setErrores((actuales) => ({ ...actuales, imagen: problema ?? undefined }));
    if (problema || !archivo) return;

    setReduciendo(true);
    try {
      setFormulario((actual) => ({ ...actual, imagen: null }));
      const reducida = await reducirImagen(archivo);
      setFormulario((actual) => ({ ...actual, imagen: reducida }));
    } catch (fallo) {
      setErrores((actuales) => ({
        ...actuales,
        imagen: fallo?.message ?? 'No se pudo preparar esa imagen. Prueba con otra.',
      }));
    } finally {
      setReduciendo(false);
    }
  }

  async function enviar(evento) {
    evento.preventDefault();

    const fechaInicio = desdeEntradaDeFecha(formulario.fechaInicio);
    const fechaFin = desdeEntradaDeFecha(formulario.fechaFin);

    const encontrados = validarPublicacion(
      { ...formulario, fechaInicio, fechaFin },
      categorias.map((categoria) => categoria.id)
    );
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    // Segundo criterio de HU-22. Va después de la validación a propósito: quien
    // tiene además el título vacío tiene que arreglar eso primero, y recibir las
    // dos cosas a la vez convertiría la advertencia en una más de la lista.
    if (!formulario.punto && !avisoSinPunto) {
      setAvisoSinPunto(true);
      return;
    }

    const creada = await alEnviar({ ...formulario, fechaInicio, fechaFin });

    // Solo se vacía si de verdad se guardó. Limpiar el formulario tras un fallo
    // de red haría perder un texto largo por un problema que no es de quien
    // escribe, y volver a escribirlo es exactamente lo que nadie hace.
    if (creada) {
      setFormulario(VACIO);
      setErrores({});
      setAvisoSinPunto(false);
    }
  }

  const sinCategorias = !cargandoCategorias && categorias.length === 0;

  return (
    <form className="publicacion__formulario" onSubmit={enviar} noValidate>
      <Campo
        etiqueta="Título"
        valor={formulario.titulo}
        alCambiar={escribir('titulo')}
        error={errores.titulo}
        ayuda="Lo primero que se lee en el catálogo. Por ejemplo: «Taller de tambora para principiantes»."
      />

      <Seleccion
        etiqueta="Categoría"
        valor={formulario.categoria}
        alCambiar={escribir('categoria')}
        opciones={categorias}
        vacia={cargandoCategorias ? 'Leyendo las categorías…' : 'Elige una categoría'}
        error={errores.categoria}
        ayuda="Clasifica la publicación dentro de los filtros del catálogo."
        disabled={cargandoCategorias || sinCategorias}
      />

      <AreaDeTexto
        etiqueta="Descripción"
        valor={formulario.descripcion}
        alCambiar={escribir('descripcion')}
        maximo={LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION}
        error={errores.descripcion}
        ayuda="Qué va a pasar, para quién es, qué hace falta llevar y cuánto cuesta si tiene costo."
        filas={8}
      />

      <fieldset className="publicacion__fechas">
        <legend>Cuándo ocurre</legend>
        <p className="campo__ayuda">
          Con día y hora. Si dura un solo rato, la fecha de finalización es el mismo día a la
          hora en que termina.
        </p>

        <Campo
          etiqueta="Empieza"
          tipo="datetime-local"
          valor={formulario.fechaInicio}
          alCambiar={escribirInicio}
          error={errores.fechaInicio}
        />
        <Campo
          etiqueta="Termina"
          tipo="datetime-local"
          valor={formulario.fechaFin}
          alCambiar={escribir('fechaFin')}
          error={errores.fechaFin}
        />
      </fieldset>

      <UbicacionDeLaPublicacion
        lugar={formulario.lugar}
        punto={formulario.punto}
        alCambiarLugar={escribir('lugar')}
        alElegirPunto={elegirPunto}
        errorDeLugar={errores.lugar}
        errorDePunto={errores.punto}
      />

      <CampoDeImagen
        imagen={formulario.imagen}
        nombre={formulario.titulo}
        alElegir={elegirImagen}
        alQuitar={() => {
          setFormulario((actual) => ({ ...actual, imagen: null }));
          setErrores((actuales) => ({ ...actuales, imagen: undefined }));
        }}
        error={errores.imagen}
        ocupado={reduciendo}
      />

      {avisoSinPunto && (
        <p className="publicacion__aviso-sin-punto" role="alert">
          No has situado la publicación en el mapa, así que{' '}
          <strong>no aparecerá entre los puntos del mapa cultural</strong> y quien busque por
          cercanía no la encontrará. Sí saldrá en el catálogo y en las búsquedas por texto.
          Puedes situarla arriba, o publicarla así y añadir el punto más adelante.
        </p>
      )}

      <button className="boton" type="submit" disabled={guardando || reduciendo || sinCategorias}>
        {guardando
          ? 'Publicando…'
          : avisoSinPunto
            ? 'Publicar sin situarla en el mapa'
            : 'Enviar a revisión'}
      </button>
    </form>
  );
}
