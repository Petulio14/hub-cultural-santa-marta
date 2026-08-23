import { Link } from 'react-router-dom';
import { VERSION_POLITICA_DATOS } from '../../services/authService.js';
import './PoliticaDatos.css';

/**
 * Política de tratamiento de datos personales — HU-16 · RNF-06.
 *
 * Es el documento que la casilla del registro enlaza, y por eso es una vista y
 * no un archivo de «docs/»: el consentimiento tiene que poder leerse desde el
 * propio formulario, antes de aceptarlo, y quedar accesible después.
 *
 * La versión que se muestra aquí es la misma que se guarda en
 * «usuarios.consentimientoDatos.version» al crear la cuenta. Si el texto cambia,
 * cambia la constante, y entonces se sabe qué versión aceptó cada persona.
 */

/** Canal de atención de los derechos del titular. */
export const CORREO_DE_CONTACTO = 'sebastian.rojas39@correo.tdea.edu.co';

export default function PoliticaDatos() {
  return (
    <section className="contenedor politica">
      <p className="politica__version">Versión {VERSION_POLITICA_DATOS} · vigente desde agosto de 2026</p>
      <h1>Política de tratamiento de datos personales</h1>

      <p>
        Esta política se expide conforme a la <strong>Ley 1581 de 2012</strong> y al{' '}
        <strong>Decreto 1377 de 2013</strong> de la República de Colombia, y describe cómo el Hub
        Cultural de Santa Marta recoge, usa y protege los datos personales de quienes se registran
        en la plataforma.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El Hub Cultural de Santa Marta es un prototipo académico desarrollado como trabajo de grado
        del programa de Ingeniería en Software del <strong>Tecnológico de Antioquia</strong>. El
        tratamiento de los datos está a cargo del equipo de desarrollo del proyecto, que atiende las
        solicitudes de los titulares en el correo <strong>{CORREO_DE_CONTACTO}</strong>.
      </p>

      <h2>2. Qué datos se recogen</h2>
      <p>Únicamente los necesarios para que la plataforma funcione:</p>
      <ul>
        <li>
          <strong>De toda cuenta:</strong> nombre, correo electrónico, rol, fecha de registro y la
          constancia de haber aceptado esta política, con su fecha y su versión.
        </li>
        <li>
          <strong>De los actores culturales y hubs:</strong> la información de su perfil público
          —manifestación cultural, descripción, categoría, canales de contacto e imagen—, que se
          publica porque para eso se entrega.
        </li>
        <li>
          <strong>De los visitantes sin cuenta:</strong> nada que permita identificarlos. Las
          consultas a cada publicación se registran de forma anónima, sin dirección de red, sin
          identificador de dispositivo y sin correo.
        </li>
      </ul>
      <p>
        <strong>La contraseña no se almacena en la base de datos del proyecto.</strong> La gestiona
        Firebase Authentication, que solo conserva su resumen criptográfico.
      </p>

      <h2>3. Para qué se usan</h2>
      <ul>
        <li>Crear y mantener la cuenta, y verificar quién puede publicar o moderar.</li>
        <li>Publicar la oferta cultural aprobada y permitir que un visitante contacte a su autor.</li>
        <li>
          Producir indicadores agregados de uso de la plataforma. Esos indicadores no identifican a
          ninguna persona.
        </li>
      </ul>
      <p>
        Los datos <strong>no se venden, no se ceden con fines comerciales y no se usan para
        publicidad</strong>.
      </p>

      <h2>4. Dónde se guardan</h2>
      <p>
        En los servicios de Firebase, operados por Google LLC, lo que implica que la información se
        aloja en servidores fuera de Colombia. El acceso está restringido por reglas de seguridad
        que impiden que una cuenta lea o modifique datos que no le corresponden, y la comunicación
        con el servidor viaja cifrada.
      </p>

      <h2>5. Derechos del titular</h2>
      <p>Conforme al artículo 8 de la Ley 1581 de 2012, toda persona registrada puede:</p>
      <ul>
        <li>Conocer, actualizar y rectificar sus datos.</li>
        <li>Solicitar prueba de la autorización que otorgó.</li>
        <li>Ser informada del uso que se ha dado a sus datos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
        <li>
          <strong>Revocar la autorización y solicitar la supresión</strong> de sus datos, cuando no
          exista un deber legal de conservarlos.
        </li>
      </ul>

      <h2>6. Cómo ejercerlos</h2>
      <p>
        Escribiendo al correo de contacto desde la dirección con la que se creó la cuenta e
        indicando qué se solicita. Los plazos son los de la ley: <strong>diez días hábiles</strong>{' '}
        para las consultas y <strong>quince días hábiles</strong> para los reclamos, prorrogables
        una sola vez con aviso al solicitante.
      </p>
      {/* Enlace en bloque y no dentro de la frase: en medio de un párrafo mediría
          20 px de alto, por debajo del área mínima de toque de HU-10. */}
      <p>
        <a className="politica__canal" href={`mailto:${CORREO_DE_CONTACTO}`}>
          Escribir a {CORREO_DE_CONTACTO}
        </a>
      </p>
      <p>
        Atendida una solicitud de supresión, se elimina la cuenta, su perfil público y sus
        publicaciones. Los registros anónimos de uso no se eliminan porque no están asociados a
        ninguna persona.
      </p>

      <h2>7. Vigencia y cambios</h2>
      <p>
        Esta es la versión {VERSION_POLITICA_DATOS}. Cada cuenta guarda la versión que aceptó, de
        modo que un cambio en este texto no se da por consentido: si la política se modifica de
        forma sustancial, se solicitará una nueva aceptación.
      </p>

      <p className="politica__volver">
        <Link className="enlace-boton enlace-boton--secundario" to="/ingreso">
          Volver al registro
        </Link>
      </p>
    </section>
  );
}
