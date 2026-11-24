"""Destellos de lente plata/azul con alfa (solo transform+opacity en CSS)."""
import numpy as np
from PIL import Image
A = 'C:/Users/aleja/boda-guadalupe-y-luis-alberto/assets/'
BLANCO = np.array([1, 1, 1.])
PLATA = np.array([.86, .90, .96])      # perla fria
AZUL = np.array([.31, .53, .90])       # #4F86E6
HIELO = np.array([.75, .82, .95])


def rejilla(n):
    c = (n - 1) / 2
    y, x = np.mgrid[0:n, 0:n]
    return (x - c) * 512 / n, (y - c) * 512 / n


def rayo(u, v, ancho, largo):
    return np.exp(-(v / ancho) ** 2) * np.exp(-np.abs(u) / largo)


def guarda(rgb, nombre, n):
    rgb = 1 - np.exp(-rgb * 1.5)
    borde = np.clip((256 - np.hypot(*rejilla(n))) / 44, 0, 1)
    rgb *= (borde * borde * (3 - 2 * borde))[..., None]
    al = rgb.max(2)
    col = rgb / np.maximum(al[..., None], .004)
    im = np.dstack([col, al])
    Image.fromarray((im.clip(0, 1) * 255 + .5).astype('uint8'), 'RGBA').save(A + nombre + '.webp', lossless=False, quality=88, alpha_quality=95, method=6)


n = 420
x, y = rejilla(n); r = np.hypot(x, y)
u, v = (x + y) / np.sqrt(2), (x - y) / np.sqrt(2)
rgb = (np.exp(-(r / 6.5) ** 2) * 3.2)[..., None] * BLANCO
rgb += (np.exp(-r / 15) * .75)[..., None] * PLATA
rgb += (np.exp(-r / 48) * .24)[..., None] * AZUL
rgb += (rayo(x, y, 1.25, 92) * 1.15)[..., None] * PLATA
rgb += (rayo(x, y, 5.5, 62) * .13)[..., None] * AZUL
rgb += (rayo(y, x, 1.05, 38) * .95)[..., None] * BLANCO
rgb += (rayo(u, v, .8, 15) * .42)[..., None] * HIELO
rgb += (rayo(v, u, .8, 15) * .42)[..., None] * HIELO
rgb += (np.exp(-((r - 74) / 3.2) ** 2) * .035)[..., None] * AZUL
for gx, gr, ga in ((-112, 8, .05), (92, 5, .06), (150, 11, .03)):
    rgb += (np.exp(-(np.hypot(x - gx, y) / gr) ** 4) * ga)[..., None] * AZUL
guarda(rgb, 'flare', n)

n = 150
x, y = rejilla(n); r = np.hypot(x, y)
u, v = (x + y) / np.sqrt(2), (x - y) / np.sqrt(2)
rgb = (np.exp(-(r / 17) ** 2) * 3)[..., None] * BLANCO
rgb += (np.exp(-r / 42) * .5)[..., None] * PLATA
rgb += (rayo(x, y, 3.4, 62) * 1.25)[..., None] * BLANCO
rgb += (rayo(y, x, 3.4, 62) * 1.25)[..., None] * BLANCO
rgb += (rayo(u, v, 2.2, 24) * .45)[..., None] * HIELO
rgb += (rayo(v, u, 2.2, 24) * .45)[..., None] * HIELO
guarda(rgb, 'flare-mini', n)

fondo = Image.new('RGBA', (620, 420), '#061A45')
fondo.alpha_composite(Image.open(A + 'flare.webp'), (0, 0))
fondo.alpha_composite(Image.open(A + 'flare-mini.webp'), (440, 130))
fondo.convert('RGB').save('C:/Users/aleja/boda-guadalupe-y-luis-alberto/_src/ver/flares.jpg', quality=92)
