(function () {
    var EV_KEY = 'mapsky_events_config_v1';
    var TICKETS_KEY = 'mapsky_tickets_v1';
    var state = { eventId: 'qx-exam', step: 'session', sessionId: null, packageId: null, session: null, config: null };
    var els = {
      title: document.getElementById('title'),
      lead: document.getElementById('lead'),
      sessionList: document.getElementById('sessionList'),
      packageList: document.getElementById('packageList'),
      payBox: document.getElementById('payBox'),
      orderSummary: document.getElementById('orderSummary'),
      doneBox: document.getElementById('doneBox'),
      nextBtn: document.getElementById('nextBtn'),
      topTitle: document.getElementById('topTitle'),
      backBtn: document.getElementById('backBtn')
    };
    (function () {
      var t = document.getElementById('title');
      if (!t || !window.MutationObserver) return;
      var mo = new MutationObserver(function () { t.classList.remove('is-loading'); mo.disconnect(); });
      mo.observe(t, { childList: true, characterData: true, subtree: true });
    })();
    function parseTW(s) {
      if (!s) return null;
      var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (!m) return null;
      return new Date(+m[1], +m[2]-1, +m[3], +(m[4]||0), +(m[5]||0), +(m[6]||0));
    }
    function isOnSale(ev) {
      if (!ev || ev.enabled === false) return false;
      var now = new Date();
      var a = parseTW(ev.saleStart), b = parseTW(ev.saleEnd);
      if (a && now < a) return false;
      if (b && now > b) return false;
      return true;
    }
    function formatPrice(n) { return !n ? '免費' : ('NT$ ' + Number(n).toLocaleString('zh-TW')); }
    function userKey(s) {
      if (!s || !s.loggedIn) return null;
      var p = s.profile || {};
      return String(p.email || p.id || '').trim().toLowerCase() || null;
    }
    function sessions() { return (state.config && state.config.sessions) || []; }
    function sessionDayText(s) {
      if (!s) return '';
      var raw = s.examDate || s.date || s.examStart || '';
      var m = String(raw).match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (m) {
        var mm = m[2].length === 1 ? '0' + m[2] : m[2];
        var dd = m[3].length === 1 ? '0' + m[3] : m[3];
        return m[1] + '/' + mm + '/' + dd;
      }
      return String(raw).split(/[ T]/)[0] || '';
    }
    function packages() { return (state.config && state.config.packages) || []; }
    function render() {
      document.body.setAttribute('data-step', state.step);
      if (state._last !== state.step) {
        state._last = state.step;
        var stg = document.getElementById('screenMain');
        if (stg) { stg.classList.remove('enter'); void stg.offsetWidth; stg.classList.add('enter'); }
      }
      var ev = state.config || {};
      els.title.textContent = ev.title || '購買入場券';
      if (state.step === 'session') {
        els.lead.textContent = '請選擇場次';
        els.packageList.innerHTML = '';
        els.payBox.style.display = 'none';
        els.doneBox.style.display = 'none';
        var list = sessions();
        if (!list.length) {
          els.sessionList.innerHTML = '<p class="empty">目前沒有可選場次。</p>';
          state.sessionId = null;
        } else {
          els.sessionList.innerHTML = list.map(function (s) {
            var sel = state.sessionId === s.id ? ' selected' : '';
            var day = sessionDayText(s);
            var name = (s.name || '').trim() || day || '場次';
            var place = (s.place || '').replace(/\d{1,2}:\d{2}\s*[–\-]\s*\d{1,2}:\d{2}/g, '').trim();
            place = place.replace(/^[·•\s]+|[·•\s]+$/g, '');
            var meta = day + (place ? ' · ' + place : '');
            return '<button type="button" class="option' + sel + '" data-s="' + s.id + '"><div class="name">' + name + '</div><div class="meta">' + meta + '</div></button>';
          }).join('');
          els.sessionList.querySelectorAll('[data-s]').forEach(function (btn) {
            btn.onclick = function () { state.sessionId = btn.getAttribute('data-s'); render(); };
          });
        }
        els.nextBtn.textContent = packages().length ? '下一步：選禮包' : '下一步：付款';
        els.nextBtn.disabled = !state.sessionId;
      } else if (state.step === 'package') {
        els.lead.textContent = '請選擇禮包';
        els.sessionList.innerHTML = '';
        els.payBox.style.display = 'none';
        els.doneBox.style.display = 'none';
        var list = packages();
        if (!list.length) {
          els.packageList.innerHTML = '<p class="empty">目前沒有禮包。</p>';
          state.packageId = null;
        } else {
          els.packageList.innerHTML = list.map(function (p) {
            var sel = state.packageId === p.id ? ' selected' : '';
            return '<button type="button" class="option' + sel + '" data-p="' + p.id + '"><div class="name">' + (p.name || '禮包') + '</div><div class="meta">' + (p.desc || '') + '</div><div class="price">' + formatPrice(p.price) + '</div></button>';
          }).join('');
          els.packageList.querySelectorAll('[data-p]').forEach(function (btn) {
            btn.onclick = function () { state.packageId = btn.getAttribute('data-p'); render(); };
          });
        }
        els.nextBtn.textContent = '下一步：付款';
        els.nextBtn.disabled = !state.packageId;
      } else if (state.step === 'pay') {
        els.sessionList.innerHTML = '';
        els.packageList.innerHTML = '';
        els.payBox.style.display = '';
        els.doneBox.style.display = 'none';
        els.lead.textContent = '確認訂單';
        var s = sessions().find(function (x) { return x.id === state.sessionId; }) || {};
        var p = packages().find(function (x) { return x.id === state.packageId; }) || {};
        var pkgName = p.name || (state.packageId === 'free' || !packages().length ? '基本入場（免費）' : state.packageId);
        var pkgPrice = p.price != null ? p.price : 0;
        els.orderSummary.innerHTML =
          '<div class="pay-row"><span>場次</span><span>' + ((s.name || '').trim() || sessionDayText(s) || state.sessionId) + '</span></div>' +
          '<div class="pay-row"><span>日期</span><span>' + sessionDayText(s) + '</span></div>' +
          '<div class="pay-row"><span>禮包</span><span>' + pkgName + '</span></div>' +
          '<div class="pay-row"><span>金額</span><span>' + formatPrice(pkgPrice) + '</span></div>';
        els.nextBtn.textContent = '確認付款';
        els.nextBtn.disabled = false;
      } else if (state.step === 'done') {
        els.sessionList.innerHTML = '';
        els.packageList.innerHTML = '';
        els.payBox.style.display = 'none';
        els.doneBox.style.display = '';
        els.lead.textContent = '';
        els.nextBtn.textContent = '完成';
        els.nextBtn.disabled = false;
      }
    }
    function claimTicket() {
      var s = sessions().find(function (x) { return x.id === state.sessionId; }) || {};
      var p = packages().find(function (x) { return x.id === state.packageId; }) || {};
      var ticket = {
        eventId: state.eventId,
        sessionId: state.sessionId,
        packageId: state.packageId || 'free',
        sessionName: (s.name || '').trim() || sessionDayText(s) || state.sessionId,
        packageName: p.name || (state.packageId === 'free' || !packages().length ? '基本入場（免費）' : state.packageId),
        price: p.price != null ? p.price : 0,
        orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
        bound: true
      };
      return fetch('/api/events/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(ticket)
      }).then(function (r) { return r.json(); }).then(function (j) {
        try {
          var raw = localStorage.getItem(TICKETS_KEY);
          var all = raw ? JSON.parse(raw) : {};
          var uid = userKey(state.session);
          if (uid) {
            if (!all[uid]) all[uid] = {};
            all[uid][state.eventId] = ticket;
            localStorage.setItem(TICKETS_KEY, JSON.stringify(all));
          }
        } catch (e) {}
        return j;
      });
    }
    els.nextBtn.onclick = function () {
      if (state.step === 'session' && state.sessionId) {
        if (!packages().length) {
          state.packageId = 'free';
          state.step = 'pay';
        } else {
          state.step = 'package';
        }
        render();
        return;
      }
      if (state.step === 'package' && state.packageId) { state.step = 'pay'; render(); return; }
      if (state.step === 'pay') {
        if (els.nextBtn.disabled) return;
        els.nextBtn.disabled = true;
        var overlay = document.getElementById('payOverlay');
        if (overlay) overlay.classList.add('show');
        function finish() {
          if (overlay) overlay.classList.remove('show');
          state.step = 'done';
          render();
        }
        claimTicket().then(finish, finish);
        return;
      }
      if (state.step === 'done') {
        location.href = '/events-detail.html?event=' + encodeURIComponent(state.eventId);
      }
    };
    els.backBtn.onclick = function () {
      if (state.step === 'package') { state.step = 'session'; render(); return; }
      if (state.step === 'pay') { state.step = packages().length ? 'package' : 'session'; render(); return; }
      if (history.length > 1) history.back(); else location.href = '/events-detail.html?event=' + encodeURIComponent(state.eventId);
    };
    function boot(session) {
      state.session = session || { loggedIn: false };
      if (!state.session.loggedIn) {
        location.href = '/login?return=' + encodeURIComponent(location.pathname + location.search);
        return;
      }
      var q = new URLSearchParams(location.search);
      state.eventId = q.get('event') || 'qx-exam';
      fetch('/api/events/config', { credentials: 'include', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var arr = (j && j.events) || [];
          try { localStorage.setItem(EV_KEY, JSON.stringify(arr)); } catch (e) {}
          state.config = arr.find(function (e) { return e.id === state.eventId; }) || arr[0] || { title: '活動', sessions: [], packages: [] };
          if (!Array.isArray(state.config.sessions)) state.config.sessions = [];
          if (!Array.isArray(state.config.packages)) state.config.packages = [];
          state.step = 'session';
          render();
        }).catch(function () {
          state.config = { title: '活動', sessions: [], packages: [] };
          render();
        });
    }
    if (window.MapSkyAuth && MapSkyAuth.session) {
      MapSkyAuth.session().then(function (res) { boot((res && res.body) || { loggedIn: false }); })
        .catch(function () { boot({ loggedIn: false }); });
    } else {
      boot({ loggedIn: false });
    }
  })();
