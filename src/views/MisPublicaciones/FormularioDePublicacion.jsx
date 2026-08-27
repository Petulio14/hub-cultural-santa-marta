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

/**
 * El formulario de una publicación — HU-21 · RF-05.
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
 */
const VACIO = {
  titulo: '',
  descripcion: '',
  categoria: '',
  fechaInicio: '',
  fechaFin: '',
  lugar: '',
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

    const creada = await alEnviar({ ...formulario, fechaInicio, fechaFin });

    // Solo se vacía si de verdad se guardó. Limpiar el formulario tras un fallo
    // de red haría perder un texto largo por un problema que no es de quien
    // escribe, y volver a escribirlo es exactamente lo que nadie hace.
    if (creada) {
      setFormulario(VACIO);
      setErrores({});
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

      <Campo
        etiqueta="Lugar"
        valor={formulario.lugar}
        alCambiar={escribir('lugar')}
        error={errores.lugar}
        ayuda="Dónde ocurre, escrito. Situarlo en el mapa llega después, en otra historia."
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

      <button className="boton" type="submit" disabled={guardando || reduciendo || sinCategorias}>
        {guardando ? 'Publicando…' : 'Enviar a revisión'}
      </button>
    </form>
  );
}
