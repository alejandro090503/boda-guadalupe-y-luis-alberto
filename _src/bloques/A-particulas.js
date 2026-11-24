/* INSERTAR: al final del último <script> (después de initMain / gsap cargado). Polvo de estrellas plateado que cae con giro 3D. */
(function(){
  if(!window.gsap||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var mob=window.innerWidth<768,N=mob?14:26,W=window.innerWidth,H=window.innerHeight;
  var box=document.createElement('div');
  box.setAttribute('aria-hidden','true');
  box.style.cssText='position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden;perspective:700px';
  document.body.appendChild(box);
  var tw=[],R=function(a,b){return a+Math.random()*(b-a)};
  function drop(i){var idx=i;
    var big=i%4===0,src=big?(i%8===0?'assets/particula-estrella-b.webp':'assets/particula-polvo-b.webp'):(i%3===0?'assets/particula-estrella.webp':'assets/particula-polvo.webp');
    var im=new Image();im.src=src;im.alt='';im.decoding='async';
    var s=big?R(30,46):R(10,20);
    im.style.cssText='position:absolute;left:0;top:0;width:'+s+'px;height:auto;opacity:0;will-change:transform,opacity;backface-visibility:visible';
    im.onerror=function(){im.remove()};
    box.appendChild(im);
    var op=big?R(.2,.32):R(.3,.5);
    function run(){
      var x=R(0,W),dx=R(-70,70),dur=R(9,17);
      gsap.set(im,{x:x,y:-60,rotationX:R(0,360),rotationY:R(0,360),rotation:R(0,360),opacity:0});
      var t=gsap.timeline({onComplete:run});
      t.to(im,{y:H+60,x:x+dx,rotation:'+='+R(-120,120),duration:dur,ease:'none'},0)
       .to(im,{rotationX:'+=180',rotationY:'+=140',duration:R(1.6,3),ease:'sine.inOut',yoyo:true,repeat:Math.ceil(dur/2)},0)
       .to(im,{opacity:op,duration:1.2,ease:'sine.out'},0)
       .to(im,{opacity:0,duration:1.4,ease:'sine.in'},dur-1.4);
      im._t=t;tw[idx]=im;
    }
    gsap.delayedCall(R(0,12),run);
  }
  for(var i=0;i<N;i++)drop(i);
  document.addEventListener('visibilitychange',function(){
    tw.forEach(function(m){if(m&&m._t){document.hidden?m._t.pause():m._t.resume()}});
  });
})();
