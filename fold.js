(function () {
  var css = [
    '.torn-mid,.marker-line,.paper-tape{display:none!important;height:0!important;margin:0!important;overflow:hidden!important;}',
    '.sheet #features{overflow:hidden!important;margin-bottom:-180px!important;position:relative!important;z-index:6!important;',
    'padding:28px 36px 108px 56px!important;',
    'box-shadow:inset 0 14px 16px -14px rgba(0,0,0,.22),inset 16px 0 18px -16px rgba(0,0,0,.16),inset -16px 0 18px -16px rgba(0,0,0,.16)!important;}',
    '.sheet #features::before{content:""!important;position:absolute!important;left:22px!important;top:0!important;bottom:0!important;width:7px!important;',
    'background:linear-gradient(90deg,rgba(0,0,0,.16),rgba(255,255,255,.92) 42%,rgba(0,0,0,.08))!important;',
    'pointer-events:none!important;z-index:2!important;}',
    '.sheet #features .card-grid{max-width:720px!important;margin-left:auto!important;margin-right:auto!important;}',
    '.sheet #features .nb-fold{position:absolute!important;right:0!important;bottom:0!important;width:84px!important;height:84px!important;',
    'z-index:8!important;pointer-events:none!important;',
    'background:linear-gradient(135deg,transparent 48.6%,rgba(28,36,52,.32) 49.8%,#a9b8ce 53%,#d7e2f0 66%,#f7f9fc 76%)!important;}',
    'body.home .site-footer{position:relative!important;z-index:1!important;}'
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
