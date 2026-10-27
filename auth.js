(function () {
  // OAuth 必須在 mapskyapp 網域起跳，Cookie（oauth_state）才會在 callback 帶得回來。
  // 若走官網 /api/auth 代理，Cookie 會寫到 mapskyweb，callback 在 mapskyapp 就會 no-cookie。
  var AUTH_ORIGIN = "https://mapskyapp.vercel.app";
  var API_PROXY = "/api/auth";
  var API_DIRECT = AUTH_ORIGIN + "/api/auth";

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function fetchJSON(url, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        return { ok: r.ok, status: r.status, body: j };
      }).catch(function () {
        return { ok: r.ok, status: r.status, body: null };
      });
    });
  }

  function session() {
    return fetchJSON(API_DIRECT + "/session").catch(function () {
      return fetchJSON(API_PROXY + "/session");
    });
  }

  function logout() {
    return fetchJSON(API_DIRECT + "/session?action=logout").catch(function () {
      return fetchJSON(API_PROXY + "/session?action=logout");
    });
  }

  function providers() {
    return fetchJSON(API_DIRECT + "/session?action=providers").catch(function () {
      return fetchJSON(API_PROXY + "/session?action=providers");
    });
  }

  function sendMagicLink(email) {
    return fetchJSON(API_DIRECT + "/login?provider=email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
      mode: "cors",
    }).catch(function () {
      return fetchJSON(API_PROXY + "/login?provider=email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
    });
  }

  function verifyCode(email, code) {
    return fetchJSON(API_DIRECT + "/login?provider=email&action=verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, code: code }),
      mode: "cors",
    }).catch(function () {
      return fetchJSON(API_PROXY + "/login?provider=email&action=verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: code }),
      });
    });
  }

  function oauthUrl(providerId) {
    return AUTH_ORIGIN + "/api/auth/login?provider=" + encodeURIComponent(providerId);
  }

  function displayName(s) {
    if (!s || !s.loggedIn) return null;
    var p = s.profile || {};
    return p.nickname || p.name || p.email || "已登入";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateNav(s) {
    $all("[data-auth-slot]").forEach(function (el) {
      if (s && s.loggedIn) {
        el.innerHTML =
          '<a class="btn btn-sm btn-ghost" href="login.html" title="帳號">' +
          escapeHtml(displayName(s)) +
          "</a>";
      } else {
        el.innerHTML = '<a class="btn btn-sm btn-primary" href="login.html">登入</a>';
      }
    });
  }

  function bootNav() {
    session()
      .then(function (res) {
        updateNav(res.body);
      })
      .catch(function () {
        updateNav({ loggedIn: false });
      });
  }

  window.MapSkyAuth = {
    AUTH_ORIGIN: AUTH_ORIGIN,
    session: session,
    logout: logout,
    providers: providers,
    sendMagicLink: sendMagicLink,
    verifyCode: verifyCode,
    oauthUrl: oauthUrl,
    displayName: displayName,
    bootNav: bootNav,
    updateNav: updateNav,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNav);
  } else {
    bootNav();
  }
})();
