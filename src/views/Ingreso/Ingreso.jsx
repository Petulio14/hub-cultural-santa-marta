import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Campo from '../../components/Campo.jsx';
import { useSesion } from '../../hooks/useSesion.jsx';
import { destinoTrasIngresar } from '../../routes/roles.js';
import {
  ErrorDeCuenta,
  VERSION_POLITICA_DATOS,
  iniciarSesion,
  registrarActorCultural,
} from '../../services/authService.js';
import { hayErrores, validarIngreso, validarRegistro } from '../../utils/validaciones.js';
import './Ingreso.css';

/**
 * V-8 · Ingreso y registro — HU-12, HU-13, HU-16.
 *
 * Las dos operaciones comparten vista porque comparten la duda de quien llega:
 * «¿ya tengo cuenta?». Separarlas en dos direcciones obliga a volver atrás al
 * equivocarse; aquí se cambia de panel sin perder el sitio.
 *
 * La validación se hace en «utils/validaciones.js», que no sabe nada de React, y
 * el acceso a Firebase en «services/authService.js», que no sabe nada de esta
 * vista. Aquí solo queda el estado del formulario y qué se muestra.
 */
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
  const formularioRef = useRef(null);

  // Tras un envío rechazado el foco va al primer campo con error. Sin esto, quien
  // navega con teclado tiene que recorrer el formulario entero para encontrarlo.
  useEffect(() => {
    if (!hayErrores(errores)) return;
    formularioRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [errores]);

  const escribir = (campo) => (valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErrores(({ [campo]: _descartado, ...resto }) => resto);
  };

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setErrores({});
    setErrorGeneral(null);
    setFormulario((anterior) => ({ ...FORMULARIO_VACIO, correo: anterior.correo }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrorGeneral(null);

    const encontrados = modo === 'registro' ? validarRegistro(formulario) : validarIngreso(formulario);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setEnviando(true);
    try {
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

  return (
    <section className="contenedor acceso">
      <div className="acceso__caja">
        <div className="acceso__pestanas" role="tablist" aria-label="Ingreso o registro">
          <button
            type="button"
            role="tab"
            id="pestana-ingreso"
            aria-selected={!esRegistro}
            aria-controls="panel-acceso"
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
          <h1>{esRegistro ? 'Crea tu cuenta de actor cultural' : 'Inicia sesión'}</h1>
          <p className="acceso__intro">
            {esRegistro
              ? 'Con una cuenta puedes publicar tus experiencias culturales y aparecer en el directorio de Santa Marta.'
              : 'Entra con el correo y la contraseña con los que creaste tu cuenta.'}
          </p>

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

            <Campo
              etiqueta="Contraseña"
              tipo="password"
              valor={formulario.contrasena}
              alCambiar={escribir('contrasena')}
              error={errores.contrasena}
              ayuda={esRegistro ? 'Mínimo ocho caracteres.' : null}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
            />

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
              {enviando
                ? 'Un momento…'
                : esRegistro
                  ? 'Crear cuenta'
                  : 'Entrar'}
            </button>
          </form>

          <p className="acceso__alternativa">
            {esRegistro ? (
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
        </div>
      </div>
    </section>
  );
}
