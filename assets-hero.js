(function(){
  var parts = ["hero-p0.txt","hero-p1.txt","hero-p2.txt","hero-p3.txt"];
  Promise.all(parts.map(function(p){ return fetch(p).then(function(r){ return r.text(); }); }))
    .then(function(chunks){
      var b64 = chunks.join("");
      var bin = atob(b64);
      var arr = new Uint8Array(bin.length);
      for (var i=0;i<bin.length;i++) arr[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([arr], {type:"image/jpeg"}));
      window.MAPSKY_ASSETS = window.MAPSKY_ASSETS || {};
      MAPSKY_ASSETS["hero-app"] = url;
      MAPSKY_ASSETS["detail-full"] = url;
      document.querySelectorAll('img[data-asset="hero-app"],img[data-asset="detail-full"]').forEach(function(img){ img.src = url; });
    })
    .catch(function(e){ console.warn("hq hero load failed", e); });
})();
