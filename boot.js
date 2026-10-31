(async function () {
  try {
    var res = await fetch(
      'https://cdn.jsdelivr.net/gh/yonghong0333-ops/mapsky-web@1655ffc8a2b5/index.html',
      { cache: 'no-store' }
    );
    var html = await res.text();
    var m = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) throw new Error('boot script missing');
    var code = m[1];

    var img = "div.innerHTML = '<img class=\"paper-tape\" src=\"assets/paper-tape.jpg\" alt=\"\" />';";
    var svg = "div.innerHTML = '<svg class=\"marker-line\" viewBox=\"0 0 1200 40\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path d=\"M-12 22 C 30 16, 70 28, 130 20 S 220 12, 300 24 S 400 32, 490 18 S 590 10, 680 23 S 780 31, 870 17 S 970 12, 1060 25 S 1140 18, 1220 22\" fill=\"none\" stroke=\"#1c1c1e\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M-8 24 C 48 20, 96 27, 160 22 S 250 16, 340 25 S 450 30, 540 20 S 650 15, 750 24 S 860 29, 960 19 S 1060 16, 1220 23\" fill=\"none\" stroke=\"#1c1c1e\" stroke-width=\"3.4\" stroke-linecap=\"round\" opacity=\"0.4\"/></svg>';";
    if (code.indexOf(img) === -1) throw new Error('tape markup missing');
    code = code.replace(img, svg);

    var hook = 'document.head.appendChild(full);';
    var extra = hook +
      "var tapeFix=document.createElement('style');" +
      "tapeFix.textContent='" +
      ".torn-mid{position:relative!important;left:50%!important;width:100vw!important;max-width:none!important;margin:-6px 0 -6px -50vw!important;transform:none!important;height:40px!important;overflow:visible!important;background:transparent!important;display:block!important;}" +
      ".marker-line{display:block!important;width:100vw!important;height:40px!important;overflow:visible!important;}" +
      ".paper-tape{display:none!important;}" +
      "@media (max-width:560px){.torn-mid,.marker-line{height:34px!important;}}" +
      "';document.head.appendChild(tapeFix);";
    if (code.indexOf(hook) === -1) throw new Error('style hook missing');
    code = code.replace(hook, extra);

    // ===== Modal close animation patches =====
    // 1. Overlay: fade + delayed visibility so close transform can play
    var oldOv = ".iphone-modal-overlay{position:fixed!important;inset:0!important;z-index:9999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:transparent!important;opacity:1!important;visibility:hidden!important;pointer-events:none!important;}";
    var newOv = ".iphone-modal-overlay{position:fixed!important;inset:0!important;z-index:9999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:transparent!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:opacity .38s ease,visibility 0s linear .38s!important;}";
    if (code.indexOf(oldOv) === -1) throw new Error('overlay css missing');
    code = code.replace(oldOv, newOv);

    var oldOpen = ".iphone-modal-overlay.open{visibility:visible!important;pointer-events:auto!important;}";
    var newOpen = ".iphone-modal-overlay.open{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transition:opacity .38s ease,visibility 0s!important;}";
    if (code.indexOf(oldOpen) === -1) throw new Error('overlay.open css missing');
    code = code.replace(oldOpen, newOpen);

    // 2. Backdrop (::before) also fades
    var oldBefore = ".iphone-modal-overlay::before{content:\\\"\\\"!important;position:absolute!important;inset:0!important;background:rgba(255,255,255,.22)!important;backdrop-filter:blur(28px) saturate(180%)!important;-webkit-backdrop-filter:blur(28px) saturate(180%)!important;}";
    var newBefore = ".iphone-modal-overlay::before{content:\\\"\\\"!important;position:absolute!important;inset:0!important;background:rgba(255,255,255,.22)!important;backdrop-filter:blur(28px) saturate(180%)!important;-webkit-backdrop-filter:blur(28px) saturate(180%)!important;opacity:0!important;transition:opacity .38s ease!important;}.iphone-modal-overlay.open::before{opacity:1!important;}";
    if (code.indexOf(oldBefore) === -1) throw new Error('overlay::before css missing');
    code = code.replace(oldBefore, newBefore);

    // 3. Modal transform: bounce on open, smooth ease-out on close
    var oldModalT = "transform:scale(.88) translateY(24px)!important;transition:transform .45s cubic-bezier(0.34,1.56,0.64,1)!important;";
    var newModalT = "transform:scale(.88) translateY(24px)!important;transition:transform .38s cubic-bezier(0.32,0.72,0,1)!important;";
    if (code.indexOf(oldModalT) === -1) throw new Error('modal transform css missing');
    code = code.replace(oldModalT, newModalT);

    var oldOpenModal = ".iphone-modal-overlay.open .iphone-modal{transform:scale(1) translateY(0)!important;}";
    var newOpenModal = ".iphone-modal-overlay.open .iphone-modal{transform:scale(1) translateY(0)!important;transition:transform .45s cubic-bezier(0.34,1.56,0.64,1)!important;}";
    if (code.indexOf(oldOpenModal) === -1) throw new Error('open modal transform css missing');
    code = code.replace(oldOpenModal, newOpenModal);

    // 4. ovFix currently forces opacity:1 — change it so fade works
    var oldOvFix = "ovFix.textContent = '.iphone-modal-overlay{background:transparent!important;opacity:1!important;}.iphone-modal-overlay::before{content:\\\"\\\"!important;position:absolute!important;inset:0!important;z-index:0!important;background:rgba(255,255,255,.22)!important;backdrop-filter:blur(28px) saturate(180%)!important;-webkit-backdrop-filter:blur(28px) saturate(180%)!important;}.iphone-modal{position:relative!important;z-index:1!important;}';";
    var newOvFix = "ovFix.textContent = '.iphone-modal-overlay{background:transparent!important;}.iphone-modal-overlay::before{content:\\\"\\\"!important;position:absolute!important;inset:0!important;z-index:0!important;background:rgba(255,255,255,.22)!important;backdrop-filter:blur(28px) saturate(180%)!important;-webkit-backdrop-filter:blur(28px) saturate(180%)!important;}.iphone-modal{position:relative!important;z-index:1!important;}';";
    if (code.indexOf(oldOvFix) === -1) throw new Error('ovFix missing');
    code = code.replace(oldOvFix, newOvFix);

    // 5. closeIphoneModal: wait for animation before restoring scroll / body classes
    var oldClose = "function closeIphoneModal() {\n          if (!ov.classList.contains('open')) return;\n          var y = scrollY;\n          ov.classList.remove('open');\n          document.documentElement.classList.remove('iphone-modal-open');\n          document.body.classList.remove('iphone-modal-open');\n          // 同一幀內解除 fixed 並立刻還原捲動，避免先跳頂\n          document.body.style.position = '';\n          document.body.style.top = '';\n          document.body.style.left = '';\n          document.body.style.right = '';\n          document.body.style.width = '';\n          document.body.style.overflow = '';\n          document.documentElement.style.overflow = '';\n          document.documentElement.style.scrollBehavior = 'auto';\n          window.scrollTo(0, y);\n          document.documentElement.scrollTop = y;\n          document.body.scrollTop = y;\n          setTimeout(function () {\n            window.scrollTo(0, y);\n            document.documentElement.style.scrollBehavior = '';\n          }, 0);\n        }";
    var newClose = "function closeIphoneModal() {\n          if (!ov.classList.contains('open') || ov._closing) return;\n          ov._closing = true;\n          var y = scrollY;\n          ov.classList.remove('open');\n          setTimeout(function () {\n            ov._closing = false;\n            document.documentElement.classList.remove('iphone-modal-open');\n            document.body.classList.remove('iphone-modal-open');\n            document.body.style.position = '';\n            document.body.style.top = '';\n            document.body.style.left = '';\n            document.body.style.right = '';\n            document.body.style.width = '';\n            document.body.style.overflow = '';\n            document.documentElement.style.overflow = '';\n            document.documentElement.style.scrollBehavior = 'auto';\n            window.scrollTo(0, y);\n            document.documentElement.scrollTop = y;\n            document.body.scrollTop = y;\n            setTimeout(function () {\n              window.scrollTo(0, y);\n              document.documentElement.style.scrollBehavior = '';\n            }, 0);\n          }, 390);\n        }";
    if (code.indexOf(oldClose) === -1) throw new Error('closeIphoneModal missing');
    code = code.replace(oldClose, newClose);

    // 6. Don't collapse page height (that jumps scroll to 0)
    var oldLock = ".iphone-modal-open{overflow:hidden!important;touch-action:none!important;overscroll-behavior:none!important;height:100%!important;}";
    var newLock = ".iphone-modal-open{overflow:hidden!important;touch-action:none!important;overscroll-behavior:none!important;}";
    if (code.indexOf(oldLock) === -1) throw new Error('lock css missing');
    code = code.replace(oldLock, newLock);

    // 7. Freeze body at the user's current scroll instead of jumping to top
    var oldOpenFn = "function openIphoneModal(e) {\n          if (e) { e.preventDefault(); e.stopPropagation(); }\n          if (ov.classList.contains('open')) return;\n          scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;\n          document.documentElement.classList.add('iphone-modal-open');\n          document.body.classList.add('iphone-modal-open');\n          document.documentElement.style.overflow = 'hidden';\n          document.body.style.overflow = 'hidden';\n          ov.classList.add('open');\n          var x = document.getElementById('iphoneModalClose');\n          if (x && x.focus) try { x.focus({ preventScroll: true }); } catch (err) {}\n        }";
    var newOpenFn = "function openIphoneModal(e) {\n          if (e) { e.preventDefault(); e.stopPropagation(); }\n          if (ov.classList.contains('open') || ov._closing) return;\n          scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;\n          document.documentElement.classList.add('iphone-modal-open');\n          document.body.classList.add('iphone-modal-open');\n          document.documentElement.style.overflow = 'hidden';\n          document.body.style.overflow = 'hidden';\n          ov.classList.add('open');\n          var x = document.getElementById('iphoneModalClose');\n          if (x && x.focus) try { x.focus({ preventScroll: true }); } catch (err) {}\n        }";
    if (code.indexOf(oldOpenFn) === -1) throw new Error('openIphoneModal missing');
    code = code.replace(oldOpenFn, newOpenFn);

    var blurFix=document.createElement('style');
    blurFix.textContent='.iphone-modal-overlay,.iphone-modal-overlay::before{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:auto!important;min-height:100dvh!important;min-height:100svh!important;min-height:-webkit-fill-available!important;}';
    document.head.appendChild(blurFix);

    await (async function () { eval(code); }).call(window);

    (function () {
      function findIpadCard(node) {
        if (!node || !node.querySelectorAll) return null;
        var card = null;
        node.querySelectorAll('.fcard, li').forEach(function (el) {
          var h = el.querySelector('h3');
          if (h && h.textContent.trim() === 'iPad') card = el;
        });
        return card;
      }
      function mark(card) {
        if (!card || card.classList.contains('fcard-ipad')) return;
        card.classList.add('fcard-ipad');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', '查看 iPad 適用機型');
      }
      function ensureModal() {
        var existing = document.getElementById('ipadModal');
        if (existing) return existing;
        var st = document.createElement('style');
        st.textContent = '.fcard-ipad{cursor:pointer!important;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),box-shadow .22s ease!important;}.fcard-ipad:active{transform:scale(0.96)!important;}.fcard-ipad:hover{transform:scale(1.02)!important;}';
        document.head.appendChild(st);
        var ov = document.createElement('div');
        ov.id = 'ipadModal';
        ov.className = 'iphone-modal-overlay';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-labelledby', 'ipadModalTitle');
        ov.innerHTML = [
          '<div class="iphone-modal">',
          '  <button type="button" class="modal-x" id="ipadModalClose" aria-label="關閉">×</button>',
          '  <p class="modal-eyebrow">iPad</p>',
          '  <h3 id="ipadModalTitle">與 iPadOS 26 相容的裝置</h3>',
          '  <p class="modal-desc">MapSky 可在支援並已升級至 iPadOS 26 的 iPad 上使用。大螢幕瀏覽天氣、班次與停班停課。</p>',
          '  <div class="frame"><div class="frame-inner">',
          '    <ul>',
          '      <li>iPad Pro<span>第 4 代與後續機型，M1 與更新的晶片</span></li>',
          '      <li>iPad<span>第 9 代與後續機型，A16</span></li>',
          '      <li>iPad Air<span>第 4 代與後續機型，M2 與更新的晶片</span></li>',
          '      <li>iPad mini<span>第 6 代，A17 Pro 與更新的晶片</span></li>',
          '    </ul>',
          '  </div></div>',
          '</div>'
        ].join('');
        document.body.appendChild(ov);
        var scrollY = 0;
        function closeIpadModal() {
          if (!ov.classList.contains('open') || ov._closing) return;
          ov._closing = true;
          var y = scrollY;
          ov.classList.remove('open');
          setTimeout(function () {
            ov._closing = false;
            document.documentElement.classList.remove('iphone-modal-open');
            document.body.classList.remove('iphone-modal-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, y);
            setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 0);
          }, 390);
        }
        function openFrom(e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          if (ov.classList.contains('open') || ov._closing) return;
          scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          document.documentElement.classList.add('iphone-modal-open');
          document.body.classList.add('iphone-modal-open');
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
          ov.classList.add('open');
          var x = document.getElementById('ipadModalClose');
          if (x && x.focus) try { x.focus({ preventScroll: true }); } catch (err) {}
        }
        ov._openFrom = openFrom;
        ov.addEventListener('click', function (e) { if (e.target === ov) closeIpadModal(); });
        document.getElementById('ipadModalClose').addEventListener('click', closeIpadModal);
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') closeIpadModal();
        });
        return ov;
      }
      function onActivate(e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var card = t.closest('.fcard, li');
        if (!card) return;
        var h = card.querySelector('h3');
        if (!h || h.textContent.trim() !== 'iPad') return;
        mark(card);
        var ov = ensureModal();
        if (ov && ov._openFrom) ov._openFrom(e);
      }
      document.addEventListener('click', onActivate);
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var t = e.target;
        if (!t || !t.closest) return;
        var card = t.closest('.fcard, li');
        if (!card) return;
        var h = card.querySelector('h3');
        if (!h || h.textContent.trim() !== 'iPad') return;
        e.preventDefault();
        mark(card);
        var ov = ensureModal();
        if (ov && ov._openFrom) ov._openFrom(e);
      });
      function scan() {
        var card = findIpadCard(document);
        if (card) mark(card);
      }
      scan();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        scan();
        if (findIpadCard(document) || tries > 120) clearInterval(timer);
      }, 100);
      if (window.MutationObserver) {
        var mo = new MutationObserver(scan);
        mo.observe(document.documentElement, { childList: true, subtree: true });
      }
    })();

    (function () {
      function findMac(node) {
        if (!node || !node.querySelectorAll) return null;
        var card = null;
        node.querySelectorAll('.fcard, li').forEach(function (el) {
          var h = el.querySelector('h3');
          if (h && h.textContent.trim() === 'Mac') card = el;
        });
        return card;
      }
      function mark(card) {
        if (!card || card.classList.contains('fcard-mac')) return;
        card.classList.add('fcard-mac');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', '查看 Mac 適用機型');
      }
      function itemHtml(parts) {
        return '<li><span>' + parts.map(function (t) {
          return t.replace(/&/g,'&').replace(/</g,'<');
        }).join('<br>') + '</span><span class="mac-chev" aria-hidden="true">›</span></li>';
      }
      function ensureModal() {
        var existing = document.getElementById('macModal');
        if (existing) return existing;
        var st = document.createElement('style');
        st.textContent = '.fcard-mac{cursor:pointer!important;transition:transform .22s cubic-bezier(0.34,1.56,0.64,1),box-shadow .22s ease!important;}.fcard-mac:active{transform:scale(0.96)!important;}.fcard-mac:hover{transform:scale(1.02)!important;}';
        document.head.appendChild(st);
        var ov = document.createElement('div');
        ov.id = 'macModal';
        ov.className = 'iphone-modal-overlay';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-labelledby', 'macModalTitle');
        ov.innerHTML = [
          '<div class="iphone-modal">',
          '  <button type="button" class="modal-x" id="macModalClose" aria-label="關閉">×</button>',
          '  <p class="modal-eyebrow">Mac</p>',
          '  <h3 id="macModalTitle">與 macOS 27 相容的裝置</h3>',
          '  <p class="modal-desc">在 Mac 瀏覽器開啟 MapSky，大畫面一次看天氣、班次與停班停課。</p>',
          '  <div class="frame"><div class="frame-inner">',
          '    <ul>',
          '      <li>MacBook Neo<span>2026 年</span></li>',
          '      <li>MacBook Air<span>配備 Apple 晶片，2020 年與後續機型</span></li>',
          '      <li>MacBook Pro<span>配備 Apple 晶片，2020 年與後續機型</span></li>',
          '      <li>MacBook Pro<span>配備 PROLED XDR 顯示器，2026 年</span></li>',
          '      <li>iMac<span>配備 Apple 晶片，2021 年與後續機型</span></li>',
          '      <li>Mac mini<span>配備 Apple 晶片，2020 年與後續機型</span></li>',
          '      <li>Mac Studio<span>2022 年與後續機型</span></li>',
          '      <li>Mac Pro<span>配備 Apple 晶片，2023 年</span></li>',
          '    </ul>',
          '  </div></div>',
          '</div>'
        ].join('');
        document.body.appendChild(ov);
        var scrollY = 0;
        function closeMac() {
          if (!ov.classList.contains('open') || ov._closing) return;
          ov._closing = true;
          var y = scrollY;
          ov.classList.remove('open');
          setTimeout(function () {
            ov._closing = false;
            document.documentElement.classList.remove('iphone-modal-open');
            document.body.classList.remove('iphone-modal-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo(0, y);
            setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 0);
          }, 390);
        }
        function openFrom(e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          if (ov.classList.contains('open') || ov._closing) return;
          scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          document.documentElement.classList.add('iphone-modal-open');
          document.body.classList.add('iphone-modal-open');
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
          ov.classList.add('open');
          var x = document.getElementById('macModalClose');
          if (x && x.focus) try { x.focus({ preventScroll: true }); } catch (err) {}
        }
        ov._openFrom = openFrom;
        ov.addEventListener('click', function (e) { if (e.target === ov) closeMac(); });
        document.getElementById('macModalClose').addEventListener('click', closeMac);
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && ov.classList.contains('open')) closeMac();
        });
        return ov;
      }
      function isMacCard(el) {
        if (!el) return false;
        var h = el.querySelector('h3');
        return !!(h && h.textContent.trim() === 'Mac');
      }
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var card = t.closest('.fcard, li');
        if (!isMacCard(card)) return;
        mark(card);
        var ov = ensureModal();
        if (ov && ov._openFrom) ov._openFrom(e);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var t = e.target;
        if (!t || !t.closest) return;
        var card = t.closest('.fcard, li');
        if (!isMacCard(card)) return;
        e.preventDefault();
        mark(card);
        var ov = ensureModal();
        if (ov && ov._openFrom) ov._openFrom(e);
      });
      function scan() {
        var card = findMac(document);
        if (card) mark(card);
      }
      scan();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        scan();
        if (findMac(document) || tries > 120) clearInterval(timer);
      }, 100);
      if (window.MutationObserver) {
        new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
      }
    })();


  } catch (e) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">載入失敗，請重新整理。<br>' + e + '</p>';
    console.error(e);
  }
})();
