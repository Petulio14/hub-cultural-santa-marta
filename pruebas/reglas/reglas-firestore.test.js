/**
 * Pruebas de las reglas de seguridad de Cloud Firestore — HU-11, HU-12, HU-15, HU-16,
 * HU-17, HU-18, HU-19, HU-20, HU-21, HU-22.
 *
 * Son los seis casos del criterio de aceptación, más las contrapartidas
 * positivas: una regla que lo deniega todo también pasaría las seis
 * denegaciones, así que cada prohibición se acompaña del permiso que sí debe
 * concederse. La lista completa está en docs/11-reglas-de-seguridad.md.
 *
 * Se ejecutan contra el emulador, sin tocar los datos reales:
 *
 *   npm run probar:reglas
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  GeoPoint,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  setLogLevel,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';

// Cada denegación esperada hace que el SDK imprima un PERMISSION_DENIED. Son el
// resultado correcto de la prueba, no un problema, y llenan la salida de ruido.
setLogLevel('silent');

const UID_ACTOR = 'uid-actor';
const UID_OTRO = 'uid-otro-actor';
const UID_ADMIN = 'uid-admin';
const UID_DESACTIVADO = 'uid-desactivado';
// El identificador de un perfil de actor ES el uid de su dueño (HU-18, docs/17
// §2). Estas dos constantes existen solo para que se lea qué papel cumple cada
// perfil en las pruebas; su valor no puede ser otro.
const ID_ACTOR = UID_ACTOR;                  // perfil aprobado
const ID_ACTOR_PENDIENTE = UID_OTRO;         // perfil aún sin aprobar

/**
 * Cuentas de actor activas y sin perfil, una por prueba de creación.
 *
 * Cada prueba necesita la suya porque el uid es el identificador del documento:
 * reutilizar una cuenta convertiría la segunda escritura en una actualización, y
 * la prueba mediría entonces una regla distinta de la que dice medir.
 */
const UIDS_SIN_PERFIL = Array.from({ length: 16 }, (_, i) => `uid-sin-perfil-${i + 1}`);

/**
 * Cuenta de actor activa que **nunca** llega a crear perfil.
 *
 * Va aparte de «UIDS_SIN_PERFIL» y no como un índice más porque no es una
 * cuenta de repuesto: es el sujeto de una prueba concreta —quien intenta
 * publicar sin perfil (HU-21)— y tiene que seguir sin perfil hasta el final del
 * archivo. Nació de un fallo: la prueba usaba «UIDS_SIN_PERFIL[10]», que ochenta
 * lineas antes ya había estrenado el suyo en una prueba de HU-19, así que medía
 * lo contrario de lo que decía medir. Un nombre no se puede reutilizar por
 * descuido; un índice sí.
 */
const UID_ACTOR_SIN_PERFIL = 'uid-actor-que-nunca-crea-perfil';

/** Cuentas con rol de hub, y por la misma razón: una por prueba de creación. */
const UIDS_HUB = Array.from({ length: 10 }, (_, i) => `uid-hub-${i + 1}`);

/** El hub que ya existe. Su identificador es el uid de su dueño, como el actor. */
const UID_HUB_DUENO = 'uid-hub-dueno';
const ID_HUB = UID_HUB_DUENO;

/** Perfil de actor cultural mínimo que las reglas aceptan (HU-18). */
const perfilDeActor = (uid, cambios = {}) => ({
  idActor: uid,
  uid,
  nombre: 'Escuela de gaitas',
  manifestacion: 'Música tradicional',
  descripcion: 'Enseñanza de gaita y tambor a niñas y niños del barrio.',
  categoria: 'musica',
  contacto: { telefono: '3001234567', correo: null, whatsapp: null },
  estado: 'pendiente',
  ...cambios,
});

let entorno;

/** Firestore visto por un visitante sin sesión. */
const visitante = () => entorno.unauthenticatedContext().firestore();

/** Firestore visto por una persona autenticada con ese uid. */
const comoUsuario = (uid) => entorno.authenticatedContext(uid).firestore();

before(async () => {
  entorno = await initializeTestEnvironment({
    projectId: 'reglas-hub-cultural',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });

  await entorno.clearFirestore();

  // Datos de partida, escritos saltándose las reglas: son el estado del que
  // parten las pruebas, no lo que se está probando.
  await entorno.withSecurityRulesDisabled(async (contexto) => {
    const bd = contexto.firestore();

    await setDoc(doc(bd, 'usuarios', UID_ACTOR), {
      uid: UID_ACTOR,
      rol: 'actor',
      estado: 'activo',
      correo: 'actor@ejemplo.co',
    });
    await setDoc(doc(bd, 'usuarios', UID_OTRO), {
      uid: UID_OTRO,
      rol: 'actor',
      estado: 'activo',
      correo: 'otro@ejemplo.co',
    });
    // Misma cuenta de actor, pero desactivada: sirve para comprobar que el rol
    // por sí solo no concede permisos (HU-15).
    await setDoc(doc(bd, 'usuarios', UID_DESACTIVADO), {
      uid: UID_DESACTIVADO,
      rol: 'actor',
      estado: 'inactivo',
      correo: 'desactivado@ejemplo.co',
    });
    await setDoc(doc(bd, 'usuarios', UID_ADMIN), {
      uid: UID_ADMIN,
      rol: 'administrador',
      estado: 'activo',
      correo: 'admin@ejemplo.co',
    });

    for (const uid of [...UIDS_HUB, UID_HUB_DUENO]) {
      await setDoc(doc(bd, 'usuarios', uid), {
        uid,
        rol: 'hub',
        estado: 'activo',
        correo: `${uid}@ejemplo.co`,
      });
    }

    await setDoc(doc(bd, 'hubs', ID_HUB), {
      idHub: ID_HUB,
      uid: UID_HUB_DUENO,
      nombre: 'Hub Caribe de Innovación',
      descripcion: 'Espacio de formación y encuentro en el centro histórico.',
      lineasDeTrabajo: ['emprendimiento', 'economía naranja'],
      direccion: 'Calle 22 # 1-40, Santa Marta',
      coordenadas: new GeoPoint(11.24222, -74.21331),
      contacto: { telefono: null, correo: 'hub@ejemplo.co', whatsapp: null },
      estado: 'aprobado',
    });

    for (const uid of [...UIDS_SIN_PERFIL, UID_ACTOR_SIN_PERFIL]) {
      await setDoc(doc(bd, 'usuarios', uid), {
        uid,
        rol: 'actor',
        estado: 'activo',
        correo: `${uid}@ejemplo.co`,
      });
    }

    // Los perfiles se siembran completos y no con tres campos sueltos: desde
    // HU-18 la regla de actualización exige que el documento resultante siga
    // bien formado, y un perfil incompleto haría fallar la edición del dueño por
    // un motivo que nada tiene que ver con la propiedad que se está probando.
    await setDoc(doc(bd, 'actoresCulturales', ID_ACTOR), {
      idActor: ID_ACTOR,
      uid: UID_ACTOR,
      nombre: 'Colectivo de tambora',
      manifestacion: 'Tambora y cantos de vaquería',
      descripcion: 'Cumbia y tambora en el Magdalena.',
      categoria: 'musica',
      contacto: { telefono: '3001234567', correo: null, whatsapp: null },
      estado: 'aprobado',
    });

    // Un segundo perfil aún sin aprobar, de OTRA cuenta: sobre este se prueba
    // quién puede mover «estado», que sobre uno ya aprobado no se distinguiría.
    await setDoc(doc(bd, 'actoresCulturales', ID_ACTOR_PENDIENTE), {
      idActor: ID_ACTOR_PENDIENTE,
      uid: UID_OTRO,
      nombre: 'Taller de tejido de Bonda',
      manifestacion: 'Telar de cintura',
      descripcion: 'Telar de cintura y saberes del territorio.',
      categoria: 'artesania',
      contacto: { telefono: null, correo: 'bonda@ejemplo.co', whatsapp: null },
      estado: 'pendiente',
    });

    await setDoc(doc(bd, 'eventos', 'evento-aprobado'), {
      idActor: ID_ACTOR,
      titulo: 'Cumbia y tambora: noche abierta',
      estadoPublicacion: 'aprobado',
      contadorConsultas: 0,
    });
    await setDoc(doc(bd, 'eventos', 'evento-pendiente'), {
      idActor: ID_ACTOR,
      titulo: 'Taller de tejido en telar de cintura',
      estadoPublicacion: 'pendiente',
      contadorConsultas: 0,
    });

    await setDoc(doc(bd, 'categorias', 'musica'), {
      nombre: 'Música y danza',
      activa: true,
    });
  });
});

after(async () => {
  await entorno?.cleanup();
});

describe('eventos · lectura pública', () => {
  it('un visitante sin sesión lee un evento aprobado', async () => {
    await assertSucceeds(getDoc(doc(visitante(), 'eventos', 'evento-aprobado')));
  });

  it('un visitante sin sesión NO lee un evento pendiente', async () => {
    await assertFails(getDoc(doc(visitante(), 'eventos', 'evento-pendiente')));
  });

  it('el actor dueño sí lee su propio evento pendiente', async () => {
    await assertSucceeds(
      getDoc(doc(comoUsuario(UID_ACTOR), 'eventos', 'evento-pendiente'))
    );
  });

  it('el administrador lee un evento pendiente', async () => {
    await assertSucceeds(
      getDoc(doc(comoUsuario(UID_ADMIN), 'eventos', 'evento-pendiente'))
    );
  });
});

describe('escritura sin sesión', () => {
  it('un visitante sin sesión NO crea un evento', async () => {
    await assertFails(
      setDoc(doc(visitante(), 'eventos', 'evento-nuevo'), {
        idActor: ID_ACTOR,
        titulo: 'Evento colado',
        estadoPublicacion: 'aprobado',
        contadorConsultas: 0,
        fechaCreacion: serverTimestamp(),
      })
    );
  });

  it('un visitante sin sesión NO crea un actor cultural', async () => {
    await assertFails(
      setDoc(doc(visitante(), 'actoresCulturales', 'actor-colado'), {
        uid: UID_ACTOR,
        nombre: 'Perfil colado',
        descripcion: 'x',
        estado: 'aprobado',
      })
    );
  });

  it('un visitante sin sesión NO escribe en una colección no declarada', async () => {
    await assertFails(
      setDoc(doc(visitante(), 'coleccionInventada', 'x'), { cualquiera: true })
    );
  });
});

describe('usuarios · alta de la cuenta (HU-12, HU-16)', () => {
  /** Documento de «usuarios» tal y como lo escribe authService al registrarse. */
  const alta = (uid, cambios = {}) => ({
    uid,
    nombre: 'Casa de la cultura',
    correo: `${uid}@ejemplo.co`,
    rol: 'actor',
    estado: 'activo',
    fechaRegistro: serverTimestamp(),
    consentimientoDatos: { aceptado: true, fecha: serverTimestamp(), version: '1.0' },
    ...cambios,
  });

  it('quien se registra crea su propio documento', async () => {
    const uid = 'uid-recien-llegado';
    await assertSucceeds(setDoc(doc(comoUsuario(uid), 'usuarios', uid), alta(uid)));
  });

  it('registrarse como hub también se permite', async () => {
    const uid = 'uid-hub-nuevo';
    await assertSucceeds(
      setDoc(doc(comoUsuario(uid), 'usuarios', uid), alta(uid, { rol: 'hub' }))
    );
  });

  it('NO se crea la cuenta sin aceptar el tratamiento de datos', async () => {
    const uid = 'uid-sin-consentimiento';
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'usuarios', uid),
        alta(uid, {
          consentimientoDatos: { aceptado: false, fecha: serverTimestamp(), version: '1.0' },
        })
      )
    );
  });

  it('NO se crea la cuenta sin el campo de consentimiento', async () => {
    const uid = 'uid-consentimiento-ausente';
    const sinConsentimiento = alta(uid);
    delete sinConsentimiento.consentimientoDatos;
    await assertFails(setDoc(doc(comoUsuario(uid), 'usuarios', uid), sinConsentimiento));
  });

  it('NO se crea la cuenta sin la versión de la política aceptada', async () => {
    const uid = 'uid-sin-version';
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'usuarios', uid),
        alta(uid, { consentimientoDatos: { aceptado: true, fecha: serverTimestamp() } })
      )
    );
  });

  it('NO se crea el documento de otra persona', async () => {
    await assertFails(
      setDoc(doc(comoUsuario('uid-intruso'), 'usuarios', 'uid-ajeno'), alta('uid-ajeno'))
    );
  });

  it('NO se concede a sí mismo el rol de administrador al registrarse', async () => {
    const uid = 'uid-aspirante-a-admin';
    await assertFails(
      setDoc(doc(comoUsuario(uid), 'usuarios', uid), alta(uid, { rol: 'administrador' }))
    );
  });

  it('NO se crea la cuenta con la fecha de registro puesta por el cliente', async () => {
    const uid = 'uid-fecha-inventada';
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'usuarios', uid),
        alta(uid, { fechaRegistro: new Date('2020-01-01') })
      )
    );
  });

  it('el dueño lee su propio documento', async () => {
    await assertSucceeds(getDoc(doc(comoUsuario(UID_ACTOR), 'usuarios', UID_ACTOR)));
  });

  it('NO se lee el documento de otra persona', async () => {
    await assertFails(getDoc(doc(comoUsuario(UID_OTRO), 'usuarios', UID_ACTOR)));
  });

  it('el administrador sí lo lee', async () => {
    await assertSucceeds(getDoc(doc(comoUsuario(UID_ADMIN), 'usuarios', UID_ACTOR)));
  });

  it('NO se retira el consentimiento editando el propio documento', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'usuarios', UID_ACTOR), {
        consentimientoDatos: { aceptado: false, fecha: serverTimestamp(), version: '1.0' },
      })
    );
  });

  it('el dueño sí corrige su nombre', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'usuarios', UID_ACTOR), {
        nombre: 'Colectivo de tambora del Magdalena',
      })
    );
  });
});

describe('propiedad del documento', () => {
  it('un usuario NO modifica el perfil de actor de otra persona', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_OTRO), 'actoresCulturales', ID_ACTOR), {
        nombre: 'Nombre suplantado',
      })
    );
  });

  it('el dueño sí modifica su propio perfil de actor', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
        nombre: 'Colectivo de tambora y gaita',
      })
    );
  });

  it('el dueño NO se aprueba a sí mismo: «estado» solo lo mueve el administrador', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_OTRO), 'actoresCulturales', ID_ACTOR_PENDIENTE), {
        estado: 'aprobado',
      })
    );
  });

  it('el administrador sí aprueba el perfil', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ADMIN), 'actoresCulturales', ID_ACTOR_PENDIENTE), {
        estado: 'aprobado',
      })
    );
  });

  it('un usuario NO se cambia el rol a sí mismo', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'usuarios', UID_ACTOR), {
        rol: 'administrador',
      })
    );
  });
});

describe('categorías · potestad del administrador', () => {
  it('un actor NO escribe en categorías', async () => {
    await assertFails(
      setDoc(doc(comoUsuario(UID_ACTOR), 'categorias', 'colada'), {
        nombre: 'Categoría colada',
        activa: true,
      })
    );
  });

  it('el administrador sí escribe en categorías', async () => {
    await assertSucceeds(
      setDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'patrimonio'), {
        idCategoria: 'patrimonio',
        nombre: 'Patrimonio',
        descripcion: '',
        activa: true,
      })
    );
  });

  it('cualquiera puede leerlas: los filtros públicos las necesitan', async () => {
    await assertSucceeds(getDoc(doc(visitante(), 'categorias', 'musica')));
  });
});

describe('moderaciones · devolver exige observación escrita', () => {
  it('devolver sin observaciones NO se registra', async () => {
    await assertFails(
      setDoc(doc(comoUsuario(UID_ADMIN), 'moderaciones', 'moderacion-1'), {
        idEvento: 'evento-pendiente',
        idAdministrador: UID_ADMIN,
        decision: 'devuelto',
        fecha: serverTimestamp(),
      })
    );
  });

  it('devolver con observaciones sí se registra', async () => {
    await assertSucceeds(
      setDoc(doc(comoUsuario(UID_ADMIN), 'moderaciones', 'moderacion-2'), {
        idEvento: 'evento-pendiente',
        idAdministrador: UID_ADMIN,
        decision: 'devuelto',
        observaciones: 'Falta la dirección exacta del lugar.',
        fecha: serverTimestamp(),
      })
    );
  });

  it('un actor NO registra una moderación', async () => {
    await assertFails(
      setDoc(doc(comoUsuario(UID_ACTOR), 'moderaciones', 'moderacion-3'), {
        idEvento: 'evento-pendiente',
        idAdministrador: UID_ACTOR,
        decision: 'aprobado',
        fecha: serverTimestamp(),
      })
    );
  });
});

describe('interacciones · registro anonimizado', () => {
  it('un visitante registra una consulta', async () => {
    await assertSucceeds(
      setDoc(doc(visitante(), 'interacciones', 'interaccion-1'), {
        idInteraccion: 'interaccion-1',
        idEvento: 'evento-aprobado',
        tipo: 'consulta',
        fecha: serverTimestamp(),
      })
    );
  });

  it('NO se admite un campo con datos del visitante', async () => {
    await assertFails(
      setDoc(doc(visitante(), 'interacciones', 'interaccion-2'), {
        idInteraccion: 'interaccion-2',
        idEvento: 'evento-aprobado',
        tipo: 'consulta',
        fecha: serverTimestamp(),
        correoVisitante: 'turista@ejemplo.co',
      })
    );
  });

  it('un visitante NO las lee: son solo para el panel de indicadores', async () => {
    await assertFails(getDoc(doc(visitante(), 'interacciones', 'interaccion-1')));
  });
});

describe('roles y permisos (HU-15)', () => {
  it('una cuenta activa con rol de actor crea su perfil', async () => {
    const uid = UIDS_SIN_PERFIL[0];
    await assertSucceeds(
      setDoc(doc(comoUsuario(uid), 'actoresCulturales', uid), perfilDeActor(uid))
    );
  });

  it('una cuenta desactivada NO crea perfil, aunque su rol sea el correcto', async () => {
    // El rol por sí solo no basta: tengoRol() exige además estado 'activo'. Es lo
    // que hace que desactivar una cuenta surta efecto sin borrar la credencial.
    //
    // El documento se escribe en su propio uid a propósito: en cualquier otra
    // ruta la denegación llegaría por el identificador y la prueba no diría nada
    // sobre el estado de la cuenta, que es lo que aquí se mide.
    await assertFails(
      setDoc(
        doc(comoUsuario(UID_DESACTIVADO), 'actoresCulturales', UID_DESACTIVADO),
        perfilDeActor(UID_DESACTIVADO)
      )
    );
  });

  it('un visitante sin sesión lee el catálogo aprobado sin registrarse', async () => {
    // Tercer criterio de HU-15: la parte pública no exige cuenta.
    await assertSucceeds(getDoc(doc(visitante(), 'eventos', 'evento-aprobado')));
    await assertSucceeds(getDoc(doc(visitante(), 'actoresCulturales', ID_ACTOR)));
    await assertSucceeds(getDoc(doc(visitante(), 'categorias', 'musica')));
  });

  it('un actor NO lista la colección de usuarios', async () => {
    await assertFails(getDocs(collection(comoUsuario(UID_ACTOR), 'usuarios')));
  });

  it('el administrador sí la lista', async () => {
    await assertSucceeds(getDocs(collection(comoUsuario(UID_ADMIN), 'usuarios')));
  });

  it('el actor dueño lee la moderación de su propio evento', async () => {
    await assertSucceeds(getDoc(doc(comoUsuario(UID_ACTOR), 'moderaciones', 'moderacion-2')));
  });

  it('otro actor NO lee esa moderación', async () => {
    await assertFails(getDoc(doc(comoUsuario(UID_OTRO), 'moderaciones', 'moderacion-2')));
  });

  it('un visitante sin sesión NO lee moderaciones', async () => {
    await assertFails(getDoc(doc(visitante(), 'moderaciones', 'moderacion-2')));
  });

  it('un actor NO lee las interacciones: alimentan el panel de indicadores', async () => {
    await assertFails(getDoc(doc(comoUsuario(UID_ACTOR), 'interacciones', 'interaccion-1')));
  });

  it('el administrador sí las lee', async () => {
    await assertSucceeds(getDoc(doc(comoUsuario(UID_ADMIN), 'interacciones', 'interaccion-1')));
  });

  it('un actor NO desactiva la cuenta de otra persona', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'usuarios', UID_OTRO), { estado: 'inactivo' })
    );
  });

  it('el administrador sí desactiva una cuenta', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ADMIN), 'usuarios', UID_OTRO), { estado: 'inactivo' })
    );
  });
});

describe('categorías · el catálogo no se borra (HU-17)', () => {
  const categoria = (id, cambios = {}) => ({
    idCategoria: id,
    nombre: 'Artesanía y oficios',
    descripcion: 'Telar, cestería y talla.',
    activa: true,
    ...cambios,
  });

  it('el administrador crea una categoría', async () => {
    await assertSucceeds(
      setDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'artesania'), categoria('artesania'))
    );
  });

  it('NO se crea con un identificador distinto del documento', async () => {
    // Dejaría un documento cuyo campo apunta a otra categoría, y las
    // publicaciones que lo guardaran quedarían clasificadas en la que no es.
    await assertFails(
      setDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'danza'), categoria('musica'))
    );
  });

  it('NO se crea con un campo que no está en el modelo', async () => {
    await assertFails(
      setDoc(
        doc(comoUsuario(UID_ADMIN), 'categorias', 'colada'),
        categoria('colada', { contadorInventado: 7 })
      )
    );
  });

  it('NO se crea sin nombre', async () => {
    await assertFails(
      setDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'sin-nombre'), categoria('sin-nombre', { nombre: '' }))
    );
  });

  it('el administrador la renombra', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'artesania'), {
        nombre: 'Artesanía, oficios y saberes',
      })
    );
  });

  it('NO se cambia el identificador al renombrar', async () => {
    // «eventos.categoria» guarda ese identificador: cambiarlo dejaría huérfanas
    // las publicaciones ya clasificadas.
    await assertFails(
      updateDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'artesania'), {
        idCategoria: 'otro-identificador',
      })
    );
  });

  it('el administrador la desactiva', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'artesania'), { activa: false })
    );
  });

  it('un actor NO la desactiva', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'categorias', 'artesania'), { activa: false })
    );
  });

  it('NADIE la elimina, tampoco el administrador', async () => {
    // No es un permiso que falte: es la garantía de que ninguna publicación se
    // quede sin clasificación. Las reglas no pueden contar los eventos que la
    // usan, así que la única promesa que el servidor puede cumplir es esta.
    await assertFails(deleteDoc(doc(comoUsuario(UID_ADMIN), 'categorias', 'artesania')));
  });

  it('una categoría desactivada se sigue leyendo: los eventos antiguos la nombran', async () => {
    await assertSucceeds(getDoc(doc(visitante(), 'categorias', 'artesania')));
  });
});

describe('perfil de actor cultural (HU-18)', () => {
  it('el identificador del perfil tiene que ser el uid de su dueño', async () => {
    // Un identificador cualquiera dejaría a la misma cuenta crear tantos
    // perfiles como quisiera, y las reglas no tendrían forma de contarlos.
    const uid = UIDS_SIN_PERFIL[1];
    await assertFails(
      setDoc(doc(comoUsuario(uid), 'actoresCulturales', 'escuela-de-gaitas'), perfilDeActor(uid))
    );
  });

  it('un actor con perfil NO crea un segundo', async () => {
    await assertFails(
      setDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', 'colectivo-bis'), {
        ...perfilDeActor(UID_ACTOR),
        idActor: 'colectivo-bis',
      })
    );
  });

  it('el perfil nace pendiente: nadie se publica solo', async () => {
    const uid = UIDS_SIN_PERFIL[2];
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'actoresCulturales', uid),
        perfilDeActor(uid, { estado: 'aprobado' })
      )
    );
  });

  it('sin manifestación no hay perfil: es lo que distingue a un actor de otro', async () => {
    const uid = UIDS_SIN_PERFIL[3];
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'actoresCulturales', uid),
        perfilDeActor(uid, { manifestacion: '' })
      )
    );
  });

  it('un campo que la interfaz nunca pinta no entra en el perfil', async () => {
    // El perfil se lee entero y en público: una clave inventada viajaría al
    // navegador de todo visitante sin que nadie la hubiera previsto.
    const uid = UIDS_SIN_PERFIL[4];
    await assertFails(
      setDoc(
        doc(comoUsuario(uid), 'actoresCulturales', uid),
        perfilDeActor(uid, { notasInternas: 'lo que sea' })
      )
    );
  });

  describe('límite de la descripción (tercer criterio)', () => {
    it('exactamente 1.000 caracteres se acepta: es el borde', async () => {
      const uid = UIDS_SIN_PERFIL[5];
      await assertSucceeds(
        setDoc(
          doc(comoUsuario(uid), 'actoresCulturales', uid),
          perfilDeActor(uid, { descripcion: 'a'.repeat(1000) })
        )
      );
    });

    it('un carácter de más lo rechaza el servidor, no solo el formulario', async () => {
      const uid = UIDS_SIN_PERFIL[6];
      await assertFails(
        setDoc(
          doc(comoUsuario(uid), 'actoresCulturales', uid),
          perfilDeActor(uid, { descripcion: 'a'.repeat(1001) })
        )
      );
    });

    it('tampoco se cuela al editar un perfil que ya existe', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          descripcion: 'a'.repeat(1001),
        })
      );
    });
  });

  describe('edición sin nueva aprobación (segundo criterio)', () => {
    it('el dueño edita su perfil aprobado y sigue aprobado', async () => {
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          descripcion: 'Cumbia, tambora y gaita en el Magdalena Grande.',
        })
      );
      // La comprobación que importa no es que la escritura pase, sino que el
      // perfil no haya vuelto a la cola: eso es lo que pide el criterio.
      const despues = await getDoc(doc(visitante(), 'actoresCulturales', ID_ACTOR));
      assert.equal(despues.data().estado, 'aprobado');
    });

    it('el dueño NO se aprueba a sí mismo por la puerta de atrás', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          estado: 'inactivo',
        })
      );
    });

    it('el dueño NO se cambia el uid para apropiarse de otro perfil', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          uid: UID_OTRO,
        })
      );
    });
  });

  describe('el perfil que todavía no existe', () => {
    it('el actor lee su propia ruta vacía antes de crear nada', async () => {
      // El defecto que encontró la comprobación en vivo del 26/08/2026. Sobre un
      // documento inexistente «resource» llega nulo, y sin la primera condición
      // de la regla la expresión entera falla: quien acababa de registrarse
      // abría /mi-perfil y leía «Missing or insufficient permissions» en lugar
      // del formulario vacío.
      const uid = UIDS_SIN_PERFIL[8];
      await assertSucceeds(getDoc(doc(comoUsuario(uid), 'actoresCulturales', uid)));
    });

    it('pero NO lee la ruta vacía de otra persona', async () => {
      // Si esto pasara, la dirección sería un detector: respondería distinto
      // para un uid sin perfil que para uno con perfil sin aprobar.
      await assertFails(
        getDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', UIDS_SIN_PERFIL[9]))
      );
    });

    it('un visitante sin sesión tampoco', async () => {
      await assertFails(getDoc(doc(visitante(), 'actoresCulturales', UIDS_SIN_PERFIL[9])));
    });
  });

  describe('directorio público (quinto criterio)', () => {
    it('un visitante sin cuenta lista los perfiles aprobados', async () => {
      await assertSucceeds(
        getDocs(
          query(
            collection(visitante(), 'actoresCulturales'),
            where('estado', '==', 'aprobado')
          )
        )
      );
    });

    it('y abre uno de ellos en su propia dirección', async () => {
      await assertSucceeds(getDoc(doc(visitante(), 'actoresCulturales', ID_ACTOR)));
    });

    it('pero NO lista la colección entera: hay perfiles sin aprobar dentro', async () => {
      // La consulta sin filtro alcanzaría documentos que la regla de lectura
      // deniega, y Firestore rechaza la consulta completa en lugar de devolver
      // los que sí puede. Por eso el servicio filtra por estado y no en memoria.
      await assertFails(getDocs(collection(visitante(), 'actoresCulturales')));
    });

    it('un perfil pendiente NO es legible por un visitante', async () => {
      const uid = UIDS_SIN_PERFIL[7];
      await entorno.withSecurityRulesDisabled(async (contexto) => {
        await setDoc(
          doc(contexto.firestore(), 'actoresCulturales', uid),
          perfilDeActor(uid)
        );
      });
      await assertFails(getDoc(doc(visitante(), 'actoresCulturales', uid)));
    });
  });
});

describe('imagen del perfil (HU-19)', () => {
  /** Una URI de datos del tamaño que se pida, con la forma que exige la regla. */
  const imagenDe = (caracteres, tipo = 'jpeg') => {
    const prefijo = `data:image/${tipo};base64,`;
    return prefijo + 'A'.repeat(Math.max(0, caracteres - prefijo.length));
  };

  it('un perfil con su imagen reducida se guarda', async () => {
    const uid = UIDS_SIN_PERFIL[10];
    await assertSucceeds(
      setDoc(
        doc(comoUsuario(uid), 'actoresCulturales', uid),
        perfilDeActor(uid, { imagen: imagenDe(60000) })
      )
    );
  });

  it('un perfil sin imagen también: la clave puede no estar', async () => {
    // La regla lee la imagen con «get» y valor por omisión. Si la leyera
    // directamente, un perfil sin ella fallaría entero, que es el defecto que
    // encontró HU-18 con «resource» nulo.
    const uid = UIDS_SIN_PERFIL[11];
    await assertSucceeds(
      setDoc(doc(comoUsuario(uid), 'actoresCulturales', uid), perfilDeActor(uid))
    );
  });

  it('y con la imagen puesta a nulo, que es como nace un perfil', async () => {
    const uid = UIDS_SIN_PERFIL[12];
    await assertSucceeds(
      setDoc(
        doc(comoUsuario(uid), 'actoresCulturales', uid),
        perfilDeActor(uid, { imagen: null })
      )
    );
  });

  describe('el tamaño lo impone el servidor', () => {
    it('acepta un carácter por debajo del límite: es el borde', async () => {
      const uid = UIDS_SIN_PERFIL[13];
      await assertSucceeds(
        setDoc(
          doc(comoUsuario(uid), 'actoresCulturales', uid),
          perfilDeActor(uid, { imagen: imagenDe(119999) })
        )
      );
    });

    it('el límite mismo se rechaza: la regla exige «menor que»', async () => {
      const uid = UIDS_SIN_PERFIL[14];
      await assertFails(
        setDoc(
          doc(comoUsuario(uid), 'actoresCulturales', uid),
          perfilDeActor(uid, { imagen: imagenDe(120000) })
        )
      );
    });

    it('tampoco se cuela al editar un perfil que ya existe', async () => {
      // Sin esto, bastaría con crear el perfil sin imagen y añadirla después.
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          imagen: imagenDe(150000),
        })
      );
    });
  });

  describe('el formato lo impone el servidor', () => {
    it('un GIF se rechaza aunque quepa de sobra', async () => {
      const uid = UIDS_SIN_PERFIL[15];
      await assertFails(
        setDoc(
          doc(comoUsuario(uid), 'actoresCulturales', uid),
          perfilDeActor(uid, { imagen: imagenDe(5000, 'gif') })
        )
      );
    });

    it('un SVG se rechaza: es código que el navegador ejecuta, no una fotografía', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          imagen: `data:image/svg+xml;base64,${'A'.repeat(200)}`,
        })
      );
    });

    it('una dirección http en lugar de una URI de datos se rechaza', async () => {
      // Es lo que se guardaría con Firebase Storage. Mientras no haya
      // presupuesto para activarlo, aquí no entra (docs/03 §6.1).
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
          imagen: 'https://ejemplo.co/foto.jpg',
        })
      );
    });

    it('un número en lugar de una cadena se rechaza', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), { imagen: 42 })
      );
    });
  });

  it('el dueño sí pone y quita su propia imagen', async () => {
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), {
        imagen: imagenDe(40000),
      })
    );
    await assertSucceeds(
      updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR), { imagen: null })
    );
  });

  it('otro actor NO le pone una imagen a mi perfil', async () => {
    await assertFails(
      updateDoc(doc(comoUsuario(UID_OTRO), 'actoresCulturales', ID_ACTOR), {
        imagen: imagenDe(40000),
      })
    );
  });
});

describe('hub de innovación (HU-20)', () => {
  /** Hub mínimo que las reglas aceptan. */
  const hubDe = (uid, cambios = {}) => ({
    idHub: uid,
    uid,
    nombre: 'Hub del Rodadero',
    descripcion: 'Espacio de formación para emprendimientos culturales.',
    lineasDeTrabajo: ['formación'],
    direccion: 'Carrera 3 # 10-20, El Rodadero',
    coordenadas: new GeoPoint(11.2, -74.22),
    contacto: { telefono: '3001234567', correo: null, whatsapp: null },
    estado: 'pendiente',
    ...cambios,
  });

  it('una cuenta con rol de hub registra el suyo', async () => {
    const uid = UIDS_HUB[0];
    await assertSucceeds(setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid)));
  });

  it('el identificador tiene que ser el uid de su responsable', async () => {
    const uid = UIDS_HUB[1];
    await assertFails(setDoc(doc(comoUsuario(uid), 'hubs', 'hub-caribe'), hubDe(uid)));
  });

  it('un actor cultural NO registra un hub', async () => {
    // El rol decide qué colección puedes estrenar, y no solo qué ves.
    await assertFails(setDoc(doc(comoUsuario(UID_ACTOR), 'hubs', UID_ACTOR), hubDe(UID_ACTOR)));
  });

  it('el hub nace pendiente: nadie se publica solo', async () => {
    const uid = UIDS_HUB[2];
    await assertFails(
      setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid, { estado: 'aprobado' }))
    );
  });

  describe('las líneas de trabajo', () => {
    it('sin ninguna no hay hub', async () => {
      const uid = UIDS_HUB[3];
      await assertFails(
        setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid, { lineasDeTrabajo: [] }))
      );
    });

    it('más de ocho tampoco', async () => {
      const uid = UIDS_HUB[4];
      const nueve = Array.from({ length: 9 }, (_, i) => `linea-${i}`);
      await assertFails(
        setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid, { lineasDeTrabajo: nueve }))
      );
    });

    it('una cadena en lugar de una lista se rechaza', async () => {
      const uid = UIDS_HUB[5];
      await assertFails(
        setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid, { lineasDeTrabajo: 'formación' }))
      );
    });
  });

  describe('el punto en el mapa (tercer criterio)', () => {
    it('sin coordenadas no se guarda', async () => {
      const uid = UIDS_HUB[6];
      const sinPunto = hubDe(uid);
      delete sinPunto.coordenadas;
      await assertFails(setDoc(doc(comoUsuario(uid), 'hubs', uid), sinPunto));
    });

    it('dos números sueltos no son un punto', async () => {
      // Sin «is latlng», el mapa de HU-30 recibiría esto donde espera un
      // GeoPoint y la consulta entera se caería.
      const uid = UIDS_HUB[7];
      await assertFails(
        setDoc(
          doc(comoUsuario(uid), 'hubs', uid),
          hubDe(uid, { coordenadas: { lat: 11.2, lon: -74.2 } })
        )
      );
    });

    it('tampoco una cadena con el punto escrito', async () => {
      const uid = UIDS_HUB[8];
      await assertFails(
        setDoc(
          doc(comoUsuario(uid), 'hubs', uid),
          hubDe(uid, { coordenadas: '11.24222, -74.21331' })
        )
      );
    });
  });

  it('un campo que la interfaz nunca pinta no entra en el hub', async () => {
    const uid = UIDS_HUB[9];
    await assertFails(
      setDoc(doc(comoUsuario(uid), 'hubs', uid), hubDe(uid, { notasInternas: 'lo que sea' }))
    );
  });

  describe('propiedad y aprobación', () => {
    it('el dueño edita su hub y sigue aprobado', async () => {
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_HUB_DUENO), 'hubs', ID_HUB), {
          descripcion: 'Espacio de formación, coworking y encuentro.',
        })
      );
      const despues = await getDoc(doc(visitante(), 'hubs', ID_HUB));
      assert.equal(despues.data().estado, 'aprobado');
    });

    it('otra persona NO edita mi hub', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UIDS_HUB[0]), 'hubs', ID_HUB), { nombre: 'Suplantado' })
      );
    });

    it('el dueño NO se aprueba ni se retira a sí mismo', async () => {
      await assertFails(
        updateDoc(doc(comoUsuario(UID_HUB_DUENO), 'hubs', ID_HUB), { estado: 'inactivo' })
      );
    });

    it('el administrador sí mueve el estado', async () => {
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ADMIN), 'hubs', ID_HUB), { estado: 'aprobado' })
      );
    });
  });

  describe('directorio público (segundo criterio)', () => {
    it('un visitante sin cuenta lista los hubs aprobados', async () => {
      await assertSucceeds(
        getDocs(query(collection(visitante(), 'hubs'), where('estado', '==', 'aprobado')))
      );
    });

    it('pero NO la colección entera: hay hubs sin aprobar dentro', async () => {
      await assertFails(getDocs(collection(visitante(), 'hubs')));
    });

    it('el responsable lee su propia ruta vacía antes de registrar nada', async () => {
      // La misma lección de HU-18: sobre un documento inexistente «resource»
      // llega nulo, y sin la primera condición de la regla quien abre /mi-hub
      // por primera vez leería un error de permisos.
      const uid = 'uid-hub-sin-registrar';
      await entorno.withSecurityRulesDisabled(async (contexto) => {
        await setDoc(doc(contexto.firestore(), 'usuarios', uid), {
          uid,
          rol: 'hub',
          estado: 'activo',
          correo: 'sin-registrar@ejemplo.co',
        });
      });
      await assertSucceeds(getDoc(doc(comoUsuario(uid), 'hubs', uid)));
    });

    it('pero NO la ruta vacía de otra persona', async () => {
      await assertFails(getDoc(doc(comoUsuario(UID_HUB_DUENO), 'hubs', 'uid-que-no-existe')));
    });
  });
});
describe('publicación de un evento (HU-21)', () => {
  /** Publicación mínima que las reglas aceptan, tal y como la escribe el servicio. */
  const publicacionDe = (idEvento, cambios = {}) => ({
    idEvento,
    idActor: ID_ACTOR,
    titulo: 'Taller de tambora',
    tituloNormalizado: 'taller de tambora',
    descripcion: 'Tres sesiones de introducción al toque de tambora, con instrumentos prestados.',
    categoria: 'musica',
    fechaInicio: new Date(2026, 8, 1, 18, 0),
    fechaFin: new Date(2026, 8, 1, 21, 0),
    lugar: 'Casa de la Cultura, Santa Marta',
    coordenadas: null,
    imagen: null,
    estadoPublicacion: 'pendiente',
    fechaCreacion: serverTimestamp(),
    contadorConsultas: 0,
    ...cambios,
  });

  const crear = (uid, idEvento, cambios = {}) =>
    setDoc(doc(comoUsuario(uid), 'eventos', idEvento), publicacionDe(idEvento, cambios));

  it('un actor con perfil publica (primer criterio)', async () => {
    await assertSucceeds(crear(UID_ACTOR, 'pub-1'));
  });

  it('el identificador del documento tiene que coincidir con «idEvento»', async () => {
    // Si no, un documento diría llamarse una cosa y vivir en otra ruta, y HU-24
    // registraría la moderación contra un identificador que no existe.
    await assertFails(
      setDoc(doc(comoUsuario(UID_ACTOR), 'eventos', 'pub-2'), publicacionDe('otro-cualquiera'))
    );
  });

  it('un actor SIN perfil no publica: no hay a quién atribuirlo', async () => {
    await assertFails(
      setDoc(
        doc(comoUsuario(UID_ACTOR_SIN_PERFIL), 'eventos', 'pub-3'),
        publicacionDe('pub-3', { idActor: UID_ACTOR_SIN_PERFIL })
      )
    );
  });

  it('y sigue sin poder aunque el perfil que invoque exista', async () => {
    // La comprobación anterior podría pasar por el motivo equivocado —que el
    // perfil no exista— y no por el que dice. Esta lo separa: el perfil existe,
    // pero es de otra persona.
    await assertFails(
      setDoc(
        doc(comoUsuario(UID_ACTOR_SIN_PERFIL), 'eventos', 'pub-3-bis'),
        publicacionDe('pub-3-bis')
      )
    );
  });

  it('nadie publica en nombre de otro actor (cuarto criterio)', async () => {
    // «idActor» es de UID_ACTOR y quien escribe es otra persona.
    await assertFails(crear(UID_OTRO, 'pub-4'));
  });

  it('un administrador tampoco publica en nombre de un actor', async () => {
    // Moderar no es escribir por otro: el administrador mueve estados (HU-24),
    // no crea contenido con la firma de alguien.
    await assertFails(crear(UID_ADMIN, 'pub-5'));
  });

  describe('nace pendiente (primer criterio)', () => {
    it('no se puede nacer aprobado', async () => {
      await assertFails(crear(UID_ACTOR, 'pub-6', { estadoPublicacion: 'aprobado' }));
    });

    it('ni empezar con visitas contadas', async () => {
      await assertFails(crear(UID_ACTOR, 'pub-7', { contadorConsultas: 42 }));
    });
  });

  describe('la fecha de creación la pone el servidor (cuarto criterio)', () => {
    it('una fecha inventada por el cliente se rechaza', async () => {
      // Sin esta regla, una publicación podría nacer fechada el año pasado y
      // colarse al principio de la cola de moderación de HU-24.
      await assertFails(
        crear(UID_ACTOR, 'pub-8', { fechaCreacion: new Date(2020, 0, 1) })
      );
    });

    it('y sin fecha de creación tampoco', async () => {
      const sinFecha = publicacionDe('pub-9');
      delete sinFecha.fechaCreacion;
      await assertFails(setDoc(doc(comoUsuario(UID_ACTOR), 'eventos', 'pub-9'), sinFecha));
    });
  });

  describe('el orden de las fechas (segundo criterio)', () => {
    it('terminar antes de empezar se rechaza también en el servidor', async () => {
      // El formulario ya lo impide, pero el formulario no es la defensa: quien
      // escriba por fuera de la interfaz encuentra aquí la misma respuesta.
      await assertFails(
        crear(UID_ACTOR, 'pub-10', { fechaFin: new Date(2026, 8, 1, 17, 0) })
      );
    });

    it('empezar y terminar a la vez es válido', async () => {
      const cuando = new Date(2026, 8, 1, 18, 0);
      await assertSucceeds(
        crear(UID_ACTOR, 'pub-11', { fechaInicio: cuando, fechaFin: cuando })
      );
    });

    it('una fecha que no es fecha se rechaza', async () => {
      await assertFails(crear(UID_ACTOR, 'pub-12', { fechaInicio: '1 de septiembre' }));
    });
  });

  describe('el título normalizado, que nadie mira nunca', () => {
    it('no puede decir algo distinto del título', async () => {
      // El moderador de HU-24 aprueba leyendo «titulo». Un «tituloNormalizado»
      // que dijera otra cosa entraría al catálogo sin que nadie lo notase y
      // respondería a búsquedas que no le corresponden (HU-27).
      await assertFails(
        crear(UID_ACTOR, 'pub-13', { tituloNormalizado: 'festival del mar gratis' })
      );
    });

    it('no puede llevar mayúsculas', async () => {
      await assertFails(crear(UID_ACTOR, 'pub-14', { tituloNormalizado: 'Taller de tambora' }));
    });

    it('un título con tildes y eñe se normaliza y se acepta', async () => {
      // Este caso mide algo que las pruebas no podían responder sobre el papel:
      // si «size()» cuenta caracteres o bytes. «Cañón» y «canon» tienen las
      // mismas cinco letras y distinto número de bytes en UTF-8.
      await assertSucceeds(
        crear(UID_ACTOR, 'pub-15', {
          titulo: 'Cañón de música',
          tituloNormalizado: 'canon de musica',
        })
      );
    });
  });

  describe('la forma del documento', () => {
    it('un campo que la interfaz nunca pinta no entra', async () => {
      await assertFails(crear(UID_ACTOR, 'pub-16', { destacado: true }));
    });

    it('sin lugar no se guarda', async () => {
      const sinLugar = publicacionDe('pub-17');
      delete sinLugar.lugar;
      await assertFails(setDoc(doc(comoUsuario(UID_ACTOR), 'eventos', 'pub-17'), sinLugar));
    });

    it('un punto en el mapa, si lo hay, tiene que ser un punto', async () => {
      await assertFails(
        crear(UID_ACTOR, 'pub-18', { coordenadas: { lat: 11.2, lon: -74.2 } })
      );
    });

    it('y un GeoPoint de verdad se acepta (lo rellenará HU-22)', async () => {
      await assertSucceeds(
        crear(UID_ACTOR, 'pub-19', { coordenadas: new GeoPoint(11.24, -74.21) })
      );
    });

    it('un SVG no es una imagen aceptable: es código', async () => {
      await assertFails(
        crear(UID_ACTOR, 'pub-20', {
          imagen: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        })
      );
    });
  });

  describe('el catálogo público (tercer criterio)', () => {
    it('un visitante lista lo aprobado', async () => {
      await assertSucceeds(
        getDocs(
          query(collection(visitante(), 'eventos'), where('estadoPublicacion', '==', 'aprobado'))
        )
      );
    });

    it('pero NO la colección entera: dentro hay publicaciones sin aprobar', async () => {
      // Esto es lo que sostiene el tercer criterio. No es que la vista esconda
      // lo pendiente: es que pedirlo falla.
      await assertFails(getDocs(collection(visitante(), 'eventos')));
    });

    it('y una publicación recién creada no sale en lo aprobado', async () => {
      const instantanea = await getDocs(
        query(collection(visitante(), 'eventos'), where('estadoPublicacion', '==', 'aprobado'))
      );
      const identificadores = instantanea.docs.map((documento) => documento.id);
      assert.equal(identificadores.includes('pub-1'), false);
    });
  });

  describe('la lista propia', () => {
    it('un actor lista sus publicaciones, en cualquier estado', async () => {
      await assertSucceeds(
        getDocs(query(collection(comoUsuario(UID_ACTOR), 'eventos'), where('idActor', '==', ID_ACTOR)))
      );
    });

    it('pero NO las de otro actor', async () => {
      await assertFails(
        getDocs(query(collection(comoUsuario(UID_OTRO), 'eventos'), where('idActor', '==', ID_ACTOR)))
      );
    });

    it('leer una publicación que no existe se deniega, no revienta', async () => {
      // La lección de HU-18 (docs/17 §10) aplicada al revés: sobre un documento
      // inexistente «resource» llega nulo, y sin la guarda la expresión entera
      // fallaría en lugar de responder que no.
      await assertFails(getDoc(doc(comoUsuario(UID_ACTOR), 'eventos', 'no-existe')));
    });
  });
});

/**
 * Georreferenciación de la publicación — HU-22 · RF-08.
 *
 * Este bloque cubre un hueco que HU-21 dejó abierto: «allow update» sobre
 * «eventos» estaba escrito y **no tenía un solo caso**. HU-21 probó a fondo el
 * nacimiento de una publicación y su lectura, y la edición se quedó descrita en
 * un comentario. El tercer criterio de esta historia —poder cambiar el punto— es
 * la primera vez que alguien escribe por ahí, así que es aquí donde toca.
 */
describe('el punto de una publicación (HU-22)', () => {
  const PUNTO = new GeoPoint(11.2452, -74.2145);

  /** Siembra una publicación sin pasar por las reglas y devuelve su ruta. */
  const sembrarPublicacion = async (idEvento, cambios = {}) => {
    await entorno.withSecurityRulesDisabled(async (contexto) => {
      await setDoc(doc(contexto.firestore(), 'eventos', idEvento), {
        idEvento,
        idActor: ID_ACTOR,
        titulo: 'Taller de tambora',
        tituloNormalizado: 'taller de tambora',
        descripcion:
          'Tres sesiones de introducción al toque de tambora, con instrumentos prestados.',
        categoria: 'musica',
        fechaInicio: new Date(2026, 8, 1, 18, 0),
        fechaFin: new Date(2026, 8, 1, 21, 0),
        lugar: 'Casa de la Cultura, Santa Marta',
        coordenadas: null,
        imagen: null,
        estadoPublicacion: 'pendiente',
        fechaCreacion: new Date(2026, 7, 20, 9, 0),
        contadorConsultas: 0,
        ...cambios,
      });
    });
    return idEvento;
  };

  describe('quién puede moverlo (tercer criterio)', () => {
    it('su autor sitúa el punto de una publicación en revisión', async () => {
      const id = await sembrarPublicacion('geo-1');
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), { coordenadas: PUNTO })
      );
    });

    it('y también puede quitarlo: sin punto es un estado legítimo', async () => {
      const id = await sembrarPublicacion('geo-2', { coordenadas: PUNTO });
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), { coordenadas: null })
      );
    });

    it('otro actor no mueve el punto de una publicación ajena', async () => {
      const id = await sembrarPublicacion('geo-3');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_OTRO), 'eventos', id), { coordenadas: PUNTO })
      );
    });

    it('un visitante tampoco, aunque esté aprobada y él pueda leerla', async () => {
      // Poder leer y poder escribir no son lo mismo, y es el error que este caso
      // vigila: la publicación aprobada es pública desde HU-21.
      const id = await sembrarPublicacion('geo-4', { estadoPublicacion: 'aprobado' });
      await assertFails(updateDoc(doc(visitante(), 'eventos', id), { coordenadas: PUNTO }));
    });
  });

  describe('el límite que hereda de HU-21', () => {
    it('sobre una publicación YA APROBADA su autor no puede', async () => {
      // No es una decisión de HU-22 sino la regla de HU-21, que exige que lo
      // escrito siga siendo 'pendiente'. Se prueba aquí porque es aquí donde por
      // primera vez alguien intenta escribir, y porque la interfaz esconde el
      // botón basándose en esto: si la regla cambiara, el caso avisaría.
      const id = await sembrarPublicacion('geo-5', { estadoPublicacion: 'aprobado' });
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), { coordenadas: PUNTO })
      );
    });

    it('ni aprobándose de paso, que sería la forma de saltárselo', async () => {
      const id = await sembrarPublicacion('geo-6');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: PUNTO,
          estadoPublicacion: 'aprobado',
        })
      );
    });

    it('un administrador sí puede moverlo aunque esté aprobada', async () => {
      const id = await sembrarPublicacion('geo-7', { estadoPublicacion: 'aprobado' });
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ADMIN), 'eventos', id), { coordenadas: PUNTO })
      );
    });
  });

  describe('lo que no se puede colar junto al punto', () => {
    it('las visitas contadas no se tocan', async () => {
      const id = await sembrarPublicacion('geo-8');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: PUNTO,
          contadorConsultas: 9999,
        })
      );
    });

    it('la fecha de creación tampoco: es la que ordena la cola de HU-24', async () => {
      const id = await sembrarPublicacion('geo-9');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: PUNTO,
          fechaCreacion: new Date(2020, 0, 1),
        })
      );
    });

    it('ni la publicación cambia de dueño', async () => {
      const id = await sembrarPublicacion('geo-10');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: PUNTO,
          idActor: UID_OTRO,
        })
      );
    });

    it('un objeto con lat y lon no es un punto: tiene que ser un GeoPoint', async () => {
      const id = await sembrarPublicacion('geo-11');
      await assertFails(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: { lat: 11.2452, lon: -74.2145 },
        })
      );
    });
  });

  /**
   * La pregunta que el código no podía responder solo.
   *
   * «toca()» pregunta por «diff().affectedKeys()», y de ahí depende una decisión
   * de «eventosService»: si «affectedKeys» contase las claves *enviadas*,
   * reescribir el documento entero sería imposible aunque los valores fuesen
   * idénticos, y actualizar solo una clave sería obligatorio. Si cuenta las
   * claves cuyo *valor cambió*, reenviar lo mismo pasa, y escribir solo el punto
   * es una economía y no una obligación.
   *
   * Suponerlo sería exactamente el error de HU-21 —una prueba que pasa por el
   * motivo equivocado—, así que se le pregunta al emulador.
   */
  describe('¿reescribir un campo con el mismo valor cuenta como tocarlo?', () => {
    it('no: «affectedKeys» mira los valores, no las claves enviadas', async () => {
      const id = await sembrarPublicacion('geo-12');
      await assertSucceeds(
        updateDoc(doc(comoUsuario(UID_ACTOR), 'eventos', id), {
          coordenadas: PUNTO,
          // El mismo dueño que ya tiene. Si esto fallara, la respuesta sería la
          // contraria y habría que corregir el comentario de eventosService.js.
          idActor: ID_ACTOR,
        })
      );
    });
  });
});
