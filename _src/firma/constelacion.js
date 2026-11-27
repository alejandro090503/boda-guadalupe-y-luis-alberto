<script>
/* ═══ FIRMA · Constelaciones de plata que se trazan (L & G) ═══
   <canvas class="cst" data-modo="trazar|apagar"></canvas> dentro de un contenedor relative.
   Estrellas plateadas titilan; en bucle lento se unen con un trazo fino de luz hasta formar L & G.
   "apagar" (pie): traza una vez por ciclo y se va apagando despacio. Pausa fuera de pantalla. */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* nodos normalizados (0..1) dentro del área útil del canvas */
  var L = [[.16,.18],[.15,.46],[.155,.74],[.33,.74]];
  var G = [[.84,.30],[.73,.17],[.60,.22],[.535,.44],[.585,.68],[.72,.76],[.84,.64],[.845,.49],[.73,.49]];
  var AMP = [[.445,.40],[.47,.52]];
  var SEGS = [];
  function add(arr){ for (var i = 0; i < arr.length - 1; i++) SEGS.push([arr[i], arr[i+1]]); }
  add(L); add(G);
  var NODES = L.concat(G, AMP);

  function init(cv){
    var g = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, box = null, dust = [], vis = false, t0 = 0, raf = 0;
    var modo = cv.getAttribute('data-modo') || 'trazar';
    var lenTot = 0, segLen = [];
    function size(){
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bw = Math.min(W * .86, H * 1.25), bh = bw * .62;
      box = { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
      dust = []; var n = Math.round(W * H / 2600);
      for (var i = 0; i < n; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * .9 + .25, ph: Math.random() * 6.3, sp: .5 + Math.random() * 1.6 });
      lenTot = 0; segLen = SEGS.map(function(s){ var a = P(s[0]), b = P(s[1]), l = Math.hypot(b.x - a.x, b.y - a.y); lenTot += l; return l; });
    }
    function P(p){ return { x: box.x + p[0] * box.w, y: box.y + p[1] * box.h }; }
    function star(x, y, r, a){
      var gr = g.createRadialGradient(x, y, 0, x, y, r * 5);
      gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(.25, 'rgba(226,232,242,' + (a * .55) + ')'); gr.addColorStop(1, 'rgba(192,198,208,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 5, 0, 6.283); g.fill();
      g.globalAlpha = a * .7; g.fillStyle = '#FFFFFF';
      g.fillRect(x - r * 3.2, y - .35, r * 6.4, .7); g.fillRect(x - .35, y - r * 3.2, .7, r * 6.4);
      g.globalAlpha = 1;
    }
    var CYC = modo === 'apagar' ? 18 : 14;
    function frame(ts){
      if (!box) { size(); if (!box) return; }
      var t = RM ? 7 : ((ts - t0) / 1000) % CYC;
      g.clearRect(0, 0, W, H);
      /* polvo de estrellas de fondo */
      for (var i = 0; i < dust.length; i++){
        var d = dust[i], a = RM ? .5 : .5 + .5 * Math.sin(ts / 1000 * d.sp + d.ph);
        g.globalAlpha = a * a * .75; g.fillStyle = i % 4 ? '#E9EDF4' : '#9FB8E8';
        g.beginPath(); g.arc(d.x, d.y, d.r, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
      /* curva de ciclo: aparición 0-1.5 · trazo 1.5-6 · brillo · desvanecer */
      var stars = Math.min(1, t / 1.5), draw = Math.min(1, Math.max(0, (t - 1.5) / 4.5)), fade = 1;
      if (modo === 'apagar') { if (t > 7) fade = Math.max(.18, 1 - (t - 7) / 8); }
      else if (t > 10.5) fade = Math.max(0, 1 - (t - 10.5) / 2.5);
      if (RM) { stars = 1; draw = 1; fade = 1; }
      /* trazos */
      var len = draw * lenTot;
      g.lineCap = 'round'; g.lineWidth = 1.1;
      g.shadowColor = 'rgba(214,224,240,.9)'; g.shadowBlur = 8;
      for (var k = 0; k < SEGS.length && len > 0; k++){
        var a0 = P(SEGS[k][0]), b0 = P(SEGS[k][1]), f = Math.min(1, len / segLen[k]); len -= segLen[k];
        var x1 = a0.x + (b0.x - a0.x) * f, y1 = a0.y + (b0.y - a0.y) * f;
        g.strokeStyle = 'rgba(222,230,242,' + (.62 * fade) + ')';
        g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(x1, y1); g.stroke();
        if (f < 1 && !RM){ g.shadowBlur = 0; star(x1, y1, 1.6, .95 * fade); g.shadowBlur = 8; }
      }
      g.shadowBlur = 0;
      /* pulso de luz que recorre la figura cuando ya está trazada */
      var pulse = (!RM && t > 6 && t < 10.5) ? (t - 6) / 4.5 : -1;
      for (var n = 0; n < NODES.length; n++){
        var p = P(NODES[n]), tw = RM ? .9 : .72 + .28 * Math.sin(ts / 700 + n * 1.7);
        var boost = pulse >= 0 ? Math.max(0, 1 - Math.abs(pulse * NODES.length - n) / 1.6) * .6 : 0;
        star(p.x, p.y, n >= L.length + G.length ? 1.1 : 1.5, Math.min(1, (tw + boost) * stars * (modo === 'apagar' ? Math.max(.35, fade) : 1)));
      }
    }
    function loop(ts){ if (!vis) return; if (!t0) t0 = ts; frame(ts); raf = requestAnimationFrame(loop); }
    size(); addEventListener('resize', function(){ box = null; });
    if (RM) { frame(0); return; }
    new IntersectionObserver(function(es){
      vis = es[0].isIntersecting; cancelAnimationFrame(raf);
      if (vis && !document.hidden) raf = requestAnimationFrame(loop);
    }, { rootMargin: '80px' }).observe(cv);
    document.addEventListener('visibilitychange', function(){ cancelAnimationFrame(raf); if (vis && !document.hidden) raf = requestAnimationFrame(loop); });
  }
  function boot(){ document.querySelectorAll('canvas.cst').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* ═══ Sparkles (21st · efecto 29) en PLATA: línea de luz curva + polvo de estrellas ═══ */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.sp21 canvas').forEach(function(cv){
    var g = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, P = [], vis = false, raf = 0;
    function size(){ var r = cv.getBoundingClientRect(); W = r.width; H = r.height; if (!W) return; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = Math.round(W * H / 110); for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.05 + .25, ph: Math.random() * 6.3, sp: .6 + Math.random() * 2.2, vx: (Math.random() - .5) * .12, vy: -Math.random() * .08 }); }
    function draw(t){ g.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++){ var p = P[i];
        if (!RM){ p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; }
        var a = RM ? .6 : .5 + .5 * Math.sin(t / 1000 * p.sp + p.ph); g.globalAlpha = a * a; g.fillStyle = i % 5 ? '#F4F7FC' : '#AFC6F0';
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); }
      g.globalAlpha = 1; }
    function loop(t){ if (!vis) return; draw(t); raf = requestAnimationFrame(loop); }
    size(); addEventListener('resize', size);
    if (RM) { draw(0); return; }
    new IntersectionObserver(function(es){ vis = es[0].isIntersecting; cancelAnimationFrame(raf); if (vis && !document.hidden) raf = requestAnimationFrame(loop); }).observe(cv);
    document.addEventListener('visibilitychange', function(){ cancelAnimationFrame(raf); if (vis && !document.hidden) raf = requestAnimationFrame(loop); });
  });
})();
</script>
