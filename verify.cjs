// Runs every query in the course against the practice data. Usage: node verify.cjs [--show]
const assert = require('node:assert/strict');
const path = require('node:path');
const DATA = require('./src/data.js'), COURSE = require('./src/course.js'), ENGINE = require('./src/engine.js');
const show = process.argv.includes('--show');
require('./vendor/sql-wasm.js')({ locateFile: () => path.resolve('vendor/sql-wasm.wasm') }).then(SQL => {
  ENGINE.load(SQL, DATA);
  const n = { examples: 0, comparisons: 0, exercises: 0 };
  const run = (label, sql) => {
    const r = ENGINE.run(sql);
    assert.deepEqual(ENGINE.lint(sql), [], `${label}: uses syntax that is not SQL Server`);
    if (show) console.log(`\n# ${label} (${r.values.length} rows)\n${r.columns.join(' | ')}\n${r.values.map(v => v.join(' | ')).join('\n')}`);
    return r;
  };
  for (const lesson of COURSE.lessons) for (const s of lesson.steps) {
    const label = `${lesson.id} / ${s.h || s.id || 'quiz'}`;
    if (s.t === 'run') { run(label, s.sql); n.examples++; }
    if (s.t === 'compare') {
      const a = run(label + ' [A]', s.a.sql), b = run(label + ' [B]', s.b.sql);
      if (!/same answer/i.test(s.h)) assert.notDeepEqual(a.values, b.values, `${label}: both sides return the same rows`);
      n.comparisons++;
    }
    if (s.t === 'try') { assert(run(label, s.solution).values.length > 0, `${label}: empty answer`); assert(s.hints.length, label); n.exercises++; }
    if (s.t === 'quiz') assert(s.options[s.correct], label);
  }
  for (const t of COURSE.mock.tasks) { assert(run('mock / ' + t.id, t.solution).values.length > 0); n.exercises++; }
  for (const [h, sql] of COURSE.cheats) { run('cheat / ' + h, sql); n.examples++; }
  assert.equal(ENGINE.run('SELECT SUM(forecast_units) FROM daily_plan').values[0][0], 3560);
  assert.equal(ENGINE.run("SELECT DATEDIFF(day,'2026-11-02','2026-11-04'), LEFT('abcd',2), YEAR('2026-11-04')").values[0].join(), '2,ab,2026');
  console.log(JSON.stringify({ ...n, minutes: COURSE.lessons.reduce((m, l) => m + l.mins, 0) + COURSE.mock.minutes }));
}).catch(e => { console.error(e.message); process.exitCode = 1; });
