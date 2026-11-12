const {
  loadTickets, saveTickets, loadConfig, cors, verifySession, userKey, isAdmin
} = require('./_store');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const session = await verifySession(req);
  const uid = userKey(session);

  if (req.method === 'GET') {
    if (!uid) return res.status(401).json({ ok: false, reason: 'login_required', tickets: [] });
    const all = await loadTickets();
    const mine = all[uid] || {};
    const list = Object.keys(mine).map((eventId) => ({ eventId, ...mine[eventId] }));
    if (isAdmin(session) && (req.query.all === '1' || req.query.all === 'true')) {
      return res.status(200).json({ ok: true, tickets: all, admin: true });
    }
    return res.status(200).json({ ok: true, tickets: list, email: uid });
  }

  if (req.method === 'POST') {
    if (!uid) return res.status(401).json({ ok: false, reason: 'login_required' });
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const eventId = String(body.eventId || 'qx-exam');
    const sessionId = String(body.sessionId || '');
    const packageId = String(body.packageId || 'basic');
    if (!sessionId) return res.status(400).json({ ok: false, reason: 'session_required' });

    const config = await loadConfig();
    const ev = (config || []).find((e) => e.id === eventId) || (config || [])[0];
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

  return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
};
