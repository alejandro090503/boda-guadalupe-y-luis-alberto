/* INSERTAR: antes de </body> */
/* GALERIA · carrusel 3D (c2-g): giro automatico (gsap.ticker), arrastre con inercia que regresa al giro,
   pausa fuera de pantalla, reflejo con clon volteado + velo, lightbox que abre en click. Sin loading="lazy". */
(function () {
  'use strict';
  var AUTO = 9;          /* grados/s del giro automatico (~40 s por vuelta) */
  var DEG_PX = 0.42;     /* grados por px arrastrado */
  var GAP = 18;          /* hueco entre fotos (px) */
  var RP = 0.78, RL = 1.333; /* proporcion ancho/alto: vertical / horizontal */
  var inited = false;

  function init() {
    if (inited) return;
    var stage = document.getElementById('c2GStage');
    var lb = document.getElementById('c2GLb');
    if (!stage || !lb) return;
    var ring = stage.querySelector('.c2-g-ring');
    var cards = Array.prototype.slice.call(ring.querySelectorAll('.c2-g-card'));
    var n = cards.length;
    if (n < 3) return;
    inited = true;

    var wrap = stage.parentElement;
    var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var G = window.gsap;
    var hasTicker = !!(G && G.ticker);
    var W = 0, R = 300;
    var ang = [];                       /* angulo (grados) del centro de cada tarjeta */
    var rot = 0, vel = reduce ? 0 : AUTO;
    var dragging = false, running = false, visible = false, lbOpen = false, suppress = false;
    var shown = [];

    /* reflejos: clon volteado de la cara + velo del color de fondo */
    cards.forEach(function (card, i) {
      card.setAttribute('data-i', i);
      var face = card.querySelector('.c2-g-face');
      var refl = document.createElement('div');
      refl.className = 'c2-g-refl';
      refl.setAttribute('aria-hidden', 'true');
      var clone = face.cloneNode(true);
      var cimg = clone.querySelector('img');
      if (cimg) cimg.alt = '';
      refl.appendChild(clone);
      var veil = document.createElement('div');
      veil.className = 'c2-g-veil';
      veil.setAttribute('aria-hidden', 'true');
      card.appendChild(refl);
      card.appendChild(veil);
      shown[i] = true;
    });

    /* medidas: alto segun el ancho disponible; radio resuelto para que las n fotos (anchos distintos) cierren el circulo */
    function layout() {
      var w0 = wrap.clientWidth || Math.min(window.innerWidth, 430);
      if (w0 === W) return;
      W = w0;
      var h = Math.round(Math.min(250, (W - 56) / RL));
      var ws = cards.map(function (c) { return Math.round(h * (c.classList.contains('c2-g-l') ? RL : RP)); });
      function total(r) {
        var s = 0;
        for (var i = 0; i < n; i++) s += 2 * Math.atan(ws[i] / (2 * r)) + GAP / r;
        return s;
      }
      var lo = 60, hi = 4000;
      for (var k = 0; k < 40; k++) {
        var mid = (lo + hi) / 2;
        if (total(mid) > 2 * Math.PI) lo = mid; else hi = mid;
      }
      R = Math.round(hi);
      var acc = 0, base = 0;
      for (var j = 0; j < n; j++) {
        var span = 2 * Math.atan(ws[j] / (2 * R));
        var center = acc + span / 2;
        if (j === 0) base = center;
        ang[j] = (center - base) * 180 / Math.PI;
        acc += span + GAP / R;
      }
      stage.style.setProperty('--c2g-h', h + 'px');
      stage.style.height = Math.round(h * 1.34 + 44) + 'px';
      cards.forEach(function (c, i) {
        c.style.setProperty('--w', ws[i] + 'px');
        c.style.marginLeft = (-ws[i] / 2) + 'px';
        c.style.transform = 'rotateY(' + ang[i].toFixed(3) + 'deg) translateZ(' + R + 'px)';
      });
      render();
    }

    function render() {
      ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + rot.toFixed(3) + 'deg)';
      for (var i = 0; i < n; i++) {
        var c = Math.cos((ang[i] + rot) * Math.PI / 180);
        var on = c > 0.02;
        if (on !== shown[i]) { cards[i].style.visibility = on ? 'visible' : 'hidden'; shown[i] = on; }
        if (on) cards[i].style.opacity = (0.3 + 0.7 * c).toFixed(3);
      }
    }

    /* bucle: gsap.ticker (rAF de respaldo) */
    function tick(time, deltaTime) {
      var dt = Math.min(deltaTime || 16.7, 64) / 1000;
      if (!dragging) {
        var target = reduce ? 0 : AUTO;
        vel += (target - vel) * (1 - Math.exp(-dt * 1.3));   /* la inercia regresa al giro suave */
        rot += vel * dt;
      }
      render();
    }
    var rafId = 0, lastT = 0;
    function rafLoop(t) { tick(t, lastT ? t - lastT : 16.7); lastT = t; rafId = requestAnimationFrame(rafLoop); }
    function update() {
      var should = visible && !lbOpen && !document.hidden;
      if (should === running) return;
      running = should;
      if (hasTicker) { if (should) G.ticker.add(tick); else G.ticker.remove(tick); }
      else if (should) { lastT = 0; rafId = requestAnimationFrame(rafLoop); }
      else cancelAnimationFrame(rafId);
    }

    /* arrastre (pointer events); la apertura va en click, no en pointerup */
    var pid = null, sx = 0, sy = 0, lx = 0, lt = 0, axis = null;
    stage.addEventListener('pointerdown', function (e) {
      if (pid !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pid = e.pointerId; sx = lx = e.clientX; sy = e.clientY; lt = performance.now(); axis = null; suppress = false;
    });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') {
          dragging = true; suppress = true; vel = 0; stage.classList.add('is-drag');
          try { stage.setPointerCapture(pid); } catch (_) {}
        }
      }
      if (axis !== 'x') return;
      var now = performance.now();
      var d = (e.clientX - lx) * DEG_PX;
      rot += d;
      vel = vel * 0.6 + (d / (Math.max(now - lt, 8) / 1000)) * 0.4;
      lx = e.clientX; lt = now;
      render();
    });
    function endPointer(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
      stage.classList.remove('is-drag');
      if (dragging) {
        dragging = false;
        if (performance.now() - lt > 90) vel *= 0.25;          /* solto quieto: poca inercia */
        vel = Math.max(-540, Math.min(540, vel));
        setTimeout(function () { suppress = false; }, 60);      /* el click del mismo gesto no abre nada */
      } else if (axis === 'y') { suppress = true; setTimeout(function () { suppress = false; }, 60); }
      axis = null;
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
    stage.addEventListener('click', function (e) {
      if (suppress) return;
      var card = e.target.closest ? e.target.closest('.c2-g-card') : null;
      if (card) openLB(+card.getAttribute('data-i'));
    });
    cards.forEach(function (card, i) {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(i); }
      });
    });

    /* lightbox */
    document.body.appendChild(lb);          /* fuera de ancestros transformados */
    var fig = lb.querySelector('.c2-lb-fig');
    var lbImg = lb.querySelector('.c2-lb-img');
    var count = lb.querySelector('.c2-lb-count');
    var btnClose = lb.querySelector('.c2-lb-close');
    var photos = cards.map(function (c) { var im = c.querySelector('.c2-g-face img'); return { src: im.getAttribute('src'), alt: im.alt }; });
    var cur = 0, prevFocus = null, htmlOv = '';
    var D = reduce ? 0 : 0.3;

    function setPhoto(i) {
      cur = (i + n) % n;
      lbImg.src = photos[cur].src; lbImg.alt = photos[cur].alt;
      count.textContent = (cur + 1) + ' / ' + n;
    }
    function openLB(i) {
      if (lbOpen) return;
      setPhoto(i);
      lbOpen = true; update();
      prevFocus = document.activeElement;
      htmlOv = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      lb.hidden = false;
      if (G && D) {
        G.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: D, ease: 'power1.out' });
        G.fromTo(fig, { opacity: 0, scale: 0.94, x: 0, y: 0 }, { opacity: 1, scale: 1, duration: D * 1.3, ease: 'power2.out' });
      }
      try { btnClose.focus({ preventScroll: true }); } catch (_) {}
    }
    function closeLB() {
      if (!lbOpen) return;
      function done() {
        lb.hidden = true;
        document.documentElement.style.overflow = htmlOv;
        lbOpen = false; update();
        if (prevFocus && prevFocus.focus) { try { prevFocus.focus({ preventScroll: true }); } catch (_) {} }
      }
      if (G && D) G.to(lb, { opacity: 0, duration: D * 0.8, ease: 'power1.in', onComplete: done });
      else done();
    }
    function go(dir) {
      if (!G || !D) { setPhoto(cur + dir); if (G) G.set(fig, { x: 0, y: 0, opacity: 1 }); return; }
      G.killTweensOf(fig);
      G.to(fig, { x: -dir * 70, opacity: 0, duration: 0.18, ease: 'power1.in', onComplete: function () {
        setPhoto(cur + dir);
        G.fromTo(fig, { x: dir * 70, y: 0, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: 'power2.out' });
      } });
    }
    btnClose.addEventListener('click', closeLB);
    lb.querySelector('.c2-lb-prev').addEventListener('click', function () { go(-1); });
    lb.querySelector('.c2-lb-next').addEventListener('click', function () { go(1); });
    document.addEventListener('keydown', function (e) {
      if (!lbOpen) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });

    /* swipe: izquierda/derecha cambia de foto, abajo cierra, toque en el fondo cierra */
    var lp = null, lsx = 0, lsy = 0, lmoved = false, onFig = false;
    lb.addEventListener('pointerdown', function (e) {
      if (lp !== null || (e.target.closest && e.target.closest('button'))) return;
      lp = e.pointerId; lsx = e.clientX; lsy = e.clientY; lmoved = false;
      onFig = !!(e.target.closest && e.target.closest('.c2-lb-fig'));
      try { lb.setPointerCapture(lp); } catch (_) {}
    });
    lb.addEventListener('pointermove', function (e) {
      if (e.pointerId !== lp) return;
      var dx = e.clientX - lsx, dy = e.clientY - lsy;
      if (!lmoved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      lmoved = true;
      if (G) G.set(fig, { x: dx * 0.9, y: dy > 0 && Math.abs(dy) > Math.abs(dx) ? dy * 0.6 : 0 });
    });
    function lbEnd(e, cancelled) {
      if (e.pointerId !== lp) return;
      lp = null;
      try { lb.releasePointerCapture(e.pointerId); } catch (_) {}
      var dx = e.clientX - lsx, dy = e.clientY - lsy;
      if (cancelled) { if (G) G.to(fig, { x: 0, y: 0, duration: 0.25 }); return; }
      if (!lmoved) { if (!onFig) closeLB(); return; }
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      else if (dy > 110) closeLB();
      else if (G) G.to(fig, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    }
    lb.addEventListener('pointerup', function (e) { lbEnd(e, false); });
    lb.addEventListener('pointercancel', function (e) { lbEnd(e, true); });

    /* pausa fuera de pantalla / pestana oculta */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) layout();
        update();
      }, { rootMargin: '80px 0px' }).observe(stage);
    } else { visible = true; update(); }
    document.addEventListener('visibilitychange', update);
    window.addEventListener('resize', function () { W = 0; layout(); });
    window.addEventListener('load', function () { W = 0; layout(); });
    layout();
  }

  /* entrada suave al llegar a la seccion (si no hay GSAP, queda visible) */
  function reveal() {
    var w = document.querySelector('#gallery .c2-g-wrap');
    if (!w || !window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.fromTo(w, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', immediateRender: false,
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: w, start: 'top 88%', once: true } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); reveal(); });
  else { init(); reveal(); }
})();
