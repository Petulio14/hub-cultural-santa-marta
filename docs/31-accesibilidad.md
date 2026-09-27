# Accesibilidad conforme a las pautas WCAG 2.1

> **Historia de usuario:** HU-32 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RNF-07.
> **Depende de:** HU-09.

La segunda historia del **Sprint 7**, y como [HU-31](30-validacion-y-errores.md) no añade
nada que la plataforma no hiciera: comprueba que lo que hace se puede usar sin ratón y sin
vista fina.

| Criterio de aceptación | Cómo quedó |
| --- | --- |
| Toda imagen de contenido con texto alternativo | Ya se cumplía. Ahora lo comprueba `npm run verificar` |
| Registro, publicación y catálogo recorribles solo con teclado | Cuatro defectos corregidos |
| Ningún texto por debajo de 4,5 : 1 | Ya se cumplía. Los 12 pares, medidos |
| El foco siempre visible | **No se cumplía: 1,55 : 1 sobre la barra azul** |

---

## 1. La herramienta primero

Los criterios tercero y cuarto son números, y un número que nadie vuelve a calcular envejece
solo. Así que lo primero de esta historia no fue tocar la interfaz: fue
**[`herramientas/medir-contraste.py`](../herramientas/medir-contraste.py)**, que lee la
paleta de `variables.css`, mide cada par que de verdad se pinta junto y sale con código 1 si
alguno no llega a su mínimo.

```bash
python herramientas/medir-contraste.py
```

Es hermano de `medir-fondos.py`, que mide texto sobre las imágenes de fondo leyendo los
píxeles del JPEG servido (docs/10 §2 quater). Aquí no hay imágenes: son colores planos
contra colores planos, que es el otro sitio donde el contraste puede fallar.

Tres decisiones de la herramienta:

- **No mide el producto cartesiano de la paleta.** Once colores dan cincuenta y cinco pares,
  la mayoría imposibles, y el que fallara no diría nada porque nadie los ve juntos. La lista
  se mantiene a mano y **cada entrada dice dónde ocurre**. Lo que no está en la tabla no está
  medido, y eso es una decisión explícita y no un olvido.
- **Distingue los dos mínimos.** WCAG 2.1 pide 4,5 : 1 al texto (criterio 1.4.3) y 3 : 1 a lo
  que no es texto pero lleva información: el borde de un campo, el anillo de foco
  (criterio 1.4.11). **Ese segundo mínimo es el que nadie había mirado**, y es donde estaban
  los dos defectos.
- **Se comprueba a sí misma.** Antes de medir nada verifica su fórmula contra los tres
  valores que publica WCAG: negro sobre blanco 21 : 1, un color contra sí mismo 1 : 1, y
  `#767676` sobre blanco 4,54 : 1. Una herramienta de medida que nadie contrasta contra un
  patrón conocido dice números con la misma seguridad estén bien o mal, y aquí se toman
  decisiones de diseño con lo que diga. Cambiar el coeficiente del rojo de 0,2126 a 0,3 la
  detiene con el mensaje de qué dio y qué tenía que dar.

---

## 2. Cuarto criterio · el foco era invisible justo donde más se usa

> Dado un elemento con foco, cuando se navegue con teclado, entonces el foco debe ser
> visualmente identificable.

`global.css` lleva desde HU-09 una regla que no se ha borrado nunca:

```css
:focus-visible {
  outline: 3px solid var(--turquesa-oscuro);
  outline-offset: 2px;
}
```

Y está bien **sobre las superficies claras**. El problema es dónde cae el anillo:
`outline-offset` lo pinta **fuera** del elemento, así que el fondo contra el que se ve no es
el del elemento enfocado, es el de lo que hay detrás.

En un botón eso salva la situación: el botón principal es turquesa oscuro y el anillo, del
mismo color, se ve porque cae sobre la página, a 6,75 : 1. En **la cabecera y el pie** —las
dos superficies azul profundo del proyecto— lo condena:

| Anillo sobre | Contraste | Mínimo 1.4.11 |
| --- | --- | --- |
| `--arena`, el fondo de página | 6,75 : 1 | correcto |
| `--blanco`, dentro de una tarjeta | 7,47 : 1 | correcto |
| **`--azul-profundo`, la barra y el pie** | **1,55 : 1** | **no llega** |

Es decir: los cinco enlaces del menú, el enlace al inicio, el botón «Ingresar», el botón del
menú compacto y los dos enlaces del pie **recibían un anillo que prácticamente no se ve**. Y
es el primer sitio donde entra el tabulador en cualquier página del sitio.

La corrección son cuatro líneas:

```css
.cabecera :focus-visible,
.pie :focus-visible {
  outline-color: var(--blanco);
}
```

Blanco sobre la barra azul da **11,55 : 1**. Se descartó buscar un color único que valiera
para las dos superficies: para llegar a 3 : 1 contra el azul profundo *y* contra el arena
haría falta una luminancia entre 0,240 y 0,265, una franja tan estrecha que se caería en
cuanto algo cambiara debajo.

### Y de paso, un salto visual

La regla tenía además `border-radius: 4px`. Eso no redondea el anillo: **redondea el
elemento**, así que un botón, que tiene 10 px de radio, se encogía a 4 al recibir el foco.
Los navegadores actuales ya siguen el radio del elemento para dibujar el `outline`, de modo
que la línea sobraba y hacía daño. Fuera.

### El anillo de los mapas, que era peor que el general

`mapa.css` tenía su propia regla con `--turquesa`, un tono más claro, para dos de los tres
lienzos. Hacía tres cosas mal: se olvidaba del mapa de HU-30 —el único que es una vista
entera—, repetía en otro archivo lo que `global.css` ya dice para todo el proyecto, y usaba
un color peor. Medido contra muestras tomadas de las tejas de OpenStreetMap:

| Anillo sobre | `--turquesa`, el que había | `--turquesa-oscuro`, el general |
| --- | --- | --- |
| teja corriente | 4,37 : 1 | **6,51 : 1** |
| zona verde | 3,65 : 1 | **5,44 : 1** |
| **el agua de la bahía** | **3,13 : 1** | **4,66 : 1** |

El agua es el peor caso y por eso se mide: Santa Marta es una ciudad de bahía y el azul claro
cubre media pantalla en el encuadre inicial. La regla propia se borró; los tres lienzos usan
ahora el anillo general.

---

## 3. Tercer criterio · el texto pasaba, el borde de los campos no

> Dado cualquier texto sobre su fondo, cuando se mida, entonces la relación de contraste no
> debe ser inferior a 4,5 a 1.

Los trece pares de texto pasan, y pasaban desde HU-06: la paleta se eligió con los
contrastes calculados (docs/05 §3). El más justo es `--terracota` sobre `--blanco`, a
5,43 : 1, que son los mensajes de error; el de los enlaces, `--turquesa-oscuro` sobre
`--arena`, da 6,75 : 1.

Lo que no pasaba es lo de al lado. **`--gris-borde` da 1,55 : 1 sobre blanco y 1,40 : 1 sobre
arena**, y es el borde de todos los campos de formulario y de los botones secundarios.

Un campo de texto es blanco sobre una página color arena: la diferencia de relleno son
1,11 : 1. Lo único que dice dónde empieza el campo **es el borde**, y a eso WCAG 1.4.11 le
pide 3 : 1. Para quien tiene poca visión, el formulario era una página con etiquetas sueltas.

La corrección es un color nuevo en la paleta, el mismo gris cálido oscurecido:

```css
--gris-control: #8e8778;   /* 3,57 : 1 sobre blanco · 3,23 : 1 sobre arena */
```

**Solo lo usan el campo y el botón secundario.** El resto de los bordes —tarjetas, tablas,
paneles, el marco de un lienzo de mapa— siguen con `--gris-borde`, y eso no es una
inconsistencia: 1.4.11 habla de lo que hace falta *para identificar un control*, y una
tarjeta no es un control. La herramienta los imprime igualmente, bajo el rótulo «exentos»,
para que la decisión se vea y no parezca que se olvidaron.

Se eligió con margen y no justo en el 3,0 por lo que enseñó `--terracota` sobre las imágenes
de fondo (docs/10 §2 quater): un valor al filo se cae en cuanto algo cambia debajo.

### Los veintiún pares

```
Pares que se pintan juntos ............ 18, todos correctos
El anillo sobre las tejas del mapa ..... 3, todos correctos
Descartados, con su porqué ............. 3
Exentos de 1.4.11 ...................... 2
```

De los 18 primeros, **trece son de texto** y cinco son de lo que no es texto: dos bordes de
control y tres posiciones del anillo de foco.

---

## 4. Segundo criterio · cuatro cosas que el teclado no podía hacer

> Dada la navegación, cuando se recorra únicamente con teclado, entonces debe poderse
> completar el registro, la publicación y la consulta del catálogo.

El recorrido en sí estaba bien. Lo que fallaba eran los momentos en que la página **cambia**.

### 4.1 El foco se caía cada vez que un botón abría algo

Hay cuatro sitios donde pulsar un botón **lo hace desaparecer** y pone otra cosa en su lugar:

| Se pulsa | Aparece | Dónde |
| --- | --- | --- |
| «Eliminar» | la pregunta de confirmación | `ConfirmacionDeBorrado.jsx` |
| «Editar» | el formulario de la publicación | `TarjetaDePublicacion.jsx` |
| «Renombrar» | los dos campos de la categoría | `FilaDeCategoria.jsx` |
| «Eliminar» de una categoría | su advertencia | `FilaDeCategoria.jsx` |

Cuando el elemento que tiene el foco se desmonta, el navegador no lo pasa a lo que vino
después: **lo devuelve a `body`**. Con teclado se pulsaba Intro y se perdía el sitio, con el
siguiente tabulador empezando otra vez por la cabecera. Con lector de pantalla no se oía
nada, porque lo nuevo aparecía donde el cursor ya no estaba.

Es el mismo problema que [HU-31 §2](30-validacion-y-errores.md) encontró en los formularios
largos, en otro momento: allí el error se pintaba fuera de la pantalla, aquí el foco se cae
al suelo. Y la solución tiene la misma forma, un gancho compartido:
`src/hooks/useFocoAlAbrir.js`.

Enfoca el elemento marcado con `data-foco-inicial` y, si no lo hay, el primer control de la
región. La marca existe porque la respuesta correcta no es siempre la primera: **en una
confirmación de borrado se enfoca «Cancelar»**, nunca el botón que borra. Poner el foco sobre
una acción irreversible es dejar que una tecla de más la ejecute, y es exactamente la misma
razón por la que «Cancelar» va primero en pantalla desde HU-23.

En la advertencia de una categoría el foco va también a «Cancelar» aunque en pantalla
«Desactivar» esté primero. Desactivar no borra nada —las publicaciones conservan su
clasificación—, pero sí retira la categoría de todos los formularios y de los filtros, y eso
no es lo que debe ejecutar una tecla de más.

**No se atrapa el foco.** Ninguna de las cuatro regiones es modal, y dos de ellas están
dentro de la tarjeta que se va a borrar a propósito, para que se vea qué se decide.

### 4.2 `role="alertdialog"` sobre algo que no es un diálogo

La confirmación de borrado se anunciaba como `alertdialog`. ARIA reserva ese papel para una
ventana modal: algo que tapa la pantalla, recibe el foco y lo retiene mientras está abierto.
Esto es lo contrario **a propósito** y con su razón escrita desde HU-23, así que el papel
prometía a un lector de pantalla un comportamiento que nunca iba a ocurrir.

Ahora es un `group` con su nombre, la pregunta lleva `id`, y el botón que recibe el foco la
referencia con `aria-describedby`: al llegar se anuncia «Cancelar, botón, Se va a eliminar
«…». No se puede deshacer».

### 4.3 Las pestañas prometían flechas y no las tenían

`Ingreso.jsx` declara `role="tablist"` con dos `role="tab"`. Eso promete dos cosas que
faltaban: que **las flechas cambian de pestaña**, y que el tabulador entra y sale del grupo de
una vez en lugar de recorrer las pestañas una a una. Un lector de pantalla anuncia «pestaña 1
de 2» y quien lo oye pulsa la flecha derecha; si no pasa nada, el componente miente sobre lo
que es.

Se implementó el patrón entero: flechas izquierda y derecha, Inicio y Fin, y el *tabindex
rotatorio* —solo la pestaña elegida es tabulable—.

El foco se mueve **en un efecto** y no con `requestAnimationFrame`, que era la primera
versión. Un navegador deja de servir fotogramas a una pestaña que no está a la vista, así que
el foco se habría quedado esperando uno que no llega; se descubrió porque el propio guion de
comprobación se quedó colgado. Un efecto corre tras el repintado siempre.

### 4.4 Los mandos del mapa estaban en inglés

Leaflet rotula los suyos en inglés y no hay manera de traducirlos desde fuera: el botón de
acercar se anuncia «Zoom in» y el crédito lleva «A JavaScript library for interactive maps».
Con el ratón es un detalle —los botones dicen «+» y «−»—, pero **un lector de pantalla solo
tiene el rótulo**, así que quien recorre el mapa con teclado y voz se encontraba dos mandos en
otro idioma en medio de una página en español.

`rotularEnEspanol` en `mapa.js`, aplicado a los tres mapas. La atribución de OpenStreetMap,
que sí es condición de la licencia, no se toca; el crédito de Leaflet se conserva y se
escribe en español.

---

## 5. Primer criterio · ya se cumplía, y ahora está atado

> Dada cualquier imagen de contenido, cuando se inspeccione, entonces debe contar con texto
> alternativo descriptivo.

Las cinco `<img>` del proyecto tienen `alt`: los tres logotipos institucionales con el nombre
de su universidad, y la imagen de un perfil o de una publicación con el nombre de quien la
subió. El único `<svg>` escrito a mano —el dibujo que sustituye a una imagen que no hay— va
con `aria-hidden`, y con su razón escrita: no transmite nada que el nombre de al lado no diga
ya, y anunciarlo obligaría a escuchar «imagen predeterminada» en cada tarjeta del directorio.

Lo que HU-32 añade es que eso **deje de depender de que alguien se acuerde**. `npm run
verificar` tiene una cuarta regla: toda `<img>` lleva `alt` y todo `<svg>` lleva o
`aria-hidden` o un nombre accesible.

Se comprobó que falla antes de darla por buena, como pide `CLAUDE.md`: quitando el `alt` de
un logotipo y el `aria-hidden` del dibujo, señala los dos.

La primera versión **señalaba también `src/utils/imagen.js`**, que no tiene una línea de JSX y
sí una frase que dice «lo que sabe cargar una `<img>`». Una regla que avisa de un comentario
se desactiva a la semana, así que ahora mira solo archivos `.jsx` y les quita los comentarios
antes de buscar.

---

## 6. Verificación

### Automática

| Qué | Resultado |
| --- | --- |
| `python herramientas/medir-contraste.py` | los **21 pares** llegan a su mínimo; sale con 0 |
| `npm run verificar` | cuatro reglas, sin incidencias |
| `npm run probar` | 300 casos, sin cambios |
| `npm run build` | limpio |

### En el navegador

Recorridas las siete vistas públicas a 375 px y a 1280 px:

| Comprobación | Resultado |
| --- | --- |
| Un solo `h1` por vista | 7 de 7 |
| Saltos de nivel de título (h2 → h4) | ninguno |
| Controles enfocables sin nombre accesible | **0**, de 123 controles en total |
| Imágenes sin `alt` | 0 |
| Puntos de referencia | `header`, `nav` «Navegación principal», `main`, `footer` en las siete |
| Desbordamiento horizontal a 375 px | ninguno |
| Errores en consola | ninguno |

Recorridos completos con tabulador:

- **Catálogo**, 26 controles: salto al contenido, menú, los cuatro filtros, «Buscar», las doce
  tarjetas y el pie. Orden correcto, todos nombrados.
- **Mapa**, 27 controles: los once marcadores son enfocables y se anuncian con el título de su
  publicación; el zoom y los créditos, ya en español.
- **Registro**: las flechas cambian de pestaña y arrastran el foco; Inicio y Fin van a la
  primera y a la última.
- **Menú compacto**: se abre con Intro, Escape lo cierra y **devuelve el foco a su botón**.

Y el anillo de foco, medido sobre la página en marcha: `rgb(255,255,255)` de 3 px sobre
`rgb(11,60,93)`, **11,55 : 1**, en la cabecera y en el pie.

### Lo que no se pudo comprobar en vivo

Lo mismo que en HU-31: `MiPerfil`, `MiHub`, el formulario de publicación y el panel exigen
sesión iniciada, y el servidor de desarrollo autentica contra el Firebase real. **Tres de los
cuatro sitios donde se recogía el foco están detrás de esa sesión.** El gancho es el mismo
código en los cuatro y su referencia está puesta en los cuatro, pero el recorrido con cuenta
de actor cultural y de administrador queda pendiente.

### Lo que se miró con ojos y se decidió dejar

La ilustración de fondo del mapa **trae escrito su propio rótulo «SANTA MARTA»**, y cae en el
hueco entre la barra azul y el título de la vista. Se inspeccionó ampliado: no toca los trazos
del título, está al 12 % de visibilidad y el título se lee a 11,26 : 1.

WCAG 1.4.5 —imágenes de texto— exime lo decorativo, y esto lo es: es parte del dibujo, no
información que se transmita por ahí. Se deja, anotado.

---

## 7. Lo que queda fuera

- **Un lector de pantalla de verdad.** Todo lo de aquí se comprobó con el árbol de
  accesibilidad y con el teclado, que es lo que se puede medir. Escuchar NVDA o VoiceOver
  recorriendo el catálogo es otra cosa y no cabía en esta historia.
- **Nivel AAA.** El criterio pide AA y a AA se midió. El contraste de 7 : 1 que pide AAA lo
  cumplen ya casi todos los pares de texto, pero no `--turquesa-oscuro` sobre `--arena`, que
  es el color de los enlaces.
- **La escritura sin conexión**, que [HU-31 §7](30-validacion-y-errores.md) dejó anotada.
  Estuvo apuntada a HU-33 y no era su sitio: va al registro de hallazgos de **HU-35**
  ([32 §5](32-responsive-final.md)).
