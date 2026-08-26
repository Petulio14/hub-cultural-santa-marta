# Estructura del proyecto de React

> **Historia de usuario:** HU-07 · Sprint 3
> **Objetivo específico:** 2 — Materializar la arquitectura por capas en una base de código.
> **Requisito asociado:** RNF-09 (mantenibilidad y evolucionabilidad).
> **Depende de:** [HU-04 · arquitectura](03-arquitectura.md).

Este documento describe la base sobre la que se construyen todos los módulos funcionales
de los sprints 4 a 7: cómo se ejecuta el proyecto, qué hay en cada carpeta, qué rutas
existen y cómo se comprueba que la arquitectura se respeta.

---

## 1. Cómo se ejecuta

Requiere **Node.js 20 o superior** (verificado con 24.13). Desde la raíz del repositorio:

```bash
npm install
```

```bash
npm run dev
```

La aplicación queda en `http://localhost:5173`. No necesita Firebase para arrancar: las
vistas del Sprint 3 son estáticas, y `src/services/firebase.js` avisa por consola si falta
`.env.local` en lugar de interrumpir la carga.

| Orden | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compila a `dist/`. Es el mismo comando que ejecuta Vercel (`vercel.json`). |
| `npm run preview` | Sirve `dist/` para revisar la compilación antes de publicarla. |
| `npm run verificar` | Comprueba las tres reglas estructurales de la sección 5. |

**Herramientas:** React 19 con Vite como empaquetador y `react-router-dom` 7 como enrutador
del lado del cliente. Se descartó TypeScript: la ganancia no compensa el costo de
aprendizaje dentro del presupuesto de 12 horas semanales del equipo (R-03).

## 2. Estructura de carpetas

Es la estructura derivada en [`03-arquitectura.md` §5](03-arquitectura.md), ya creada:

```
index.html              punto de entrada de Vite
vite.config.js          configuración del empaquetado
public/                 archivos servidos tal cual (logotipo institucional)
herramientas/           utilidades del repositorio, sin dependencias
└── verificar-capas.js  verificación estructural
src/
├── main.jsx            monta React sobre #raiz
├── components/         componentes reutilizables sin lógica de datos
│   ├── Cabecera.jsx        barra superior con la marca institucional
│   ├── PieDePagina.jsx
│   ├── Disposicion.jsx     cabecera + contenido + pie, común a todas las vistas
│   ├── ErrorDeRuta.jsx     red de seguridad ante un fallo de renderizado
│   └── VistaPendiente.jsx  marcador de vista aún no desarrollada
├── views/              una carpeta por vista del prototipo (V-1 a V-9)
├── services/           ÚNICO punto de acceso a Firebase
│   └── firebase.js         inicialización del SDK
├── hooks/              useSesion, useTituloDeRuta
├── utils/              utilidades puras (titulo.js)
├── routes/             tabla de rutas y control de acceso
│   ├── rutas.jsx
│   └── RutaPrivada.jsx
└── styles/             variables de la paleta y estilos globales
```

Los servicios que aún no existen —`eventosService`, `authService` y los demás— se crean en
la historia que los necesita, no antes.

## 3. Rutas

Cada ruta corresponde a una vista del prototipo de HU-06, con el mismo identificador `V-n`
de [`05-prototipo-interfaz.md` §2](05-prototipo-interfaz.md):

| Ruta | Vista | Acceso | Se desarrolla en |
| --- | --- | --- | --- |
| `/` | V-1 · Inicio | Pública | HU-09, HU-10 |
| `/eventos` | V-2 · Catálogo | Pública | HU-25, HU-26, HU-27 |
| `/eventos/:id` | V-3 · Detalle de evento | Pública | HU-28, HU-29 |
| `/actores` | V-4 · Directorio de actores culturales | Pública | HU-18 |
| `/actores/:id` | V-4 · Perfil de actor cultural | Pública | HU-18, HU-19 |
| `/hubs` | V-5 · Directorio de hubs | Pública | HU-20 |
| `/mapa` | V-6 · Mapa interactivo | Pública | HU-30, HU-33 |
| `/admin` | V-7 · Panel de administración | Privada · rol administrador | HU-17, HU-24, HU-34 |
| `/ingreso` | V-8 · Ingreso y registro | Pública | HU-12, HU-13, HU-14, HU-16 |
| `/mi-perfil` | V-4 · Mi perfil de actor cultural | Privada · rol actor cultural | HU-18, HU-19 |
| `/mis-publicaciones` | V-9 · Mis publicaciones | Privada · rol actor cultural | HU-21, HU-22, HU-23 |
| cualquier otra | Página no encontrada | Pública | HU-07 |

Las vistas todavía no desarrolladas muestran un marcador que declara a qué vista del
prototipo corresponden y qué historia las construirá. Ninguna dirección del enrutador lleva
a una pantalla en blanco.

**Título de la pestaña.** En una aplicación de página única el navegador no cambia el
título al navegar. Cada ruta declara el suyo en `handle.titulo` y `useTituloDeRuta` lo
escribe en el documento, para que el cambio de vista sea perceptible también con lector de
pantalla.

### Rutas privadas

`RutaPrivada` exige sesión y, opcionalmente, un rol. Sin sesión redirige a `/ingreso`
recordando la dirección solicitada, para volver a ella tras el ingreso (HU-13).

Mientras la autenticación no exista —llega en HU-12 y HU-13—, `useSesion` declara que no
hay nadie autenticado y las dos rutas privadas redirigen. Es el comportamiento correcto
para un visitante, y el que seguirá vigente cuando el cuerpo del hook se sustituya por el
escuchador de Firebase Authentication.

Esta es solo la **mitad visible** del control de acceso. La otra mitad son las reglas de
seguridad de Firestore (HU-11), que rechazan la operación aunque se intente desde fuera de
la interfaz. Una sin la otra no cumple RNF-08.

## 4. Página de error controlada

Hay dos situaciones distintas y cada una tiene su pantalla:

| Situación | Qué se muestra |
| --- | --- |
| La dirección no corresponde a ninguna vista | **Error 404** con la dirección solicitada y un botón de regreso al inicio. |
| Una vista falla al renderizar | **«No pudimos mostrar esta página»**, con el detalle técnico en letra pequeña y un botón de regreso. |

La segunda es el `errorElement` del enrutador: cubre el fallo de programación, que de otro
modo dejaría la pantalla en blanco sin explicación.

## 5. Verificación estructural

```bash
npm run verificar
```

Comprueba tres reglas y termina con código distinto de cero si alguna se incumple:

| # | Regla | De dónde sale |
| --- | --- | --- |
| 1 | Ningún archivo fuera de `src/services/` importa el SDK de Firebase. | Segundo criterio de aceptación de HU-04 ([03 §3](03-arquitectura.md)). |
| 2 | Toda vista de `src/views/` está declarada en la tabla de rutas. | Una vista que nadie enruta es código muerto que aparenta existir. |
| 3 | Ningún color hexadecimal fuera de `src/styles/variables.css`. | Los contrastes verificados de [05 §3](05-prototipo-interfaz.md) solo se sostienen si los valores viven en un único sitio. |

La regla 1 estaba escrita en la documentación de arquitectura como un `grep` que había que
acordarse de ejecutar. Ahora es una orden del proyecto, y las otras dos aprovechan el mismo
recorrido de archivos.

Salida con el proyecto en su estado actual:

```
Verificación estructural · 26 archivos en src/, 10 vistas
  acceso a datos solo por src/services/ : correcto
  todas las vistas enrutadas             : correcto
  colores solo en variables.css          : correcto

Sin incidencias.
```

**Comprobado que detecta lo que dice detectar.** Introduciendo a propósito una vista que
importa `firebase/firestore`, que nadie enruta, y un color escrito a mano en una hoja de
estilos, las tres reglas fallan y la orden termina en error:

```
3 incidencia(s):
  · src/views/PruebaNegativa.jsx importa el SDK de Firebase; debe hacerlo a través de src/services/
  · la vista PruebaNegativa.jsx no está declarada en src/routes/rutas.jsx
  · src/styles/prueba-negativa.css escribe el color #ff0000; usa una variable de src/styles/variables.css
```

Una verificación que nunca se ha visto fallar no es una verificación. Es la misma regla que
se aplicó al plugin de Figma en HU-06.

## 6. Cierre de HU-07

| Criterio de aceptación | Evidencia |
| --- | --- |
| Al ejecutarse en local debe iniciar **sin errores en consola**. | `npm run dev` sobre `http://localhost:5173`: la consola solo registra la conexión de Vite y el aviso informativo de React DevTools. Ningún error ni advertencia. |
| La estructura debe **separar componentes, vistas, servicios y utilidades**. | Sección 2. Es la estructura derivada en HU-04, y la regla de acceso a datos que la sostiene se verifica con `npm run verificar`. |
| Una ruta inexistente debe mostrar una **página de error controlada**. | Sección 4. Comprobado con `/esto-no-existe`: se muestra el 404 con la dirección solicitada y el regreso al inicio. |

Queda fuera de esta historia, por corresponder a otras: el contenido de la página de inicio
(HU-09), su adaptación a los tres anchos (HU-10) y la conexión con Firebase (HU-11, HU-12).

---

*Elaboración propia (2026).*
