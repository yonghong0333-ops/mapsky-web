/* 讓 Safari 上下工具列區域跟著畫面邊緣的顏色走（全螢幕、無黑塊）
   效能：先量好各區塊「位置＋底色」，滑動時只用 scrollY 查表，不碰版面計算。 */
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

  var segs = [], fallback = '#ffffff';

  // 掃描頁面（最多 4 層）：有不透明底色的區塊記下 [top, bottom, color]，沒有就往下一層找
  function measure() {
    var sy = window.pageYOffset || 0, out = [];
    function walk(el, depth) {
      if (!el || el.nodeType !== 1 || el.id === 'boot-shell') return;
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
      var r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < window.innerWidth * 0.6) {
        if (depth < 4) for (var j = 0; j < el.children.length; j++) walk(el.children[j], depth + 1);
        return;
      }
      var c = parse(cs.backgroundColor);
      if (c) { out.push({ t: r.top + sy, b: r.bottom + sy, c: c }); return; }
      if (depth < 4) for (var i = 0; i < el.children.length; i++) walk(el.children[i], depth + 1);
    }
    for (var k = 0; k < document.body.children.length; k++) walk(document.body.children[k], 0);
    segs = out;
    fallback = parse(getComputedStyle(document.body).backgroundColor) || '#ffffff';
    last = '';
    queue();
  }

  function colorAtDoc(y) {
    var hit = null;
    for (var i = 0; i < segs.length; i++) {
      if (y >= segs[i].t && y < segs[i].b) hit = segs[i]; // 後面的蓋在前面上
    }
    return hit ? hit.c : fallback;
  }

  var last = '', queued = false;
  function apply() {
    queued = false;
    var sy = window.pageYOffset || 0, h = window.innerHeight;
    var top = colorAtDoc(sy + 2), bottom = colorAtDoc(sy + h - 2);
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

  var mt = 0;
  function remeasureSoon(ms) {
    clearTimeout(mt);
    mt = setTimeout(measure, ms || 200);
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () { remeasureSoon(250); });
  window.addEventListener('load', function () { remeasureSoon(100); });
  window.addEventListener('pageshow', function () { remeasureSoon(100); });
  if (window.ResizeObserver) new ResizeObserver(function () { remeasureSoon(200); }).observe(document.body);
  // 內容是 JS 後續注入的，開機後再量幾次
  [300, 1000, 2500].forEach(function (ms) { setTimeout(measure, ms); });
  measure();
})();
