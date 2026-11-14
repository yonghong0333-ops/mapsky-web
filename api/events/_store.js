// Shared in-memory fallback. Durable writes go to GitHub data/ when GITHUB_TOKEN is set.
const OWNER = process.env.MAPSKY_GH_OWNER || 'yonghong0333-ops';
const REPO = process.env.MAPSKY_GH_REPO || 'mapsky-web';
const BRANCH = process.env.MAPSKY_GH_BRANCH || 'main';

const mem = globalThis.__mapskyEventsMem || (globalThis.__mapskyEventsMem = {
  config: null,
  tickets: {} // email -> { eventId -> ticket }
});

function getToken() {
  const raw = process.env.GITHUB_TOKEN || process.env.MAPSKY_GH_TOKEN || '';
  const t = String(raw).trim();
  return t || null;
}

async function ghHeaders() {
  const token = getToken();
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
  const token = getToken();
  if (!token) return { ok: false, reason: 'no_token' };

  const body = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  let r = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mapsky-web-events',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  let j = await r.json().catch(() => ({}));

  if (r.status === 401) {
    r = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'mapsky-web-events',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    j = await r.json().catch(() => ({}));
  }

  if (!r.ok) {
    const msg = (j && (j.message || j.error)) || ('http_' + r.status);
    return { ok: false, reason: 'github_write_failed', status: r.status, message: String(msg).slice(0, 200) };
  }
  return { ok: true, status: r.status, body: j, reason: 'saved' };
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
  // 1) 有 token：直接打 GitHub Contents API（即時、無 CDN 快取）
  const file = await ghGetFile('data/events-config.json');
  if (file && Array.isArray(file.json)) {
    mem.config = file.json;
    mem.configSha = file.sha;
    return mem.config;
  }

  // 2) 公開 Contents API
  try {
    const meta = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/events-config.json?ref=${BRANCH}&_=${Date.now()}`
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

  // 3) 記憶體（剛儲存成功、尚未冷啟動）
  if (Array.isArray(mem.config) && mem.config.length) {
    return mem.config;
  }

  // 4) CDN / raw 備援（可能有延遲）
  try {
    const j = await fetchJson(
      `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/data/events-config.json?t=${Date.now()}`
    );
    if (Array.isArray(j)) {
      mem.config = j;
      return j;
    }
  } catch {}

  try {
    const j = await fetchJson(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/events-config.json?t=${Date.now()}`
    );
    if (Array.isArray(j)) {
      mem.config = j;
      return j;
    }
  } catch {}

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
  const file = await ghGetFile('data/tickets.json');
  if (file && file.json && typeof file.json === 'object') {
    mem.tickets = file.json;
    mem.ticketsSha = file.sha;
    return mem.tickets;
  }
  try {
    const j = await fetchJson(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/tickets.json?t=${Date.now()}`
    );
    if (j && typeof j === 'object') {
      mem.tickets = j;
      return mem.tickets;
    }
  } catch {}
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

/** 把「yyyy-MM-dd HH:mm:ss」當成台灣時間（UTC+8）轉成 Date */
function parseTwDate(s) {
  if (!s) return null;
  const str = String(s).trim().replace(/\//g, '-');
  // 已有時區標記
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // ISO 無時區：當台灣時間
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!m) {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const y = +m[1], mo = +m[2] - 1, day = +m[3];
  const h = +(m[4] || 0), mi = +(m[5] || 0), se = +(m[6] || 0);
  // 台灣 = UTC+8 → UTC = 本地 - 8h
  return new Date(Date.UTC(y, mo, day, h - 8, mi, se));
}

/**
 * 活動結束時間：
 * 1) 優先 appShowUntil（後台「結束顯示」）
 * 2) 否則取各場次 examEnd 最晚者
 * 3) 再否則取 saleEnd
 */
function eventEndTime(ev) {
  if (!ev) return null;
  const candidates = [];
  if (ev.appShowUntil) candidates.push(parseTwDate(ev.appShowUntil));
  const sessions = Array.isArray(ev.sessions) ? ev.sessions : [];
  for (const s of sessions) {
    if (s && s.examEnd) candidates.push(parseTwDate(s.examEnd));
    if (s && s.end) candidates.push(parseTwDate(s.end));
  }
  if (ev.saleEnd) candidates.push(parseTwDate(ev.saleEnd));
  const valid = candidates.filter((d) => d && !Number.isNaN(d.getTime()));
  if (!valid.length) return null;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}

function isEventEnded(ev, now = new Date()) {
  const end = eventEndTime(ev);
  if (!end) return false;
  return now.getTime() > end.getTime();
}

/**
 * 掃過所有票券：活動已結束就自動刪除（收回入場券）。
 * 在 GET /api/events/tickets、購票前呼叫。
 * @returns {{ revoked: number, eventIds: string[] }}
 */
async function revokeExpiredTickets() {
  const config = await loadConfig();
  const all = await loadTickets();
  const now = new Date();
  const endedIds = new Set();

  for (const ev of config || []) {
    if (ev && ev.id && isEventEnded(ev, now)) {
      endedIds.add(String(ev.id));
    }
  }

  // 沒有設定結束時間的活動不自動收回
  if (!endedIds.size) {
    return { revoked: 0, eventIds: [] };
  }

  let revoked = 0;
  const emails = Object.keys(all || {});
  for (const email of emails) {
    const byEvent = all[email] || {};
    for (const eventId of Object.keys(byEvent)) {
      if (endedIds.has(String(eventId))) {
        delete byEvent[eventId];
        revoked += 1;
      }
    }
    if (Object.keys(byEvent).length === 0) {
      delete all[email];
    } else {
      all[email] = byEvent;
    }
  }

  if (revoked > 0) {
    await saveTickets(all);
  }
  return { revoked, eventIds: Array.from(endedIds) };
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
  cors, verifySession, userKey, isAdmin, mem, getToken,
  parseTwDate, eventEndTime, isEventEnded, revokeExpiredTickets
};
