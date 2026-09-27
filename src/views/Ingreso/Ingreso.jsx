import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Campo from '../../components/Campo.jsx';
import { useFocoEnElPrimerError } from '../../hooks/useFocoEnElPrimerError.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { destinoTrasIngresar } from '../../routes/roles.js';
import {
  ErrorDeCuenta,
  VERSION_POLITICA_DATOS,
  enviarCorreoDeRestablecimiento,
  iniciarSesion,
  registrarActorCultural,
} from '../../services/authService.js';
import {
  hayErrores,
  validarIngreso,
  validarRecuperacion,
  validarRegistro,
} from '../../utils/validaciones.js';
import './Ingreso.css';

/**
 * V-8 · Ingreso y registro — HU-12, HU-13, HU-14, HU-16.
 *
 * Las tres operaciones comparten vista porque comparten la duda de quien llega:
 * «¿ya tengo cuenta?, ¿me acuerdo de la contraseña?». Separarlas en tres
 * direcciones obliga a volver atrás al equivocarse; aquí se cambia de panel sin
 * perder el sitio, y el correo ya escrito se conserva al cambiar.
 *
 * La validación se hace en «utils/validaciones.js», que no sabe nada de React, y
 * el acceso a Firebase en «services/authService.js», que no sabe nada de esta
 * vista. Aquí solo queda el estado del formulario y qué se muestra.
 */
/** Los textos de cada modo, juntos: así se leen de una vez y no repartidos por el JSX. */
const TITULO = {
  ingreso: 'Inicia sesión',
  registro: 'Crea tu cuenta de actor cultural',
  recuperar: 'Recupera tu contraseña',
};

const INTRO = {
  ingreso: 'Entra con el correo y la contraseña con los que creaste tu cuenta.',
  registro:
    'Con una cuenta puedes publicar tus experiencias culturales y aparecer en el directorio de Santa Marta.',
  recuperar:
    'Escribe tu correo y te enviamos un enlace para definir una contraseña nueva. No necesitas recordar la anterior.',
};

const ENVIAR = {
  ingreso: 'Entrar',
  registro: 'Crear cuenta',
  recuperar: 'Enviar el enlace',
};

const FORMULARIO_VACIO = {
  nombre: '',
  correo: '',
  contrasena: '',
  confirmacion: '',
  consentimiento: false,
};

export default function Ingreso() {
  const { cargando, usuario, rol, aplicar } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [modo, setModo] = useState('ingreso');
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);

  // Tras un envío rechazado el foco va al primer campo con error. Estaba escrito
  // aquí desde HU-12 y era lo único que este formulario hacía y los otros cinco
  // no; en HU-31 salió a «useFocoEnElPrimerError» para que ninguno se lo pierda.
  const formularioRef = useFocoEnElPrimerError(errores);

  /*
   * El foco de la pestaña elegida con las flechas — HU-32.
   *
   * Un efecto y no «requestAnimationFrame», que era la primera versión. En una
   * pestaña de navegador que no está a la vista el navegador deja de servir
   * fotogramas, así que el foco se habría quedado esperando uno que no llega. Un
   * efecto corre tras el repintado siempre, mirando o sin mirar.
   */
  const pestanaPorEnfocar = useRef(null);
  useEffect(() => {
    const pedida = pestanaPorEnfocar.current;
    if (!pedida) return;
    pestanaPorEnfocar.current = null;
    const id = pedida === 'registro' ? 'pestana-registro' : 'pestana-ingreso';
    document.getElementById(id)?.focus();
  }, [modo]);

  const escribir = (campo) => (valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErrores(({ [campo]: _descartado, ...resto }) => resto);
  };

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setCorreoEnviado(false);
    setErrores({});
    setErrorGeneral(null);
    setFormulario((anterior) => ({ ...FORMULARIO_VACIO, correo: anterior.correo }));
  }

  /**
   * Las flechas cambian de pestaña — HU-32 · segundo criterio de aceptación.
   *
   * Inicio y Fin van con ellas en el patrón de ARIA, y con dos pestañas hacen lo
   * mismo que las flechas; se admiten igual porque quien las usa las usa en todas
   * partes y no tiene por qué saber cuántas pestañas hay.
   *
   * El foco se mueve a mano porque «cambiarModo» vuelve a pintar las dos
   * pestañas: la que se elige pasa a ser la única tabulable, y sin esto el foco
   * se quedaría en la que acaba de dejar de serlo.
   */
  function moverEntrePestanas(evento) {
    const teclas = {
      ArrowRight: 'siguiente',
      ArrowLeft: 'anterior',
      Home: 'ingreso',
      End: 'registro',
    };
    const gesto = teclas[evento.key];
    if (!gesto) return;

    evento.preventDefault();
    const destino =
      gesto === 'ingreso' || gesto === 'registro'
        ? gesto
        : modo === 'registro'
          ? 'ingreso'
          : 'registro';

    cambiarModo(destino);
    // El foco se pide aquí y se mueve en el efecto de abajo, tras el repintado:
    // en este instante la pestaña de destino todavía tiene «tabIndex» -1.
    pestanaPorEnfocar.current = destino;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrorGeneral(null);

    const validar = { registro: validarRegistro, ingreso: validarIngreso, recuperar: validarRecuperacion };
    const encontrados = validar[modo](formulario);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
      if (modo === 'recuperar') {
        await enviarCorreoDeRestablecimiento(formulario.correo);
        setCorreoEnviado(true);
        setEnviando(false);
        return;
      }

      const sesion =
        modo === 'registro'
          ? await registrarActorCultural(formulario)
          : await iniciarSesion(formulario);

      aplicar(sesion);
      const destino = ubicacion.state?.desde ?? destinoTrasIngresar(sesion.rol);
      navegar(destino, { replace: true });
    } catch (error) {
      const problema =
        error instanceof ErrorDeCuenta
          ? error
          : new ErrorDeCuenta('No se pudo completar la operación. Inténtalo de nuevo.');
      if (problema.campo) setErrores({ [problema.campo]: problema.message });
      else setErrorGeneral(problema.message);
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <section className="contenedor">
        <p>Comprobando la sesión…</p>
      </section>
    );
  }

  // Quien ya entró no vuelve a ver el formulario: va a donde iba.
  if (usuario) {
    return <Navigate to={ubicacion.state?.desde ?? destinoTrasIngresar(rol)} replace />;
  }

  const esRegistro = modo === 'registro';
  const esRecuperar = modo === 'recuperar';

  return (
    <section className="contenedor acceso">
      <div className="acceso__caja">
        {/*
            Las pestañas cumplen el patrón de ARIA entero desde HU-32.
            Declarar «role="tablist"» promete dos cosas que aquí faltaban: que las
            flechas cambian de pestaña y que el tabulador entra y sale del grupo
            de una vez, sin pasar por la que no está elegida. Un lector de
            pantalla anuncia «pestaña 1 de 2» y quien lo oye pulsa la flecha
            derecha; si no pasa nada, el componente miente sobre lo que es.
        */}
        <div
          className="acceso__pestanas"
          role="tablist"
          aria-label="Ingreso o registro"
          onKeyDown={moverEntrePestanas}
        >
          <button
            type="button"
            role="tab"
            id="pestana-ingreso"
            aria-selected={!esRegistro}
            aria-controls="panel-acceso"
            /* Solo la elegida es tabulable: es lo que ARIA llama «tabindex
               rotatorio», y es lo que hace que el tabulador salte al panel en
               lugar de recorrer las pestañas una a una. */
            tabIndex={esRegistro ? -1 : 0}
            className={esRegistro ? 'acceso__pestana' : 'acceso__pestana acceso__pestana--activa'}
            onClick={() => cambiarModo('ingreso')}
          >
            Ya tengo cuenta
          </button>
          <button
            type="button"
            role="tab"
            id="pestana-registro"
            aria-selected={esRegistro}
            aria-controls="panel-acceso"
            tabIndex={esRegistro ? 0 : -1}
            className={esRegistro ? 'acceso__pestana acceso__pestana--activa' : 'acceso__pestana'}
            onClick={() => cambiarModo('registro')}
          >
            Crear cuenta
          </button>
        </div>

        <div
          className="acceso__panel"
          id="panel-acceso"
          role="tabpanel"
          aria-labelledby={esRegistro ? 'pestana-registro' : 'pestana-ingreso'}
        >
          <h1>{TITULO[modo]}</h1>
          <p className="acceso__intro">{INTRO[modo]}</p>

          {esRecuperar && correoEnviado ? (
            /* El mensaje es el mismo exista o no la cuenta: decir «ese correo no
               está registrado» convertiría este formulario en un detector de
               quién tiene cuenta (segundo criterio de HU-14). Por eso habla de
               «si existe una cuenta» y no de lo que se ha hecho. */
            <div className="acceso__confirmacion" role="status">
              <p>
                <strong>Revisa tu correo.</strong> Si existe una cuenta asociada a{' '}
                {formulario.correo}, acabamos de enviar allí un enlace para definir una
                contraseña nueva.
              </p>
              <p>
                El enlace caduca al cabo de un rato. Si no lo encuentras, mira en la carpeta
                de correo no deseado.
              </p>
              <button type="button" className="boton" onClick={() => cambiarModo('ingreso')}>
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
          <>
          {/* «noValidate» desactiva los avisos del navegador para que se vean los
              mensajes de «validaciones.js», que son los que están comprobados.
              El atributo «required» se conserva en cada campo: es lo que anuncia
              a un lector de pantalla que el dato es obligatorio. */}
          <form className="acceso__formulario" onSubmit={enviar} noValidate ref={formularioRef}>
            {errorGeneral && (
              <p className="acceso__aviso" role="alert">
                {errorGeneral}
              </p>
            )}

            {esRegistro && (
              <Campo
                etiqueta="Nombre del actor cultural o colectivo"
                valor={formulario.nombre}
                alCambiar={escribir('nombre')}
                error={errores.nombre}
                autoComplete="organization"
              />
            )}

            <Campo
              etiqueta="Correo electrónico"
              tipo="email"
              valor={formulario.correo}
              alCambiar={escribir('correo')}
              error={errores.correo}
              autoComplete="email"
            />

            {!esRecuperar && (
              <Campo
                etiqueta="Contraseña"
                tipo="password"
                valor={formulario.contrasena}
                alCambiar={escribir('contrasena')}
                error={errores.contrasena}
                ayuda={esRegistro ? 'Mínimo ocho caracteres.' : null}
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
              />
            )}

            {modo === 'ingreso' && (
              <p className="acceso__olvido">
                <button
                  type="button"
                  className="enlace-texto"
                  onClick={() => cambiarModo('recuperar')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </p>
            )}

            {esRegistro && (
              <>
                <Campo
                  etiqueta="Repite la contraseña"
                  tipo="password"
                  valor={formulario.confirmacion}
                  alCambiar={escribir('confirmacion')}
                  error={errores.confirmacion}
                  autoComplete="new-password"
                />

                <div className="acceso__consentimiento">
                  {/* El enlace a la política va fuera de la etiqueta y en su
                      propia línea: dentro quedaría como enlace de 20 px de alto
                      en medio de una frase —por debajo del área mínima de toque
                      de HU-10— y además compite con la casilla por el clic. */}
                  <label className="casilla">
                    <input
                      type="checkbox"
                      checked={formulario.consentimiento}
                      onChange={(evento) => escribir('consentimiento')(evento.target.checked)}
                      aria-invalid={errores.consentimiento ? 'true' : undefined}
                      aria-describedby={errores.consentimiento ? 'error-consentimiento' : undefined}
                    />
                    <span>
                      Autorizo el tratamiento de mis datos personales conforme a la política de
                      tratamiento de datos, versión {VERSION_POLITICA_DATOS} (Ley 1581 de 2012).
                    </span>
                  </label>

                  <Link
                    className="acceso__politica"
                    to="/politica-de-datos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Leer la política de tratamiento de datos
                  </Link>

                  {errores.consentimiento && (
                    <span className="campo__error" id="error-consentimiento">
                      {errores.consentimiento}
                    </span>
                  )}
                </div>
              </>
            )}

            <button className="boton acceso__enviar" type="submit" disabled={enviando}>
              {enviando ? 'Un momento…' : ENVIAR[modo]}
            </button>
          </form>

          <p className="acceso__alternativa">
            {esRecuperar ? (
              <>
                ¿Te acordaste?{' '}
                <button type="button" className="enlace-texto" onClick={() => cambiarModo('ingreso')}>
                  Vuelve a iniciar sesión
                </button>
              </>
            ) : esRegistro ? (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" className="enlace-texto" onClick={() => cambiarModo('ingreso')}>
                  Inicia sesión
                </button>
              </>
            ) : (
              <>
                ¿Todavía no tienes cuenta?{' '}
                <button
                  type="button"
                  className="enlace-texto"
                  onClick={() => cambiarModo('registro')}
                >
                  Crea una
                </button>
              </>
            )}
          </p>
          </>
          )}
        </div>
      </div>
    </section>
  );
}
