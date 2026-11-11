(() => {
  'use strict';
  const L = COURSE.lessons, KEY = 'havi-sql-v2';
  let S = { done: {}, quiz: {}, drafts: {}, hints: {}, shown: {}, mockLeft: COURSE.mock.minutes * 60 };
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && saved.done) S = { ...S, ...saved }; } catch (e) { /* storage unavailable: progress lasts for this visit */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  let ready = false, loadError = '', drawer = null, drawerTable = 'order_lines', pad = 'SELECT TOP 10 *\nFROM order_lines;', padOut = null, ticking = null;
  const out = {}; // latest run output per exercise id
  const app = document.getElementById('app');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const WORDS = /\b(SELECT|DISTINCT|TOP|FROM|WHERE|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|AS|ON|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|JOIN|GROUP|BY|HAVING|ORDER|ASC|DESC|UNION|ALL|CASE|WHEN|THEN|ELSE|END|WITH|OVER|PARTITION)\b/g;
  const hl = sql => sql.split(/('(?:''|[^'])*'|--[^\n]*)/).map((p, i) => i % 2 ? `<span class="${p[0] === '-' ? 'cm' : 'st'}">${esc(p)}</span>` : esc(p).replace(WORDS, '<b>$1</b>')).join('');
  const code = sql => `<pre class="code">${hl(sql)}</pre>`;
  const keyP = s => s.key ? `<p class="key">${esc(s.key)}</p>` : '';
  const lineSet = sql => new Set(sql.split('\n').map(x => x.trim()));
  const codeDiff = (sql, other) => { const o = lineSet(other), raw = sql.split('\n'); return `<pre class="code">${hl(sql).split('\n').map((h, i) => o.has(raw[i].trim()) ? h : `<span class="chg">${h}</span>`).join('\n')}</pre>`; };
  const fx = f => `<pre class="code fx">${esc(f)}</pre>`;
  const colName = i => String.fromCharCode(65 + i);
  const tsv = t => [t.columns, ...t.rows].map(r => r.map(v => v ?? '').join('\t')).join('\n');

  function exec(sql) { try { return { result: ENGINE.run(sql) }; } catch (e) { return { error: ENGINE.friendly(e.message) }; } }
  function grid(r, max = 60, marks) {
    if (!r.values.length) return '<div class="empty">0 rows returned</div>';
    return `<div class="tablewrap"><table><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.slice(0, max).map((row, ri) => `<tr${marks && marks[ri] ? ' class="only"' : ''}>${row.map(v => `<td>${v === null ? '<span class="null">NULL</span>' : esc(v).replace(/^ +| +$/g, m => '<span class="sp">' + '·'.repeat(m.length) + '</span>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${r.values.length > max ? `<p class="fine">Showing ${max} of ${r.values.length} rows.</p>` : ''}`;
  }
  function liveDiff(sql, other) {
    if (!ready) return live(sql);
    const a = exec(sql), b = exec(other);
    if (a.error || b.error || a.result.columns.join() !== b.result.columns.join()) return live(sql);
    const theirs = new Set(b.result.values.map(r => JSON.stringify(r))), n = a.result.values.length;
    const marks = a.result.values.map(r => !theirs.has(JSON.stringify(r)));
    return `<div class="rowcount">${n} ${n === 1 ? 'row' : 'rows'}${marks.some(Boolean) && n > 1 ? ' · highlighted rows are only on this side' : ''}</div>${grid(a.result, 60, marks)}`;
  }
  const live = sql => { if (!ready) return `<div class="empty">${loadError ? esc(loadError) : 'Loading the practice database…'}</div>`; const o = exec(sql); return o.error ? `<div class="msg bad">${esc(o.error)}</div>` : `<div class="rowcount">${o.result.values.length} ${o.result.values.length === 1 ? 'row' : 'rows'}</div>${grid(o.result)}`; };
  const tablesIn = text => Object.keys(DATA).filter(t => new RegExp(`\\b${t}\\b`).test(text));
  const chips = text => tablesIn(text).map(t => `<button class="chip" data-act="table" data-v="${t}">${t}</button>`).join('');

  /* ---------- progress ---------- */
  const items = l => l.steps.map((s, i) => s.t === 'try' ? s.id : s.t === 'quiz' ? `${l.id}-q${i}` : null).filter(Boolean);
  const doneIn = l => items(l).filter(id => S.done[id]).length;
  const pct = l => Math.round(100 * doneIn(l) / items(l).length);
  const mockDone = () => COURSE.mock.tasks.filter(t => S.done[t.id]).length;
  const nextLesson = () => L.find(l => pct(l) < 100);

  /* ---------- steps ---------- */
  const kind = { text: 'Explain', run: 'Example', compare: 'Compare', try: 'Practice', quiz: 'Check', sheet: 'Data' };
  function stepHtml(l, s, i) {
    const head = `<div class="kind k-${s.t}"><b>${L.indexOf(l) + 1}.${i + 1}</b>${kind[s.t]}</div>`;
    if (s.t === 'text') return `<section class="step plain" id="s${i}">${head}<h2>${esc(s.h)}</h2>${keyP(s)}${s.html}</section>`;
    if (s.t === 'sheet') { const t = DATA[s.table]; return `<section class="step" id="s${i}">${head}<h2>${esc(s.h)}</h2><div class="tablewrap sheet"><table><thead><tr><th></th>${t.columns.map((c, n) => `<th>${colName(n)}</th>`).join('')}</tr></thead><tbody><tr><th>1</th>${t.columns.map(c => `<td class="hdr">${esc(c)}</td>`).join('')}</tr>${t.rows.map((r, n) => `<tr><th>${n + 2}</th>${r.map(v => `<td>${v === null ? '' : esc(v).replace(/ /g, '<span class="sp">·</span>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="bar"><button class="btn ghost" data-act="copy" data-v="${s.table}">Copy ${esc(s.sheet)} for Excel</button><span class="fine">Paste into cell A1. Dots mark spaces; empty cells are blanks.</span></div></section>`; }
    if (s.t === 'run') return `<section class="step" id="s${i}">${head}<h2>${esc(s.h)}</h2>${keyP(s)}${code(s.sql)}${live(s.sql)}<p class="note">${s.note}</p><button class="link" data-act="pad" data-sql="${esc(s.sql)}">Change it and re-run</button></section>`;
    if (s.t === 'compare') return `<section class="step compare" id="s${i}">${head}<h2>${esc(s.h)}</h2><p>${esc(s.intro)}</p><div class="sides">${['a', 'b'].map(k => `<div class="side side-${k}"><div class="sidelabel"><span>${k.toUpperCase()}</span>${esc(s[k].label)}</div>${s[k].sql ? `${s[k === 'a' ? 'b' : 'a'].sql ? codeDiff(s[k].sql, s[k === 'a' ? 'b' : 'a'].sql) + liveDiff(s[k].sql, s[k === 'a' ? 'b' : 'a'].sql) : code(s[k].sql) + live(s[k].sql)}<button class="link" data-act="pad" data-sql="${esc(s[k].sql)}">Change it and re-run</button>` : `${fx(s[k].formula)}<p class="shows">${esc(s[k].shows)}</p>`}</div>`).join('')}</div><div class="verdict"><div class="vlabel">What changed</div><p>${esc(s.diff)}</p></div><div class="which"><div class="vlabel">Use which</div><ul>${s.use.map(u => `<li>${esc(u)}</li>`).join('')}</ul></div></section>`;
    if (s.t === 'quiz') {
      const id = `${l.id}-q${i}`, pick = S.quiz[id];
      return `<section class="step" id="s${i}">${head}<h2>${esc(s.q)}</h2><div class="opts">${s.options.map((o, n) => `<button class="opt ${pick === n ? (n === s.correct ? 'right' : 'wrong') : ''}" data-act="quiz" data-id="${id}" data-l="${l.id}" data-i="${i}" data-n="${n}">${esc(o)}</button>`).join('')}</div>${pick != null ? `<div class="msg ${pick === s.correct ? 'good' : 'bad'}">${pick === s.correct ? 'Correct. ' : 'Not that one. '}${esc(s.why)}</div>` : ''}</section>`;
    }
    return `<section class="step" id="s${i}">${head}${exercise(s, true)}</section>`;
  }
  function exercise(s, hints) {
    const n = S.hints[s.id] || 0, o = out[s.id], tried = !!o || S.done[s.id];
    if (s.answerSql) return `<div class="ex ${S.done[s.id] ? 'done' : ''}" id="ex-${s.id}"><h2>${S.done[s.id] ? '<span class="tick">✓</span> ' : ''}${esc(s.title)}</h2><p>${esc(s.prompt)}</p><div class="chips"><span class="fine">Data:</span>${s.sheets.map(t => `<button class="chip" data-act="table" data-v="${t}">${t}</button>`).join('')}</div>
<div class="bar"><input class="field" id="ed-${s.id}" data-draft="${s.id}" value="${esc(S.drafts[s.id] ?? '')}" placeholder="Your answer" autocomplete="off" autocapitalize="off" aria-label="Your answer for ${esc(s.title)}"><button class="btn" data-act="answer" data-id="${s.id}">Check</button>${hints ? `<button class="btn ghost" data-act="hint" data-id="${s.id}">${n ? `Next hint (${Math.min(n, s.hints.length)}/${s.hints.length})` : 'Hint'}</button>` : ''}${hints || tried ? `<button class="link" data-act="solution" data-id="${s.id}">${S.shown[s.id] ? 'Hide formula' : 'Show formula'}</button>` : ''}</div>
${hints && n ? `<div class="hint">${s.hints.slice(0, n).map(h => `<p>${esc(h)}</p>`).join('')}</div>` : ''}${S.shown[s.id] ? `<div class="hint">${fx(s.solution)}<p>${esc(s.explain)}</p></div>` : ''}<div class="output">${o ? `<div class="msg ${o.pass ? 'good' : 'bad'}">${o.pass ? 'Correct. ' + esc(s.explain) : 'Not yet. Check which rows your formula includes, and whether a blank was counted as zero.'}</div>` : ''}</div></div>`;
    return `<div class="ex ${S.done[s.id] ? 'done' : ''}" id="ex-${s.id}"><h2>${S.done[s.id] ? '<span class="tick">✓</span> ' : ''}${esc(s.title)}</h2><p>${esc(s.prompt)}</p><div class="chips"><span class="fine">Tables:</span>${chips(s.prompt + ' ' + s.solution)}</div>
<textarea class="editor" id="ed-${s.id}" data-draft="${s.id}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="${Math.max(5, (S.drafts[s.id] ?? s.starter ?? '').split('\n').length + 1)}" aria-label="Your query for ${esc(s.title)}">${esc(S.drafts[s.id] ?? s.starter ?? 'SELECT ')}</textarea>
<div class="bar"><button class="btn" data-act="check" data-id="${s.id}">Run and check</button>${hints ? `<button class="btn ghost" data-act="hint" data-id="${s.id}">${n ? `Next hint (${Math.min(n, s.hints.length)}/${s.hints.length})` : 'Hint'}</button>` : ''}${hints || tried ? `<button class="link" data-act="solution" data-id="${s.id}">${S.shown[s.id] ? 'Hide answer' : 'Show answer'}</button>` : '<span class="fine">Answer unlocks after your first run.</span>'}</div>
${hints && n ? `<div class="hint">${s.hints.slice(0, n).map(h => `<p>${esc(h)}</p>`).join('')}</div>` : ''}${S.shown[s.id] ? `<div class="hint">${code(s.solution)}<p>${esc(s.explain)}</p></div>` : ''}<div class="output">${o ? outHtml(o, s) : ''}</div></div>`;
  }
  function outHtml(o, s) {
    if (o.error) return `<div class="msg bad">${esc(o.error)}</div>`;
    return `${o.check ? `<div class="msg ${o.check.pass ? 'good' : 'bad'}">${esc(o.check.message)}${o.check.pass && s ? ' ' + esc(s.explain) : ''}</div>` : ''}${o.lint.map(n => `<div class="msg warn">SQL Server: ${esc(n)}</div>`).join('')}<div class="rowcount">${o.result.values.length} rows</div>${grid(o.result)}`;
  }
  const findEx = id => L.flatMap(l => l.steps).find(s => s.id === id) || COURSE.mock.tasks.find(t => t.id === id);

  /* ---------- views ---------- */
  function ladder(l) {
    const at = L.indexOf(l);
    return `<div class="ladder" aria-label="Clauses covered so far">${COURSE.ladder.map(c => { const li = L.findIndex(x => x.id === c.l), st = li < at ? 'known' : li === at ? 'new' : 'later'; return `<div class="rung ${st}"><code>${c.k}</code><span>${esc(c.d)}</span><em title="Run order">${c.order}</em></div>`; }).join('')}<p class="fine">Lit rows are clauses you have covered. The number is the order the database runs them in.</p></div>`;
  }
  const coreTable = l => `<div class="tablewrap"><table class="coretable"><thead><tr><th>Term</th><th>What it does</th><th>Why it matters</th></tr></thead><tbody>${l.core.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>`;
  const coreHtml = l => `<section class="core"><h2>The core ${l.core.length}</h2><p class="fine">Read this table first. The rest of the page shows each of these on real data, then has you use it.</p>${coreTable(l)}<div class="tip"><span>Interview tip</span>${esc(l.tip)}</div><div class="goal"><span>By the end</span>${esc(l.outcome)}</div></section>`;
  function lessonView(l) {
    const i = L.indexOf(l), next = L[i + 1];
    return `<article class="lesson"><header class="lhead"><div class="chapter ${l.excel ? 'xl' : ''}"><div class="chapnum">${l.excel ? 'Excel' : 'SQL'} · Chapter ${i + 1} of ${L.length} · about ${l.mins} min</div><h1>${esc(l.title)}</h1><p>${esc(l.builds)}</p><button class="link" data-go="home">← All chapters</button></div>${coreHtml(l)}
<details class="outline"><summary>On this page · ${doneIn(l)} of ${items(l).length} checks done</summary><ol>${l.steps.map((s, n) => `<li><button class="link" data-act="jump" data-v="s${n}"><span class="kind k-${s.t}">${kind[s.t]}</span> ${esc(s.h || s.title || s.q)}</button></li>`).join('')}</ol></details></header>
${l.steps.map((s, n) => stepHtml(l, s, n)).join('')}
<footer class="lfoot">${pct(l) === 100 ? '<div class="msg good">Lesson complete.</div>' : `<p class="fine">${doneIn(l)} of ${items(l).length} checks done on this page. You can move on and come back.</p>`}${next ? `<button class="btn big" data-go="l-${next.id}">Next: ${esc(next.title)} →</button>` : '<button class="btn big" data-go="mock">Go to the mock interview →</button>'}</footer></article>`;
  }
  function homeView() {
    const must = L.filter(l => l.priority === 'Must'), mm = must.reduce((n, l) => n + l.mins, 0), n = nextLesson();
    return `<div class="home"><header class="hero chapter"><p class="eyebrow">HAVI ${esc(COURSE.role)} · technical interview ${esc(COURSE.interview)}</p><h1>SQL and Excel for tracing order data</h1><p class="lead">One path. Each lesson opens with a table of its core terms: what each does and why it matters. Then it shows them side by side on real data and has you write them. Queries are written the SQL Server way, and the Excel lessons tie each formula to the SQL it matches.</p><button class="btn big" data-go="${n ? 'l-' + n.id : 'mock'}">${Object.keys(S.done).length ? 'Continue' : 'Start'}: ${esc(n ? n.title : 'Mock interview')} →</button></header>
<section class="plan"><h2>What the role asks for, and where it is covered</h2><p class="fine">Taken from the HAVI ${esc(COURSE.role)} posting.</p><div class="tablewrap"><table class="coretable"><thead><tr><th>The posting asks for</th><th>Covered in</th></tr></thead><tbody>${COURSE.roleMap.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div></section>
<section class="plan"><h2>If time is short</h2><ol><li><strong>Chapter 4 (joins)</strong> and <strong>chapter 6 (tracing)</strong>: the two the role leans on most.</li><li><strong>Chapter 7 (planning KPIs)</strong>: the vocabulary the interviewers use every day.</li><li><strong>Chapters 8 and 9 (Excel)</strong>.</li><li>For every other chapter, read its core table on the <button class="link" data-go="cheats">cheat sheet</button> and do one exercise.</li><li><strong>Mock interview</strong>, ${COURSE.mock.minutes} minutes, out loud, in the morning.</li></ol></section>
<section><h2>Chapters</h2><div class="list">${L.map((l, i) => `<button class="row ${l.excel ? 'xl ' : ''}${pct(l) === 100 ? 'complete' : n && n.id === l.id ? 'current' : ''}" data-go="l-${l.id}"><span class="num">${pct(l) === 100 ? '✓' : i + 1}</span><span class="rowbody"><strong>${esc(l.title)}</strong><span class="fine">${l.mins} min · ${l.excel ? 'Excel · ' : ''}${l.steps.filter(s => s.t === 'compare').length} comparisons · ${l.steps.filter(s => s.t === 'try').length} exercises · ${doneIn(l)}/${items(l).length} done</span></span><span class="tag ${l.priority === 'Must' ? '' : 'soft'}">${l.priority}</span></button>`).join('')}<button class="row ${mockDone() === COURSE.mock.tasks.length ? 'complete' : ''}" data-go="mock"><span class="num">★</span><span class="rowbody"><strong>Mock interview</strong><span class="fine">${COURSE.mock.minutes} min timed · ${COURSE.mock.tasks.length} tasks (SQL and Excel), no hints · ${mockDone()}/${COURSE.mock.tasks.length} done</span></span><span class="tag">Must</span></button></div></section>
<section class="about"><h2>About the practice data</h2><p>Nine small, made-up tables: an order system (<code>orders</code>, <code>order_lines</code>), the copy a screen reads (<code>screen_orders</code>), master data and planning tables. Errors are planted on purpose so there is something to find. Nothing here is HAVI data.</p><p>The interview database is SQL Server. This page runs a small local database with a SQL Server layer on top, so <code>TOP</code>, <code>ISNULL</code>, <code>LEN</code>, <code>GETDATE</code>, <code>DATEDIFF</code> and <code>DATEADD</code> behave as you will write them tomorrow. If you use syntax SQL Server would reject, the checker tells you.</p><p class="fine">Progress is kept in this browser only.</p><button class="link" data-act="reset">Reset my progress</button></section></div>`;
  }
  const clock = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  function mockView() {
    const m = COURSE.mock;
    return `<article class="lesson"><header class="lhead"><div class="crumb"><button class="link" data-go="home">All lessons</button> · Rehearsal</div><h1>Mock interview</h1><p class="lead">${esc(m.intro)}</p><div class="timerbox"><div class="timer" id="timer">${clock(S.mockLeft)}</div><button class="btn" data-act="timer">${ticking ? 'Pause' : 'Start'}</button><button class="btn ghost" data-act="timer-reset">Reset to ${m.minutes}:00</button></div><h3>Say this as you work</h3><ol class="talk">${m.talk.map(t => `<li>${esc(t)}</li>`).join('')}</ol></header>${m.tasks.map((t, i) => `<section class="step"><div class="kind k-try"><b>${i + 1}</b>Task ${i + 1} of ${m.tasks.length}</div>${exercise(t, false)}</section>`).join('')}<footer class="lfoot"><p>${mockDone()} of ${m.tasks.length} solved. Any task you needed the answer for: clear it and redo it from a blank editor.</p><button class="btn big" data-go="cheats">Review the cheat sheet →</button></footer></article>`;
  }
  function cheatsView() {
    return `<article class="lesson"><header class="lhead"><div class="crumb"><button class="link" data-go="home">All lessons</button> · Reference</div><h1>Cheat sheet</h1><p class="lead">The SQL patterns, the SQL Server differences, the Excel formulas, and every comparison from the lessons on one page.</p></header>
<section class="step"><h2>Run order</h2><p><code>FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</code></p><p>Row conditions go in WHERE. Total conditions go in HAVING. Aliases made in SELECT only work in ORDER BY.</p></section>
<section class="step"><h2>Every core term</h2>${L.map((l, i) => `<h3>${i + 1}. ${esc(l.title)}</h3>${coreTable(l)}`).join('')}</section>
<section class="step"><h2>Nine patterns</h2>${COURSE.cheats.map(([h, sql]) => `<h3>${esc(h)}</h3>${code(sql)}`).join('')}</section>
<section class="step"><h2>SQL Server compared with other databases</h2><div class="tablewrap"><table><thead><tr><th>Task</th><th>SQL Server</th><th>Elsewhere</th></tr></thead><tbody>${COURSE.dialect.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div></section>
<section class="step"><h2>Excel formulas</h2><div class="tablewrap"><table><tbody>${COURSE.excel.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td></tr>`).join('')}</tbody></table></div><p>Excel ignores case when matching, never ignores spaces, and treats a blank as 0 in arithmetic.</p></section>
<section class="step"><h2>This versus that</h2>${L.map(l => l.steps.filter(s => s.t === 'compare').map(s => `<div class="vs"><h3>${esc(s.h)}</h3><p>${esc(s.diff)}</p><ul>${s.use.map(u => `<li>${esc(u)}</li>`).join('')}</ul><button class="link" data-go="l-${l.id}">See it in lesson ${L.indexOf(l) + 1}</button></div>`).join('')).join('')}</section>
<section class="step"><h2>Wrong number on a screen: the five checks</h2><ol><li>Compare source and copy side by side, per key.</li><li>Too high: duplicates (<code>GROUP BY key HAVING COUNT(*) &gt; 1</code>) or join fan-out.</li><li>Too low: INNER JOIN or WHERE dropped rows; look for unmatched or dirty keys.</li><li>Out of date: check the sync timestamp.</li><li>Missing: LEFT JOIN + IS NULL in both directions.</li></ol><p>Report: evidence, cause, impact, next action.</p></section></article>`;
  }
  function drawerHtml() {
    if (!drawer) return '';
    const t = DATA[drawerTable];
    const body = drawer === 'tables'
      ? `<div class="chips">${Object.keys(DATA).map(n => `<button class="chip ${n === drawerTable ? 'on' : ''}" data-act="table" data-v="${n}">${n}</button>`).join('')}</div><p><strong>${drawerTable}</strong> · ${t.rows.length} rows. ${esc(t.grain)}</p>${grid({ columns: t.columns, values: t.rows })}<p class="fine"><strong>How they connect:</strong> order_lines.order_id → orders.order_id · screen_orders.order_id → orders.order_id · order_lines.product_id → products.product_id · orders.location_id → locations.location_id · daily_plan and inventory match on date + location_id + product_id.</p>`
      : `<p class="fine">Free practice. Nothing here is graded.</p><textarea class="editor" id="pad" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="8" aria-label="Scratchpad query">${esc(pad)}</textarea><div class="bar"><button class="btn" data-act="pad-run">Run</button></div><div class="output">${padOut ? outHtml(padOut) : ''}</div>`;
    return `<div class="scrim" data-act="close"></div><aside class="drawer" role="dialog" aria-label="${drawer === 'tables' ? 'Tables' : 'Scratchpad'}"><div class="dhead"><div class="tabs"><button class="${drawer === 'tables' ? 'on' : ''}" data-act="drawer" data-v="tables">Tables</button><button class="${drawer === 'pad' ? 'on' : ''}" data-act="drawer" data-v="pad">Scratchpad</button></div><button class="btn ghost" data-act="close">Close</button></div><div class="dbody">${body}</div></aside>`;
  }

  /* ---------- render and routing ---------- */
  const route = () => (location.hash || '#home').slice(1);
  function render(keepScroll) {
    const y = window.scrollY, r = route(), l = L.find(x => 'l-' + x.id === r);
    const total = L.reduce((n, x) => n + items(x).length, 0) + COURSE.mock.tasks.length, done = L.reduce((n, x) => n + doneIn(x), 0) + mockDone();
    app.innerHTML = `<nav class="top"><button class="brand" data-go="home">HAVI SQL prep</button><div class="meter" title="${done} of ${total} checks done"><span style="width:${Math.round(100 * done / total)}%"></span></div><button class="navbtn ${r === 'mock' ? 'on' : ''}" data-go="mock">Mock</button><button class="navbtn ${r === 'cheats' ? 'on' : ''}" data-go="cheats">Cheat sheet</button></nav><main id="main">${l ? lessonView(l) : r === 'mock' ? mockView() : r === 'cheats' ? cheatsView() : homeView()}</main><div class="dock"><button class="btn" data-act="drawer" data-v="tables">Tables</button><button class="btn" data-act="drawer" data-v="pad">Scratchpad</button></div><div id="drawer">${drawerHtml()}</div>`;
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  }
  const renderDrawer = () => { document.getElementById('drawer').innerHTML = drawerHtml(); };
  function refreshEx(id) { const el = document.getElementById('ex-' + id), s = findEx(id); if (!el) return; const tmp = document.createElement('div'); tmp.innerHTML = exercise(s, !id.startsWith('mock-')); el.replaceWith(tmp.firstElementChild); }

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { drawer = null; const v = go.dataset.go; if ('#' + v === location.hash) render(); else location.hash = v; return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const { act, id, v } = b.dataset;
    if (act === 'table') { drawer = 'tables'; drawerTable = v; renderDrawer(); }
    else if (act === 'drawer') { drawer = v; renderDrawer(); }
    else if (act === 'close') { drawer = null; renderDrawer(); }
    else if (act === 'pad') { pad = b.dataset.sql; padOut = null; drawer = 'pad'; renderDrawer(); }
    else if (act === 'pad-run') { pad = document.getElementById('pad').value; const o = exec(pad); padOut = { ...o, lint: ENGINE.lint(pad) }; renderDrawer(); }
    else if (act === 'jump') { document.getElementById(v)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'quiz') { const l = L.find(x => x.id === b.dataset.l), s = l.steps[+b.dataset.i], n = +b.dataset.n; S.quiz[id] = n; if (n === s.correct) S.done[id] = true; save(); render(true); }
    else if (act === 'hint') { S.hints[id] = Math.min((S.hints[id] || 0) + 1, findEx(id).hints.length); save(); refreshEx(id); }
    else if (act === 'solution') { S.shown[id] = !S.shown[id]; save(); refreshEx(id); }
    else if (act === 'copy') { const done = ok => { b.textContent = ok ? 'Copied. Paste into cell A1' : 'Copy was blocked here. Open Tables and type the rows instead'; }; try { navigator.clipboard.writeText(tsv(DATA[v])).then(() => done(true), () => done(false)); } catch (err) { done(false); } }
    else if (act === 'answer') {
      const s = findEx(id), raw = document.getElementById('ed-' + id).value.trim(); S.drafts[id] = raw;
      const want = ENGINE.run(s.answerSql).values[0][0];
      const pass = typeof want === 'number' ? Math.abs(parseFloat(raw.replace(/[%,\s]/g, '')) - want) <= (s.tol || 0.0001) : raw.toUpperCase() === String(want).toUpperCase();
      if (pass) S.done[id] = true; out[id] = { pass }; save(); refreshEx(id);
    }
    else if (act === 'check') {
      const s = findEx(id), sql = document.getElementById('ed-' + id).value; S.drafts[id] = sql;
      const o = exec(sql); o.lint = ENGINE.lint(sql);
      if (o.result) { o.check = ENGINE.compare(o.result, ENGINE.run(s.solution), s.ordered); if (o.check.pass) S.done[id] = true; }
      out[id] = o; save(); refreshEx(id);
      const m = document.querySelector('.meter span'); if (m) { const total = L.reduce((n, x) => n + items(x).length, 0) + COURSE.mock.tasks.length, d = L.reduce((n, x) => n + doneIn(x), 0) + mockDone(); m.style.width = Math.round(100 * d / total) + '%'; }
    }
    else if (act === 'timer') { if (ticking) { clearInterval(ticking); ticking = null; } else { if (S.mockLeft <= 0) S.mockLeft = COURSE.mock.minutes * 60; ticking = setInterval(() => { S.mockLeft = Math.max(0, S.mockLeft - 1); const t = document.getElementById('timer'); if (t) t.textContent = clock(S.mockLeft); if (S.mockLeft % 15 === 0) save(); if (!S.mockLeft) { clearInterval(ticking); ticking = null; render(true); } }, 1000); } b.textContent = ticking ? 'Pause' : 'Start'; }
    else if (act === 'timer-reset') { clearInterval(ticking); ticking = null; S.mockLeft = COURSE.mock.minutes * 60; save(); render(true); }
    else if (act === 'reset') { if (b.dataset.sure) { S = { done: {}, quiz: {}, drafts: {}, hints: {}, shown: {}, mockLeft: COURSE.mock.minutes * 60 }; for (const k in out) delete out[k]; save(); render(); } else { b.dataset.sure = '1'; b.textContent = 'Tap again to erase all progress'; } }
  });
  document.addEventListener('input', e => { const d = e.target.dataset && e.target.dataset.draft; if (d) { S.drafts[d] = e.target.value; save(); } else if (e.target.id === 'pad') pad = e.target.value; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer) { drawer = null; renderDrawer(); return; }
    const t = e.target; if (!t.classList || !t.classList.contains('editor')) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); (t.id === 'pad' ? document.querySelector('[data-act="pad-run"]') : document.querySelector(`[data-act="check"][data-id="${t.dataset.draft}"]`)).click(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('field')) document.querySelector(`[data-act="answer"][data-id="${e.target.dataset.draft}"]`).click();
  });
  window.addEventListener('hashchange', () => render());

  /* ---------- start the database ---------- */
  function start(SQL) { ENGINE.load(SQL, DATA); ready = true; render(true); }
  function fail(e) { loadError = 'The practice database could not start in this browser (' + e.message + '). The lessons are still readable; reload to try again.'; render(true); }
  function fallback(first) { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-asm.js'; s.onload = () => window.initSqlJs().then(start).catch(fail); s.onerror = () => fail(first); document.head.appendChild(s); }
  render();
  try {
    const bin = Uint8Array.from(atob(window.SQL_WASM), c => c.charCodeAt(0));
    window.initSqlJs({ wasmBinary: bin }).then(start).catch(fallback);
  } catch (e) { fallback(e); }
})();
