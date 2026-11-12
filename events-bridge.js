/* MapSky events bridge: shared config + ticket sync for App */
(function (global) {
  var EV_KEY = 'mapsky_events_config_v1';
  var TICKETS_KEY = 'mapsky_tickets_v1';

  function fetchJSON(url, opts) {
    opts = opts || {};
    opts.credentials = 'include';
    opts.headers = Object.assign({ Accept: 'application/json' }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        return { ok: r.ok, status: r.status, body: j };
      }).catch(function () {
        return { ok: r.ok, status: r.status, body: null };
      });
    });
  }

  function loadConfig() {
    return fetchJSON('/api/events/config').then(function (res) {
      if (res.body && res.body.ok && Array.isArray(res.body.events)) {
        try { localStorage.setItem(EV_KEY, JSON.stringify(res.body.events)); } catch (e) {}
        return res.body.events;
      }
      return null;
    });
  }

  function saveConfig(events) {
    try { localStorage.setItem(EV_KEY, JSON.stringify(events)); } catch (e) {}
    return fetchJSON('/api/events/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: events })
    });
  }

  function claimTicket(ticket) {
    var uid = String((ticket && ticket.email) || '').trim().toLowerCase();
    if (uid) {
      try {
        var all = JSON.parse(localStorage.getItem(TICKETS_KEY) || '{}') || {};
        if (!all[uid]) all[uid] = {};
        all[uid][ticket.eventId || 'qx-exam'] = ticket;
        localStorage.setItem(TICKETS_KEY, JSON.stringify(all));
      } catch (e) {}
    }
    return fetchJSON('/api/events/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
  }

  function myTickets() {
    return fetchJSON('/api/events/tickets');
  }

  global.MapSkyEventsBridge = {
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    claimTicket: claimTicket,
    myTickets: myTickets,
    EV_KEY: EV_KEY,
    TICKETS_KEY: TICKETS_KEY
  };
})(window);
