# Invitación Guadalupe & Luis Alberto — parche principal sobre Nubia a3d175c (base neidy 155)
import io, re, sys
P = r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/index.html'
s = io.open(P, encoding='utf-8').read()
U = 'https://boda-guadalupe-y-luis-alberto.vercel.app'

def rep(o, n, c=1):
    global s
    k = s.count(o)
    if k != c: sys.exit('ERR %d %r' % (k, o[:90]))
    s = s.replace(o, n)

def cut(a_mark, b_mark, new=''):
    global s
    a = s.find(a_mark); assert a >= 0, a_mark
    b = s.find(b_mark, a); assert b >= 0, b_mark
    s = s[:a] + new + s[b + len(b_mark):]

def resub(pat, new, n=1, flags=re.S):
    global s
    s, k = re.subn(pat, new, s, flags=flags)
    if k != n: sys.exit('ERR re %d %r' % (k, pat[:80]))

# ── HEAD ──
rep('<title>Nubia Brisia &amp; Luis Ricardo · 05 · VI · 2027</title>', '<title>Guadalupe &amp; Luis Alberto · 07 · VIII · 2027</title>')
rep('content="Invitación de boda de Nubia Brisia y Luis Ricardo — 5 de junio de 2027 · Ciudad de México"',
    'content="Invitación de boda de Guadalupe y Luis Alberto — 7 de agosto de 2027 · Ciudad de México"')
rep('content="Boda Nubia Brisia & Luis Ricardo · 5 jun 2027"', 'content="Boda Guadalupe & Luis Alberto · 7 ago 2027"')
rep('content="Nos casamos — Ciudad de México · 5 de junio de 2027"', 'content="Nos casamos — Ciudad de México · 7 de agosto de 2027"')
rep('https://boda-nubia-brisia-y-luis-ricardo.vercel.app/og-image.jpg', U + '/og-image.jpg')

# ── LOADER (constelación del STD) ──
rep('<span class="ld-mono foil-text">B<i>&amp;</i>R</span>', '<span class="ld-mono foil-text">L<i>&amp;</i>G</span>')
rep('<p class="ld-std">Save the Date</p>', '<p class="ld-std">Nuestra Boda</p>')
rep('<p class="ld-date">05 · 06 · 2027</p>', '<p class="ld-date">07 · 08 · 2027</p>')
rep('<span class="ld-btn" id="env-hint">Toca para entrar</span>', '<span class="ld-btn" id="env-hint">Toca para abrir</span>')
rep('aria-label="Toca para entrar al Save the Date"', 'aria-label="Toca para abrir tu invitación"')

# ── INTRO de Nubia: fuera ──
cut('<audio id="introAudio"', '</audio>')
cut('<div id="intro-screen"', '</div>')
rep('  window.__introOn = true;', '  window.__introOn = false;')
rep('    prepareInvitation();\n    playIntro();', '    prepareInvitation();')
if "if (scr) scr.classList.add('on');" in s:
    s = s.replace("    var scr = document.getElementById('intro-screen'); if (scr) scr.classList.add('on');\n", '')

# ── MÚSICA ──
rep('audio/boda-nubia-brisia-luis-ricardo/cancion.mp3', 'audio/boda-guadalupe-luis/cancion.mp3')

# ── HERO ──
rep('aria-label="Nubia Brisia y Luis Ricardo"', 'aria-label="Guadalupe y Luis Alberto"')
rep("url('fotos/foto2.jpg')", "url('fotos/hero.jpg')")
rep('id="hN1">Nubia Brisia</span>', 'id="hN1">Guadalupe</span>')
rep('id="hN2">Luis Ricardo</span>', 'id="hN2">Luis Alberto</span>')
rep('<p class="h-date">05 · Junio · 2027</p>', '<p class="h-date">07 · Agosto · 2027</p>')

# ── INVITE ──
rep('<h2 class="heading rvc foil-text">Nubia Brisia &amp; Luis Ricardo</h2>', '<h2 class="heading rvc foil-text">Guadalupe<br>&amp; Luis Alberto</h2>')
rep('    Sábado, 5 de junio de 2027<br>', '    Sábado, 7 de agosto de 2027<br>')
resub(r'<p class="qt-txt">.*?</p>', '<p class="qt-txt">«El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta. El amor nunca deja de ser.»</p>')
rep('<span class="qt-sig">Thomas S. Monson / Ronald A. Rasband</span>', '<span class="qt-sig">1 Corintios 13:7-8</span>')

# ── UBICACIONES ──
PIN = '<svg class="loc-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
a = s.find('<div class="loc-card">'); b = s.find('</section>', a); assert a > 0
s = s[:a] + '''<div class="loc-card">
    <p class="loc-type" style="text-align:center">✦  Ceremonia Religiosa</p>
    <h3 class="loc-name" style="text-align:center">Por confirmar</h3>
    <div class="loc-time" style="text-align:center">Hora por confirmar</div>
    <p class="loc-addr" style="text-align:center">Muy pronto compartiremos el lugar y la hora de la ceremonia.</p>
  </div>

  <div class="loc-card">
    <p class="loc-type" style="text-align:center">✦  Recepción</p>
    <h3 class="loc-name" style="text-align:center">Salón Princess</h3>
    <div class="loc-time" style="text-align:center">8:00 <em>PM</em></div>
    <p class="loc-addr" style="text-align:center">Ermita Iztapalapa 1878, 2da. Ampliación San Miguel, Iztapalapa, 09360, CDMX</p>
    <a href="https://maps.app.goo.gl/xDDe6dayfJBSWMhj6"
       target="_blank" rel="noopener" class="btn" style="max-width:310px;margin:0 auto">
      ''' + PIN + '''
      Ver en Google Maps
    </a>
  </div>
''' + s[b:]

# ── CALENDARIO ──
resub(r'https://calendar\.google\.com/calendar/render\?action=TEMPLATE[^"]*',
      'https://calendar.google.com/calendar/render?action=TEMPLATE&amp;text=Boda+de+Guadalupe+%26+Luis+Alberto&amp;dates=20270807T200000/20270808T020000&amp;ctz=America/Mexico_City&amp;details=Recepci%C3%B3n+8:00+PM+-+Sal%C3%B3n+Princess,+Ermita+Iztapalapa+1878,+Iztapalapa,+CDMX&amp;location=Sal%C3%B3n+Princess,+Ermita+Iztapalapa+1878,+Iztapalapa,+CDMX')

# ── ÁLBUM ──
rep('panel-invitados.vercel.app/subir/boda-nubia-brisia-y-luis-ricardo -->', 'panel-invitados.vercel.app/subir/boda-guadalupe-y-luis-alberto -->')
rep('data-fecha="2027-06-05"', 'data-fecha="2027-08-07"')

# ── FAMILIAS ──
a = s.find('<div class="fam-card"'); b = s.find('</section>', a); assert a > 0
s = s[:a] + '''<div class="fam-card" style="max-width:340px;margin:28px auto 0">
    <span class="fam-role-lbl">Padres de la Novia</span>
    <span class="fam-name">José<br>Solano Lagunas</span>
    <div class="fam-and"><div class="fam-and-line"></div><span class="fam-and-txt">&amp;</span><div class="fam-and-line"></div></div>
    <span class="fam-name">Alejandra<br>Torres Sánchez</span>

    <div class="fam-rule"></div>

    <span class="fam-role-lbl">Padres del Novio</span>
    <span class="fam-name">Luis Alberto<br>Flores García</span>
    <div class="fam-and"><div class="fam-and-line"></div><span class="fam-and-txt">&amp;</span><div class="fam-and-line"></div></div>
    <span class="fam-name">Lilia<br>Olvera Cruz</span>
  </div>
''' + s[b:]

# ── CLIMA (agosto en CDMX) ──
rep('<div class="wx-pct">60<span>%</span></div>', '<div class="wx-pct">65<span>%</span></div>')
rep('<div class="wx-val">25°<span>C</span></div>', '<div class="wx-val">24°<span>C</span></div>')
rep('<p class="wx-note">Junio es temporada de lluvias en la Ciudad de México</p>', '<p class="wx-note">Agosto es temporada de lluvias en la Ciudad de México</p>')
rep('Te recomendamos traer un paraguas y un saco o chal elegante.', 'Como la recepción es de noche, te recomendamos traer un paraguas y un saco o chal elegante.')
rep('clima+Ciudad+de+M%C3%A9xico+5+junio+2027', 'clima+Ciudad+de+M%C3%A9xico+7+agosto+2027')

# ── FAQ (era de Nubia; el cliente no dio datos) : fuera ──
cut('<section id="faq">', '</section>')
rep('    <li><a href="#faq">Preguntas frecuentes</a></li>\n', '')
rep('<li><a href="#sobres">Lluvia de sobres</a></li>', '<li><a href="#gifts">Mesa de regalos</a></li>')

# ── FOOTER ──
rep('<div class="ft-nms foil-text">Nubia Brisia &amp; Luis Ricardo</div>', '<div class="ft-nms foil-text">Guadalupe &amp; Luis Alberto</div>')
rep('<p class="ft-dt">05 · Junio · 2027</p>', '<p class="ft-dt">07 · Agosto · 2027</p>')

# ── COUNTDOWN estilo plantilla 98 (igual que el STD) ──
def unit(k, lbl, col):
    return ('''      <div class="cd2-unit" id="cd-item-%s">
        <div class="cd2-ring-wrap">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="cd2-ring-bg" cx="60" cy="60" r="52"/>
            <circle class="cd2-ring-glow" cx="60" cy="60" r="52" stroke="%s" transform="rotate(-90 60 60)"/>
            <circle class="cd2-ring-progress" cx="60" cy="60" r="52" stroke="%s" transform="rotate(-90 60 60)" id="ring-%s"/>
          </svg>
          <div class="cd2-value"><span class="cd2-num" id="cd-%s">--</span><span class="cd2-lbl">%s</span></div>
        </div>
      </div>
''' % (k, col, col, k, k, lbl))
NEW = ('''<div class="cd2-container">
    <div class="cd2-grid">
''' + unit('d', 'Días', '#DDE2EA') + unit('h', 'Horas', '#5B8FEA') + unit('m', 'Minutos', '#5B8FEA') + unit('s', 'Segundos', '#DDE2EA') +
'''    </div>
    <div class="cd2-quote"><p>Cada segundo más cerca de nuestro gran día</p></div>
  </div>
''')
a = s.find('<div class="cd-ring-grid">'); b = s.find('<div class="cd-wave-bot"', a); assert a > 0 and b > a
s = s[:a] + NEW + '\n  ' + s[b:]
rep('''  el.style.strokeDashoffset = (RING_C * (1 - c)).toFixed(2);''',
    '''  el.style.strokeDashoffset = (RING_C * (1 - c)).toFixed(2);
  const g = el.previousElementSibling;
  if (g) g.style.strokeDashoffset = el.style.strokeDashoffset;''')
rep("gsap.fromTo('.cd-ring-item', {opacity:0, y:22}", "gsap.fromTo('.cd2-unit', {opacity:0, scale:.6}")
s = s.replace("{opacity:1, y:0, duration:.65, stagger:.11, ease:'power3.out', immediateRender:false, scrollTrigger:{ trigger:'#countdown'",
              "{opacity:1, scale:1, duration:1, stagger:.15, ease:'back.out(2)', immediateRender:false, scrollTrigger:{ trigger:'#countdown'", 1)
rep("const WED = new Date('2027-06-05T11:00:00-06:00');", "const WED = new Date('2027-08-07T20:00:00-06:00');")

# ── PALETA: oro → plata · azul noche → azul marino del cliente ──
rep('--lamina: linear-gradient(135deg,#6E5320 0%,#A87F2C 9%,#E6C87A 19%,#FBF0CE 27%,#DDB85E 36%,#9A742A 46%,#6E5320 54%,#B08A32 63%,#F3E3B4 72%,#D4AC55 81%,#8E6B26 91%,#6E5320 100%);',
    '--lamina: linear-gradient(135deg,#6B7380 0%,#9098A4 9%,#CDD3DB 19%,#F7F9FC 27%,#BCC3CC 36%,#8A929E 46%,#6B7380 54%,#A2AAB5 63%,#EEF1F5 72%,#C3C9D1 81%,#848C98 91%,#6B7380 100%);')
rep('--lamina-ink: #2E2007;', '--lamina-ink: #141C2A;')
HEX = {
 '#D4AF37':'#C0C0C0', '#F1DC8A':'#E6EAF0', '#9C7A1E':'#7D8591', '#FFF4CC':'#FFFFFF', '#F7E7CE':'#EEF2F8',
 '#E3C87F':'#D3D9E2', '#B8932A':'#8E96A2', '#6E5320':'#5F6774', '#6B5B45':'#5C6470', '#FFF6DA':'#F6F8FB',
 '#FFFBF2':'#FBFCFE', '#E8D2AA':'#D7DCE4', '#F3E3C2':'#E4E8EE', '#FBEBC0':'#EDF0F5', '#E6C766':'#C9CED6',
 '#FBF7EF':'#F7F9FC', '#FBF6EC':'#F6F8FB', '#FBF3E2':'#F3F5F9', '#FBF1DE':'#F1F4F8', '#EFE6D5':'#E7EBF1',
 '#EFE7DA':'#E7EBF1', '#B9A88C':'#A3AAB5', '#FFFBEA':'#FFFFFF',
 '#A87F2C':'#9098A4', '#E6C87A':'#CDD3DB', '#FBF0CE':'#F7F9FC', '#DDB85E':'#BCC3CC', '#9A742A':'#8A929E',
 '#B08A32':'#A2AAB5', '#F3E3B4':'#EEF1F5', '#D4AC55':'#C3C9D1', '#8E6B26':'#848C98',
 '#0A1430':'#061A45', '#0E1A3C':'#0A2152', '#0D1838':'#08204F', '#13224A':'#0E2A63', '#0F1C40':'#0B2457',
 '#0B1634':'#071C4A', '#0F1B3E':'#0B2355', '#0C1736':'#081E4C', '#1E3A8A':'#0042A9', '#4A7BB7':'#4F86E6',
 '#2B4C9A':'#1D55C0',
}
for k, v in HEX.items():
    s = re.sub(re.escape(k), v, s, flags=re.I)
RGB = {'212,175,55':'192,198,208', '212,166,68':'190,196,206', '228,196,120':'214,220,230', '226,184,96':'206,212,222',
       '226,180,86':'204,210,220', '214,172,85':'196,202,212', '210,185,120':'200,206,216', '180,150,80':'170,178,192',
       '241,220,138':'230,234,240', '150,125,70':'130,140,156', '10,20,48':'6,26,69', '74,123,183':'79,134,230',
       '19,34,74':'14,42,99', '247,231,206':'238,242,248', '30,58,138':'0,66,169', '15,28,64':'11,36,87',
       '255,246,222':'246,248,251', '190,160,90':'180,188,200', '16,30,66':'12,38,92', '255,244,214':'244,247,251',
       '255,240,200':'240,244,250', '170,140,75':'160,168,182', '10,20,46':'6,26,67', '90,60,30':'40,50,70',
       '60,42,12':'20,30,50', '255,250,232':'250,252,255'}
for k, v in RGB.items():
    s = re.sub(r'rgba\(\s*' + k.replace(',', r'\s*,\s*') + r'\s*,', 'rgba(' + v + ',', s)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
left = [w for w in ['Nubia', 'Brisia', 'Ricardo', "D'Alan", 'Monson', 'Templo de la Ciudad', '2027-06', 'junio'] if w in s]
print('ok', len(s), 'restos:', left)
