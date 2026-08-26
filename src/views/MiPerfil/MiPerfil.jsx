import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AreaDeTexto from '../../components/AreaDeTexto.jsx';
import Campo from '../../components/Campo.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { useMiPerfilDeActor } from '../../hooks/useMiPerfilDeActor.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { guardarMiPerfil } from '../../services/actoresService.js';
import {
  LONGITUD_MAXIMA_DESCRIPCION_ACTOR,
  hayErrores,
  validarPerfilDeActor,
} from '../../utils/validaciones.js';
import './MiPerfil.css';

/**
 * V-4 en su cara privada — HU-18 · RF-03, RF-06, RF-12.
 *
 * La misma vista sirve para crear el perfil y para editarlo: son la misma
 * pantalla con el mismo formulario, y separarlas en dos rutas obligaría a
 * decidir a cuál llevar a alguien antes de saber si ya tiene perfil.
 *
 * No estaba en el inventario del prototipo. V-4 se describe allí como «público
 * (lectura) / privado (edición)», pero la edición necesita una dirección propia
 * por un motivo que el prototipo no podía prever: quien todavía no tiene perfil
 * no tiene tampoco un «/actores/:id» al que ir. Es la misma razón por la que
 * HU-16 añadió «/politica-de-datos» (docs/17 §3).
 *
 * La imagen del perfil llega en HU-19; hasta entonces el formulario no la pide.
 */
const FORMULARIO_VACIO = {
  nombre: '',
  manifestacion: '',
  descripcion: '',
  categoria: '',
  contacto: { telefono: '', whatsapp: '', correo: '' },
};

/** Qué significa cada estado para quien es dueño del perfil. */
const TEXTO_POR_ESTADO = {
  pendiente:
    'Tu perfil está guardado y esperando la revisión del administrador. Todavía no aparece en el directorio público, pero puedes seguir editándolo: los cambios se guardan sin reiniciar la revisión.',
  aprobado:
    'Tu perfil está publicado. Cualquier persona puede encontrarlo en el directorio, y lo que edites aquí se ve al instante sin volver a pasar por aprobación.',
  inactivo:
    'El administrador retiró tu perfil del directorio público. Puedes seguir editándolo; escríbele si necesitas saber el motivo.',
};

export default function MiPerfil() {
  const { usuario } = useSesion();
  const uid = usuario?.uid ?? null;

  const { perfil, cargando, error, aplicar } = useMiPerfilDeActor(uid);
  const { categorias, cargando: cargandoCategorias } = useCategoriasActivas();

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // El formulario se rellena cuando llega el perfil, no en cada renderizado: a
  // partir de ahí lo que hay escrito en pantalla es de quien está escribiendo.
  useEffect(() => {
    if (!perfil) return;
    setFormulario({
      nombre: perfil.nombre,
      manifestacion: perfil.manifestacion,
      descripcion: perfil.descripcion,
      categoria: perfil.categoria,
      contacto: {
        telefono: perfil.contacto.telefono ?? '',
        whatsapp: perfil.contacto.whatsapp ?? '',
        correo: perfil.contacto.correo ?? '',
      },
    });
  }, [perfil]);

  const escribir = (campo) => (valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  const escribirContacto = (canal) => (valor) => {
    setFormulario((actual) => ({
      ...actual,
      contacto: { ...actual.contacto, [canal]: valor },
    }));
    setErrores((actuales) => ({
      ...actuales,
      contacto: undefined,
      [`contacto.${canal}`]: undefined,
    }));
  };

  async function guardar(evento) {
    evento.preventDefault();

    const encontrados = validarPerfilDeActor(
      formulario,
      categorias.map((categoria) => categoria.id)
    );
    setErrores(encontrados);
    if (hayErrores(encontrados)) {
      setAviso({ tipo: 'error', texto: 'Revisa los campos señalados: el perfil no se guardó.' });
      return;
    }

    setGuardando(true);
    setAviso(null);
    try {
      const guardado = await guardarMiPerfil(uid, formulario);
      aplicar(guardado);
      setAviso({
        tipo: 'exito',
        texto: perfil
          ? 'Cambios guardados. Ya se ven en tu perfil público.'
          : 'Perfil creado. Queda a la espera de que el administrador lo apruebe.',
      });
    } catch (fallo) {
      setAviso({
        tipo: 'error',
        texto:
          fallo?.message ??
          'No se pudo guardar el perfil. Revisa la conexión e inténtalo de nuevo.',
      });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section className="contenedor mi-perfil">
        <h1>Mi perfil de actor cultural</h1>
        <p>Leyendo tu perfil…</p>
      </section>
    );
  }

  const sinCategorias = !cargandoCategorias && categorias.length === 0;

  return (
    <section className="contenedor mi-perfil">
      <h1>Mi perfil de actor cultural</h1>

      <p className="mi-perfil__intro">
        Es lo que va a leer quien te encuentre en la plataforma antes de contactarte. Describe
        quién eres y qué manifestación representas.
      </p>

      {error && (
        <p className="mi-perfil__aviso mi-perfil__aviso--error" role="alert">
          {error}
        </p>
      )}

      {perfil && (
        <p className={`mi-perfil__estado mi-perfil__estado--${perfil.estado}`}>
          {TEXTO_POR_ESTADO[perfil.estado]}
        </p>
      )}

      {perfil?.estado === 'aprobado' && (
        <p>
          <Link to={`/actores/${perfil.id}`}>Ver mi perfil como lo ve un visitante</Link>
        </p>
      )}

      {aviso && (
        <p
          className={
            aviso.tipo === 'error'
              ? 'mi-perfil__aviso mi-perfil__aviso--error'
              : 'mi-perfil__aviso'
          }
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      {sinCategorias && (
        <p className="mi-perfil__aviso mi-perfil__aviso--error" role="alert">
          Todavía no hay ninguna categoría cultural disponible. El administrador tiene que crear
          al menos una antes de que puedas guardar tu perfil.
        </p>
      )}

      <form className="mi-perfil__formulario" onSubmit={guardar} noValidate>
        <Campo
          etiqueta="Nombre del actor o del colectivo"
          valor={formulario.nombre}
          alCambiar={escribir('nombre')}
          error={errores.nombre}
          ayuda="Como quieres que te nombren en el directorio."
          autoComplete="organization"
        />

        <Campo
          etiqueta="Manifestación cultural"
          valor={formulario.manifestacion}
          alCambiar={escribir('manifestacion')}
          error={errores.manifestacion}
          ayuda="Qué práctica sostienes. Por ejemplo: tambora, cocina tradicional, tejido en fique."
        />

        <Seleccion
          etiqueta="Categoría"
          valor={formulario.categoria}
          alCambiar={escribir('categoria')}
          opciones={categorias}
          vacia={cargandoCategorias ? 'Leyendo las categorías…' : 'Elige una categoría'}
          error={errores.categoria}
          ayuda="Clasifica tu perfil dentro del directorio y de los filtros del catálogo."
          disabled={cargandoCategorias || sinCategorias}
        />

        <AreaDeTexto
          etiqueta="Descripción"
          valor={formulario.descripcion}
          alCambiar={escribir('descripcion')}
          maximo={LONGITUD_MAXIMA_DESCRIPCION_ACTOR}
          error={errores.descripcion}
          ayuda="Cuenta el valor de tu propuesta: qué haces, desde cuándo y con quién."
          filas={8}
        />

        <fieldset className="mi-perfil__contacto">
          <legend>Cómo te pueden contactar</legend>
          <p className="campo__ayuda">
            Basta con uno de los tres. Lo que escribas aquí es público: escribe solo los canales
            que quieras publicar (
            <Link to="/politica-de-datos">política de tratamiento de datos</Link>).
          </p>

          {errores.contacto && (
            <p className="campo__error" role="alert">
              {errores.contacto}
            </p>
          )}

          <Campo
            etiqueta="Teléfono"
            tipo="tel"
            valor={formulario.contacto.telefono}
            alCambiar={escribirContacto('telefono')}
            error={errores['contacto.telefono']}
            requerido={false}
            autoComplete="tel"
          />
          <Campo
            etiqueta="WhatsApp"
            tipo="tel"
            valor={formulario.contacto.whatsapp}
            alCambiar={escribirContacto('whatsapp')}
            error={errores['contacto.whatsapp']}
            requerido={false}
          />
          <Campo
            etiqueta="Correo de contacto"
            tipo="email"
            valor={formulario.contacto.correo}
            alCambiar={escribirContacto('correo')}
            error={errores['contacto.correo']}
            requerido={false}
            ayuda="Puede ser distinto del correo con el que entras a la plataforma."
            autoComplete="email"
          />
        </fieldset>

        <button className="boton" type="submit" disabled={guardando || sinCategorias}>
          {guardando ? 'Guardando…' : perfil ? 'Guardar cambios' : 'Crear mi perfil'}
        </button>
      </form>
    </section>
  );
}
