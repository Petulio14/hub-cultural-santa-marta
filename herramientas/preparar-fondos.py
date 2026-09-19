# -*- coding: utf-8 -*-
"""
Prepara las imágenes de fondo de las vistas — docs/10 §2 quater.

    python herramientas/preparar-fondos.py

Lee los originales de «recursos/fondos/» y escribe los «fondo-*.jpg» que la
aplicación sirve. Los originales **no viven en «public/»** a propósito: todo lo
que hay en esa carpeta se copia tal cual a «dist/» y se publica, y son nueve
megas que nadie descarga nunca porque lo que se sirve es la versión preparada.

Tres pasos:

1. **Reducir a 1600 px.** Nítida, sin desenfocar: la imagen tiene que verse.
   1600 cubre una pantalla de escritorio corriente sin estirarse a la vista.
2. **Desvanecer sobre el color de arena**, dejando visible solo el 12 %. El
   color se lee de «src/styles/variables.css», así que si «--arena» cambia basta
   con volver a ejecutar esto: el guion nunca escribe un color propio.
3. **Guardar en JPEG.** Una imagen al 15 % tiene muy poco contraste interno, y
   eso es justo lo que JPEG comprime mejor: ~90 KB en lugar de los ~300 que
   pesaría nítida y a todo color, con un velo puesto encima por CSS.

Por qué 12 % y no más está en «medir-fondos.py» y en docs/10 §2 quater: las
tres imágenes tienen píxeles negros puros, y la compresión JPEG oscurece además
los bordes nítidos. Al 15 % un enlace se quedaba en 4,22 : 1; al 12 %, 4,71.
"""
from PIL import Image
import os
import re

ANCHO = 1600
VISIBLE = 0.12   # cuánto de la imagen queda; el resto es arena
CALIDAD = 75

ORIGENES = os.path.join('recursos', 'fondos')
SERVIDAS = 'public'
PALETA = os.path.join('src', 'styles', 'variables.css')

FONDOS = [
    ('inicio.png', 'fondo-inicio.jpg'),
    ('actores culturales.png', 'fondo-actores.jpg'),
    ('mapa.png', 'fondo-mapa.jpg'),
]


def leer_arena():
    texto = open(PALETA, encoding='utf-8').read()
    valor = re.search(r'--arena:\s*#([0-9a-fA-F]{6})', texto).group(1)
    return tuple(int(valor[i:i + 2], 16) for i in (0, 2, 4))


def preparar(origen, destino, arena):
    imagen = Image.open(os.path.join(ORIGENES, origen)).convert('RGB')
    alto = round(imagen.height * ANCHO / imagen.width)
    imagen = imagen.resize((ANCHO, alto), Image.LANCZOS)
    imagen = Image.blend(Image.new('RGB', imagen.size, arena), imagen, VISIBLE)

    ruta = os.path.join(SERVIDAS, destino)
    imagen.save(ruta, 'JPEG', quality=CALIDAD, optimize=True, progressive=True)
    return os.path.getsize(os.path.join(ORIGENES, origen)), os.path.getsize(ruta)


if __name__ == '__main__':
    arena = leer_arena()
    for origen, destino in FONDOS:
        antes, despues = preparar(origen, destino, arena)
        print('%-20s %7.2f MB -> %6.1f KB  (%.1f %% menos)'
              % (destino, antes / 1048576, despues / 1024, 100 - despues * 100 / antes))
