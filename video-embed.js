/* In-site YouTube player: any link to youtube.com/watch opens in a lightbox, at its timestamp. */
(function () {
  'use strict';
  var css = '' +
    '.yt-ov{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top,0px)) 16px max(16px,env(safe-area-inset-bottom,0px));background:rgba(10,6,3,.92)}' +
    '.yt-ov.open{display:flex;animation:ytfade .25s}' +
    '@keyframes ytfade{from{opacity:0}to{opacity:1}}' +
    '.yt-box{width:min(1080px,100%);display:grid;gap:12px}' +
    '.yt-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;color:#f1cd7c;font:700 11px/1.3 Lato,Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}' +
    '.yt-bar a{color:#c9b595;text-decoration:none;border-bottom:1px solid rgba(217,164,65,.5)}' +
    '.yt-bar a:hover{color:#f1cd7c}' +
    '.yt-x{background:none;border:1px solid #8d6a22;color:#f1cd7c;border-radius:999px;font:700 11px Lato,Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:9px 16px;cursor:pointer}' +
    '.yt-x:hover{border-color:#d9a441;background:rgba(217,164,65,.14)}' +
    '.yt-x:focus-visible,.yt-bar a:focus-visible{outline:3px solid #d9a441;outline-offset:3px}' +
    '.yt-frame{position:relative;aspect-ratio:16/9;background:#000;border-radius:14px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 0 1px rgba(217,164,65,.35)}' +
    '.yt-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    'a.yt-ts::before{content:"\\25B6\\00a0";font-size:.8em}' +
    'a.yt-ts .yt-t{opacity:.75;font-variant-numeric:tabular-nums}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov = document.createElement('div');
  ov.className = 'yt-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Video player');
  ov.innerHTML = '<div class="yt-box"><div class="yt-bar"><a class="yt-yt" target="_blank" rel="noopener">Open on YouTube &#8599;</a><button type="button" class="yt-x">Close &#10005;</button></div><div class="yt-frame"></div></div>';
  var frame = ov.querySelector('.yt-frame'), yl = ov.querySelector('.yt-yt'), xb = ov.querySelector('.yt-x');
  var last = null;

  function secs(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return +t;
    var m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
    return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  }
  function parse(a) {
    var u; try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (!/(^|\.)youtube\.com$/.test(u.hostname) || u.pathname !== '/watch') return null;
    var v = u.searchParams.get('v'); if (!v) return null;
    return { v: v, s: secs(u.searchParams.get('t') || u.searchParams.get('start')) };
  }
  function mmss(s) {
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return (h ? h + ':' + p(m) : m) + ':' + p(x);
  }
  function open(info, from) {
    last = from || null;
    var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(info.v) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1' + (info.s ? '&start=' + info.s : '');
    frame.innerHTML = '<iframe src="' + src + '" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    yl.href = 'https://www.youtube.com/watch?v=' + info.v + (info.s ? '&t=' + info.s + 's' : '');
    ov.classList.add('open'); document.documentElement.style.overflow = 'hidden'; xb.focus();
  }
  function close() {
    ov.classList.remove('open'); frame.innerHTML = ''; document.documentElement.style.overflow = '';
    if (last && last.focus) last.focus();
  }

  function init() {
    document.body.appendChild(ov);
    // mark timestamped quote links so visitors can see they play at a moment
    var as = document.querySelectorAll('a[href*="youtube.com/watch"]');
    for (var i = 0; i < as.length; i++) {
      var inf = parse(as[i]); if (!inf) continue;
      if (as[i].closest('cite') && inf.s) {
        as[i].classList.add('yt-ts');
        var sp = document.createElement('span'); sp.className = 'yt-t'; sp.textContent = ' · ' + mmss(inf.s);
        as[i].appendChild(sp);
      }
    }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href*="youtube.com/watch"]');
      if (!a || ov.contains(a)) return;
      var info = parse(a); if (!info) return;
      e.preventDefault(); open(info, a);
    });
    xb.addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = [xb, yl]; var i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
