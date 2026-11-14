const {
  loadTickets, saveTickets, loadConfig, cors, verifySession, userKey, isAdmin,
  revokeExpiredTickets, isEventEnded
} = require('./_store');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const session = await verifySession(req);
  const uid = userKey(session);

  function parseBody() {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    return body || {};
  }

  if (req.method === 'GET') {
    if (!uid) return res.status(401).json({ ok: false, reason: 'login_required', tickets: [] });

    // 活動已結束 → 自動收回入場券
    let cleanup = { revoked: 0, eventIds: [] };
    try {
      cleanup = await revokeExpiredTickets();
    } catch (e) {
      console.error('revokeExpiredTickets', e && e.message);
    }

    const all = await loadTickets();
    if (isAdmin(session) && (req.query.all === '1' || req.query.all === 'true')) {
      const flat = [];
      Object.keys(all || {}).forEach((email) => {
        const byEvent = all[email] || {};
        Object.keys(byEvent).forEach((eventId) => {
          flat.push({ email, eventId, ...(byEvent[eventId] || {}) });
        });
      });
      return res.status(200).json({
        ok: true,
        tickets: flat,
        admin: true,
        raw: all,
        autoRevoked: cleanup.revoked,
        endedEvents: cleanup.eventIds
      });
    }
    const mine = all[uid] || {};
    const list = Object.keys(mine).map((eventId) => ({ eventId, ...mine[eventId] }));
    return res.status(200).json({
      ok: true,
      tickets: list,
      email: uid,
      autoRevoked: cleanup.revoked,
      endedEvents: cleanup.eventIds
    });
  }

  if (req.method === 'POST') {
    if (!uid) return res.status(401).json({ ok: false, reason: 'login_required' });
    const body = parseBody();

    // 管理員抽走票券
    if (body.action === 'revoke') {
      if (!isAdmin(session)) return res.status(403).json({ ok: false, reason: 'admin_required' });
      const email = String(body.email || '').trim().toLowerCase();
      const eventId = String(body.eventId || 'qx-exam');
      if (!email) return res.status(400).json({ ok: false, reason: 'email_required' });
      const all = await loadTickets();
      if (!all[email] || !all[email][eventId]) {
        return res.status(404).json({ ok: false, reason: 'not_found' });
      }
      delete all[email][eventId];
      if (Object.keys(all[email]).length === 0) delete all[email];
      const put = await saveTickets(all);
      return res.status(200).json({
        ok: true,
        revoked: true,
        email,
        eventId,
        persisted: !!(put && put.ok),
        reason: put && put.ok ? 'saved' : (put && put.reason) || 'memory_only'
      });
    }

    // 管理員手動觸發「收回所有已結束活動的票」
    if (body.action === 'revoke-expired') {
      if (!isAdmin(session)) return res.status(403).json({ ok: false, reason: 'admin_required' });
      try {
        const cleanup = await revokeExpiredTickets();
        return res.status(200).json({ ok: true, ...cleanup });
      } catch (e) {
        return res.status(500).json({ ok: false, error: String((e && e.message) || e).slice(0, 200) });
      }
    }

    // 一般購票前：先清掉已結束活動的票，並禁止買已結束的活動
    try {
      await revokeExpiredTickets();
    } catch (e) {
      console.error('revokeExpiredTickets before buy', e && e.message);
    }

    const eventId = String(body.eventId || 'qx-exam');
    const sessionId = String(body.sessionId || '');
    const packageId = String(body.packageId || body.package || 'free');

    const config = await loadConfig();
    const ev = (config || []).find((e) => e.id === eventId) || (config || [])[0];
    if (ev && isEventEnded(ev)) {
      return res.status(400).json({ ok: false, reason: 'event_ended', message: '活動已結束，無法再購買入場券' });
    }

    const sess = ((ev && ev.sessions) || []).find((s) => s.id === sessionId) || {};
    const pkg = ((ev && ev.packages) || []).find((p) => p.id === packageId) || { id: packageId, name: packageId, price: 0 };

    const all = await loadTickets();
    if (!all[uid]) all[uid] = {};
    const ticket = {
      eventId,
      sessionId,
      packageId,
      sessionName: sess.name || body.sessionName || sessionId,
      packageName: pkg.name || body.packageName || packageId,
      price: pkg.price != null ? pkg.price : (body.price || 0),
      subjects: sess.subjects || body.subjects || '',
      syllabus: sess.syllabus || body.syllabus || '',
      date: sess.date || body.date || '',
      place: sess.place || body.place || '',
      email: uid,
      name: (session.profile && (session.profile.nickname || session.profile.name)) || '',
      at: new Date().toISOString(),
      bound: true,
      syncedToApp: true,
      orderId: body.orderId || ('QX-' + Date.now())
    };
    all[uid][eventId] = ticket;
    const put = await saveTickets(all);
    return res.status(200).json({
      ok: true,
      ticket,
      persisted: !!(put && put.ok),
      reason: put && put.ok ? 'saved' : (put && put.reason) || 'memory_only'
    });
  }

  if (req.method === 'DELETE') {
    if (!uid) return res.status(401).json({ ok: false, reason: 'login_required' });
    if (!isAdmin(session)) return res.status(403).json({ ok: false, reason: 'admin_required' });
    const body = parseBody();
    const email = String(body.email || req.query.email || '').trim().toLowerCase();
    const eventId = String(body.eventId || req.query.eventId || 'qx-exam');
    if (!email) return res.status(400).json({ ok: false, reason: 'email_required' });
    const all = await loadTickets();
    if (!all[email] || !all[email][eventId]) {
      return res.status(404).json({ ok: false, reason: 'not_found' });
    }
    delete all[email][eventId];
    if (Object.keys(all[email]).length === 0) delete all[email];
    const put = await saveTickets(all);
    return res.status(200).json({
      ok: true,
      revoked: true,
      email,
      eventId,
      persisted: !!(put && put.ok)
    });
  }

  return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
};
