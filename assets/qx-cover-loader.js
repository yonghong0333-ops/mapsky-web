(function(){
  var urls = ["/assets/qx-c0.txt", "/assets/qx-c1.txt", "/assets/qx-c2.txt", "/assets/qx-c3.txt", "/assets/qx-c4.txt", "/assets/qx-c5.txt", "/assets/qx-c6.txt", "/assets/qx-c7.txt"];
  Promise.all(urls.map(function(u){return fetch(u).then(function(r){return r.text();});})).then(function(ps){
    window.QX_COVER='data:image/jpeg;base64,'+ps.join('');
    document.dispatchEvent(new Event('qx-cover-ready'));
  }).catch(function(){});
})();
