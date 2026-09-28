# Indicadores básicos de uso de la plataforma

> **Historia de usuario:** HU-34 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RF-15, RNF-06.
> **Depende de:** HU-29.

Cuarta historia del **Sprint 7**, y la última que añade algo que la plataforma no hacía: las
tres anteriores revisaron lo construido, esta construye. El panel del administrador pasa a
decir **cuánto hay publicado y qué se está mirando**.

| Criterio de aceptación | Dónde se cumple de verdad |
| --- | --- |
| Total de publicaciones por estado y por categoría | `contarPorEstado` y `contarPorCategoria` |
| Listar las publicaciones más consultadas | `masConsultadas`, sobre `interacciones` |
| Los registros no llevan datos personales del visitante | **`firestore.rules`**, y ahora con casos que lo prueban |

---

## 1. La decisión de la historia: de dónde salen las consultas

El modelo tiene desde HU-05 un campo `eventos.contadorConsultas` y
[04 §10](04-modelo-datos.md) declara un índice `estadoPublicacion ASC, contadorConsultas DESC`,
los dos puestos pensando en esta historia. Lo natural sería que la ficha de una publicación
incrementara ese contador al abrirse.

**Y no puede.** `allow update` sobre `eventos` exige ser el dueño o el administrador, y quien
consulta el catálogo no es ninguno de los dos. No se descubrió aquí: HU-28 lo midió y lo dejó
anotado para que no costara una tarde ([27 §8](27-detalle-de-la-publicacion.md)).

Había dos salidas.

### La que no se tomó

Abrir la escritura del contador. Se puede expresar en una regla, y con precisión: que la
escritura solo toque esa clave y que el valor crezca exactamente en uno.

```
allow update: if request.resource.data.diff(resource.data)
                   .affectedKeys().hasOnly(['contadorConsultas'])
  && request.resource.data.contadorConsultas == resource.data.contadorConsultas + 1;
```

Se descartó por dos motivos, y el primero pesa más que el segundo:

- **Deja a cualquiera escribiendo en `eventos`**, que es la colección donde vive el trabajo de
  los actores culturales. Hoy esa regla solo dejaría incrementar un número; el día que alguien
  la toque sin leerla entera, el error cae sobre la publicación entera. El precio de un
  indicador no puede ser una puerta abierta en la colección más valiosa.
- **El contador se infla llamando muchas veces.** La regla no puede distinguir a quién le
  toca incrementar, así que un guion que pida la misma página mil veces suma mil consultas.

### La que se tomó

Contar los registros de `interacciones`. Esa colección ya estaba lista y no por casualidad:
HU-29 la estrenó para los contactos y dejó escrito que «HU-29 escribe el segundo tipo; HU-34,
el primero». Ya acepta que cualquiera añada un registro de cuatro campos, ya prohíbe
modificarlo y ya es de lectura exclusiva del administrador.

**`firestore.rules` no cambia en esta historia**, ni `firestore.indexes.json`: ordenar por un
solo campo no necesita índice compuesto.

### Lo que queda sin uso, y se conserva

`contadorConsultas` y su índice. Se quedan donde están, igual que las otras dos filas que
[04 §10](04-modelo-datos.md) marca como planeadas y no usadas: **la diferencia entre lo que se
diseñó y lo que se construyó es en sí misma un dato del trabajo**, y borrarla dejaría el
modelo pareciendo que acertó a la primera.

---

## 2. Primer criterio · cuánto hay publicado

> Dado el panel de indicadores, cuando se cargue, entonces debe mostrar el total de
> publicaciones por estado y por categoría.

Las dos mitades se resuelven con **consultas de recuento**: `getCountFromServer` devuelve
cuántos documentos cumplen una condición **sin traer ni uno**. Contar así trece publicaciones
y contar así trece mil cuesta lo mismo.

- **Por estado**, tres consultas, una por estado del modelo.
- **Por categoría**, una por categoría. Los identificadores se los pasa el panel, que ya los
  tiene cargados para su propia tabla: volver a pedirlos aquí sería leer dos veces lo mismo en
  la misma página.

Un detalle de presentación que es una decisión: **los tres estados se piden siempre, también
los que dan cero**. Un panel donde la fila «devueltas» desaparece cuando no hay ninguna se lee
como que esa categoría no existe, no como que está vacía.

---

## 3. Segundo criterio · qué se está mirando

> Dado el panel, cuando se consulte, entonces debe listar las publicaciones con mayor número
> de consultas.

### Dónde se anota

En la ficha de una publicación, al abrirse. Dos condiciones, y las dos importan:

- **Solo si la publicación existe.** Una dirección mal escrita no es una consulta de nada, y
  contarla metería en los indicadores identificadores de evento que no corresponden a ninguno.
- **Una sola vez por visita.** No es una precaución teórica: **React monta y desmonta cada
  efecto dos veces en desarrollo**, porque `StrictMode` está encendido en `main.jsx`. Sin la
  marca, todo número del panel saldría el doble mientras se desarrolla, y un indicador que
  miente solo en desarrollo es peor que uno que miente siempre, porque nadie lo mira dos veces.

Se dispara y no se espera respuesta, igual que el contacto de HU-29
([28 §6](28-contacto-directo.md)): quien abre una ficha quiere leerla, no esperar a que se
anote que la abrió.

### Por qué se agrupa en memoria

**Firestore no tiene `GROUP BY`.** Sabe contar cuántos documentos cumplen una condición —que
es lo que usan los dos indicadores de arriba— pero no sabe agrupar por el valor de un campo y
devolver el recuento de cada grupo. Para saber qué publicaciones se consultan más hay que
traerse los registros y agruparlos.

Eso tiene un techo y está puesto: `TOPE_DE_REGISTROS = 1000`. Mil es mucho más de lo que este
prototipo va a generar y bastante menos de lo que tarda en notarse. Si algún día se queda
corto, lo que hay que cambiar no es el número: es contar en el servidor, y para eso hace falta
escribir el recuento en alguna parte en el momento de la consulta — que es justamente la
puerta que la sección 1 decidió no abrir.

### Las decisiones del cálculo

Están en `utils/indicadores.js`, que son funciones puras y por eso se comprueban con
`npm run probar`. Tres merecen nombrarse:

- **Los contactos no se cuentan como consultas.** Viven en la misma colección y no son lo
  mismo: una publicación con muchas consultas y ningún contacto dice algo distinto de una con
  pocas consultas y varios contactos, y sumarlas borraría justo esa diferencia. El panel
  enseña los contactos aparte, como total del periodo.
- **El desempate es por identificador, no por orden de llegada.** Dos publicaciones con el
  mismo número de consultas tienen que salir siempre en el mismo orden. Si no, la tabla se
  reordena sola entre dos recargas que no cambiaron nada, y eso se lee como que el indicador
  no es de fiar.
- **Una publicación eliminada sigue apareciendo**, con su cuenta y sin título. HU-23 deja
  retirarlas y los registros de interacción no se borran con ellas; esconder la fila haría que
  el total del panel no cuadrara con la suma de lo que enseña.

---

## 4. Tercer criterio · y quién lo garantiza

> Dados los registros de interacción, cuando se almacenen, entonces no deben contener datos
> personales identificables del visitante.

Un registro tiene cuatro campos: su identificador, a qué evento se refiere, de qué tipo es y
cuándo ocurrió. Del visitante no se guarda nada.

Lo que esta historia añade no es eso —ya estaba desde HU-29— sino **la prueba de que no es una
promesa del cliente**. La regla usa `hasOnly`, que acota por los dos lados: rechaza las claves
que no enumera. Aunque alguien escribiera a mano una petición con la dirección IP, el
navegador o un identificador de sesión, **el servidor la rechaza**.

Eso estaba escrito en la regla desde HU-11 y **no lo comprobaba ningún caso**. Ahora sí, con
cuatro:

| Lo que se intenta escribir de más | Resultado |
| --- | --- |
| `ip: '190.85.0.1'` | rechazado |
| `navegador: 'Chrome 141 en Android'` | rechazado |
| `idSesion: 'sesion-abc-123'` | rechazado |
| `uid` de quien tiene la sesión abierta | rechazado |

El tercero es el que más importa y conviene decir por qué: **sin nada que haga de
identificador de sesión, dos consultas de la misma persona son indistinguibles de dos
consultas de dos personas**. Es lo que RNF-06 pide, y es lo que hace que el indicador cuente
**visitas y no visitantes**. El panel lo dice con esas palabras.

---

## 5. Los números vienen con su letra pequeña, y va en pantalla

Un indicador que se interpreta mal hace más daño que no tenerlo. Si el administrador retira
una categoría porque «casi no se consulta» y resulta que el número estaba corto, la decisión
fue mala con datos que parecían buenos.

Por eso lo que el número **no** dice está escrito junto al número, y no aquí:

- **Son una cota inferior.** El registro se envía sin esperar respuesta, así que cuenta las
  consultas que se pudieron anotar, no todas las que hubo.
- **Se calculan sobre los últimos N registros**, y el panel dice cuántos son y si se llegó al
  tope.
- **Desde cuándo cuentan.** Con un tope, «5 consultas» significa cinco desde una fecha, y esa
  fecha se mueve según cuánto se use la plataforma. El panel la escribe.

---

## 6. Verificación

### Las funciones puras · `npm run probar`

**318 casos, todos en verde.** Los 18 nuevos, en `pruebas/unidad/indicadores.test.js`, no
comprueban que sumar funcione: comprueban lo que el panel promete y que es fácil romper sin
darse cuenta.

| Qué fija | Por qué |
| --- | --- |
| Un contacto no cuenta como consulta | Viven en la misma colección |
| Dos empatadas salen siempre en el mismo orden | Una tabla que se reordena sola no es de fiar |
| Una publicación borrada conserva su fila | Si no, el total no cuadra con lo que se ve |
| Un registro sin la clave no forma un grupo «undefined» | No se puede clasificar, no entra |
| Una categoría retirada sale con su identificador | Sigue teniendo publicaciones que contar |

### Las reglas · `npm run probar:reglas`

Cuatro casos nuevos, los de la sección 4. **No se pudieron ejecutar en local**: el emulador de
Firestore no arranca en esta máquina, y es una limitación conocida desde HU-11. Los ejecuta la
integración continua, que es donde se comprueban las reglas desde entonces.

### La estructura · `npm run verificar`

Sin incidencias. `indicadoresService.js` lee `eventos` además de `interacciones`, igual que
`categoriasService` lee `eventos` para contar: la regla de [03 §3](03-arquitectura.md) es que a
Firebase se entra por `services/`, no que cada colección tenga un único servicio.

### En el navegador

**La ficha del catálogo, en vivo.** Se abrieron dos publicaciones y se comprobó que sale la
escritura hacia Firestore. Conviene decirlo entero: **eso dejó registros `consulta` reales en
la base de datos del proyecto**, y las reglas prohíben borrarlos a propósito, así que ahí se
quedan. Son indistinguibles de una visita normal, que es exactamente lo que fueron.

**El panel, en banco de pruebas.** Exige sesión de administrador y el servidor de desarrollo
autentica contra el Firebase real, así que la sección se midió en un archivo estático que carga
el CSS real del proyecto con el marcado que produce `Indicadores.jsx`, igual que se hizo con la
tabla en [32 §4](32-responsive-final.md):

| Comprobación | 360 px | 1280 px |
| --- | --- | --- |
| Desbordamiento horizontal | ninguno | ninguno |
| Las cuatro cifras de estado | una por fila, 156 px | cuatro en fila, 275 px |
| Las barras de categoría | correctas | correctas |

**Lo que sigue pendiente**, por cuarta historia seguida: el recorrido del panel con cuenta de
administrador de verdad.

---

## 7. Lo que queda fuera

- **Las visitas al catálogo y al mapa.** Se cuenta abrir la ficha de una publicación, que es
  lo que el criterio pide. Cuántas veces se abrió el catálogo o se filtró por una categoría
  sería otro indicador y otra decisión sobre qué registrar.
- **La evolución en el tiempo.** El panel dice cuánto va, no cómo cambió. Una gráfica por
  semanas necesitaría agrupar por fecha, que es el mismo problema de la sección 3 y con más
  registros.
- **Contar en el servidor.** Es lo que haría falta el día que el tope se quede corto, y pide
  una decisión sobre dónde escribir ese recuento sin abrir `eventos`.
