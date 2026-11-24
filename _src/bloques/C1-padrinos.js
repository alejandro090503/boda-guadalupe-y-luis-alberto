/* INSERTAR: antes de </body> (dentro de <script>, después de cargar gsap y ScrollTrigger) */
(function(){
  'use strict';
  var sec = document.getElementById('padrinos');
  if(!sec || typeof gsap === 'undefined') return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasST = typeof ScrollTrigger !== 'undefined';
  if(hasST) gsap.registerPlugin(ScrollTrigger);
  var ease = 'power3.out';
  var head = sec.querySelectorAll('.g73-pd-orn,.g73-pd-intro,.g73-pd-header');
  var cards = sec.querySelectorAll('.g73-pd-card');
  function run(){
    if(head.length) gsap.from(head, {opacity:0, y:18, duration:.65, stagger:.12, ease:ease});
    if(cards.length) gsap.from(cards, {opacity:0, y:22, duration:.65, stagger:.12, delay:.4, ease:ease});
  }
  if(hasST) ScrollTrigger.create({trigger:sec, start:'top 80%', once:true, onEnter:run});
  else run();
})();
