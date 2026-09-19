# -*- coding: utf-8 -*-
"""
Prepara las imágenes de fondo de las vistas — docs/10 §2 quater.

    python herramientas/preparar-fondos.py

Lee los originales de «recursos/fondos/» y escribe los «fondo-*.jpg» que la
aplicación sirve. Los originales **no viven en «public/»** a propósito: todo lo
que hay en esa carpeta se copia tal cual a «dist/» y se publica, y son nueve
megas que nadie descarga nunca porque lo que se sirve es la versión preparada.

Cuatro pasos, en este orden y por este motivo:

1. **Reducir a 480 px.** El desenfoque destruye el detalle, así que guardar
   1672 px es guardar información que nadie verá. El navegador vuelve a estirar
   la imagen sobre la pantalla y la suaviza todavía un poco más.
2. **Desenfocar.** Se hace aquí y no con «filter: blur()» en CSS para no
   descargar tres megas y desenfocar en cada pintado lo que ya está decidido.
3. **Aclarar un 40 %.** Lo que limita el contraste del texto es el píxel más
   oscuro del fondo. Aclarar sube ese suelo.
4. **Saturar ×2,2.** Y esto es lo que hace que la imagen se siga viendo: el
   contraste de WCAG se calcula sobre la **luminancia**, y la saturación casi no
   la toca. Aclarar y saturar a la vez da un fondo pálido pero con color, que es
   lo contrario de un fondo gris.

El resultado se mide con «python herramientas/medir-fondos.py».
"""
from PIL import Image, ImageEnhance, ImageFilter
import os

ANCHO = 480      # el desenfoque no necesita más
RADIO = 20       # sobre 480 px equivale a ~70 sobre el original
BLANCO = 0.40    # cuánto se aclara
SATURACION = 2.2 # cuánto se recupera de color
CALIDAD = 80

ORIGENES = os.path.join('recursos', 'fondos')
SERVIDAS = 'public'

FONDOS = [
    ('inicio.png', 'fondo-inicio.jpg'),
    ('actores culturales.png', 'fondo-actores.jpg'),
    ('mapa.png', 'fondo-mapa.jpg'),
]


def preparar(origen, destino):
    imagen = Image.open(os.path.join(ORIGENES, origen)).convert('RGB')
    alto = round(imagen.height * ANCHO / imagen.width)
    imagen = imagen.resize((ANCHO, alto), Image.LANCZOS)
    imagen = imagen.filter(ImageFilter.GaussianBlur(RADIO))
    imagen = Image.blend(imagen, Image.new('RGB', imagen.size, (255, 255, 255)), BLANCO)
    imagen = ImageEnhance.Color(imagen).enhance(SATURACION)

    ruta = os.path.join(SERVIDAS, destino)
    imagen.save(ruta, 'JPEG', quality=CALIDAD, optimize=True, progressive=True)
    return os.path.getsize(os.path.join(ORIGENES, origen)), os.path.getsize(ruta)


if __name__ == '__main__':
    for origen, destino in FONDOS:
        antes, despues = preparar(origen, destino)
        print('%-20s %7.2f MB -> %5.1f KB  (%.1f %% menos)'
              % (destino, antes / 1048576, despues / 1024, 100 - despues * 100 / antes))
