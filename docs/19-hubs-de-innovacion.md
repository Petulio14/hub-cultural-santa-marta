# Los hubs de innovación

> **Historia de usuario:** HU-20 · Sprint 5
> **Épica:** E2 — Perfiles de actores culturales y hubs
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-04, RF-09.
> **Depende de:** HU-15.

Cierra la épica E2. Dos de sus tres criterios son el gemelo de lo que HU-18 resolvió para los
actores culturales, y se resuelven igual y por las mismas razones. El tercero es nuevo y es
el que da trabajo: **guardar las coordenadas del espacio**.

---

## 1. Lo que se repite, y por qué se repite

| Decisión | Dónde se razonó |
| --- | --- |
| El identificador del documento es el `uid` de su dueño | [17 §2](17-perfil-de-actor.md) |
| Ruta privada propia (`/mi-hub`), porque quien no tiene hub no tiene `:id` | [17 §3](17-perfil-de-actor.md) |
| Nace `pendiente`; editar no lo devuelve a la cola | [17 §5](17-perfil-de-actor.md) |
| El directorio filtra en la consulta, no en memoria | [17 §7](17-perfil-de-actor.md) |
| Al menos un canal de contacto, no los tres | [17 §8](17-perfil-de-actor.md) |
| Un `get` sobre un documento inexistente necesita `resource == null` | [17 §10](17-perfil-de-actor.md) |

La última se aplicó **antes** de que diera problemas, que es la diferencia entre haber
aprendido algo y haberlo anotado. En HU-18 costó una comprobación en producción con un
«Missing or insufficient permissions» delante; aquí la regla nació con la condición puesta y
con su caso de prueba.

Un hub **no tiene página propia**, a diferencia del perfil de un actor. El prototipo (V-5)
pide «listado de hubs aprobados con nombre, descripción, líneas de trabajo, dirección y
contacto», y eso cabe entero en la tarjeta del directorio: una página aparte por cada hub
sería un clic para no leer nada nuevo.

---

## 2. Tres piezas que salieron de duplicar

Esta historia es la segunda de su especie, y ahí es donde se ve qué era general y qué era
particular. Tres cosas se sacaron a su sitio en lugar de copiarse:

| Qué | Dónde | Por qué salió |
| --- | --- | --- |
| Traducción de los códigos de Firestore | [`services/errores.js`](../src/services/errores.js) | Dos copias de una tabla de mensajes se separan a la primera corrección que solo se aplique a una |
| La cola de aprobación del panel | [`hooks/useColaDeAprobacion.js`](../src/hooks/useColaDeAprobacion.js) | El mismo «leer, decidir, recargar, avisar» para perfiles y para hubs |
| Los canales de contacto | `validarContacto`, ya existente | El hub y el actor publican los mismos tres |

La tercera cola —la de publicaciones, en HU-24— llevará además su registro en `moderaciones`,
y ahí habrá que ver si sigue cabiendo en el mismo gancho o merece lo suyo. Se deja anotado en
el propio archivo para que la pregunta se haga entonces y no se resuelva por inercia.

---

## 3. Las coordenadas: el criterio que no se podía cumplir en silencio

El tercer criterio dice: «dado un hub con dirección registrada, cuando se guarde, entonces
deben almacenarse sus coordenadas». La lectura fácil es geocodificar la dirección al guardar
y ya está. **No se puede.**

### Lo que se comprobó antes de construir nada

Se probó el buscador de OpenStreetMap contra direcciones reales de Santa Marta:

| Consulta | Resultado |
| --- | --- |
| «Quinta de San Pedro Alejandrino» | 2 candidatos, el primero correcto |
| «Universidad del Magdalena» | acierta |
| «Calle 22 # 1-40, Santa Marta» | encuentra la calle, no el número |
| «Carrera 1 con Calle 22, Santa Marta» | **no encuentra nada** |

La nomenclatura colombiana de «carrera con calle» no está cartografiada, y es exactamente la
forma en que se escribe una dirección en esta ciudad.

Hay un resultado peor que no encontrar nada, y también se comprobó. Buscando **«Bogotá»**, el
servicio devuelve tres candidatos y el primero es **«Banco de Bogotá», en Santa Marta**, con
su punto perfectamente creíble. Una consulta equivocada no falla de forma visible: **acierta
en algo que no es**.

### La decisión

**No se geocodifica en silencio.** La búsqueda la dispara un botón, se ofrecen hasta tres
candidatos **con su nombre completo y sus coordenadas escritas**, y hay que elegir uno. Ese
paso —confirmar— es lo que convierte «lo que encontró el buscador» en «el sitio que dice el
responsable del hub», y es la diferencia entre un mapa útil y un mapa con puntos plausibles y
falsos.

De ahí salen tres reglas más:

- **Cambiar la dirección invalida el punto ya elegido.** Si no, se guardaría una dirección con
  las coordenadas de otra, y nadie lo notaría.
- **Sin punto confirmado no se guarda.** Es lo que hace verdadero el criterio: un hub guardado
  siempre tiene coordenadas. Cuando el buscador no encuentra nada, el formulario explica qué
  sí funciona —un lugar de referencia, un parque, la calle sin número— en lugar de dejar a
  alguien mirando un campo vacío.
- **Un punto fuera del rectángulo de Santa Marta se rechaza**, con `estaEnSantaMarta`. Es la
  única defensa contra el caso «Banco de Bogotá» generalizado.

### Cortesía con un servicio gratuito

La política de uso de Nominatim pide **como máximo una consulta por segundo** y nada de
búsquedas automáticas mientras se teclea. Por eso la búsqueda va en un botón y hay un
intervalo mínimo entre dos consultas. No es una optimización: es la condición para poder
seguir usándolo, y encaja con la decisión de Leaflet + OpenStreetMap ya tomada en
[03 §6](03-arquitectura.md) — el mismo origen de datos para buscar un sitio y para pintarlo,
y sin costo (R-02).

---

## 4. `is latlng`, y por qué la regla mira el tipo

El punto se guarda como **`GeoPoint`**, que es el tipo que Firestore entiende y sobre el que
sabe consultar por proximidad cuando llegue el mapa (HU-30). La regla lo exige:

```javascript
&& d.coordenadas is latlng
```

Sin eso, un cliente podría escribir `{ lat: 11.2, lon: -74.2 }` —un mapa corriente, no un
punto— o la cadena `"11.24222, -74.21331"`. Las tres cosas *parecen* coordenadas y solo una lo
es. El error no aparecería aquí, sino en HU-30, cuando la consulta del mapa se cayera entera
por un documento mal formado. Hay tres casos de prueba, uno por cada forma de parecerlo sin
serlo.

Hacia fuera el `GeoPoint` se traduce a `{ lat, lon }` en el servicio: `latitude` y `longitude`
son vocabulario del kit de Firebase, y ninguna vista debe conocerlo (docs/03 §3).

---

## 5. Las líneas de trabajo

Se escriben en una sola caja, separadas por **comas o saltos de línea** —las dos cosas se
hacen sin pensar y ninguna es más correcta—, y `aLineasDeTrabajo` las normaliza:

| Se escribe | Queda |
| --- | --- |
| `a,,b` | `a`, `b` |
| `Formación, formacion, FORMACIÓN` | `Formación` |
| `TIC, tic` | `TIC` |
| `economía   naranja` | `economía naranja` |

De las repetidas se conserva **la primera tal como se escribió**. Normalizar para comparar es
correcto; normalizar para mostrar convertiría «TIC» en «tic».

El formulario enseña cómo va a quedar la lista **antes** de guardar. Al separar por comas es
fácil dejar una vacía o repetir una, y ahí se ve.

---

## 6. Cambios en el modelo y en las reglas

| Qué | Antes | Ahora |
| --- | --- | --- |
| Identificador de `hubs` | sin especificar | el `uid` de su responsable |
| `create` | rol hub, `uid` propio, `pendiente`, ≥1 línea | además: ruta = `uid`, `idHub` coincidente y forma completa |
| `update` del dueño | no toca `uid` ni `estado` | además: no toca `idHub`, y el resultado sigue bien formado |
| Campos admitidos | cualquiera | los nueve del modelo, y ninguno más |
| `lineasDeTrabajo` | `size() > 0` | entre 1 y 8 |
| `coordenadas` | sin comprobar | `is latlng` |
| Aterrizaje del rol hub | `/hubs` | `/mi-hub` |

---

## 7. Verificación

### Las funciones puras · `npm run probar`

**40 casos nuevos**, 139 en total: el rectángulo de Santa Marta con sus bordes exactos, el
punto cero —que es lo que devuelve no haber encontrado nada—, Bogotá y Barranquilla, el `NaN`
que sale de `Number('once punto dos')`, las líneas de trabajo con sus duplicados y sus vacías,
y el formulario completo del hub.

### Las reglas · `npm run probar:reglas`

**19 casos nuevos**, 105 en total, ejecutados en integración continua. Entre ellos los tres
del tipo del punto y los dos de la ruta vacía, que aquí nacieron con la regla en lugar de
salir de un fallo en producción.

### El buscador de direcciones, medido en el navegador

No se puede probar con `node --test` —sale a la red—, así que se midió ejecutando el módulo
dentro del navegador:

| Consulta | Resultado |
| --- | --- |
| «Quinta de San Pedro Alejandrino» | 2 candidatos, primero correcto, 350 ms |
| «Parque de los Novios, Santa Marta» | 1 candidato, `11,24222 / −74,21331` |
| «Carrera 1 con Calle 22» | 0 candidatos |
| «Bogotá» | 3 candidatos, el primero «Banco de Bogotá» **en Santa Marta** |
| Cadena vacía | 0 candidatos, sin salir a la red |

El intervalo mínimo entre consultas se respeta: la segunda llamada seguida tardó 1.717 ms
frente a los 350 de una aislada.

### Comprobación en vivo

Sobre el sitio publicado, con las reglas de esta historia ya desplegadas.

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 26/08/2026 | Un visitante sin sesión abre `/hubs` | Correcto: el directorio se lee sin cuenta |
| 26/08/2026 | Un responsable de hub aterriza en `/mi-hub` al iniciar sesión | Correcto, y la ruta vacía se lee sin error de permisos |
| 26/08/2026 | Busca su dirección y elige un candidato | Correcto: los candidatos se ofrecen con su nombre y sus coordenadas, y hay que elegir |
| 26/08/2026 | Una dirección que el buscador no encuentra explica qué hacer | Correcto: sin resultados aparece la explicación, no un campo vacío |
| 26/08/2026 | El hub se guarda y queda `pendiente`, sin figurar en el directorio | Correcto |
| 26/08/2026 | El administrador lo publica desde el panel | Correcto |
| 26/08/2026 | Aparece en `/hubs` con sus líneas, dirección, punto y contacto | Correcto: la tarjeta muestra lo que pide el prototipo V-5 |
| 26/08/2026 | Editarlo no lo devuelve a la cola | Correcto: sigue `aprobado` tras editar |
| 26/08/2026 | Cambiar la dirección obliga a volver a confirmar el punto | Correcto: el punto anterior se invalida |
| 26/08/2026 | A 360, 768 y 1366 px, y sin errores en consola | Correcto |

Las **diez** pasaron. Las dos que sostienen el tercer criterio son la cuarta y la novena: sin
la cuarta, una dirección no encontrada dejaría a alguien mirando un campo vacío sin saber qué
se espera de él; sin la novena, se guardaría una dirección con las coordenadas de otra y nadie
lo notaría hasta ver el mapa de HU-30.

### Dos cosas que salieron de comprobar esta historia

**El orden del despliegue aguantó.** Se fusionó primero y se publicaron las reglas después,
como quedó escrito en [12 §5.1](12-despliegue-continuo.md) tras el tropiezo de HU-19. Esta vez
no hubo ventana de escrituras denegadas. El despliegue falló al primer intento —`Failed to
make request to firebaserules.googleapis.com`—, pero en el paso que **comprueba** las reglas y
antes de publicar nada, así que reintentar bastó y el estado nunca quedó a medias.

**Apareció un defecto que no era de esta historia.** Mientras se navegaba con sesión iniciada,
el menú de la cabecera se partía en dos filas y la marca escribía «Hub Cultural» en dos
líneas. No lo causaba HU-20: venía de HU-18, cuando el menú de un actor creció hasta pedir más
ancho del que la cabecera podía dar. Está corregido y razonado en
[10-responsive.md §2 bis](10-responsive.md), con la lección que importa: la medición de HU-10
se hizo **sin sesión**, y el menú que se rompió es el que nunca se midió.

---

---

## 8. Lo que queda fuera

| Fuera | Dónde llega |
| --- | --- |
| Ver el hub sobre un mapa | HU-30, con Leaflet |
| Elegir el punto arrastrando un marcador | HU-22 lo hace para las publicaciones; el hub podría reutilizarlo entonces |
| Imagen del hub | Sin historia asignada; el modelo no la contempla |
| Buscar o filtrar dentro del directorio de hubs | Fuera del alcance del MVP |
