(function(){
  function load(url){return fetch(url).then(function(r){return r.text();});}
  Promise.all([
    load('/assets/qx-cover-b64-a.txt'),
    load('/assets/qx-cover-b64-b.txt')
  ]).then(function(parts){
    window.QX_COVER='data:image/jpeg;base64,'+parts[0]+parts[1];
    document.dispatchEvent(new Event('qx-cover-ready'));
  }).catch(function(){});
})();
