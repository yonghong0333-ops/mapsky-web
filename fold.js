(function () {
  var css = [
    '.torn-mid,.marker-line,.paper-tape{display:none!important;height:0!important;margin:0!important;overflow:hidden!important;}',
    /* notebook slightly overlaps footer top only — footer content stays readable */
    '.sheet #features{overflow:visible!important;margin-bottom:-56px!important;position:relative!important;z-index:6!important;',
    'padding:28px 36px 72px 56px!important;',
    'box-shadow:inset 0 14px 16px -14px rgba(0,0,0,.22),inset 16px 0 18px -16px rgba(0,0,0,.16),inset -16px 0 18px -16px rgba(0,0,0,.16)!important;}',
    /* left binding crease */
    '.sheet #features::before{content:""!important;position:absolute!important;left:22px!important;top:0!important;bottom:0!important;width:7px!important;',
    'background:linear-gradient(90deg,rgba(0,0,0,.18),rgba(255,255,255,.95) 42%,rgba(0,0,0,.1))!important;',
    'pointer-events:none!important;z-index:2!important;box-shadow:2px 0 6px rgba(0,0,0,.06)!important;}',
    /* top stop crease */
    '.sheet #features::after{content:""!important;position:absolute!important;left:0!important;right:0!important;top:0!important;height:18px!important;',
    'background:linear-gradient(180deg,rgba(0,0,0,.14),rgba(0,0,0,.04) 40%,transparent)!important;',
    'pointer-events:none!important;z-index:2!important;}',
    '.sheet #features .card-grid{max-width:720px!important;margin-left:auto!important;margin-right:auto!important;position:relative!important;z-index:1!important;}',
    /* bottom-right page corner fold */
    '.sheet #features .nb-fold{position:absolute!important;right:0!important;bottom:0!important;width:96px!important;height:96px!important;',
    'z-index:8!important;pointer-events:none!important;',
    'background:linear-gradient(135deg,transparent 49.2%,rgba(20,28,42,.38) 50.2%,#8fa0b8 54%,#c5d2e4 64%,#eef2f8 74%,#f7f9fc 82%)!important;',
    'box-shadow:-6px -6px 14px rgba(0,0,0,.08)!important;}',
    '.sheet #features .nb-fold::after{content:""!important;position:absolute!important;right:2px!important;bottom:2px!important;',
    'width:60px!important;height:60px!important;',
    'background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.12) 50%)!important;',
    'filter:blur(4px)!important;z-index:-1!important;}',
    /* footer sits under paper edge but content not buried */
    'body.home .site-footer{position:relative!important;z-index:1!important;margin-top:0!important;padding-top:48px!important;}'
  ].join('');

  function apply() {
    var f = document.getElementById('features');
    if (!f) return false;
    var s = document.getElementById('nbFoldStyle');
    if (!s) {
      s = document.createElement('style');
      s.id = 'nbFoldStyle';
      document.head.appendChild(s);
    }
    s.textContent = css;
    document.querySelectorAll('.torn-mid,.marker-line').forEach(function (el) {
      el.style.display = 'none';
    });
    if (!f.querySelector('.nb-fold')) {
      var d = document.createElement('div');
      d.className = 'nb-fold';
      d.setAttribute('aria-hidden', 'true');
      f.appendChild(d);
    }
    return true;
  }

  var n = 0;
  var iv = setInterval(function () {
    n++;
    var ok = apply() && document.querySelector('#features .nb-fold');
    if (ok || n > 120) clearInterval(iv);
  }, 100);
})();
