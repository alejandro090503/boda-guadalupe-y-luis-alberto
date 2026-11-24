"""Adornos PNG (luna+estrellas, estrella, destello, nube) recoloreados a plata/azul + version desenfocada horneada; particulas; aguja."""
import numpy as np
from PIL import Image, ImageFilter
R = 'C:/Users/aleja/'
O = R + 'boda-guadalupe-y-luis-alberto/'
def hx(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], float)
PLATA = np.array([hx(c) for c in ('#2B3340', '#6B7380', '#98A0AD', '#C0C6CE', '#E3E7EC', '#F4F6F9')])
AZUL = np.array([hx(c) for c in ('#0A2152', '#0042A9', '#2F64C8', '#4F86E6', '#A9C4F2', '#F4F6F9')])

def recolor(im, ramp, lo=.05, hi=.95, gamma=1.0):
    im = im.convert('RGBA'); a = np.array(im).astype(float)
    l = (a[..., 0]*.3 + a[..., 1]*.55 + a[..., 2]*.15) / 255.
    t = np.clip((l-lo)/(hi-lo), 0, 1) ** gamma * (len(ramp)-1)
    k = np.minimum(t.astype(int), len(ramp)-2); f = (t-k)[..., None]
    rgb = ramp[k]*(1-f) + ramp[k+1]*f
    return Image.fromarray(np.dstack([rgb, a[..., 3]]).astype('uint8'), 'RGBA')

def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); return im.crop(bb)

def fit(im, w):
    return im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)

def borroso(im, rad=1.8, pad=10):
    c = Image.new('RGBA', (im.width+2*pad, im.height+2*pad), (0, 0, 0, 0)); c.paste(im, (pad, pad))
    # difuminar color premultiplicado para no sangrar negro
    a = np.array(c).astype(float); al = a[..., 3:]/255.
    pm = Image.fromarray((np.dstack([a[..., :3]*al, a[..., 3:]])).astype('uint8'), 'RGBA').filter(ImageFilter.GaussianBlur(rad))
    b = np.array(pm).astype(float); ab = b[..., 3:]
    rgb = np.where(ab > 0, b[..., :3]/np.maximum(ab/255., .004), 0)
    return Image.fromarray(np.dstack([rgb.clip(0, 255), ab]).astype('uint8'), 'RGBA')

def save(im, ruta, q=88):
    im.save(ruta, quality=q, alpha_quality=95, method=6)

def desvanece(im, borde=.16):
    """alfa a 0 radialmente en las orillas (por si el corte es seco)."""
    w, h = im.size; y, x = np.mgrid[0:h, 0:w]
    d = np.maximum(np.abs(x-(w-1)/2)/(w/2), np.abs(y-(h-1)/2)/(h/2))
    m = np.clip((1-d)/borde, 0, 1); m = m*m*(3-2*m)
    a = np.array(im).astype(float); a[..., 3] *= m
    return Image.fromarray(a.astype('uint8'), 'RGBA')

AD = O + 'adornos/'
# luna con estrellas (real) -> plata fria con velo azul
luna = trim(Image.open(R+'xv-aylin-de-la-rosa-hernandez/adornos/luna-estrellas.png').convert('RGBA'))
luna = desvanece(recolor(fit(luna, 360), PLATA, .08, .92), .06)
save(luna, AD+'luna-estrellas.webp'); save(borroso(luna, 2.0), AD+'luna-estrellas-b.webp')
# estrella de cinco puntas
est = trim(Image.open(R+'xv-aylin-de-la-rosa-hernandez/adornos/estrella.png').convert('RGBA'))
est = recolor(fit(est, 260), PLATA, .10, .95)
save(est, AD+'estrella.webp'); save(borroso(est, 1.8), AD+'estrella-b.webp')
# destello de cuatro puntas (de la luna: recorte real de la estrella grande) y el de Daenerys
dae = Image.open(R+'save-the-date-daenerys/_ref/estrella.png').convert('RGBA')
dae = trim(dae); dae = recolor(fit(dae, 300), AZUL, .05, .9, .8)
dae = desvanece(dae, .12)
save(dae, AD+'destello.webp'); save(borroso(dae, 1.8), AD+'destello-b.webp')
# nube -> azul/plata, bordes ya suaves; alfa radial a 0
nub = trim(Image.open(R+'cumple-iris-araceli-troncoso-villafana/nube.png').convert('RGBA'))
nub = recolor(fit(nub, 420), AZUL, .35, 1.0, .9)
a = np.array(nub).astype(float); a[..., 3] *= .55; nub = Image.fromarray(a.astype('uint8'), 'RGBA')
pad=60; c=Image.new('RGBA',(nub.width+2*pad,nub.height+2*pad),(0,0,0,0)); c.paste(nub,(pad,pad)); nub=c.filter(ImageFilter.GaussianBlur(6))
a=np.array(nub).astype(float); a[...,3]=np.clip(a[...,3]*1.5,0,255)*.8; nub=Image.fromarray(a.astype('uint8'),'RGBA'); nub=desvanece(nub,.3)
save(nub, AD+'nube.webp'); save(borroso(nub, 2.0, 14), AD+'nube-b.webp')

# ---- particulas: polvo de estrellas plateado ----
A = O + 'assets/'
def mota(n, sharp):
    c = (n-1)/2; y, x = np.mgrid[0:n, 0:n]; r = np.hypot(x-c, y-c)/c
    core = np.exp(-(r/.16)**2); halo = np.exp(-(r/.55)**2)*.38
    cruz = (np.exp(-((x-c)/(n*.018))**2)*np.exp(-np.abs(y-c)/(n*.2)) + np.exp(-((y-c)/(n*.018))**2)*np.exp(-np.abs(x-c)/(n*.2)))*.55
    a = np.clip(core+halo+cruz*(1 if sharp else 0), 0, 1)*np.clip((1-r)/.25, 0, 1)
    base = hx('#C0C6CE')/255.; hi = hx('#F4F6F9')/255.
    t = np.clip(core*1.2, 0, 1)[..., None]
    return Image.fromarray((np.dstack([base*(1-t)+hi*t, a])*255).astype('uint8'), 'RGBA')
def disco(n):
    c = (n-1)/2; y, x = np.mgrid[0:n, 0:n]; r = np.hypot(x-c, y-c)/c
    a = np.clip((1-r)/.12, 0, 1)*(.55+.45*np.clip((r-.6)/.4, 0, 1))
    rgb = np.dstack([np.full_like(r, 107/255), np.full_like(r, 115/255), np.full_like(r, 128/255)])
    rgb = rgb+(hx('#C0C6CE')/255.-rgb)*np.clip(r, 0, 1)[..., None]
    return Image.fromarray((np.dstack([rgb, a])*255).astype('uint8'), 'RGBA')
save(mota(96, True), A+'particula-polvo.webp', 90)
save(disco(128).filter(ImageFilter.GaussianBlur(1.8)), A+'particula-polvo-b.webp')
# estrellita real (la de cinco puntas, pequena) como particula grande
pe = fit(est, 72); save(pe, A+'particula-estrella.webp'); save(borroso(pe, 1.6), A+'particula-estrella-b.webp')

# ---- aguja: brazo real de tocadiscos (recorte previo) repintado a plata ----
ag = Image.open(R+'boda-dorian-y-sarahi/assets/aguja.webp').convert('RGBA')
a = np.array(ag).astype(float)
l = (a[..., 0]*.3+a[..., 1]*.55+a[..., 2]*.15)/255.
l = np.clip((l-.12)/.80, 0, 1)
t = l*(len(PLATA)-1); k = np.minimum(t.astype(int), len(PLATA)-2); f = (t-k)[..., None]
rgb = PLATA[k]*(1-f)+PLATA[k+1]*f
save(Image.fromarray(np.dstack([rgb, a[..., 3]]).astype('uint8'), 'RGBA'), A+'aguja.webp', 90)

# ---- hoja de revision ----
H = Image.new('RGB', (1500, 520), '#061A45')
x0 = 5
for f in ['luna-estrellas', 'luna-estrellas-b', 'estrella', 'estrella-b', 'destello', 'destello-b', 'nube', 'nube-b']:
    im = Image.open(AD+f+'.webp'); im.thumbnail((170, 170)); H.paste(im, (x0, 5), im); x0 += 180
x0 = 5
for f in ['particula-polvo', 'particula-polvo-b', 'particula-estrella', 'particula-estrella-b', 'aguja']:
    im = Image.open(A+f+'.webp'); im.thumbnail((250, 300) if f == 'aguja' else (120, 120)); H.paste(im, (x0, 220), im); x0 += 140 if f != 'aguja' else 0
H.save(O+'_src/ver/adornos.jpg', quality=90)
