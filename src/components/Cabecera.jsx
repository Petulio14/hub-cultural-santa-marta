import { Link } from 'react-router-dom';
import './Cabecera.css';

/**
 * Cabecera común a todas las vistas. El logotipo institucional va sobre placa
 * blanca porque la marca es verde oscuro y la barra es azul profundo: sobre el
 * fondo directo el contraste quedaría por debajo de 4,5 : 1
 * (docs/05-prototipo-interfaz.md §4 bis).
 *
 * La navegación con los cuatro accesos principales se incorpora en HU-09 y su
 * versión compacta en HU-10.
 */
export default function Cabecera() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera__interior">
        <Link className="cabecera__marca" to="/">
          <span className="cabecera__placa">
            <img src="/logo-tdea.png" alt="Tecnológico de Antioquia" />
          </span>
          <span className="cabecera__nombre">Hub Cultural Santa Marta</span>
        </Link>
      </div>
    </header>
  );
}
