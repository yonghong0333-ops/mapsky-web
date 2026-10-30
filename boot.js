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
    var hook = 'document.head.appendChild(full);';
    var extra = hook +
      "var tapeFix=document.createElement('style');" +
      "tapeFix.textContent='" +
      ".torn-mid{position:relative!important;left:50%!important;right:auto!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;transform:none!important;height:58px!important;overflow:visible!important;padding:0!important;}" +
      ".paper-tape{display:block!important;width:110vw!important;max-width:none!important;height:52px!important;margin-left:-5vw!important;object-fit:cover!important;object-position:center 42%!important;mix-blend-mode:multiply!important;filter:drop-shadow(0 5px 8px rgba(0,0,0,.2))!important;}" +
      "@media (max-width:560px){.torn-mid{height:46px!important;}.paper-tape{height:40px!important;width:112vw!important;margin-left:-6vw!important;}}" +
      "';document.head.appendChild(tapeFix);";
    if (code.indexOf(hook) === -1) throw new Error('style hook missing');
    code = code.replace(hook, extra);
    await (async function () { eval(code); }).call(window);
  } catch (e) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">載入失敗，請重新整理。<br>' + e + '</p>';
    console.error(e);
  }
})();
