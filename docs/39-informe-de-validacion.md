# Informe de validación del prototipo

> **Historia de usuario:** HU-40 · Sprint 8
> **Objetivo específico:** 3 — Validar el prototipo con los actores culturales y el jurado.
> **Requisitos asociados:** RNF-01, RNF-10.
> **Depende de:** [HU-35 · pruebas y hallazgos](34-pruebas-y-hallazgos.md), [HU-36 · usabilidad](35-usabilidad.md).

> ⚙ **Este documento se genera.** Lo escribe `herramientas/generar-informe.js` leyendo la
> matriz de trazabilidad, el registro de hallazgos, el volcado de sesiones y la tabla de
> requisitos. **No se edita a mano**: `npm run verificar` comprueba que el archivo del
> repositorio sea exactamente el que saldría hoy, de modo que no pueda quedarse diciendo
> un número que ya cambió. Para actualizarlo, `npm run informe`.

---

## 1. Lo que este informe concluye

Los cuatro criterios de aceptación de HU-40, resueltos con los datos del repositorio:

| Criterio | ¿Se cumple? | Por qué |
| --- | --- | --- |
| Presenta cobertura funcional, puntaje SUS y verificación de calidad | **no** | La cobertura y la verificación de calidad están (§2 y §4); **el puntaje SUS no existe**: 0 de 8 sesiones ejecutadas (§3). |
| Incluye la matriz requisitos ↔ historias ↔ casos | **sí** | §5: 25 requisitos, 40 historias y 133 casos cruzados. |
| Ningún hallazgo de severidad alta sin resolver | **no** | Quedan 2 abiertos: H-01 y H-07 (§6). |
| Alimenta el capítulo de resultados y discusión | **sí** | Las tablas de §2 a §6 son el material de ese capítulo, y cada número se puede volver a calcular. |

**Dos de los cuatro no se cumplen todavía, y los dos dependen de lo mismo**: que se
ejecuten las ocho sesiones de usabilidad con personas ajenas al equipo. Sin ellas no hay
puntaje SUS, y mientras no las haya el hallazgo **H-07** sigue abierto con severidad alta.
Es la única historia del trabajo que no se puede terminar escribiendo código, y se dice
aquí en lugar de rellenar el hueco con una estimación.

## 2. Cobertura funcional alcanzada

| Medida | Valor |
| --- | --- |
| Historias de usuario | 40 |
| Criterios de aceptación | 140 |
| Criterios con al menos un caso de prueba | 133 |
| Criterios de historias todavía sin construir | 7 (HU-38, HU-40) |
| Historias «Debe» construidas | 33 |
| De ellas, superan **todos** sus casos | 30 |
| **Cobertura funcional** | **90,9 %** (umbral del segundo criterio de HU-35: 90,0 %) |

La cobertura cuenta **historias enteras**, no casos sueltos: una historia con tres
criterios superados y uno pendiente no cuenta como tres cuartos, cuenta como no superada.
Es deliberadamente severo, y es lo que hace que el número signifique algo.

### Por tipo de caso

| Tipo | Casos | Qué significa |
| --- | --- | --- |
| `navegador` | 32 | recorrido manual en el navegador, con la medida anotada en su documento |
| `reglas` | 22 | `npm run probar:reglas` — contra el emulador de Firestore, en integración continua |
| `unidad` | 22 | `npm run probar` — funciones puras, sin emulador ni navegador |
| `documental` | 21 | la evidencia es un documento: el criterio pide que exista y diga algo |
| `produccion` | 21 | comprobado sobre el sitio publicado |
| `herramienta` | 8 | un guion de `herramientas/` que mide y sale con código 1 si no llega |
| `estructura` | 4 | `npm run verificar` — reglas estructurales del repositorio |
| `asesor` | 3 | depende de una aprobación externa al repositorio |

De esos casos, **22** son criterios cuya evidencia es la suite de reglas de
seguridad, y **22** rechazan el acceso indebido: 100,0 %. Esa suite tiene
por dentro 221 casos y se ejecuta entera en cada integración.

### Resultado de cada caso

| Resultado | Casos |
| --- | --- |
| pasa | 127 |
| pendiente | 6 |

## 3. Puntaje SUS

**No hay puntaje.** El instrumento está completo y probado —hoja de consentimiento, guion
de seis tareas, cuestionario SUS y la aritmética del cálculo con sus casos de prueba— y
el volcado de sesiones tiene **0 participantes de los 8** que pide el criterio de HU-36.

```
npm run usabilidad
  Todavía no hay ninguna sesión volcada.
  Hacen falta 8 participantes que no hayan construido la plataforma.
```

Calcular un SUS con cero respuestas daría un número, y ese número sería falso. El detalle
del instrumento está en [35 · usabilidad](35-usabilidad.md); lo que falta es ejecutarlo.

## 4. Verificación frente a las características de calidad

Los requisitos no funcionales **son** las características de calidad que este trabajo se
comprometió a sostener. Cada uno con dónde está comprobado:

| Requisito | Característica | Dónde se comprueba |
| --- | --- | --- |
| **RNF-01** | La interfaz debe resultar comprensible y operable para usuarios sin formación técnica. | Facilidad de uso — [37 · manual de usuario](37-manual-de-usuario.md) y el instrumento de [35](35-usabilidad.md); **la validación con personas está pendiente** |
| **RNF-02** | El sistema debe funcionar en los navegadores de mayor uso. | **Sin evidencia en el repositorio.** Ninguna historia lo reclama y ningún documento lo verifica (§5) |
| **RNF-03** | El sistema debe adaptarse a distintos tamaños de pantalla. | Accesibilidad — [31 · accesibilidad](31-accesibilidad.md), con los contrastes medidos por `herramientas/medir-contraste.py` |
| **RNF-04** | El tiempo de carga inicial debe ser razonable en conexiones móviles. | Tiempo de carga — medido en [10 §](10-responsive.md) y [18 §11](18-imagen-del-perfil.md); ninguna historia lo reclama (§5) |
| **RNF-05** | Las credenciales de acceso deben gestionarse de forma segura. | Responsive — [32 · responsive final](32-responsive-final.md), siete rutas a 360 px sin desbordamiento |
| **RNF-06** | El tratamiento de datos personales debe cumplir la normativa colombiana. | Tratamiento de datos — [14 · tratamiento de datos](14-tratamiento-de-datos.md) |
| **RNF-07** | El sistema debe atender criterios básicos de accesibilidad. | Control de acceso — [11 · reglas de seguridad](11-reglas-de-seguridad.md), 221 casos contra el emulador |
| **RNF-08** | El acceso a los datos debe restringirse según el rol del usuario. | Integración y despliegue — [12 · despliegue continuo](12-despliegue-continuo.md) y [36 · despliegue final](36-despliegue-final.md) |
| **RNF-09** | El sistema debe ser mantenible y evolucionable. | Mantenibilidad — [38 · documentación técnica](38-documentacion-tecnica.md) y las cinco reglas de `npm run verificar` |
| **RNF-10** | El sistema debe operar dentro de los recursos gratuitos disponibles. | Coste cero — [03 §6.1](03-arquitectura.md): sin Storage y sin servidor propio |

## 5. Matriz de trazabilidad

Requisito → historias que lo realizan → casos de prueba de esas historias. Es la tabla que
pide el segundo criterio, y la que permite responder «¿dónde se comprueba RF-07?» sin leer
el repositorio entero.

| Requisito | Historias | Casos | Superados |
| --- | --- | --- | --- |
| **RF-01** | HU-01, HU-02, HU-12, HU-15 | 16 | 15 de 16 |
| **RF-02** | HU-13, HU-14 | 7 | 7 de 7 |
| **RF-03** | HU-05, HU-18, HU-19 | 12 | 12 de 12 |
| **RF-04** | HU-20 | 3 | 3 de 3 |
| **RF-05** | HU-21 | 4 | 4 de 4 |
| **RF-06** | HU-18, HU-23 | 8 | 8 de 8 |
| **RF-07** | HU-17, HU-21 | 7 | 7 de 7 |
| **RF-08** | HU-22 | 3 | 3 de 3 |
| **RF-09** | HU-09, HU-20, HU-25, HU-28 | 13 | 13 de 13 |
| **RF-10** | HU-26, HU-27, HU-30 | 11 | 11 de 11 |
| **RF-11** | HU-05, HU-28, HU-30 | 11 | 11 de 11 |
| **RF-12** | HU-29 | 3 | 3 de 3 |
| **RF-13** | HU-24 | 4 | 4 de 4 |
| **RF-14** | HU-17 | 3 | 3 de 3 |
| **RF-15** | HU-01, HU-02, HU-29, HU-34 | 14 | 13 de 14 |
| **RNF-01** | HU-01, HU-06, HU-31, HU-36, HU-38, HU-40 | 16 | 11 de 16 |
| **RNF-02** | — | 0 | — |
| **RNF-03** | HU-06, HU-10, HU-33 | 10 | 10 de 10 |
| **RNF-04** | — | 0 | — |
| **RNF-05** | HU-11 | 3 | 3 de 3 |
| **RNF-06** | HU-16, HU-34 | 7 | 7 de 7 |
| **RNF-07** | HU-06, HU-32 | 8 | 8 de 8 |
| **RNF-08** | HU-08, HU-11, HU-15, HU-35, HU-37 | 17 | 17 de 17 |
| **RNF-09** | HU-04, HU-07, HU-08, HU-39 | 12 | 12 de 12 |
| **RNF-10** | HU-01, HU-40 | 4 | 3 de 4 |

**2 requisitos no los reclama ninguna historia**: RNF-02 y RNF-04.
No es lo mismo en los dos casos, y conviene separarlo:

- **RNF-04** sí está medido —el presupuesto de tres segundos aparece en [10](10-responsive.md),
  [18 §11](18-imagen-del-perfil.md) y [32](32-responsive-final.md)—, pero ninguna ficha de historia lo
  declara, así que la trazabilidad hacia él se sostiene en la prosa y no en la matriz.
- **RNF-02** —funcionar en los navegadores de mayor uso— **no tiene ni historia ni evidencia**.
  Es el único requisito declarado del que este trabajo no puede enseñar una comprobación.

Las dos cosas quedan registradas como hallazgos (§6) en lugar de corregirse cambiando las
fichas, que sería reescribir el expediente para que cuadre.

## 6. Registro de hallazgos

Abiertos: **9** de 9.

| Id | Severidad | Hallazgo | Estado |
| --- | --- | --- | --- |
| H-01 | alta | Sin conexión, una escritura responde que sí y se pierde | abierto |
| H-02 | media | Lo servido desde la caché no se distingue de lo recién leído | abierto |
| H-03 | media | El escudo de la UAEMex pesa 131 KB comprimidos y se dibuja a 24 px | abierto |
| H-04 | baja | Falta la constancia de la aprobación del asesor del Sprint 1 | abierto |
| H-05 | baja | El alcance del MVP no tiene registrada su aceptación | abierto |
| H-06 | media | Las cuatro vistas privadas no se han recorrido con sesión iniciada | abierto |
| H-07 | alta | Las ocho sesiones de usabilidad no se han ejecutado | abierto |
| H-08 | media | RNF-02 no lo reclama ninguna historia y no hay constancia de prueba en varios navegadores | abierto |
| H-09 | baja | RNF-04 está medido pero ninguna historia lo declara | abierto |

| Severidad | Abiertos | Qué significa |
| --- | --- | --- |
| crítica | 0 | impide usar la plataforma o expone datos. Ninguna abierta. |
| alta | 2 | el sistema hace algo incorrecto sin avisar, y quien lo usa no puede saberlo |
| media | 4 | el sistema hace algo correcto de forma incompleta, o cuesta más de lo debido |
| baja | 3 | no afecta al funcionamiento: falta constancia, peso de más, trabajo futuro |

**El tercer criterio de HU-40 no se cumple.** Siguen abiertos 2 hallazgos de severidad alta:

- **H-01 · Sin conexión, una escritura responde que sí y se pierde.** Decidir entre avisar de que hay escrituras sin confirmar, bloquear el envío sin red, o confiar en la cola y decirlo. Es una decisión de producto, no de código.

- **H-07 · Las ocho sesiones de usabilidad no se han ejecutado.** Citar a ocho participantes que no hayan construido la plataforma —cuatro visitantes, tres actores culturales y un administrador—, al menos la mitad en teléfono, y volcar cada sesión a «pruebas/usabilidad/sesiones.json».

## 7. Qué falta para cerrar el proyecto

| # | Qué | Quién puede hacerlo |
| --- | --- | --- |
| 1 | **Ejecutar las ocho sesiones de usabilidad** con personas ajenas al equipo | Nadie desde el repositorio: hacen falta ocho personas |
| 2 | Decidir qué hacer con **H-01**, las escrituras sin conexión | Es una decisión de producto; después, código |
| 3 | Validar el manual con alguien de fuera (tercer criterio de HU-38) | Una persona, veinte minutos |
| 4 | Registrar las dos constancias del asesor (**H-04** y **H-05**) | El asesor |
| 5 | Recorrer las cuatro vistas privadas con sesión (**H-06**) | Quien tenga una cuenta de cada rol |
| 6 | Comprobar el sitio en los navegadores que pide RNF-02 (**H-08**) | Una tarde, y cierra el último requisito sin evidencia |
| 7 | Declarar RNF-04 en las fichas de HU-09 y HU-25 (**H-09**) | Quien pueda editar los issues |

Ninguno de los siete se resuelve escribiendo código en este repositorio, y por eso el
informe los enumera en lugar de darlos por hechos. Los dos últimos los encontró este mismo
informe al cruzar la matriz.

## 8. Cierre de HU-40

| Criterio de aceptación | Evidencia |
| --- | --- |
| Cobertura funcional, puntaje SUS y características de calidad | §2 (90,9 %), §3 (**sin puntaje**: 0 de 8 sesiones) y §4. |
| Matriz de trazabilidad requisitos ↔ historias ↔ casos | §5: 25 requisitos cruzados, con 2 sin historia. |
| Ningún hallazgo de severidad alta sin resolver | §6: **2 abiertos** (H-01, H-07). |
| Alimenta el capítulo de resultados y discusión | Las tablas de §2 a §6, todas recalculables con `npm run informe`. |

---

*Elaboración propia (2026).*
