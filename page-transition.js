/* MapSky page transitions: slide/fade between pages, cheap on GPU */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = '';
  var nativeVT = !reduce && window.CSS && CSS.supports && CSS.supports('selector(::view-transition)');
  if (reduce) {
    window.MapSkyGo = function (u) { location.href = u; };
    return;
  }
  if (nativeVT) {
    css += '@view-transition{navigation:auto}' +
      '::view-transition-old(root){animation:.26s cubic-bezier(.4,0,.2,1) both mskOut}' +
      '::view-transition-new(root){animation:.34s cubic-bezier(.2,.8,.2,1) both mskIn}' +
      '@keyframes mskOut{to{opacity:0;transform:translateX(-24px)}}' +
      '@keyframes mskIn{from{opacity:0;transform:translateX(40px)}}';
  } else {
    css += 'body{animation:mskIn .38s cubic-bezier(.2,.8,.2,1) both}' +
      'body.msk-leave{animation:mskOut .24s cubic-bezier(.4,0,.2,1) both;pointer-events:none}' +
      '@keyframes mskOut{to{opacity:0;transform:translateX(-24px)}}' +
      '@keyframes mskIn{from{opacity:0;transform:translateX(40px)}}';
  }
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  window.MapSkyGo = function (url) {
    if (nativeVT) { location.href = url; return; }
    document.body.classList.add('msk-leave');
    setTimeout(function () { location.href = url; }, 230);
  };
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('msk-leave');
  });
})();
