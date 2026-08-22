import VistaPendiente from '../../components/VistaPendiente.jsx';

/**
 * Índice de actores culturales. El prototipo (V-4) especifica el perfil de un
 * actor, pero los cuatro accesos de la página de inicio exigen además una puerta
 * de entrada a todos ellos. Véase la nota de docs/09-navegacion-e-inicio.md §5.
 */
export default function DirectorioActores() {
  return (
    <VistaPendiente
      vista="V-4"
      titulo="Actores culturales"
      historias="HU-18"
      descripcion="Quiénes sostienen la vida cultural de Santa Marta: gestores, colectivos, artesanos y portadores de saberes, con acceso a su perfil."
    />
  );
}
