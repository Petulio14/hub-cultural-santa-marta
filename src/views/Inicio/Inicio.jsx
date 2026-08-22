import { Link } from 'react-router-dom';

/**
 * V-1 · Inicio. El contenido definitivo —propósito de la plataforma y los cuatro
 * accesos principales— es HU-09; aquí queda la estructura mínima para que el
 * enrutador tenga una raíz verificable.
 */
export default function Inicio() {
  return (
    <section className="contenedor">
      <h1>Hub Cultural Santa Marta</h1>
      <p>
        Plataforma que reúne la oferta cultural de Santa Marta: eventos, actores
        culturales, hubs de innovación y su ubicación en el mapa.
      </p>
      <p>
        <Link className="enlace-boton" to="/eventos">
          Ver eventos
        </Link>
      </p>
    </section>
  );
}
