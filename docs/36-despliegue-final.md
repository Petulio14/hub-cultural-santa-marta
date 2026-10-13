# Despliegue de la versión final

> **Historia de usuario:** HU-37 · Sprint 8
> **Objetivo específico:** 3 — Validar el prototipo con los actores culturales y el jurado.
> **Requisitos asociados:** RNF-08.
> **Depende de:** [HU-08 · despliegue continuo](12-despliegue-continuo.md), HU-35, HU-36.

La dirección pública del prototipo es, desde el Sprint 3 y sin cambios:

**https://hub-cultural-santa-marta.vercel.app**

---

## 1. Lo que esta historia **no** tenía que construir

Conviene empezar por ahí, porque dos de sus tres criterios estaban resueltos antes de
abrirla. [HU-08](12-despliegue-continuo.md) dejó montado el despliegue continuo: cada
integración en `master` dispara una compilación en Vercel, la dirección es pública y
estable, está documentada, y las cabeceras de seguridad y la reescritura de rutas se
verificaron entonces sobre la respuesta real.

Esta historia no vuelve a montar nada de eso. Lo que hace es **cerrar la distancia entre el
sitio publicado y el repositorio**, que es su tercer criterio y lo único que faltaba.

## 2. El sitio no decía de dónde salía

> *Dada la versión desplegada, cuando se contraste con el repositorio, entonces debe
> corresponder a una etiqueta de versión identificada.*

Antes de esta historia, **ese contraste no se podía hacer**. El repositorio no tenía ni una
etiqueta, y la página publicada no decía qué código estaba sirviendo. Quien abriera el sitio
—el jurado, el asesor, un actor cultural— no tenía forma de saber si lo que veía era lo
mismo que lo que iba a leer en el código, y quien mirara el código no tenía forma de saber
si estaba publicado.

Un criterio así no se cumple escribiendo en un documento qué commit se desplegó: eso sería
una afirmación sin verificación, y envejece mal en cuanto haya un despliegue más. Se cumple
haciendo que **lo publicado se identifique a sí mismo**.

### Las dos piezas del sello

`vite.config.js` resuelve dos literales **al compilar** y los escribe dentro del paquete:

| Literal | De dónde sale |
| --- | --- |
| `__VERSION__` | El campo `version` de `package.json`, que esta historia sube de `0.1.0` a **`1.0.0`**. |
| `__COMMIT__` | `VERCEL_GIT_COMMIT_SHA` en el despliegue; `git rev-parse --short HEAD` en local. |

El orden de esos dos no es indiferente. **En Vercel no hay repositorio al que preguntar**:
la compilación no recibe un clon completo, así que `git rev-parse` fallaría justo en el
único sitio donde el dato sirve para algo. Por eso se mira primero la variable del entorno y
solo después se pregunta a git. Y si no hay ninguna de las dos cosas —alguien compilando
desde un zip descargado— se escribe `sin-git` en lugar de inventar un identificador: un sello
que miente es peor que no tener sello, porque se le cree.

El pie de página los enseña, en todas las vistas:

```
Versión 1.0.0 · compilación 32a8dba
```

Es letra pequeña a propósito. No es información para quien viene a buscar un evento; es la
que convierte el sitio en algo contrastable para quien tiene que evaluarlo.

### Por qué lleva prueba

Son **tres piezas en tres archivos** —la versión en `package.json`, los dos literales en
`vite.config.js` y el pie que los enseña— y basta con que una se caiga en cualquier limpieza
para que el sitio deje de decir de dónde salió **sin que nada falle ni se vea raro**. Ese es
exactamente el tipo de cosa que se descubre el día que hace falta.

`pruebas/unidad/version.test.js` comprueba las tres, y se comprobó que falla por sus tres
caminos antes de darla por buena:

| Qué se rompió | Qué dijo |
| --- | --- |
| Devolver `package.json` a `0.1.0` | `la versión final no puede ser 0.1.0` |
| Quitar `VERCEL_GIT_COMMIT_SHA` de la configuración | `en Vercel el commit saldría vacío` |
| Dejar de enseñar el commit en el pie | `el pie ya no dice la compilación` |

La primera merece una línea: la prueba exige **mayor ≥ 1**. Un `0.x` significa «todavía no
publicado», que es justo lo contrario de lo que afirma esta historia.

## 3. La etiqueta, y en qué orden

La etiqueta es `v1.0.0` y señala el commit de fusión de esta historia en `master`. El orden
no se puede invertir, y por eso se escribe aquí:

1. Se fusiona el pull request. `master` queda con el sello dentro.
2. **Vercel despliega solo**, sin intervención manual (es el primer criterio de HU-08).
3. Se etiqueta ese commit y se empuja la etiqueta.
4. Se abre el sitio y se compara lo que dice el pie con lo que señala la etiqueta.

```bash
git tag -a v1.0.0 -m "Version final del prototipo - HU-37"
git push origin v1.0.0
```

Y el contraste, que es el criterio literal:

```bash
git rev-parse --short v1.0.0
```

Si eso imprime lo mismo que el pie de la página publicada, la versión desplegada **es** la
etiquetada. Si imprime otra cosa, hay un despliegue posterior a la etiqueta, y entonces lo
que hay que mirar no es el documento sino cuál de los dos va por delante.

## 4. Por qué la matriz de trazabilidad todavía no tiene a HU-37

Esto no es un olvido y conviene dejarlo explicado, porque la aritmética es bonita.

`npm run verificar:casos` exige que la cobertura de las historias «Debe» **construidas** no
baje del 90 %, y una historia cuenta como construida en cuanto tiene un solo caso. Hoy son
31 historias y 28 que superan todos sus casos: **90,3 %**, justo por encima del umbral.

| Si HU-37 entra en la matriz… | Cobertura | Resultado |
| --- | --- | --- |
| con sus tres casos superados | 29 / 32 = **90,6 %** | pasa |
| con uno solo sin superar | 28 / 32 = **87,5 %** | **la integración continua falla** |

O sea que **la matriz no admite media historia**: anotar HU-37 antes de que su tercer
criterio esté comprobado de verdad rompería la compilación de todo el mundo. No es un efecto
secundario molesto, es la herramienta haciendo su trabajo —lo que HU-35 quería de ella—, y
la consecuencia práctica es que los tres casos de HU-37 se añaden cuando los tres pasan, no
antes.

Por eso esta historia se cierra en dos tiempos, que es además lo que
[CLAUDE.md](../CLAUDE.md) manda para una historia que falta comprobar sobre el sitio
publicado: el pull request lleva `Closes #37` desde que se abre —si no, se pierde el enlace
con el issue— y **el issue se reabre** hasta terminar la comprobación.

## 5. Lo comprobado sobre el sitio publicado

> *Dado el prototipo desplegado, cuando se consulte desde un dispositivo externo, entonces
> debe cargar sin errores y con datos de demostración cargados.*

Medido el 12/10/2026 contra `https://hub-cultural-santa-marta.vercel.app`, desde un
navegador ajeno al entorno de desarrollo —no es `localhost`, no hay servidor de desarrollo
en marcha, es la respuesta real de Vercel—:

| Qué | Resultado |
| --- | --- |
| Portada | Carga; título `Inicio · Hub Cultural Santa Marta` |
| `/eventos` pedido **directamente** | **12 tarjetas**: la reescritura de rutas sigue viva |
| `/actores` pedido directamente | **4 fichas**, las cuatro con su imagen |
| Errores en consola | **ninguno** |

Los datos de demostración, por tanto, están cargados y son los que el jurado va a ver.

Queda fuera de lo que puede medir quien escribe esto, y se dice en lugar de darlo por
hecho: la Definición de Terminado pide la comprobación **en un dispositivo móvil real**, no
en una ventana estrecha. La resolución está comprobada —[HU-33](32-responsive-final.md) y
[12 §4](12-despliegue-continuo.md), siete rutas a 360 px sin desbordamiento sobre el sitio
publicado—, pero un teléfono de verdad añade cosas que una ventana no reproduce: la red
móvil, el teclado que tapa media pantalla y el dedo.

## 6. Cierre de HU-37

| Criterio de aceptación | Evidencia |
| --- | --- |
| Dirección pública **estable y documentada** | §1 y [12 §4](12-despliegue-continuo.md): la misma dirección desde el Sprint 3, con sus cabeceras verificadas. |
| Carga **desde fuera**, sin errores y con datos de demostración | §5: 12 eventos, 4 actores, consola limpia, enlaces profundos. |
| Corresponde a una **etiqueta de versión identificada** | §2 y §3: el pie publica versión y compilación; **pendiente de etiquetar y contrastar tras la fusión**. |

---

*Elaboración propia (2026).*
