import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AreaDeTexto from '../../components/AreaDeTexto.jsx';
import Campo from '../../components/Campo.jsx';
import { useMiHub } from '../../hooks/useMiHub.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { guardarMiHub } from '../../services/hubsService.js';
import { aLineasDeTrabajo } from '../../utils/texto.js';
import {
  LONGITUD_MAXIMA_DESCRIPCION_ACTOR,
  MAXIMO_LINEAS_DE_TRABAJO,
  hayErrores,
  validarPerfilDeHub,
} from '../../utils/validaciones.js';
import BuscadorDeDireccion from './BuscadorDeDireccion.jsx';
import './MiHub.css';

/**
 * V-5 en su cara privada — HU-20 · RF-04, RF-09.
 *
 * Es el gemelo de «MiPerfil» para el rol de hub de innovación, y comparte con él
 * la forma: una sola pantalla que crea y edita, una ruta propia porque quien aún
 * no tiene hub no tiene identificador al que ir, y un estado que explica en qué
 * punto de la aprobación está.
 *
 * Lo propio de esta historia es la ubicación, que vive en
 * «BuscadorDeDireccion.jsx» con su razonamiento.
 */
const FORMULARIO_VACIO = {
  nombre: '',
  descripcion: '',
  lineasTexto: '',
  direccion: '',
  punto: null,
  contacto: { telefono: '', whatsapp: '', correo: '' },
};

const TEXTO_POR_ESTADO = {
  pendiente:
    'Tu hub está guardado y esperando la revisión del administrador. Todavía no aparece en el directorio público, pero puedes seguir editándolo: los cambios se guardan sin reiniciar la revisión.',
  aprobado:
    'Tu hub está publicado en el directorio. Lo que edites aquí se ve al instante, sin volver a pasar por aprobación.',
  inactivo:
    'El administrador retiró tu hub del directorio público. Puedes seguir editándolo; escríbele si necesitas saber el motivo.',
};

export default function MiHub() {
  const { usuario } = useSesion();
  const uid = usuario?.uid ?? null;

  const { hub, cargando, error, aplicar } = useMiHub(uid);

  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!hub) return;
    setFormulario({
      nombre: hub.nombre,
      descripcion: hub.descripcion,
      // La lista vuelve a texto para poder editarse en una sola caja, con el
      // mismo separador con el que se escribió.
      lineasTexto: hub.lineasDeTrabajo.join(', '),
      direccion: hub.direccion,
      punto: hub.punto,
      contacto: {
        telefono: hub.contacto.telefono ?? '',
        whatsapp: hub.contacto.whatsapp ?? '',
        correo: hub.contacto.correo ?? '',
      },
    });
  }, [hub]);

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

  // Se recalcula en cada renderizado a propósito: es lo que hace que el recuento
  // de líneas y el aviso de duplicadas aparezcan mientras se escribe.
  const lineasDeTrabajo = aLineasDeTrabajo(formulario.lineasTexto);

  async function guardar(evento) {
    evento.preventDefault();

    const datos = { ...formulario, lineasDeTrabajo };
    const encontrados = validarPerfilDeHub(datos);
    setErrores(encontrados);
    if (hayErrores(encontrados)) {
      setAviso({ tipo: 'error', texto: 'Revisa los campos señalados: el hub no se guardó.' });
      return;
    }

    setGuardando(true);
    setAviso(null);
    try {
      const guardado = await guardarMiHub(uid, datos);
      aplicar(guardado);
      setAviso({
        tipo: 'exito',
        texto: hub
          ? 'Cambios guardados.'
          : 'Hub registrado. Queda a la espera de que el administrador lo apruebe.',
      });
    } catch (fallo) {
      setAviso({
        tipo: 'error',
        texto:
          fallo?.message ?? 'No se pudo guardar el hub. Revisa la conexión e inténtalo de nuevo.',
      });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section className="contenedor mi-hub">
        <h1>Mi hub de innovación</h1>
        <p>Leyendo tu hub…</p>
      </section>
    );
  }

  return (
    <section className="contenedor mi-hub">
      <h1>Mi hub de innovación</h1>

      <p className="mi-hub__intro">
        Registra el espacio y sus líneas de trabajo para que los actores culturales y las
        entidades interesadas puedan encontrarte y articularse contigo.
      </p>

      {error && (
        <p className="mi-hub__aviso mi-hub__aviso--error" role="alert">
          {error}
        </p>
      )}

      {hub && (
        <p className={`mi-hub__estado mi-hub__estado--${hub.estado}`}>
          {TEXTO_POR_ESTADO[hub.estado]}
        </p>
      )}

      {hub?.estado === 'aprobado' && (
        <p>
          <Link to="/hubs">Ver el directorio como lo ve un visitante</Link>
        </p>
      )}

      {aviso && (
        <p
          className={
            aviso.tipo === 'error' ? 'mi-hub__aviso mi-hub__aviso--error' : 'mi-hub__aviso'
          }
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      <form className="mi-hub__formulario" onSubmit={guardar} noValidate>
        <Campo
          etiqueta="Nombre del hub"
          valor={formulario.nombre}
          alCambiar={escribir('nombre')}
          error={errores.nombre}
          ayuda="Como quieres que se te nombre en el directorio."
          autoComplete="organization"
        />

        <AreaDeTexto
          etiqueta="Descripción del espacio"
          valor={formulario.descripcion}
          alCambiar={escribir('descripcion')}
          maximo={LONGITUD_MAXIMA_DESCRIPCION_ACTOR}
          error={errores.descripcion}
          ayuda="Qué es el espacio, a quién acoge y qué se puede hacer allí."
          filas={7}
        />

        <AreaDeTexto
          etiqueta="Líneas de trabajo"
          valor={formulario.lineasTexto}
          alCambiar={escribir('lineasTexto')}
          error={errores.lineasDeTrabajo}
          ayuda={`Separadas por comas. Hasta ${MAXIMO_LINEAS_DE_TRABAJO}. Por ejemplo: emprendimiento, economía naranja, formación.`}
          filas={3}
        />

        {lineasDeTrabajo.length > 0 && (
          <p className="mi-hub__vista-lineas">
            {/* Se enseña cómo van a quedar antes de guardar: al separar por comas
                es fácil dejar una vacía o repetir una, y aquí se ve. */}
            Quedarán {lineasDeTrabajo.length}{' '}
            {lineasDeTrabajo.length === 1 ? 'línea' : 'líneas'}:{' '}
            <span className="mi-hub__lineas">
              {lineasDeTrabajo.map((linea) => (
                <span className="mi-hub__linea" key={linea}>
                  {linea}
                </span>
              ))}
            </span>
          </p>
        )}

        <BuscadorDeDireccion
          direccion={formulario.direccion}
          punto={formulario.punto}
          alCambiarDireccion={escribir('direccion')}
          alElegirPunto={(punto) => {
            setFormulario((actual) => ({ ...actual, punto }));
            setErrores((actuales) => ({ ...actuales, punto: undefined }));
          }}
          errorDeDireccion={errores.direccion}
          errorDePunto={errores.punto}
        />

        <fieldset className="mi-hub__contacto">
          <legend>Cómo te pueden contactar</legend>
          <p className="campo__ayuda">
            Basta con uno de los tres. Lo que escribas aquí es público (
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
            autoComplete="email"
          />
        </fieldset>

        <button className="boton" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : hub ? 'Guardar cambios' : 'Registrar mi hub'}
        </button>
      </form>
    </section>
  );
}
