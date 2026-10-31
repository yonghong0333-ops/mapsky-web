(function () {
  var css = [
    /* outline logged-in button */
    '.nav-actions .btn-ghost{border:2px solid rgba(255,255,255,.4)!important;background:transparent!important;}',

    /* base transitions — all animatable props */
    'body .nav{',
    'transition:',
    'top .4s cubic-bezier(.32,.72,0,1),',
    'left .4s cubic-bezier(.32,.72,0,1),',
    'right .4s cubic-bezier(.32,.72,0,1),',
    'width .4s cubic-bezier(.32,.72,0,1),',
    'max-width .4s cubic-bezier(.32,.72,0,1),',
    'height .4s cubic-bezier(.32,.72,0,1),',
    'padding .4s cubic-bezier(.32,.72,0,1),',
    'border-radius .4s cubic-bezier(.32,.72,0,1),',
    'background .35s ease,',
    'box-shadow .4s ease,',
    'transform .4s cubic-bezier(.32,.72,0,1),',
    'gap .4s cubic-bezier(.32,.72,0,1)!important;',
    '}',
    'body .nav .wordmark{transition:opacity .25s ease,width .35s ease,margin .35s ease!important;}',
    'body .nav .brand{transition:padding .35s ease,margin .35s ease,border-color .35s ease,gap .35s ease!important;}',
    'body .nav .logo-img{transition:width .35s ease,height .35s ease,border-radius .35s ease!important;}',

    /* ===== desktop: centered content-width pill ===== */
    '@media (min-width:769px){',
    'body.is-scrolled:not(.nav-open) .nav{',
    'top:12px!important;left:50%!important;right:auto!important;transform:translate3d(-50%,0,0)!important;',
    'width:auto!important;max-width:calc(100vw - 32px)!important;',
    'height:52px!important;padding:4px 6px 4px 8px!important;padding-top:4px!important;',
    'border-radius:980px!important;',
    'background:rgba(18,18,22,.92)!important;',
    'backdrop-filter:saturate(180%) blur(24px)!important;-webkit-backdrop-filter:saturate(180%) blur(24px)!important;',
    'border:1px solid rgba(255,255,255,.1)!important;border-bottom-color:rgba(255,255,255,.1)!important;',
    'box-shadow:0 10px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.04) inset!important;',
    'z-index:2000!important;}',
    'body.is-scrolled:not(.nav-open) .nav .brand{gap:0!important;padding-right:10px!important;border-right:1px solid rgba(255,255,255,.14)!important;margin-right:4px!important;height:36px!important;}',
    'body.is-scrolled:not(.nav-open) .nav .wordmark{display:none!important;}',
    'body.is-scrolled:not(.nav-open) .nav .logo-img{width:32px!important;height:32px!important;border-radius:9px!important;}',
    'body.is-scrolled:not(.nav-open) .nav-right{gap:8px!important;}',
    'body.is-scrolled:not(.nav-open) .nav-links{gap:4px!important;font-size:13.5px!important;font-weight:500!important;}',
    'body.is-scrolled:not(.nav-open) .nav-links a{opacity:.88!important;padding:8px 12px!important;border-radius:980px!important;color:#f5f5f7!important;}',
    'body.is-scrolled:not(.nav-open) .nav-links a:hover{opacity:1!important;background:rgba(255,255,255,.08)!important;}',
    'body.is-scrolled:not(.nav-open) .nav-actions .btn-sm,',
    'body.is-scrolled:not(.nav-open) .nav-actions [data-auth-slot] a{',
    'border-radius:980px!important;padding:8px 16px!important;font-size:13.5px!important;font-weight:600!important;',
    'min-height:0!important;box-shadow:none!important;}',
    'body.is-scrolled:not(.nav-open) .nav-actions .btn-primary,',
    'body.is-scrolled:not(.nav-open) .nav-actions [data-auth-slot] a.btn-primary{',
    'background:#f5f5f7!important;color:#0a0a0a!important;border:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav-actions .btn-ghost,',
    'body.is-scrolled:not(.nav-open) .nav-actions [data-auth-slot] a.btn-ghost{',
    'background:transparent!important;color:#f5f5f7!important;border:2px solid rgba(255,255,255,.4)!important;}',
    '}',

    /* ===== mobile: compact pill with smooth width shrink ===== */
    '@media (max-width:768px){',
    /* start from full width so width can interpolate to px */
    'body .nav{width:100%!important;left:0!important;right:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav{',
    'top:10px!important;',
    'left:50%!important;',
    'right:auto!important;',
    'transform:translate3d(-50%,0,0)!important;',
    'width:var(--pill-w,110px)!important;',
    'max-width:calc(100vw - 24px)!important;',
    'height:48px!important;',
    'padding:4px 6px!important;',
    'border-radius:980px!important;',
    'justify-content:flex-start!important;',
    'gap:6px!important;',
    'background:rgba(18,18,22,.94)!important;',
    'backdrop-filter:saturate(180%) blur(24px)!important;-webkit-backdrop-filter:saturate(180%) blur(24px)!important;',
    'border:1px solid rgba(255,255,255,.12)!important;border-bottom-color:rgba(255,255,255,.12)!important;',
    'box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset!important;',
    'z-index:2000!important;}',
    'body.is-scrolled:not(.nav-open) .nav .brand{',
    'gap:0!important;padding-right:8px!important;border-right:1px solid rgba(255,255,255,.14)!important;',
    'margin-right:2px!important;height:36px!important;flex-shrink:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav .wordmark{',
    'opacity:0!important;width:0!important;margin:0!important;overflow:hidden!important;',
    'pointer-events:none!important;}',
    'body.is-scrolled:not(.nav-open) .nav .logo-img{width:32px!important;height:32px!important;border-radius:9px!important;}',
    'body.is-scrolled:not(.nav-open) .nav-toggle{',
    'width:36px!important;height:36px!important;background:rgba(255,255,255,.1)!important;flex-shrink:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav-toggle span{background:#f5f5f7!important;}',
    'body.is-scrolled:not(.nav-open) .nav-right{',
    'position:fixed!important;opacity:0!important;pointer-events:none!important;',
    'width:0!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;}',
    '}',

    /* ===== menu open: full bar, no pill ===== */
    'body.nav-open .nav{',
    'top:0!important;left:0!important;right:0!important;transform:none!important;',
    'width:100%!important;max-width:none!important;',
    'height:calc(var(--nav-h,52px) + env(safe-area-inset-top,0px))!important;',
    'padding-left:max(16px,env(safe-area-inset-left))!important;',
    'padding-right:max(16px,env(safe-area-inset-right))!important;',
    'padding-top:env(safe-area-inset-top,0px)!important;',
    'border-radius:0!important;border:0!important;border-bottom:1px solid transparent!important;',
    'box-shadow:none!important;background:rgba(10,10,10,.95)!important;',
    'justify-content:space-between!important;gap:0!important;',
    'z-index:3000!important;}',
    'body.nav-open .nav .wordmark{display:block!important;opacity:1!important;width:auto!important;}',
    'body.nav-open .nav .brand{border-right:0!important;padding-right:0!important;margin-right:0!important;height:auto!important;gap:8px!important;}',
    'body.nav-open .nav .logo-img{width:36px!important;height:36px!important;}',

    '@media (max-width:768px){',
    'body.nav-open .nav-right,body.nav-open .nav-right.open,.nav-right.open{',
    'position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;',
    'width:100%!important;height:100%!important;height:100dvh!important;',
    'background:#000!important;border-radius:0!important;overflow:auto!important;',
    'flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;',
    'padding:calc(var(--nav-h,52px) + env(safe-area-inset-top,0px) + 36px) max(28px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(28px,env(safe-area-inset-left))!important;',
    'opacity:1!important;pointer-events:auto!important;z-index:3001!important;',
    'gap:32px!important;margin:0!important;}',
    'body.nav-open .nav-links{',
    'flex-direction:column!important;align-items:flex-start!important;',
    'font-size:28px!important;font-weight:600!important;gap:28px!important;}',
    'body.nav-open .nav-links a{',
    'padding:0!important;opacity:1!important;background:transparent!important;border-radius:0!important;}',
    'body.nav-open .nav-actions{',
    'margin-top:16px!important;align-self:flex-start!important;}',
    'body.nav-open .nav-actions .btn-sm{padding:12px 22px!important;font-size:16px!important;}',
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

  function measurePill() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var brand = nav.querySelector('.brand');
    var toggle = nav.querySelector('.nav-toggle');
    if (!brand || !toggle) return;
    // logo (~32) + divider pad + toggle (36) + padding
    var logo = brand.querySelector('.logo-img');
    var logoW = logo ? (logo.offsetWidth || 32) : 32;
    var toggleW = toggle.offsetWidth || 36;
    var w = logoW + 8 + 1 + 2 + toggleW + 12; // pads + border gap
    document.documentElement.style.setProperty('--pill-w', w + 'px');
  }

  var scrolled = false;
  function onScroll() {
    if (document.body.classList.contains('nav-open')) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var next = scrolled;
    if (!scrolled && y > 40) next = true;
    else if (scrolled && y < 10) next = false;
    if (next !== scrolled) {
      if (next) measurePill();
      scrolled = next;
      document.body.classList.toggle('is-scrolled', scrolled);
    }
  }

  inject();
  measurePill();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    measurePill();
  }, { passive: true });

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
    measurePill();
    if (n > 40) clearInterval(iv);
  }, 150);
})();
