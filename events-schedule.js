/* Qx 日程表 + 頭目時刻表（1 天 1 區）*/
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
  var WEEK_FULL = ['日', '一', '二', '三', '四', '五', '六'];
  var lastKey = '';
  var HAS_IMG = {
    BossDemonLord: 1,
    BossLavaDragon2: 1,
    BossLavaDragon3: 1,
    BossCrystalSpider: 1,
    BossDeathKnight: 1,
    BossIceDragon: 1,
    BossCyclops: 1,
    QxEgg: 1
  };
  var BOSS_CDN = 'https://mapskyweb.vercel.app/assets/bosses/';

  function bossName(id) {
    if (!id) return '自動輪替';
    return (BOSS_META[id] && BOSS_META[id].name) || id;
  }

  function bossMeta(id, autoIndex) {
    var bid = id;
    if (!bid || !BOSS_META[bid]) {
      bid = AUTO_BOSSES[(autoIndex || 0) % AUTO_BOSSES.length];
    }
    var meta = BOSS_META[bid] || { name: '頭目', emoji: '👾', color: '#aaa' };
    return { id: bid, meta: meta, isAuto: !id || !BOSS_META[id] };
  }

  function injectStyles() {
    if (document.getElementById('qx-schedule-css')) return;
    var s = document.createElement('style');
    s.id = 'qx-schedule-css';
    s.textContent = [
      '.schedule{background:linear-gradient(165deg,#0a0a12 0%,#1a1030 45%,#2a1848 100%);padding:72px 0;position:relative;overflow:hidden}',
      '.schedule::before{content:"";position:absolute;width:320px;height:320px;left:-80px;bottom:-60px;background:radial-gradient(circle,rgba(191,90,242,.28),transparent 70%);pointer-events:none}',
      '.schedule .eyebrow{color:#e0aaff;font-size:14px}',
      '.schedule h2{color:#fff;font-size:clamp(30px,8vw,40px);margin:0 0 12px}',
      '.schedule .sched-lead{color:rgba(255,255,255,.7);font-size:14px;line-height:1.6;margin:0 0 24px}',
      '.day-block{margin-bottom:24px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);overflow:hidden}',
      '.day-head{display:flex;align-items:center;gap:12px;padding:16px 18px;background:rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.12)}',
      '.day-head .dh-date{font-size:18px;font-weight:750;letter-spacing:-.01em;color:#fff}',
      '.day-head .dh-count{font-size:13px;padding:5px 12px;border-radius:980px;background:rgba(191,90,242,.28);color:#e0aaff;font-weight:600}',
      '.slot-row{display:flex;gap:16px;align-items:center;padding:18px;border-bottom:1px solid rgba(255,255,255,.07)}',
      '.slot-row:last-child{border-bottom:0}',
      '.slot-boss{flex:0 0 96px;width:96px;height:96px;border-radius:20px;display:grid;place-items:center;font-size:32px;overflow:hidden;box-shadow:0 8px 24px -12px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.18);background:#1a1030}',
      '.slot-boss img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}',
      '.slot-body{flex:1;min-width:0}',
      '.slot-name{font-size:17px;font-weight:750;color:#fff;margin:0 0 6px}',
      '.slot-meta{font-size:13px;color:rgba(255,255,255,.65);margin:0 0 4px}',
      '.slot-boss-tag{display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:5px 12px;border-radius:980px;font-size:13px;font-weight:650;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:#fff}',
      '.slot-boss-tag .dot{width:8px;height:8px;border-radius:50%}',
      '.slot-boss-tag.auto{opacity:.85}',
      '.slot-time{flex:0 0 auto;text-align:right;font-size:14px;font-weight:650;color:rgba(255,255,255,.88);font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.subj-schedule{margin-top:40px}',
      '.subj-schedule h3{color:#fff;font-size:22px;margin:0 0 8px}',
      '.subj-schedule .sched-lead{margin-bottom:18px}',
      '.subj-row{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07)}',
      '.subj-row:last-child{border-bottom:0}',
      '.subj-time{flex:0 0 108px;font-size:13px;font-weight:650;color:rgba(255,255,255,.8);font-variant-numeric:tabular-nums}',
      '.subj-info{flex:1;min-width:0}',
      '.subj-name{font-size:15px;font-weight:700;color:#fff}',
      '.subj-boss{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}'
    ].join('');
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function parseTW(s) {
    if (!s) return null;
    var str = String(s).trim().replace(/\//g, '-');
    var m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (!m) {
      var d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }

  function hm(d) {
    if (!d) return '';
    return String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
  }

  function eventKey(ev) {
    try { return JSON.stringify(ev && (ev.bossSchedule || ev.sessions || [])); } catch (e) { return String(Date.now()); }
  }

  function resolveBossForTime(bossSlots, t0, t1) {
    if (!bossSlots || !bossSlots.length || !t0) return null;
    var mid = t0.getTime() + ((t1 && t1.getTime() || t0.getTime()) - t0.getTime()) / 2;
    for (var i = 0; i < bossSlots.length; i++) {
      var b = bossSlots[i];
      if (!b.start) continue;
      var a = b.start.getTime();
      var c = b.end ? b.end.getTime() : a + 3600000;
      if (mid >= a && mid <= c) return b;
    }
    return null;
  }

  function appendBossTag(parent, bossId, autoIndex) {
    var r = bossMeta(bossId, autoIndex);
    var tag = el('div', 'slot-boss-tag' + (r.isAuto && !bossId ? ' auto' : ''));
    var dot = el('span', 'dot');
    dot.style.background = r.meta.color;
    tag.appendChild(dot);
    if (!bossId) {
      tag.appendChild(document.createTextNode('配置頭目：自動輪替 → ' + r.meta.name));
    } else {
      tag.appendChild(document.createTextNode('配置頭目：' + r.meta.name));
    }
    parent.appendChild(tag);
  }

  function appendBossThumb(row, bossId, autoIndex) {
    var r = bossMeta(bossId, autoIndex);
    var bossEl = el('div', 'slot-boss');
    bossEl.style.background = 'linear-gradient(135deg,' + r.meta.color + '55,' + r.meta.color + '22)';
    bossEl.style.borderColor = r.meta.color + '77';
    var imgs = window.MAPSKY_BOSS_IMGS || {};
    var imgId = r.id;
    var src = imgs[imgId] || (BOSS_CDN + imgId + '.webp');
    var im = document.createElement('img');
    im.src = src;
    im.alt = r.meta.name;
    im.loading = 'eager';
    im.decoding = 'async';
    im.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    im.onerror = function () {
      if (im.dataset.tried !== '1') {
        im.dataset.tried = '1';
        im.src = BOSS_CDN + imgId + '.png';
        return;
      }
      bossEl.innerHTML = '';
      bossEl.textContent = r.meta.emoji;
    };
    bossEl.appendChild(im);
    row.appendChild(bossEl);
    return r;
  }

  window.MapSkyRenderSchedule = function (ev, stage) {
    if (!ev || !stage) return;
    injectStyles();

    var key = eventKey(ev);
    var existing = stage.querySelector('section.schedule');
    if (existing && key === lastKey) return;
    if (existing) existing.remove();
    lastKey = key;

    var bossSlots = [];
    var bs = Array.isArray(ev.bossSchedule) ? ev.bossSchedule : [];
    bs.forEach(function (bt, i) {
      var st = parseTW(bt.start);
      if (!st) return;
      bossSlots.push({
        name: bossName(bt.boss),
        start: st,
        end: parseTW(bt.end),
        boss: (bt.boss || '').trim(),
        autoIndex: i
      });
    });
    bossSlots.sort(function (a, b) { return a.start - b.start; });

    var subjSlots = [];
    var ss = Array.isArray(ev.sessions) ? ev.sessions : [];
    ss.forEach(function (s) {
      var list = Array.isArray(s.subjectList) ? s.subjectList : [];
      list.forEach(function (sub, i) {
        var st = parseTW(sub.start);
        if (!st) return;
        subjSlots.push({
          name: sub.name || '科目',
          start: st,
          end: parseTW(sub.end),
          range: sub.range || '',
          boss: (sub.boss || '').trim(),
          autoIndex: i,
          sessionName: s.name || ''
        });
      });
    });
    subjSlots.sort(function (a, b) { return a.start - b.start; });

    if (!bossSlots.length && !subjSlots.length) return;

    var anchor = stage.querySelector('section.sessions') ||
                 stage.querySelector('section.article') ||
                 stage.querySelector('section.perks');
    var sec = el('section', 'schedule');
    var wrap = el('div', 'wrap');

    if (bossSlots.length) {
      wrap.appendChild(el('p', 'eyebrow', 'BOSS SCHEDULE'));
      wrap.appendChild(el('h2', null, '頭目時刻表'));
      wrap.appendChild(el('p', 'sched-lead', '每個時段會出現的頭目如下（後台「頭目時間表」設定）。'));

      var dayMap = {}, dayOrder = [];
      bossSlots.forEach(function (sl) {
        var d0 = sl.start;
        var dkey = d0.getFullYear() + '-' +
          String(d0.getMonth() + 1).padStart(2, '0') + '-' +
          String(d0.getDate()).padStart(2, '0');
        if (!dayMap[dkey]) {
          dayMap[dkey] = { date: d0, items: [] };
          dayOrder.push(dkey);
        }
        dayMap[dkey].items.push(sl);
      });

      dayOrder.forEach(function (dkey) {
        var day = dayMap[dkey];
        var block = el('div', 'day-block');
        var head = el('div', 'day-head');
        var d = day.date;
        head.appendChild(el('div', 'dh-date',
          (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日（' + WEEK_FULL[d.getDay()] + '）'));
        head.appendChild(el('div', 'dh-count', day.items.length + ' 場'));
        block.appendChild(head);

        day.items.forEach(function (sl) {
          var row = el('div', 'slot-row');
          var r = appendBossThumb(row, sl.boss, sl.autoIndex);

          var body = el('div', 'slot-body');
          body.appendChild(el('div', 'slot-name', r.meta.name));
          appendBossTag(body, sl.boss, sl.autoIndex);
          row.appendChild(body);

          var timeBox = el('div', 'slot-time');
          var main = hm(sl.start);
          if (sl.end) main += ' – ' + hm(sl.end);
          timeBox.appendChild(document.createTextNode(main));
          row.appendChild(timeBox);
          block.appendChild(row);
        });
        wrap.appendChild(block);
      });
    }

    if (subjSlots.length) {
      var subWrap = el('div', 'subj-schedule');
      subWrap.appendChild(el('h3', null, '考試科目時間'));
      subWrap.appendChild(el('p', 'sched-lead', '科目時段與重疊的頭目配置如下。'));

      var sDayMap = {}, sDayOrder = [];
      subjSlots.forEach(function (sl) {
        var d0 = sl.start;
        var dkey = d0.getFullYear() + '-' +
          String(d0.getMonth() + 1).padStart(2, '0') + '-' +
          String(d0.getDate()).padStart(2, '0');
        if (!sDayMap[dkey]) {
          sDayMap[dkey] = { date: d0, items: [] };
          sDayOrder.push(dkey);
        }
        sDayMap[dkey].items.push(sl);
      });

      sDayOrder.forEach(function (dkey) {
        var day = sDayMap[dkey];
        var block = el('div', 'day-block');
        var head = el('div', 'day-head');
        var d = day.date;
        head.appendChild(el('div', 'dh-date',
          (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日（' + WEEK_FULL[d.getDay()] + '）'));
        head.appendChild(el('div', 'dh-count', day.items.length + ' 科'));
        block.appendChild(head);

        day.items.forEach(function (sl) {
          var row = el('div', 'subj-row');
          var t = hm(sl.start);
          if (sl.end) t += ' – ' + hm(sl.end);
          row.appendChild(el('div', 'subj-time', t));

          var info = el('div', 'subj-info');
          info.appendChild(el('div', 'subj-name', sl.name));
          if (sl.range) info.appendChild(el('div', 'slot-meta', '範圍：' + sl.range));

          var bossId = sl.boss;
          var matched = null;
          if (!bossId && bossSlots.length) {
            matched = resolveBossForTime(bossSlots, sl.start, sl.end);
            if (matched) bossId = matched.boss;
          }
          if (bossId) {
            info.appendChild(el('div', 'subj-boss', '配置頭目：' + bossName(bossId)));
          } else if (matched && !matched.boss) {
            info.appendChild(el('div', 'subj-boss', '配置頭目：自動輪替'));
          } else {
            info.appendChild(el('div', 'subj-boss', '配置頭目：（此時段未指定）'));
          }
          row.appendChild(info);
          block.appendChild(row);
        });
        subWrap.appendChild(block);
      });
      wrap.appendChild(subWrap);
    }

    sec.appendChild(wrap);
    if (anchor && anchor.parentNode) {
      if (anchor.nextSibling) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      else anchor.parentNode.appendChild(sec);
    } else {
      stage.appendChild(sec);
    }
  };

  function tryRender() {
    var stage = document.getElementById('stage');
    var ev = window.__MAPSKY_EVENT__;
    if (!stage || !ev) return;
    if (!stage.querySelector('section')) return;
    try { window.MapSkyRenderSchedule(ev, stage); } catch (e) {}
  }

  setInterval(tryRender, 400);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryRender);
  } else {
    tryRender();
  }
})();
