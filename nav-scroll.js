(function () {
  var DURATION = 1400;
  var EASE = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

  var css = [
    '.nav-actions .btn-ghost{border:2px solid rgba(255,255,255,.4)!important;background:transparent!important;}',

    /* base: no CSS transition on geometry — WAAPI owns it */
    'body .nav{',
    'will-change:left,right,top,border-radius,padding,background,box-shadow;',
    '}',
    'body .nav .wordmark{',
    'transition:opacity .5s ease,max-width .9s cubic-bezier(.25,.8,.25,1),margin .9s cubic-bezier(.25,.8,.25,1)!important;',
    'max-width:140px;overflow:hidden;white-space:nowrap;}',
    'body .nav .brand{transition:gap .6s ease!important;}',
    'body .nav .logo-img{transition:width .6s ease,height .6s ease!important;}',

    /* desktop pill (css ok on desktop) */
    '@media (min-width:769px){',
    'body .nav{transition:top .9s cubic-bezier(.25,.8,.25,1),left .9s cubic-bezier(.25,.8,.25,1),right .9s cubic-bezier(.25,.8,.25,1),width .9s cubic-bezier(.25,.8,.25,1),border-radius .9s cubic-bezier(.25,.8,.25,1),background .6s ease,box-shadow .9s ease,padding .9s cubic-bezier(.25,.8,.25,1),transform .9s cubic-bezier(.25,.8,.25,1)!important;}',
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
    'body.is-scrolled:not(.nav-open) .nav .wordmark{opacity:0!important;max-width:0!important;margin:0!important;pointer-events:none!important;}',
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

    /* mobile static end-states (geometry filled by WAAPI fill:forwards) */
    '@media (max-width:768px){',
    'body .nav{',
    'left:0!important;right:0!important;width:auto!important;max-width:none!important;',
    'transform:none!important;justify-content:space-between!important;',
    '}',
    'body.is-scrolled:not(.nav-open) .nav{',
    'background:rgba(18,18,22,.94)!important;',
    'backdrop-filter:saturate(180%) blur(20px)!important;-webkit-backdrop-filter:saturate(180%) blur(20px)!important;',
    'border:1px solid rgba(255,255,255,.12)!important;border-bottom-color:rgba(255,255,255,.12)!important;',
    'box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset!important;',
    'z-index:2000!important;',
    'justify-content:space-between!important;',
    '}',
    'body.is-scrolled:not(.nav-open) .nav .brand{',
    'gap:0!important;padding-right:0!important;border-right:0!important;',
    'margin-right:0!important;height:36px!important;flex-shrink:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav .wordmark{',
    'opacity:0!important;max-width:0!important;margin:0!important;pointer-events:none!important;}',
    'body.is-scrolled:not(.nav-open) .nav .logo-img{width:32px!important;height:32px!important;border-radius:9px!important;}',
    'body.is-scrolled:not(.nav-open) .nav-toggle{',
    'width:36px!important;height:36px!important;background:rgba(255,255,255,.12)!important;flex-shrink:0!important;}',
    'body.is-scrolled:not(.nav-open) .nav-toggle span{background:#f5f5f7!important;}',
    'body.is-scrolled:not(.nav-open) .nav-right{',
    'position:fixed!important;opacity:0!important;pointer-events:none!important;',
    'width:0!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;}',
    '}',

    'body.nav-open .nav{',
    'top:0!important;left:0!important;right:0!important;transform:none!important;',
    'width:auto!important;max-width:none!important;',
    'height:calc(var(--nav-h,52px) + env(safe-area-inset-top,0px))!important;',
    'padding-left:max(16px,env(safe-area-inset-left))!important;',
    'padding-right:max(16px,env(safe-area-inset-right))!important;',
    'padding-top:env(safe-area-inset-top,0px)!important;',
    'border-radius:0!important;border:0!important;border-bottom:1px solid transparent!important;',
    'box-shadow:none!important;background:rgba(10,10,10,.95)!important;',
    'justify-content:space-between!important;z-index:3000!important;}',
    'body.nav-open .nav .wordmark{opacity:1!important;max-width:140px!important;}',
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
    'body.nav-open .nav-actions{margin-top:16px!important;align-self:flex-start!important;}',
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

  function isMobile() {
    return window.matchMedia('(max-width:768px)').matches;
  }

  function pillMetrics() {
    var nav = document.querySelector('.nav');
    var logo = nav && nav.querySelector('.logo-img');
    var toggle = nav && nav.querySelector('.nav-toggle');
    var logoW = logo ? (logo.offsetWidth || 32) : 32;
    var toggleW = toggle ? (toggle.offsetWidth || 36) : 36;
    var pillW = logoW + 14 + toggleW + 16;
    var vw = window.innerWidth || 375;
    var inset = Math.max(14, (vw - pillW) / 2);
    return { inset: inset, pillW: pillW };
  }

  var scrolled = false;
  var running = null;
  var locked = false;

  function runMobileAnim(toPill) {
    var nav = document.querySelector('.nav');
    if (!nav || !nav.animate) {
      document.body.classList.toggle('is-scrolled', toPill);
      return;
    }

    if (running) {
      try { running.cancel(); } catch (e) {}
      running = null;
    }

    var m = pillMetrics();
    var safeTop = 0;
    try {
      var cs = getComputedStyle(document.documentElement);
      // approximate; nav already includes safe area in expanded height
    } catch (e2) {}

    var from = toPill
      ? {
          top: '0px',
          left: '0px',
          right: '0px',
          borderRadius: '0px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingBottom: '0px',
          height: 'calc(var(--nav-h, 52px) + env(safe-area-inset-top, 0px))'
        }
      : {
          top: '10px',
          left: m.inset + 'px',
          right: m.inset + 'px',
          borderRadius: '980px',
          paddingTop: '5px',
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: '5px',
          height: '50px'
        };

    var to = toPill
      ? {
          top: '10px',
          left: m.inset + 'px',
          right: m.inset + 'px',
          borderRadius: '980px',
          paddingTop: '5px',
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingBottom: '5px',
          height: '50px'
        }
      : {
          top: '0px',
          left: '0px',
          right: '0px',
          borderRadius: '0px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingBottom: '0px',
          height: 'calc(var(--nav-h, 52px) + env(safe-area-inset-top, 0px))'
        };

    // toggle class early so wordmark/logo styles track
    document.body.classList.toggle('is-scrolled', toPill);

    locked = true;
    running = nav.animate([from, to], {
      duration: DURATION,
      easing: EASE,
      fill: 'forwards'
    });

    running.onfinish = function () {
      running = null;
      locked = false;
      // commit final inline so layout stays until next anim
      if (toPill) {
        nav.style.top = '10px';
        nav.style.left = m.inset + 'px';
        nav.style.right = m.inset + 'px';
        nav.style.borderRadius = '980px';
        nav.style.height = '50px';
        nav.style.padding = '5px 8px';
      } else {
        nav.style.top = '';
        nav.style.left = '';
        nav.style.right = '';
        nav.style.borderRadius = '';
        nav.style.height = '';
        nav.style.padding = '';
      }
    };

    running.oncancel = function () {
      running = null;
      locked = false;
    };
  }

  function applyScrolled(next) {
    if (next === scrolled) return;
    if (locked) return;
    scrolled = next;

    if (isMobile()) {
      runMobileAnim(next);
    } else {
      document.body.classList.toggle('is-scrolled', next);
    }
  }

  var ticking = false;
  function onScroll() {
    if (document.body.classList.contains('nav-open')) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      if (!scrolled && y > 48) applyScrolled(true);
      else if (scrolled && y < 12) applyScrolled(false);
    });
  }

  inject();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    if (scrolled && isMobile()) {
      var m = pillMetrics();
      var nav = document.querySelector('.nav');
      if (nav) {
        nav.style.left = m.inset + 'px';
        nav.style.right = m.inset + 'px';
      }
    }
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
    if (n > 40) clearInterval(iv);
  }, 150);
})();
