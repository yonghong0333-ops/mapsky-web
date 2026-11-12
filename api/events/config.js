const {
  loadConfig, saveConfig, cors, verifySession, isAdmin
} = require('./_store');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const list = await loadConfig();
    return res.status(200).json({ ok: true, events: list });
  }

  if (req.method === 'POST') {
    const session = await verifySession(req);
    if (!isAdmin(session)) {
      return res.status(403).json({ ok: false, reason: 'admin_required' });
    }
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const events = Array.isArray(body.events) ? body.events : (Array.isArray(body) ? body : null);
    if (!events) return res.status(400).json({ ok: false, reason: 'invalid_body' });

    const hasToken = !!(process.env.GITHUB_TOKEN || process.env.MAPSKY_GH_TOKEN);
    const put = await saveConfig(events);
    return res.status(200).json({
      ok: true,
      persisted: !!(put && put.ok),
      hasToken,
      reason: put && put.ok ? 'saved' : (put && put.reason) || (hasToken ? 'github_write_failed' : 'no_token'),
      status: put && put.status,
      events
    });
  }

  return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
};
