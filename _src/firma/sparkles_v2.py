# Corrección 26-nov noche: Sparkles = versión pulida de demo-invitacion-real.html (sección A), en PLATA.
# Reemplaza CSS/JS/HTML del .sp21 en firma.css, constelacion.js y en los index (invitación y STD).
import io, re, sys
F = r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/_src/firma/'
IDX = [r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/index.html', r'C:/Users/aleja/save-the-date-guadalupe-y-luis/index.html']
rd = lambda p: io.open(p, encoding='utf-8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

css = rd(F + 'firma.css'); js = rd(F + 'constelacion.js')
a = css.find('.sp21{'); b = css.find('/* Nombres sin script', a); assert a > 0 and b > a
OLD_CSS = css[a:b]
NEW_CSS = '''.sp21{position:relative;width:100%;max-width:360px;height:118px;margin:18px auto 0;pointer-events:none}
.sp21 .sp-hz{position:absolute;left:50%;top:0;z-index:3;transform:translateX(-50%);width:80%;height:1.5px;
  background:linear-gradient(90deg,transparent,#9098A4 22%,#FFFFFF 50%,#9098A4 78%,transparent);box-shadow:0 0 18px 3px rgba(206,216,234,.5)}
.sp21 .sp-hz::after{content:"";position:absolute;left:35%;right:35%;top:-3px;height:7px;background:radial-gradient(closest-side,#FFFFFF,transparent);filter:blur(3px)}
.sp21 .sp-fl{position:absolute;left:50%;top:0;width:220px;height:220px;margin:-110px 0 0 -110px;z-index:3;background:url(assets/flare-plata.webp) center/contain no-repeat;
  mix-blend-mode:screen;opacity:.55;animation:spFl 7s ease-in-out infinite}
@keyframes spFl{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:.72;transform:scale(1.05)}}
.sp21 canvas{position:absolute;left:0;right:0;top:0;height:100%;width:100%;z-index:2;
  -webkit-mask-image:radial-gradient(62% 90% at 50% 0%,#000 25%,transparent 100%);mask-image:radial-gradient(62% 90% at 50% 0%,#000 25%,transparent 100%)}
@media(prefers-reduced-motion:reduce){.sp21 .sp-fl{animation:none}}

'''
a = js.find('/* ═══ Sparkles (21st'); b = js.find('</script>', a); assert a > 0 and b > a
OLD_JS = js[a:b]
NEW_JS = '''/* ═══ Sparkles (21st · 29, versión pulida de demo-invitacion-real · A) en PLATA: horizonte + polvo con destellos en cruz ═══ */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.sp21 canvas').forEach(function(cv){
    var g = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, P = [], on = false;
    function size(){ var r = cv.getBoundingClientRect(); W = r.width; H = r.height; if (!W) return; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = Math.round(W * H / 260);
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.pow(Math.random(), 1.6) * H, r: Math.random() * 1.05 + .2, ph: Math.random() * 6.3, sp: .5 + Math.random() * 2.4,
        vx: (Math.random() - .5) * .08, vy: -(.02 + Math.random() * .07), az: Math.random() < .3 }); }
    function f(t){ g.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++){ var p = P[i];
        if (!RM){ p.x += p.vx; p.y += p.vy; if (p.y < -2){ p.y = H; p.x = Math.random() * W; } }
        var a = RM ? .7 : .5 + .5 * Math.sin(t / 1000 * p.sp + p.ph); a = a * a; g.globalAlpha = a; g.fillStyle = p.az ? '#B9CCF0' : '#F6F8FC';
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill();
        if (p.r > 1.05 && a > .75){ g.globalAlpha = (a - .75) * 2.4; g.fillRect(p.x - 3.2, p.y - .25, 6.4, .5); g.fillRect(p.x - .25, p.y - 3.2, .5, 6.4); } }
      g.globalAlpha = 1;
      if (on && !document.hidden) requestAnimationFrame(f); }
    size(); addEventListener('resize', size);
    if (RM) { f(0); return; }
    new IntersectionObserver(function(es){ var v = es[0].isIntersecting; if (v && !on){ on = true; requestAnimationFrame(f); } else if (!v) on = false; }).observe(cv);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden && on) requestAnimationFrame(f); });
  });
})();
'''
OLD_HTML = '<canvas></canvas><div class="sp-curve"></div><div class="sp-line"></div><div class="sp-line2"></div>'
NEW_HTML = '<div class="sp-fl"></div><div class="sp-hz"></div><canvas></canvas>'

wr(F + 'firma.css', css.replace(OLD_CSS, NEW_CSS)); wr(F + 'constelacion.js', js.replace(OLD_JS, NEW_JS))
for p in IDX:
    s = rd(p)
    for o, n in [(OLD_CSS, NEW_CSS), (OLD_JS, NEW_JS)]:
        assert s.count(o) == 1, (p, o[:40], s.count(o)); s = s.replace(o, n)
    k = s.count(OLD_HTML); assert k == 2, (p, k); s = s.replace(OLD_HTML, NEW_HTML)
    wr(p, s); print('ok', p)
# premium2.py / firma.py llevan el HTML viejo en SP: actualizar para que sean reproducibles
for p in [r'C:/Users/aleja/boda-guadalupe-y-luis-alberto/_src/premium2.py', r'C:/Users/aleja/save-the-date-guadalupe-y-luis/_src/firma.py']:
    s = rd(p); assert OLD_HTML in s, p; wr(p, s.replace(OLD_HTML, NEW_HTML))
