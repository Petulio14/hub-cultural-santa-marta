# Puesta en marcha de Firebase y Vercel

> **Historias:** HU-08 (despliegue continuo) y HU-11 (reglas de seguridad) · Sprint 3
> **Requisitos:** RNF-05, RNF-08, RNF-09, RNF-10

Los archivos de configuración ya están en el repositorio. Lo que falta es **crear las
cuentas y los proyectos**, que exige iniciar sesión y aceptar términos, y eso tiene que
hacerlo una persona. Esta guía deja cada paso escrito para que no haya que decidir nada
sobre la marcha.

Tiempo estimado: **35 minutos** las dos plataformas.

---

## Qué hay ya resuelto en el repositorio

| Archivo | Para qué |
| --- | --- |
| `firestore.rules` | Reglas de seguridad completas de las 7 colecciones. Es el entregable de **HU-11**. |
| `firestore.indexes.json` | Los 6 índices compuestos. Se genera desde `docs/04-modelo-datos.md` §10, así que no pueden divergir. |
| `storage.rules` | Lectura pública, escritura solo del propietario, JPG/PNG de hasta 2 MB (**HU-19**). |
| `firebase.json` | Enlaza las reglas y los índices, y configura los emuladores locales. |
| `.firebaserc.ejemplo` | Plantilla del identificador de proyecto. |
| `.env.example` | Las seis variables del SDK que hay que rellenar. |
| `vercel.json` | Build de Vite, reescritura de rutas para el enrutador del cliente y cabeceras de seguridad. |
| `.gitignore` | Excluye `.env.local` y `.firebaserc` con los valores reales. |

---

## Parte 1 · Firebase (20 min)

### 1.1 Crear el proyecto

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) con la cuenta de Google del equipo.
2. **Crear un proyecto** → nombre `hub-cultural-santa-marta`.
3. **Desactiva Google Analytics.** No se usa, y activarlo añade una vinculación con otro
   servicio que no aporta nada al alcance.
4. Anota el **ID del proyecto** que Firebase asigna (será algo como `hub-cultural-santa-marta`
   o con un sufijo si el nombre estaba tomado).

### 1.2 Habilitar los tres servicios

**Authentication** → *Comenzar* → pestaña *Sign-in method* → habilitar **Correo electrónico
y contraseña**. No habilites ningún otro proveedor: el alcance solo contempla ese (RF-01).

**Firestore Database** → *Crear base de datos*:
- Modo: **producción** (empieza cerrado; las reglas del repositorio lo abren donde toca).
- Ubicación: **`southamerica-east1`** (São Paulo), la más cercana a Colombia entre las
  disponibles. **Esta elección no se puede cambiar después.**

**Storage** → *Comenzar* → misma ubicación, modo producción.

> Los tres caben de sobra en el nivel gratuito para el volumen del prototipo (RNF-10).

### 1.3 Registrar la aplicación web

1. En *Configuración del proyecto* (el engranaje) → *Tus apps* → icono **`</>`**.
2. Apodo: `hub-cultural-web`. **No** marques Firebase Hosting: el despliegue es en Vercel.
3. Firebase muestra el objeto `firebaseConfig`. Copia los seis valores.

### 1.4 Rellenar las variables locales

```bash
cp .env.example .env.local
```

Rellena `.env.local` con los seis valores del paso anterior. `.gitignore` ya lo excluye, así
que no se sube al repositorio.

Este paso **no se hace en la consola de Firebase ni en ninguna página web**: es un archivo
de texto en la carpeta del proyecto, en el computador. Del objeto `firebaseConfig` que
muestra Firebase se copia solo el valor de cada línea, sin las comillas ni la coma:

| Del objeto `firebaseConfig` | A `.env.local` |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

El resto del fragmento que muestra Firebase —el `import`, el `initializeApp`— no se copia:
eso ya está escrito en `src/services/firebase.js`, que lee estas seis variables.

**Vite lee `.env.local` una sola vez, al arrancar.** Si el servidor de desarrollo estaba en
marcha, hay que pararlo y volver a lanzar `npm run dev`; si no, seguirá creyendo que no hay
configuración.

Para comprobar que quedó bien, con `npm run dev` en marcha, en la consola del navegador:

```js
const f = await import('/src/services/firebase.js');
console.log(f.configuracionCompleta, f.db.app.options.projectId);
```

Debe imprimir `true` y el identificador del proyecto.

### 1.5 Publicar las reglas y los índices

Instala la CLI de Firebase y vincula el proyecto:

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

```bash
firebase use --add
```

Elige el proyecto de la lista y ponle el alias `default`. Eso genera `.firebaserc`
(excluido del repositorio); si el archivo ya existe con el identificador correcto, este
paso se puede saltar. Después:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Los índices tardan unos minutos en construirse; el estado se ve en *Firestore → Índices*.

> **Sobre la validación de las reglas.** `firestore.rules` y `storage.rules` pasaron una
> revisión estructural (balanceo, funciones declaradas y usadas, cobertura de las 7
> colecciones, cierre por defecto denegando todo), pero **no se compilaron**: hacerlo exige
> el emulador de Firestore, que no arranca sin un proyecto creado. La compilación real
> ocurre en este `firebase deploy`, y si hubiera un error de sintaxis lo señala con número
> de línea en cuestión de segundos. El editor de reglas de la consola también valida al
> guardar.

### 1.6 Comprobar que las reglas hacen lo que deben

Este es el criterio de aceptación de HU-11, y conviene verificarlo antes de escribir código
que dependa de ello.

> **Ya no hace falta hacerlo a mano.** Estas seis simulaciones —y quince más— están escritas
> como pruebas automáticas que corren contra el emulador:
>
> ```bash
> npm run probar:reglas
> ```
>
> Véase [11-reglas-de-seguridad.md](11-reglas-de-seguridad.md). La tabla se conserva porque
> sigue siendo la forma de comprobar una regla suelta sin escribir código, en
> *Firestore → Reglas → Área de pruebas de Reglas*:

| Simulación | Ubicación | Autenticado | Resultado esperado |
| --- | --- | --- | --- |
| `get` | `/eventos/prueba` con `estadoPublicacion: "aprobado"` | no | **permitido** |
| `get` | `/eventos/prueba` con `estadoPublicacion: "pendiente"` | no | **denegado** |
| `create` | `/eventos/otro` | no | **denegado** |
| `update` | `/actoresCulturales/x` con `uid` de otra persona | sí | **denegado** |
| `write` | `/categorias/y` con rol `actor` | sí | **denegado** |
| `create` | `/moderaciones/z` con `decision: "devuelto"` sin `observaciones` | sí, admin | **denegado** |

Si las seis dan el resultado esperado, HU-11 queda demostrada.

### 1.7 Crear la cuenta de administrador

El rol vive en el documento de `usuarios`, no en Authentication (docs/04 §3). Como todavía
no hay interfaz de registro, se crea a mano una sola vez:

1. *Authentication → Users → Añadir usuario* con el correo del administrador. Copia el **UID**.
2. *Firestore → Iniciar colección* → `usuarios` → **ID del documento = ese mismo UID**, con:

| Campo | Tipo | Valor |
| --- | --- | --- |
| `uid` | string | el UID copiado |
| `nombre` | string | nombre del administrador |
| `correo` | string | el correo usado |
| `rol` | string | `administrador` |
| `estado` | string | `activo` |
| `fechaRegistro` | timestamp | la fecha de hoy |
| `consentimientoDatos` | map | `{ aceptado: true, fecha: <hoy>, version: "1.0" }` |

> Sin este documento, `soyAdmin()` devuelve falso para todo el mundo y el panel de
> moderación queda inaccesible.

---

## Parte 2 · Vercel (15 min)

> Vercel necesita un `package.json` para construir. Si el proyecto de React todavía no
> existe (**HU-07**), haz primero esa historia y vuelve aquí.

### 2.1 Conectar el repositorio

1. Entra a [vercel.com](https://vercel.com) e inicia sesión **con la cuenta de GitHub**
   (`Petulio14`). Así el repositorio queda disponible sin configurar nada más.
2. *Add New → Project* → importar `Petulio14/hub-cultural-santa-marta`.
3. Vercel detecta Vite por `vercel.json`. No cambies el comando de build ni el directorio
   de salida: ya están fijados ahí.

### 2.2 Cargar las variables de entorno

En *Settings → Environment Variables*, añade las **seis** variables de `.env.local` con sus
valores, marcadas para los tres entornos (*Production*, *Preview*, *Development*).

> Si faltan, el despliegue compila pero la aplicación arranca sin conexión a Firebase y
> falla en el primer acceso a datos.

### 2.3 Desplegar y anotar la dirección

*Deploy*. Al terminar queda una dirección pública del tipo
`hub-cultural-santa-marta.vercel.app`. **Anótala en el issue de HU-08 y en el README**: es
la evidencia que pide el criterio de aceptación.

### 2.4 Autorizar el dominio en Firebase

Vuelve a *Firebase → Authentication → Settings → Dominios autorizados* y añade el dominio
de Vercel. Sin esto, el inicio de sesión funciona en local pero **falla en producción**, y
es un fallo que despista porque no da un error claro.

### 2.5 Comprobar el despliegue continuo

Cada integración en `master` genera un despliegue nuevo sin intervención manual, y cada
pull request genera un *Preview* con su propia dirección. Eso último es útil para la Sprint
Review: se puede enseñar el incremento antes de fusionarlo.

Para demostrar el criterio de HU-08, basta con integrar un cambio pequeño en `master` y
verificar que aparece un despliegue nuevo en el panel de Vercel sin haber hecho nada.

---

## Desarrollo local sin tocar los datos reales

`firebase.json` ya trae configurados los emuladores. Para trabajar contra datos de prueba:

```bash
firebase emulators:start
```

Levanta Authentication en el 9099, Firestore en el 8080, Storage en el 9199 y un panel en
[localhost:4000](http://localhost:4000). Las mismas reglas del repositorio se aplican en el
emulador, así que sirve también para probar los rechazos de HU-35 sin ensuciar producción.

---

## Cuando exista el proyecto de React (HU-07)

`src/services/firebase.js` es el único archivo del proyecto que puede importar el SDK
(regla de `docs/03-arquitectura.md` §3):

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const configuracion = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(configuracion);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

El resto de servicios (`eventosService`, `authService`…) importan `db`, `auth` y `storage`
**de este archivo**, nunca de `firebase/*` directamente. La comprobación está en
`docs/03-arquitectura.md` §3.

---

## Registro de lo hecho

Marca aquí conforme avances; sirve de evidencia en la Sprint Review.

| # | Paso | Estado |
| --- | --- | --- |
| 1 | Proyecto de Firebase creado | ✅ 22/08/2026 |
| 2 | Authentication, Firestore y Storage habilitados | ◨ Firestore sí; **Storage sin configurar** |
| 3 | Aplicación web registrada y `.env.local` relleno | ✅ 22/08/2026 |
| 4 | Reglas e índices publicados | ✅ 22/08/2026 · Firestore: reglas compiladas y 6 índices |
| 5 | Las seis simulaciones de §1.6 dan el resultado esperado | ✅ 22/08/2026 · automatizadas: 21 casos en verde ([11](11-reglas-de-seguridad.md)) |
| 6 | Cuenta de administrador creada | ⬜ |
| 7 | Proyecto de Vercel conectado con sus variables | ✅ 22/08/2026 |
| 8 | Dirección pública anotada en HU-08 y en el README | ✅ 22/08/2026 |
| 9 | Dominio de Vercel autorizado en Firebase | ✅ 22/08/2026 |
| 10 | Despliegue automático verificado con un cambio en `master` | ✅ 22/08/2026 · despliegue de `10acd0f`, hoy `a2f65ae` ([12](12-despliegue-continuo.md) §4) |

**ID del proyecto de Firebase:** `hub-cultural-santa-marta`
**Dirección pública en Vercel:** https://hub-cultural-santa-marta.vercel.app

---

*Elaboración propia (2026).*
