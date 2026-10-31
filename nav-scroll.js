(function () {
  var css = [
    /* floating pill nav when scrolled (Flighty-style) */
    'body .nav{transition:top .35s cubic-bezier(.32,.72,0,1),left .35s cubic-bezier(.32,.72,0,1),right .35s cubic-bezier(.32,.72,0,1),width .35s cubic-bezier(.32,.72,0,1),max-width .35s cubic-bezier(.32,.72,0,1),height .35s cubic-bezier(.32,.72,0,1),padding .35s cubic-bezier(.32,.72,0,1),border-radius .35s cubic-bezier(.32,.72,0,1),background .3s ease,box-shadow .3s ease,border-color .3s ease,transform .35s cubic-bezier(.32,.72,0,1)!important;}',
    'body.is-scrolled .nav{',
    'top:12px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;',
    'width:auto!important;max-width:calc(100vw - 24px)!important;',
    'height:52px!important;padding:4px 6px 4px 8px!important;padding-top:4px!important;',
    'border-radius:980px!important;',
    'background:rgba(18,18,22,.92)!important;',
    'backdrop-filter:saturate(180%) blur(24px)!important;-webkit-backdrop-filter:saturate(180%) blur(24px)!important;',
    'border:1px solid rgba(255,255,255,.1)!important;border-bottom-color:rgba(255,255,255,.1)!important;',
    'box-shadow:0 10px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.04) inset!important;',
    'z-index:2000!important;}',
    'body.is-scrolled .nav .brand{gap:0!important;padding-right:10px!important;border-right:1px solid rgba(255,255,255,.14)!important;margin-right:4px!important;height:36px!important;}',
    'body.is-scrolled .nav .wordmark{display:none!important;}',
    'body.is-scrolled .nav .logo-img{width:32px!important;height:32px!important;border-radius:9px!important;}',
    'body.is-scrolled .nav-right{gap:8px!important;}',
    'body.is-scrolled .nav-links{gap:4px!important;font-size:13.5px!important;font-weight:500!important;}',
    'body.is-scrolled .nav-links a{opacity:.88!important;padding:8px 12px!important;border-radius:980px!important;transition:background .2s,opacity .2s,color .2s!important;color:#f5f5f7!important;}',
    'body.is-scrolled .nav-links a:hover{opacity:1!important;background:rgba(255,255,255,.08)!important;}',
    /* shared action button sizing */
    'body.is-scrolled .nav-actions .btn-sm,',
    'body.is-scrolled .nav-actions [data-auth-slot] a{',
    'border-radius:980px!important;padding:8px 16px!important;font-size:13.5px!important;font-weight:600!important;',
    'min-height:0!important;box-shadow:none!important;}',
    /* guest: solid filled login */
    'body.is-scrolled .nav-actions .btn-primary,',
    'body.is-scrolled .nav-actions [data-auth-slot] a.btn-primary{',
    'background:#f5f5f7!important;color:#0a0a0a!important;border:0!important;}',
    'body.is-scrolled .nav-actions .btn-primary:hover,',
    'body.is-scrolled .nav-actions [data-auth-slot] a.btn-primary:hover{background:#fff!important;}',
    /* logged-in: hollow outline — thicker border */
    'body.is-scrolled .nav-actions .btn-ghost,',
    'body.is-scrolled .nav-actions [data-auth-slot] a.btn-ghost{',
    'background:transparent!important;color:#f5f5f7!important;',
    'border:2px solid rgba(255,255,255,.4)!important;}',
    'body.is-scrolled .nav-actions .btn-ghost:hover,',
    'body.is-scrolled .nav-actions [data-auth-slot] a.btn-ghost:hover{',
    'background:rgba(255,255,255,.1)!important;border-color:rgba(255,255,255,.6)!important;}',
    'body.is-scrolled .nav-toggle span{background:#f5f5f7!important;}',
    /* also thicken outline when not scrolled */
    '.nav-actions .btn-ghost{border:2px solid rgba(255,255,255,.4)!important;}',
    '@media (max-width:768px){',
    'body.is-scrolled .nav{width:calc(100vw - 20px)!important;padding-left:10px!important;padding-right:10px!important;}',
    'body.is-scrolled .nav-toggle{width:36px!important;height:36px!important;background:rgba(255,255,255,.1)!important;}',
    'body.is-scrolled.nav-open .nav{border-radius:24px!important;height:auto!important;min-height:52px!important;align-items:flex-start!important;padding-bottom:16px!important;}',
    'body.is-scrolled.nav-open .nav-right{position:static!important;width:auto!important;height:auto!important;background:transparent!important;padding:12px 8px 8px!important;flex-direction:column!important;}',
    '}'
  ].join('');

  function inject() {
    var s = document.getElementById('navPillStyle');
    if (!s) {
      s = document.createElement('style');
      s.id = 'navPillStyle';
      document.head.appendChild(s);
    }
    s.textContent = css;
  }

  function onScroll() {
    document.body.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  inject();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function rename() {
    document.querySelectorAll('a[href="#features"], a[href="/features"]').forEach(function (a) {
      if (a.textContent.trim() === '功能') a.textContent = '適用裝置';
    });
  }
  rename();
  var n = 0;
  var iv = setInterval(function () {
    n++;
    rename();
    if (n > 40) clearInterval(iv);
  }, 150);
})();
