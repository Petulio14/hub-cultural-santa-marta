/**
 * Canales de contacto — HU-18 · RF-12, ampliado en HU-29.
 *
 * Funciones puras, comprobadas con «npm run probar». Están aquí y no dentro de
 * la vista del perfil por la misma razón que las validaciones: convertir un
 * número escrito a mano en un enlace que marque de verdad es una decisión con
 * casos límite, y los casos límite se prueban, no se miran en pantalla.
 *
 * HU-29 añade el **mensaje inicial**, que es su segundo criterio de aceptación.
 * Los tres enlaces siguen funcionando sin él —los usa el perfil de actor desde
 * HU-18—, y con él llevan escrito de qué actividad se está preguntando.
 */

/** Indicativo de Colombia. La plataforma es de Santa Marta (docs/02 §3). */
const INDICATIVO_COLOMBIA = '57';

/**
 * El número tal como lo necesita un enlace «tel:» o «wa.me»: solo dígitos y con
 * indicativo de país.
 *
 * El actor escribe su teléfono como lo escribe cualquiera —«300 123 4567»,
 * «+57 300 123 4567», «(605) 421-0000»—, y las tres formas designan el mismo
 * número. Lo que no puede pasar es que quien ya escribió el indicativo acabe con
 * él dos veces: «+5757300…» no marca a ninguna parte.
 *
 * Devuelve null cuando no hay nada que marcar, para que la vista sepa que ahí no
 * debe pintar un enlace.
 */
export function aNumeroMarcable(telefono) {
  const digitos = (telefono ?? '').replace(/\D+/g, '');
  if (digitos === '') return null;

  // Ya trae el indicativo: 57 más diez dígitos de móvil, o 57 más un fijo con su
  // indicativo de área. Se deja como está.
  if (digitos.startsWith(INDICATIVO_COLOMBIA) && digitos.length >= 12) return digitos;

  // Un número nacional completo: diez dígitos de móvil o de fijo con área.
  if (digitos.length === 10) return `${INDICATIVO_COLOMBIA}${digitos}`;

  // Cualquier otra cosa —un fijo de siete dígitos sin área, un número
  // internacional— se devuelve tal cual. Añadirle el indicativo colombiano sería
  // inventar a quién llama.
  return digitos;
}

/**
 * Enlace «tel:» del número, o null si no hay número.
 *
 * **No admite mensaje, y no es un olvido**: «tel:» abre el marcador con el
 * número puesto y no existe ningún parámetro para escribir nada. Una llamada no
 * lleva mensaje inicial porque una llamada no es un mensaje. El segundo criterio
 * de HU-29 se cumple en los otros dos canales, y en este se hace lo único que se
 * puede hacer, que es marcar (docs/28 §3).
 */
export function enlaceDeTelefono(telefono) {
  const marcable = aNumeroMarcable(telefono);
  return marcable === null ? null : `tel:+${marcable}`;
}

/**
 * El mensaje con el que arranca la conversación — HU-29, segundo criterio.
 *
 * Dice **de dónde viene** y **por qué actividad se pregunta**, que son las dos
 * cosas que el actor necesita para responder sin tener que preguntarlas. Sin
 * ellas, un «hola» suelto desde un número desconocido es indistinguible de
 * cualquier otro mensaje del día.
 *
 * Termina sin pregunta concreta a propósito: lo que quiera saber quien escribe
 * lo sabe esa persona, y rellenárselo entero convertiría el mensaje en algo que
 * no ha escrito nadie. Se deja empezado, no dicho.
 */
export function mensajeDeContacto(titulo) {
  return (
    `Hola. Escribo desde el Hub Cultural de Santa Marta por la actividad ` +
    `«${(titulo ?? '').trim()}». Me gustaría saber más.`
  );
}

/** El asunto del correo, que en WhatsApp no existe y aquí sí se lee antes de abrir. */
export function asuntoDeContacto(titulo) {
  return `Consulta sobre «${(titulo ?? '').trim()}»`;
}

/**
 * Enlace de WhatsApp, con mensaje si se le da uno.
 *
 * Se usa «wa.me», que es el enlace universal: abre la aplicación si está
 * instalada y la web si no, sin que la plataforma tenga que saber desde qué
 * dispositivo se pulsa.
 */
export function enlaceDeWhatsapp(telefono, mensaje = null) {
  const marcable = aNumeroMarcable(telefono);
  if (marcable === null) return null;

  const base = `https://wa.me/${marcable}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/**
 * Enlace «mailto:», con asunto y cuerpo si se le dan.
 *
 * **Los parámetros se componen a mano y no con «URLSearchParams»**, y ahí hay
 * una trampa que merece quedar escrita. «URLSearchParams» codifica con las
 * reglas de un formulario web, donde **el espacio se escribe «+»**. Un cliente
 * de correo no aplica esas reglas: interpreta el porcentaje y deja el «+» tal
 * cual, así que el asunto llegaría como «Consulta+sobre+«...»».
 *
 * Se ve solo al abrir el correo de verdad, que es lo que lo hace peligroso: en
 * el código el enlace parece bien formado.
 */
export function enlaceDeCorreo(correo, { asunto = null, cuerpo = null } = {}) {
  const limpio = (correo ?? '').trim();
  if (limpio === '') return null;

  const partes = [];
  if (asunto) partes.push(`subject=${encodeURIComponent(asunto)}`);
  if (cuerpo) partes.push(`body=${encodeURIComponent(cuerpo)}`);

  return partes.length === 0 ? `mailto:${limpio}` : `mailto:${limpio}?${partes.join('&')}`;
}
