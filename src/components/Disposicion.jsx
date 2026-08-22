import { Outlet, ScrollRestoration } from 'react-router-dom';
import Cabecera from './Cabecera.jsx';
import PieDePagina from './PieDePagina.jsx';
import { useTituloDeRuta } from '../hooks/useTituloDeRuta.js';

/**
 * Estructura común de todas las vistas: cabecera, contenido y pie. La vista
 * concreta entra por el «Outlet» del enrutador.
 */
export default function Disposicion() {
  useTituloDeRuta();

  return (
    <div className="disposicion">
      <a className="saltar-al-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <Cabecera />
      <main className="disposicion__principal" id="contenido">
        <Outlet />
      </main>
      <PieDePagina />
      {/* Al cambiar de vista la página vuelve arriba, como haría un sitio no SPA */}
      <ScrollRestoration />
    </div>
  );
}
