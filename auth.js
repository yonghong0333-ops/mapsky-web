(function () {
  var AUTH_ORIGIN = "https://mapskyapp.vercel.app";
  var API_PROXY = "/api/auth";
  var WEB_RETURN = "https://mapskyweb.vercel.app/login";

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

  function session() { return fetchJSON(API_PROXY + "/session"); }
  function logout() { return fetchJSON(API_PROXY + "/session?action=logout"); }
  function providers() { return fetchJSON(API_PROXY + "/session?action=providers"); }

  function sendMagicLink(email) {
    return fetchJSON(API_PROXY + "/login?provider=email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });
  }

  function verifyCode(email, code) {
    return fetchJSON(API_PROXY + "/login?provider=email&action=verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, code: code })
    });
  }

  function oauthUrl(providerId) {
    return AUTH_ORIGIN + "/api/auth/login?provider=" + encodeURIComponent(providerId) + "&return_to=" + encodeURIComponent(WEB_RETURN);
  }

  function setSession(token) {
    return fetchJSON(API_PROXY + "/login?action=set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token })
    });
  }

  function claimXchg(xchg) {
    return fetchJSON(API_PROXY + "/login?xchg=" + encodeURIComponent(xchg)).then(function (res) {
      var token = res.body && res.body.token;
      if (!token) return { ok: false, body: res.body };
      return setSession(token);
    });
  }

  function displayName(s) {
    if (!s || !s.loggedIn) return null;
    var p = s.profile || {};
    return p.nickname || p.name || p.email || "\u5df2\u767b\u5165";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/\u0026/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/>/g, "\u0026gt;")
      .replace(/"/g, "\u0026quot;");
  }

  function updateNav(s) {
    $all("[data-auth-slot]").forEach(function (el) {
      if (s && s.loggedIn) {
        el.innerHTML = '<a class="btn btn-sm btn-ghost" href="/login">' + escapeHtml(displayName(s)) + "</a>";
      } else {
        el.innerHTML = '<a class="btn btn-sm btn-primary" href="/login">\u767b\u5165</a>';
      }
    });
  }

  function bootNav() {
    try {
      var params = new URLSearchParams(window.location.search);
      var xchg = params.get("xchg");
      if (xchg) {
        claimXchg(xchg).then(function () {
          try {
            var u = new URL(window.location.href);
            u.searchParams.delete("xchg");
            u.searchParams.delete("login");
            window.history.replaceState({}, "", u.pathname + (u.search || "") + u.hash);
          } catch (e) {}
          return session();
        }).then(function (res) {
          if (!res) return;
          updateNav(res.body);
          if (window.MapSkyAuthOnSession) window.MapSkyAuthOnSession(res.body);
          try {
            var path = (window.location.pathname || "").replace(/\/$/, "") || "/";
            if (res.body && res.body.loggedIn && (path === "/login" || path.endsWith("/login"))) {
              window.location.replace("/");
            }
          } catch (e2) {}
        }).catch(function () {
          session().then(function (res) { updateNav(res.body); });
        });
        return;
      }
    } catch (e) {}
    session().then(function (res) {
      updateNav(res.body);
      if (window.MapSkyAuthOnSession) window.MapSkyAuthOnSession(res.body);
    }).catch(function () {
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
    claimXchg: claimXchg,
    displayName: displayName,
    bootNav: bootNav,
    updateNav: updateNav
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNav);
  else bootNav();

  // Floating pill nav on all pages (idempotent)
  if (!document.querySelector('script[src*="nav-scroll.js"]')) {
    var ns = document.createElement("script");
    ns.src = "nav-scroll.js?v=2";
    ns.defer = true;
    document.head.appendChild(ns);
  }
})();
