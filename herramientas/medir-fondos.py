# -*- coding: utf-8 -*-
"""
Mide el contraste del texto sobre las imágenes de fondo — docs/10 §2 quater.

    python herramientas/medir-fondos.py

Lee los «fondo-*.jpg» **tal como se sirven** —con el desvanecido ya dentro— y
calcula el contraste del **píxel peor de las tres** contra cada color de texto
que cae sobre el fondo. No simula nada: mide el archivo que llega a pantalla,
compresión JPEG incluida. Y no mira dónde cae el texto: mira el peor sitio
donde podría caer.

WCAG 2.1 pide 4,5 : 1 para texto corriente y 3 : 1 para texto grande.

Los tres colores de COLORES son los que **de verdad** caen sobre el fondo en las
tres vistas, recorridos en el navegador (docs/10 §2 quater). «--terracota» no
está: solo se usa para avisos y errores, y todos van dentro de una caja blanca.
Si algún día un texto en terracota queda sobre el fondo hay que añadirlo aquí.
"""
from PIL import Image
import re

PALETA = 'src/styles/variables.css'
FONDOS = ['fondo-inicio.jpg', 'fondo-actores.jpg', 'fondo-mapa.jpg']
COLORES = ['--gris-texto', '--negro-texto', '--turquesa-oscuro']


def leer_paleta():
    texto = open(PALETA, encoding='utf-8').read()
    return {n: tuple(int(m.group(1)[i:i + 2], 16) for i in (0, 2, 4))
            for n in COLORES
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


if __name__ == '__main__':
    textos = leer_paleta()
    # Los tres colores de texto son oscuros, así que el peor fondo para todos
    # ellos es el mismo: el píxel de menor luminancia.
    pixel = min((min(Image.open('public/' + f).convert('RGB').get_flattened_data(),
                     key=luminancia) for f in FONDOS), key=luminancia)

    print('Peor píxel de las tres imágenes: #%02x%02x%02x\n' % pixel)
    print('%-20s %-8s %s' % ('color de texto', 'razón', 'WCAG 4,5:1'))
    for nombre, color in sorted(textos.items(), key=lambda p: contraste(p[1], pixel)):
        valor = contraste(color, pixel)
        print('%-20s %6.2f   %s' % (nombre, valor, 'pasa' if valor >= 4.5 else 'NO PASA'))
