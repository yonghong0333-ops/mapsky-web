/* 首頁「最新消息」：舊消息整批換成活動卡片（同 /events 頁，資料來源 /api/events/config）
   流程：先放「讀取活動中」轉圈圈 → 資料回來淡出轉圈圈、淡入卡片（可左右滑）。 */
(function () {
  var CONFIG_KEY = 'mapsky_events_config_v1';
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
  function visible(events) {
    return (Array.isArray(events) ? events : []).filter(function (e) {
      return e && e.enabled !== false && status(e) !== '販售結束';
    });
  }

  var CSS =
    '.home-events-wrap{margin:0 0 18px;}' +
    '.home-events{display:flex;gap:14px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;padding:4px 0 18px;margin:-4px 0 -8px;}' +
    '.home-events::-webkit-scrollbar{display:none;}' +
    '.home-event-card{position:relative;flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;border-radius:22px;overflow:hidden;background:#0a0a0a;border:1px solid rgba(0,0,0,.06);box-shadow:0 8px 28px rgba(0,0,0,.08);animation:homeEvIn .5s cubic-bezier(.2,.8,.2,1) both;}' +
    '.home-events.multi .home-event-card{flex-basis:88%;}' +
    '.home-event-card img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#111;-webkit-user-drag:none;}' +
    '.home-event-body{padding:16px 16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#0a0a0a;}' +
    '.home-event-body h3{margin:0;font-size:17px;font-weight:650;letter-spacing:-.015em;color:#fff;}' +
    '.home-event-body .sub{margin:3px 0 0;font-size:12px;color:rgba(255,255,255,.5);}' +
    '.home-event-btn{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;border-radius:980px;border:0;background:#fff;color:#0a0a0a;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;}' +
    '.home-event-btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '.home-events-dots{display:flex;justify-content:center;gap:7px;margin-top:6px;}' +
    '.home-events-dots i{width:7px;height:7px;border-radius:50%;background:rgba(0,0,0,.18);transition:background .2s ease,transform .2s ease;}' +
    '.home-events-dots i.on{background:#1d1d1f;transform:scale(1.15);}' +
    '.home-events-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:300px;border-radius:22px;background:#f5f5f7;color:#6e6e73;font-size:14px;letter-spacing:.08em;animation:homeEvFade .35s ease both;transition:opacity .22s ease,transform .22s ease;}' +
    '.home-events-loading.leave{opacity:0;transform:scale(.97);}' +
    '.home-events-loading .sp{width:38px;height:38px;border-radius:50%;border:3.5px solid rgba(0,0,0,.1);border-top-color:#0A84FF;border-right-color:#5e5ce6;animation:homeEvSpin .8s linear infinite;}' +
    '.home-events-msg{text-align:center;padding:44px 20px;border-radius:22px;background:#f5f5f7;color:#6e6e73;font-size:14px;animation:homeEvFade .35s ease both;}' +
    '.home-events-msg strong{display:block;color:#1d1d1f;font-size:17px;margin-bottom:6px;}' +
    '.home-events-msg button{margin-top:14px;padding:9px 18px;border:0;border-radius:980px;background:#1d1d1f;color:#fff;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;}' +
    '@keyframes homeEvIn{from{opacity:0;transform:translate3d(0,14px,0);}}' +
    '@keyframes homeEvFade{from{opacity:0;}}' +
    '@keyframes homeEvSpin{to{transform:rotate(360deg);}}' +
    '@media (prefers-reduced-motion:reduce){.home-event-card{animation:none;}.home-events-loading .sp{animation-duration:2s;}}';

  function isDatePill(el) {
    return el.children.length === 0 && /^\s*\d{4}\.\d{2}\s*$/.test(el.textContent || '');
  }
  function countPills(node) {
    var n = 0, all = node.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) if (isDatePill(all[i])) n++;
    return n;
  }
  function cardOf(pill, sec) {
    var card = pill;
    while (card.parentNode && card.parentNode !== sec && countPills(card.parentNode) < 2) card = card.parentNode;
    return card;
  }
  // 把原本的舊消息卡片全部拿掉，換成 wrap
  function replaceNews(sec, wrap) {
    var all = sec.querySelectorAll('*'), cards = [];
    for (var i = 0; i < all.length; i++) {
      if (isDatePill(all[i])) {
        var c = cardOf(all[i], sec);
        if (cards.indexOf(c) === -1) cards.push(c);
      }
    }
    if (!cards.length) { sec.appendChild(wrap); return; }
    cards[0].parentNode.insertBefore(wrap, cards[0]);
    cards.forEach(function (c) { if (c.parentNode && !c.contains(wrap)) c.parentNode.removeChild(c); });
  }

  function buildCarousel(list) {
    var frag = document.createDocumentFragment();
    var box = document.createElement('div');
    box.className = 'home-events' + (list.length > 1 ? ' multi' : '');
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
    frag.appendChild(box);
    if (list.length > 1) {
      var dots = document.createElement('div');
      dots.className = 'home-events-dots';
      dots.innerHTML = list.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('');
      frag.appendChild(dots);
      box.addEventListener('scroll', function () {
        var first = box.children[0], step = first.offsetWidth + 14;
        var idx = Math.max(0, Math.min(list.length - 1, Math.round(box.scrollLeft / step)));
        Array.prototype.forEach.call(dots.children, function (d, k) { d.className = k === idx ? 'on' : ''; });
      }, { passive: true });
    }
    return frag;
  }

  try {
    var sec = document.getElementById('news');
    if (!sec) { done(); return; }
    if (!document.getElementById('homeEventsCss')) {
      var st = document.createElement('style');
      st.id = 'homeEventsCss';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    var wrap = document.createElement('div');
    wrap.className = 'home-events-wrap';
    wrap.innerHTML = '<div class="home-events-loading" role="status" aria-live="polite"><div class="sp"></div><span>讀取活動中</span></div>';
    replaceNews(sec, wrap);   // 圈起來的舊消息：一開始就整批換掉
    done();                   // 開機畫面不必再等活動資料，轉圈圈已佔好位置

    var shownKey = null;
    function show(list, instant) {
      var key = JSON.stringify(list);
      if (key === shownKey) return;
      shownKey = key;
      var swap = function () {
        wrap.innerHTML = '';
        if (list.length) {
          wrap.appendChild(buildCarousel(list));
        } else {
          wrap.innerHTML = '<div class="home-events-msg"><strong>目前沒有活動</strong>敬請期待</div>';
        }
      };
      var loading = wrap.querySelector('.home-events-loading');
      if (loading && !instant) {
        loading.classList.add('leave');
        setTimeout(swap, 230);
      } else {
        swap();
      }
    }
    function showError() {
      if (shownKey !== null) return; // 已經有內容就不要蓋掉
      wrap.innerHTML = '<div class="home-events-msg"><strong>無法載入活動</strong>請檢查網路後再試' +
        '<br><button type="button" id="homeEventsRetry">重新載入</button></div>';
      var b = document.getElementById('homeEventsRetry');
      if (b) b.onclick = function () {
        wrap.innerHTML = '<div class="home-events-loading"><div class="sp"></div><span>讀取活動中</span></div>';
        load();
      };
    }
    function load() {
      fetch('/api/events/config', { credentials: 'include', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!(j && j.ok && Array.isArray(j.events))) throw new Error('bad config');
          try { localStorage.setItem(CONFIG_KEY, JSON.stringify(j.events)); } catch (e) {}
          show(visible(j.events), false);
        })
        .catch(showError);
    }

    // 有快取就先秒出，再背景更新
    try {
      var cached = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
      if (Array.isArray(cached) && cached.length) show(visible(cached), true);
    } catch (e) {}
    load();
  } catch (e) { done(); }
})();
