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
  } catch (e) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">載入失敗，請重新整理。<br>' + e + '</p>';
    console.error(e);
  }
})();
