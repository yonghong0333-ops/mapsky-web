/* Sale window helpers shared by events pages */
(function (global) {
  function parseTW(s) {
    if (!s) return null;
    s = String(s).trim();
    if (!s) return null;
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }
  function isOnSale(ev) {
    if (!ev || ev.enabled === false) return false;
    var now = new Date();
    var start = parseTW(ev.saleStart);
    var end = parseTW(ev.saleEnd);
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }
  function saleStatusLabel(ev) {
    if (!ev || ev.enabled === false) return '已關閉';
    var now = new Date();
    var start = parseTW(ev.saleStart);
    var end = parseTW(ev.saleEnd);
    if (start && now < start) return '尚未開賣';
    if (end && now > end) return '販售結束';
    return '';
  }
  global.MapSkySale = { parseTW: parseTW, isOnSale: isOnSale, saleStatusLabel: saleStatusLabel };
})(window);
