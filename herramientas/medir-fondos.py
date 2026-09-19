# -*- coding: utf-8 -*-
"""
Mide el contraste del texto sobre las imágenes de fondo — docs/10 §2 quater.

    python herramientas/medir-fondos.py

Compone cada fondo bajo el velo de arena, tal como lo hace «.fondo::after», y
calcula el contraste del **píxel peor de las tres imágenes** contra cada color
de texto de la paleta. Es la lectura más estricta posible: no mira dónde cae el
texto, mira el peor sitio donde podría caer.

WCAG 2.1 pide 4,5 : 1 para texto corriente y 3 : 1 para texto grande.

Los tres colores de COLORES son los que **de verdad** caen sobre el fondo en las
tres vistas, recorridos en el navegador (docs/10 §2 quater). «--terracota» no
está: solo se usa para avisos y errores, y todos van dentro de una caja blanca.
Si algún día un texto en terracota queda sobre el fondo hay que añadirlo aquí,
porque con este velo se queda en 3,77 : 1 y no pasaría.
"""
from PIL import Image
import re

VELO = 0.75  # el mismo numero que «.fondo::after» — si cambia alli, cambia aqui
PALETA = 'src/styles/variables.css'
FONDOS = ['fondo-inicio.jpg', 'fondo-actores.jpg', 'fondo-mapa.jpg']
COLORES = ['--arena', '--gris-texto', '--negro-texto', '--turquesa-oscuro']


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
    paleta = leer_paleta()
    arena = paleta['--arena']
    textos = {n: c for n, c in paleta.items() if n != '--arena'}

    peor = {n: (99, None) for n in textos}
    for archivo in FONDOS:
        imagen = Image.open('public/' + archivo).convert('RGB')
        for pixel in imagen.get_flattened_data():
            fondo = tuple(round(arena[i] * VELO + pixel[i] * (1 - VELO)) for i in range(3))
            for nombre, color in textos.items():
                valor = contraste(color, fondo)
                if valor < peor[nombre][0]:
                    peor[nombre] = (valor, '#%02x%02x%02x' % fondo)

    print('Velo de arena al %d %%. Peor pixel de las tres imagenes:\n' % (VELO * 100))
    print('%-20s %-8s %-9s %s' % ('color de texto', 'razon', 'fondo', 'WCAG 4,5:1'))
    for nombre, (valor, fondo) in sorted(peor.items(), key=lambda p: p[1][0]):
        print('%-20s %6.2f   %-9s %s'
              % (nombre, valor, fondo, 'pasa' if valor >= 4.5 else 'NO PASA'))
