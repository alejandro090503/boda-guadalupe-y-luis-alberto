/* INSERTAR: antes de </body> (al final, después de GSAP/ScrollTrigger y de C1-itinerario.js) */
<script>
/* ═══ D-ITINERARIO · el scroll conduce una estela de luz por la línea; cada momento se enciende al pasar ═══
   Estructura de la plantilla 73: .g73-it-timeline > .g73-it-step (.g73-it-ico · .g73-it-dot · .g73-it-text > .g73-it-time) */
(function(){
  'use strict';
  function init(){
    var zz = document.querySelector('#itinerary .g73-it-timeline');
    if (!zz || zz.dataset.luz) return;
    zz.dataset.luz = '1';

    /* Bodoni Moda solo para las horas */
    if (!document.querySelector('link[href*="Bodoni+Moda"]')){
      var fl = document.createElement('link');
      fl.rel = 'stylesheet';
      fl.href = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,500&display=swap';
      document.head.appendChild(fl);
    }

    var rows = [].slice.call(zz.querySelectorAll('.g73-it-step'));
    var dots = rows.map(function(r){ return r.querySelector('.g73-it-dot'); });
    if (!rows.length || dots.some(function(d){ return !d; })) return;

    /* "8:00 PM" → número grande + "pm" en cursiva; "Por confirmar" se queda igual */
    zz.querySelectorAll('.g73-it-time').forEach(function(h){
      if (h.classList.contains('g73-it-tbc')) return;
      var txt = h.textContent.trim(), m = txt.match(/^(\d{1,2}(?::\d{2})?)\s*([ap])\.?\s*m\.?$/i);
      if (!m) return;
      h.setAttribute('aria-label', txt);
      h.classList.add('kit-h');
      h.innerHTML = '<span class="kit-n" aria-hidden="true"></span><span class="kit-m" aria-hidden="true"></span>';
      h.firstChild.textContent = m[1];
      h.lastChild.textContent = m[2].toLowerCase() + 'm';
    });

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'kit-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    function poly(cl){
      var p = document.createElementNS(NS, 'polyline');
      p.setAttribute('class', cl);
      p.setAttribute('pathLength', '1');
      svg.appendChild(p);
      return p;
    }
    var track = poly('kit-track');
    var line = poly('kit-line');
    var colas = [{ el: poly('kit-t1'), px: 118 }, { el: poly('kit-t2'), px: 74 }, { el: poly('kit-t3'), px: 34 }];
    zz.insertBefore(svg, zz.firstChild);
    zz.classList.add('kit-on');

    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pts = [], acum = [0], total = 1, firma = '', hitos = [];

    /* La línea pasa por el centro de cada punto, de arriba abajo */
    function geo(){
      if (firma && pts.length) return;           /* solo se mide cuando algo cambió */
      var zr = zz.getBoundingClientRect();
      if (!zr.width || !zr.height) return;
      var W = zr.width, H = zr.height;
      var c = dots.map(function(d){
        var r = d.getBoundingClientRect();
        /* GSAP escala los puntos al entrar: el centro no cambia */
        return [r.left + r.width / 2 - zr.left, r.top + r.height / 2 - zr.top];
      });
      var x0 = c[0][0];
      var p = [[x0, 0]].concat(c, [[c[c.length - 1][0], H]]);
      var s = p.map(function(q){ return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
      firma = s;
      svg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1));
      [track, line].concat(colas.map(function(k){ return k.el; })).forEach(function(el){ el.setAttribute('points', s); });
      pts = p;
      acum = [0];
      for (var i = 1; i < pts.length; i++) acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      total = acum[acum.length - 1] || 1;
      hitos = c.map(function(q, i){ return acum[i + 1] / total; });
    }

    if (RM){
      geo();
      line.style.strokeDashoffset = 0;
      colas.forEach(function(k){ k.el.style.opacity = 0; });
      rows.forEach(function(r){ r.classList.add('is-lit'); });
      window.addEventListener('resize', function(){ firma = ''; geo(); });
      return;
    }

    var head = document.createElement('i'), core = document.createElement('b');
    head.className = 'kit-head';
    head.setAttribute('aria-hidden', 'true');
    head.appendChild(core);
    zz.appendChild(head);

    function punto(d){
      for (var i = 1; i < pts.length; i++){
        if (d <= acum[i] || i === pts.length - 1){
          var L = (acum[i] - acum[i - 1]) || 1, k = Math.max(0, Math.min(1, (d - acum[i - 1]) / L));
          var a = pts[i - 1], b = pts[i];
          return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
        }
      }
      return { x: 0, y: 0, ang: 90 };
    }

    var meta = 0, p = -1, giro = null, raf = 0, last = 0;
    function pinta(vel){
      geo();
      if (pts.length < 2) return;
      var d = p * total, q = punto(d);
      line.style.strokeDashoffset = 1 - p;
      colas.forEach(function(c){
        var largo = Math.min(d, c.px) / total;
        c.el.style.strokeDasharray = largo + ' 2';
        c.el.style.strokeDashoffset = -(p - largo);
        c.el.style.opacity = p > .002 ? 1 : 0;
      });
      if (giro === null) giro = q.ang;
      var dif = ((q.ang - giro + 540) % 360) - 180;
      giro += dif * .16;
      var esc = .8 + Math.min(.42, Math.abs(vel) * 7);       /* crece con la velocidad */
      head.style.transform = 'translate3d(' + q.x.toFixed(2) + 'px,' + q.y.toFixed(2) + 'px,0) rotate(' + giro.toFixed(2) + 'deg) scale(' + esc.toFixed(3) + ')';
      head.classList.toggle('is-on', p > .003 && p < .997);
      rows.forEach(function(r, i){ r.classList.toggle('is-lit', p >= (hitos[i] || 0) - .006 && p > .001); });
    }
    function loop(now){
      raf = 0;
      if (document.hidden){ last = 0; return; }
      var dt = last ? Math.min((now - last) / 1000, .05) : .016;
      last = now;
      var dv = meta - p;
      p += dv * (1 - Math.exp(-dt / .17));                    /* sigue al scroll con leve retraso */
      var quieto = Math.abs(meta - p) < .0005;
      if (quieto) p = meta;
      pinta(quieto ? 0 : dv);
      if (!quieto || Math.abs(((punto(p * total).ang - giro + 540) % 360) - 180) > .4) raf = requestAnimationFrame(loop);
      else last = 0;
    }
    function kick(){ if (!raf) raf = requestAnimationFrame(loop); }

    if (window.ScrollTrigger){
      ScrollTrigger.create({
        trigger: zz, start: 'top 78%', end: 'bottom 58%',
        onUpdate: function(s){ meta = s.progress; kick(); },
        onRefresh: function(s){ firma = ''; meta = s.progress; if (p < 0) p = meta; kick(); }
      });
    } else {
      var calc = function(){
        var r = zz.getBoundingClientRect(), vh = innerHeight, a = vh * .78, b = vh * .58;
        meta = Math.max(0, Math.min(1, (a - r.top) / ((r.height + a - b) || 1)));
        kick();
      };
      window.addEventListener('scroll', calc, { passive: true });
      calc();
    }
    /* tipografía o fotos que cambian la altura: rehacer la línea */
    if ('ResizeObserver' in window) new ResizeObserver(function(){ firma = ''; kick(); }).observe(zz);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) kick(); });
    requestAnimationFrame(function(){ if (p < 0) p = 0; firma = ''; pinta(0); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
