import { Link } from 'react-router-dom';
import { etiquetaDeRol } from '../routes/roles.js';

/**
 * Lo que se ve cuando una cuenta llega a una vista que no le corresponde — HU-15.
 *
 * Dice **por qué** no se puede pasar y ofrece a dónde ir. Una pantalla que solo
 * dice «acceso denegado» deja a la persona sin saber si se equivocó de cuenta, si
 * le falta un permiso o si la plataforma está rota, y sin ningún camino de vuelta
 * salvo el botón de atrás del navegador.
 *
 * No revela nada útil para quien lo intenta a propósito: no dice qué hay dentro,
 * y la puerta de verdad no es esta pantalla sino las reglas de seguridad, que
 * rechazan la operación aunque nadie pase por aquí (docs/15 §2).
 */
export default function AccesoDenegado({ motivo, rolActual, rolesPermitidos = [] }) {
  return (
    <section className="contenedor pendiente">
      <p className="pendiente__etiqueta">Acceso restringido</p>
      <h1>Esta sección no está disponible para tu cuenta</h1>

      <p>{motivo}</p>

      {rolesPermitidos.length > 0 && (
        <p>
          La vista solicitada es para {rolesPermitidos.map(etiquetaDeRol).join(' o ')}, y tu
          cuenta figura como <strong>{etiquetaDeRol(rolActual).toLowerCase()}</strong>.
        </p>
      )}

      <p>
        <Link className="enlace-boton enlace-boton--secundario" to="/">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
