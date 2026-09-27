# -*- coding: utf-8 -*-
"""
Mide el contraste de cada par de la paleta que de verdad se usa — HU-32.

    python herramientas/medir-contraste.py

Sale con código 1 si algún par no llega a su mínimo, para poder colgarlo de la
integración continua.

Hermano de «medir-fondos.py», que mide texto sobre las imágenes de fondo leyendo
los píxeles del JPEG servido. Aquí no hay imágenes: se miden **colores planos de
la paleta contra colores planos de la paleta**, que es el otro sitio donde puede
fallar el contraste y el que cubre el tercer criterio de aceptación de HU-32.

## Los dos mínimos, que no son el mismo

WCAG 2.1 pide **4,5 : 1** para texto corriente (criterio 1.4.3) y **3 : 1** para
los elementos que no son texto pero llevan información: bordes de un campo, el
anillo de foco, un icono (criterio 1.4.11). Ese segundo mínimo es el que se
había quedado sin medir, y es donde estaba el defecto que HU-32 encontró: el
anillo de foco daba **1,55 : 1** sobre la barra azul.

## Qué pares se miden

No todos los posibles: los que se pintan juntos de verdad, recorridos en el
navegador. Un producto cartesiano de la paleta daría ciento y pico pares, la
mayoría imposibles, y el que fallara no diría nada porque nadie los ve juntos.
La lista se mantiene a mano y cada entrada dice dónde ocurre.

Si una vista nueva pone un color sobre otro, se añade aquí. Lo que no está en
esta tabla no está medido, y eso es una decisión explícita y no un olvido.
"""
import re
import sys

PALETA = 'src/styles/variables.css'

# Mínimos de WCAG 2.1 nivel AA.
TEXTO = 4.5
TEXTO_GRANDE = 3.0  # desde 24 px, o 19 px en negrita
NO_TEXTUAL = 3.0

# (color, fondo, mínimo, dónde ocurre)
PARES = [
    # ── Texto sobre las dos superficies claras ────────────────────────────
    ('--negro-texto', '--arena', TEXTO, 'los títulos y el cuerpo de cada vista'),
    ('--gris-texto', '--arena', TEXTO, 'las ayudas de los campos y las fechas'),
    ('--turquesa-oscuro', '--arena', TEXTO, 'los enlaces sobre el fondo de página'),
    ('--negro-texto', '--blanco', TEXTO, 'el texto dentro de una tarjeta'),
    ('--gris-texto', '--blanco', TEXTO, 'la ayuda de un campo dentro de una tarjeta'),
    ('--turquesa-oscuro', '--blanco', TEXTO, 'los enlaces dentro de una tarjeta'),
    ('--terracota', '--blanco', TEXTO, 'los mensajes de error, siempre en caja blanca'),
    ('--ocre', '--blanco', TEXTO, 'el aviso de «sin situar» en el panel de moderación'),
    ('--blanco', '--ocre', TEXTO, 'el rótulo dentro de la etiqueta de vista pendiente'),

    # ── Texto sobre las dos superficies oscuras: la barra y el pie ────────
    ('--blanco', '--azul-profundo', TEXTO, 'el menú de la cabecera y el pie de página'),

    # ── Texto sobre los botones ──────────────────────────────────────────
    ('--blanco', '--turquesa-oscuro', TEXTO, 'el rótulo de un botón principal'),
    ('--blanco', '--terracota', TEXTO, 'el rótulo de un botón de acción destructiva'),
    ('--turquesa-oscuro', '--blanco', TEXTO, 'el rótulo de un botón secundario'),

    # ── Lo que no es texto y sí lleva información (1.4.11) ───────────────
    ('--gris-control', '--blanco', NO_TEXTUAL, 'el borde de un campo de formulario'),
    ('--gris-control', '--arena', NO_TEXTUAL, 'el borde de un botón secundario sobre el fondo'),
    ('--turquesa-oscuro', '--arena', NO_TEXTUAL, 'el anillo de foco sobre el fondo de página'),
    ('--turquesa-oscuro', '--blanco', NO_TEXTUAL, 'el anillo de foco dentro de una tarjeta'),
    # Este es el par que encontró el defecto. El anillo predeterminado es
    # «--turquesa-oscuro» y sobre la barra azul da 1,55 : 1, así que sobre las dos
    # superficies oscuras se cambia a blanco (global.css, la regla de «.cabecera»
    # y «.pie»). Se mide el blanco porque es lo que se pinta ahí.
    ('--blanco', '--azul-profundo', NO_TEXTUAL, 'el anillo de foco sobre la barra y el pie'),
]

# El anillo de foco sobre un mapa, que no se mide contra la paleta.
#
# Debajo del lienzo hay tejas de OpenStreetMap y no un color del proyecto, así
# que estos tres valores son **muestras tomadas de las tejas**: el fondo
# corriente, el verde de una zona verde y el azul del agua. Es lo que hay detrás
# del mapa de HU-30 y de los dos de HU-22.
#
# El agua es el peor caso y por eso está: es el tono más claro que cubre área
# grande en el encuadre de Santa Marta, que es una ciudad de bahía.
TEJAS = {
    'teja-corriente': (0xf2, 0xef, 0xe9),
    'teja-zona-verde': (0xc8, 0xe6, 0xa0),
    'teja-agua': (0xaa, 0xd3, 0xdf),
}

PARES_DE_MAPA = [
    ('--turquesa-oscuro', 'teja-corriente', NO_TEXTUAL, 'el anillo sobre el mapa'),
    ('--turquesa-oscuro', 'teja-zona-verde', NO_TEXTUAL, 'el anillo sobre una zona verde'),
    ('--turquesa-oscuro', 'teja-agua', NO_TEXTUAL, 'el anillo sobre la bahía'),
]

# Lo que **no** se usa, medido para que quede escrito por qué existe cada regla
# que lo cambió. No cuenta como fallo: es la prueba de un descarte.
DESCARTADOS = [
    ('--turquesa-oscuro', '--azul-profundo', NO_TEXTUAL,
     'el anillo de foco si NO se cambiara sobre la barra azul'),
    ('--gris-borde', '--blanco', NO_TEXTUAL,
     'el borde de un campo si siguiera con el gris de la decoración'),
]

# El anillo que dos de los tres mapas llevaban escrito aparte hasta HU-32: más
# claro que el general, y por tanto peor justo donde más falta hacía.
DESCARTADOS_DE_MAPA = [
    ('--turquesa', 'teja-agua', NO_TEXTUAL, 'el anillo propio que los mapas tenían y ya no'),
]

# Bordes que agrupan y no identifican ningún control: tarjetas, tablas, paneles y
# el marco de un lienzo de mapa. WCAG 1.4.11 no se los exige —«required to
# identify user interface components» habla de controles, no de decoración— y por
# eso «--gris-borde» se queda como está. Están escritos aquí para que la decisión
# se vea y no parezca que se olvidaron.
EXENTOS = [
    ('--gris-borde', '--blanco', 'el borde de una tarjeta, de una tabla o de un panel'),
    ('--gris-borde', '--arena', 'el borde de una zona vacía o del marco de un mapa'),
]


def leer_paleta():
    texto = open(PALETA, encoding='utf-8').read()
    encontrados = {}
    for nombre, valor in re.findall(r'(--[a-z-]+):\s*#([0-9a-fA-F]{6})', texto):
        encontrados['--' + nombre.lstrip('-')] = tuple(
            int(valor[i:i + 2], 16) for i in (0, 2, 4)
        )
    return encontrados


def luminancia(color):
    def canal(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * canal(color[0]) + 0.7152 * canal(color[1]) + 0.0722 * canal(color[2])


def contraste(a, b):
    la, lb = luminancia(a), luminancia(b)
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


def medir(paleta, pares):
    filas = []
    for color, fondo, minimo, donde in pares:
        if color not in paleta or fondo not in paleta:
            filas.append((color, fondo, None, minimo, donde, 'sin definir en la paleta'))
            continue
        razon = contraste(paleta[color], paleta[fondo])
        filas.append((color, fondo, razon, minimo, donde, None))
    return filas


def imprimir(titulo, filas):
    print(f'\n{titulo}')
    print('-' * 104)
    for color, fondo, razon, minimo, donde, problema in filas:
        par = f'{color} sobre {fondo}'
        if problema:
            print(f'  {par:52s}  {problema}')
            continue
        marca = 'correcto' if razon >= minimo else 'NO LLEGA'
        print(f'  {par:52s} {razon:6.2f} : 1   min {minimo:3.1f}   {marca:8s}  {donde}')


def comprobar_la_aritmetica():
    """
    Los tres valores que WCAG publica, para que la fórmula se compruebe a sí
    misma.

    Una herramienta de medida que nadie contrasta contra un patrón conocido dice
    números con la misma seguridad estén bien o mal, y aquí se van a tomar
    decisiones de diseño con lo que diga. Negro sobre blanco son 21 : 1 por
    definición, un color contra sí mismo es 1 : 1, y el gris #767676 sobre blanco
    es el ejemplo con el que WCAG ilustra el límite de 4,5 : 1.
    """
    casos = [
        ((0, 0, 0), (255, 255, 255), 21.00),
        ((255, 255, 255), (255, 255, 255), 1.00),
        ((0x76, 0x76, 0x76), (255, 255, 255), 4.54),
    ]
    for color, fondo, esperado in casos:
        obtenido = contraste(color, fondo)
        if abs(obtenido - esperado) > 0.01:
            raise SystemExit(
                f'La fórmula de contraste está mal: {color} sobre {fondo} da '
                f'{obtenido:.2f} y tenía que dar {esperado:.2f}.'
            )


def main():
    comprobar_la_aritmetica()
    paleta = leer_paleta()
    print(f'Contraste de la paleta · {len(paleta)} colores en {PALETA}')

    filas = medir(paleta, PARES)
    imprimir('Pares que se pintan juntos', filas)

    con_tejas = dict(paleta, **TEJAS)
    de_mapa = medir(con_tejas, PARES_DE_MAPA)
    imprimir('El anillo de foco sobre las tejas del mapa', de_mapa)

    imprimir('Descartados, medidos para dejar escrito por qué',
             medir(paleta, DESCARTADOS) + medir(con_tejas, DESCARTADOS_DE_MAPA))

    print('\nExentos de 1.4.11 porque agrupan y no identifican un control')
    print('-' * 104)
    for color, fondo, donde in EXENTOS:
        razon = contraste(paleta[color], paleta[fondo])
        print(f'  {color + " sobre " + fondo:52s} {razon:6.2f} : 1   sin mínimo         {donde}')

    medidos = filas + de_mapa
    fallos = [f for f in medidos if f[2] is None or f[2] < f[3]]
    if not fallos:
        print(f'\nLos {len(medidos)} pares llegan a su mínimo.')
        return 0

    print(f'\n{len(fallos)} par(es) por debajo del mínimo:')
    for color, fondo, razon, minimo, donde, problema in fallos:
        detalle = problema or f'{razon:.2f} : 1, hacen falta {minimo:.1f}'
        print(f'  - {color} sobre {fondo}: {detalle} ({donde})')
    return 1


if __name__ == '__main__':
    sys.exit(main())
