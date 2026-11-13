/* 購票頁：場次名稱後台決定；下方時間只寫到日 */
(function () {
  var cfgCache = null;
  function dayText(s) {
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
  function loadCfg(cb) {
    if (cfgCache) return cb(cfgCache);
    try {
      var raw = localStorage.getItem('mapsky_events_config_v1');
      if (raw) {
        var j = JSON.parse(raw);
        var arr = j.events || j;
        if (Array.isArray(arr) && arr.length) {
          cfgCache = arr.find(function (e) { return e.id === 'qx-exam'; }) || arr[0];
          return cb(cfgCache);
        }
      }
    } catch (e) {}
    fetch('/api/events/config').then(function (r) { return r.json(); }).then(function (j) {
      var arr = (j && j.events) || [];
      cfgCache = arr.find(function (e) { return e.id === 'qx-exam'; }) || arr[0] || null;
      cb(cfgCache);
    }).catch(function () { cb(null); });
  }
  function apply(cfg) {
    if (!cfg || !Array.isArray(cfg.sessions)) return;
    var list = document.getElementById('sessionList');
    if (!list) return;
    list.querySelectorAll('button.option[data-s]').forEach(function (btn) {
      var id = btn.getAttribute('data-s');
      var s = cfg.sessions.find(function (x) { return x.id === id; });
      if (!s) return;
      var day = dayText(s);
      var name = (s.name || '').trim() || day || '場次';
      var place = (s.place || '').replace(/\d{1,2}:\d{2}\s*[–\-]\s*\d{1,2}:\d{2}/g, '').trim();
      place = place.replace(/^[·•\s]+|[·•\s]+$/g, '');
      var meta = day + (place ? ' · ' + place : '');
      var n = btn.querySelector('.name');
      var m = btn.querySelector('.meta');
      if (n) n.textContent = name;
      if (m) m.textContent = meta;
    });
  }
  function tick() { loadCfg(apply); }
  setInterval(tick, 400);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
