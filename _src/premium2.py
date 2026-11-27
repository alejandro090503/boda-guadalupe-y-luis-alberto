# Revisión 26-nov: firma constelaciones + Sparkles 21st plata + Luz Premium (1,2,3,12,14,15,17) + nombres sin script
import io, re, sys
R = r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/'
K = r'C:/Users/aleja/kit-efectos-elysium/luz/'
P = R + 'index.html'
s = io.open(P, encoding='utf-8').read()
rd = lambda p: io.open(p, encoding='utf-8').read()

def rep(o, n, c=1):
    global s
    k = s.count(o)
    if k != c: sys.exit('ERR %d %r' % (k, o[:90]))
    s = s.replace(o, n)

def open_tag(sid):
    a = s.find('<section id="%s"' % sid); assert a >= 0, sid
    return a, s.find('>', a) + 1

def add_attr(sid, attrs):
    global s
    a, e = open_tag(sid)
    s = s[:e - 1] + ' ' + attrs + s[e - 1:]

def first_child(sid, html):
    global s
    a, e = open_tag(sid)
    s = s[:e] + '\n' + html + s[e:]

# ── CSS: kit Luz Premium (tal cual) + firma ──
lpcss = rd(K + 'luz-premium.css')
lpcss = lpcss.replace('--lp-metal-1:#7D8494; --lp-metal-2:#AEB4C0; --lp-metal-3:#FBFCFD; --lp-metal-4:#DCE0E7; --lp-metal-5:#B9BFCB;',
                      '--lp-metal-1:#6B7380; --lp-metal-2:#AEB4C0; --lp-metal-3:#FFFFFF; --lp-metal-4:#DCE0E7; --lp-metal-5:#9098A4;')
head_end = s.find('</head>'); st = s.rfind('</style>', 0, head_end)
s = s[:st] + '\n' + lpcss + '\n' + rd(R + '_src/firma/firma.css') + '\n' + s[st:]

# ── Bodoni Moda fuera (D-itinerario) → Cormorant Garamond (de la 73) ──
s = s.replace("'Bodoni Moda','Playfair Display',serif", "'Cormorant Garamond','Playfair Display',serif")
a = s.find('    /* Bodoni Moda solo para las horas */'); assert a > 0
b = s.find('\n    }', s.find("Bodoni+Moda", a)) + 6
s = s[:a] + s[b:]
assert 'Bodoni' not in s.replace('horas en Bodoni Moda', '').replace('Bodoni Moda (no se usa', ''), [m.start() for m in re.finditer('Bodoni', s)]

# ── Luna viva: solo 2 secciones de acompañante ──
for sel in ["    { sel: '#invite',          esq: 'tr', tam: 116 },\n", "    { sel: '#location',        esq: 'br', tam: 112 },\n",
            "    { sel: '#dresscode',       esq: 'tl', tam: 104 },\n", "    { sel: '#footer',          esq: 'tr', tam: 180, anillo: true }\n"]:
    rep(sel, '')
rep("    { sel: '#family',          esq: 'tr', tam: 110 },\n", "    { sel: '#family',          esq: 'tr', tam: 110 }\n")

# ── PORTADA ──
rep('  <div class="h-particles" id="hPart"></div>\n',
    '  <div class="h-particles" id="hPart"></div>\n  <canvas class="cst" data-modo="trazar" aria-hidden="true"></canvas>\n'
    '  <canvas class="lp-caida" data-n="8" data-sprites="assets/particula-estrella-b.webp,assets/particula-polvo.webp" aria-hidden="true"></canvas>\n'
    '  <div class="lp-niebla" aria-hidden="true"></div>\n  <div class="lp-flare" data-x="80%" data-y="14%" data-s="1" aria-hidden="true"></div>\n')
rep('<div class="h-clip"><span class="h-name foil-text" id="hN1">', '<div class="h-clip lp-glints"><span class="h-name foil-text" id="hN1">')
rep('<div class="h-clip"><span class="h-name foil-text" id="hN2">', '<div class="h-clip lp-glints"><span class="h-name foil-text" id="hN2">')
SP = '<div class="sp21" aria-hidden="true"><div class="sp-fl"></div><div class="sp-hz"></div><canvas></canvas></div>'
rep('    <div class="gline" style="margin-top:28px" id="hLine"></div>', '    <div id="hLine">' + SP.replace('class="sp21"', 'class="sp21" style="margin-top:14px"') + '</div>')

# ── PIE: constelación que se apaga + sparkles + caída + niebla ──
rep('<footer id="footer">\n  <div class="ft-orn">',
    '<footer id="footer">\n  <canvas class="cst" data-modo="apagar" aria-hidden="true"></canvas>\n'
    '  <canvas class="lp-caida" data-n="8" data-sprites="assets/particula-estrella-b.webp,assets/particula-polvo.webp" aria-hidden="true"></canvas>\n'
    '  <div class="lp-niebla" aria-hidden="true"></div>\n  <div class="ft-orn">')
rep('<div class="ft-nms foil-text">Guadalupe &amp; Luis Alberto</div>\n  <div class="gline" style="margin-top:22px"></div>',
    '<div class="ft-nms foil-text lp-cascada">Guadalupe &amp;</div>\n  <div class="ft-nms foil-text lp-cascada">Luis Alberto</div>\n  ' + SP)

# ── LOADER: destello con fantasmas + estrellas en los vértices ──
m = re.search(r'<svg class="ld-const"[^>]*>(.*?)</svg>', s, re.S); assert m
pts = set()
for d in re.findall(r'd="([^"]+)"', m.group(1)):
    for x, y in re.findall(r'([\d.]+) ([\d.]+)', d): pts.add((x, y))
circles = ''.join('<circle class="ld-star" cx="%s" cy="%s" r="2.2" style="animation-delay:-%.1fs"/>' % (x, y, (i * .37) % 2.6) for i, (x, y) in enumerate(sorted(pts)))
s = s[:m.end() - 6] + circles + s[m.end() - 6:]
rep('<div class="ld-center">', '<div class="lp-flare" data-x="50%" data-y="40%" data-s="1.1" aria-hidden="true"></div>\n  <div class="ld-center">')

# ── FONDOS: tinta (Gemini) / seda alternadas ──
INK = lambda img: '<div class="ink-bg" aria-hidden="true"><i style="background-image:url(\'ink/%s\')"></i></div>' % img
for sid in ['countdown', 'calendar', 'gifts', 'dresscode', 'padrinos', 'weather']:
    first_child(sid, '<canvas class="lp-seda" aria-hidden="true"></canvas>')
    add_attr(sid, 'data-lp-seda')
for sid, img in [('itinerary', 'ink-corner.webp'), ('rsvp', 'ink-top.webp')]:
    first_child(sid, INK(img)); add_attr(sid, 'data-lp-ink')
# uniones: velo antes de la ceremonia, cortina antes del RSVP
add_attr('location', 'data-lp-union="velo"')
add_attr('rsvp', 'data-lp-union="velo"')
# RSVP: destello en la tarjeta
first_child('rsvp', '<div class="lp-flare" data-x="84%" data-y="18%" data-s=".75" aria-hidden="true"></div>')

s = s.replace('</style>\n</head>', '''[data-lp-seda]{position:relative;isolation:isolate}
[data-lp-ink]{position:relative;isolation:isolate}
#location,#rsvp{overflow-x:clip!important}
#rsvp{padding-top:max(110px,var(--rsvp-pt,0px))!important}
</style>\n</head>''', 1)

# fundidos viejos (initSectionFades) fuera de las secciones con seda
rep("    if (!secs.length || secs[0].querySelector('.sf')) return;",
    "    if (!secs.length || secs[0].querySelector('.sf')) return;\n    secs = secs.filter(function(x){ return !x.hasAttribute('data-lp-seda'); });")
rep('    var PAGE = [10, 20, 48];', '    var PAGE = [6, 26, 69];')

# ── JS: firma + kit Luz Premium (config antes) ──
cfg = '''<script>
window.LP_CONFIG = {
  flareMini: 'assets/flare-mini.webp',
  seda:    { sombra:'#04123A', base:'#0B2457', luz:'#6F8CC4' },
  borde:   '#061A45',
  fundido: 220,
  cortina: { sombra:'#061A45', base:'#1D4C9E', luz:'#DCE4F2' },
  niebla:  '96,126,196'
};
</script>'''
js = rd(R + '_src/firma/constelacion.js') + cfg + '\n<script>\n' + rd(K + 'luz-premium.js') + '\n</script>\n'
e = s.rfind('</body>')
s = s[:e] + '<!-- FIRMA + LUZ PREMIUM -->\n' + js + s[e:]

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok', len(s))
