/**
 * Pruebas de las reglas de seguridad de Cloud Firestore — HU-11, HU-12, HU-15, HU-16,
 * HU-17, HU-18.
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
const UIDS_SIN_PERFIL = Array.from({ length: 8 }, (_, i) => `uid-sin-perfil-${i + 1}`);

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

    for (const uid of UIDS_SIN_PERFIL) {
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
