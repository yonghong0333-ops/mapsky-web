/* 首頁「最新消息」：把「活動」頁的活動卡片貼到最前面（資料來源同 /api/events/config） */
(function () {
  function done() { window.__msHomeEventsPending = false; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function parseTW(s) {
    if (!s) return null;
    var m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }
  function status(ev) {
    var now = new Date(), a = parseTW(ev.saleStart), b = parseTW(ev.saleEnd);
    if (a && now < a) return '尚未開賣';
    if (b && now > b) return '販售結束';
    return '';
  }
  function go(id) {
    var u = '/events/detail?event=' + encodeURIComponent(id || 'qx-exam');
    (window.MapSkyGo || function (x) { location.href = x; })(u);
  }

  var CSS =
    '.home-events{display:grid;gap:18px;margin:0 0 18px;}' +
    '.home-event-card{position:relative;border-radius:22px;overflow:hidden;background:#0a0a0a;border:1px solid rgba(0,0,0,.06);box-shadow:0 8px 28px rgba(0,0,0,.08);animation:homeEvIn .5s cubic-bezier(.2,.8,.2,1) both;}' +
    '.home-event-card img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#111;}' +
    '.home-event-body{padding:16px 16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0a0a0a;}' +
    '.home-event-body h3{margin:0;font-size:17px;font-weight:650;letter-spacing:-.015em;color:#fff;}' +
    '.home-event-body .sub{margin:3px 0 0;font-size:12px;color:rgba(255,255,255,.5);}' +
    '.home-event-btn{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;border-radius:980px;border:0;background:#fff;color:#0a0a0a;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;}' +
    '.home-event-btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '@keyframes homeEvIn{from{opacity:0;transform:translate3d(0,14px,0);}}' +
    '@media (prefers-reduced-motion:reduce){.home-event-card{animation:none;}}';

  function isDatePill(el) {
    return el.children.length === 0 && /^\s*\d{4}\.\d{2}\s*$/.test(el.textContent || '');
  }
  function countPills(node) {
    var n = 0, all = node.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) if (isDatePill(all[i])) n++;
    return n;
  }
  function insertBox(sec, box) {
    var all = sec.querySelectorAll('*'), pill = null;
    for (var i = 0; i < all.length; i++) { if (isDatePill(all[i])) { pill = all[i]; break; } }
    if (!pill) { sec.appendChild(box); return; }
    var card = pill;
    while (card.parentNode && card.parentNode !== sec && countPills(card.parentNode) < 2) card = card.parentNode;
    card.parentNode.insertBefore(box, card);
  }

  try {
    var sec = document.getElementById('news');
    if (!sec) { done(); return; }
    fetch('/api/events/config', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var list = (j && j.ok && Array.isArray(j.events) ? j.events : []).filter(function (e) {
          return e && e.enabled !== false && status(e) !== '販售結束';
        });
        if (!list.length) return;
        if (!document.getElementById('homeEventsCss')) {
          var st = document.createElement('style');
          st.id = 'homeEventsCss';
          st.textContent = CSS;
          document.head.appendChild(st);
        }
        var box = document.createElement('div');
        box.className = 'home-events';
        box.id = 'homeEvents';
        box.innerHTML = list.map(function (ev) {
          var lbl = status(ev);
          var sub = (lbl ? lbl + (ev.sub ? ' · ' : '') : '') + (ev.sub || '選場次 · 選禮包 · 付款');
          return '<article class="home-event-card" data-event-id="' + esc(ev.id) + '">' +
            '<img src="' + esc(ev.cover || '/assets/qx-cover.svg') + '" alt="' + esc(ev.title) + '" />' +
            '<div class="home-event-body"><div><h3>' + esc(ev.title || '活動') + '</h3><p class="sub">' + esc(sub) + '</p></div>' +
            '<button type="button" class="home-event-btn" data-ev="' + esc(ev.id) + '"' + (lbl ? ' disabled' : '') + '>' +
            esc(lbl || ev.ticketLabel || '查看詳情') + '</button></div></article>';
        }).join('');
        box.addEventListener('click', function (e) {
          var card = e.target.closest && e.target.closest('.home-event-card');
          if (!card) return;
          var btn = card.querySelector('.home-event-btn');
          if (btn && btn.disabled) return;
          go(card.getAttribute('data-event-id'));
        });
        insertBox(sec, box);
        // 等封面圖載好再放行開機畫面，避免版面跳動
        var img = box.querySelector('img');
        if (img && !img.complete) {
          return new Promise(function (res) { img.onload = img.onerror = res; setTimeout(res, 1200); });
        }
      })
      .catch(function () {})
      .then(done);
  } catch (e) { done(); }
})();
