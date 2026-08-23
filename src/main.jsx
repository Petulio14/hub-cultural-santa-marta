import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ProveedorDeSesion } from './hooks/useSesion.jsx';
import { enrutador } from './routes/rutas.jsx';
import './styles/global.css';

// El proveedor de sesión envuelve al enrutador y no al revés: las rutas privadas
// necesitan saber quién está dentro antes de decidir si dejan pasar (HU-13, HU-15).
createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <ProveedorDeSesion>
      <RouterProvider router={enrutador} />
    </ProveedorDeSesion>
  </StrictMode>
);
