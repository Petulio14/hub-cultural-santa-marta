# Publicar un evento o una experiencia

> **Historia de usuario:** HU-21 · Sprint 5
> **Épica:** E3 — Publicación y moderación de contenido
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-05, RF-07.
> **Depende de:** HU-17, HU-18.

Abre la épica E3 y estrena `eventos`, la colección central del modelo. Los cuatro criterios
de aceptación no se reparten a partes iguales: **tres viven en las reglas de seguridad** y
uno en el navegador. Eso ya dice dónde está el trabajo.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Se guarda como «pendiente de aprobación» | `firestore.rules` |
| El orden de las fechas bloquea el envío | El formulario **y** las reglas |
| No aparece en el catálogo hasta ser aprobada | `firestore.rules` |
| Conserva quién la creó y cuándo | `firestore.rules` |

---

## 1. La puerta que había que abrir antes

Publicar exige **tener perfil de actor**. No es una decisión de esta historia: la regla pide
que `idActor` señale un documento de `actoresCulturales` que sea tuyo, y quien no lo ha creado
no tiene ninguno que señalar. Estaba escrito desde HU-13 en
[`routes/roles.js`](../src/routes/roles.js), que es por lo que un actor aterriza en
`/mi-perfil` y no aquí.

Lo que sí es de esta historia es **decirlo**. Sin el aviso, el formulario se enviaría y
volvería un `permission-denied`: un mensaje que dice «no tienes permiso» cuando lo que pasa es
que falta un paso previo, y que no menciona el paso. Por eso `/mis-publicaciones` comprueba el
perfil antes de pintar nada y, si no lo hay, ofrece el enlace para crearlo en lugar del
formulario.

---

## 2. Las fechas: hora local contra UTC

Es el archivo más pequeño de la historia y el que más razones lleva escritas.
[`utils/fechas.js`](../src/utils/fechas.js) existe entero por una diferencia:
**`<input type="datetime-local">` habla en hora local y `Date.toISOString()` escribe en UTC.**

Santa Marta está en UTC−5 y no cambia de hora en todo el año, así que el error no se corrige
solo en ninguna época:

| Se escribe | Con `toISOString().slice(0, 16)` | Correcto |
| --- | --- | --- |
| 1 de septiembre, 00:00 | `2026-09-01T05:00` | `2026-09-01T00:00` |
| 1 de septiembre, 19:00 | `2026-09-02T00:00` | `2026-09-01T19:00` |

El segundo caso es el grave: a partir de las 19:00 hora local el día en UTC ya es el
siguiente, y **la mitad de la agenda cultural de la ciudad empieza a esa hora**. Un taller de
las siete de la tarde reaparecería fechado al día siguiente cada vez que se abriera el
formulario.

Hay una segunda trampa, más callada. `new Date('2026-09-01')` —una fecha sin hora— **sí**
construye un objeto válido, pero interpretado en UTC: en Santa Marta es el 31 de agosto a las
19:00. Por eso `desdeEntradaDeFecha` exige la forma exacta y devuelve `null` ante cualquier
otra cosa, en lugar de dejar pasar lo que `Date` acepte.

### La prueba que corre en otro proceso

Aquí está lo que hace comprobable todo lo anterior. Una prueba que corra en la zona horaria de
la máquina **no distingue una implementación correcta de una escrita con `toISOString`**,
porque en UTC las dos dan lo mismo — y la integración continua corre en UTC.

Sería el punto ciego de [HU-10 §2 bis](10-responsive.md) otra vez: medir solo el caso que ya
funciona. Así que los tres casos decisivos se ejecutan en un proceso aparte con
`TZ=America/Bogota`, porque `process.env.TZ` deja de surtir efecto una vez que el proceso ha
arrancado.

```js
execFileSync(process.execPath, ['--input-type=module', '-e', guion],
             { env: { ...process.env, TZ: 'America/Bogota' } });
```

### Cómo se lee una fecha

`toLocaleTimeString` en español antepone «a las», y componiendo con eso salía
**«1 de septiembre de 2026 a las 18:00 a 21:30»**, que no hay por dónde leer. La hora se
compone a mano; las palabras que la rodean las pone quien la usa:

| Caso | Queda |
| --- | --- |
| Mismo día | `1 de septiembre de 2026, de 18:00 a 21:30` |
| Días distintos | `1 de septiembre de 2026, 18:00 — 3 de septiembre de 2026, 21:30` |

No repetir la fecha cuando es la misma no es cosmética: obligaría a comparar dos cadenas casi
idénticas para descubrir que dicen lo mismo.

---

## 3. El segundo criterio, escrito dos veces

«Cuando la fecha de inicio sea posterior a la de finalización, el envío debe bloquearse con un
mensaje explicativo.» Está en el formulario y está en las reglas, y es la misma decisión que
HU-18 tomó con el límite de la descripción ([17 §4](17-perfil-de-actor.md)): **el formulario
explica, las reglas defienden.** Quien escriba por fuera de la interfaz encuentra la misma
respuesta sin el mensaje amable.

El mensaje nombra las dos fechas en lugar de decir «fechas inválidas», porque quien se
equivoca aquí casi siempre ha escrito bien una de las dos y hay que decirle cuál mirar:

> La fecha de finalización es anterior a la de inicio. Revisa las dos: nada puede terminar
> antes de empezar.

Se pinta junto al campo de finalización, que es el último que se rellena y donde está el dedo.
Y **empezar y terminar en el mismo instante es válido**: es un acto puntual, no un error.

---

## 4. La fecha de creación no la pone el cliente

El cuarto criterio pide que la publicación «conserve el identificador del actor que la creó y
la fecha de creación». El identificador es fácil. La fecha no, y la regla es de una línea:

```javascript
&& request.resource.data.fechaCreacion == request.time
```

Obliga a que el cliente haya enviado `serverTimestamp()`, **el único valor de tiempo que no se
puede inventar**. Sin esa línea, una publicación podría nacer fechada el año pasado y colarse
al principio de la cola de moderación que HU-24 ordenará por antigüedad. Un dato que solo el
servidor puede escribir es un dato en el que la historia siguiente puede confiar.

Tiene una consecuencia en el servicio: justo después de escribir, el valor local del campo
está vacío —el servidor todavía no lo ha resuelto—, así que `crearPublicacion` **vuelve a leer
el documento** en lugar de devolver lo que acaba de enviar. Es una lectura de más a cambio de
enseñar el dato que el criterio manda comprobar.

---

## 5. `tituloNormalizado`: el campo que nadie mira

La búsqueda de HU-27 no puede distinguir mayúsculas ni tildes, y Firestore no sabe comparar
así. La única salida es guardar el título ya normalizado dentro del documento. Eso crea un
campo con una propiedad incómoda: **lo escribe el cliente y no lo lee ninguna persona**.

El moderador de HU-24 aprueba leyendo `titulo`. Un `tituloNormalizado` que dijera otra cosa
—«festival del mar gratis» sobre un taller cualquiera— entraría al catálogo sin que nadie lo
notara y respondería a búsquedas que no le corresponden. La moderación, que es la defensa
natural del contenido, aquí no ve nada.

Las reglas no saben quitar tildes, así que no pueden recalcularlo. Lo que sí pueden es exigir
**lo que la normalización nunca cambia**:

```javascript
&& d.tituloNormalizado == d.tituloNormalizado.lower()
&& d.tituloNormalizado.size() == d.titulo.size()
```

Normalizar no añade ni quita letras —«Café» y «cafe» tienen las mismas cuatro— y no deja
mayúsculas. Con las dos condiciones, un título secuestrado tendría que medir exactamente lo
mismo que el verdadero y no llevar ni una mayúscula, que ya no es un ataque cómodo.

> **`size()` cuenta caracteres, no bytes.** La segunda línea solo funciona si es así: «Cañón»
> y «canon» tienen las mismas cinco letras y **distinto número de bytes** en UTF-8 —dieciocho
> contra quince en el título completo de la prueba—. Como el emulador no arranca en esta
> máquina, la pregunta se dejó abierta y se escribió un caso con tildes y eñe cuyo único
> trabajo era responderla en integración continua. **Pasó**, así que la condición se queda como
> está. Si hubiera salido en rojo, la sustituta era `<=`: cierta con las dos semánticas y algo
> más débil.

---

## 6. Los topes, otra vez dos números distintos

| Campo | Formulario | Reglas |
| --- | --- | --- |
| Título | 5 a 120 | 1 a 200 |
| Descripción | 30 a 2000 | 1 a 4000 |
| Lugar | hasta 200 | hasta 300 |

Es lo de [18 §2](18-imagen-del-perfil.md): **el del formulario es una promesa de que el texto
se verá bien; el de la regla es el techo del abuso.** Si los dos fueran el mismo número,
cualquier desacuerdo entre cómo cuenta caracteres el navegador y cómo los cuenta una regla se
convertiría en un rechazo que quien escribe no puede entender ni corregir.

La descripción de una publicación admite el doble que la de un actor. No es capricho: la del
actor es una presentación —quién soy y qué hago—; la de un evento tiene que caber además la
programación, los precios y las condiciones. Dos mil caracteres de texto no pesan nada al lado
de los 120 000 que puede ocupar la imagen del mismo documento.

---

## 7. Cambios en el modelo y en las reglas

| Qué | Antes | Ahora |
| --- | --- | --- |
| Identificador de `eventos` | automático | se pide **antes** de escribir, y tiene que coincidir con `idEvento` |
| Campos admitidos | cualquiera | los catorce del modelo, y ninguno más |
| `titulo`, `descripcion`, `lugar` | sin comprobar | tipo y longitud |
| `tituloNormalizado` | sin comprobar | en minúsculas y de la misma medida que el título |
| `fechaInicio`, `fechaFin` | solo el orden | además `is timestamp` |
| `coordenadas` | sin comprobar | nula o `is latlng` (la rellena HU-22) |
| `imagen` | sin comprobar | reutiliza `imagenAceptable()` de HU-19 |
| `read` de un documento inexistente | reventaba la expresión | se deniega |

El identificador se pide con `doc(collection(db, 'eventos'))`, que devuelve una referencia con
identificador ya generado **sin ir a la red**. Con `addDoc` habría que escribir primero y
actualizar después para meter el `idEvento` dentro del documento: dos escrituras donde cabe
una, y un documento que existe un instante sin su propio identificador.

---

## 8. Verificación

### Las funciones puras · `npm run probar`

**44 casos nuevos**, 183 en total. Los tres de la zona horaria de Santa Marta corren en un
proceso aparte y son los únicos que pueden fallar en un sitio y pasar en otro; están escritos
precisamente para que eso no ocurra.

### Las reglas · `npm run probar:reglas`

**27 casos nuevos**, 132 en total, ejecutados en integración continua. Entre ellos:

| Qué comprueba | Por qué importa |
| --- | --- |
| Una fecha de creación inventada se rechaza | Es el cuarto criterio, y sin él la cola de HU-24 se puede manipular |
| Un visitante **no** lista la colección entera | Es el tercer criterio: no es que la vista esconda lo pendiente, es que pedirlo falla |
| Un actor sin perfil no publica | La puerta de la sección 1, comprobada en el servidor |
| Un administrador tampoco publica en nombre de un actor | Moderar no es escribir por otro |
| Un título con tildes y eñe se acepta | Respondió la pregunta abierta de la sección 5: `size()` cuenta caracteres |
| Un actor sin perfil no publica **aunque invoque uno que existe** | Separa «falla porque no hay perfil» de «falla porque no es el mío» |

#### Un caso que medía lo contrario de lo que decía

La primera ejecución dejó en rojo «un actor SIN perfil no publica»: **la escritura se permitió**.
No era un fallo de la regla. La prueba tomaba una cuenta de repuesto por su índice,
`UIDS_SIN_PERFIL[10]`, y ochenta líneas antes esa misma cuenta ya había estrenado su perfil en
una prueba de HU-19. El actor sí tenía perfil, así que publicar era **lo correcto**.

Una prueba que pasa por el motivo equivocado es peor que una que falla, porque no vuelve a
mirarse. Se corrigió con una cuenta de nombre propio —`UID_ACTOR_SIN_PERFIL`, que no aparece en
ninguna otra prueba— y se partió en dos casos, para separar «falla porque no hay perfil» de
«falla porque el perfil no es mío». Un nombre no se reutiliza por descuido; un índice sí.

### En el navegador

El módulo de fechas, ejecutado sobre `npm run dev`:

| Caso | Resultado |
| --- | --- |
| Medianoche del 1 de septiembre | `2026-09-01T00:00` |
| Las 19:00 del 1 de septiembre | `2026-09-01T19:00` |
| `desdeEntradaDeFecha('2026-09-01')` | `null` |
| Periodo del mismo día | `1 de septiembre de 2026, de 18:00 a 21:30` |
| Fin anterior al inicio | El mensaje del segundo criterio |

### Comprobación en vivo

Sobre el sitio publicado, con las reglas de esta historia ya desplegadas.

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 26/08/2026 | Un actor **sin perfil** ve el aviso y el enlace, no el formulario | Correcto: la puerta de la sección 1 se explica antes de enviar |
| 26/08/2026 | Con perfil, el formulario se puede rellenar entero | Correcto |
| 26/08/2026 | Poner la fecha de fin antes que la de inicio bloquea el envío y explica por qué | Correcto: el mensaje sale junto al campo de finalización y se retira al corregir |
| 26/08/2026 | La publicación se guarda y aparece «En revisión» | Correcto |
| 26/08/2026 | La fecha de envío que se muestra es la del servidor, no la del equipo | Correcto en pantalla; el origen del dato lo sostienen las reglas (véase abajo) |
| 26/08/2026 | Un evento de las 19:00 sigue siendo de las 19:00 al recargar | Correcto: ni cambia de hora ni salta de día |
| 26/08/2026 | La imagen se reduce igual que en HU-19, y sin imagen sale el dibujo | Correcto |
| 26/08/2026 | Un visitante sin cuenta no encuentra la publicación pendiente | Comprobado en las reglas (véase abajo) |
| 26/08/2026 | Publicar dos veces deja las dos, la más reciente arriba | Correcto |
| 26/08/2026 | A 360, 768 y 1366 px, y sin errores en consola | Correcto |

Las **diez** pasaron. La sexta es la que vale por todo [`utils/fechas.js`](../src/utils/fechas.js):
las 19:00 son la hora a la que empieza media agenda cultural de la ciudad y la hora a la que el
día en UTC ya es el siguiente, así que es el caso donde el defecto se habría visto.

### Dos filas que no se pueden mirar en la pantalla

La quinta y la octava se apoyan en los casos de prueba, y conviene decir por qué en lugar de
apuntar «correcto» y seguir.

**La quinta.** Que la fecha de envío la haya puesto el servidor no se ve mirándola: una fecha
escrita por el navegador tendría el mismo aspecto y la misma hora. Lo que se comprueba en
pantalla es que está y que es plausible; lo que demuestra su origen es la regla
`fechaCreacion == request.time` y el caso que rechaza una fecha inventada por el cliente.

**La octava.** El catálogo público es HU-25 y todavía no existe, así que no hay página donde
comprobar que la publicación no aparece. Lo comprobable hoy es el documento en la consola de
Firebase, con su `estadoPublicacion` en `pendiente`; que un visitante no pueda leerlo lo
demuestran los dos casos que piden la colección entera sin sesión y la ven fallar.

Las dos vuelven a la pantalla en **HU-24** y **HU-25**, cuando exista la cola de moderación y
el catálogo. Queda anotado para no darlas por cerradas dos veces.

---

## 9. Lo que queda fuera

| Fuera | Dónde llega |
| --- | --- |
| Situar la publicación en el mapa | HU-22 |
| Editarla y eliminarla | HU-23 |
| Aprobarla o devolverla con observaciones | HU-24 |
| El catálogo público con sus filtros | HU-25 y HU-26 |
| Buscar por palabra clave | HU-27, que es para lo que existe `tituloNormalizado` |
| Contar las consultas | HU-34, sobre `contadorConsultas` |
