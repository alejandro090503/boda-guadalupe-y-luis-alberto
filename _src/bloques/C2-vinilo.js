/* INSERTAR: antes de </body> (después del JS de audio existente) */
/* VINILO · alterna #bgMusic y refleja su estado (no crea otro audio, no reinicia si ya suena) */
(function(){
  'use strict';
  var btn = document.getElementById('c2-music-btn'), audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;
  var spin = btn.querySelector('.c2-vn-spin');
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var brake = null; /* animación de frenado con inercia */

  function sync(){
    var on = !audio.paused && !audio.ended;
    var was = btn.classList.contains('is-playing');
    btn.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Pausar música' : 'Reproducir música');
    if (on && brake){ try{ brake.cancel(); }catch(e){} brake = null; }
    if (!on && was && !RM && spin && spin.animate && window.getComputedStyle){
      /* frena con inercia: toma el ángulo actual y lo desacelera ~1 s */
      var m = getComputedStyle(spin).transform, ang = 0;
      if (m && m !== 'none'){ var v = m.match(/matrix\(([^)]+)\)/); if (v){ var p = v[1].split(','); ang = Math.atan2(parseFloat(p[1]), parseFloat(p[0])) * 180 / Math.PI; } }
      try{
        brake = spin.animate([{ transform: 'rotate(' + ang + 'deg)' }, { transform: 'rotate(' + (ang + 70) + 'deg)' }],
          { duration: 1100, easing: 'cubic-bezier(.1,.7,.2,1)', fill: 'forwards' });
        brake.onfinish = function(){ try{ brake.cancel(); }catch(e){} brake = null; };
      }catch(e){}
    }
  }
  ['play','playing','pause','ended'].forEach(function(ev){ audio.addEventListener(ev, sync); });
  sync();

  /* Guarda el estado ANTES de que un desbloqueo global haga play() en ese mismo toque;
     si no, el click vería "sonando" y lo pausaría. */
  var before = null, beforeAt = 0;
  function mark(e){ if (btn.contains(e.target)){ before = audio.paused; beforeAt = Date.now(); } }
  ['pointerdown','touchstart','mousedown'].forEach(function(ev){
    window.addEventListener(ev, mark, { capture: true, passive: true });
  });

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var wasPaused = (before !== null && Date.now() - beforeAt < 1500) ? before : audio.paused;
    before = null;
    if (wasPaused){
      audio.muted = false;
      if (audio.paused){ var p = audio.play(); if (p && p.catch) p.catch(sync); }
    } else {
      audio.pause();
    }
  });
})();
