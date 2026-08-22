/**
 * Pruebas de las reglas de seguridad de Cloud Firestore — HU-11.
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
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  setLogLevel,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Cada denegación esperada hace que el SDK imprima un PERMISSION_DENIED. Son el
// resultado correcto de la prueba, no un problema, y llenan la salida de ruido.
setLogLevel('silent');

const UID_ACTOR = 'uid-actor';
const UID_OTRO = 'uid-otro-actor';
const UID_ADMIN = 'uid-admin';
const ID_ACTOR = 'actor-1';
const ID_ACTOR_PENDIENTE = 'actor-2';

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
    await setDoc(doc(bd, 'usuarios', UID_ADMIN), {
      uid: UID_ADMIN,
      rol: 'administrador',
      estado: 'activo',
      correo: 'admin@ejemplo.co',
    });

    await setDoc(doc(bd, 'actoresCulturales', ID_ACTOR), {
      uid: UID_ACTOR,
      nombre: 'Colectivo de tambora',
      descripcion: 'Cumbia y tambora en el Magdalena.',
      estado: 'aprobado',
    });

    // Un segundo perfil aún sin aprobar: sobre este se prueba quién puede
    // mover «estado», que sobre uno ya aprobado no se podría distinguir.
    await setDoc(doc(bd, 'actoresCulturales', ID_ACTOR_PENDIENTE), {
      uid: UID_ACTOR,
      nombre: 'Taller de tejido de Bonda',
      descripcion: 'Telar de cintura y saberes del territorio.',
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
      updateDoc(doc(comoUsuario(UID_ACTOR), 'actoresCulturales', ID_ACTOR_PENDIENTE), {
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
        nombre: 'Patrimonio',
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
