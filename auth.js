(function () {
  // OAuth 必須在 mapskyapp 起跳；完成後用 xchg 導回官網，再經代理寫入 session Cookie。
  var AUTH_ORIGIN = "https://mapskyapp.vercel.app";
  var API_PROXY = "/api/auth";
  var API_DIRECT = AUTH_ORIGIN + "/api/auth";
  var WEB_RETURN = "https://mapskyweb.vercel.app/login.html";

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function fetchJSON(url, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      return r
        .json()
        .then(function (j) {
          return { ok: r.ok, status: r.status, body: j };
        })
        .catch(function () {
          return { ok: r.ok, status: r.status, body: null };
        });
    });
  }

  function session() {
    return fetchJSON(API_PROXY + "/session").catch(function () {
      return fetchJSON(API_DIRECT + "/session");
    });
  }

  function logout() {
    return fetchJSON(API_PROXY + "/session?action=logout").catch(function () {
      return fetchJSON(API_DIRECT + "/session?action=logout");
    });
  }

  function providers() {
    return fetchJSON(API_PROXY + "/session?action=providers").catch(function () {
      return fetchJSON(API_DIRECT + "/session?action=providers");
    });
  }

  function sendMagicLink(email) {
    return fetchJSON(API_PROXY + "/login?provider=email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    }).catch(function () {
      return fetchJSON(API_DIRECT + "/login?provider=email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
    });
  }

  function verifyCode(email, code) {
    return fetchJSON(API_PROXY + "/login?provider=email&action=verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, code: code }),
    }).catch(function () {
      return fetchJSON(API_DIRECT + "/login?provider=email&action=verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: code }),
      });
    });
  }

  function oauthUrl(providerId) {
    return (
      AUTH_ORIGIN +
      "/api/auth/login?provider=" +
      encodeURIComponent(providerId) +
      "&return_to=" +
      encodeURIComponent(WEB_RETURN)
    );
  }

  function claimXchg(xchg) {
    return fetchJSON(API_PROXY + "/login?xchg=" + encodeURIComponent(xchg)).then(function (res) {
      var token = res.body && res.body.token;
      if (!token) {
        return fetchJSON(API_DIRECT + "/login?xchg=" + encodeURIComponent(xchg)).then(function (res2) {
          token = res2.body && res2.body.token;
          if (!token) return { ok: false, body: res2.body };
          return setSession(token);
        });
      }
      return setSession(token);
    });
  }

  function setSession(token) {
    return fetchJSON(API_PROXY + "/login?action=set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    }).then(function (res) {
      if (res.body && res.body.ok) return { ok: true, body: res.body };
      return fetchJSON(API_DIRECT + "/login?action=set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });
    });
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
    try {
      var params = new URLSearchParams(window.location.search);
      var xchg = params.get("xchg");
      if (xchg) {
        claimXchg(xchg)
          .then(function () {
            try {
              var u = new URL(window.location.href);
              u.searchParams.delete("xchg");
              window.history.replaceState({}, "", u.pathname + (u.search ? u.search : "") + u.hash);
            } catch (_) {}
            return session();
          })
          .then(function (res) {
            updateNav(res && res.body);
            if (window.MapSkyAuthOnSession) window.MapSkyAuthOnSession(res && res.body);
          })
          .catch(function () {
            session().then(function (res) {
              updateNav(res.body);
            });
          });
        return;
      }
    } catch (_) {}

    session()
      .then(function (res) {
        updateNav(res.body);
        if (window.MapSkyAuthOnSession) window.MapSkyAuthOnSession(res.body);
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
    claimXchg: claimXchg,
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
