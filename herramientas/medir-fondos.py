# -*- coding: utf-8 -*-
"""
Mide el contraste de lo que cae sobre las imágenes de fondo — docs/10 §2 quater.

    python herramientas/medir-fondos.py

Lee los «fondo-*.jpg» **tal como se sirven** —con el desvanecido ya dentro— y
calcula el contraste del **píxel peor de las tres** contra cada color que cae
sobre el fondo. No simula nada: mide el archivo que llega a pantalla, compresión
JPEG incluida. Y no mira dónde cae el texto: mira el peor sitio donde podría
caer.

WCAG 2.1 pide 4,5 : 1 para texto corriente y 3 : 1 para lo que identifica un
control (1.4.11), que aquí es el borde de un botón o de un campo.

## Qué se mide y qué no

Hay dos listas porque son dos exigencias distintas, y de la segunda no había
ninguna hasta que el fondo dejó de ser cosa de tres vistas (docs/10 §2
quinquies). Mientras solo `/`, `/actores` y `/mapa` tenían imagen, los controles
que caían encima eran los de esas tres —ninguno— y bastaba con medir el texto.
Con imagen en todas las vistas, el botón «Limpiar los filtros» del catálogo pasó
a estar sobre una imagen, y su borde a 2,25 : 1.

Los colores de las dos listas son los que **de verdad** caen sobre el fondo,
recorridos en el navegador. «--terracota» no está entre los textos por decisión
y no por descuido: donde aparecía sin caja —el aviso de «ya terminó» de una
ficha y los mensajes de error del formulario de publicación— se le dio la caja,
porque sobre la imagen se queda en 3,43 : 1 y no hay manera de subirlo sin
cambiar el color. Si algún día un texto en terracota queda sobre el fondo, no se
añade aquí: se le pone una caja.

## Qué hace cuando algo no llega

Sale con 1 y dice cuál. Es una comprobación, no un informe: el modo de fallo que
vigila es silencioso —un color se toca, la pantalla sigue viéndose «bien», y lo
que se pierde es el margen de quien no ve igual— y ese es justo el que no se
descubre mirando.
"""
from PIL import Image
import re
import sys

PALETA = 'src/styles/variables.css'
FONDOS = ['fondo-inicio.jpg', 'fondo-actores.jpg', 'fondo-mapa.jpg']

# Texto corriente sobre la imagen: 4,5 : 1 (WCAG 1.4.3).
TEXTOS = {
    '--gris-texto': 'la entradilla y la ayuda de una vista',
    '--negro-texto': 'los títulos y el cuerpo',
    '--turquesa-oscuro': 'los enlaces, que es el más justo de los tres',
}

# Lo que identifica un control sobre la imagen: 3 : 1 (WCAG 1.4.11).
CONTROLES = {
    '--gris-control': 'el borde de un botón secundario fuera de una caja',
    '--turquesa-oscuro': 'el relleno de un botón principal fuera de una caja',
}

MINIMO_TEXTO = 4.5
MINIMO_CONTROL = 3.0


def leer_paleta(nombres):
    texto = open(PALETA, encoding='utf-8').read()
    return {n: tuple(int(m.group(1)[i:i + 2], 16) for i in (0, 2, 4))
            for n in nombres
            if (m := re.search(re.escape(n) + r':\s*#([0-9a-fA-F]{6})', texto))}


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


def medir(titulo, catalogo, minimo, pixel):
    """Imprime un bloque y devuelve los nombres que no llegan."""
    colores = leer_paleta(catalogo)
    faltan = [n for n in catalogo if n not in colores]
    print('\n%s — mínimo %s : 1' % (titulo, ('%.1f' % minimo).replace('.', ',')))
    print('-' * 88)
    caidos = []
    for nombre, color in sorted(colores.items(), key=lambda p: contraste(p[1], pixel)):
        valor = contraste(color, pixel)
        llega = valor >= minimo
        if not llega:
            caidos.append(nombre)
        print('  %-20s %6.2f : 1   %-9s %s'
              % (nombre, valor, 'correcto' if llega else 'NO LLEGA', catalogo[nombre]))
    # Un color que se renombre en la paleta desaparecería de la medición sin que
    # nada lo dijera, y el informe seguiría diciendo que todo pasa.
    for nombre in faltan:
        print('  %-20s %-19s %s' % (nombre, 'NO ESTÁ EN LA PALETA', catalogo[nombre]))
    return caidos + faltan


if __name__ == '__main__':
    # Todos los colores medidos son oscuros, así que el peor fondo para todos
    # ellos es el mismo: el píxel de menor luminancia.
    pixel = min((min(Image.open('public/' + f).convert('RGB').get_flattened_data(),
                     key=luminancia) for f in FONDOS), key=luminancia)

    print('Peor píxel de las %d imágenes: #%02x%02x%02x' % ((len(FONDOS),) + pixel))

    problemas = medir('Texto sobre la imagen (WCAG 1.4.3)', TEXTOS, MINIMO_TEXTO, pixel)
    problemas += medir('Controles sobre la imagen (WCAG 1.4.11)', CONTROLES, MINIMO_CONTROL, pixel)

    print()
    if problemas:
        print('No llegan a su mínimo: %s.' % ', '.join(problemas))
        print('Sobre la imagen no se sube un color aclarando el fondo: el 12 % ya está')
        print('medido. O se oscurece el color, o lo que lo lleva se mete en una caja.')
        sys.exit(1)

    print('Todo lo que cae sobre la imagen llega a su mínimo.')
