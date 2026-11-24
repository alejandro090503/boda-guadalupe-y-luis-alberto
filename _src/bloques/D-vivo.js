/* INSERTAR: antes de </body> (al final, después de GSAP y de los demás scripts) */
<script>
/* ═══ D-VIVO · Luna de plata en tiempo real (Noche estrellada) ═══
   Un solo motor dibuja la luna con relieve (cráteres y mares) calculando la luz por píxel:
   difusa + especular metálica + rebote azul del cielo. Cada adorno visible copia el cuadro
   (los pares van espejados) y dos llevan un anillo de luz con un destello que lo recorre.
   Solo anima lo visible, se detiene con la pestaña oculta y respeta prefers-reduced-motion. */
(function(){
  'use strict';
  var PI = Math.PI, TAU = PI * 2;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Motor: devuelve { canvas, pinta(t, luzAz) } ── */
  function crearMotorLuna(S){
    var cv = document.createElement('canvas');
    cv.width = cv.height = S;
    var ctx = cv.getContext('2d');
    if (!ctx) return null;
    var img = ctx.createImageData(S, S), D = img.data;

    /* Mapa de relieve equirectangular */
    var TW = 512, TH = 256, N = TW * TH;
    var HT = new Float32Array(N), AL = new Float32Array(N);
    var GE = new Float32Array(N), GN = new Float32Array(N);
    var cLat = new Float32Array(TH), sLat = new Float32Array(TH), cLon = new Float32Array(TW), sLon = new Float32Array(TW);
    for (var j = 0; j < TH; j++){ var la = (.5 - (j + .5) / TH) * PI; cLat[j] = Math.cos(la); sLat[j] = Math.sin(la); }
    for (var i = 0; i < TW; i++){ var lo = (i + .5) / TW * TAU; cLon[i] = Math.cos(lo); sLon[i] = Math.sin(lo); }

    function hash(x, y, z){
      var h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h & 65535) / 65535;
    }
    function ruido(x, y, z){
      var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      var fx = x - xi, fy = y - yi, fz = z - zi;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
      var a = hash(xi, yi, zi), b = hash(xi + 1, yi, zi), c = hash(xi, yi + 1, zi), d = hash(xi + 1, yi + 1, zi);
      var e = hash(xi, yi, zi + 1), f = hash(xi + 1, yi, zi + 1), g = hash(xi, yi + 1, zi + 1), h = hash(xi + 1, yi + 1, zi + 1);
      var x1 = a + (b - a) * fx, x2 = c + (d - c) * fx, x3 = e + (f - e) * fx, x4 = g + (h - g) * fx;
      var y1 = x1 + (x2 - x1) * fy, y2 = x3 + (x4 - x3) * fy;
      return y1 + (y2 - y1) * fz;
    }
    function fbm(x, y, z, oct){
      var s = 0, amp = .5, f = 1;
      for (var o = 0; o < oct; o++){ s += amp * ruido(x * f + 17, y * f + 5, z * f + 31); amp *= .5; f *= 2.03; }
      return s;
    }

    /* Mares (zonas planas y más oscuras) + textura fina */
    for (j = 0; j < TH; j++){
      for (i = 0; i < TW; i++){
        var px = cLat[j] * sLon[i], py = sLat[j], pz = cLat[j] * cLon[i], k = j * TW + i;
        var m = fbm(px * 1.7, py * 1.7, pz * 1.7, 3);
        m = Math.max(0, Math.min(1, (m - .47) / .14));
        m = m * m * (3 - 2 * m);
        var fino = fbm(px * 11, py * 11, pz * 11, 2);
        HT[k] = (fino - .5) * .018 - m * .02;
        AL[k] = .9 - m * .3 + (fino - .5) * .1;
      }
    }

    /* Cráteres: se estampan solo dentro de su caja */
    var semilla = 0x9E3779B9;
    function azar(){   /* mulberry32 */
      semilla = (semilla + 0x6D2B79F5) | 0;
      var t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    for (var n = 0; n < 150; n++){
      var cz = azar() * 2 - 1, cph = azar() * TAU, cr = Math.sqrt(1 - cz * cz);
      var cx = cr * Math.sin(cph), cy = cz, czz = cr * Math.cos(cph);
      var r = .022 + .15 * Math.pow(azar(), 2.6), hondo = r * .3, borde = r * .12, joven = azar() > .7;
      var lat0 = Math.asin(cy), alc = r * 1.9;
      var j0 = Math.max(0, Math.floor((.5 - (lat0 + alc) / PI) * TH)), j1 = Math.min(TH - 1, Math.ceil((.5 - (lat0 - alc) / PI) * TH));
      for (j = j0; j <= j1; j++){
        for (i = 0; i < TW; i++){
          var dot = cLat[j] * sLon[i] * cx + sLat[j] * cy + cLat[j] * cLon[i] * czz;
          if (dot < .8) continue;
          var ang = Math.sqrt(Math.max(0, 2 * (1 - dot))), dd = ang / r;
          if (dd > 1.9) continue;
          var kk = j * TW + i, h = 0;
          /* cuenco suave que sube hasta el borde y se funde hacia afuera */
          var bw = dd < 1 ? 1 - dd * dd : 0;
          h -= hondo * bw * bw * (3 - 2 * bw) * .9;
          var rb = (dd - .98) / .3;
          h += borde * Math.exp(-rb * rb);
          if (r > .11){ var pc = dd / .17; h += hondo * .3 * Math.exp(-pc * pc); }
          HT[kk] += h;
          if (joven){ var rr2 = (dd - 1) / .45; AL[kk] += .14 * Math.exp(-rr2 * rr2); }
          else if (dd < 1) AL[kk] -= .05 * (1 - dd);
        }
      }
    }

    /* Suaviza el relieve (dos pasadas 3×3) para que los bordes no escalonen */
    var TMP = new Float32Array(N);
    for (var pas = 0; pas < 2; pas++){
      for (j = 0; j < TH; j++){
        var ja = Math.max(0, j - 1), jb = Math.min(TH - 1, j + 1);
        for (i = 0; i < TW; i++){
          var ia = (i - 1 + TW) % TW, ib = (i + 1) % TW;
          TMP[j * TW + i] = (HT[ja * TW + ia] + HT[ja * TW + i] + HT[ja * TW + ib] + HT[j * TW + ia] + HT[j * TW + i] * 2 + HT[j * TW + ib] + HT[jb * TW + ia] + HT[jb * TW + i] + HT[jb * TW + ib]) / 10;
        }
      }
      var sw = HT; HT = TMP; TMP = sw;
    }
    TMP = null;

    /* Gradientes (este / norte) en unidades angulares */
    var dLon = TAU / TW, dLat = PI / TH;
    for (j = 0; j < TH; j++){
      var cl = Math.max(.18, cLat[j]), jn = Math.max(0, j - 1), js = Math.min(TH - 1, j + 1);
      for (i = 0; i < TW; i++){
        var ie = (i + 1) % TW, iw = (i - 1 + TW) % TW, q = j * TW + i;
        GE[q] = (HT[j * TW + ie] - HT[j * TW + iw]) / (2 * dLon * cl);
        GN[q] = (HT[jn * TW + i] - HT[js * TW + i]) / ((js - jn) * dLat);
      }
    }
    HT = null;

    /* Rampa de plata: sombra azul marino → #6B7380 → #C0C0C0 → #F4F6F9 */
    var LR = new Uint8ClampedArray(256), LG = new Uint8ClampedArray(256), LB = new Uint8ClampedArray(256);
    var paradas = [[0, 6, 20, 56], [.1, 12, 36, 84], [.26, 52, 64, 96], [.44, 107, 115, 128], [.64, 160, 164, 172], [.8, 192, 192, 192], [.92, 226, 230, 236], [1, 244, 246, 249]];
    for (var v = 0; v < 256; v++){
      var t = v / 255, p = 1;
      while (p < paradas.length - 1 && paradas[p][0] < t) p++;
      var A0 = paradas[p - 1], B0 = paradas[p], u = (t - A0[0]) / (B0[0] - A0[0]);
      u = Math.max(0, Math.min(1, u));
      LR[v] = A0[1] + (B0[1] - A0[1]) * u; LG[v] = A0[2] + (B0[2] - A0[2]) * u; LB[v] = A0[3] + (B0[3] - A0[3]) * u;
    }

    /* Tabla por píxel: normal, base local (este/norte), latitud y longitud inicial */
    var BETA = .34, GAMMA = -.38;                 /* polo norte hacia el espectador e inclinación en pantalla */
    var cb = Math.cos(BETA), sb = Math.sin(BETA), cg = Math.cos(GAMMA), sg = Math.sin(GAMMA);
    /* eje del cuerpo en vista (y hacia arriba): Rz(γ)·Rx(β)·(0,1,0) */
    var ax = -sg * cb, ay = cg * cb, az = sb;
    var PX = [];
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++){
      var nx = (x + .5) / S * 2 - 1, ny = 1 - (y + .5) / S * 2, q2 = nx * nx + ny * ny;
      if (q2 >= 1) continue;
      var nz = Math.sqrt(1 - q2);
      /* a coordenadas del cuerpo: Rx(-β)·Rz(-γ) */
      var x1 = nx * cg + ny * sg, y1 = -nx * sg + ny * cg;
      var by = y1 * cb + nz * sb, bz = -y1 * sb + nz * cb, bx = x1;
      var lat = Math.asin(Math.max(-1, Math.min(1, by)));
      var lon = Math.atan2(bx, bz);
      /* este = eje × n ; norte = n × este */
      var ex = ay * nz - az * ny, ey = az * nx - ax * nz, ez = ax * ny - ay * nx, el = Math.hypot(ex, ey, ez) || 1;
      ex /= el; ey /= el; ez /= el;
      var nox = ny * ez - nz * ey, noy = nz * ex - nx * ez, noz = nx * ey - ny * ex;
      var fyr = Math.min(TH - 1.001, Math.max(0, (.5 - lat / PI) * TH - .5));
      var row = Math.floor(fyr), fy = fyr - row;
      var rr = Math.sqrt(q2), filo = Math.min(1, (1 - rr) * S * .5);
      var fr = 1 - nz;
      PX.push(y * S + x, row * TW, lon / TAU, nx, ny, nz, ex, ey, ez, nox, noy, noz, fr * fr * fr, filo * 255, fy, 0);
    }
    var NP = PX.length / 16, T = new Float32Array(PX);
    PX = null;
    var RELIEVE = 1.1;

    function pinta(t, azL){
      /* Luz principal arriba a la izquierda, algo rasante para que el relieve se lea */
      var elv = .58, Lx = Math.cos(elv) * Math.cos(azL), Ly = Math.cos(elv) * Math.sin(azL), Lz = Math.sin(elv);
      var Hx = Lx, Hy = Ly, Hz = Lz + 1, hl = Math.hypot(Hx, Hy, Hz); Hx /= hl; Hy /= hl; Hz /= hl;
      var giro = t / TAU;
      for (var n = 0, o = 0; n < NP; n++, o += 16){
        /* muestreo bilineal del relieve: sin escalones en las paredes de los cráteres */
        var u = T[o + 2] - giro; u -= Math.floor(u);
        var uc = u * TW - .5; if (uc < 0) uc += TW;
        var c0 = uc | 0, fx = uc - c0, c1 = c0 + 1; if (c1 >= TW) c1 = 0;
        var r0 = T[o + 1], r1 = r0 + TW, fy = T[o + 14];
        var w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        var a = r0 + c0, b = r0 + c1, c = r1 + c0, d = r1 + c1;
        var ge = (GE[a] * w00 + GE[b] * w10 + GE[c] * w01 + GE[d] * w11) * RELIEVE;
        var gn = (GN[a] * w00 + GN[b] * w10 + GN[c] * w01 + GN[d] * w11) * RELIEVE;
        var al = AL[a] * w00 + AL[b] * w10 + AL[c] * w01 + AL[d] * w11;
        var mx = T[o + 3] - ge * T[o + 6] - gn * T[o + 9];
        var my = T[o + 4] - ge * T[o + 7] - gn * T[o + 10];
        var mz = T[o + 5] - ge * T[o + 8] - gn * T[o + 11];
        var inv = 1 / Math.sqrt(mx * mx + my * my + mz * mz);
        mx *= inv; my *= inv; mz *= inv;
        var di = mx * Lx + my * Ly + mz * Lz;
        di = di > -.1 ? (di + .1) / 1.1 : 0;
        var s = mx * Hx + my * Hy + mz * Hz; s = s > 0 ? s : 0;
        var s2 = s * s, s4 = s2 * s2, s8 = s4 * s4, s16 = s8 * s8, s64 = s16 * s16; s64 *= s64;
        var val = al * (.03 + .84 * di) + s4 * .06 * di;
        var idx = val * 255; idx = idx < 0 ? 0 : idx > 255 ? 255 : idx | 0;
        var esp = s16 * .32 + s64 * .9;
        var rim = T[o + 12] * (1 - di * .6);
        var p = T[o];
        var k4 = p * 4;
        D[k4]     = LR[idx] + esp * 255 + rim * 70;
        D[k4 + 1] = LG[idx] + esp * 255 + rim * 125;
        D[k4 + 2] = LB[idx] + esp * 255 + rim * 225;
        D[k4 + 3] = T[o + 13];
      }
      ctx.putImageData(img, 0, 0);
    }
    return { canvas: cv, pinta: pinta };
  }

  /* ── Anillo de luz alrededor de la luna (se compone sobre el cuadro) ── */
  function crearAnillo(fuente, S, chispa){
    var W = Math.round(S * 1.8), cv = document.createElement('canvas');
    cv.width = cv.height = W;
    var c = cv.getContext('2d');
    if (!c) return null;
    var cx = W / 2, cy = W / 2, RX = S * .8, RY = RX * Math.sin(.34) * .92, ROT = .38;
    function arco(a0, a1, rx, ry, ancho, color){
      c.beginPath();
      c.ellipse(cx, cy, rx, ry, ROT, a0, a1);
      c.lineWidth = ancho; c.strokeStyle = color; c.stroke();
    }
    function mitad(a0, a1){
      arco(a0, a1, RX * 1.13, RY * 1.13, S * .006, 'rgba(192,192,192,.28)');
      arco(a0, a1, RX, RY, S * .07, 'rgba(79,134,230,.09)');
      arco(a0, a1, RX, RY, S * .03, 'rgba(79,134,230,.2)');
      arco(a0, a1, RX, RY, S * .014, 'rgba(192,198,210,.62)');
      arco(a0, a1, RX, RY, S * .005, 'rgba(244,246,249,.95)');
    }
    function brillo(psi){
      /* destello que viaja: tramo brillante + chispa */
      c.lineCap = 'round';
      arco(psi - .5, psi, RX, RY, S * .012, 'rgba(244,246,249,.35)');
      arco(psi - .22, psi, RX, RY, S * .016, 'rgba(255,255,255,.75)');
      c.lineCap = 'butt';
      if (chispa && chispa.complete && chispa.naturalWidth){
        var ex = RX * Math.cos(psi), ey = RY * Math.sin(psi);
        var px = cx + ex * Math.cos(ROT) - ey * Math.sin(ROT), py = cy + ex * Math.sin(ROT) + ey * Math.cos(ROT);
        var z = S * .42;
        c.drawImage(chispa, px - z / 2, py - z / 2, z, z);
      }
    }
    function pinta(psi){
      c.clearRect(0, 0, W, W);
      psi = ((psi % TAU) + TAU) % TAU;
      var atras = psi > PI;                         /* la mitad superior queda detrás de la luna */
      mitad(PI, TAU);
      if (atras) brillo(psi);
      c.drawImage(fuente, cx - S / 2, cy - S / 2);
      mitad(0, PI);
      if (!atras) brillo(psi);
    }
    return { canvas: cv, pinta: pinta, W: W };
  }

  /* ── Adornos: dónde va cada luna (la esquina se ajusta para no tocar texto) ── */
  var SITIOS = [
    { sel: '#invite',          esq: 'tr', tam: 116 },
    { sel: '#countdown',       esq: 'tl', tam: 196, anillo: true },
    { sel: '#location',        esq: 'br', tam: 112 },
    { sel: '#dresscode',       esq: 'tl', tam: 104 },
    { sel: '#family',          esq: 'tr', tam: 110 },
    { sel: '#footer',          esq: 'tr', tam: 180, anillo: true }
  ];

  /* Lunas PNG que ya existen (adornos de la sección): la mitad, máx. 4, se vuelven lunas vivas.
     Se prefieren las nítidas; la luna viva toma su esquina y su tamaño. */
  function convierteLunas(){
    var lunas = [].slice.call(document.querySelectorAll('section > img.adx, footer > img.adx')).filter(function(im){
      return /luna|moon/i.test(im.getAttribute('src') || '');
    });
    lunas.sort(function(a, b){ return (b.classList.contains('adx-s') ? 1 : 0) - (a.classList.contains('adx-s') ? 1 : 0); });
    var cuantas = Math.min(4, Math.floor(lunas.length / 2)), out = [], usados = [];
    for (var i = 0; i < lunas.length && out.length < cuantas; i++){
      var im = lunas[i], host = im.parentElement;
      if (usados.indexOf(host) > -1) continue;
      var st = im.style, v = (st.bottom && st.bottom !== 'auto') ? 'b' : 't', h = (st.left && st.left !== 'auto') ? 'l' : 'r';
      var w = parseFloat(st.width) || im.width || 120;
      usados.push(host);
      out.push({ host: host, s: { esq: v + h, tam: Math.round(Math.max(96, Math.min(150, w * .84))) } });
      im.remove();
    }
    return out;
  }

  /* Solo cuenta lo que se lee o se toca: textos, botones, fotos, QR (los fondos de tarjeta no) */
  function textosDe(host){
    var out = [], rg = document.createRange();
    function mete(r){ if (r.width > 0 && r.height > 0) out.push(r); }
    host.querySelectorAll('*').forEach(function(el){
      if (el.closest('.gl-clip') || el.closest('[aria-hidden="true"]')) return;
      var cs = null;
      function oculto(){ cs = cs || getComputedStyle(el); return cs.visibility === 'hidden' || cs.display === 'none'; }
      if (/^(IMG|BUTTON|A|INPUT|SELECT|TEXTAREA|IFRAME|VIDEO|CANVAS)$/.test(el.tagName)){
        if (!oculto()) mete(el.getBoundingClientRect());
        return;
      }
      /* texto: la caja real de cada línea, no el bloque completo */
      for (var c = el.firstChild; c; c = c.nextSibling){
        if (c.nodeType !== 3 || !c.nodeValue.trim()) continue;
        if (oculto()) return;
        rg.selectNodeContents(c);
        [].forEach.call(rg.getClientRects(), mete);
      }
    });
    return out;
  }

  function choca(a, lista, m){
    for (var i = 0; i < lista.length; i++){
      var b = lista[i];
      if (a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m) return true;
    }
    return false;
  }

  function init(){
    if (document.querySelector('.gl-clip')) return;
    var hosts = convierteLunas().map(function(c){ return { h: c.host, s: c.s }; });
    SITIOS.forEach(function(s){
      var h = document.querySelector(s.sel);
      if (!h) return;
      for (var i = 0; i < hosts.length; i++) if (hosts[i].h === h) return;
      hosts.push({ h: h, s: s });
    });
    if (!hosts.length) return;

    var DPR = Math.min(2, window.devicePixelRatio || 1);
    var S = Math.max(150, Math.min(232, Math.round(118 * DPR)));
    var motor = crearMotorLuna(S);
    if (!motor) return;
    var chispa = new Image();
    chispa.src = 'assets/flare-plata-mini.webp';
    var anillo = null;

    var orbes = hosts.map(function(o, k){
      var h = o.h, s = o.s;
      if (getComputedStyle(h).position === 'static') h.style.position = 'relative';
      var clip = document.createElement('div');
      clip.className = 'gl-clip';
      clip.setAttribute('aria-hidden', 'true');
      var orb = document.createElement('div');
      orb.className = 'gl-orb gl-' + s.esq + (s.anillo ? ' gl-ring' : '');
      orb.style.setProperty('--tam', s.tam + 'px');
      orb.style.setProperty('--t', (8.5 + (k % 3) * 1.3) + 's');
      orb.style.setProperty('--d', (-k * 2.1).toFixed(1) + 's');
      var fl = document.createElement('div'); fl.className = 'gl-orb-f';
      var halo = document.createElement('span'); halo.className = 'gl-orb-halo';
      var cv = document.createElement('canvas');
      var W = s.anillo ? Math.round(S * 1.8) : S;
      cv.width = cv.height = W;
      var ctx = cv.getContext('2d');
      if (k % 2) ctx.setTransform(-1, 0, 0, 1, W, 0);   /* la siguiente gira y se ilumina al revés */
      fl.appendChild(halo); fl.appendChild(cv);
      /* destellos donde pega la luz: brillo especular y filo */
      var f1 = document.createElement('i'), f2 = document.createElement('i');
      f1.className = 'kx-flare is-mini gl-f1'; f2.className = 'kx-flare is-mini gl-f2';
      f1.appendChild(document.createElement('b')); f2.appendChild(document.createElement('b'));
      f1.style.setProperty('--dur', (5.6 + k * .37).toFixed(2) + 's');
      f1.style.setProperty('--del', (-((k * .618034) % 1) * 6).toFixed(2) + 's');
      f2.style.setProperty('--dur', (7.1 + k * .29).toFixed(2) + 's');
      f2.style.setProperty('--del', (-(((k + .5) * .618034) % 1) * 7).toFixed(2) + 's');
      if (k % 2) orb.classList.add('gl-mirror');
      fl.appendChild(f1); fl.appendChild(f2);
      orb.appendChild(fl);
      clip.appendChild(orb);
      h.insertBefore(clip, h.firstChild);
      if (s.anillo && !anillo) anillo = crearAnillo(motor.canvas, S, chispa);
      return { host: h, clip: clip, el: orb, cv: cv, ctx: ctx, W: W, anillo: !!s.anillo, ve: false, listo: false, esq: s.esq, tam: s.tam };
    });

    /* Coloca cada luna en su esquina; si toca texto, la empuja hacia afuera; si no cabe, se oculta */
    function acomoda(o){
      var hr = o.host.getBoundingClientRect();
      if (!hr.width || !hr.height) return;
      var lista = textosDe(o.host), T = o.tam;
      var rx = T * (o.anillo ? .46 : .43), ry = T * (o.anillo ? .3 : .43);
      var lado = o.esq.charAt(1), abajo = o.esq.charAt(0) === 'b';
      var lados = [lado, lado === 'r' ? 'l' : 'r'];
      var pasoY = 22, filas = Math.max(1, Math.floor((hr.height - T * .3) / pasoY));
      var elegido = null;
      /* recorre la orilla preferida desde su esquina; luego la otra; primero asomando más, luego menos */
      [.56, .46, .38].some(function(vis){
        return lados.some(function(ld){
          for (var f = 0; f <= filas; f++){
            var cy = abajo ? hr.height - T * .32 - f * pasoY : T * .32 + f * pasoY;
            if (cy < -T * .1 || cy > hr.height + T * .1) continue;
            var cx = ld === 'r' ? hr.width - T * vis + T / 2 : T * vis - T / 2;
            var X = hr.left + cx, Y = hr.top + cy;
            var caja = { left: Math.max(hr.left, X - rx), right: Math.min(hr.right, X + rx), top: Math.max(hr.top, Y - ry), bottom: Math.min(hr.bottom, Y + ry) };
            if (!choca(caja, lista, 8)){ elegido = [cx - T / 2, cy - T / 2]; return true; }
          }
          return false;
        });
      });
      if (elegido){
        o.el.style.left = elegido[0].toFixed(1) + 'px';
        o.el.style.top = elegido[1].toFixed(1) + 'px';
      }
      o.el.classList.toggle('gl-off', !elegido);
      if (!o.listo){ o.listo = true; requestAnimationFrame(function(){ o.el.classList.add('is-in'); }); }
    }

    var th = 1.1, psi = 2.2, raf = 0, last = 0, lastDraw = 0, azBase = 2.42, azSuave = 2.42, tiempo = 0;
    function luz(){
      var doc = document.documentElement, alto = Math.max(1, doc.scrollHeight - innerHeight);
      var pr = Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / alto));
      return azBase + .22 * Math.sin(tiempo * .21) - .35 + pr * .7;   /* la luz gira con la lectura */
    }
    function dibuja(todas){
      motor.pinta(th, azSuave);
      if (anillo) anillo.pinta(psi);
      orbes.forEach(function(o){
        if (!todas && !o.ve) return;
        var src = o.anillo ? anillo.canvas : motor.canvas;
        o.ctx.clearRect(0, 0, o.W, o.W);
        o.ctx.drawImage(src, 0, 0);
      });
    }
    function hayVisibles(){ for (var i = 0; i < orbes.length; i++) if (orbes[i].ve) return true; return false; }
    function loop(now){
      raf = 0;
      if (document.hidden || !hayVisibles()){ last = 0; return; }
      var dt = last ? Math.min((now - last) / 1000, .05) : .016;
      last = now;
      tiempo += dt;
      th = (th + .085 * dt) % TAU;                 /* una vuelta cada ~74 s */
      psi = (psi + .62 * dt) % TAU;
      azSuave += (luz() - azSuave) * (1 - Math.exp(-dt / .9));
      if (now - lastDraw > 30){ lastDraw = now; dibuja(false); }
      raf = requestAnimationFrame(loop);
    }
    function arranca(){ if (!RM && !raf && !document.hidden && hayVisibles()) raf = requestAnimationFrame(loop); }

    /* primer cuadro: la chispa del anillo puede llegar después */
    dibuja(true);
    chispa.onload = function(){ dibuja(true); };

    var porAcomodar = function(o){ setTimeout(function(){ acomoda(o); }, 650); };
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(E){
        E.forEach(function(e){
          orbes.forEach(function(o){
            if (o.clip !== e.target) return;
            o.ve = e.isIntersecting;
            if (o.ve && !o.listo) porAcomodar(o);
          });
        });
        arranca();
      }, { rootMargin: '60px 0px' });
      orbes.forEach(function(o){ io.observe(o.clip); });
    } else {
      orbes.forEach(function(o){ o.ve = true; acomoda(o); });
    }
    document.addEventListener('visibilitychange', arranca);
    var tr = 0;
    window.addEventListener('resize', function(){
      clearTimeout(tr);
      tr = setTimeout(function(){ orbes.forEach(function(o){ if (o.listo) acomoda(o); }); }, 220);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ orbes.forEach(function(o){ if (o.listo) acomoda(o); }); });
  }

  function arrancaCuandoListo(){
    /* el motor calcula su relieve una vez: se hace en un momento libre */
    var go = function(){ try { init(); } catch (e) { if (window.console) console.warn('D-vivo', e); } };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 });
    else setTimeout(go, 300);
  }
  if (document.readyState === 'complete') arrancaCuandoListo();
  else window.addEventListener('load', arrancaCuandoListo);
})();
</script>
