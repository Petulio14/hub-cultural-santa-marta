# La imagen del perfil

> **Historia de usuario:** HU-19 · Sprint 5
> **Épica:** E2 — Perfiles de actores culturales y hubs
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-03.
> **Depende de:** HU-18.

La ficha de esta historia decía «Firebase Storage con reglas de acceso por propietario», y
las reglas están escritas desde HU-08. No se pudieron usar. Lo que sigue es qué se hizo en
su lugar, qué se conserva de lo escrito y qué se pierde por el camino.

---

## 1. Por qué no hay Firebase Storage

Activar Storage obliga a pasar el proyecto a **plan Blaze**, que exige registrar un medio de
pago aunque el consumo previsto quepa en la franja gratuita. El proyecto no tiene
presupuesto (**RNF-10**, restricción **R-02**), así que la historia no puede apoyarse en él.

La decisión y su alternativa están en
[`03-arquitectura.md` §6.1](03-arquitectura.md): la imagen se **reduce en el navegador** y
viaja como texto —una URI de datos— dentro del propio documento de Firestore.

[`storage.rules`](../storage.rules) **se conserva en el repositorio**. No es código muerto:
es el diseño ya escrito y probado para el día que exista presupuesto. Migrar significará
publicar esas reglas y sustituir el texto por la dirección, no rehacer el modelo. Una de las
pruebas de esta historia fija justamente ese punto de vuelta:

```javascript
it('rechaza una dirección que no es una URI de datos', () => {
  // Es lo que habría guardado la versión con Firebase Storage. Si un día
  // vuelve, este caso es el que hay que cambiar (docs/03 §6.1).
  assert.equal(tieneFormaDeImagen('https://ejemplo.co/foto.jpg'), false);
});
```

**Lo que se pierde, dicho sin adornos:** resolución frente al original, y más datos
transferidos en cada carga del directorio, porque la imagen viaja con el documento en lugar
de pedirse aparte y quedarse en la caché del navegador.

---

## 2. Dos límites que no son el mismo, y conviene no confundirlos

| Límite | Cuánto | Sobre qué | Para qué |
| --- | --- | --- | --- |
| **Archivo elegido** | 2 MB | El archivo que la persona escoge | Es el del criterio de aceptación, y el que produce el mensaje explicativo |
| **Resultado guardado** | 120.000 caracteres | La URI de datos ya reducida | Es el que imponen las reglas de seguridad |

El primero se comprueba en el formulario, sobre el archivo original. El segundo lo comprueba
el servidor, sobre lo que de verdad se escribe. **Nadie debería toparse con el segundo**: la
reducción se encarga de bajar de ahí. Si aun así no lo consigue, se dice; escribir algo que
el servidor va a rechazar sería peor.

El número de las reglas está repetido en `imagen.js`, y hay una prueba que falla si dejan de
coincidir — el mismo trato que se le dio en HU-18 al límite de la descripción:

```javascript
const tope = `imagen.size() < ${LIMITE_GUARDADO}`;
assert.ok(reglas.includes(tope), `firestore.rules ya no exige «${tope}»`);
```

---

## 3. La restricción sigue estando en el servidor

Perder Storage habría sido perder también la comprobación del lado del servidor, y eso sí
que no era negociable: **RNF-08** exige que el control exista en las dos capas. La regla
comprueba lo mismo que habría comprobado `request.resource.size` y `contentType`:

```javascript
function imagenAceptable() {
  let imagen = request.resource.data.get('imagen', null);
  return imagen == null
    || (imagen is string
        && imagen.size() < 120000
        && imagen.matches('^data:image/(jpeg|png);base64,.*'));
}
```

Tres detalles que no son casuales:

- **`get` con valor por omisión.** La imagen es opcional; leer una clave ausente haría fallar
  la expresión entera. Es literalmente el defecto que HU-18 encontró en producción con
  `resource` nulo ([17 §10](17-perfil-de-actor.md)), y no tenía por qué repetirse.
- **`matches` y no solo `is string`.** Un `data:image/svg+xml` es una imagen para el
  navegador y **código que ejecuta**; entra por la misma puerta que un JPEG y no debe.
- **Se comprueba también al editar.** Si solo se mirara al crear, bastaría con guardar el
  perfil sin imagen y añadirla después.

---

## 4. El campo dejó de llamarse `imagenUrl`

El modelo de HU-05 lo llamaba `imagenUrl` y lo describía como «URL en Firebase Storage».
Ninguna de las dos cosas es cierta ya: no es una URL de Storage, es la imagen misma. Se pasa
a llamar **`imagen`**, y [`04-modelo-datos.md` §4](04-modelo-datos.md) lo describe como lo
que es.

Renombrar un campo tiene un coste, y aquí era pequeño pero real: el perfil que ya existía en
producción llevaba escrito `imagenUrl: null`, y las reglas admiten **exactamente diez
claves**. Un documento que conservara la vieja no pasaría la comprobación de forma, así que
su dueño no habría podido volver a editarlo nunca.

La migración va dentro de la operación de guardar, y se cura sola:

```javascript
await updateDoc(referencia, { ...editables, imagenUrl: deleteField() });
```

Sobre un perfil que no tiene el campo, no hace nada. Al leer se aceptan los dos nombres
—`datos.imagen ?? datos.imagenUrl ?? null`— para que un perfil aún no editado no pierda
nada. No hubo que tocar ningún documento a mano.

---

## 5. La reducción, y las dos decisiones que esconde

Un lienzo, el lado mayor a `LADO_MAXIMO` píxeles, y una calidad tras otra hasta bajar del
límite. Fueron 480 hasta el 11/10/2026 y son 720 desde entonces (§11), y ese cambio es justo
lo que hizo que la primera calidad dejara de bastar siempre. Pero hay dos cosas que no se ven en esa frase:

**Siempre sale JPEG, también si entró un PNG.** Un PNG fotográfico de ese tamaño pesa varias
veces lo que el JPEG equivalente, y aquí el peso es el límite. La consecuencia es que se
pierde la transparencia, así que el lienzo **se pinta de blanco antes de dibujar**: sin eso,
lo transparente sale negro y quien suba un logotipo recortado se lleva un susto.

**Nunca se agranda.** Una fotografía de 200 px se guarda a 200 px. Estirarla no añade un solo
detalle y multiplica lo que pesa.

Hay además una tercera decisión, en la interfaz: **el `input` de archivo no lleva `capture` ni
recorte, y la vista previa muestra la imagen ya reducida, no el original.** Enseñar una cosa
y guardar otra sería mentir sobre el resultado, y en esta historia el resultado cambia
bastante.

---

## 6. La imagen predeterminada es un dibujo, no un archivo

Tercer criterio de aceptación. Se resuelve con un SVG escrito dentro de
[`ImagenDeActor.jsx`](../src/components/ImagenDeActor.jsx). Tres razones, en orden de peso:

1. **Una fotografía de relleno obligaría a resolver su licencia** y el derecho de imagen de
   quien salga en ella. Es exactamente el problema que dejó a este proyecto sin imágenes
   versionadas ([05 §4 bis](05-prototipo-interfaz.md)), y no tiene sentido volver a
   pisarlo por un marcador de posición.
2. **No viaja.** No hay petición que pueda fallar ni archivo que falte en el despliegue. Un
   perfil sin imagen se pinta igual sin conexión.
3. **Usa la paleta del sitio**, así que envejece con ella y no contra ella.

Va marcada con `aria-hidden="true"` a propósito. No transmite información: es el hueco donde
iría una imagen, y el nombre del actor está escrito al lado. Anunciarla obligaría a quien usa
un lector de pantalla a escuchar «imagen predeterminada» en cada tarjeta del directorio sin
ganar nada.

La imagen real sí lleva texto alternativo, y dice **de quién es el perfil**, no qué se ve en
ella: nadie salvo quien la subió sabe lo segundo, y describirla a ciegas sería inventar.

---

## 7. El control de archivo, escondido a propósito

El `input type="file"` nativo no se puede dimensionar: a 360 px se sale de la columna y no
cumple el área mínima de toque de **HU-10**. Se esconde y lo activa su etiqueta, con estilo de
botón.

Esconderlo tiene una trampa conocida y aquí está esquivada: **no se usa `display: none`**, que
lo sacaría del orden de tabulación y lo dejaría inalcanzable con el teclado. Se aparta con
`clip-path`, sigue siendo enfocable, y su foco se dibuja sobre la etiqueta:

```css
.campo-imagen__entrada:focus-visible + .campo-imagen__boton {
  outline: 3px solid var(--turquesa-oscuro);
  outline-offset: 2px;
}
```

Sin esa última regla, quien navega con teclado pasaría por el control sin ninguna señal.

---

## 8. Cambios en el modelo y en las reglas

| Qué | Antes | Ahora |
| --- | --- | --- |
| Campo de la imagen | `imagenUrl`, «URL en Firebase Storage» | `imagen`, URI de datos dentro del documento |
| Claves admitidas | …`'imagenUrl'`… | …`'imagen'`… |
| Tamaño | lo imponía `storage.rules`, sin publicar | `imagen.size() < 120000` en Firestore |
| Formato | lo imponía `storage.rules`, sin publicar | `matches('^data:image/(jpeg\|png);base64,.*')` |

`storage.rules` no se borra: ver §1.

---

## 9. Verificación

### Las funciones puras · `npm run probar`

**25 casos nuevos**, 99 en total. Cubren los bordes exactos de los dos límites —2 MB justos y
un byte más; 119.999 caracteres y 120.000—, los mensajes de rechazo (que deben nombrar el
formato y el peso reales), el formato deducido del nombre cuando el navegador no lo declara,
y la proporción al encoger, incluida la panorámica extrema que redondearía a cero píxeles de
alto.

### Las reglas · `npm run probar:reglas`

**12 casos nuevos**, 86 en total, ejecutados en integración continua:

```
▶ imagen del perfil (HU-19)
  ✔ un perfil con su imagen reducida se guarda
  ✔ un perfil sin imagen también: la clave puede no estar
  ✔ y con la imagen puesta a nulo, que es como nace un perfil
  ▶ el tamaño lo impone el servidor
    ✔ acepta un carácter por debajo del límite: es el borde
    ✔ el límite mismo se rechaza: la regla exige «menor que»
    ✔ tampoco se cuela al editar un perfil que ya existe
  ▶ el formato lo impone el servidor
    ✔ un GIF se rechaza aunque quepa de sobra
    ✔ un SVG se rechaza: es código que el navegador ejecuta, no una fotografía
    ✔ una dirección http en lugar de una URI de datos se rechaza
    ✔ un número en lugar de una cadena se rechaza
  ✔ el dueño sí pone y quita su propia imagen
  ✔ otro actor NO le pone una imagen a mi perfil
```

### La reducción, medida en un navegador de verdad

Lo que dibuja en el lienzo no se puede probar con `node --test`, así que se midió ejecutando
el módulo dentro del navegador contra imágenes generadas para el caso:

| Entrada | Resultado |
| --- | --- |
| 3000 × 2000 de **ruido aleatorio**, 5,9 MB — el peor caso posible para un JPEG | 480 × 320, **50 KB** (51.207 caracteres), muy por debajo de los 120.000 |
| PNG de 300 × 300 con **esquina transparente** | Esquina en `[255, 255, 255]`: blanca, no negra. El aplanado funciona |
| JPEG de **200 × 150** | Sigue midiendo 200 × 150: no se agranda |

El primero importa porque el ruido aleatorio es lo que peor comprime; una fotografía real
pesa bastante menos.

### Comprobación en vivo

Sobre el despliegue del proyecto, con la cuenta de actor cultural.

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 26/08/2026 | Un perfil sin imagen muestra la predeterminada en `/actores` y en `/actores/:id` | ✅ El dibujo del código, a 96 px en la tarjeta y 160 px en el perfil. |
| 26/08/2026 | Un actor sube un JPG y aparece en su perfil público | ✅ |
| 26/08/2026 | Un actor sube un PNG | ✅ Y **la transparencia sale blanca, no negra**: el aplanado de §5 funciona sobre un archivo real y no solo sobre el generado en la prueba. |
| 26/08/2026 | Un archivo de más de 2 MB se rechaza con su mensaje | ✅ No se sube, y el perfil conserva lo que tuviera. |
| 26/08/2026 | Un archivo que no es JPG ni PNG se rechaza con su mensaje | ✅ Probado con GIF y con PDF. Se queda la predeterminada. |
| 26/08/2026 | Quitar la imagen devuelve la predeterminada | ✅ |
| 26/08/2026 | Editar otro campo no borra la imagen ya guardada | ✅ Varias ediciones seguidas de la descripción, con la imagen intacta. Es la que más se cuela: el formulario podría enviar la imagen vacía sin que nadie la hubiera tocado. |
| 26/08/2026 | A 360, 768 y 1366 px, y sin errores en consola | ✅ Sin desbordamiento horizontal y sin errores propios. |

La migración de `imagenUrl` a `imagen` (§4) quedó comprobada de paso y sin hacer nada: el
perfil que existía se editó varias veces y ninguna falló, que es lo que habría ocurrido si el
campo viejo hubiera seguido dentro del documento.

### Una lección de orden: las reglas se publican **después**

Al preparar esta comprobación se publicaron las reglas **antes** de fusionar el pull request,
siguiendo la lista que traía escrita. Con eso, durante unos minutos, el proyecto en
producción quedó así:

| | |
| --- | --- |
| Leer el directorio y los perfiles | funcionaba |
| **Crear un perfil** | denegado |
| **Editar un perfil** | denegado |

La aplicación desplegada era todavía la de HU-18, que escribe `imagenUrl`; las reglas recién
publicadas admiten diez claves y esa ya no era una de ellas. Cualquier escritura que dejara
la clave vieja se rechazaba.

**La regla que sale de aquí:** cuando el código y las reglas cambian a la vez, las reglas van
**después** de fusionar, no antes. En HU-18 el orden dio igual porque las reglas solo se
apretaron en cosas que la aplicación anterior ya cumplía. En cuanto cambia el **nombre** de un
campo, deja de dar igual. Está anotado también en
[12-despliegue-continuo.md §5.1](12-despliegue-continuo.md), que es donde se busca al
desplegar.

---

## 10. Lo que queda fuera

| Fuera | Dónde llega |
| --- | --- |
| Recorte o encuadre antes de guardar | Sin historia asignada |
| Imagen de las publicaciones | HU-21, con este mismo mecanismo |
| Varias imágenes por perfil | Fuera del alcance del MVP ([02 §3](02-alcance-mvp.md)) |
| Firebase Storage | El día que haya presupuesto: §1 |

---

## 11. De 480 a 720 px, y el estándarte que se estiraba (11/10/2026)

La observación que lo abrió no fue una medición sino una mirada: *cada vez que veo el evento
veo las fotos de baja calidad*. Y era cierto, pero por dos motivos a la vez, y ninguno de los
dos era el que primero se sospecha.

### Lo que se midió antes de tocar nada

| Dónde | Guardada | Dibujada | Estiramiento |
| --- | --- | --- | --- |
| Catálogo, tarjeta | 341 × 480 | 327 × 327 | **ninguno** |
| Ficha del evento | 341 × 480 | **1136 × 1136** | **3,33 ×** |

El catálogo nunca se vio mal porque no se estira: una tarjeta se dibuja a unos 330 px y 480
le sobra. **El defecto estaba solo en la ficha**, que es justamente donde se mira la foto.

Y ese `1136 × 1136` cuadrado tampoco era lo que pedía la hoja. `.detalle__imagen` declara
`aspect-ratio: 16 / 9` desde que se escribió, pero pierde contra `.imagen-actor
{ aspect-ratio: 1 }` de `global.css`: las dos son una sola clase, empatan en especificidad y
decide el orden en que Vite junta las hojas. **La ficha nunca tuvo su 16/9 y nadie lo vio**,
porque leyendo la hoja parece que sí lo tiene; solo midiendo el elemento en el navegador
aparece.

> Es la **tercera** vez que ocurre lo mismo con `.imagen-actor`. El directorio de actores y
> la tarjeta de «mis publicaciones» ya lo documentan y lo resolvieron anteponiendo la clase
> del padre. Aquí se dobla la clase del propio elemento —`.detalle__imagen.imagen-actor`—,
> que suma igual y además no depende de que el padre exista ni conserve su nombre.

### Cuánto se puede subir sin tocar las reglas

Medido sobre fotografías reales, codificadas como las codifica `reducirImagen`, contra el
`imagen.size() < 120000` de `firestore.rules`:

| Lado mayor | Calidad | Caracteres | ¿Cabe? |
| --- | --- | --- | --- |
| 480 px | 72 % | 53.000 – 58.000 | sí, sobra la mitad |
| **720 px** | 72 % | 110.000 – 127.000 | **una de cada tres se pasa** |
| **720 px** | 60 % | 89.000 – 103.000 | **sí** |
| 960 px | 60 % | 147.000 – 219.000 | no, con ninguna calidad |

De modo que **720 px no entra holgado: entra gracias a `CALIDADES`**, la escalera que baja un
escalón cuando la fotografía trae mucho detalle. Esa escalera dejó de ser un por si acaso y
pasó a usarse de verdad, y conviene que quede dicho: era el seguro, ahora es parte del
camino normal.

Se probó también **WebP**, que suele venderse un 25–35 % más ligero. Medido aquí ahorra entre
un 7 y un 12 %, que no da para subir ni un escalón de tamaño y a cambio obliga a detectar si
el navegador sabe codificarlo. **No compensa**, y queda escrito para no volver a probarlo.

### Por qué no se fue a 960 px

Porque el límite deja de ser el de la imagen y pasa a ser el del catálogo. `/eventos` lee
doce publicaciones de una sola consulta y **cada documento trae su imagen dentro**: el
`loading="lazy"` del `img` no ahorra nada, porque los bytes llegaron con la consulta, no con
la etiqueta. Subir el límite de las reglas multiplicaría lo que descarga esa vista por una
imagen que solo necesita la ficha.

La salida existe y es otro cambio: **sacar la imagen grande a su propio documento**
—`publicaciones/{id}/imagen/grande`— que solo lea la ficha, dejando en la publicación una
miniatura. Eso es modelo de datos, reglas, pruebas de reglas y migración de lo ya publicado,
y se registra aquí como la puerta por la que habría que salir si algún día hace falta más
resolución.

### Lo que cuesta este cambio

El catálogo pasa a descargar imágenes de 720 px donde dibuja 330. Lo que hoy descarga sí
está medido —**278 KB** para las doce publicaciones sembradas—; lo que descargará **es una
estimación y conviene decirlo**, porque todavía no hay ninguna imagen de 720 px guardada:
sale de la tabla de arriba, donde el mismo archivo pasa de unos 55.000 caracteres a entre
89.000 y 110.000, o sea **entre 1,6 y 2 veces**. Al ritmo de una conexión 4G de 5 Mbps eso
son unas cuatro décimas de segundo más, dentro del presupuesto de **RNF-04** (vista principal
en menos de tres segundos). Es un coste real y no se disimula: se paga por una nitidez que
esa vista no usa, y habrá que volver a medirlo cuando haya publicaciones nuevas. Es el precio de no separar la imagen grande, y
desaparece el día que se separe.

### Lo que mejora, y lo que no

| | Antes | Después |
| --- | --- | --- |
| Forma del estándarte | cuadrado 1136 × 1136 | **16/9, 720 × 405** |
| Foto ya publicada (341 × 480) | 3,33 × estirada | **2,11 ×** |
| Foto nueva, vertical | — | **1,41 ×** |
| Foto nueva, apaisada | — | **1,00 ×** — sin estirar |

**Las imágenes ya guardadas no se migran.** Siguen midiendo 480 px y mejoran solo por dejar
de estirarse. Quien quiera la nitidez completa en una publicación suya no necesita ninguna
migración: le basta con **volver a elegir la foto y guardar**, y se reduce ya a 720 px.

### La constante vive en dos lenguajes

`LADO_MAXIMO` está en `src/utils/imagen.js` y el tope del estándarte en
`DetalleEvento.css`. Son el mismo número por una razón —*no dibujar nunca más ancho de lo más
ancho que se guarda*— y no hay forma de compartir una constante entre JavaScript y CSS.

Así que el desajuste se detecta en una prueba: `pruebas/unidad/imagen.test.js` lee la hoja de
estilos y comprueba que el `max-width` de `.detalle__imagen.imagen-actor` coincide con
`LADO_MAXIMO`. Se comprobó que falla por sus dos caminos antes de darla por buena —cambiando
el tope a 900 px y quitándolo del todo—, y hay además una prueba que **fija el valor 720**
escrito a mano, para que subirlo sea una decisión y no un descuido.
