# Ejecución de las pruebas funcionales y de permisos

> **Historia de usuario:** HU-35 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RNF-08; todos los RF.
> **Depende de:** HU-31.

Quinta historia del **Sprint 7**, y la única que no añade ni revisa nada: **mide**. Toma los
criterios de aceptación de las 40 historias, les busca a cada uno un caso de prueba, ejecuta
lo ejecutable y dice qué porcentaje de lo que había que construir supera todo lo suyo.

| Criterio de aceptación | Resultado |
| --- | --- |
| Cada criterio de aceptación con al menos un caso | **119 de 119** de las historias construidas |
| Cobertura de historias «Debe» ≥ 90 % | **93,1 %** (27 de 29) |
| 100 % de los accesos no autorizados rechazados | **100 %** (22 criterios, 221 casos de reglas) |
| Todo caso fallido con su hallazgo y su severidad | **6 hallazgos**, 2 de casos y 4 de observación |

```bash
npm run verificar:casos
```

---

## 1. La matriz es dos archivos, y eso es la decisión

La trazabilidad se guarda en `pruebas/casos/`, partida en dos:

| Archivo | Quién lo escribe | Qué guarda |
| --- | --- | --- |
| `criterios.json` | `herramientas/generar-criterios.js`, desde los issues | los 140 criterios, con la prioridad de cada historia |
| `casos.json` | a mano | un caso por criterio: tipo, dónde está la evidencia y qué dio |
| `hallazgos.json` | a mano | lo que se encontró y no se resolvió, con su severidad |

**Separar los criterios de los resultados es lo que hace que esto sirva.** Si estuvieran en el
mismo archivo, regenerar desde los issues borraría los resultados, y a la segunda vez nadie
volvería a regenerar: la matriz se quedaría congelada y diría cosas de una versión del backlog
que ya no existe.

Partido, `verificar-casos.js` puede decir exactamente qué se descuadró: qué criterio nuevo no
tiene caso y qué caso apunta a un criterio que el issue ya no tiene.

Los criterios viven en los issues, que son la fuente (`CLAUDE.md`). La copia del repositorio es
**una instantánea fechada**, no una segunda fuente, y existe por dos motivos: la matriz que
exige HU-40 tiene que poder leerse dentro de unos años, y tiene que poder comprobarse sin
credenciales de GitHub.

---

## 2. Primer criterio · ningún criterio sin comprobar

> Dado el conjunto de historias, cuando se diseñen los casos de prueba, entonces cada criterio
> de aceptación debe tener al menos un caso asociado.

**140 criterios en 40 historias. 119 tienen caso.** Los 21 que no son de las seis historias
que todavía no se han construido —HU-35 a HU-40, del Sprint 7 y del 8—.

Esa distinción está en el guion y no es cosmética. Una historia **sin ningún** caso es una
historia que no se ha empezado, y contarla como fallada sería medir el futuro. Una historia con
unos criterios cubiertos y otros no es un olvido, y esa sí se señala.

### Los ocho tipos de caso

No todos los criterios se comprueban igual, y forzarlos a un solo formato habría sido peor que
no medir. Un criterio que dice «debe recibir la aprobación del asesor» no tiene una prueba
automática posible; uno que dice «la operación debe ser rechazada» no necesita que nadie la
mire.

| Tipo | Casos | Qué es |
| --- | --- | --- |
| `navegador` | 32 | recorrido manual, con la medida anotada en su documento |
| `reglas` | 22 | `npm run probar:reglas`, contra el emulador |
| `unidad` | 22 | `npm run probar`, funciones puras |
| `produccion` | 18 | comprobado sobre el sitio publicado, con cuentas reales |
| `documental` | 17 | la evidencia es un documento: el criterio pide que exista y diga algo |
| `asesor` | 3 | depende de una aprobación externa al repositorio |
| `estructura` | 3 | `npm run verificar` |
| `herramienta` | 2 | un guion de `herramientas/` que mide y sale con 1 si no llega |

**Los 44 casos automáticos** —`unidad`, `estructura` y `herramienta` más los 22 de `reglas`— se
ejecutan enteros en cada integración. Detrás de ellos hay **318 casos de unidad y 221 de
reglas**: un criterio de aceptación no se comprueba con una aserción, se comprueba con las que
haga falta.

---

## 3. Segundo criterio · la cobertura

> Dada la ejecución de las pruebas, cuando concluya, entonces la cobertura de historias de
> prioridad «Debe» que superan todos sus casos no debe ser inferior al 90 %.

**29 historias «Debe» construidas. 27 superan todos sus casos. 93,1 %.**

El denominador merece explicarse, porque es donde se puede hacer trampa sin querer. Hay **35**
historias «Debe» en el backlog; seis no se han construido. Medir sobre 35 daría 27/35 = 77,1 %
y estaría contando como fallado lo que todavía no existe. Medir sobre las 29 construidas es lo
que responde a la pregunta que el criterio hace: **de lo que hay, ¿cuánto funciona entero?**

El guion imprime las dos cifras que hacen falta para reconstruirlo —las historias sin empezar
van con nombre y apellido en el informe— para que la cuenta se pueda revisar y no haya que
creérsela.

**Y el margen es estrecho.** Dos historias por debajo dan 93,1 %; una tercera daría 89,7 % y
rompería el umbral. Se comprobó a propósito, estropeando un caso, para saber dónde está el
borde y no descubrirlo en la entrega.

### Las dos que no pasan

Ni una es de código. **HU-01 y HU-03 tienen un criterio cada una que pide la aprobación del
asesor**, y esa constancia no está en el repositorio:

- El pie de `docs/01` afirma que el documento fue aprobado, y la única validación registrada
  es la del otro integrante, que dice que se cumplen «los primeros tres criterios».
- `docs/02 §6` tiene la tabla de constancia preparada y la fila del asesor dice, literalmente,
  «pendiente de registrar fecha y observaciones».

Se registran como hallazgos H-04 y H-05, severidad baja. Rellenarlas sube la cobertura al
100 %.

---

## 4. Tercer criterio · los permisos

> Dadas las pruebas de permisos, cuando se ejecuten con cada rol, entonces el 100 % de los
> accesos no autorizados debe ser rechazado.

**22 criterios de aceptación tienen su evidencia en la suite de reglas, y los 22 pasan.**

Conviene no confundir ese 22 con el tamaño de la prueba: son **criterios**, no aserciones. La
suite de `pruebas/reglas/` tiene **221 casos** repartidos en 21 bloques, uno por historia que
tocó las reglas, y se ejecuta entera contra el emulador de Firestore en cada integración.

Las identidades que la suite pone a prueba son seis, y las dos últimas no son roles sino
estados, que es lo que HU-15 añadió: visitante sin cuenta, actor cultural, **otro** actor
cultural —el dueño frente al ajeno—, administrador, dueño de un hub, y una **cuenta
desactivada**, que conserva la sesión y pierde los permisos. Y lo que se comprueba no es solo
que el
acceso indebido se rechace: **cada prohibición va acompañada del permiso que sí debe
concederse**, que es una regla del repositorio desde HU-11 y la razón de que una regla que lo
deniegue todo no pase estas pruebas.

> **No se ejecutan en local.** El emulador de Firestore no arranca en la máquina de desarrollo,
> y es una limitación conocida desde HU-11. Quien las ejecuta es la integración continua, que
> es donde se han comprobado desde entonces.

---

## 5. Cuarto criterio · el registro de hallazgos

> Dado cualquier caso fallido, cuando se registre, entonces debe crearse el hallazgo
> correspondiente con su severidad.

`pruebas/casos/hallazgos.json`, y el guion comprueba lo que el criterio pide: **que todo caso
sin superar tenga su hallazgo**. Al revés no se exige, y por eso el registro es más largo que
la lista de casos fallidos: cuatro de los seis hallazgos no vienen de un caso, vienen de haber
mirado.

| | Severidad | Hallazgo |
| --- | --- | --- |
| H-01 | **alta** | Sin conexión, una escritura responde que sí y se pierde |
| H-02 | media | Lo servido desde la caché no se distingue de lo recién leído |
| H-03 | media | El escudo de la UAEMex pesa 131 KB comprimidos y se dibuja a 24 px |
| H-06 | media | Las cuatro vistas privadas no se han recorrido con sesión iniciada |
| H-04 | baja | Falta la constancia de la aprobación del asesor del Sprint 1 |
| H-05 | baja | El alcance del MVP no tiene registrada su aceptación |

**Ninguno crítico**, entendiendo por crítico lo que impide usar la plataforma o expone datos.

### El único de severidad alta

**H-01** es el que hay que decidir antes de operar de verdad. Firestore encola las escrituras y
las resuelve de forma optimista: «Guardar» sin red responde que sí, la vista enseña el aviso de
éxito, y quien cierre la pestaña antes de que vuelva la red pierde el cambio **sin que nada se
lo diga**. Las lecturas sí lo distinguen desde HU-31, con `exigirRespuesta`; las escrituras no.

Es alta y no crítica porque no pierde datos ya guardados ni expone nada: pierde una edición
reciente, y solo sin conexión. Pero cumple la definición de alta al pie de la letra —el sistema
hace algo incorrecto sin avisar, y quien lo usa no puede saberlo— y pide una decisión de
producto, no de código: avisar de que hay escrituras sin confirmar, bloquear el envío sin red,
o confiar en la cola y decirlo.

### De dónde salen los otros

Tres venían anotados de las historias anteriores del sprint y **estuvieron mal apuntados**: al
cerrar HU-31 y HU-32 se dejaron «para HU-33», que es de diseño adaptable y no los iba a
resolver. HU-33 lo corrigió y los mandó aquí, que es donde el backlog dice que van
([32 §5](32-responsive-final.md)). El cuarto, H-06, lo arrastran las cuatro historias del
sprint.

---

## 6. Verificación

### El guion, comprobado por los dos lados

`CLAUDE.md` pide que una regla nueva se compruebe fallando antes de darla por buena. Se le
estropearon tres cosas a propósito:

| Lo que se estropeó | Lo que dijo |
| --- | --- |
| Se borró el caso de HU-30.3 | «HU-30.3 no tiene caso, y la historia sí tiene otros» |
| Se puso HU-25.1 en «falla» | «no supera su caso y no tiene hallazgo registrado», y la cobertura bajó a 89,7 % |
| Ídem | «hay casos de permisos que no rechazan lo que deben» |

Y restaurados los tres, «Sin incidencias».

### Lo que corre en integración continua

El trabajo de CI gana un paso, antes de los demás:

```yaml
- name: Matriz de trazabilidad criterios-casos
  run: npm run verificar:casos
```

Va primero por lo mismo que `verificar`: es el más barato de los cinco y el que más rápido dice
que algo se descuadró.

| Paso | Qué comprueba |
| --- | --- |
| `npm run verificar` | 4 reglas estructurales |
| `npm run verificar:casos` | **la matriz: 119 casos, 93,1 % de cobertura, hallazgos** |
| `npm run probar` | 318 casos de unidad |
| `npm run probar:reglas` | 221 casos contra el emulador |
| `npm run build` | compilación de producción |

---

## 7. Lo que queda fuera

- **La cobertura de código.** Esta historia mide cobertura de **criterios de aceptación**, que
  es lo que pide, y no qué porcentaje de las líneas de `src/` ejecuta la suite. Son dos cosas
  distintas y la segunda no estaba en el alcance.
- **Automatizar lo que hoy es `navegador` y `produccion`.** Son 50 de los 119 casos, y
  convertirlos en pruebas de extremo a extremo pide una herramienta y cuentas de prueba
  aisladas, que es infraestructura que este prototipo no tiene.
- **Los hallazgos, que quedan abiertos.** HU-35 los registra con su severidad, que es lo que el
  criterio pide. Resolverlos es trabajo de otras historias, y H-01 necesita antes una decisión
  que no es técnica.
