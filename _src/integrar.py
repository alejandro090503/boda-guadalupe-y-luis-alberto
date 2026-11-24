# Integra _src/bloques/* en index.html (paquete premium + bloques del cliente)
import io, re, sys, glob, os
R = r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/'
P = R + 'index.html'
B = R + '_src/bloques/'
s = io.open(P, encoding='utf-8').read()

def rd(f):
    t = io.open(B + f, encoding='utf-8').read()
    first, _, rest = t.partition('\n')
    return first, rest

def rep(o, n, c=1):
    global s
    k = s.count(o)
    if k != c: sys.exit('ERR %d %r' % (k, o[:90]))
    s = s.replace(o, n)

def section_span(sid):
    a = s.find('<section id="%s"' % sid)
    assert a >= 0, sid
    # cierre respetando <section> anidadas
    depth, i = 0, a
    while True:
        o = s.find('<section', i + 1); c = s.find('</section>', i + 1)
        if o != -1 and o < c: depth += 1; i = o
        else:
            if depth == 0: return a, c + len('</section>')
            depth -= 1; i = c

has = lambda f: os.path.exists(B + f)

# 1 · secciones que se reemplazan
for f in sorted(glob.glob(B + '*.html')):
    name = os.path.basename(f)
    first, body = rd(name)
    m = re.search(r'reemplaza #([a-z0-9-]+)', first)
    if not m or name.startswith('C2-vinilo'): continue
    sid = m.group(1)
    a, b = section_span(sid)
    s = s[:a] + body.strip() + s[b:]
    print('reemplazada #%s <- %s' % (sid, name))

# 2 · vinilo nuevo: el viejo queda oculto (su JS sigue funcionando con guardas)
if has('C2-vinilo.html'):
    _, body = rd('C2-vinilo.html')
    rep('<button class="vinyl-btn" id="musicBtn"', body.strip() + '\n<button class="vinyl-btn" id="musicBtn" hidden style="display:none!important"')

# 3 · adornos como primer hijo de cada sección
if has('A-adornos.html'):
    _, body = rd('A-adornos.html')
    for sid, imgs in re.findall(r'<!-- section#([a-z0-9-]+) -->\s*(.*?)(?=<!-- section#|\Z)', body, re.S):
        sid = {'sobres': 'gifts'}.get(sid, sid)
        a = s.find('<section id="%s"' % sid)
        if a < 0: print('sin seccion', sid); continue
        e = s.find('>', a) + 1
        s = s[:e] + '\n' + imgs.strip() + s[e:]

# 4 · CSS antes del último </style> del head
head_end = s.find('</head>')
st = s.rfind('</style>', 0, head_end)
order = ['P-', 'A-', 'C1-itinerario', 'C1-', 'C2-', 'D-']
css = sorted(glob.glob(B + '*.css'), key=lambda f: next(i for i, p in enumerate(order) if os.path.basename(f).startswith(p)))
blob = ''
for f in css:
    _, body = rd(os.path.basename(f))
    blob += '\n/* ═══ %s ═══ */\n%s\n' % (os.path.basename(f), body.strip())
s = s[:st] + blob + s[st:]

# 5 · HTML de D (anclas "dentro de #id al inicio" / "antes de </body>")
for f in sorted(glob.glob(B + 'D-*.html')):
    first, body = rd(os.path.basename(f))
    m = re.search(r'dentro de #([a-z0-9-]+)', first)
    if m:
        a = s.find('<section id="%s"' % m.group(1)); assert a >= 0, first
        if a < 0: a = s.find('<footer id="%s"' % m.group(1))
        e = s.find('>', a) + 1
        s = s[:e] + '\n' + body.strip() + s[e:]
    else:
        e = s.rfind('</body>')
        s = s[:e] + body.strip() + '\n' + s[e:]
    print('D html', os.path.basename(f), first[:60])

# 6 · JS antes de </body>
js = sorted(glob.glob(B + '*.js'), key=lambda f: next(i for i, p in enumerate(order) if os.path.basename(f).startswith(p)))
blob = ''
for f in js:
    _, body = rd(os.path.basename(f))
    body = body.strip()
    if not body.startswith('<script'): body = '<script>\n' + body + '\n</script>'
    blob += '<!-- %s -->\n%s\n' % (os.path.basename(f), body)
e = s.rfind('</body>')
s = s[:e] + blob + s[e:]

# 7 · RSVP viejo fuera si hay uno nuevo
if has('C2-rsvp.html'):
    a = s.find('/* ── RSVP · PANEL INTEGRATION — versión "X pases asignados"')
    b = s.find('\n})();', s.find('window.initRSVP2 = function', a))
    assert a > 0 and b > a
    s = s[:a] + '/* RSVP viejo reemplazado por C2-rsvp */' + s[b + 6:]
    s = s.replace('  if (window.initRSVP2) initRSVP2();', '')

# 8 · fuentes extra
rep('&family=Parisienne&display=swap', '&family=Parisienne&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=swap')

# 9 · menú abajo al centro + cerrar
rep('''<button class="nav-btn" id="navBtn" type="button" aria-label="Abrir el menú" aria-expanded="false" aria-controls="nav-panel">
  <i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>
</button>''', '''<button class="nav-btn" id="navBtn" type="button" aria-label="Abrir el menú" aria-expanded="false" aria-controls="nav-panel">
  <span class="nb-lines" aria-hidden="true"><i></i><i></i><i></i></span><span class="nb-txt">Menú</span>
</button>''')
rep('<nav id="nav-panel" aria-label="Secciones de la invitación">',
    '<nav id="nav-panel" aria-label="Secciones de la invitación">\n  <button class="nav-x" type="button" aria-label="Cerrar el menú" onclick="document.getElementById(\'navBtn\').click()"></button>')

# 10 · recorrido automático al abrir
rep('    prepareInvitation();\n', '    prepareInvitation();\n    if (window.__startAutoScroll) window.__startAutoScroll();\n')

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('ok', len(s))
