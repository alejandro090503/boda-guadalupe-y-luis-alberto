/* INSERTAR: antes de </body> */
<script>
/* ── Recorrido automático sin botón (principal §5) ── */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM || location.hash || /[?&]noauto/.test(location.search)) return;
  var armed = false, stopped = false, running = false, v = 0, acc = 0, last = 0, myScroll = false, raf = 0;
  var SLOW = ['#hero', '#gallery', '#countdown', '#itinerary'];
  function stop(){ if (!armed || stopped) return; stopped = true; running = false; cancelAnimationFrame(raf); }
  ['wheel','touchstart','pointerdown','keydown'].forEach(function(ev){ window.addEventListener(ev, stop, {passive:true, capture:true}); });
  window.addEventListener('scroll', function(){ if (running && !myScroll) stop(); myScroll = false; }, {passive:true, capture:true});
  document.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#navBtn,.btn,a,button,[role="button"]')) stop();
  }, true);
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (running && !stopped) { last = 0; raf = requestAnimationFrame(step); }
  });
  function target(){
    var y = window.scrollY + innerHeight * .5;
    for (var i = 0; i < SLOW.length; i++) {
      var el = document.querySelector(SLOW[i]); if (!el) continue;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * .5 && r.bottom > innerHeight * .5) return 24;
    }
    return 38;
  }
  function step(t){
    if (stopped) return;
    if (!last) last = t;
    var dt = Math.min(.05, (t - last) / 1000); last = t;
    var max = document.documentElement.scrollHeight - innerHeight;
    var goal = window.scrollY >= max - 2 ? 0 : target();
    v += (goal - v) * Math.min(1, dt * 1.6);   /* arranque/frenado ~1 s */
    acc += v * dt;
    var px = Math.floor(acc);
    if (px >= 1) { acc -= px; myScroll = true; window.scrollBy(0, px); }
    if (window.scrollY >= max - 2 && v < .5) { stop(); return; }
    raf = requestAnimationFrame(step);
  }
  window.__startAutoScroll = function(){
    if (stopped || running) return;
    setTimeout(function(){ armed = true; }, 400);
    setTimeout(function(){
      if (stopped || document.hidden) return;
      document.documentElement.style.scrollBehavior = 'auto';
      running = true; last = 0; raf = requestAnimationFrame(step);
    }, 2500);
  };
})();
</script>
