# Pruebas de usabilidad con usuarios representativos

> **Historia de usuario:** HU-36 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RNF-01.
> **Depende de:** HU-33.

Cierra el **Sprint 7** y la **épica E6**. Es la única historia del trabajo que **no se puede
terminar escribiendo código**: pide ocho personas que no construyeron la plataforma, sentadas
delante de ella.

Lo que esta entrega deja hecho es **todo lo demás**: el instrumento completo, la aritmética
del cuestionario con sus casos de prueba, y el guion que procesa los resultados en cuanto
existan.

| Criterio de aceptación | Estado |
| --- | --- |
| Consentimiento informado del participante | **Instrumento listo**, sin firmar |
| Registrar si se completan las tareas, el tiempo y las dificultades | **Instrumento listo**, sin sesiones |
| SUS ≥ 68 con al menos ocho participantes | **Pendiente de ejecución** |
| Si baja del umbral, hallazgos al backlog y repetir | **El guion lo exige**, sin datos que juzgar |

```bash
npm run usabilidad
```

---

## 1. Por qué esta historia se entrega a medias, y por qué eso no es un atajo

Las otras treinta y cinco historias del backlog se comprueban con algo que se puede ejecutar:
una suite, una regla, una medida en el navegador. **Esta se comprueba con personas**, y no hay
forma honesta de simularlo. Inventar ocho cuestionarios para que el número saliera por encima
de 68 sería falsificar el único dato del trabajo que mide si la plataforma sirve para alguien
que no la hizo.

Así que `sesiones.json` **nace vacío**, y el guion que lo procesa lo dice con todas las letras
en lugar de fallar:

```
Todavía no hay ninguna sesión volcada.
Hacen falta 8 participantes que no hayan construido la plataforma.
```

Lo que sí se entrega, y es lo que hace que la sesión se pueda ejecutar sin improvisar nada:

| Archivo | Para qué |
| --- | --- |
| `pruebas/usabilidad/consentimiento.md` | se lee en voz alta y se firma antes de empezar |
| `pruebas/usabilidad/guion.md` | las seis tareas, qué mirar en cada una y las tres reglas de quien acompaña |
| `pruebas/usabilidad/cuestionario-sus.md` | los diez ítems, listos para imprimir |
| `pruebas/usabilidad/sesiones.json` | dónde se vuelca cada sesión, con las instrucciones dentro |
| `herramientas/sus.js` | la aritmética, con 18 casos de prueba |
| `herramientas/calcular-sus.js` | lo procesa todo y da el veredicto |

---

## 2. Primer criterio · el consentimiento

> Dada la sesión de prueba, cuando se inicie, entonces debe obtenerse el consentimiento
> informado del participante.

El documento está escrito para **leerse en voz alta**, no para firmarse sin leer. Tres
decisiones que lo separan de un formulario de trámite:

**Dice qué se anota y qué no, en dos columnas.** «No se graba audio, vídeo ni pantalla» es más
tranquilizador que cualquier párrafo sobre confidencialidad, porque es comprobable en el
momento.

**El anonimato es real y por eso tiene una consecuencia incómoda, que también se dice.** La
hoja firmada se archiva **aparte de los datos de la sesión y sin el número de participante**.
Eso significa que nadie puede reconstruir qué dijo quién —que es el objetivo— y también que
**una vez terminada la sesión no se pueden retirar los datos de alguien**, porque no hay forma
de encontrar su fila. Un consentimiento que prometiera las dos cosas estaría mintiendo en una.

**Avisa de que no se ayuda.** «Yo no voy a poder ayudarle mientras lo intenta, aunque se me
note en la cara que quiero» está en el guion y su versión seria en el consentimiento. Sin ese
aviso, quien participa interpreta el silencio de quien acompaña como enfado.

Y lo primero que se dice, antes que nada: **«lo que se evalúa es la plataforma, no usted»**.

---

## 3. Segundo criterio · las tareas

> Dado el conjunto de tareas guiadas, cuando se ejecuten sin asistencia, entonces debe
> registrarse si se completan, el tiempo empleado y las dificultades observadas.

Seis tareas, repartidas por rol, y las tres primeras las hace todo el mundo: **cualquiera llega
a la plataforma como visitante antes que como otra cosa**.

| | Rol | Tarea | Qué está midiendo de verdad |
| --- | --- | --- | --- |
| T1 | visitante | encontrar actividades de música | si el filtro se descubre o se lee la lista entera |
| T2 | visitante | abrir una y contactar | si el acceso al contacto se ve sin desplazarse |
| T3 | visitante | situarse en el mapa | **en teléfono, si descubre el gesto de dos dedos** |
| T4 | actor cultural | publicar un taller | si entiende que queda pendiente, y si sitúa el punto |
| T5 | actor cultural | corregir la hora | **si lee el aviso de que volverá a revisión** |
| T6 | administrador | moderar una publicación | si encuentra su cola entre las tres del panel |

Las tareas están redactadas **como situaciones, no como instrucciones**. «Está de visita este
fin de semana y quiere saber qué hay de música» deja que la persona elija el camino; «pulse
Eventos y luego el filtro» mide si sabe seguir órdenes, que no es lo que hace falta saber.

### Las tres reglas de quien acompaña

Están en el guion porque son donde se arruina una sesión:

1. **No ayudar, ni con la mirada.** Ante «¿es aquí?», responder «¿usted qué haría?».
2. **No justificar el diseño.** Explicar por qué algo está donde está convierte la sesión en
   una defensa, y a partir de ahí la persona deja de criticar por cortesía.
3. **Anotar lo que pasa, no lo que se interpreta.** «Pulsó tres veces en el logotipo» es un
   dato. «No entendió la navegación» es una conclusión, y esa se saca después, con las ocho
   sesiones delante.

### Las dos medidas se separan

`calcular-sus.js` resume las tareas **aparte** del cuestionario, y no es por comodidad: el SUS
mide lo que la persona **opina** al terminar y la tasa de completitud mide lo que **logró**
mientras. Un participante puede completar las seis tareas y puntuar bajo porque le costaron, y
eso es información, no ruido.

Del tiempo se toma la **mediana y no el promedio**: con ocho participantes, uno que se
distraiga dos minutos mueve el promedio de una tarea de treinta segundos hasta hacerlo
inservible.

---

## 4. Tercer criterio · el cuestionario, y por qué su aritmética es código

> Dado el cuestionario SUS, cuando se aplique a al menos ocho participantes, entonces el
> puntaje promedio debe ser igual o superior a 68.

La **System Usability Scale** (Brooke, 1996) son diez frases y una escala de cinco puntos. Su
aritmética es pequeña y traicionera:

- los ítems **impares** están redactados en positivo y aportan `respuesta − 1`;
- los **pares** están en negativo y aportan `5 − respuesta`;
- la suma se multiplica por **2,5** para llevarla de 0 a 100.

Esa alternancia es deliberada —obliga a leer cada frase en lugar de marcar una columna
entera— y es exactamente donde se equivoca quien lo pasa a una hoja de cálculo. **Una fórmula
mal puesta da un número perfectamente creíble**, y un puntaje de usabilidad mal calculado no
se nota mirándolo: 47 y 82 se leen igual de plausibles.

Por eso está en `herramientas/sus.js` con **18 casos de prueba**, y tres de ellos se pueden
verificar sin calcular nada:

| Respuestas | Puntaje |
| --- | --- |
| impares en «muy de acuerdo», pares en «muy en desacuerdo» | **100** |
| justo lo contrario | **0** |
| todo en el punto medio | **50** |

Si alguien invirtiera la fórmula de los pares, los tres se caen a la vez.

### Dos negativas deliberadas

**Un cuestionario incompleto no se estima: revienta.** Cada ítem vale 2,5 puntos, así que
rellenar el que falta con la media inventaría hasta dos puntos y medio de resultado. El guion
lo señala con el número de participante y el mensaje dice cuántas respuestas llegaron.

**El promedio se redondea a un decimal.** El instrumento solo produce múltiplos de 2,5; más
decimales serían precisión que no está en los datos.

### Por qué 68

No es un número redondo elegido por gusto: es el **promedio de los estudios publicados con el
instrumento**. Un puntaje por debajo no significa «malo en abstracto», significa «por debajo de
lo corriente», que es una afirmación mucho más útil para decidir si se corrige o se entrega.

---

## 5. Cuarto criterio · qué pasa si el número sale bajo

> Dado un puntaje inferior al umbral, cuando se obtenga, entonces los hallazgos deben
> incorporarse al backlog y repetirse la medición tras su corrección.

`calcular-sus.js` **sale con código 1** cuando hay ocho participantes o más y el promedio no
llega, y lo dice con el trabajo que toca:

```
El promedio es 47.5 y el umbral es 68.
El cuarto criterio pide registrar los hallazgos en el backlog y repetir la medición
después de corregirlos. Las dificultades y las frases de arriba son el material.
```

El material para esos hallazgos ya lo imprime la propia herramienta: **las dificultades
observadas**, juntas, que es donde se ven los patrones —tres personas buscando el contacto
arriba es un hallazgo; una, una anécdota—, y **lo más incómodo en palabras de cada
participante**, que es la única pregunta abierta de la sesión.

Los hallazgos van al registro de [HU-35](34-pruebas-y-hallazgos.md), que ya existe y ya tiene
su tabla de severidades.

### Lo que **no** sale con 1

Con menos de ocho participantes, el guion informa y sale con 0. El promedio se imprime igual,
marcado como provisional, porque sirve para ir viendo; pero **no cumple el criterio**, y así lo
dice. Con cero sesiones, lo mismo: que la medición no se haya hecho todavía no es un defecto
del software.

---

## 6. Verificación

### La aritmética · `npm run probar`

**336 casos, todos en verde.** Los 18 nuevos están en `pruebas/unidad/sus.test.js`.

### El guion, comprobado por sus cuatro caminos

`CLAUDE.md` pide comprobar que algo falla antes de darlo por bueno. Se le dieron cuatro
situaciones con datos temporales, que no se conservan en el repositorio:

| Situación | Lo que dijo | Código |
| --- | --- | --- |
| Sin sesiones | «Todavía no hay ninguna sesión volcada» | 0 |
| Cinco participantes, SUS perfecto | «Faltan 3 participante(s) para poder concluir» | 0 |
| Ocho participantes, promedio 47,5 | «El promedio es 47.5 y el umbral es 68» | **1** |
| Ocho, con un cuestionario de cinco respuestas | «P3: Un SUS son 10 respuestas y llegaron 5» | **1** |

Y con el archivo restaurado, vuelve al primero.

### Lo que le hace a la matriz de HU-35

Los cuatro criterios de esta historia entran en `pruebas/casos/casos.json` marcados
**«pendiente»**, porque no se pueden evaluar sin sesiones, y quedan cubiertos por un solo
hallazgo —**H-07, severidad alta**— en lugar de cuatro entradas iguales.

Eso mueve el número que [HU-35](34-pruebas-y-hallazgos.md) publicó, y conviene mirarlo de
frente:

| | Antes de HU-36 | Ahora |
| --- | --- | --- |
| Historias «Debe» construidas | 29 | **31** |
| Superan todos sus casos | 27 | **28** |
| Cobertura | 93,1 % | **90,3 %** |

**El umbral es 90,0 %.** Es decir: con HU-36 entregada a medias, el proyecto pasa por tres
décimas. No es un defecto de la medición, es lo que la medición sirve para enseñar — y deja
claro qué es lo que más sube esa cifra:

- **ejecutar las ocho sesiones** devuelve cuatro criterios y sube la cobertura a **93,5 %**;
- **rellenar las dos constancias del asesor** ([34 §3](34-pruebas-y-hallazgos.md)) suma otras
  dos historias y la lleva al **100 %**.

Las dos cosas están fuera del código, y ninguna de las dos la puede hacer quien escribe.

### No corre en integración continua, y es a propósito

`npm run usabilidad` no está en el trabajo de CI. Las otras cinco comprobaciones son
regresiones: si fallan, alguien rompió algo y hay que arreglarlo antes de fusionar. Esta es una
**medición**, y un puntaje por debajo del umbral no se arregla en la rama que lo descubre:
pide corregir la plataforma y volver a citar a ocho personas. Ponerlo a bloquear fusiones
dejaría el repositorio en rojo durante semanas por algo que no es un defecto de la rama.

---

## 7. Lo que falta, dicho con precisión

**Ejecutar las ocho sesiones.** Eso es todo, y no es poco:

| Rol | Sesiones | Quién sirve |
| --- | --- | --- |
| Visitante | 4 | alguien que no sea de Santa Marta; turismo real si se puede |
| Actor cultural | 3 | gestores, músicos, artesanos: el perfil de RF-03 |
| Administrador | 1 | alguien con criterio de gestión cultural |

**Ninguno puede haber participado en la construcción.** Quien conoce el proyecto no se puede
perder en él, y perderse es justo lo que hay que poder medir.

Conviene además que **al menos la mitad lo pruebe en teléfono**: T3 mide el gesto de dos dedos
del mapa, que en escritorio no existe, y [HU-33](32-responsive-final.md) dejó anotado que en una
pantalla de 640 px el mapa todavía pide un desplazamiento para verse entero. Esa es una
hipótesis que estas sesiones pueden confirmar o descartar.

---

## 8. Lo que queda fuera

- **Las métricas que necesitarían grabar.** Mapas de calor, seguimiento de mirada, repeticiones
  de la sesión en vídeo. El consentimiento promete que no se graba nada, y esa promesa vale
  más que el dato.
- **Una segunda ronda.** El cuarto criterio la exige solo si la primera baja de 68. Si baja,
  corregir y repetir es trabajo de otra historia, y el registro de HU-35 es donde entran los
  hallazgos mientras tanto.
- **Comparar con otra plataforma.** El SUS admite comparación entre productos y aquí solo hay
  uno. El umbral de 68 es la única referencia externa que se usa.
