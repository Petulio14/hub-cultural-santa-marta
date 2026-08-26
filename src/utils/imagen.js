/**
 * Imagen del perfil — HU-19 · RF-03.
 *
 * La imagen **no va a Firebase Storage**: se reduce en el navegador y viaja como
 * texto dentro del propio documento de Firestore. El porqué está en
 * docs/03-arquitectura.md §6.1 y se resume en una frase: activar Storage exige
 * pasar el proyecto a plan de facturación con medio de pago, y el proyecto no
 * tiene presupuesto (RNF-10).
 *
 * De ahí que este archivo maneje **dos límites distintos**, y conviene no
 * confundirlos:
 *
 * - **2 MB** es lo que puede pesar el archivo que la persona elige. Es el límite
 *   del criterio de aceptación, y el que produce el mensaje explicativo.
 * - **120 KB** es lo que puede pesar el resultado ya reducido y codificado. Es
 *   el límite que imponen las reglas de seguridad, y nadie debería toparse con
 *   él: la reducción se encarga de bajar de ahí. Si aun así no lo consigue, es
 *   mejor decirlo que escribir algo que el servidor va a rechazar.
 *
 * Las funciones de validación son puras y se comprueban con «npm run probar».
 * «reducirImagen» necesita navegador —usa un lienzo— y por eso está sola al
 * final, separada del resto.
 */

/** Lo que puede pesar el archivo elegido. Primer criterio de aceptación. */
export const LIMITE_ARCHIVO = 2 * 1024 * 1024;

/** Los dos formatos que admite la historia. */
export const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png'];

/** Lo que puede pesar el resultado guardado. El mismo número que firestore.rules. */
export const LIMITE_GUARDADO = 120000;

/** Lado mayor de la imagen reducida, en píxeles. */
export const LADO_MAXIMO = 480;

/** Calidades que se prueban, de mejor a peor, hasta bajar del límite guardado. */
export const CALIDADES = [0.72, 0.6, 0.5, 0.4, 0.3];

/**
 * Peso en la unidad que se entiende de un vistazo, y con la coma decimal del
 * español. «2097152» no le dice a nadie que su foto pesa el doble de lo
 * permitido; «2 MB» sí.
 */
export function pesoLegible(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  // Un decimal, y sin el «,0» de los redondos: «2 MB» y no «2,0 MB».
  const megas = Math.round((bytes / (1024 * 1024)) * 10) / 10;
  return `${String(megas).replace('.', ',')} MB`;
}

/** Nombre corto del formato, para poder decir cuál se rechazó. */
function formatoDe(archivo) {
  const tipo = archivo?.type ?? '';
  if (tipo.startsWith('image/')) return tipo.slice('image/'.length).toUpperCase();

  const nombre = archivo?.name ?? '';
  const punto = nombre.lastIndexOf('.');
  if (punto > 0) return nombre.slice(punto + 1).toUpperCase();

  return null;
}

/**
 * Segundo criterio de aceptación: el rechazo dice **qué** pasa y **qué hacer**.
 *
 * Devuelve null cuando el archivo sirve, y el mensaje cuando no. Un archivo
 * ausente no es un error: la imagen es opcional y el perfil sin ella muestra la
 * predeterminada (tercer criterio).
 */
export function validarArchivoDeImagen(archivo) {
  if (!archivo) return null;

  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    const formato = formatoDe(archivo);
    return formato
      ? `Ese archivo es ${formato} y aquí solo se admiten imágenes JPG o PNG. Conviértelo o elige otro.`
      : 'Ese archivo no es una imagen. Elige un JPG o un PNG.';
  }

  if (archivo.size > LIMITE_ARCHIVO) {
    return `La imagen pesa ${pesoLegible(archivo.size)} y el máximo son ${pesoLegible(
      LIMITE_ARCHIVO
    )}. Elige otra o redúcela antes de subirla.`;
  }

  if (archivo.size === 0) {
    return 'Ese archivo está vacío. Vuelve a elegir la imagen.';
  }

  return null;
}

/**
 * ¿Cabe el resultado en el documento?
 *
 * Se mide sobre la cadena entera, incluido el prefijo «data:image/…», porque es
 * exactamente lo que se escribe en Firestore y lo que cuenta la regla.
 */
export function esGuardable(imagen) {
  return typeof imagen === 'string' && imagen.length > 0 && imagen.length < LIMITE_GUARDADO;
}

/**
 * ¿Tiene la forma que exigen las reglas?
 *
 * La regla comprueba «matches('^data:image/(jpeg|png);base64,.*')». Repetirlo
 * aquí permite fallar en el navegador con un mensaje en lugar de que el servidor
 * rechace la escritura sin decir por qué.
 */
const FORMA_DE_IMAGEN = /^data:image\/(jpeg|png);base64,/;

export function tieneFormaDeImagen(imagen) {
  return typeof imagen === 'string' && FORMA_DE_IMAGEN.test(imagen);
}

/**
 * Cuánto hay que encoger para que el lado mayor no pase de «LADO_MAXIMO».
 *
 * Nunca **agranda**: una foto de 200 px se guarda a 200 px. Estirarla no añade
 * un solo detalle y multiplica lo que pesa.
 */
export function medidaReducida(ancho, alto, lado = LADO_MAXIMO) {
  const mayor = Math.max(ancho, alto);
  if (mayor <= lado) return { ancho, alto };
  const factor = lado / mayor;
  return {
    ancho: Math.max(1, Math.round(ancho * factor)),
    alto: Math.max(1, Math.round(alto * factor)),
  };
}

/* ------------------------------------------------------------------------- */
/* De aquí abajo hace falta un navegador: se dibuja en un lienzo.             */
/* ------------------------------------------------------------------------- */

/**
 * Fondo sobre el que se aplana la transparencia del PNG al pasarlo a JPEG.
 *
 * No es un color de la interfaz y por eso no sale de «variables.css»: no se ve
 * en pantalla como color del sitio, se queda dentro de los píxeles guardados.
 */
const FONDO_AL_APLANAR = '#ffffff';

/** Lee el archivo como URI de datos, que es lo que sabe cargar una <img>. */
function leerComoDataUri(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagen(dataUri) {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    imagen.onload = () => resolver(imagen);
    imagen.onerror = () => rechazar(new Error('Ese archivo no se pudo abrir como imagen.'));
    imagen.src = dataUri;
  });
}

/**
 * Reduce la imagen y devuelve la URI de datos que se guarda.
 *
 * Se prueba una calidad tras otra hasta bajar del límite del documento. La
 * primera suele bastar —un JPEG de 480 px al 72 % ronda los 40 KB—, y las demás
 * están por si llega una fotografía con mucho detalle.
 *
 * **Siempre sale JPEG, también si entró un PNG.** Un PNG fotográfico de 480 px
 * pesa varias veces lo que el JPEG equivalente, y aquí el peso es el límite. La
 * consecuencia es que se pierde la transparencia, así que antes de dibujar se
 * pinta el lienzo de blanco: sin eso, lo transparente saldría negro y quien
 * subiera un logotipo recortado se llevaría un susto.
 */
export async function reducirImagen(archivo, { lado = LADO_MAXIMO } = {}) {
  const original = await leerComoDataUri(archivo);
  const imagen = await cargarImagen(original);

  const { ancho, alto } = medidaReducida(imagen.naturalWidth, imagen.naturalHeight, lado);

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;

  const pincel = lienzo.getContext('2d');
  pincel.fillStyle = FONDO_AL_APLANAR;
  pincel.fillRect(0, 0, ancho, alto);
  pincel.drawImage(imagen, 0, 0, ancho, alto);

  for (const calidad of CALIDADES) {
    const reducida = lienzo.toDataURL('image/jpeg', calidad);
    if (esGuardable(reducida)) return reducida;
  }

  throw new Error(
    `Esa imagen no se pudo reducir por debajo de ${pesoLegible(
      LIMITE_GUARDADO
    )} sin destrozarla. Prueba con una menos detallada o recórtala antes.`
  );
}
