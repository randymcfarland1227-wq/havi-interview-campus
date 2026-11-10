importScripts('assets/sql-wasm.js');
let db;
const clean = sql => sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/'(?:''|[^'])*'/g, "''").trim();
function execute(sql) {
  const text = clean(sql);
  if (!/^(SELECT|WITH)\b/i.test(text)) throw new Error('Use a SELECT query or a WITH … SELECT query. The practice database is read-only.');
  if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REPLACE|REINDEX)\b/i.test(text)) throw new Error('This lab supports read-only queries. Try SELECT, JOIN, GROUP BY, or WITH.');
  let count = 0;
  for (const stmt of db.iterateStatements(sql)) { count++; }
  if (count !== 1) throw new Error('Run one statement at a time. A CTE and its final SELECT count as one statement.');
  const statement = db.prepare(sql);
  try {
    const columns = statement.getColumnNames();
    const values = [];
    while(statement.step()) {
      if (values.length >= 5000) throw new Error('More than 5,000 result rows. Check the join keys or narrow the query.');
      values.push(statement.get());
    }
    return {columns,values};
  } finally { statement.free(); }
}
function compare(a,b,ordered) {
  if(a.columns.length !== b.columns.length) return {pass:false,message:`Expected ${b.columns.length} output columns; your query returned ${a.columns.length}. Check the requested column order.`};
  if(a.values.length !== b.values.length) return {pass:false,message:`Expected ${b.values.length} rows; your query returned ${a.values.length}. Check filters, join type, missing values and duplicate matches.`};
  const normalized = r => r.map(v => typeof v==='number' ? Math.round(v*1e6)/1e6 : v);
  let av=a.values.map(normalized),bv=b.values.map(normalized);
  if(!ordered){av.sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));bv.sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));}
  if(JSON.stringify(av)!==JSON.stringify(bv)) return {pass:false,message:ordered?'The shape is right, but values or row order differ. Check the requested ORDER BY and calculations.':'The shape is right, but the values differ. Check calculations and which rows are included.'};
  return {pass:true,message:'Correct result. Explain why the keys, filters and row count are appropriate before moving on.'};
}
self.onmessage=async ({data:m})=>{
  try {
    if(m.type==='init') {
      const SQL=await initSqlJs({locateFile:()=> 'assets/sql-wasm.wasm'});
      db=new SQL.Database();
      for(const [name,t] of Object.entries(m.tables)) {
        db.run(`CREATE TABLE ${name} (${t.columns.map((c,i)=>`${c} ${t.types[i]}`).join(',')});`);
        const st=db.prepare(`INSERT INTO ${name} VALUES (${t.columns.map(()=>'?').join(',')})`);
        for(const row of t.rows) st.run(row);
        st.free();
      }
      db.run('PRAGMA query_only=ON;');
      self.postMessage({id:m.id,ready:true});return;
    }
    const start=performance.now();
    const result=execute(m.sql);
    const check=m.expected?compare(result,execute(m.expected),m.ordered):null;
    self.postMessage({id:m.id,result,check,ms:Math.round(performance.now()-start)});
  }catch(e){self.postMessage({id:m.id,error:e.message});}
};
