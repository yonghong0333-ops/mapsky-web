(async function () {
  try {
    // Load last known-good full loader script body from GitHub (pre-tape-edit but complete)
    var res = await fetch(
      'https://cdn.jsdelivr.net/gh/yonghong0333-ops/mapsky-web@1655ffc8a2b5/index.html',
      { cache: 'no-store' }
    );
    var html = await res.text();
    var m = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!m) throw new Error('boot script missing');
    // Patch tape sizes + shadow into the injected CSS strings before running
    var code = m[1]
      .replace(
        'height:120px!important;margin:-4px 0 -10px!important',
        'height:168px!important;margin:-8px 0 -14px!important'
      )
      .replace(
        'height:108px!important;object-fit:cover!important;object-position:center!important;mix-blend-mode:multiply!important;transform:none!important;pointer-events:none!important;',
        'height:152px!important;object-fit:cover!important;object-position:center!important;mix-blend-mode:multiply!important;transform:none!important;pointer-events:none!important;filter:drop-shadow(0 10px 18px rgba(0,0,0,0.28)) drop-shadow(0 3px 6px rgba(0,0,0,0.16))!important;'
      )
      .replace(
        '.torn-mid{height:88px!important;}.paper-tape{width:100vw!important;height:78px!important;',
        '.torn-mid{height:120px!important;}.paper-tape{width:100vw!important;height:108px!important;'
      );
    // Run as async IIFE body
    await (async function () { eval(code); }).call(window);
  } catch (e) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">載入失敗，請重新整理。<br>' + e + '</p>';
    console.error(e);
  }
})();
