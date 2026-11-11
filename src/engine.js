/* SQL runner shared by the page and the verify script.
   The practice database is SQLite (sql.js). The interview is SQL Server, so this layer lets
   common T-SQL run here: TOP, ISNULL, LEN, GETDATE, DATEDIFF, DATEADD, YEAR/MONTH/DAY,
   LEFT/RIGHT, CHARINDEX, CAST(x AS DATE). */
const ENGINE = (() => {
  const TODAY = '2026-11-05 09:00:00';
  let db = null;

  // Apply fn to the parts of the query that are outside single-quoted strings.
  const outsideStrings = (sql, fn) => sql.split(/('(?:''|[^'])*')/).map((part, i) => (i % 2 ? part : fn(part))).join('');
  const stripComments = sql => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

  function translate(sql) {
    let top = null;
    let out = outsideStrings(stripComments(sql), part => part
      .replace(/\bISNULL\s*\(/gi, 'IFNULL(')
      .replace(/\bLEN\s*\(/gi, 'LENGTH(')
      .replace(/\bGETDATE\s*\(\s*\)/gi, `'${TODAY}'`)
      .replace(/\b(DATEDIFF|DATEADD)\s*\(\s*(year|month|week|day|hour|minute|yy|mm|dd|d)\s*,/gi, "$1('$2',")
      .replace(/\bLEFT\s*\(/gi, 'TS_LEFT(')
      .replace(/\bRIGHT\s*\(/gi, 'TS_RIGHT(')
      .replace(/\bCAST\s*\(([^()]+?)\s+AS\s+DATE\s*\)/gi, 'date($1)')
      .replace(/\bSELECT(\s+DISTINCT)?\s+TOP\s*\(?\s*(\d+)\s*\)?\s/i, (m, d, n) => { top = n; return `SELECT${d || ''} `; }));
    if (top !== null) out = out.trim().replace(/;\s*$/, '') + `\nLIMIT ${top}`;
    return out;
  }

  // Things that run here but would fail, or behave differently, on SQL Server.
  function lint(sql) {
    const notes = [];
    const code = stripComments(sql).replace(/'(?:''|[^'])*'/g, "''");
    if (/\bLIMIT\s+\d+/i.test(code)) notes.push('LIMIT is not SQL Server syntax. Write SELECT TOP 5 … instead (it works here too).');
    if (/\|\|/.test(code)) notes.push('|| does not join text in SQL Server. Use CONCAT(a, b) or a + b.');
    if (/\bIFNULL\s*\(/i.test(code)) notes.push('IFNULL is not SQL Server. Use ISNULL(x, 0) or COALESCE(x, 0).');
    if (/\b(julianday|strftime)\s*\(/i.test(code)) notes.push('julianday/strftime are SQLite only. Use DATEDIFF(day, a, b) and DATEADD(day, n, d).');
    if (/"[^"]*"/.test(code)) notes.push('Use single quotes for text. Double quotes mean a column name in SQL Server.');
    if (/==/.test(code)) notes.push('Use a single = for comparison.');
    return notes;
  }

  const day = v => (v == null ? null : new Date(String(v).slice(0, 10) + 'T00:00:00Z'));
  const stamp = v => (v == null ? null : new Date(String(v).length > 10 ? String(v).replace(' ', 'T') + (String(v).length === 16 ? ':00Z' : 'Z') : String(v) + 'T00:00:00Z'));
  const unit = u => ({ yy: 'year', mm: 'month', dd: 'day', d: 'day' }[String(u).toLowerCase()] || String(u).toLowerCase());

  function addFunctions(d) {
    d.create_function('DATEDIFF', (u, a, b) => {
      if (a == null || b == null) return null;
      u = unit(u);
      if (u === 'hour' || u === 'minute') return Math.trunc((stamp(b) - stamp(a)) / (u === 'hour' ? 36e5 : 6e4));
      const x = day(a), y = day(b);
      if (u === 'year') return y.getUTCFullYear() - x.getUTCFullYear();
      if (u === 'month') return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth();
      const days = Math.round((y - x) / 864e5);
      return u === 'week' ? Math.trunc(days / 7) : days;
    });
    d.create_function('DATEADD', (u, n, a) => {
      if (a == null || n == null) return null;
      u = unit(u); const x = day(a);
      if (u === 'year') x.setUTCFullYear(x.getUTCFullYear() + n);
      else if (u === 'month') x.setUTCMonth(x.getUTCMonth() + n);
      else x.setUTCDate(x.getUTCDate() + n * (u === 'week' ? 7 : 1));
      return x.toISOString().slice(0, 10);
    });
    d.create_function('YEAR', a => (a == null ? null : day(a).getUTCFullYear()));
    d.create_function('MONTH', a => (a == null ? null : day(a).getUTCMonth() + 1));
    d.create_function('DAY', a => (a == null ? null : day(a).getUTCDate()));
    d.create_function('TS_LEFT', (s, n) => (s == null ? null : String(s).slice(0, n)));
    d.create_function('TS_RIGHT', (s, n) => (s == null ? null : (n > 0 ? String(s).slice(-n) : '')));
    d.create_function('CHARINDEX', (sub, s) => (s == null || sub == null ? null : String(s).indexOf(String(sub)) + 1));
  }

  function load(SQL, tables) {
    db = new SQL.Database();
    for (const [name, t] of Object.entries(tables)) {
      db.run(`CREATE TABLE ${name} (${t.columns.map((c, i) => `${c} ${t.types[i]}`).join(',')});`);
      const st = db.prepare(`INSERT INTO ${name} VALUES (${t.columns.map(() => '?').join(',')})`);
      for (const row of t.rows) st.run(row);
      st.free();
    }
    addFunctions(db);
    db.run('PRAGMA query_only=ON;');
  }

  function run(sql) {
    if (!db) throw new Error('The SQL engine is still loading.');
    const text = translate(sql);
    const code = text.replace(/'(?:''|[^'])*'/g, "''").trim();
    if (!code) throw new Error('Write a query first.');
    if (!/^(SELECT|WITH)\b/i.test(code)) throw new Error('Start with SELECT (or WITH … SELECT). The practice database is read-only.');
    if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REPLACE\s+INTO|REINDEX|RECURSIVE)\b/i.test(code)) throw new Error('Only read-only SELECT queries run here.');
    if (code.replace(/;\s*$/, '').includes(';')) throw new Error('Run one statement at a time.');
    const st = db.prepare(text);
    try {
      const columns = st.getColumnNames(), values = [];
      while (st.step()) {
        if (values.length >= 2000) throw new Error('More than 2,000 rows came back. A join is probably missing part of its key.');
        values.push(st.get());
      }
      return { columns, values };
    } finally { st.free(); }
  }

  function friendly(msg) {
    if (/no such column/i.test(msg)) return `${msg}. Check the spelling and the table alias. Open Tables to see the column names. (Using a SELECT alias inside WHERE also fails on SQL Server.)`;
    if (/no such table/i.test(msg)) return `${msg}. Open Tables to see the table names.`;
    if (/no such function/i.test(msg)) return `${msg}. That function is not available in this practice database.`;
    if (/syntax error|incomplete input/i.test(msg)) return `${msg}. Check commas, quotes and that each clause is complete.`;
    if (/ambiguous column/i.test(msg)) return `${msg}. Two joined tables share that column name. Prefix it with the alias, for example l.product_id.`;
    return msg;
  }

  function compare(got, want, ordered) {
    if (got.columns.length !== want.columns.length) return { pass: false, message: `Expected ${want.columns.length} columns, got ${got.columns.length}. Return exactly the columns asked for, in that order.` };
    if (got.values.length !== want.values.length) return { pass: false, message: `Expected ${want.values.length} rows, got ${got.values.length}. Check the filters, the join type, NULL handling and duplicate matches.` };
    const norm = r => JSON.stringify(r.map(v => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
    let a = got.values.map(norm), b = want.values.map(norm);
    if (!ordered) { a.sort(); b.sort(); }
    if (a.join('\n') !== b.join('\n')) return { pass: false, message: ordered ? 'Right shape, but the values or the row order differ. Check ORDER BY and the calculations.' : 'Right shape, but the values differ. Check the calculations and which rows are included.' };
    return { pass: true, message: 'Correct.' };
  }

  return { load, run, lint, compare, friendly, translate, TODAY };
})();
if (typeof module !== 'undefined') module.exports = ENGINE;
