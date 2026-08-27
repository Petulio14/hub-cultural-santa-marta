import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { useMiPerfilDeActor } from '../../hooks/useMiPerfilDeActor.js';
import { useMisPublicaciones } from '../../hooks/useMisPublicaciones.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { actualizarPunto, crearPublicacion } from '../../services/eventosService.js';
import FormularioDePublicacion from './FormularioDePublicacion.jsx';
import TarjetaDePublicacion from './TarjetaDePublicacion.jsx';
import './MisPublicaciones.css';

/**
 * V-9 · Mis publicaciones — HU-21 · RF-05, RF-07.
 *
 * Tres cosas en una página: si se puede publicar, el formulario para hacerlo y lo
 * que ya se envió. HU-23 añadirá aquí editar y eliminar; el formulario ya vive
 * aparte para que entonces solo haya que rellenarlo.
 *
 * **La puerta cerrada.** Publicar exige tener perfil de actor: la regla pide que
 * «idActor» sea de un documento de «actoresCulturales» que sea tuyo, y quien no
 * lo ha creado no tiene ninguno. Sin este aviso, el formulario se enviaría y
 * volvería un «permission-denied» que no explica nada —el error diría que no
 * tienes permiso, cuando lo que pasa es que te falta un paso previo—. Es la misma
 * razón por la que un actor aterriza en «/mi-perfil» al iniciar sesión y no aquí
 * (src/routes/roles.js).
 */
export default function MisPublicaciones() {
  const { usuario } = useSesion();
  const uid = usuario?.uid ?? null;

  const { perfil, cargando: cargandoPerfil } = useMiPerfilDeActor(uid);
  const idActor = perfil?.id ?? null;

  const { publicaciones, cargando, error, anadir, reemplazar } = useMisPublicaciones(idActor);
  const { categorias, cargando: cargandoCategorias } = useCategoriasActivas();

  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);

  /**
   * Devuelve la publicación creada, o null si no se pudo.
   *
   * Ese valor de vuelta es lo que el formulario usa para decidir si se vacía. Un
   * «void» obligaría a vaciarlo siempre o nunca, y ninguna de las dos cosas es lo
   * correcto cuando falla la red.
   */
  async function publicar(datos) {
    setGuardando(true);
    setAviso(null);
    try {
      const creada = await crearPublicacion(idActor, datos);
      anadir(creada);
      setAviso({
        tipo: 'exito',
        texto: `«${creada.titulo}» quedó enviada a revisión. Aparecerá en el catálogo cuando el administrador la apruebe.`,
      });
      return creada;
    } catch (fallo) {
      setAviso({
        tipo: 'error',
        texto:
          fallo?.message ??
          'No se pudo guardar la publicación. Revisa la conexión e inténtalo de nuevo.',
      });
      return null;
    } finally {
      setGuardando(false);
    }
  }

  /**
   * Guarda el punto de una publicación ya creada — HU-22, tercer criterio.
   *
   * A diferencia de «publicar», este **deja escapar el error** en lugar de
   * pintarlo arriba: el mapa que lo provocó está dentro de una tarjeta, puede
   * quedar a varias pantallas del aviso general, y un mensaje que no se ve no
   * avisa de nada. Lo recoge «EditorDePunto» y lo enseña junto a su mapa.
   */
  async function guardarPunto(idEvento, punto) {
    const actualizada = await actualizarPunto(idEvento, punto);
    reemplazar(actualizada);
    setAviso({
      tipo: 'exito',
      texto: punto
        ? `«${actualizada.titulo}» quedó situada en el mapa.`
        : `«${actualizada.titulo}» ya no tiene punto: dejará de aparecer en el mapa.`,
    });
  }

  if (cargandoPerfil) {
    return (
      <section className="contenedor mis-publicaciones">
        <h1>Mis publicaciones</h1>
        <p>Comprobando tu perfil…</p>
      </section>
    );
  }

  if (!perfil) {
    return (
      <section className="contenedor mis-publicaciones">
        <h1>Mis publicaciones</h1>
        <p className="mis-publicaciones__aviso mis-publicaciones__aviso--error">
          Antes de publicar necesitas tu perfil de actor cultural. Cada publicación queda
          firmada con él, y es lo que permite a quien la encuentre saber quién la organiza.
        </p>
        <p>
          <Link className="boton" to="/mi-perfil">
            Crear mi perfil
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="contenedor mis-publicaciones">
      <h1>Mis publicaciones</h1>

      <p className="mis-publicaciones__intro">
        Lo que publiques pasa por revisión antes de salir al catálogo. Mientras tanto lo ves
        aquí con su estado.
      </p>

      {aviso && (
        <p
          className={
            aviso.tipo === 'error'
              ? 'mis-publicaciones__aviso mis-publicaciones__aviso--error'
              : 'mis-publicaciones__aviso'
          }
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      <h2>Publicar algo nuevo</h2>
      <FormularioDePublicacion
        categorias={categorias}
        cargandoCategorias={cargandoCategorias}
        alEnviar={publicar}
        guardando={guardando}
      />

      <h2>Lo que ya enviaste</h2>

      {cargando && <p>Leyendo tus publicaciones…</p>}

      {error && (
        <p className="mis-publicaciones__aviso mis-publicaciones__aviso--error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && publicaciones.length === 0 && (
        <p className="mis-publicaciones__vacio">
          Todavía no has publicado nada. Lo que envíes aparecerá aquí con su estado de revisión.
        </p>
      )}

      {publicaciones.length > 0 && (
        <ul className="mis-publicaciones__lista">
          {publicaciones.map((publicacion) => (
            <TarjetaDePublicacion
              key={publicacion.id}
              publicacion={publicacion}
              alGuardarPunto={guardarPunto}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
