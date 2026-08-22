import VistaPendiente from '../../components/VistaPendiente.jsx';

export default function Ingreso() {
  return (
    <VistaPendiente
      vista="V-8"
      titulo="Ingreso y registro"
      historias="HU-12, HU-13, HU-14 y HU-16"
      descripcion="Acceso con correo y contraseña, registro con consentimiento informado y recuperación de contraseña."
    />
  );
}
