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

async function loadConfig() {
  // 1) 永遠先從 raw GitHub 讀（不需 token、不受記憶體快取卡死）
  try {
    const r = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/events-config.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j)) {
        mem.config = j;
        return j;
      }
    }
  } catch {}

  // 2) 有 token 再用 Contents API
  const file = await ghGetFile('data/events-config.json');
  if (file && Array.isArray(file.json)) {
    mem.config = file.json;
    mem.configSha = file.sha;
    return mem.config;
  }

  // 3) 最後才退回記憶體（剛寫入但尚未 push 成功時）
  return mem.config || [];
}

async function saveConfig(list) {
  mem.config = list;
  const existing = await ghGetFile('data/events-config.json');
  const put = await ghPutFile(
    'data/events-config.json',
    JSON.stringify(list, null, 2) + '\n',
    'chore: update events config from admin',
    existing && existing.sha
  );
  return put;
}

async function loadTickets() {
  // tickets 也優先從 GitHub 讀，避免冷啟動丟資料
  try {
    const r = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/tickets.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (r.ok) {
      const j = await r.json();
      if (j && typeof j === 'object') {
        mem.tickets = j;
        return mem.tickets;
      }
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
