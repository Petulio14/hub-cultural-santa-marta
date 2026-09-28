# Guion de la sesión de prueba de usabilidad

> Instrumento de HU-36. Lo usa quien acompaña la sesión; **no se le entrega a quien
> participa**, que solo oye la tarea en voz alta.

---

## Antes de empezar

1. Leer el [consentimiento](consentimiento.md) en voz alta y firmarlo. **Archivarlo aparte**,
   sin el número de participante.
2. Abrir <https://hub-cultural-santa-marta.vercel.app> en una ventana limpia, sin sesión
   iniciada y sin historial.
3. Anotar el **rol** que va a probar esta persona y, si hace falta, entrar con la cuenta de
   prueba correspondiente.
4. Decir la frase de arranque. Está escrita abajo y conviene leerla tal cual: es lo que hace
   que la persona se sienta con permiso de fallar.

> «Vamos a probar una plataforma, no a probarle a usted. Si algo no lo encuentra o le parece
> raro, es culpa nuestra y es justo lo que necesitamos saber. Le voy a pedir cosas y le voy a
> pedir que las intente solo; yo no voy a poder ayudarle mientras lo intenta, aunque se me
> note en la cara que quiero. Cuando quiera dejar una tarea, dígame "lo dejo" y pasamos a la
> siguiente. ¿Alguna pregunta antes de empezar?»

### Las tres reglas de quien acompaña

1. **No ayudar.** Ni con la mirada. Si preguntan «¿es aquí?», responder «¿usted qué haría?».
2. **No justificar el diseño.** Si dicen «esto debería estar arriba», anotarlo y decir
   «gracias, lo apunto». Explicar por qué está donde está convierte la sesión en una defensa.
3. **Anotar lo que pasa, no lo que se interpreta.** «Pulsó tres veces en el logotipo» es un
   dato; «no entendió la navegación» es una conclusión, y esa se saca después.

---

## Tarea 1 · Visitante · encontrar algo que hacer

**Se dice:** «Está de visita en Santa Marta este fin de semana y quiere saber qué hay de
música. Búsquelo.»

| | |
| --- | --- |
| **Empieza en** | la página de inicio, sin sesión |
| **Se considera completada cuando** | llega a una lista filtrada por la categoría de música |
| **Camino previsto** | Inicio → Eventos → filtro de categoría |
| **Qué mirar** | si encuentra el filtro o se pone a leer la lista entera; si confunde el filtro con el buscador |

## Tarea 2 · Visitante · abrir una actividad y contactar

**Se dice:** «De lo que encontró, elija una que le llame la atención y averigüe cómo
preguntarle algo a quien la organiza.»

| | |
| --- | --- |
| **Empieza en** | el listado de la tarea 1 |
| **Se considera completada cuando** | abre la ficha y llega a un canal de contacto |
| **Camino previsto** | tarjeta → ficha → contacto |
| **Qué mirar** | si ve el acceso al contacto sin desplazarse; si entiende que el mensaje va prellenado |

## Tarea 3 · Visitante · situarse en el mapa

**Se dice:** «Quiere ver qué hay cerca de donde se aloja. Use el mapa.»

| | |
| --- | --- |
| **Empieza en** | cualquier vista pública |
| **Se considera completada cuando** | abre el mapa y pulsa un marcador |
| **Camino previsto** | menú → Mapa → marcador → ficha |
| **Qué mirar** | **en teléfono**, si descubre el gesto de dos dedos o se frustra antes; si el mapa se ve al abrir o hay que buscarlo |

## Tarea 4 · Actor cultural · publicar

**Se dice:** «Usted organiza un taller de tambora el sábado que viene, de tres a seis de la
tarde, en el Parque de los Novios. Publíquelo.»

| | |
| --- | --- |
| **Empieza en** | sesión iniciada como actor cultural con perfil ya aprobado |
| **Se considera completada cuando** | la publicación queda enviada a revisión |
| **Camino previsto** | Mis publicaciones → formulario → enviar |
| **Qué mirar** | si entiende que queda pendiente y no publicada; **si sitúa el punto o lo salta**; cómo reacciona al aviso de publicar sin mapa |

## Tarea 5 · Actor cultural · corregir un error

**Se dice:** «Se equivocó: el taller es de cuatro a siete, no de tres a seis. Arréglelo.»

| | |
| --- | --- |
| **Empieza en** | el listado de sus publicaciones |
| **Se considera completada cuando** | guarda el cambio de hora |
| **Camino previsto** | tarjeta → Editar → cambiar la hora → guardar |
| **Qué mirar** | **si lee el aviso de que volverá a revisión**; si encuentra «Editar» a la primera |

## Tarea 6 · Administrador · moderar

**Se dice:** «Llegó una publicación nueva. Revísela y, si está bien, apruébela.»

| | |
| --- | --- |
| **Empieza en** | sesión iniciada como administrador |
| **Se considera completada cuando** | la publicación cambia de estado |
| **Camino previsto** | Panel → cola de publicaciones → Aprobar |
| **Qué mirar** | si encuentra la cola entre las tres del panel; si entiende que devolver exige escribir una observación |

---

## Después de las tareas

1. Pasar el [cuestionario SUS](cuestionario-sus.md). **Sin comentarlo**: si se le explica un
   ítem, la respuesta deja de ser comparable con las de los demás.
2. Preguntar lo único que se pregunta abierto: **«¿Qué fue lo más incómodo?»** Anotar la
   respuesta tal cual, entre comillas.
3. Volcar la sesión a `sesiones.json` con el siguiente número de participante.
4. Borrar lo que se haya publicado durante la sesión.

---

## Cuántas sesiones y con quién

El criterio pide **al menos ocho participantes**. Conviene repartirlos por rol y que **ninguno
haya participado en la construcción**: quien conoce el proyecto no puede perderse en él, y esa
es la medida que se busca.

| Rol | Sesiones | Quién sirve |
| --- | --- | --- |
| Visitante | 4 | alguien que no sea de Santa Marta; turismo real si se puede |
| Actor cultural | 3 | gestores, músicos, artesanos: el perfil de RF-03 |
| Administrador | 1 | alguien con criterio de gestión cultural |

Las tareas 1 a 3 las hace **todo el mundo**, sea cual sea su rol: son las de visitante y
cualquiera llega a la plataforma como visitante antes que como otra cosa.

---

*Elaboración propia (2026). Hub Cultural Santa Marta · HU-36.*
