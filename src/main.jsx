import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { enrutador } from './routes/rutas.jsx';
import './styles/global.css';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <RouterProvider router={enrutador} />
  </StrictMode>
);
