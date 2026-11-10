const assert = require('node:assert/strict');
const path = require('node:path');
global.window = {};
require('./dist/curriculum.js');
require('./dist/teaching.js');
const initSqlJs = require('./dist/assets/sql-wasm.js');
initSqlJs({locateFile:()=>path.resolve('dist/assets/sql-wasm.wasm')}).then(SQL=>{
 const db = new SQL.Database();
 for(const [name,t] of Object.entries(window.CAMPUS_DATA)){
  db.run(`CREATE TABLE ${name} (${t.columns.map((c,i)=>`${c} ${t.types[i]}`).join(',')})`);
  const st=db.prepare(`INSERT INTO ${name} VALUES (${t.columns.map(()=>'?').join(',')})`);
  for(const row of t.rows)st.run(row);
  st.free();
 }
 let examples=0,labs=0;
 for(const m of window.CAMPUS_MODULES){
  assert(m.blocks.length>1,`${m.id}: teaching missing`);
  for(const s of m.walkthrough||[]){
   if(!s.sql)continue;
   const result=db.exec(s.sql)[0];
   assert.deepEqual(result.columns,s.columns,`${m.id}: ${s.title} columns`);
   assert.deepEqual(result.values,s.rows,`${m.id}: ${s.title} expected rows`);
   examples++;
  }
  for(const l of m.labs){
   if(l.type)continue;
   const result=db.exec(l.solution)[0];
   assert(result?.values.length>0,`${l.id}: empty reference answer`);
   labs++;
  }
 }
 const sum=db.exec('SELECT SUM(forecast_units) FROM daily_plan')[0].values[0][0];
 assert.equal(sum,3560);
 const wape=db.exec('SELECT ROUND(100.0*SUM(ABS(actual_units-forecast_units))/SUM(actual_units),2) FROM daily_plan WHERE actual_units IS NOT NULL')[0].values[0][0];
 assert.equal(wape,11.54);
 const promoGap=db.exec("SELECT SUM(actual_units-forecast_units) FROM daily_plan WHERE location_id='L01' AND promo=1")[0].values[0][0];
 assert.equal(promoGap,190);
 console.log(JSON.stringify({sqlWalkthroughsVerified:examples,labReferencesVerified:labs,teachingCards:window.CAMPUS_MODULES.reduce((n,m)=>n+m.blocks.length,0),walkthroughSteps:window.CAMPUS_MODULES.reduce((n,m)=>n+(m.walkthrough?.length||0),0),coreMinutes:window.CAMPUS_MODULES.reduce((n,m)=>n+m.fast,0),forecastControl:sum,wape,promoGap}));
 db.close();
}).catch(e=>{console.error(e.message);process.exitCode=1;});
