/* 讓 Safari 上下工具列區域跟著畫面邊緣的顏色走（全螢幕、無黑塊） */
(function () {
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  root.style.colorScheme = 'light';

  function parse(c) {
    var m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (!m) return null;
    var p = m[1].split(',').map(function (x) { return parseFloat(x); });
    var a = p.length > 3 ? p[3] : 1;
    return a > 0.9 ? 'rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')' : null;
  }
  // 取該點「實際看得到」的底色：略過 fixed 浮層，往下找第一個不透明背景
  function colorAt(x, y) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || el === root) continue;
      var c = parse(cs.backgroundColor);
      if (c) return c;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || '#ffffff';
  }

  var last = '', queued = false;
  function apply() {
    queued = false;
    var w = window.innerWidth, h = window.innerHeight;
    var top = colorAt(Math.round(w / 2), 2);
    var bottom = colorAt(Math.round(w / 2), h - 2);
    var key = top + '|' + bottom;
    if (key === last) return;
    last = key;
    root.style.backgroundColor = bottom;
    meta.setAttribute('content', top);
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('pageshow', queue);
  window.addEventListener('load', queue);
  document.addEventListener('DOMContentLoaded', queue);
  // 內容是 JS 後續注入的，開機後前幾秒多量幾次
  var n = 0, t = setInterval(function () { queue(); if (++n > 30) clearInterval(t); }, 150);
  queue();
})();
