/**
 * La imagen de un perfil, o la predeterminada si no hay — HU-19, tercer criterio.
 *
 * La predeterminada es un dibujo **dentro del código**, no un archivo. Tres
 * razones, en orden de peso:
 *
 * 1. Una fotografía de relleno obligaría a resolver su licencia y el derecho de
 *    imagen de quien salga en ella, que es justo el problema que dejó a este
 *    proyecto sin imágenes versionadas (docs/05-prototipo-interfaz.md §4 bis).
 * 2. No viaja: no hay petición que pueda fallar ni archivo que falte en el
 *    despliegue. Un perfil sin imagen se pinta igual sin conexión.
 * 3. Usa la paleta del sitio, así que envejece con ella y no contra ella.
 *
 * Va marcada con «aria-hidden» a propósito. No transmite ninguna información:
 * es el hueco donde iría una imagen, y el nombre del actor está escrito al lado.
 * Anunciarla obligaría a quien usa un lector de pantalla a escuchar «imagen
 * predeterminada» en cada tarjeta del directorio sin ganar nada a cambio.
 */
export default function ImagenDeActor({ imagen, nombre, alt, className = '' }) {
  const clases = ['imagen-actor', className].filter(Boolean).join(' ');

  if (imagen) {
    return (
      <img
        className={clases}
        src={imagen}
        // El nombre y no una descripción del contenido: nadie más que quien la
        // subió sabe qué se ve en la fotografía, y describirla a ciegas sería
        // inventar. Decir de quién es el perfil sí es cierto y sí orienta.
        //
        // HU-21 reutiliza este componente para la imagen de una publicación, que
        // no es «el perfil de» nadie, y por eso el texto se puede sustituir. El
        // dibujo de respaldo y las tres razones de arriba valen igual para las
        // dos, así que la pieza es la misma.
        alt={alt ?? `Imagen del perfil de ${nombre}`}
        // Llevó «loading="lazy"» hasta el 12/10/2026, y quitarlo no es un
        // descuido. Aquí la imagen viaja **dentro** del documento de Firestore:
        // cuando esta etiqueta existe, sus bytes ya se descargaron con la
        // consulta, así que aplazar la carga no ahorra ni uno (docs/18 §11).
        //
        // No ahorrar nada era inofensivo hasta que la ficha del evento pasó a
        // dibujar la fotografía a su tamaño, sin caja de proporción fija.
        // Entonces el elemento mide 0 × 0 mientras no haya imagen, y una imagen
        // aplazada que mide 0 × 0 nunca llega a entrar en la pantalla: no
        // cargaba, y al no cargar seguía midiendo 0 × 0. Medido en el navegador:
        // «complete: false» indefinidamente, y la ficha sin fotografía.
      />
    );
  }

  return (
    <svg
      className={`${clases} imagen-actor--vacia`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="120" height="120" fill="var(--arena)" />
      <circle cx="60" cy="44" r="17" fill="var(--turquesa)" opacity="0.85" />
      <path d="M12 96c10-20 26-30 48-30s38 10 48 30v24H12Z" fill="var(--azul-profundo)" opacity="0.7" />
      <path d="M0 108c20-8 34-4 60-4s40-4 60 4v12H0Z" fill="var(--ocre)" opacity="0.55" />
    </svg>
  );
}
