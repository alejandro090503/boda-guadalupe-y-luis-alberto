/* INSERTAR: antes de </body> (dentro de <script>, después de cargar gsap y ScrollTrigger) */
(function(){
  'use strict';
  var sec = document.getElementById('gifts');
  if(!sec || typeof gsap === 'undefined') return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasST = typeof ScrollTrigger !== 'undefined';
  if(hasST) gsap.registerPlugin(ScrollTrigger);
  var ease = 'power3.out';
  var items = sec.querySelectorAll('.g73-gf-lbl,.g73-gf-title,.g73-gf-line,.g73-gf-sub');
  var card = sec.querySelector('.g73-gf-card');
  function run(){
    if(items.length) gsap.from(items, {opacity:0, y:18, duration:.65, stagger:.12, ease:ease});
    if(card) gsap.from(card, {opacity:0, y:26, scale:.97, duration:.75, delay:.45, ease:'back.out(1.3)'});
  }
  if(hasST) ScrollTrigger.create({trigger:sec, start:'top 80%', once:true, onEnter:run});
  else run();
})();
