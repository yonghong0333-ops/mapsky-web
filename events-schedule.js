/* Qx 日程表 + 頭目（1 天 1 區）— 掛在 events-detail 頁 */
(function () {
  var BOSS_META = {
    BossDemonLord:     { name: '惡魔領主', emoji: '😈', color: '#ff3b30' },
    BossIceDragon:     { name: '冰霜巨龍', emoji: '❄️', color: '#64d2ff' },
    BossLavaDragon2:   { name: '岩漿巨龍', emoji: '🔥', color: '#ff9f0a' },
    BossDeathKnight:   { name: '死亡騎士', emoji: '⚔️', color: '#5e5ce6' },
    BossCyclops:       { name: '獨眼巨人', emoji: '👁️', color: '#bf5af2' },
    BossCrystalSpider: { name: '水晶蜘蛛', emoji: '🕷️', color: '#da8fff' }
  };
  var AUTO_BOSSES = Object.keys(BOSS_META);
  var WEEK_FULL = ['日','一','二','三','四','五','六'];

  function injectStyles() {
    if (document.getElementById('qx-schedule-css')) return;
    var s = document.createElement('style');
    s.id = 'qx-schedule-css';
    s.textContent = [
      '.schedule{background:linear-gradient(165deg,#0a0a12 0%,#1a1030 45%,#2a1848 100%);padding:64px 0;position:relative;overflow:hidden}',
      '.schedule::before{content:"";position:absolute;width:280px;height:280px;left:-80px;bottom:-60px;background:radial-gradient(circle,rgba(191,90,242,.28),transparent 70%);pointer-events:none}',
      '.schedule .eyebrow{color:#e0aaff}',
      '.day-block{margin-bottom:22px;border-radius:22px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);overflow:hidden}',
      '.day-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.1)}',
      '.day-head .dh-date{font-size:17px;font-weight:750;letter-spacing:-.01em}',
      '.day-head .dh-count{font-size:12px;padding:4px 10px;border-radius:980px;background:rgba(191,90,242,.25);color:#e0aaff;font-weight:600}',
      '.slot-row{display:flex;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06)}',
      '.slot-row:last-child{border-bottom:0}',
      '.slot-boss{flex:0 0 52px;width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:22px;background:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.14);overflow:hidden}',
      '.slot-body{flex:1;min-width:0}',
      '.slot-name{font-size:16px;font-weight:700;margin:0 0 3px}',
      '.slot-meta{font-size:13px;color:rgba(255,255,255,.65);line-height:1.45}',
      '.slot-boss-name{font-size:12px;color:#c9a0ff;margin-top:4px;font-weight:600}',
      '.slot-time{flex:0 0 auto;text-align:right;font-size:13px;font-weight:650;color:rgba(255,255,255,.85);white-space:nowrap}'
    ].join('');
    document.head.appendChild(s);
  }

  function parseTW(s) {
    if (!s) return null;
    s = String(s).trim().replace('T', ' ').replace(/Z$/, '');
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  }
  function hm(d) {
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  window.MapSkyRenderSchedule = function (ev, stage) {
    if (!ev || !stage) return;
    injectStyles();
    var ss = Array.isArray(ev.sessions) ? ev.sessions : [];
    var slots = [];
    ss.forEach(function (s) {
      var list = Array.isArray(s.subjectList) ? s.subjectList : [];
      list.forEach(function (sub) {
        var st = parseTW(sub.start);
        if (!st) return;
        slots.push({
          name: sub.name || '科目',
          start: st,
          end: parseTW(sub.end),
          range: sub.range || '',
          boss: (sub.boss || '').trim(),
          autoIndex: slots.length
        });
      });
    });
    if (!slots.length) return;
    slots.sort(function (a, b) { return a.start - b.start; });

    var dayMap = {}, dayOrder = [];
    slots.forEach(function (sl) {
      var key = sl.start.getFullYear() + '-' +
        String(sl.start.getMonth() + 1).padStart(2, '0') + '-' +
        String(sl.start.getDate()).padStart(2, '0');
      if (!dayMap[key]) {
        dayMap[key] = { date: sl.start, items: [] };
        dayOrder.push(key);
      }
      dayMap[key].items.push(sl);
    });

    var anchor = stage.querySelector('section.sessions') ||
                 stage.querySelector('section.article') ||
                 stage.querySelector('section.perks');
    var sec = el('section', 'schedule');
    var wrap = el('div', 'wrap reveal');
    wrap.appendChild(el('p', 'eyebrow', 'SCHEDULE'));
    wrap.appendChild(el('h2', null, '日程表'));

    dayOrder.forEach(function (key) {
      var day = dayMap[key];
      var block = el('div', 'day-block');
      var head = el('div', 'day-head');
      var d = day.date;
      head.appendChild(el('div', 'dh-date',
        (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日（' + WEEK_FULL[d.getDay()] + '）'));
      head.appendChild(el('div', 'dh-count', day.items.length + ' 科'));
      block.appendChild(head);

      day.items.forEach(function (sl) {
        var row = el('div', 'slot-row');
        var bossId = sl.boss;
        if (!bossId || !BOSS_META[bossId]) {
          bossId = AUTO_BOSSES[sl.autoIndex % AUTO_BOSSES.length];
        }
        var meta = BOSS_META[bossId] || { name: '頭目', emoji: '👾', color: '#aaa' };

        var bossEl = el('div', 'slot-boss');
        bossEl.style.background = 'linear-gradient(135deg,' + meta.color + '44,' + meta.color + '22)';
        bossEl.style.borderColor = meta.color + '66';
        bossEl.textContent = meta.emoji;
        row.appendChild(bossEl);

        var body = el('div', 'slot-body');
        body.appendChild(el('div', 'slot-name', sl.name));
        body.appendChild(el('div', 'slot-meta', sl.range ? ('範圍：' + sl.range) : ' '));
        var bn = el('div', 'slot-boss-name');
        bn.textContent = '頭目 · ' + meta.name;
        body.appendChild(bn);
        row.appendChild(body);

        var timeStr = hm(sl.start);
        if (sl.end) timeStr += ' – ' + hm(sl.end);
        row.appendChild(el('div', 'slot-time', timeStr));
        block.appendChild(row);
      });
      wrap.appendChild(block);
    });

    sec.appendChild(wrap);
    if (anchor && anchor.parentNode) {
      if (anchor.nextSibling) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      else anchor.parentNode.appendChild(sec);
    } else {
      stage.appendChild(sec);
    }
  };

  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var stage = document.getElementById('stage');
    if (stage && stage.children.length && window.__MAPSKY_EVENT__) {
      clearInterval(timer);
      try { window.MapSkyRenderSchedule(window.__MAPSKY_EVENT__, stage); } catch (e) {}
    }
    if (tries > 40) clearInterval(timer);
  }, 250);
})();
