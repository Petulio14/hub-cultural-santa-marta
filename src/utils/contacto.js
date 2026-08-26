/**
 * Canales de contacto — HU-18 · RF-12.
 *
 * Funciones puras, comprobadas con «npm run probar». Están aquí y no dentro de
 * la vista del perfil por la misma razón que las validaciones: convertir un
 * número escrito a mano en un enlace que marque de verdad es una decisión con
 * casos límite, y los casos límite se prueban, no se miran en pantalla.
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

/** Enlace «tel:» del número, o null si no hay número. */
export function enlaceDeTelefono(telefono) {
  const marcable = aNumeroMarcable(telefono);
  return marcable === null ? null : `tel:+${marcable}`;
}

/**
 * Enlace de WhatsApp. Se usa «wa.me», que es el enlace universal: abre la
 * aplicación si está instalada y la web si no, sin que la plataforma tenga que
 * saber desde qué dispositivo se pulsa.
 */
export function enlaceDeWhatsapp(telefono) {
  const marcable = aNumeroMarcable(telefono);
  return marcable === null ? null : `https://wa.me/${marcable}`;
}

/** Enlace «mailto:», o null si no hay correo. */
export function enlaceDeCorreo(correo) {
  const limpio = (correo ?? '').trim();
  return limpio === '' ? null : `mailto:${limpio}`;
}
