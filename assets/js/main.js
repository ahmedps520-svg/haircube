/* Haircube — language, the cube, opening status, the booking dock. No dependencies.
   Booking itself is Mamar Booking's embed (loaded in <head>): every [data-mamar-book] opens it. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'haircube-lang';

  /* ---------- language: Arabic in the markup, English in data-en ---------- */
  var texts = D.querySelectorAll('[data-en]');
  texts.forEach(function (el) {
    if (!el.hasAttribute('data-ar')) el.setAttribute('data-ar', el.textContent);
  });
  var arias = D.querySelectorAll('[data-en-aria]');
  arias.forEach(function (el) { el.setAttribute('data-ar-aria', el.getAttribute('aria-label') || ''); });
  var langTx = D.getElementById('langTx'), langBtn = D.getElementById('langBtn');

  function setLang(lang, persist) {
    var ar = lang !== 'en';
    H.lang = ar ? 'ar' : 'en';
    H.dir = ar ? 'rtl' : 'ltr';
    texts.forEach(function (el) {
      var v = el.getAttribute(ar ? 'data-ar' : 'data-en');
      if (v == null) return;
      if (/<a\s/.test(v)) el.innerHTML = v; else el.textContent = v;      // only the credit line carries a link
    });
    arias.forEach(function (el) { el.setAttribute('aria-label', el.getAttribute(ar ? 'data-ar-aria' : 'data-en-aria')); });
    if (langTx) langTx.textContent = ar ? 'EN' : 'ع';
    if (langBtn) langBtn.setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل إلى العربية');
    D.title = ar ? 'هيركيوب — صالون حلاقة رجالي في حي النعيم، جدة | Haircube' : 'Haircube — men’s barbershop in Al Naeem, Jeddah';
    if (persist) { try { localStorage.setItem(KEY, H.lang); } catch (e) {} }
    paintStatus();
    cube();
  }
  if (langBtn) langBtn.addEventListener('click', function () { setLang(H.lang === 'ar' ? 'en' : 'ar', true); });
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'en') setLang('en', false);

  /* ---------- open now? (Jeddah time) ---------- */
  // weekday 0 = Sunday. Minutes after midnight.
  var HOURS = { 0: null, 1: [900, 1380], 2: [900, 1380], 3: [900, 1380], 4: [900, 1410], 5: [900, 1410], 6: [900, 1380] };
  var DAY = { ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  function riyadhNow() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: (+p.hour) * 60 + (+p.minute) };
  }
  function clock(min, ar) {
    var h = Math.floor(min / 60) % 24, m = min % 60, pm = h >= 12, h12 = h % 12 || 12;
    var s = h12 + ':' + (m < 10 ? '0' : '') + m;
    if (ar) return s.replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }) + (pm ? ' م' : ' ص');
    return s + (pm ? ' PM' : ' AM');
  }
  var statusEl = D.getElementById('status');
  function paintStatus() {
    if (!statusEl) return;
    var ar = H.lang === 'ar', n = riyadhNow(), today = HOURS[n.day], txt, open = false;
    if (today && n.min >= today[0] && n.min < today[1]) {
      open = true;
      txt = ar ? 'مفتوح الآن · يغلق ' + clock(today[1], true) : 'Open now · closes ' + clock(today[1], false);
    } else if (today && n.min < today[0]) {
      txt = ar ? 'مغلق الآن · يفتح اليوم ' + clock(today[0], true) : 'Closed now · opens today at ' + clock(today[0], false);
    } else {
      var d = n.day, i = 0;
      do { d = (d + 1) % 7; i++; } while (!HOURS[d] && i < 7);
      var when = i === 1 ? (ar ? 'غداً' : 'tomorrow') : (ar ? DAY.ar[d] : DAY.en[d]);
      txt = ar ? 'مغلق الآن · يفتح ' + when + ' ' + clock(HOURS[d][0], true) : 'Closed now · opens ' + when + ' at ' + clock(HOURS[d][0], false);
    }
    statusEl.className = 'status' + (open ? ' is-open' : '');
    statusEl.textContent = '';
    statusEl.appendChild(D.createElement('i'));
    statusEl.appendChild(D.createTextNode(txt));
    D.querySelectorAll('.hours tr').forEach(function (tr) {
      tr.classList.toggle('is-today', (tr.getAttribute('data-days') || '').split(',').indexOf(String(n.day)) >= 0);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- the cube: depth in the logo's cream, a slight tilt as it passes ---------- */
  var cubeEl = D.getElementById('cube'), face = cubeEl && cubeEl.querySelector('.cube__face');
  var SHADES = ['#E4DED2', '#D2CCC0', '#BFB9AE', '#ABA59B', '#968F86', '#807A72', '#6A655E', '#55514B', '#423F3A'];   // the logo's cream, falling into stone
  function cube() {
    if (!face) return;
    var r = cubeEl.getBoundingClientRect(), vh = window.innerHeight || 800;
    var t = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / vh));       // -1 above … 1 below the middle
    var side = H.dir === 'rtl' ? -1 : 1;
    var depth = window.innerWidth >= 1000 ? 22 : 16;
    var dx = side * (1 - .45 * t), dy = 1 + .35 * t;
    var sh = [];
    for (var i = 1; i <= depth; i++) sh.push((dx * i).toFixed(1) + 'px ' + (dy * i).toFixed(1) + 'px 0 ' + SHADES[Math.min(SHADES.length - 1, Math.floor(i / depth * SHADES.length))]);
    sh.push((dx * (depth + 1.5)).toFixed(1) + 'px ' + (dy * (depth + 1.5)).toFixed(1) + 'px 0 #000');
    face.style.boxShadow = sh.join(',');
    if (!reduce) {
      cubeEl.style.setProperty('--rx', (t * 6).toFixed(2) + 'deg');
      cubeEl.style.setProperty('--ry', (-side * t * 7).toFixed(2) + 'deg');
    }
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      cube();
      top.classList.toggle('is-stuck', window.scrollY > 8);
    });
  }
  var top = D.getElementById('top');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  cube();

  /* ---------- their video: plays only while you can see it ---------- */
  var vid = D.getElementById('heroVideo');
  if (vid) {
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); });
      }, { threshold: .15 }).observe(vid);
    }
  }

  /* ---------- the dock: booking one thumb away once the hero button has scrolled off ---------- */
  var dock = D.getElementById('dock'), heroCta = D.querySelector('.hero__cta');
  if (dock && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { dock.classList.toggle('is-up', !e.isIntersecting && e.boundingClientRect.top < 0); });
    }).observe(heroCta);
  }
})();
