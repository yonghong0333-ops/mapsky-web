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

    await (async function () { eval(code); }).call(window);
  } catch (e) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">載入失敗，請重新整理。<br>' + e + '</p>';
    console.error(e);
  }
})();
