/* INSERTAR: antes de </body> */
/* DRESS CODE · entrada de las bolitas (back.out) al llegar a la sección */
(function(){
  'use strict';
  var wrap = document.querySelector('#dresscode .c2-dc-wrap');
  var balls = document.querySelectorAll('#dresscode .c2-dc-ball');
  if (!wrap || !balls.length) return;
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (RM || !window.gsap || !window.ScrollTrigger) return; /* sin GSAP o con movimiento reducido: quedan visibles */
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.set(balls, { scale: 0, opacity: 0 });
  var shown = false;
  function show(){
    if (shown) return; shown = true;
    window.gsap.to(balls, { scale: 1, opacity: 1, duration: .9, stagger: .18, ease: 'back.out(2)', clearProps: 'transform,opacity' });
  }
  window.ScrollTrigger.create({ trigger: wrap, start: 'top 82%', once: true, onEnter: show });
  setTimeout(show, 12000); /* red de seguridad */
})();
