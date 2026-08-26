import { createBrowserRouter } from 'react-router-dom';
import Disposicion from '../components/Disposicion.jsx';
import ErrorDeRuta from '../components/ErrorDeRuta.jsx';
import RutaPrivada from './RutaPrivada.jsx';
import Inicio from '../views/Inicio/Inicio.jsx';
import Catalogo from '../views/Catalogo/Catalogo.jsx';
import DirectorioActores from '../views/DirectorioActores/DirectorioActores.jsx';
import DetalleEvento from '../views/DetalleEvento/DetalleEvento.jsx';
import PerfilActor from '../views/PerfilActor/PerfilActor.jsx';
import DirectorioHubs from '../views/DirectorioHubs/DirectorioHubs.jsx';
import MapaInteractivo from '../views/MapaInteractivo/MapaInteractivo.jsx';
import PanelAdministracion from '../views/PanelAdministracion/PanelAdministracion.jsx';
import Ingreso from '../views/Ingreso/Ingreso.jsx';
import MiPerfil from '../views/MiPerfil/MiPerfil.jsx';
import MisPublicaciones from '../views/MisPublicaciones/MisPublicaciones.jsx';
import PoliticaDatos from '../views/PoliticaDatos/PoliticaDatos.jsx';
import NoEncontrada from '../views/NoEncontrada/NoEncontrada.jsx';

/**
 * Tabla de rutas. Cada una corresponde a una vista del prototipo de HU-06, con
 * el mismo identificador V-n que en docs/05-prototipo-interfaz.md §2:
 *
 *   /                  V-1  Inicio                    pública
 *   /eventos           V-2  Catálogo                  pública
 *   /eventos/:id       V-3  Detalle de evento         pública
 *   /actores           V-4  Actores culturales        pública
 *   /actores/:id       V-4  Perfil de actor cultural  pública
 *   /hubs              V-5  Directorio de hubs        pública
 *   /mapa              V-6  Mapa interactivo          pública
 *   /admin             V-7  Panel de administración   privada · administrador
 *   /ingreso           V-8  Ingreso y registro        pública
 *   /politica-de-datos      Tratamiento de datos      pública (HU-16)
 *   /mi-perfil         V-4  Mi perfil de actor        privada · actor cultural
 *   /mis-publicaciones V-9  Mis publicaciones         privada · actor cultural
 *   cualquier otra          Página no encontrada      pública
 *
 * «handle.titulo» es lo que useTituloDeRuta escribe en la pestaña del navegador.
 */
export const enrutador = createBrowserRouter([
  {
    path: '/',
    element: <Disposicion />,
    errorElement: <ErrorDeRuta />,
    children: [
      { index: true, element: <Inicio />, handle: { titulo: 'Inicio' } },
      { path: 'eventos', element: <Catalogo />, handle: { titulo: 'Catálogo de eventos' } },
      {
        path: 'eventos/:id',
        element: <DetalleEvento />,
        handle: { titulo: 'Detalle del evento' },
      },
      {
        path: 'actores',
        element: <DirectorioActores />,
        handle: { titulo: 'Actores culturales' },
      },
      {
        path: 'actores/:id',
        element: <PerfilActor />,
        handle: { titulo: 'Perfil del actor cultural' },
      },
      { path: 'hubs', element: <DirectorioHubs />, handle: { titulo: 'Directorio de hubs' } },
      { path: 'mapa', element: <MapaInteractivo />, handle: { titulo: 'Mapa' } },
      {
        path: 'admin',
        element: (
          <RutaPrivada rol="administrador">
            <PanelAdministracion />
          </RutaPrivada>
        ),
        handle: { titulo: 'Panel de administración' },
      },
      { path: 'ingreso', element: <Ingreso />, handle: { titulo: 'Ingreso y registro' } },
      {
        // No estaba en el prototipo de HU-06: la exige el primer criterio de
        // HU-16, que pide un enlace visible a la política desde el registro.
        path: 'politica-de-datos',
        element: <PoliticaDatos />,
        handle: { titulo: 'Política de tratamiento de datos' },
      },
      {
        // V-4 en su cara privada. El prototipo la describe como «público
        // (lectura) / privado (edición)» sin darle dirección propia, pero quien
        // aún no tiene perfil no tiene tampoco un «/actores/:id» al que ir. Es
        // el mismo caso que «/politica-de-datos» (HU-18, docs/17 §3).
        path: 'mi-perfil',
        element: (
          <RutaPrivada rol="actor">
            <MiPerfil />
          </RutaPrivada>
        ),
        handle: { titulo: 'Mi perfil de actor cultural' },
      },
      {
        path: 'mis-publicaciones',
        element: (
          <RutaPrivada rol="actor">
            <MisPublicaciones />
          </RutaPrivada>
        ),
        handle: { titulo: 'Mis publicaciones' },
      },
      { path: '*', element: <NoEncontrada />, handle: { titulo: 'Página no encontrada' } },
    ],
  },
]);
