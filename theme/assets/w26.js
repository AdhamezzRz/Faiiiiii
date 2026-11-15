/* Faii — Winter 26 motion layer.
   One scroll loop, IntersectionObservers for everything else. Transform/opacity only. */
(function () {
  'use strict';
  var W = window.W26 || (window.W26 = { dropAt: 0 });
  var root = document.documentElement;
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var deskMq = window.matchMedia('(min-width: 990px)');
  var fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---------- Drop clock ---------- */
  function initClock() {
    var clocks = $$('[data-w26-countdown]').map(function (el) {
      var u = {};
      $$('[data-u]', el).forEach(function (n) { u[n.getAttribute('data-u')] = $$('i', n); });
      return u;
    });
    var last = {};
    function put(key, val) {
      if (last[key] === val) return;
      last[key] = val;
      var str = val < 10 ? '0' + val : String(val);
      clocks.forEach(function (u) {
        var cells = u[key];
        if (!cells || !cells.length) return;
        if (cells.length === 2) { cells[0].textContent = str.charAt(str.length - 2); cells[1].textContent = str.charAt(str.length - 1); }
      });
    }
    function tick() {
      if (!W.dropAt) return;
      var left = W.dropAt - Date.now();
      if (left <= 0) {
        var wasLive = root.classList.contains('w26-live');
        root.classList.add('w26-live');
        put('d', 0); put('h', 0); put('m', 0); put('s', 0);
        if (!wasLive && document.querySelector('[data-w26-locked]')) setTimeout(function () { location.reload(); }, 2500);
        return;
      }
      var s = Math.floor(left / 1000);
      put('d', Math.min(99, Math.floor(s / 86400)));
      put('h', Math.floor((s % 86400) / 3600));
      put('m', Math.floor((s % 3600) / 60));
      put('s', s % 60);
      setTimeout(tick, 1000 - (Date.now() % 1000) + 20);
    }
    tick();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$('[data-w26-reveal], [data-w26-develop]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMq.matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero entrance ---------- */
  function initHero() {
    var hero = document.querySelector('[data-w26-hero]');
    if (!hero) return null;
    var go = function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); };
    if (root.classList.contains('w26-preload')) {
      document.addEventListener('w26:intro', go, { once: true });
      setTimeout(go, 6200);
    } else if (document.fonts && document.fonts.ready) {
      var done = false;
      var once = function () { if (!done) { done = true; go(); } };
      document.fonts.ready.then(once);
      setTimeout(once, 900);
    } else { go(); }
    var v = hero.querySelector('video');
    if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    return hero;
  }

  /* ---------- Films: load and play only while on screen ---------- */
  function initFilms() {
    var vids = $$('video[data-w26-video]');
    if (!vids.length) return;
    var play = function (v) {
      if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting && e.intersectionRatio >= 0.35) { if (!reduceMq.matches) play(v); }
          else if (!v.paused) { v.pause(); }
        });
      }, { threshold: [0, 0.35, 0.7] });
      vids.forEach(function (v) { io.observe(v); });
    }
    $$('[data-w26-player]').forEach(function (box) {
      var v = box.querySelector('video');
      var btn = box.querySelector('[data-w26-sound]');
      if (!v || !btn) return;
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        if (on) {
          $$('[data-w26-sound][aria-pressed="true"]').forEach(function (b) {
            b.setAttribute('aria-pressed', 'false');
            var ov = b.parentNode.querySelector('video'); if (ov) ov.muted = true;
          });
        }
        v.muted = !on;
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) play(v);
      });
    });
  }

  /* ---------- Pieces: image that follows the cursor ---------- */
  function initPieces() { $$('[data-w26-pieces]').forEach(initPiecesList); }
  function initPiecesList(list) {
    if (!list || !fineMq.matches || !deskMq.matches || reduceMq.matches) return;
    var rows = $$('.w26-piece[data-preview]', list);
    if (!rows.length) return;
    var box = document.createElement('div');
    box.className = 'w26-pieces__preview';
    box.setAttribute('aria-hidden', 'true');
    var imgs = rows.map(function (r) {
      var im = new Image();
      im.decoding = 'async'; im.loading = 'lazy'; im.alt = '';
      im.src = r.getAttribute('data-preview');
      box.appendChild(im);
      return im;
    });
    document.body.appendChild(box);
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false, shownAt = 0;
    function loop() {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = on || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    }
    function aim(e) {
      var w = box.offsetWidth, h = box.offsetHeight;
      tx = clamp(e.clientX + 28, 8, window.innerWidth - w - 8);
      ty = clamp(e.clientY - h * 0.55, 8, window.innerHeight - h - 8);
    }
    rows.forEach(function (r, i) {
      r.addEventListener('pointerenter', function (e) {
        imgs.forEach(function (im, j) { im.classList.toggle('is-active', i === j); });
        aim(e);
        if (!on) { x = tx; y = ty; }
        on = true; shownAt = window.pageYOffset; box.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    list.addEventListener('pointermove', function (e) {
      aim(e);
      if (!on && e.target && e.target.closest && e.target.closest('.w26-piece')) {
        x = tx; y = ty; on = true; shownAt = window.pageYOffset; box.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      }
    }, { passive: true });
    list.addEventListener('pointerleave', function () { on = false; box.classList.remove('is-on'); });
    window.addEventListener('scroll', function () {
      if (on && Math.abs(window.pageYOffset - shownAt) > 80) { on = false; box.classList.remove('is-on'); }
    }, { passive: true });
  }

  /* ---------- Scroll-linked pieces: hero parallax, statement words, lookbook ---------- */
  function initScroll(hero) {
    var words = $$('[data-w26-words]').map(function (el) { return { el: el, items: $$('.w26-w', el), lit: -1 }; });
    var look = document.querySelector('[data-w26-look]');
    var track = look && look.querySelector('[data-w26-look-track]');
    var bar = look && look.querySelector('[data-w26-look-bar]');
    var pinned = false, travel = 0, ticking = false, heroP = -1;

    function measure() {
      if (!look || !track) return;
      var want = deskMq.matches && !reduceMq.matches && track.children.length > 2;
      if (want) {
        look.classList.add('is-pinned');
        track.style.transform = 'translate3d(0,0,0)';
        travel = Math.max(0, track.scrollWidth - window.innerWidth);
        look.style.setProperty('--w26-look-h', Math.round(travel + window.innerHeight) + 'px');
        pinned = travel > 40;
        if (!pinned) { look.classList.remove('is-pinned'); look.style.removeProperty('--w26-look-h'); track.style.transform = ''; }
      } else {
        pinned = false;
        look.classList.remove('is-pinned');
        look.style.removeProperty('--w26-look-h');
        track.style.transform = '';
      }
    }

    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      if (hero && deskMq.matches && !reduceMq.matches) {
        var hr = hero.getBoundingClientRect();
        if (hr.bottom > 0) {
          var p = clamp(-hr.top / Math.max(1, hr.height), 0, 1);
          if (Math.abs(p - heroP) > 0.002) { heroP = p; hero.style.setProperty('--p', p.toFixed(3)); }
        }
      }
      words.forEach(function (w) {
        var r = w.el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        var prog = clamp((vh * 0.86 - r.top) / (r.height + vh * 0.36), 0, 1);
        var n = Math.round(prog * w.items.length);
        if (n === w.lit) return;
        for (var i = 0; i < w.items.length; i++) w.items[i].classList.toggle('is-on', i < n);
        w.lit = n;
      });
      if (pinned) {
        var lr = look.getBoundingClientRect();
        var lp = clamp(-lr.top / Math.max(1, travel), 0, 1);
        track.style.transform = 'translate3d(' + (-lp * travel).toFixed(1) + 'px,0,0)';
        if (bar) bar.style.setProperty('--p', lp.toFixed(4));
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

    if (reduceMq.matches) words.forEach(function (w) { w.items.forEach(function (i) { i.classList.add('is-on'); }); });
    measure(); frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); frame(); }, 150); });
    window.addEventListener('load', function () { measure(); frame(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); frame(); });
    if (look && 'ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { measure(); frame(); }, 150); });
      ro.observe(track);
    }
  }

  /* ---------- Opening sequence ---------- */
  function initPreloader() {
    var el = document.querySelector('[data-w26-preloader]');
    var fire = function () { document.dispatchEvent(new CustomEvent('w26:intro')); };
    var drop = function () { if (el && el.parentNode) el.parentNode.removeChild(el); };
    if (!el || !root.classList.contains('w26-preload')) { drop(); fire(); return; }
    var imgs = $$('.w26-pre__stack img', el);
    var count = el.querySelector('[data-w26-pre-count]');
    var bar = el.querySelector('[data-w26-pre-bar]');
    var from = count ? parseInt(count.getAttribute('data-from'), 10) || 0 : 0;
    var to = count ? parseInt(count.getAttribute('data-to'), 10) || 100 : 100;
    var t0 = performance.now(), dur = 1900, lastFlick = -999, cur = -1;
    function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      if (count) count.textContent = String(Math.round(from + (to - from) * p));
      if (bar) bar.style.setProperty('--p', p.toFixed(3));
      if (imgs.length && now - lastFlick > 150) {
        for (var k = 1; k <= imgs.length; k++) {
          var n = (cur + k) % imgs.length;
          if (imgs[n].complete && imgs[n].naturalWidth) {
            if (cur >= 0) imgs[cur].classList.remove('is-on');
            imgs[n].classList.add('is-on'); cur = n; lastFlick = now; break;
          }
        }
      }
      if (p < 1) { requestAnimationFrame(step); return; }
      root.classList.add('w26-preload-out');
      fire();
      setTimeout(function () {
        root.classList.remove('w26-preload', 'w26-preload-out');
        drop();
      }, 1050);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Palette: one band open at a time ---------- */
  function initPalette() {
    $$('[data-w26-palette]').forEach(function (wrap) {
      var bands = $$('[data-w26-band]', wrap);
      function open(band) {
        bands.forEach(function (b) {
          var on = b === band;
          b.classList.toggle('is-open', on);
          var tab = b.querySelector('.w26-band__tab');
          if (tab) tab.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      }
      bands.forEach(function (band) {
        var tab = band.querySelector('.w26-band__tab');
        if (tab) tab.addEventListener('click', function () { open(band); });
        band.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'mouse' && deskMq.matches) open(band);
        });
      });
    });
  }

  /* ---------- Shop page: sorting ---------- */
  function initShopGrid() {
    $$('[data-w26-shopgrid]').forEach(function (sec) {
      var sel = sec.querySelector('[data-w26-sort]');
      if (sel) sel.addEventListener('change', function () {
        var u = new URL(window.location.href);
        u.searchParams.set('sort_by', sel.value);
        u.searchParams.delete('page');
        window.location.href = u.toString();
      });
    });
  }

  function boot() {
    W.ready = true;
    initShopGrid();
    initClock();
    initPalette();
    var hero = initHero();
    initReveal();
    initFilms();
    initPieces();
    initScroll(hero);
    initPreloader();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
