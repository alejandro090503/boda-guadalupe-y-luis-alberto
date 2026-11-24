/* INSERTAR: antes de </body> (quitar o desactivar el JS RSVP anterior: initRSVP2 / PANEL INTEGRATION) */
/* RSVP · Panel de Invitados, version "X pases". Nunca WhatsApp.
   Lee ?para= y ?pases= (tambien ?i=<token base64url "para|pases|menores"> y el hash).
   GET  PANEL_API?nombre=&url_boda=  -> pases / estado guardado
   POST PANEL_API {nombre,url_boda,estado,pases_confirmados,nombres_confirmados} */
(function () {
  'use strict';
  var PANEL_API = 'https://panel-invitados.vercel.app/api/confirmar';
  var URL_BODA  = 'https://boda-guadalupe-y-luis-alberto.vercel.app';
  var DEADLINE  = new Date('2027-07-07T23:59:59-06:00');   /* miercoles 7 de julio de 2027 (CDMX) */
  var frozen    = Date.now() > DEADLINE.getTime();
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $(id) { return document.getElementById(id); }
  var paraEl = $('c2-rs-para'), nameEl = $('c2-rs-name'), noteEl = $('c2-rs-note');
  var dispEl = $('c2-rs-pases'), numEl = $('c2-rs-pases-num'), lblEl = $('c2-rs-pases-lbl');
  var fieldsEl = $('c2-rs-fields'), btn = $('c2-rs-confirm'), btnText = $('c2-rs-btn-text');
  var yes = $('c2-rs-yes'), no = $('c2-rs-no'), fb = $('c2-rs-feedback');
  var bandejaEl = $('c2-rs-bandeja'), graciasEl = $('c2-rs-gracias');
  var gTitleEl = $('c2-rs-gracias-title'), gSubEl = $('c2-rs-gracias-sub'), editEl = $('c2-rs-edit');
  if (!paraEl || !fieldsEl || !btn || !yes || !no || !bandejaEl || !graciasEl) return;

  /* ---- quien es el invitado y cuantos pases tiene ---- */
  function decodeInvite(tok) {
    try {
      var b64 = tok.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var p = new TextDecoder().decode(bytes).split('|');
      return { para: (p[0] || '').trim(), pases: parseInt(p[1], 10) || 1 };
    } catch (e) { return null; }
  }
  var qp = new URLSearchParams(location.search);
  var hp = new URLSearchParams(location.hash.replace(/^#/, ''));
  var para = '', pases = 1;
  var token = qp.get('i') || hp.get('i');
  if (token) { var dec = decodeInvite(token); if (dec && dec.para) { para = dec.para; pases = dec.pases; } }
  if (!para) {
    para = (qp.get('para') || hp.get('para') || '').trim();
    pases = parseInt(qp.get('pases') || hp.get('pases'), 10);
  }
  pases = (isNaN(pases) || pases < 1 || pases > 20) ? 1 : pases;

  var estado = null, savedNames = [];

  function paint() {
    numEl.textContent = pases;
    lblEl.textContent = pases === 1 ? 'Pase' : 'Pases';
    noteEl.textContent = pases === 1 ? 'Hemos reservado un lugar para ti.' : 'Hemos reservado ' + pases + ' lugares en tu honor.';
    dispEl.hidden = false;
    if (para) { nameEl.textContent = para; paraEl.hidden = false; }
  }
  function say(t, cls) { fb.textContent = t; fb.className = cls || ''; }

  function buildFields() {
    var prev = [];
    fieldsEl.querySelectorAll('input').forEach(function (i) { prev.push(i.value); });
    fieldsEl.innerHTML = '';
    for (var i = 0; i < pases; i++) {
      var inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'c2-rs-input';
      inp.placeholder = 'Nombre completo del invitado ' + (i + 1);
      inp.setAttribute('aria-label', 'Nombre completo del invitado ' + (i + 1));
      inp.autocomplete = 'name'; inp.maxLength = 80;
      inp.value = prev[i] || savedNames[i] || '';
      if (frozen) inp.disabled = true;
      fieldsEl.appendChild(inp);
    }
  }
  /* nombres solo al decir "Si"; al decir "No" se ocultan y se limpian */
  function select(v) {
    estado = v;
    yes.classList.toggle('on', v === 'confirmado'); yes.setAttribute('aria-pressed', v === 'confirmado' ? 'true' : 'false');
    no.classList.toggle('on', v === 'declino');     no.setAttribute('aria-pressed', v === 'declino' ? 'true' : 'false');
    if (v === 'confirmado') { buildFields(); fieldsEl.style.display = ''; }
    else { fieldsEl.innerHTML = ''; fieldsEl.style.display = 'none'; }
  }
  yes.addEventListener('click', function () { if (!frozen) { select('confirmado'); say('', ''); } });
  no.addEventListener('click', function () { if (!frozen) { select('declino'); say('', ''); } });

  /* ---- bandeja que se cierra / tarjeta de gracias ---- */
  function mostrarGracias(est, nombres) {
    if (est === 'confirmado') {
      gTitleEl.textContent = '¡Gracias por confirmar!';
      gSubEl.textContent = nombres.length === 1
        ? 'Te esperamos, ' + nombres[0] + '.'
        : 'Confirmamos ' + nombres.length + ' lugares: ' + nombres.join(', ') + '.';
    } else {
      gTitleEl.textContent = 'Gracias por avisarnos';
      gSubEl.textContent = 'Lamentamos que no puedas acompañarnos. Te vamos a extrañar.';
    }
    bandejaEl.style.display = 'none';
    graciasEl.style.display = '';
  }
  function abrirBandeja() { graciasEl.style.display = 'none'; bandejaEl.style.display = ''; say('', ''); }
  editEl.addEventListener('click', function () { if (!frozen) abrirBandeja(); });

  /* ---- confeti en la paleta ---- */
  function confetti() {
    if (RM) return;
    var cols = ['#C0C0C0', '#FFFFFF', '#4F86E6', '#0042A9', '#7D8591', '#EEF2F8'];
    var H = window.innerHeight || 800;
    for (var i = 0; i < 70; i++) {
      var c = document.createElement('i');
      c.className = 'c2-confetti';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = cols[i % cols.length];
      document.body.appendChild(c);
      var a = c.animate([
        { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate3d(' + (Math.random() * 140 - 70) + 'px,' + (H + 40) + 'px,0) rotate(' + (Math.random() * 900 - 450) + 'deg)', opacity: 0.85 }
      ], { duration: 2300 + Math.random() * 1700, delay: Math.random() * 450, easing: 'cubic-bezier(.2,.6,.4,1)' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  /* ---- fecha limite ---- */
  function applyFreeze() {
    if (!frozen) return;
    yes.disabled = no.disabled = btn.disabled = editEl.disabled = true;
    fieldsEl.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
    btnText.textContent = 'Confirmaciones cerradas';
    say('La fecha límite para confirmar (7 de julio de 2027) ya pasó.', 'err');
  }

  paint();

  /* ---- precarga de la respuesta guardada (la seccion arranca CERRADA si ya respondio) ---- */
  if (para) {
    yes.disabled = no.disabled = true;
    fetch(PANEL_API + '?nombre=' + encodeURIComponent(para) + '&url_boda=' + encodeURIComponent(URL_BODA))
      .then(function (r) { return r.json(); })
      .then(function (resp) {
        var d = resp && resp.invitado;
        if (d && typeof d.pases === 'number' && d.pases > 0 && d.pases <= 20) { pases = d.pases; paint(); }
        if (!frozen) yes.disabled = no.disabled = false;
        if (d && (d.estado === 'confirmado' || d.estado === 'declino')) {
          savedNames = d.nombres_confirmados || [];
          select(d.estado);
          btnText.textContent = 'Actualizar respuesta';
          mostrarGracias(d.estado, savedNames);
        }
        applyFreeze();
      })
      .catch(function () { if (!frozen) yes.disabled = no.disabled = false; applyFreeze(); });
  } else {
    /* link sin nombre: no hay invitacion que actualizar; se avisa antes de llenar un formulario que no podria enviarse */
    yes.disabled = no.disabled = btn.disabled = true;
    say('Para confirmar abre el enlace personalizado que te enviamos; ese enlace lleva tu nombre y tus pases.', 'err');
    applyFreeze();
  }

  /* ---- envio ---- */
  btn.addEventListener('click', function () {
    if (frozen || btn.disabled) return;
    if (!para) { say('Abre tu enlace personal de invitación para confirmar.', 'err'); return; }
    if (!estado) { say('Elige si asistirás o no.', 'err'); return; }
    var nombres = [];
    if (estado === 'confirmado') {
      fieldsEl.querySelectorAll('input').forEach(function (i) { var v = i.value.trim(); if (v) nombres.push(v); });
      if (!nombres.length) { say('Escribe al menos un nombre.', 'err'); return; }
    }
    btn.disabled = true; say('Enviando…', '');
    fetch(PANEL_API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: para,
        url_boda: URL_BODA,
        estado: estado,
        pases_confirmados: estado === 'confirmado' ? nombres.length : 0,
        nombres_confirmados: nombres
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        btn.disabled = false;
        if (!res.ok || (res.d && res.d.ok === false)) { say('No pudimos registrar tu respuesta. Intenta de nuevo.', 'err'); return; }
        savedNames = nombres; btnText.textContent = 'Actualizar respuesta'; say('', '');
        mostrarGracias(estado, nombres);
        if (estado === 'confirmado') confetti();
      })
      .catch(function () { btn.disabled = false; say('Sin conexión. Intenta de nuevo.', 'err'); });
  });
})();
