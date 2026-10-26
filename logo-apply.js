document.querySelectorAll("img[data-logo]").forEach(function(img){
  var k=img.getAttribute("data-logo");
  if(window.MAPSKY_LOGO&&window.MAPSKY_LOGO[k]) img.src=window.MAPSKY_LOGO[k];
});
var link=document.querySelector('link[rel="icon"]');
if(link&&window.MAPSKY_LOGO&&window.MAPSKY_LOGO.favicon) link.href=window.MAPSKY_LOGO.favicon;
