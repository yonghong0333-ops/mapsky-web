// Shared in-memory fallback. Durable writes go to GitHub data/ when GITHUB_TOKEN is set.
const OWNER = process.env.MAPSKY_GH_OWNER || 'yonghong0333-ops';
const REPO = process.env.MAPSKY_GH_REPO || 'mapsky-web';
const BRANCH = process.env.MAPSKY_GH_BRANCH || 'main';

const mem = globalThis.__mapskyEventsMem || (globalThis.__mapskyEventsMem = {
  config: null,
  tickets: {} // email -> { eventId -> ticket }
});

async function ghHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.MAPSKY_GH_TOKEN;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'mapsky-web-events',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function ghGetFile(path) {
  const h = await ghHeaders();
  if (!h) return null;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const r = await fetch(url, { headers: h });
  if (!r.ok) return null;
  const j = await r.json();
  const text = Buffer.from(j.content || '', 'base64').toString('utf8');
  return { sha: j.sha, text, json: safeParse(text) };
}

async function ghPutFile(path, content, message, sha) {
  const h = await ghHeaders();
  if (!h) return { ok: false, reason: 'no_token' };
  const body = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const r = await fetch(url, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body: j };
}

function safeParse(t) {
  try { return JSON.parse(t); } catch { return null; }
}

async function fetchJson(url) {
  const r = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

async function loadConfig() {
  const bust = Date.now();
  // 1) jsDelivr（比 raw.githubusercontent CDN 更新快）
  try {
    const j = await fetchJson(
      `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/data/events-config.json?t=${bust}`
    );
    if (Array.isArray(j)) {
      mem.config = j;
      return j;
    }
  } catch {}

  // 2) GitHub Contents API（公開 repo 不需 token）
  try {
    const meta = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/events-config.json?ref=${BRANCH}&t=${bust}`
    );
    if (meta && meta.content) {
      const text = Buffer.from(meta.content, 'base64').toString('utf8');
      const j = safeParse(text);
      if (Array.isArray(j)) {
        mem.config = j;
        mem.configSha = meta.sha;
        return j;
      }
    }
  } catch {}

  // 3) raw GitHub
  try {
    const j = await fetchJson(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/events-config.json?t=${bust}`
    );
    if (Array.isArray(j)) {
      mem.config = j;
      return j;
    }
  } catch {}

  // 4) token Contents API
  const file = await ghGetFile('data/events-config.json');
  if (file && Array.isArray(file.json)) {
    mem.config = file.json;
    mem.configSha = file.sha;
    return mem.config;
  }

  return mem.config || [];
}

async function saveConfig(list) {
  mem.config = list;
  const existing = await ghGetFile('data/events-config.json');
  // 無 token 時也先試公開 Contents（會失敗）→ 回傳 no_token 讓 App 提示
  const put = await ghPutFile(
    'data/events-config.json',
    JSON.stringify(list, null, 2) + '\n',
    'chore: update events config from admin',
    existing && existing.sha
  );
  return put;
}

async function loadTickets() {
  const bust = Date.now();
  try {
    const j = await fetchJson(
      `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/data/tickets.json?t=${bust}`
    );
    if (j && typeof j === 'object' && !Array.isArray(j)) {
      mem.tickets = j;
      return mem.tickets;
    }
  } catch {}
  try {
    const j = await fetchJson(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/tickets.json?t=${bust}`
    );
    if (j && typeof j === 'object') {
      mem.tickets = j;
      return mem.tickets;
    }
  } catch {}
  const file = await ghGetFile('data/tickets.json');
  if (file && file.json && typeof file.json === 'object') {
    mem.tickets = file.json;
    mem.ticketsSha = file.sha;
  }
  return mem.tickets;
}

async function saveTickets(tickets) {
  mem.tickets = tickets;
  const existing = await ghGetFile('data/tickets.json');
  const put = await ghPutFile(
    'data/tickets.json',
    JSON.stringify(tickets, null, 2) + '\n',
    'chore: update event tickets',
    existing && existing.sha
  );
  return put;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

async function verifySession(req) {
  const cookie = req.headers.cookie || '';
  const auth = req.headers.authorization || '';
  const headers = { Accept: 'application/json' };
  if (cookie) headers.Cookie = cookie;
  if (auth) headers.Authorization = auth;
  try {
    const r = await fetch('https://mapskyapp.vercel.app/api/auth/session', { headers });
    const j = await r.json().catch(() => ({}));
    if (j && j.loggedIn) return j;
  } catch {}
  return null;
}

function userKey(session) {
  if (!session || !session.loggedIn) return null;
  const p = session.profile || {};
  return String(p.email || p.id || '').trim().toLowerCase() || null;
}

function isAdmin(session) {
  const emails = ['mapskyapp@gmail.com', 'yonghong0333@gmail.com'];
  if (!session || !session.loggedIn) return false;
  const p = session.profile || {};
  const email = String(p.email || '').trim().toLowerCase();
  if (email && emails.includes(email)) return true;
  if (p.role === 'admin' || p.isAdmin === true) return true;
  return false;
}

module.exports = {
  loadConfig, saveConfig, loadTickets, saveTickets,
  cors, verifySession, userKey, isAdmin, mem
};
