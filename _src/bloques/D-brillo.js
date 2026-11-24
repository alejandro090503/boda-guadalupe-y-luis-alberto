/* INSERTAR: antes de </body> (al final, después de GSAP y de los demás scripts; antes de D-vivo.js) */
<script>
/* ═══ D-BRILLO · filos de luz, vidrio, destellos y polvo de luz en plata ═══
   Tarjetas: halo + reflejo + filete + filo con luz que lo recorre + destello grande y mediano.
   Títulos: destello sobre la primera letra, uno mini al final y polvo de luz alrededor.
   Nunca toca datos de lectura (horas, fechas, direcciones, botones). */
(function(){
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = 0, PHI = .618034;

  function flare(padre, x, y, s, mini){
    var f = document.createElement('i'), b = document.createElement('b');
    f.className = 'kx-flare' + (mini ? ' is-mini' : '');
    f.setAttribute('aria-hidden', 'true');
    f.style.setProperty('--x', x);
    f.style.setProperty('--y', y);
    f.style.setProperty('--s', s || 1);
    /* desfase áureo: nunca florecen dos juntos */
    var dur = mini ? 5.6 + (n % 3) * .9 : 8.2 + (n % 3) * 1.1;
    f.style.setProperty('--dur', dur.toFixed(2) + 's');
    f.style.setProperty('--del', (-((n * PHI) % 1) * dur).toFixed(2) + 's');
    f.appendChild(b);
    padre.appendChild(f);
    n++;
    return f;
  }
  function capa(padre, cl, conHijo, k){
    var e = document.createElement('i');
    e.className = cl;
    e.setAttribute('aria-hidden', 'true');
    if (conHijo){
      var h = document.createElement('i');
      h.style.setProperty('--del', (-(k * 3.1 % 10)).toFixed(1) + 's');
      e.appendChild(h);
    }
    padre.appendChild(e);
  }

  /* ── Tarjetas ── */
  function tarjetas(){
    var sel = '.loc-card,.fam-card,.c2-rs-card,.c2-rs-gracias,.g73-gf-card,.r2-card,.r2-gracias,.c2-rs-box,.r2-box';
    document.querySelectorAll(sel).forEach(function(c, k){
      if (c.classList.contains('kx-card')) return;
      c.classList.add('kx-card');
      var cs = getComputedStyle(c);
      if (cs.position === 'static') c.style.position = 'relative';
      c.style.setProperty('--kxr', (parseFloat(cs.borderTopLeftRadius) || 14) + 'px');
      /* el contenido queda sobre las capas de luz */
      [].forEach.call(c.children, function(h){
        var p = getComputedStyle(h).position;
        if (p === 'static') h.style.position = 'relative';
        if (getComputedStyle(h).zIndex === 'auto') h.style.zIndex = '4';
      });
      var chica = /(^|\s)(c2-rs-box|r2-box)(\s|$)/.test(c.className);
      capa(c, 'kx-halo');
      capa(c, 'kx-sheen', true, k);
      capa(c, 'kx-line');
      capa(c, 'kx-rim', true, k);
      if (chica){
        flare(c, '14%', '0', .5);
      } else {
        flare(c, '7%', '0', 1);          /* grande: esquina donde entra la luz (≈190 px) */
        flare(c, '92%', '100%', .62);    /* mediano: rebote en la opuesta */
      }
    });
  }

  /* ── Títulos: destello en la primera letra, mini al final y polvo de luz ── */
  function nodosTexto(el){
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function(t){ return t.nodeValue.trim() && !(t.parentNode.closest && t.parentNode.closest('.kx-flare,.kx-dust')) ? 1 : 3; }
    }), out = [], t;
    while ((t = w.nextNode())) out.push(t);
    return out;
  }
  function rectLetra(t, desdeFin){
    var s = t.nodeValue, i = desdeFin ? s.replace(/\s+$/, '').length - 1 : s.search(/\S/);
    if (i < 0) return null;
    var r = document.createRange();
    r.setStart(t, i); r.setEnd(t, i + 1);
    var b = r.getBoundingClientRect();
    return b.width || b.height ? b : null;
  }
  var titulos = [];
  function prepTitulo(t, k, principal){
    if (t.dataset.kx) return;
    t.dataset.kx = '1';
    if (getComputedStyle(t).position === 'static') t.classList.add('kx-has');
    if (getComputedStyle(t).display === 'inline') t.style.display = 'inline-block';
    /* cada título barre a destiempo */
    if (!RM) t.style.animationDelay = (-((k * PHI) % 1) * 7).toFixed(2) + 's';
    var o = { el: t, a: flare(t, '0px', '0px', .4), z: flare(t, '0px', '0px', .9, true), polvo: null };
    if (principal){
      var d = document.createElement('i');
      d.className = 'kx-dust';
      d.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 7; i++){
        var b = document.createElement('b');
        if (i % 3 === 1) b.className = 'is-s';
        var dur = 3.4 + (i % 4) * .7;
        b.style.setProperty('--dur', dur.toFixed(2) + 's');
        b.style.setProperty('--del', (-((i + k) * PHI % 1) * dur).toFixed(2) + 's');
        d.appendChild(b);
      }
      t.appendChild(d);
      o.polvo = d;
    }
    titulos.push(o);
  }
  function ubica(o){
    var t = o.el, tr = t.getBoundingClientRect();
    if (!tr.width) return false;
    var nodos = nodosTexto(t);
    if (!nodos.length) return false;
    var a = rectLetra(nodos[0], false), z = rectLetra(nodos[nodos.length - 1], true);
    if (!a || !z) return false;
    /* el destello cae en el hombro de la primera letra, donde pega la luz */
    o.a.style.setProperty('--x', (a.left - tr.left + a.width * .32).toFixed(1) + 'px');
    o.a.style.setProperty('--y', (a.top - tr.top + a.height * .3).toFixed(1) + 'px');
    o.a.style.setProperty('--s', Math.max(.32, Math.min(.47, a.height / 140)).toFixed(2));
    o.z.style.setProperty('--x', (z.right - tr.left - z.width * .15).toFixed(1) + 'px');
    o.z.style.setProperty('--y', (z.top - tr.top + z.height * .34).toFixed(1) + 'px');
    if (o.polvo){
      /* polvo alrededor de la caja real del texto, sin pisar el centro de las letras */
      var x0 = a.left - tr.left, x1 = z.right - tr.left, y0 = Math.min(a.top, z.top) - tr.top, y1 = Math.max(a.bottom, z.bottom) - tr.top;
      var P = [[-.06, .2], [.18, -.12], [.42, 1.08], [.63, -.16], [.86, 1.1], [1.06, .3], [.3, 1.14]];
      [].forEach.call(o.polvo.children, function(b, i){
        var p = P[i % P.length];
        b.style.setProperty('--x', (x0 + (x1 - x0) * p[0]).toFixed(1) + 'px');
        b.style.setProperty('--y', (y0 + (y1 - y0) * p[1]).toFixed(1) + 'px');
      });
    }
    return true;
  }
  function titulosInit(){
    var principales = '.ttl,.heading,.heading-sm,.g73-it-title,.g73-gf-title,.ft-nms';
    var todos = principales + ',.h-name,.h-amp';
    var k = 0;
    document.querySelectorAll(todos).forEach(function(t){
      if (t.closest('[aria-hidden="true"]')) return;
      prepTitulo(t, k++, t.matches(principales));
    });
    /* el resto de textos en plata solo barre a destiempo */
    document.querySelectorAll('.foil-text,.g73-foil,.cd2-num').forEach(function(t){
      if (!t.dataset.kx && !RM) t.style.animationDelay = (-((k++ * PHI) % 1) * 7).toFixed(2) + 's';
    });
    if (!titulos.length) return;
    var pendientes = titulos.slice();
    function intenta(){
      pendientes = pendientes.filter(function(o){ return !ubica(o); });
    }
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(E){
        E.forEach(function(e){
          if (!e.isIntersecting) return;
          titulos.forEach(function(o){ if (o.el === e.target) ubica(o); });
        });
      }, { rootMargin: '200px 0px' });
      titulos.forEach(function(o){ io.observe(o.el); });
    }
    intenta();
    var tm = 0;
    function todo(){ clearTimeout(tm); tm = setTimeout(function(){ titulos.forEach(ubica); }, 180); }
    window.addEventListener('resize', todo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(todo);
  }

  /* ── Filetes con barrido ── */
  function filetes(){
    document.querySelectorAll('.gline,.g73-gf-line').forEach(function(g, k){
      if (g.querySelector(':scope > .kx-gsw')) return;
      if (getComputedStyle(g).position === 'static') g.style.position = 'relative';
      var s = document.createElement('i');
      s.className = 'kx-gsw';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--w', ((g.offsetWidth || 60) + 8) + 'px');
      s.style.setProperty('--del', (-((k * PHI) % 1) * 6.5).toFixed(2) + 's');
      g.appendChild(s);
    });
  }

  function init(){
    try { tarjetas(); filetes(); titulosInit(); }
    catch (e) { if (window.console) console.warn('D-brillo', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
