import { useState } from 'react';
import { registrarInteraccion } from '../../services/interaccionesService.js';
import {
  asuntoDeContacto,
  enlaceDeCorreo,
  enlaceDeTelefono,
  enlaceDeWhatsapp,
  mensajeDeContacto,
} from '../../utils/contacto.js';

/**
 * Contacto directo con quien organiza — HU-29 · RF-12, RF-15.
 *
 * ## Los canales están detrás de un botón, y lo pide el criterio
 *
 * «Cuando seleccione la opción de contacto, entonces deben mostrarse los
 * canales»: primero se elige contactar y después se elige cómo. Enseñarlos
 * siempre habría sido más cómodo de programar y habría convertido el teléfono de
 * una persona en algo que se lee sin haberlo pedido.
 *
 * ## Solo los que el actor autorizó
 *
 * Los tres campos de contacto son opcionales desde HU-18. Aquí se pinta lo que
 * haya y nada más: no se inventa un canal, y no se enseña un botón apagado que
 * anuncie que existe un teléfono que no se va a dar. Si no autorizó ninguno, se
 * dice, y se ofrece el perfil, que es donde el actor sí cuenta quién es.
 *
 * ## El registro es a ciegas y a propósito
 *
 * Al pulsar un canal se deja constancia anonimizada —tercer criterio— y **no se
 * espera a que termine**. Quien pulsa «WhatsApp» quiere abrir WhatsApp; cobrarle
 * la latencia de un indicador que no le sirve de nada, en un móvil con mala
 * señal, son segundos mirando un botón que no responde. Si la escritura falla,
 * se pierde ese registro y el contacto ocurre igual (docs/28 §6).
 *
 * Por eso el «catch» está vacío: no hay nada que la persona pueda hacer con ese
 * error, y enseñárselo sería contarle un problema que no es suyo justo cuando
 * está saliendo de la página.
 */
export default function ContactoDelActor({ publicacion, actor }) {
  const [abierto, setAbierto] = useState(false);

  const { telefono, whatsapp, correo } = actor.contacto;
  const hayContacto = Boolean(telefono || whatsapp || correo);

  const mensaje = mensajeDeContacto(publicacion.titulo);
  const asunto = asuntoDeContacto(publicacion.titulo);

  const anotar = () => {
    registrarInteraccion({ idEvento: publicacion.id, tipo: 'contacto' }).catch(() => {});
  };

  if (!hayContacto) {
    return (
      <p className="detalle__sin-contacto">
        {actor.nombre} no publicó canales de contacto. En su perfil está el resto de su
        propuesta.
      </p>
    );
  }

  return (
    <div className="contacto">
      <button
        className="boton"
        type="button"
        aria-expanded={abierto}
        aria-controls="canales-de-contacto"
        onClick={() => setAbierto((actual) => !actual)}
      >
        {abierto ? 'Ocultar los canales' : `Contactar con ${actor.nombre}`}
      </button>

      {abierto && (
        <div id="canales-de-contacto" className="contacto__canales">
          <p className="contacto__aviso">
            Escribes directamente a quien organiza la actividad. La plataforma no
            interviene en la conversación ni guarda nada de lo que digas.
          </p>

          <ul className="contacto__lista">
            {whatsapp && (
              <li>
                {/* «noreferrer» además de «noopener»: la pestaña que se abre no
                    tiene por qué saber desde qué ficha se llegó. */}
                <a
                  className="enlace-boton"
                  href={enlaceDeWhatsapp(whatsapp, mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={anotar}
                >
                  Escribir por WhatsApp
                </a>
              </li>
            )}

            {correo && (
              <li>
                <a
                  className="enlace-boton enlace-boton--secundario"
                  href={enlaceDeCorreo(correo, { asunto, cuerpo: mensaje })}
                  onClick={anotar}
                >
                  Enviar un correo
                </a>
              </li>
            )}

            {telefono && (
              <li>
                <a
                  className="enlace-boton enlace-boton--secundario"
                  href={enlaceDeTelefono(telefono)}
                  onClick={anotar}
                >
                  Llamar al {telefono}
                </a>
              </li>
            )}
          </ul>

          {/* Se dice lo que va escrito antes de abrir nada. Un enlace que
              prepara un mensaje en nombre de quien lo pulsa tiene que enseñarlo
              primero: lo va a mandar esa persona, con su nombre. */}
          {(whatsapp || correo) && (
            <p className="contacto__mensaje">
              El mensaje se abre empezado, y se puede cambiar antes de enviarlo:
              <q>{mensaje}</q>
            </p>
          )}

          {/* El teléfono no admite mensaje y conviene no fingir que sí. */}
          {telefono && !whatsapp && !correo && (
            <p className="contacto__mensaje">
              Una llamada no lleva mensaje: el enlace abre el marcador con el número
              puesto.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
