/* INSERTAR: antes de </body> (dentro de <script>, después de cargar gsap y ScrollTrigger) */
(function(){
  'use strict';
  var sec = document.getElementById('itinerary');
  if(!sec || typeof gsap === 'undefined') return;
  var steps = sec.querySelectorAll('.g73-it-step');
  if(!steps.length) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasST = typeof ScrollTrigger !== 'undefined';
  if(hasST) gsap.registerPlugin(ScrollTrigger);
  var ease = 'power3.out';
  var head = [sec.querySelector('.g73-it-kicker'), sec.querySelector('.g73-it-title')].filter(Boolean);

  function run(){
    if(head.length) gsap.from(head, {opacity:0, y:18, duration:.7, stagger:.12, ease:ease});
    steps.forEach(function(st, i){
      var ico = st.querySelector('.g73-it-ico');
      var dot = st.querySelector('.g73-it-dot');
      var txt = st.querySelector('.g73-it-text');
      var d = .25 + i*.14;
      if(ico) gsap.from(ico, {opacity:0, x:-22, duration:.65, delay:d, ease:ease});
      if(dot) gsap.from(dot, {scale:0, duration:.5, delay:d+.1, ease:'back.out(2.2)'});
      if(txt) gsap.from(txt, {opacity:0, x:22, duration:.65, delay:d+.05, ease:ease});
    });
  }
  if(hasST) ScrollTrigger.create({trigger:sec, start:'top 78%', once:true, onEnter:run});
  else run();
})();
