# Despliegue continuo

> **Historia de usuario:** HU-08 · Sprint 3
> **Objetivo específico:** 2 — Disponer de un incremento verificable en cada integración.
> **Requisitos asociados:** RNF-08 (control de acceso al código), RNF-09 (mantenibilidad).
> **Depende de:** [HU-07 · estructura del proyecto](08-estructura-del-proyecto.md).

La dirección pública del prototipo es:

**https://hub-cultural-santa-marta.vercel.app**

---

## 1. Cómo está montado

| Pieza | Cómo queda resuelta |
| --- | --- |
| Repositorio | GitHub, `Petulio14/hub-cultural-santa-marta`. |
| Publicación | Vercel, conectado al repositorio. Cada integración en `master` dispara una compilación. |
| Compilación | `npm run build` sobre Vite; se publica `dist/`. Declarado en [`../vercel.json`](../vercel.json). |
| Configuración | Las seis variables `VITE_FIREBASE_*` cargadas en *Settings → Environment Variables*. No están en el repositorio. |
| Dominio autorizado | `hub-cultural-santa-marta.vercel.app` añadido en *Firebase → Authentication → Dominios autorizados*, para que el inicio de sesión funcione también en el sitio publicado. |

No hay servidor propio: la aplicación se publica como sitio estático, que es la razón por la
que la arquitectura eligió una SPA ([03 §6](03-arquitectura.md)).

## 2. La reescritura de rutas

`vercel.json` reescribe **toda** dirección hacia `index.html`:

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

Sin eso, entrar directamente a `https://…/eventos` —un enlace compartido, un marcador, una
recarga— daría **404**: el servidor buscaría un archivo `eventos` que no existe. El
enrutador solo puede hacer su trabajo si el servidor le entrega antes la aplicación. Es el
fallo clásico al publicar una aplicación de página única como sitio estático, y por eso se
comprueba explícitamente en la sección 4.

## 3. Cabeceras de seguridad

También declaradas en `vercel.json` y verificadas sobre la respuesta real:

| Cabecera | Valor | Para qué |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | El navegador no adivina el tipo de un archivo. |
| `X-Frame-Options` | `DENY` | Nadie puede incrustar el sitio en un marco: evita el secuestro de clics. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Al salir del sitio no se filtra la dirección completa que se estaba viendo. |
| `Strict-Transport-Security` | `max-age=63072000` | Lo añade Vercel: el navegador exige HTTPS. |

## 4. Verificación

Ejecutado el 22/08/2026.

### El despliegue es automático

Al fusionar el pull request #56 en `master`, sin tocar Vercel:

```
2026-08-22T22:32:11Z · Production · 10acd0f · success
```

El identificador `10acd0f` es exactamente el commit de fusión. Antes de esa integración la
página de inicio publicada era la de HU-07 —un título y un botón—; después, y sin
intervención manual, mostraba el contenido de HU-09: los cuatro accesos y el menú. Esa
diferencia visible es la prueba de que la publicación siguió al código.

> **Ese identificador ya no existe en el repositorio.** El 25/08/2026 se reescribió el
> historial para retirar de dieciocho commits un pie `Co-Authored-By` de una herramienta de
> asistencia, a petición del asesor. La reescritura no cambió ni un byte del contenido —el
> árbol de `master` sigue siendo `2e917bb`—, pero sí todos los identificadores: aquel
> commit de fusión es hoy **`a2f65ae`**.
>
> El bloque de arriba se deja **tal como lo emitió Vercel**. Sustituir ahí el hash por el
> nuevo sería escribir algo que Vercel nunca dijo: lo que desplegó aquel 22 de agosto fue
> `10acd0f`. Una evidencia se anota, no se corrige.

### La dirección pública responde

```
GET https://hub-cultural-santa-marta.vercel.app/eventos → 200
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

Pedida **directamente**, sin pasar por el inicio: la reescritura de la sección 2 funciona.

### El incremento publicado se comporta como en local

Sobre el sitio ya desplegado, recorriendo siete rutas a 360 px de ancho:

```
produccion @360px · 7 rutas · desborde maximo 0 px · elementos bajo 44x44: 0 · menu compacto
```

Coincide con lo medido en desarrollo ([10 §3](10-responsive.md)). Verificar sobre la
compilación de producción no es redundante: es donde actúan la minificación y el
empaquetado, y donde un estilo mal referenciado dejaría de aplicarse.

### La rama principal está protegida

Configurado desde el Sprint 1 y vigente:

- Exige un pull request con **una aprobación** del otro integrante.
- Descarta las aprobaciones anteriores si aparecen cambios nuevos.
- Prohíbe la reescritura del historial.

Es el tercer criterio de aceptación, y es también lo que hace exigible la revisión cruzada
de la Definición de Terminado.

## 5. Lección de este sprint: los pull request apilados

HU-07, HU-09 y HU-10 se abrieron apilados —cada uno sobre la rama del anterior— para que se
revisaran por separado. Al aprobarlos casi a la vez, **cada uno se fusionó en su rama base
y no en `master`**: HU-09 entró en la rama de HU-07, y HU-10 en la de HU-09. GitHub solo
reapunta un pull request apilado hacia `master` cuando su base se fusiona *y se borra*, y
no hubo tiempo entre una fusión y la siguiente.

El resultado fue engañoso: los tres aparecían como fusionados, el tablero los daba por
terminados y `master` solo tenía uno. Se detectó porque la página publicada seguía
mostrando la portada antigua.

Se corrigió con un pull request de la rama más alta hacia `master` (#56). Para las próximas
historias apiladas: **fusionar de abajo arriba, borrando cada rama**, y confirmar en el
sitio publicado que el cambio llegó. La dirección pública es, entre otras cosas, el
verificador más honesto de que algo se integró de verdad.

### 5.1 Las reglas de seguridad se publican **después** de fusionar

Añadido tras HU-19. `firebase deploy --only firestore:rules` no pasa por Vercel ni por
`master`: publica al instante lo que haya en el archivo local. Eso convierte el orden en algo
que hay que decidir a propósito.

Mientras las reglas nuevas solo **aprieten** condiciones que la aplicación desplegada ya
cumple, el orden da igual. Deja de dar igual en cuanto cambia el **nombre de un campo** o
aparece una comprobación que el código anterior no satisface: durante la ventana entre el
despliegue de las reglas y el de la aplicación, el sitio publicado escribe algo que el
servidor ya rechaza.

Ocurrió el 26/08/2026 con el paso de `imagenUrl` a `imagen`
([18 §9](18-imagen-del-perfil.md)): unos minutos en los que el directorio se leía bien pero
no se podía crear ni editar ningún perfil.

| Qué cambia | Orden |
| --- | --- |
| Solo las reglas | Publicar cuando se quiera |
| Reglas que aprietan algo que el código ya cumple | Cualquiera de los dos órdenes |
| **Reglas y código a la vez** | **Fusionar primero, publicar después** |

Para comprobar antes de fusionar sin tocar producción está el **despliegue de vista previa**
que Vercel crea para cada pull request: corre el código nuevo contra el mismo proyecto de
Firebase.

### 5.2 Los índices se publican **antes** de fusionar

Añadido tras HU-25, y es el orden contrario al de arriba. La asimetría tiene una razón
sola: una regla nueva **rechaza** al cliente viejo, y un índice nuevo no le estorba a
nadie.

| | Publicarlo antes de fusionar | Publicarlo después |
| --- | --- | --- |
| **Reglas** | La regla nueva rechaza a la aplicación que está viva | Correcto |
| **Índices** | Correcto: un índice de más no estorba | La consulta nueva falla hasta que el índice termine de construirse |

Un índice compuesto tarda minutos en construirse. Publicado después de fusionar, la
vista que lo necesita queda rota durante ese rato para todo el que entre, con un error
`failed-precondition` que **no se arregla reintentando**
([24 §5](24-catalogo-publico.md)).

```bash
firebase deploy --only firestore:indexes
```

## 6. Cierre de HU-08

| Criterio de aceptación | Evidencia |
| --- | --- |
| Integrar en la rama principal genera un despliegue **sin intervención manual**. | Sección 4: despliegue de `10acd0f` —hoy `a2f65ae`— con estado `success`, y cambio visible en la portada publicada. |
| Existe una **dirección pública** accesible desde cualquier navegador. | https://hub-cultural-santa-marta.vercel.app, con sus cabeceras de seguridad. |
| Integrar sin revisión del otro integrante queda **bloqueado**. | Sección 4: protección de `master` con una aprobación obligatoria. |

---

*Elaboración propia (2026).*
