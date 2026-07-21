/* ==========================================================================
   IELTS journey — renderer
   Reads window.IELTS_DATA and draws: gap bars, band small-multiples,
   error Pareto, criterion panel, and the attempt log. Everything degrades
   to the static HTML (official scores) if data or JS is unavailable.
   ========================================================================== */

(function () {
  'use strict';
  const data = window.IELTS_DATA;
  if (!data) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const SKILLS = ['listening', 'reading', 'writing', 'speaking'];
  const NICE = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const attempts = [
    { kind: 'official', date: data.official.date, label: data.official.label, bands: data.official.bands },
    ...data.mocks.map((m) => ({ kind: 'mock', ...m }))
  ];
  const latest = attempts[attempts.length - 1];

  /* IELTS overall: mean of four skills, rounded to the nearest half band
     (quarter fractions round up — Math.round(x * 2) / 2 reproduces this). */
  function overall(bands) {
    const mean = SKILLS.reduce((s, k) => s + bands[k], 0) / 4;
    return Math.round(mean * 2) / 2;
  }
  const overallEl = $('#overall-band');
  if (overallEl) overallEl.textContent = overall(data.official.bands).toFixed(1);

  /* ------------------------------ GAP BARS ------------------------------ */
  const gapList = $('#gap-list');
  if (gapList) {
    const MIN = 4, MAX = 9;
    const pct = (band) => ((band - MIN) / (MAX - MIN)) * 100;
    SKILLS.forEach((skill) => {
      const band = latest.bands[skill];
      const target = data.target[skill];
      const met = band >= target;
      const row = document.createElement('div');
      row.className = 'gap-row' + (met ? ' is-met' : '');
      row.innerHTML =
        '<span class="gap-skill">' + NICE[skill] + '</span>' +
        '<span class="gap-track">' +
          '<span class="gap-fill" style="width:' + pct(band).toFixed(1) + '%"></span>' +
          '<span class="gap-target" style="left:' + pct(target).toFixed(1) + '%" title="target ' + target.toFixed(1) + '"></span>' +
        '</span>' +
        '<span class="gap-val">' + band.toFixed(1) +
          (met ? ' ✓' : ' → ' + target.toFixed(1)) + '</span>';
      gapList.appendChild(row);
    });
  }

  /* ------------------------------ SMALL MULTIPLES ------------------------------ */
  const chartsWrap = $('#bandcharts');
  if (chartsWrap) {
    const W = 260, H = 110, padL = 26, padR = 10, padT = 10, padB = 8;
    const y = (band) => padT + ((9 - band) / (9 - 4)) * (H - padT - padB);
    SKILLS.forEach((skill) => {
      const card = document.createElement('div');
      card.className = 'bandchart reveal in-view';
      const title = document.createElement('h3');
      title.textContent = NICE[skill];
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', NICE[skill] + ' band scores over attempts');

      /* grid lines + labels at whole bands */
      for (let b = 5; b <= 9; b += 2) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', padL); line.setAttribute('x2', W - padR);
        line.setAttribute('y1', y(b)); line.setAttribute('y2', y(b));
        line.setAttribute('class', 'bc-grid');
        svg.appendChild(line);
        const lbl = document.createElementNS(SVG_NS, 'text');
        lbl.setAttribute('x', 2); lbl.setAttribute('y', y(b) + 3);
        lbl.setAttribute('class', 'bc-label');
        lbl.textContent = b.toFixed(1);
        svg.appendChild(lbl);
      }

      /* target line */
      const t = document.createElementNS(SVG_NS, 'line');
      t.setAttribute('x1', padL); t.setAttribute('x2', W - padR);
      t.setAttribute('y1', y(data.target[skill])); t.setAttribute('y2', y(data.target[skill]));
      t.setAttribute('class', 'bc-target');
      svg.appendChild(t);

      /* points + path */
      const n = attempts.length;
      const x = (i) => (n === 1 ? padL + 22 : padL + (i * (W - padL - padR - 30)) / (n - 1) + 8);
      if (n > 1) {
        const path = document.createElementNS(SVG_NS, 'polyline');
        path.setAttribute('points', attempts.map((a, i) => x(i) + ',' + y(a.bands[skill])).join(' '));
        path.setAttribute('class', 'bc-path');
        svg.appendChild(path);
      }
      attempts.forEach((a, i) => {
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(a.bands[skill]));
        dot.setAttribute('r', a.kind === 'official' ? 4.5 : 3.5);
        dot.setAttribute('class', a.kind === 'official' ? 'bc-dot bc-dot--official' : 'bc-dot');
        const tip = document.createElementNS(SVG_NS, 'title');
        tip.textContent = (a.kind === 'official' ? 'Official' : a.source || a.date) + ' — ' + a.bands[skill].toFixed(1);
        dot.appendChild(tip);
        svg.appendChild(dot);
      });

      card.appendChild(title);
      card.appendChild(svg);
      const note = document.createElement('p');
      note.className = 'bc-note';
      note.textContent = n === 1
        ? 'Official: ' + data.official.bands[skill].toFixed(1) + ' · dashed line = target ' + data.target[skill].toFixed(1)
        : 'Latest: ' + latest.bands[skill].toFixed(1) + ' · target ' + data.target[skill].toFixed(1);
      card.appendChild(note);
      chartsWrap.appendChild(card);
    });
  }

  /* ------------------------------ ERROR PARETO (mocks only) ------------------------------ */
  const paretoWrap = $('#pareto-block');
  const paretoEmpty = $('#pareto-empty');
  const tally = {};
  data.mocks.forEach((m) => {
    if (!m.errors) return;
    Object.values(m.errors).forEach((cats) => {
      Object.entries(cats).forEach(([cat, n]) => { tally[cat] = (tally[cat] || 0) + n; });
    });
  });
  const cats = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (paretoWrap && cats.length) {
    if (paretoEmpty) paretoEmpty.hidden = true;
    const max = cats[0][1];
    const list = document.createElement('div');
    list.className = 'gap-list';
    cats.forEach(([cat, n]) => {
      const row = document.createElement('div');
      row.className = 'gap-row';
      row.innerHTML =
        '<span class="gap-skill">' + cat + '</span>' +
        '<span class="gap-track"><span class="gap-fill" style="width:' + ((n / max) * 100).toFixed(1) + '%"></span></span>' +
        '<span class="gap-val">' + n + ' lost</span>';
      list.appendChild(row);
    });
    paretoWrap.appendChild(list);
  }

  /* ------------------------------ ATTEMPT LOG (mocks prepend) ------------------------------ */
  const log = $('#ielts-log');
  if (log && data.mocks.length) {
    [...data.mocks].reverse().forEach((m) => {
      const li = document.createElement('li');
      li.className = 'tl-item reveal in-view';
      li.innerHTML =
        '<div class="tl-marker" aria-hidden="true"></div>' +
        '<div class="tl-content">' +
          '<div class="tl-meta"><span class="tl-date">' + m.date + '</span><span class="tl-tag">Mock</span></div>' +
          '<h3>' + (m.source || 'Timed practice test') + '</h3>' +
          '<p>L ' + m.bands.listening.toFixed(1) + ' · R ' + m.bands.reading.toFixed(1) +
          ' · W ' + m.bands.writing.toFixed(1) + ' · S ' + m.bands.speaking.toFixed(1) +
          (m.fixAction ? ' — <em>fix: ' + m.fixAction + '</em>' : '') + '</p>' +
        '</div>';
      log.prepend(li);
    });
  }
})();
