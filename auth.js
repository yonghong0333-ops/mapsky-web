(function () {
  var API = "/api/auth";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function fetchJSON(url, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Accept": "application/json" }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    });
  }

  function session() {
    return fetchJSON(API + "/session");
  }

  function logout() {
    return fetchJSON(API + "/session?action=logout");
  }

  function providers() {
    return fetchJSON(API + "/session?action=providers");
  }

  function sendMagicLink(email) {
    return fetchJSON(API + "/login?provider=email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });
  }

  function verifyCode(email, code) {
    return fetchJSON(API + "/login?provider=email&action=verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, code: code })
    });
  }

  function oauthUrl(providerId) {
    return API + "/login?provider=" + encodeURIComponent(providerId);
  }

  function displayName(s) {
    if (!s || !s.loggedIn) return null;
    var p = s.profile || {};
    return p.nickname || p.name || p.email || "已登入";
  }

  function updateNav(s) {
    $all("[data-auth-slot]").forEach(function (el) {
      if (s && s.loggedIn) {
        var name = displayName(s);
        el.innerHTML =
          '<a class="btn btn-sm btn-ghost" href="login.html" title="帳號">' +
          escapeHtml(name) +
          '</a>';
      } else {
        el.innerHTML = '<a class="btn btn-sm btn-primary" href="login.html">登入</a>';
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bootNav() {
    session().then(function (res) {
      updateNav(res.body);
    }).catch(function () {
      updateNav({ loggedIn: false });
    });
  }

  window.MapSkyAuth = {
    session: session,
    logout: logout,
    providers: providers,
    sendMagicLink: sendMagicLink,
    verifyCode: verifyCode,
    oauthUrl: oauthUrl,
    displayName: displayName,
    bootNav: bootNav,
    updateNav: updateNav
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNav);
  } else {
    bootNav();
  }
})();
