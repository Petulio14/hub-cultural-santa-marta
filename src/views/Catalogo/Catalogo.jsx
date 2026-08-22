import VistaPendiente from '../../components/VistaPendiente.jsx';

export default function Catalogo() {
  return (
    <VistaPendiente
      vista="V-2"
      titulo="Catálogo de eventos"
      historias="HU-25, HU-26 y HU-27"
      descripcion="Rejilla de publicaciones aprobadas con filtros por categoría y fecha, y búsqueda por palabra clave."
    />
  );
}
